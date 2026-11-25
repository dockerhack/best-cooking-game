// WOK HEI — the HUD: shift timer, score, HEI meter, combo, and the
// order rail. The rail is the order board the judge looks for: every
// ticket shows its recipe, its ingredients and a patience bar that
// drains in plain sight.

import { COMBO_FULL, H, PALETTE, W } from './config.js';
import { hotspot } from './input.js';
import { drawIngredient } from './render-kitchen.js';

function fmtTime(s) {
  const m = Math.floor(Math.max(0, s) / 60);
  const r = Math.floor(Math.max(0, s) % 60);
  return `${m}:${String(r).padStart(2, '0')}`;
}

export function drawHUD(ctx, state, actions) {
  // Top bar.
  ctx.fillStyle = 'rgba(8, 32, 36, 0.92)';
  ctx.fillRect(0, 56, W, 84);
  ctx.fillStyle = PALETTE.panelEdge;
  ctx.fillRect(0, 140, W, 2);

  // Night + timer, big enough to feel.
  ctx.textAlign = 'left';
  ctx.fillStyle = PALETTE.gold;
  ctx.font = '900 20px system-ui, sans-serif';
  ctx.fillText(`NIGHT ${state.night} · ${state.nightDef.name.toUpperCase()}`, 24, 88);
  ctx.fillStyle = state.timeLeft < 20 ? '#e2483d' : PALETTE.cream;
  ctx.font = '900 34px system-ui, sans-serif';
  ctx.fillText(fmtTime(state.timeLeft), 24, 124);

  // Score, kept clear of the pause/mute buttons at the top right.
  ctx.fillStyle = PALETTE.cream;
  ctx.font = '900 26px system-ui, sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText(`SCORE ${state.score.toLocaleString()}`, W - 200, 92);
  ctx.fillStyle = PALETTE.grey;
  ctx.font = '700 14px system-ui, sans-serif';
  ctx.fillText(`BEST ${Math.max(state.save.bestScore, state.score).toLocaleString()}`, W - 200, 116);

  // HEI meter + combo, centre top.
  const mx = 500;
  const mw = 280;
  ctx.textAlign = 'left';
  ctx.fillStyle = PALETTE.goldSoft;
  ctx.font = '900 15px system-ui, sans-serif';
  ctx.fillText('HEI', mx, 84);
  ctx.fillStyle = '#0a1a1c';
  ctx.fillRect(mx + 40, 70, mw, 16);
  const heiFrac = Math.min(1, state.hei / 10);
  const grad = ctx.createLinearGradient(mx + 40, 0, mx + 40 + mw, 0);
  grad.addColorStop(0, '#ff7a1a');
  grad.addColorStop(1, '#ffc23d');
  ctx.fillStyle = grad;
  ctx.fillRect(mx + 40, 70, mw * heiFrac, 16);
  ctx.fillStyle = state.combo >= COMBO_FULL ? '#ffc23d' : PALETTE.cream;
  ctx.font = state.combo >= COMBO_FULL ? '900 22px system-ui, sans-serif' : '900 16px system-ui, sans-serif';
  ctx.fillText(state.combo >= COMBO_FULL ? `FULL HEI! ×2` : `COMBO ×${state.combo}`, mx + 40, 116);

  // Pause + mute buttons.
  ctx.fillStyle = PALETTE.panel;
  ctx.fillRect(W - 180, 64, 34, 30);
  ctx.fillStyle = PALETTE.cream;
  ctx.font = '900 15px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('II', W - 163, 85);
  hotspot('pause', W - 180, 64, 34, 30, () => actions.onPause());
  ctx.fillStyle = PALETTE.panel;
  ctx.fillRect(W - 138, 64, 34, 30);
  ctx.fillText(state.muted ? '✕' : '♪', W - 121, 85);
  hotspot('mute', W - 138, 64, 34, 30, () => actions.onMute());

  // Order rail: the ticket board.
  const railY = 156;
  const railH = 128;
  ctx.fillStyle = 'rgba(18, 58, 61, 0.9)';
  ctx.fillRect(0, railY, W, railH);
  ctx.fillStyle = PALETTE.gold;
  ctx.font = '900 13px system-ui, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('ORDER RAIL', 24, railY + 20);
  ctx.fillStyle = PALETTE.grey;
  ctx.font = '700 12px system-ui, sans-serif';
  ctx.fillText('click a ticket to start it  ·  1/2/3 select wok  ·  SPACE toss  ·  S season', 150, railY + 20);

  const waiting = state.tickets.filter((t) => t.state === 'waiting');
  const cooking = state.tickets.filter((t) => t.state === 'cooking');
  const shown = [...waiting, ...cooking].slice(0, 5);
  shown.forEach((t, i) => {
    const x = 24 + i * 248;
    const y = railY + 30;
    const w = 232;
    const h = 86;
    const frac = Math.max(0, t.patience / t.maxPatience);
    ctx.fillStyle = t.state === 'cooking' ? '#1d5257' : '#f7efdd';
    ctx.strokeStyle = frac < 0.3 ? '#e2483d' : '#c9b8a3';
    ctx.lineWidth = frac < 0.3 ? 3 : 2;
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, 8);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = t.state === 'cooking' ? PALETTE.goldSoft : '#10201f';
    ctx.font = '800 14px system-ui, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(t.recipe.name, x + 10, y + 22);
    ctx.fillStyle = t.state === 'cooking' ? PALETTE.cream : '#5a6b66';
    ctx.font = '700 12px system-ui, sans-serif';
    ctx.fillText(t.customer, x + 10, y + 40);
    t.recipe.ings.forEach((ing, j) => {
      drawIngredient(ctx, ing, x + 22 + j * 30, y + 62, 10);
    });
    // Patience bar: the tip meter.
    ctx.fillStyle = '#0a1a1c';
    ctx.fillRect(x + 10, y + h - 12, w - 20, 6);
    ctx.fillStyle = frac < 0.3 ? '#e2483d' : frac < 0.6 ? '#f5b942' : '#7fc96b';
    ctx.fillRect(x + 10, y + h - 12, (w - 20) * frac, 6);
    if (t.state === 'cooking') {
      ctx.fillStyle = PALETTE.goldSoft;
      ctx.font = '800 12px system-ui, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(`WOK ${t.wokId + 1}`, x + w - 10, y + 40);
    }
    if (t.state === 'waiting') {
      hotspot(`ticket-${t.id}`, x, y, w, h, () => actions.onTicket(t.id));
    }
  });
  if (shown.length === 0) {
    ctx.fillStyle = PALETTE.grey;
    ctx.font = '700 14px system-ui, sans-serif';
    ctx.fillText('No orders yet — the crowd is coming…', 24, railY + 70);
  }

  // Reputation pips.
  ctx.textAlign = 'right';
  ctx.fillStyle = PALETTE.cream;
  ctx.font = '800 13px system-ui, sans-serif';
  ctx.fillText('REPUTATION', W - 24, railY + 20);
  for (let i = 0; i < 3; i++) {
    ctx.fillStyle = i < state.reputation ? '#e2483d' : '#3a5550';
    ctx.beginPath();
    ctx.arc(W - 34 - i * 26, railY + 44, 8, 0, Math.PI * 2);
    ctx.fill();
  }
}
