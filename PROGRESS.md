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

- **M4: Finale** (2026-11-06)
  - Frames 140–159: the Karu mark, **Crafted from memory.** (set in the opening title's tracked capitals, so the page closes in the voice it opened with), and the **Notify me** button with an **Explore the Nakshi Series** link underlined in a running stitch. The series line sits bottom-right with a hairline, as on the poster.
  - Portrait: an end card. The sign-off rests on a wash of backdrop colour over the vase's foot, and the series line is one line in the top band, scaled to the screen width.
  - Short landscape screens (phone held sideways): the repeated mark is dropped and the spacing tightened, so the sign-off clears the masthead.
  - All copy and links come from `config.js` (`applyContent` in ui.js). The HTML carries the same words as a fallback. The title splits after its comma.
  - Keyboard: hidden chapters use `visibility: hidden`, so the finale links are not tabbable until they are on screen. A "Skip to the end" link (first Tab stop, visible on focus) jumps straight to frame 159 and focuses **Notify me**. Tab order at frame 1: skip, Karu, Portfolio. At frame 159: Portfolio, Notify me, Explore.
  - Fix: on portrait, the frame now draws at whole-pixel offsets. A fractional offset let the frame's lighter top row show as a 1px hairline under the masthead.

- **M5: Mobile, performance, accessibility** (2026-11-06)
  - **Still layout.** With `prefers-reduced-motion` (class `is-static`) or with no JavaScript, the stage unfolds into seven full-screen stills, one per chapter (`keyFrame` in config: 1, 31, 49, 66, 88, 115, 159). Each still carries its words in the same place they take in the scrub. It uses no canvas, no scrubbing and no animations (`document.getAnimations()` returns 0), and only those 7 frames download. On portrait the still sits mid-screen, feathered into the paper. The finale's still is smaller and higher, leaving room for the sign-off.
  - The no-JS layout uses the same CSS. The key frames come from per-chapter rules in `style.css`; with JS they come from config. The old `<noscript>` image is gone, because the still layout covers that case.
  - The chapter lines now live in `index.html` as fallback copy. `chapters.js` replaces their words from `config.js` and still creates any chapter that exists only in config.
  - Real links: portfolio `https://nissan-portfolio.pages.dev/` and Notify me `mailto:rashedulislamnissan4@gmail.com`. They are in config and repeated in the HTML for no-JS visitors.
  - Touch: synthesized touch-scroll gestures on a 390×844 @3x mobile profile gave 744 frames, p50 16.7 ms, p95 16.8 ms, 0 over 33 ms.
  - Memory: after scrubbing end to end several times on that profile, all headless Chromium processes together used 115 MB of private memory (52 MB before the page), and the JS heap was 2.3 MB. Holding all 159 frames decoded would need about 586 MB for the bitmaps alone.
  - Re-verified the M2 and M4 suites after the boot refactor: the hidden-tab pause, smoothness, the loader on slow and data-saver connections, the finale tab order and the skip link all pass. No console errors in any run.

## Current milestone
- M6: Polish and deploy (next)

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
- The reduced-motion mode is read once at load. Switching the OS setting mid-visit takes effect on the next reload.
- The memory and touch figures come from headless Chromium on a desktop machine. They are indicative only; a real mid-range phone should be checked after deploy.

## Next steps
- M6: README (live link, how it works, how the frames were made, a GIF placeholder), check relative paths, choose the host (check current free-tier limits), deploy, and confirm there are no 404s on the live URL.
- Placeholder still to fill in `config.js` and `index.html`: the `explore` URL for "Explore the Nakshi Series".
