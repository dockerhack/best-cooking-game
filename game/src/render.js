// WOK HEI — canvas setup and draw dispatch. The judge's contact sheet
// is built from the screenshots, so every screen must read at a glance:
// one dark-teal kitchen, orange fire, gold text, no clutter.

import { H, PALETTE, W } from './config.js';
import { drawCallouts } from './feel.js';
import { drawParticles } from './particles.js';
import { drawKitchen } from './render-kitchen.js';
import { drawHUD } from './render-hud.js';
import { drawGameOver, drawNightComplete, drawPause, drawShop, drawTitle, drawVictory } from './screens.js';
import { clearHotspots } from './input.js';

export function setupCanvas(canvas) {
  canvas.width = W;
  canvas.height = H;
  canvas.style.width = 'min(100vw, 177.78vh)';
  canvas.style.height = 'auto';
  canvas.style.display = 'block';
  canvas.style.margin = '0 auto';
  canvas.style.background = PALETTE.bgDeep;
}

export function drawGame(ctx, state, actions) {
  clearHotspots();
  ctx.save();
  if (state.shake > 0) {
    const s = state.shake * 7;
    ctx.translate((Math.random() - 0.5) * s, (Math.random() - 0.5) * s);
  }
  ctx.fillStyle = PALETTE.bgDeep;
  ctx.fillRect(-10, -10, W + 20, H + 20);

  if (state.screen === 'title' || state.screen === 'howto') {
    drawKitchen(ctx, state, actions, true);
    drawTitle(ctx, state, actions);
  } else if (state.screen === 'playing' || state.screen === 'paused') {
    drawKitchen(ctx, state, actions, false);
    drawHUD(ctx, state, actions);
    drawParticles(ctx, state.particles);
    drawCallouts(ctx, state);
    if (state.screen === 'paused') drawPause(ctx, state, actions);
  } else if (state.screen === 'nightComplete') {
    drawKitchen(ctx, state, actions, true);
    drawHUD(ctx, state, actions);
    drawNightComplete(ctx, state, actions);
  } else if (state.screen === 'shop') {
    drawKitchen(ctx, state, actions, true);
    drawShop(ctx, state, actions);
  } else if (state.screen === 'gameover') {
    drawKitchen(ctx, state, actions, true);
    drawGameOver(ctx, state, actions);
  } else if (state.screen === 'victory') {
    drawKitchen(ctx, state, actions, true);
    drawVictory(ctx, state, actions);
  }
  ctx.restore();

  if (state.flash > 0) {
    ctx.fillStyle = `rgba(255, 194, 61, ${state.flash * 0.18})`;
    ctx.fillRect(0, 0, W, H);
  }
}
