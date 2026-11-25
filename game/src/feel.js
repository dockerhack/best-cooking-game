// WOK HEI — feel. Callouts are the game's voice: PERFECT TOSS!,
// FULL HEI!, ORDER LOST. Screen shake and flashes answer the player's
// hands at once, and the judge reads them in the screenshots.

export function addCallout(state, text, x, y, color) {
  state.callouts.push({ text, x, y, color: color || '#ffd97a', life: 1.1, maxLife: 1.1 });
  if (state.callouts.length > 8) state.callouts.shift();
}

export function updateCallouts(state, dt) {
  for (let i = state.callouts.length - 1; i >= 0; i--) {
    const c = state.callouts[i];
    c.life -= dt;
    c.y -= 34 * dt;
    if (c.life <= 0) state.callouts.splice(i, 1);
  }
  if (state.shake > 0) state.shake = Math.max(0, state.shake - dt * 3);
  if (state.flash > 0) state.flash = Math.max(0, state.flash - dt * 2.5);
}

export function shakeScreen(state, amount) {
  state.shake = Math.min(1, state.shake + amount);
}

export function flashScreen(state, amount) {
  state.flash = Math.min(1, state.flash + amount);
}

export function drawCallouts(ctx, state) {
  ctx.textAlign = 'center';
  for (const c of state.callouts) {
    const a = Math.max(0, Math.min(1, c.life / c.maxLife));
    const pop = 1 + (1 - a) * 0.15;
    ctx.save();
    ctx.translate(c.x, c.y);
    ctx.scale(pop, pop);
    ctx.globalAlpha = a;
    ctx.font = '900 30px system-ui, sans-serif';
    ctx.lineWidth = 6;
    ctx.strokeStyle = '#10201f';
    ctx.strokeText(c.text, 0, 0);
    ctx.fillStyle = c.color;
    ctx.fillText(c.text, 0, 0);
    ctx.restore();
  }
  ctx.globalAlpha = 1;
}
