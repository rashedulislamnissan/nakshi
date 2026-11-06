// Chapter text: plain HTML over the canvas, faded by the *shown* (smoothed) frame so every
// line moves in step with the picture rather than with the raw scroll position.

const TUNING = {
  stitchDash: 6,   // must match the dash pattern in style.css for the reveal to land on whole stitches
};

/**
 * @param {object} opts
 * @param {Array}  opts.chapters   from config.js
 * @param {number} opts.count      total frames
 * @param {number} opts.fade       frames spent fading in (and out) inside each range
 * @param {object} opts.frame      { width, height } of the source frames
 * @param {number} opts.vaseHalfWidth  source px from frame centre to the vase's widest edge in close-ups
 */
export function createChapters({ chapters, count, fade, frame, vaseHalfWidth, finaleVaseHalfWidth }) {
  const root = document.getElementById('chapters');

  const items = chapters.map((ch) => {
    // The intro and finale are written in the HTML (they paint before any script, and work
    // without it); only their timing comes from config.
    let el = document.querySelector(`[data-chapter="${ch.id}"]`);
    if (!el && ch.lines.length) {
      el = document.createElement('div');
      el.className = 'chapter';
      el.dataset.chapter = ch.id;
      for (const line of ch.lines) {
        const p = document.createElement('p');
        p.className = 'chapter__line';
        p.textContent = line.text;
        el.appendChild(p);
      }
      el.insertAdjacentHTML('beforeend',
        '<svg class="chapter__stitch" viewBox="0 0 96 4" aria-hidden="true" focusable="false"><line x1="1" y1="2" x2="95" y2="2"/></svg>');
      root.appendChild(el);
    }
    return el && {
      el,
      stitch: el.querySelector('.chapter__stitch'),
      from: ch.frames[0],
      to: ch.frames[1],
      opacity: -1,
      sewn: -1,
    };
  }).filter(Boolean);

  // Where the vase's widest close-up edge lands on this screen, so landscape text can be
  // sized to stop short of it whatever the aspect ratio.
  function layout() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    const s = Math.max(w / frame.width, h / frame.height);
    const edge = (half) => `${Math.round(Math.max(0, w / 2 - half * s))}px`;
    const root = document.documentElement.style;
    root.setProperty('--vase-left', edge(vaseHalfWidth));
    root.setProperty('--vase-left-final', edge(finaleVaseHalfWidth));
  }

  function opacityAt(it, f) {
    if (f < it.from || f > it.to) return 0;
    // The very first and very last chapters hold at full strength at the ends of the scroll.
    const fadeIn = it.from <= 1 ? 1 : Math.min(1, (f - it.from) / fade);
    const fadeOut = it.to >= count ? 1 : Math.min(1, (it.to - f) / fade);
    return Math.max(0, Math.min(fadeIn, fadeOut));
  }

  function update(f) {
    for (const it of items) {
      // Two decimals is below what anyone can see and keeps style writes rare.
      const o = Math.round(opacityAt(it, f) * 100) / 100;
      if (o !== it.opacity) {
        it.opacity = o;
        it.el.style.opacity = String(o);
        it.el.style.visibility = o > 0 ? 'visible' : 'hidden';
      }
      if (it.stitch && o > 0) {
        // Sew the thread in whole stitches across the chapter's range.
        const p = Math.min(1, Math.max(0, (f - it.from) / Math.max(1, it.to - it.from)));
        const stitches = Math.round(p * (96 / (TUNING.stitchDash * 2)));
        if (stitches !== it.sewn) {
          it.sewn = stitches;
          const shown = Math.min(96, stitches * TUNING.stitchDash * 2);
          it.stitch.style.clipPath = `inset(0 ${100 - (shown / 96) * 100}% 0 0)`;
        }
      }
    }
  }

  layout();
  window.addEventListener('resize', layout);

  return { update };
}
