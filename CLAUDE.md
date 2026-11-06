# Portfolio Showcase Projects: Shared Rules

Applies to all four projects. Read this file first, then the project's own spec.

## What these are
Four interactive portfolio pieces built around the **0 / 3 / 10 second rule**:
- **0 s (Hook):** it is already moving and visually striking the moment the tab loads. No setup, no upload buttons, no menus.
- **3 s (Toy):** one mouse move, tap, or click gives a satisfying physical reaction.
- **10 s (Ingenuity):** the viewer realizes it is real tech under the hood, not a video or a template.

Build order (quickest first): **1) Telemetry Monolith, 2) Tearable Swiss Poster, 3) Neural Terrarium, 4) Tactile Shader Deck.**
Each project lives in its **own folder and its own GitHub repo**.

## How to work (important)
1. Read this file and the project spec fully. Then **propose a short plan** and wait for my OK.
2. Build **one milestone at a time**. After each milestone: run it, check every acceptance check, commit, update `PROGRESS.md`, then **stop and summarize**. Never jump ahead.
3. Get the 0 s and 3 s moments working before any polish. The 10 s reveal comes after.
4. Ask before adding any dependency. If something in the spec is unclear or conflicts, ask instead of guessing.
5. If a milestone fails its acceptance checks, fix it before moving on. Do not stack new work on a broken base.

## Skills (use them)
Before starting each milestone, look at the skills available in this environment and use the suitable ones. Read the skill first, then write code.
- **Frontend / visual design skill (e.g. `frontend-design`):** use for all look-and-feel decisions: palette, typography, layout, spacing, motion feel, HUD and label styling. Avoid generic template looks.
- **Any skill for canvas, WebGL, three.js, shaders, animation, or audio:** use it when that milestone needs it.
- **Any testing, debugging, or performance-profiling skill:** use it when verifying acceptance checks.
- If no suitable skill exists for a task, say so in one line and proceed with best practice.

## Tech rules
- **Static site only.** No backend, no database, no build step unless the spec says so. Entry point is a single `index.html`.
- **Vanilla JS (ES modules), HTML, CSS.** No frameworks.
- **Libraries only if the spec allows them.** If allowed, **vendor them locally** in `/vendor` at a pinned version. No runtime CDN links, so the site cannot break if a CDN changes.
- **No paid APIs, no API keys, no analytics, no tracking.** No network requests except the ones the spec names.
- **Fonts:** system font stack or a self-hosted font file. No Google Fonts at runtime.
- **Assets are procedural** (generated in code). Keep the total download small (target under 1 MB, not counting a vendored library).
- **Relative paths only** (`./js/app.js`, not `/js/app.js`). GitHub Pages serves under `/repo-name/`, so absolute paths break.
- **Placeholders for personal info:** keep the owner's name, role, and links in one `config.js` with clearly marked placeholders. Never invent personal facts.

## Quality bar (every project)
- **60 fps target** on a mid-range laptop. If it cannot hold 60, **degrade quality adaptively** (fewer particles, lower render scale) instead of stuttering.
- **Pointer Events** for mouse, touch, and pen. Interactive canvas uses `touch-action: none`. Must be playable on a phone.
- **Resize and DPR:** handle window resize; cap device pixel ratio at 2.
- **Audio:** only starts after the first user gesture (browser rule). Provide a visible mute toggle and the `M` key. Keep master volume low.
- **`prefers-reduced-motion`:** provide a calmer mode (less shake, less flashing). It must still look good, not broken.
- **Pause** the loop when the tab is hidden (`visibilitychange`).
- **No console errors.** If WebGL or a required API is missing, show a short friendly fallback message.
- **Honesty:** where a spec says "real", never fake it. If an API is unavailable, show "N/A" instead.

## Code style
- Small modules with clear names. Split any file that grows past ~400 lines.
- Put tunable numbers in a `CONFIG` object at the top of each module, with a short comment each.
- Comments explain **why**, not what.
- Physics and simulation use a **fixed timestep** (accumulator pattern), separate from rendering.
- Reuse pooled objects in hot loops. No per-frame allocations for particles, vectors, or buffers.

## Git
- One repo per project. Commit once per milestone with a clear message, e.g. `M3: tearing works`.
- Keep a `README.md` with: live link, a one-paragraph "how it works", controls, and a placeholder for a short GIF.

## PROGRESS.md (required)
Keep a `PROGRESS.md` in each repo and update it at every milestone: done so far, current milestone, decisions made, known issues, next steps. It lets any new session resume without re-explaining.

## Deploy (each project on a different free host)
Do **not** deploy all projects to the same host or account. Each project uses its own repo and its own host so one failure cannot take down the others.

| Project | Host |
|---|---|
| 1. Telemetry Monolith | GitHub Pages |
| 2. Tearable Swiss Poster | Netlify |
| 3. Neural Terrarium | Vercel |
| 4. Tactile Shader Deck | Cloudflare Pages (my existing account is fine for this one only) |

Settings for every host: **no build command, publish/output directory is the repo root (`.`)**.
- **GitHub Pages:** push to `main`, then Settings, Pages, deploy from branch `main` / root.
- **Netlify:** import the repo, leave build command empty, publish directory `.`
- **Vercel:** import the repo, framework "Other", no build command, output directory `.`
- **Cloudflare Pages:** connect the repo, no build command, output directory `/`.

Free-tier limits change, so check the host's current pricing page before deploying. Deploy only after the final milestone's checks pass.

## Linking back
Add one small, unobtrusive "back to portfolio" link (URL set in `config.js` as a placeholder). It must not disturb the 0 / 3 / 10 experience.
