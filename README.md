# Nakshi, in Clay

A product page for **Nakshi, in Clay**, a concept vessel by the brand **Karu**: a Bengali nakshi kantha textile imagined as a ceramic vase. The page stays still while scrolling turns the vase. The camera pushes in on the stitched river, rotates through village and harvest scenes, looks into the braided rim, and pulls back to a finale.

**Live:** https://rashedulislamnissan.github.io/nakshi/

![Scrolling the vase (GIF placeholder)](docs/demo.gif)

## How it works

The vase is a 13.2-second camera move rendered as 159 still frames (1280×720 WebP, 12 fps, about 5 MB in total). There is no `<video>` element. A 600vh scroll container holds a sticky full-screen `<canvas>`, and scroll progress picks the frame to draw. The frame on screen eases toward that target in a `requestAnimationFrame` loop that sleeps when nothing is moving, so the vase turns smoothly forward and backward under a wheel, trackpad or finger.

The frames load in order of need: the first frame alone, then every fourth frame (so the whole turn can be scrubbed early), then the gaps nearest wherever the visitor is looking. The canvas always draws the nearest frame already loaded, so it is never blank. Frames stay as compressed images, and only the few just ahead of the scroll are decoded early. Data-saving and 2G connections fetch every second frame. The chapter text is plain HTML over the canvas, faded by the frame on screen so it moves in step with the picture. Visitors who prefer reduced motion, or who have JavaScript off, get a still layout instead: one full-screen key frame per chapter, with the same words.

Vanilla JavaScript (ES modules), HTML and CSS. No libraries, no build step.

## Controls

- **Scroll** (wheel, trackpad, touch, or Space / Page Down / arrow keys) turns the vase.
- **Tab** first reaches **Skip to the end**, which jumps to the finale and focuses **Notify me**.

## Tuning

Everything adjustable lives in [`config.js`](config.js): the copy, links, chapter frame ranges and key frames, scroll length, smoothing, loader timing, and portrait framing. The engine does not need to change.

| File | Role |
|---|---|
| `js/main.js` | Boot, scroll-to-frame mapping, the animation loop, reduced-motion switch |
| `js/frames.js` | Frame loader: first frame, coarse pass, nearest-first fill, nearest-loaded lookup |
| `js/canvas.js` | Cover-fit drawing, DPR cap, portrait framing with feathered edges |
| `js/chapters.js` | Chapter text fading and the per-chapter stitch |
| `js/ui.js` | Entrance card, loading thread, copy and links from config |

## Assets

- `frames/`: 159 frames extracted from the source video. *(How the source video was made: add a sentence here.)*
- `assets/entrance*.webp`: the entrance card, shown while the first frame loads.
- `assets/karu-mark.png`: the Karu mark, cut out from the supplied logo.
- `fonts/`: Cormorant Garamond, self-hosted ([SIL Open Font License](fonts/OFL.txt)).

## Run locally

Any static server works, for example:

```
python -m http.server 8000
```

Then open http://localhost:8000.
