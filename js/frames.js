// Frame loading: one requested frame first, then a coarse pass (every Nth frame) so the
// whole range scrubs early, then a fill pass that always fetches the gap nearest to where
// the visitor is looking. Frames are kept as compressed <img> elements; the browser decodes
// on draw and may discard decoded pixels under memory pressure, so 159 full-size bitmaps
// are never pinned in memory.

const TUNING = {
  concurrency: 6,      // parallel requests; matches the per-host limit of HTTP/1.1 browsers
  retries: 1,          // a failed frame is retried once, later, then skipped for good
  retryDelayMs: 2500,
  warmAhead: 6,        // frames decoded ahead of the scroll direction, so drawing never stalls on a decode
  warmBehind: 2,
};

const IDLE = 0, LOADING = 1, READY = 2, FAILED = 3;

/** Every Nth frame on slow or data-saving connections, otherwise all of them. */
export function pickStep({ saveDataStep }) {
  const c = navigator.connection;
  const slow = !!c && (c.saveData || /(^|-)2g$/.test(c.effectiveType || ''));
  return slow ? saveDataStep : 1;
}

export function createFrameStore({ count, path, coarseStep, step = 1, onReady, onCoarseProgress }) {
  // 1-based to match file names.
  const images = new Array(count + 1).fill(null);
  const state = new Uint8Array(count + 1);
  const tries = new Uint8Array(count + 1);

  const isUsable = (n) => n === count || (n - 1) % step === 0;

  // The coarse step must land on usable frames, so round it up to a multiple of `step`.
  const cStep = Math.max(step, Math.ceil(coarseStep / step) * step);
  const coarse = new Set();
  for (let n = 1; n <= count; n += cStep) coarse.add(n);
  coarse.add(count);
  const coarseTotal = coarse.size;

  let focus = 1;
  let active = 0;
  let started = false;
  let firstDone = false;
  // Closed until release(): on a slow line, the coarse pass would otherwise starve the
  // entrance card's own image of bandwidth.
  let open = false;

  // Nearest frame to `focus` that passes `test`, searching outward in both directions.
  function nearestWhere(test) {
    for (let d = 0; d < count; d++) {
      const a = focus - d;
      const b = focus + d;
      if (a >= 1 && test(a)) return a;
      if (d && b <= count && test(b)) return b;
    }
    return 0;
  }

  const wanted = (n) => isUsable(n) && state[n] === IDLE;

  function pump() {
    // Until the first frame is in, give it the whole connection; after that, wait for release().
    const limit = !firstDone ? 1 : open ? TUNING.concurrency : 0;
    while (active < limit) {
      let n = coarse.size ? nearestWhere((k) => coarse.has(k) && state[k] === IDLE) : 0;
      if (!n) n = nearestWhere(wanted);
      if (!n) return;
      load(n);
    }
  }

  function load(n) {
    state[n] = LOADING;
    active++;
    const img = new Image();
    img.decoding = 'async';
    img.onload = () => {
      images[n] = img;
      state[n] = READY;
      active--;
      firstDone = true;
      if (coarse.delete(n)) onCoarseProgress?.(coarseTotal - coarse.size, coarseTotal);
      onReady?.(n, img);
      pump();
    };
    img.onerror = () => {
      active--;
      if (tries[n] < TUNING.retries) {
        tries[n]++;
        state[n] = LOADING; // hold the slot so the scheduler doesn't immediately re-pick it
        setTimeout(() => { state[n] = IDLE; pump(); }, TUNING.retryDelayMs);
      } else {
        state[n] = FAILED;
        // A permanently missing frame still counts toward the coarse pass finishing.
        if (coarse.delete(n)) onCoarseProgress?.(coarseTotal - coarse.size, coarseTotal);
      }
      firstDone = true;
      pump();
    };
    img.src = path(n);
  }

  return {
    step,
    coarseTotal,

    /** Begin loading, with `first` (usually frame 1) fetched alone before anything else. */
    start(first = 1) {
      if (started) return;
      started = true;
      focus = first;
      const n = nearestWhere(isUsable);
      load(n);
    },

    /** Let the coarse and fill passes begin. */
    release() {
      open = true;
      if (started) pump();
    },

    /** Re-centre the fill pass on the frame the visitor is heading to. */
    setFocus(n) {
      focus = Math.min(count, Math.max(1, n));
      if (started) pump();
    },

    /** The loaded frame closest to `n` (preferring `n` itself), or null if none has loaded. */
    nearest(n) {
      n = Math.min(count, Math.max(1, n));
      if (state[n] === READY) return images[n];
      for (let d = 1; d < count; d++) {
        if (n - d >= 1 && state[n - d] === READY) return images[n - d];
        if (n + d <= count && state[n + d] === READY) return images[n + d];
      }
      return null;
    },

    has: (n) => state[n] === READY,

    /**
     * Ask the browser to decode the frames just ahead of the scroll direction, off the main
     * thread, so the next draws find them ready.
     */
    warm(n, dir) {
      const ahead = dir >= 0 ? 1 : -1;
      for (let i = -TUNING.warmBehind; i <= TUNING.warmAhead; i++) {
        const k = n + i * ahead;
        if (k >= 1 && k <= count && state[k] === READY) images[k].decode().catch(() => {});
      }
    },

    loadedCount() {
      let c = 0;
      for (let n = 1; n <= count; n++) if (state[n] === READY) c++;
      return c;
    },
  };
}

/**
 * Loads one image outside the store and resolves once decoded. Rejects if it fails.
 */
export function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.decoding = 'async';
    img.onload = () => {
      // decode() can reject for reasons unrelated to the file; the image is still usable then.
      (img.decode ? img.decode() : Promise.resolve()).catch(() => {}).then(() => resolve(img));
    };
    img.onerror = () => reject(new Error(`Frame failed to load: ${url}`));
    img.src = url;
  });
}
