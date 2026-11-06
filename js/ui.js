// Page chrome: the entrance card hand-off and config-driven links.

/**
 * The entrance card is in the HTML so it paints with the first byte. This decides when it
 * lifts: once the page beneath is ready, but never sooner than `minMs` after navigation,
 * so a fast cache hit doesn't turn it into a flicker.
 */
export function initLoader({ minMs, fadeMs }) {
  const root = document.documentElement;
  const loader = document.getElementById('loader');
  root.style.setProperty('--loader-fade', `${fadeMs}ms`);

  let revealed = false;

  function reveal() {
    if (revealed) return;
    revealed = true;
    const wait = Math.max(0, minMs - performance.now());
    setTimeout(() => {
      root.classList.add('is-ready');
      // Drop it from layout once the fade has finished so it costs nothing afterwards.
      setTimeout(() => { if (loader) loader.hidden = true; }, fadeMs * 1.5);
    }, wait);
  }

  return { reveal };
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
