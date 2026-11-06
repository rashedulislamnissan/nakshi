// Boot: draw frame 1 as early as possible, then lift the entrance card.

import { CONFIG } from '../config.js';
import { createStage } from './canvas.js';
import { loadImage } from './frames.js';
import { initLoader, initLinks, fontsReady } from './ui.js';

const scroller = document.getElementById('scroller');
const status = document.getElementById('status');

scroller.style.height = `${CONFIG.scroll.heightVh}vh`;
initLinks(CONFIG.links);

const stage = createStage(document.getElementById('stage-canvas'), CONFIG.canvas);
const loader = initLoader(CONFIG.loader);

const firstFrame = loadImage(CONFIG.frames.path(1))
  .then((img) => stage.draw(img))
  .catch(() => {
    // The backdrop gradient is already painted, so the page still reads as intended.
    status.textContent = 'The vase image could not be loaded. Please refresh to try again.';
  });

Promise.allSettled([firstFrame, fontsReady()]).then(loader.reveal);
