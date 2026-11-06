// Page chrome: the entrance card hand-off and config-driven links.

/**
 * The entrance card is in the HTML so it paints with the first byte. This decides when it
 * lifts: once the page beneath is ready, but never sooner than `minMs` after navigation,
 * so a fast cache hit doesn't turn it into a flicker.
 */
export function initLoader({ minMs, holdMs, artCapMs, fadeMs }) {
  const root = document.documentElement;
  const loader = document.getElementById('loader');
  const art = loader?.querySelector('img');
  root.style.setProperty('--loader-fade', `${fadeMs}ms`);

  let revealed = false;
  let artShownAt = 0;

  // Resolves when the card's artwork is on screen, or after `artCapMs` on a very slow line.
  const artReady = new Promise((resolve) => {
    if (!art) return resolve();
    const done = () => { if (!artShownAt && art.naturalWidth) artShownAt = performance.now(); resolve(); };
    if (art.complete) return done();
    art.addEventListener('load', done, { once: true });
    art.addEventListener('error', () => resolve(), { once: true });
    setTimeout(resolve, artCapMs);
  });

  function reveal() {
    if (revealed) return;
    revealed = true;
    const now = performance.now();
    // Never lift before `minMs` after navigation, and never before the artwork has been
    // visible for `holdMs`, so a late-arriving card is seen rather than flashed.
    const wait = Math.max(0, minMs - now, artShownAt ? holdMs - (now - artShownAt) : 0);
    setTimeout(() => {
      root.classList.add('is-ready');
      // Drop it from layout once the fade has finished so it costs nothing afterwards.
      setTimeout(() => { if (loader) loader.hidden = true; }, fadeMs * 1.5);
    }, wait);
  }

  return { reveal, artReady };
}

/**
 * The small "loading" thread: shown only when the coarse pass (enough frames to scrub the
 * whole vase) is slower than `delayMs`, so fast visits never see it. Its stitches fill in
 * as coarse frames arrive.
 */
export function initFetchIndicator(delayMs) {
  const el = document.getElementById('fetching');
  const fill = document.getElementById('fetching-fill');
  let done = false;

  const timer = setTimeout(() => { if (!done && el) el.hidden = false; }, delayMs);

  function progress(loaded, total) {
    if (fill) fill.setAttribute('width', String((loaded / total) * 100));
    if (loaded < total) return;
    done = true;
    clearTimeout(timer);
    if (el && !el.hidden) {
      el.classList.add('is-done');
      setTimeout(() => { el.hidden = true; }, 700);
    }
  }

  return { progress };
}

export function initLinks(links) {
  const portfolio = document.getElementById('portfolio-link');
  if (portfolio) portfolio.href = links.portfolio;
}

/** Resolves when the web fonts are ready, or after `capMs`, whichever comes first. */
export function fontsReady(capMs = 1500) {
  const fonts = document.fonts ? document.fonts.ready : Promise.resolve();
  return Promise.race([fonts, new Promise((r) => setTimeout(r, capMs))]);
}
