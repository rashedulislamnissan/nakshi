// Boot and scrub loop: scroll position picks a target frame, the shown frame eases toward
// it, and the loop sleeps whenever nothing is moving.

import { CONFIG } from '../config.js';
import { createStage } from './canvas.js';
import { createFrameStore, pickStep } from './frames.js';
import { initLoader, initLinks, initFetchIndicator, fontsReady } from './ui.js';

const { frames: F, scroll: S } = CONFIG;

const scroller = document.getElementById('scroller');
const status = document.getElementById('status');

scroller.style.height = `${S.heightVh}vh`;
initLinks(CONFIG.links);

const stage = createStage(document.getElementById('stage-canvas'), CONFIG.canvas);
const loader = initLoader(CONFIG.loader);
const fetching = initFetchIndicator(CONFIG.loader.indicatorDelayMs);

// ---------- Scroll geometry ----------

let top = 0;
let range = 1;

function measure() {
  top = scroller.getBoundingClientRect().top + window.scrollY;
  range = Math.max(1, scroller.offsetHeight - window.innerHeight);
}

/** Fractional frame number (1..count) for the current scroll position. */
function targetFrame() {
  const p = Math.min(1, Math.max(0, (window.scrollY - top) / range));
  return 1 + p * (F.count - 1);
}

// ---------- Frames ----------

let firstResolve;
const firstFrame = new Promise((r) => { firstResolve = r; });

const store = createFrameStore({
  ...F,
  step: pickStep(F),
  onReady(n, img) {
    if (firstResolve) {
      // Decode before the first paint so the entrance card lifts onto a finished frame.
      // Take the resolver now: other frames can land while this decode is in flight.
      const resolve = firstResolve;
      firstResolve = null;
      img.decode().catch(() => {}).then(() => { resolve(); kick(); });
      return;
    }
    // A newly arrived frame may be closer to the one we want than what is on screen.
    kick();
  },
  onCoarseProgress: fetching.progress,
});

// ---------- Loop ----------

const FRAME_MS = 1000 / 60;
const SETTLE = 0.02; // frames; closer than this counts as arrived

let shown = 1;
let running = false;
let lastTime = 0;
let lastIndex = -1;

function tick(now) {
  if (document.hidden) { running = false; lastTime = 0; return; }

  const dt = lastTime ? Math.min(64, now - lastTime) : FRAME_MS;
  lastTime = now;

  const target = targetFrame();
  // Same easing per second at any refresh rate (60, 90, 120 Hz).
  const a = 1 - Math.pow(1 - S.lerp, dt / FRAME_MS);
  shown += (target - shown) * a;
  if (Math.abs(target - shown) < SETTLE) shown = target;

  const index = Math.round(shown);
  stage.draw(store.nearest(index));

  if (index !== lastIndex) {
    store.setFocus(Math.round(target));
    store.warm(index, Math.sign(target - shown));
    lastIndex = index;
  }

  if (shown === target) { running = false; lastTime = 0; return; }
  requestAnimationFrame(tick);
}

function kick() {
  if (running || document.hidden) return;
  running = true;
  requestAnimationFrame(tick);
}

// ---------- Wiring ----------

measure();
// A reload mid-page restores the scroll position: start there instead of spinning up from frame 1.
shown = targetFrame();
store.start(Math.round(shown));

window.addEventListener('scroll', kick, { passive: true });
window.addEventListener('resize', () => { measure(); kick(); });
document.addEventListener('visibilitychange', () => { if (!document.hidden) kick(); });

const firstOrFail = Promise.race([
  firstFrame,
  // If even the first frame cannot arrive, lift the card anyway; the backdrop is painted.
  new Promise((r) => setTimeout(r, 6000)),
]).then(() => {
  if (!store.loadedCount()) status.textContent = 'The vase images could not be loaded. Please refresh to try again.';
});

// Frame downloads beyond frame 1 wait for the page's load event (entrance artwork, frame 1,
// fonts), so the card's artwork gets the connection first and the tab's spinner stops as
// soon as the visible page is complete. Capped, so a stalled asset can't hold back the vase.
const pageLoaded = new Promise((r) => {
  if (document.readyState === 'complete') r();
  else window.addEventListener('load', r, { once: true });
});
Promise.race([pageLoaded, new Promise((r) => setTimeout(r, CONFIG.loader.artCapMs))]).then(store.release);

Promise.allSettled([firstOrFail, fontsReady(), loader.artReady]).then(loader.reveal);

// Debug handle for automated checks (?debug in the URL); costs nothing otherwise.
if (new URLSearchParams(location.search).has('debug')) {
  window.__nakshi = { store, get shown() { return shown; }, targetFrame, get running() { return running; } };
}
