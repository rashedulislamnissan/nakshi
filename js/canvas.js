// Cover-fit drawing of 16:9 frames onto a full-viewport canvas.

// Fill used before any frame exists, matching the backdrop's light-to-shadow fall-off
// (same stops as the body gradient in style.css).
const BACKDROP = [
  [0, '#dcc39f'],
  [0.55, '#c8ad88'],
  [1, '#a0845e'],
];

const TUNING = {
  edgeBand: 0.04,     // share of frame height averaged to find its top/bottom backdrop tone
  // Sampled from the far left and right margins, never the centre: in close-ups the vase
  // crosses the top and bottom edges, and its colours would muddy the band.
  edgeMargin: 0.06,
  featherMax: 140,    // CSS px of fade where a shrunken frame meets the band colour
};

export function createStage(canvas, { maxDpr = 2, portraitScale = 1 } = {}) {
  // Opaque canvas: the browser can skip blending it with the page on every frame.
  const ctx = canvas.getContext('2d', { alpha: false });
  const tones = new WeakMap();
  const probe = document.createElement('canvas');
  probe.width = 16;
  probe.height = 1;
  const probeCtx = probe.getContext('2d', { willReadFrequently: true });

  let current = null;
  let dpr = 1;
  let resizeQueued = false;

  function paintBackdrop() {
    const g = ctx.createLinearGradient(0, 0, canvas.width, 0);
    for (const [at, color] of BACKDROP) g.addColorStop(at, color);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  // Average backdrop tone along a frame's top and bottom edge, cached per image.
  // Lets a shrunken frame continue seamlessly into flat colour above and below it.
  function edgeTones(img) {
    let t = tones.get(img);
    if (t) return t;
    const iw = img.naturalWidth;
    const ih = img.naturalHeight;
    const sw = iw * TUNING.edgeMargin;
    const band = Math.max(1, Math.round(ih * TUNING.edgeBand));
    // Left margin into the probe's first 8 pixels, right margin into the last 8; the
    // average lands between the window-lit and shadowed sides, like the frame's centre.
    const read = (sy) => {
      probeCtx.clearRect(0, 0, 16, 1);
      probeCtx.drawImage(img, 0, sy, sw, band, 0, 0, 8, 1);
      probeCtx.drawImage(img, iw - sw, sy, sw, band, 8, 0, 8, 1);
      const d = probeCtx.getImageData(0, 0, 16, 1).data;
      let r = 0, g = 0, b = 0;
      for (let i = 0; i < d.length; i += 4) { r += d[i]; g += d[i + 1]; b += d[i + 2]; }
      const n = d.length / 4;
      return [Math.round(r / n), Math.round(g / n), Math.round(b / n)];
    };
    t = { top: read(0), bottom: read(ih - band) };
    tones.set(img, t);
    return t;
  }

  const rgba = ([r, g, b], a) => `rgba(${r},${g},${b},${a})`;

  function resize() {
    resizeQueued = false;
    dpr = Math.min(window.devicePixelRatio || 1, maxDpr);
    const w = Math.max(1, Math.round(canvas.clientWidth * dpr));
    const h = Math.max(1, Math.round(canvas.clientHeight * dpr));
    if (w === canvas.width && h === canvas.height) return;
    // Resizing wipes the bitmap, so repaint in the same task to avoid a one-frame flash.
    canvas.width = w;
    canvas.height = h;
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    if (current) paint(current);
    else paintBackdrop();
  }

  function paint(img) {
    const cw = canvas.width;
    const ch = canvas.height;
    const iw = img.naturalWidth;
    const ih = img.naturalHeight;

    // Cover-fit, centre-cropped: the vase sits at the horizontal centre of every frame.
    let s = Math.max(cw / iw, ch / ih);
    // On portrait screens a full cover pushes the vase to the screen edges, leaving no room
    // for text. Draw it a little smaller (still covering the width) and let it fade into
    // flat bands of its own edge colour above and below.
    if (ch > cw) s = Math.max(cw / iw, s * portraitScale);

    const dw = iw * s;
    const dh = ih * s;
    const dx = (cw - dw) / 2;
    const dy = (ch - dh) / 2;

    if (dy <= 0.5) {
      ctx.drawImage(img, dx, dy, dw, dh);
      return;
    }

    const { top, bottom } = edgeTones(img);
    ctx.fillStyle = rgba(top, 1);
    ctx.fillRect(0, 0, cw, Math.ceil(dy));
    ctx.fillStyle = rgba(bottom, 1);
    ctx.fillRect(0, Math.floor(dy + dh), cw, ch);
    ctx.drawImage(img, dx, dy, dw, dh);

    const f = Math.min(dh * 0.14, TUNING.featherMax * dpr);
    let g = ctx.createLinearGradient(0, dy, 0, dy + f);
    g.addColorStop(0, rgba(top, 1));
    g.addColorStop(1, rgba(top, 0));
    ctx.fillStyle = g;
    ctx.fillRect(0, dy, cw, f);
    g = ctx.createLinearGradient(0, dy + dh - f, 0, dy + dh);
    g.addColorStop(0, rgba(bottom, 0));
    g.addColorStop(1, rgba(bottom, 1));
    ctx.fillStyle = g;
    ctx.fillRect(0, dy + dh - f, cw, f);
  }

  /** Draws `img` if it differs from what is on screen. Returns true when it painted. */
  function draw(img) {
    if (!img || img === current) return false;
    current = img;
    paint(img);
    return true;
  }

  new ResizeObserver(() => {
    if (resizeQueued) return;
    resizeQueued = true;
    requestAnimationFrame(resize);
  }).observe(canvas);
  resize();

  return { draw };
}
