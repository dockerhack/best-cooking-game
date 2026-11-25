// WOK HEI — fixed-step loop. The simulation always steps at 60 Hz so
// a dish cooks the same on any machine; rendering follows the display.
// The shot stager calls step() directly, never through this loop.

const STEP = 1 / 60;

export function startLoop(step, render) {
  let last = performance.now();
  let acc = 0;
  function frame(now) {
    let dt = (now - last) / 1000;
    last = now;
    if (dt > 0.25) dt = 0.25;
    acc += dt;
    let n = 0;
    while (acc >= STEP && n < 5) {
      step(STEP);
      acc -= STEP;
      n++;
    }
    if (n === 5) acc = 0;
    render();
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}
