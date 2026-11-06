# Progress: Nakshi, in Clay

## Done
- **M1: Shell and first frame** (2026-11-06)
  - Entrance card (`assets/entrance*.webp`, converted from the 3 MB PNG to 105/240 KB) is in the HTML, so it paints first. It lifts once frame 1 and the fonts are ready, and never sooner than 1.1 s, so it doesn't flash.
  - Frame 1 is preloaded and drawn to a sticky full-viewport canvas (cover-fit, DPR capped at 2).
  - Hero: title, tagline, and a running-stitch scroll cue. Masthead with the Karu mark and a Portfolio link.
  - The `config.js` file holds the brand copy, links (placeholders), frame settings, scroll height, loader timing, and the chapter table.

- **M2: Scrub engine** (2026-11-06)
  - Scroll progress over the 600vh scroller maps to frames 1–159. The shown frame eases toward the target with a lerp of 0.12, frame-rate independent, so 60/90/120 Hz feel the same.
  - The rAF loop runs only while the shown frame is moving or a new frame arrives. It sleeps when settled or when the tab is hidden, and restarts on scroll or visibility.
  - Loader order: the frame for the current scroll position first (frame 1 on a fresh visit), alone on the connection. Then the coarse pass (every 4th frame plus the last), nearest-first. Then the fill pass, always the gap nearest the visitor's target frame. Six requests run in parallel, and a failed frame is retried once.
  - Downloads beyond the first frame wait for the window `load` event, capped at 3 s. The entrance artwork gets the connection first, and the tab's spinner stops as soon as the visible page is done.
  - The canvas always draws the nearest loaded frame, so it is never blank.
  - Memory: frames stay as compressed `<img>` elements. Only the ~8 frames around the current one, ahead in the scroll direction, get `decode()` hints. The browser is free to discard the rest.
  - On `saveData` or a 2g connection, only every 2nd frame is fetched (80 frames).
  - A small loading thread (bottom-right on desktop, under the masthead on phones) appears only if the coarse pass takes longer than 1.5 s. Its stitches fill as coarse frames arrive.
  - Measured in headless Chromium at 1440×900 during continuous wheel scrubbing: 965 frames, p50 16.7 ms, p95 16.8 ms, 0 frames over 33 ms, 0 long tasks.
  - On a 1.5 Mbps / 150 ms connection: the card lifts at 2.6 s with its artwork painted. A jump to frame 99 with 25 frames loaded draws the nearest loaded frame. After the coarse pass, filling starts at frame 99 and works outward.

- **M3: Chapters and text** (2026-11-06)
  - `js/chapters.js` builds the chapter lines from `config.js` and fades them by the *shown* (smoothed) frame, so the text moves in step with the picture. The intro is the existing HTML hero, so it still paints before any script runs.
  - The fades happen inside each range (`text.fadeFrames: 4`), so neighbouring chapters never overlap. A sweep of every quarter-frame from 1 to 159 found no frame with two blocks visible.
  - Frame ranges were re-set after checking every frame on contact sheets (the spec's estimates were close but early). See the comment in `config.js`.
  - Landscape text width comes from where the vase's widest close-up edge lands on the current screen (`--vase-left`, from `text.vaseHalfWidth`). Measured at 1280×720, 1440×900 and 1920×1080, each block's right edge stays 32 px clear of the vase.
  - Each line has a running stitch under it that sews in, whole stitches at a time, as you scroll through that chapter.
  - A soft halo in the backdrop colour keeps the ink readable where a portrait close-up reaches the text band.

## Current milestone
- M4: Finale (next)

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
- Frames 41–42 of the source video have a faint ghosted edge on the vase (a seam in the original render). It is visible only when scrubbing slowly through that point.
- `?debug` in the URL exposes `window.__nakshi` for automated checks. It is harmless, but consider removing it at M6.
- On a phone held sideways (844×390), the title block sits close to the masthead. It is acceptable, but revisit it in M5.

## Next steps
- M4: finale over frames 140–159 (the pull-back and hold): the Karu mark, **Crafted from memory.**, the series line, and the **Explore the Nakshi Series** and **Notify me** buttons (placeholder links in config). The buttons must not be focusable while the finale is hidden.
