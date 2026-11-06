# Karu: Nakshi, in Clay (scroll-driven product site)

**Repo:** `nakshi-scroll` | **Host:** GitHub Pages (change if you prefer) | **Est.:** 1-2 days
Read `CLAUDE.md` first (shared rules, skills rule, quality bar, PROGRESS.md habit). This spec **overrides** it in three places: (1) the download budget is larger, up to about 12 MB for frames; (2) no physics or 3D is needed; (3) no library by default, vanilla JS only.

## One-line pitch
A product site for **Nakshi, in Clay**, a Bengali nakshi kantha textile imagined as a ceramic vessel by the brand **Karu**. The page stays still and **scrolling turns the vase**: the camera pushes in on the stitched river, the vase rotates through village and harvest scenes, looks into its rim, and pulls back to a finale. Text appears at set points. It is a concept product, so the call to action is "Notify me", not a shop.

## Why it exists in my portfolio
Shows I can design and ship a polished product experience (art direction, scroll-driven storytelling, performance on mobile), built from an original product I designed. Target audience: recruiters, clients, design and frontend roles.

## Skills to use
- Visual design skill (e.g. `frontend-design`) for typography, layout, spacing, color, and how the text overlays sit on the video frames. Aim for quiet, premium, craft-brand design that matches the poster: warm paper beige, dark brown serif type with wide letter-spacing, small rust-red accent, plenty of empty space.
- Any performance-profiling skill for the frame loader and scroll smoothness.
- Any accessibility skill for the reduced-motion and keyboard behavior.

## Assets (already made)
- `frames/frame_0001.webp` to `frame_0159.webp`: 159 frames, 1280x720, 12 fps, about 4.9 MB total.
- `source_video.mp4`: the 13.2-second source (reference only, **do not use a `<video>` element**).
- The background in the frames is a warm beige with a soft horizon. The page background should be fixed to the same beige tone, and the canvas should blend to it at the edges. Sample the color from the frame edges.
- Logo and Bengali wordmark (কারু): I will supply `karu-logo.png`. Until then use a text placeholder. Do **not** try to render Bengali text with a downloaded web font unless I approve one self-hosted subset.

## The 0 / 3 / 10 beats
- **0 s:** Frame 1 (the full vase on beige) is visible instantly, with the title **NAKSHI, IN CLAY** and the line *A Bengali textile imagined as a vessel.* Nothing to click. A small "Scroll" cue gently pulses.
- **3 s:** Scrolling spins and pushes the vase in real time, forward and backward, buttery smooth, on mouse wheel, trackpad, and touch.
- **10 s:** By the rim and pull-back chapters the visitor realizes the whole page is one continuous object they are turning with their finger. The finale lands on the brand line and the call to action.

## Chapters (approximate times in the 13.2 s source; verify by looking at the frames)
| # | Source time | Frames | What is on screen | Text overlay |
|---|---|---|---|---|
| 1 | 0.0-1.0 s | 1-12 | Full vase, camera starts moving | **NAKSHI, IN CLAY** / *A Bengali textile imagined as a vessel.* |
| 2 | 1.0-3.2 s | 13-38 | Push-in to the river and sailboat | *Born as thread.* |
| 3 | 3.2-5.9 s | 39-71 | Rotation through village and harvest | *A river, remembered.* then *A home, stitched in.* |
| 4 | 5.9-8.5 s | 72-102 | Rotation continues, river returns | *Every season, held.* |
| 5 | 8.5-10.7 s | 103-128 | Camera looks into the braided rim and indigo lining | *Held in clay.* |
| 6 | 10.7-13.2 s | 129-159 | Pull-back to the full vase, holds | Karu logo, **Crafted from memory.**, *Nakshi Series / 01, River Memory, Bangladesh*, buttons |

Keep all chapter text, timings, and frame ranges in one `config.js` so I can tune them without touching the engine.

## Tech constraints
- Vanilla JS (ES modules), HTML, CSS. **Canvas 2D** draws the frames. No video element, no libraries.
- A tall scroll container (start at about 600vh, tunable in config) with a sticky full-viewport canvas. **Scroll progress selects the frame.**
- **Smoothing:** ease the displayed frame toward the target frame (lerp about 0.1-0.15) in a `requestAnimationFrame` loop, so it feels smooth, not steppy. Stop the loop when idle.
- **Drawing:** cover-fit the 16:9 frame to any viewport (center-crop). On portrait phones the vase stays visible because it is centered. Cap DPR at 2.
- **Loading (important):**
  1. Load and show frame 1 immediately.
  2. Load every 4th frame next, so scrubbing works early with a coarse sequence.
  3. Fill in the rest in the background, nearest to the current scroll position first.
  4. Draw the nearest loaded frame while others are still loading. No blank canvas, ever.
  5. Show a tiny, elegant loading indicator only if the coarse set takes longer than about 1.5 s.
- **Memory:** keep compressed `Image` elements and let the browser decode on draw. **Do not store 159 decoded full-size bitmaps** on mobile. If needed, keep only a window of decoded frames around the current one.
- On `saveData` or slow connections, use every 2nd frame (setting in config).
- Text overlays are plain HTML positioned over the canvas, faded in and out by scroll progress ranges from `config.js`.

## Suggested structure
```
index.html
config.js              chapters, text, frame ranges, scroll height, brand details, notify link
css/style.css
js/main.js             boot, scroll to progress, loop
js/frames.js           loader: first frame, coarse pass, background fill, nearest-loaded lookup
js/canvas.js           cover-fit drawing, resize, DPR
js/chapters.js         text overlay fade logic
js/ui.js               scroll cue, loading indicator, finale buttons
frames/                frame_0001.webp ... frame_0159.webp
karu-logo.png          (supplied by me)
PROGRESS.md
README.md
```

## Milestones and acceptance checks

**M1: Shell and first frame**
- Page, fixed beige background, sticky canvas, frame 1 drawn instantly, hook title and tagline, scroll cue.
- Check: looks like a premium craft-brand page as a still; frame 1 appears before anything else loads.

**M2: Scrub engine**
- Scroll progress to frame mapping, smoothing, coarse-then-fill loader, nearest-loaded fallback.
- Check: scrubbing forward and backward is smooth at 60 fps; never a blank canvas; works with throttled network.

**M3: Chapters and text**
- Overlays fade in and out per `config.js`; text never covers the vase's main detail.
- Check: each chapter's text lands on the right visual moment (adjust frame ranges after viewing frames); readable on every frame it sits over.

**M4: Finale**
- Karu logo, tagline, series line, **Explore the Nakshi Series** and **Notify me** buttons (placeholder `mailto:` set in config).
- Check: finale is the calm hold at the end; buttons work and are keyboard reachable.

**M5: Mobile, performance, accessibility**
- Portrait phones crop well; touch scrolling is smooth; memory stays reasonable; `prefers-reduced-motion` shows a static, non-scrubbing layout with key frames and the same text; `<noscript>` shows frame 1 and the text.
- Check: smooth on a mid-range phone; no console errors; tab-hidden pause works.

**M6: Polish and deploy**
- README (live link, how it works, how frames were made, GIF placeholder), relative paths, deploy to GitHub Pages.
- Check: live site works from the subpath with no 404s.

## Non-goals
- No shop, cart, payments, or accounts.
- No 3D engine, no video element, no GSAP unless I approve it.
- No sound by default.
- Do not invent product claims, prices, or materials beyond the text in `config.js`.

## Definition of done
All milestones pass their checks, the site is live, and the README has the live link and a one-paragraph explanation.
