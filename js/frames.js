// Frame loading. M1 only needs the first frame; the coarse/fill passes arrive in M2.

/**
 * Loads one frame and resolves once it is decoded, so the first draw never stalls.
 * Rejects if the file fails to load.
 */
export function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.decoding = 'async';
    img.onload = () => {
      // decode() can reject for reasons unrelated to the file (e.g. a detached document);
      // the image is still usable then, so fall through to resolve.
      (img.decode ? img.decode() : Promise.resolve()).catch(() => {}).then(() => resolve(img));
    };
    img.onerror = () => reject(new Error(`Frame failed to load: ${url}`));
    img.src = url;
  });
}
