// Everything tunable lives here, so the engine never needs editing to change copy or timing.
// Frame numbers are 1-based and match the file names in ./frames/.

export const CONFIG = {
  brand: {
    name: 'Karu',
    logo: './assets/karu-logo.jpg',
    title: 'Nakshi, in Clay',   // shown in capitals; breaks after the comma on wide screens
    tagline: 'A Bengali textile imagined as a vessel.',
    finaleLine: 'Crafted from memory.',
    series: ['Nakshi Series / 01', 'River Memory', 'Bangladesh'],
  },

  // index.html repeats these as fallbacks for visitors without JavaScript; keep them in step.
  links: {
    notify: 'mailto:rashedulislamnissan4@gmail.com?subject=Notify%20me%3A%20Nakshi%2C%20in%20Clay',
    // "Explore the Nakshi Series" is shown as plain text for now (no page exists yet).
    portfolio: 'https://nissan-portfolio.pages.dev/',
  },

  frames: {
    count: 159,
    path: (n) => `./frames/frame_${String(n).padStart(4, '0')}.webp`,
    // 1920×1080: upscaled 1.5× from the 1280×720 source video with Real-ESRGAN (x4plus), so
    // high-density screens stretch the frame far less. See README.
    width: 1920,
    height: 1080,
    coarseStep: 4,        // first background pass loads every Nth frame so scrubbing works early
    saveDataStep: 2,      // on saveData / slow connections, only every Nth frame is ever used
  },

  scroll: {
    heightVh: 600,        // total scroll length; longer = slower turn per wheel notch
    lerp: 0.12,           // how quickly the shown frame chases the scroll target (0..1)
  },

  canvas: {
    maxDpr: 2,
    // Portrait screens only: frame size as a share of full cover. Below 1 the frame is drawn
    // smaller and fades into the backdrop above and below, leaving room for text.
    portraitScale: 0.8,
  },

  loader: {
    minMs: 1100,          // keep the entrance card up at least this long so it never just flashes
    holdMs: 700,          // ...and at least this long after its artwork appears (slow lines)
    artCapMs: 3000,       // stop waiting for the artwork after this; the site matters more
    fadeMs: 900,
    indicatorDelayMs: 1500, // the small loading thread appears only if the coarse pass is slower than this
    // The hard failsafe (lift the card after 8 s no matter what) lives in index.html,
    // because it must work even if this module never loads.
  },

  text: {
    fadeFrames: 4,        // each line fades in over its first N frames and out over its last N
    // Source px from the frame's centre to the vase's widest edge in the close-ups. Landscape
    // text is sized to stop short of it on every aspect ratio.
    vaseHalfWidth: 450,
    finaleVaseHalfWidth: 285,  // the same for the pulled-back final frames, where the vase is smaller
  },

  // Chapter text. `frames` is the inclusive range where a line is on screen; the fades happen
  // inside it, so neighbouring ranges never overlap. Ranges were set by checking each frame:
  //   1–24 full vase, nearly still · 25–40 push-in to the river · 41–56 river and boat close
  //   57–75 the home and harvest figure · 76–99 the river returns · 100–128 into the rim
  //   129–144 pull-back · 145–159 full vase, holding.
  //
  // `keyFrame` is the still shown for that chapter in the reduced-motion layout.
  // The intro's and finale's words come from `brand` above. index.html carries all of this
  // text as a fallback (no-JS visitors); when the script runs, these values replace it.
  chapters: [
    { id: 'intro',   frames: [1, 18],    keyFrame: 1,   lines: [] },
    { id: 'thread',  frames: [22, 40],   keyFrame: 31,  lines: [{ text: 'Born as thread.' }] },
    { id: 'river',   frames: [43, 55],   keyFrame: 49,  lines: [{ text: 'A river, remembered.' }] },
    { id: 'home',    frames: [58, 74],   keyFrame: 66,  lines: [{ text: 'A home, stitched in.' }] },
    { id: 'season',  frames: [78, 99],   keyFrame: 88,  lines: [{ text: 'Every season, held.' }] },
    { id: 'rim',     frames: [104, 127], keyFrame: 115, lines: [{ text: 'Held in clay.' }] },
    { id: 'finale',  frames: [140, 159], keyFrame: 159, lines: [] },
  ],
};
