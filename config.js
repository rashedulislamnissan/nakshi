// Everything tunable lives here, so the engine never needs editing to change copy or timing.
// Frame numbers are 1-based and match the file names in ./frames/.

export const CONFIG = {
  brand: {
    name: 'Karu',
    logo: './assets/karu-logo.jpg',
    title: 'NAKSHI, IN CLAY',
    tagline: 'A Bengali textile imagined as a vessel.',
    finaleLine: 'Crafted from memory.',
    series: ['Nakshi Series / 01', 'River Memory', 'Bangladesh'],
  },

  links: {
    // PLACEHOLDER: replace with the real address before launch.
    notify: 'mailto:hello@example.com?subject=Notify%20me%20%E2%80%94%20Nakshi%2C%20in%20Clay',
    // PLACEHOLDER: where "Explore the Nakshi Series" should go.
    explore: '#',
    // PLACEHOLDER: the portfolio home page.
    portfolio: '#',
  },

  frames: {
    count: 159,
    path: (n) => `./frames/frame_${String(n).padStart(4, '0')}.webp`,
    width: 1280,
    height: 720,
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
    fadeMs: 900,
    // The hard failsafe (lift the card after 8 s no matter what) lives in index.html,
    // because it must work even if this module never loads.
  },

  // Chapter text. `frames` is the inclusive frame range where the line is visible.
  // Tune these after watching the scrub; the engine reads nothing else.
  chapters: [
    { id: 'intro',   frames: [1, 12],    lines: [{ kind: 'title', text: 'NAKSHI, IN CLAY' }, { kind: 'tagline', text: 'A Bengali textile imagined as a vessel.' }] },
    { id: 'thread',  frames: [13, 38],   lines: [{ text: 'Born as thread.' }] },
    { id: 'river',   frames: [39, 55],   lines: [{ text: 'A river, remembered.' }] },
    { id: 'home',    frames: [56, 71],   lines: [{ text: 'A home, stitched in.' }] },
    { id: 'season',  frames: [72, 102],  lines: [{ text: 'Every season, held.' }] },
    { id: 'rim',     frames: [103, 128], lines: [{ text: 'Held in clay.' }] },
    { id: 'finale',  frames: [129, 159], lines: [] },
  ],
};
