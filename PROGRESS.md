# Progress: Nakshi, in Clay

## Done
- **M1: Shell and first frame** (2026-11-06)
  - Entrance card (`assets/entrance*.webp`, converted from the 3 MB PNG to 105/240 KB) is in the HTML, so it paints first. It lifts once frame 1 and the fonts are ready, and never sooner than 1.1 s, so it doesn't flash.
  - Frame 1 is preloaded and drawn to a sticky full-viewport canvas (cover-fit, DPR capped at 2).
  - Hero: title, tagline, and a running-stitch scroll cue. Masthead with the Karu mark and a Portfolio link.
  - The `config.js` file holds the brand copy, links (placeholders), frame settings, scroll height, loader timing, and the chapter table.

## Current milestone
- M2: Scrub engine (next)

## Decisions
- **Font:** Cormorant Garamond (OFL), self-hosted in `fonts/`, latin subset, weights 500 / 500 italic / 600 (about 69 KB in total).
- **Palette:** sampled from the frame edges. The backdrop is not flat: it runs from about `#dcc39f` on the window-lit left to `#a0845e` on the shadowed right. The body background copies that gradient, so any uncovered strip matches the canvas.
- **Text placement:** on landscape screens it sits in a left column over the lighter side of the backdrop. On portrait screens it sits in a band above the vase.
- **Portrait framing:** a full cover pushed the vase to the screen edges, so on portrait the frame draws at 0.8× cover (`config.canvas.portraitScale`). It fades into flat bands of its own backdrop tone, sampled from the far left and right margins so close-ups don't muddy the bands.
- **Logo:** `assets/karu-mark.png` is the supplied JPG with the paper background removed and the mark recoloured to the ink tone.
- **Loader failsafe:** an inline script in `index.html` lifts the card after 8 s even if the JS module fails.
- **Originals** (source video, poster, PNGs) are git-ignored. The site ships only the optimised copies.
- **Hosting:** to be decided at M6. The early lean is Vercel over Netlify, because of the per-visitor frame weight and Netlify's credit-based free tier.

## Known issues
- Hero text is static HTML for now. M3 moves its fade timing into the config-driven chapter system.
- On a phone held sideways (844×390), the title block sits close to the masthead. It is acceptable, but revisit it in M5.

## Next steps
- M2: map scroll progress to frames, add lerp smoothing, the coarse-then-fill loader with nearest-loaded fallback, and pause when idle or the tab is hidden.
