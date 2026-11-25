// WOK HEI — mouse and keyboard. Renderers register hotspots each
// frame; a click finds the topmost hotspot under the pointer. Keys are
// queued and consumed once per press, so a held Space tosses once.

import { H, W } from './config.js';

let canvas = null;
let hotspots = [];
let keyQueue = [];
let keysDown = new Set();

export function attach(inputCanvas) {
  canvas = inputCanvas;
  canvas.addEventListener('click', (ev) => {
    const rect = canvas.getBoundingClientRect();
    const x = ((ev.clientX - rect.left) / rect.width) * W;
    const y = ((ev.clientY - rect.top) / rect.height) * H;
    for (let i = hotspots.length - 1; i >= 0; i--) {
      const h = hotspots[i];
      if (x >= h.x && x <= h.x + h.w && y >= h.y && y <= h.y + h.h) {
        h.onClick();
        return;
      }
    }
  });
  window.addEventListener('keydown', (ev) => {
    if (ev.repeat) return;
    keysDown.add(ev.code);
    keyQueue.push(ev.code);
    if (ev.code === 'Space') ev.preventDefault();
  });
  window.addEventListener('keyup', (ev) => keysDown.delete(ev.code));
  window.addEventListener('blur', () => {
    keysDown.clear();
    keyQueue = [];
  });
}

export function clearHotspots() {
  hotspots = [];
}

export function hotspot(id, x, y, w, h, onClick) {
  hotspots.push({ id, x, y, w, h, onClick });
}

// True once for the oldest queued press of this code.
export function consumeKey(code) {
  const i = keyQueue.indexOf(code);
  if (i === -1) return false;
  keyQueue.splice(i, 1);
  return true;
}

export function drainKeys() {
  keyQueue = [];
}

export function isDown(code) {
  return keysDown.has(code);
}
