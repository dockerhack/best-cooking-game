// WOK HEI — the kitchen scene: wall, lanterns, three wok stations,
// the prep counter with ingredient bins, and the pass. Geometry lives
// here so clicks and drawing always agree.

import { H, PALETTE, W } from './config.js';
import { hotspot } from './input.js';
import { INGREDIENTS } from './recipes.js';

export const STATIONS = [
  { x: 90, y: 300, w: 330, h: 210 },
  { x: 475, y: 300, w: 330, h: 210 },
  { x: 860, y: 300, w: 330, h: 210 },
];
export const PASS = { x: 90, y: 596, w: 1100, h: 62 };
export const PREP = { x: 90, y: 522, w: 1100, h: 62 };

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

// One ingredient icon: a small drawn glyph, never an image file.
export function drawIngredient(ctx, ingId, x, y, r) {
  const ing = INGREDIENTS[ingId];
  if (!ing) return;
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = ing.color;
  ctx.strokeStyle = 'rgba(16,32,31,0.55)';
  ctx.lineWidth = 1.5;
  if (ing.shape === 'strand') {
    ctx.lineWidth = 3;
    ctx.strokeStyle = ing.color;
    ctx.beginPath();
    for (let i = 0; i < 3; i++) {
      ctx.moveTo(-r, -r + i * r);
      ctx.bezierCurveTo(-r * 0.3, -r + i * r - 4, r * 0.3, -r + i * r + 4, r, -r + i * r);
    }
    ctx.stroke();
  } else if (ing.shape === 'leaf') {
    ctx.beginPath();
    ctx.ellipse(0, 0, r, r * 0.55, -0.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  } else if (ing.shape === 'curl') {
    ctx.lineWidth = 3.5;
    ctx.strokeStyle = ing.color;
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.8, 0.4, Math.PI * 1.6);
    ctx.stroke();
  } else if (ing.shape === 'ring') {
    ctx.lineWidth = 4;
    ctx.strokeStyle = ing.color;
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.75, 0, Math.PI * 2);
    ctx.stroke();
  } else if (ing.shape === 'yolk') {
    ctx.fillStyle = '#fff3d6';
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = ing.color;
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.55, 0, Math.PI * 2);
    ctx.fill();
  } else if (ing.shape === 'pod') {
    ctx.beginPath();
    ctx.moveTo(-r, 0);
    ctx.quadraticCurveTo(0, -r * 1.2, r, 0);
    ctx.quadraticCurveTo(0, r * 0.5, -r, 0);
    ctx.fill();
  } else {
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.85, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }
  ctx.restore();
}

function drawLantern(ctx, x, y, t) {
  const glow = 0.75 + Math.sin(t * 2 + x) * 0.15;
  ctx.save();
  ctx.globalAlpha = glow;
  ctx.fillStyle = '#ff9a3d';
  ctx.beginPath();
  ctx.ellipse(x, y, 26, 34, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#e2483d';
  ctx.fillRect(x - 26, y - 6, 52, 5);
  ctx.fillRect(x - 26, y + 2, 52, 5);
  ctx.fillStyle = '#7a1f16';
  ctx.fillRect(x - 6, y - 40, 12, 7);
  ctx.restore();
}

function drawFlame(ctx, x, y, size, t, heat) {
  const f = 0.7 + Math.sin(t * 9 + x * 0.13) * 0.18 + (heat / 100) * 0.3;
  const h = size * f;
  ctx.save();
  ctx.globalAlpha = 0.9;
  ctx.fillStyle = '#ff7a1a';
  ctx.beginPath();
  ctx.moveTo(x - size * 0.55, y);
  ctx.quadraticCurveTo(x - size * 0.4, y - h * 0.7, x, y - h);
  ctx.quadraticCurveTo(x + size * 0.4, y - h * 0.7, x + size * 0.55, y);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#ffc23d';
  ctx.beginPath();
  ctx.moveTo(x - size * 0.3, y);
  ctx.quadraticCurveTo(x - size * 0.2, y - h * 0.45, x, y - h * 0.62);
  ctx.quadraticCurveTo(x + size * 0.2, y - h * 0.45, x + size * 0.3, y);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawWok(ctx, state, wok, st, t, actions, dimmed) {
  const cx = st.x + st.w / 2;
  const cy = st.y + 118;
  const selected = state.selectedWok === wok.id;
  // Station slab
  ctx.fillStyle = selected ? '#1d5257' : PALETTE.panel;
  ctx.strokeStyle = selected ? PALETTE.gold : PALETTE.panelEdge;
  ctx.lineWidth = selected ? 3 : 2;
  roundRect(ctx, st.x, st.y, st.w, st.h, 14);
  ctx.fill();
  ctx.stroke();

  // Burner flame under the wok; click it to cycle off / low / high.
  const flameY = cy + 52;
  if (wok.burner > 0 && !dimmed) {
    drawFlame(ctx, cx, flameY, wok.burner === 2 ? 30 : 20, t, wok.heat);
  } else {
    ctx.fillStyle = '#3a5550';
    ctx.beginPath();
    ctx.arc(cx, flameY - 8, 12, 0, Math.PI * 2);
    ctx.fill();
  }
  if (!dimmed) {
    hotspot(`burner-${wok.id}`, cx - 44, flameY - 46, 88, 56, () => actions.onBurner(wok.id));
  }

  // The wok bowl, lifted while tossing.
  const tossLift = wok.tossAnim > 0 ? Math.sin(wok.tossAnim * Math.PI) * -26 : 0;
  const wy = cy + tossLift;
  ctx.fillStyle = '#20262b';
  ctx.beginPath();
  ctx.ellipse(cx, wy, 92, 34, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#4a5a58';
  ctx.lineWidth = 3;
  ctx.stroke();
  // Food inside the wok.
  if (wok.recipe) {
    const n = wok.recipe.ings.length;
    wok.recipe.ings.forEach((ing, i) => {
      const a = (i / n) * Math.PI * 2 + 0.4;
      drawIngredient(ctx, ing, cx + Math.cos(a) * 42, wy - 4 + Math.sin(a) * 12, 11);
    });
    if (wok.state === 'burnt') {
      ctx.fillStyle = 'rgba(20,16,12,0.75)';
      ctx.beginPath();
      ctx.ellipse(cx, wy - 4, 78, 24, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Heat gauge: a vertical bar with the gold zone band.
  const gx = st.x + st.w - 34;
  const gy = st.y + 26;
  const gh = 150;
  ctx.fillStyle = '#0a1a1c';
  roundRect(ctx, gx, gy, 16, gh, 8);
  ctx.fill();
  if (wok.recipe) {
    const zone = state.goldZone(wok);
    const zy = gy + gh - (zone.hi / 100) * gh;
    const zh = ((zone.hi - zone.lo) / 100) * gh;
    ctx.fillStyle = 'rgba(245,185,66,0.85)';
    ctx.fillRect(gx, zy, 16, zh);
  }
  const hy = gy + gh - (wok.heat / 100) * gh;
  ctx.fillStyle = wok.heat > 92 ? '#e2483d' : wok.heat > 60 ? '#ff7a1a' : '#7fc96b';
  ctx.fillRect(gx - 3, hy - 3, 22, 6);
  ctx.fillStyle = PALETTE.cream;
  ctx.font = '700 11px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('HEAT', gx + 8, gy + gh + 16);

  // Status line under the wok.
  ctx.font = '800 15px system-ui, sans-serif';
  ctx.textAlign = 'center';
  if (wok.state === 'idle') {
    ctx.fillStyle = PALETTE.grey;
    ctx.fillText('EMPTY — click a ticket', cx, st.y + st.h - 12);
  } else if (wok.state === 'cooking') {
    const pct = Math.round(wok.progress * 100);
    ctx.fillStyle = PALETTE.goldSoft;
    ctx.fillText(`${wok.recipe.name} · ${pct}%`, cx, st.y + st.h - 12);
  } else if (wok.state === 'ready') {
    ctx.fillStyle = '#7fc96b';
    ctx.fillText('READY — click to plate!', cx, st.y + st.h - 12);
  } else if (wok.state === 'burnt') {
    ctx.fillStyle = '#e2483d';
    ctx.fillText('BURNT — click to bin it', cx, st.y + st.h - 12);
  }

  // Whole wok is clickable: toss when cooking, plate when ready, bin when burnt.
  if (!dimmed) {
    hotspot(`wok-${wok.id}`, st.x + 8, st.y + 8, st.w - 52, st.h - 16, () => actions.onWok(wok.id));
  }
  // Season button on the selected cooking wok.
  if (!dimmed && wok.state === 'cooking' && selected) {
    ctx.fillStyle = wok.seasoned ? '#3a5550' : PALETTE.gold;
    roundRect(ctx, st.x + 12, st.y + 12, 86, 26, 8);
    ctx.fill();
    ctx.fillStyle = wok.seasoned ? PALETTE.grey : PALETTE.ink;
    ctx.font = '800 12px system-ui, sans-serif';
    ctx.fillText(wok.seasoned ? 'SEASONED ✓' : 'SEASON [S]', st.x + 55, st.y + 29);
    if (!wok.seasoned) hotspot(`season-${wok.id}`, st.x + 12, st.y + 12, 86, 26, () => actions.onSeason(wok.id));
  }
}

export function drawKitchen(ctx, state, actions, dimmed) {
  const t = state.elapsed;
  // Wall + floor.
  ctx.fillStyle = PALETTE.bg;
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = '#0a2326';
  for (let x = 0; x < W; x += 64) {
    ctx.fillRect(x, 168, 2, 392);
  }
  ctx.fillStyle = '#0d2b2e';
  ctx.fillRect(0, 168, W, 4);
  // Awning stripes.
  for (let x = 0; x < W; x += 80) {
    ctx.fillStyle = (x / 80) % 2 === 0 ? '#a33b2e' : '#e8dcc8';
    ctx.fillRect(x, 150, 80, 18);
  }
  drawLantern(ctx, 60, 210, t);
  drawLantern(ctx, 1220, 210, t);

  // Stall sign.
  ctx.fillStyle = '#1d5257';
  roundRect(ctx, 430, 8, 420, 44, 10);
  ctx.fill();
  ctx.fillStyle = PALETTE.gold;
  ctx.font = '900 24px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('WOK HEI  ·  NIGHT MARKET', 640, 38);

  // Wok stations.
  state.woks.forEach((wok, i) => drawWok(ctx, state, wok, STATIONS[i], t, actions, dimmed));

  // Prep counter: the pantry, always visible, with the active dish's
  // ingredients lit up.
  ctx.fillStyle = PALETTE.panel;
  roundRect(ctx, PREP.x, PREP.y, PREP.w, PREP.h, 12);
  ctx.fill();
  ctx.strokeStyle = PALETTE.panelEdge;
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.fillStyle = PALETTE.cream;
  ctx.font = '800 13px system-ui, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('PREP COUNTER', PREP.x + 14, PREP.y + 24);
  const pantry = ['rice', 'noodle', 'chicken', 'prawn', 'tofu', 'egg', 'greens', 'chilli', 'garlic', 'mushroom'];
  const activeIngs = new Set();
  state.woks.forEach((w) => {
    if (w.recipe) w.recipe.ings.forEach((ing) => activeIngs.add(ing));
  });
  pantry.forEach((ing, i) => {
    const x = PREP.x + 170 + i * 88;
    const y = PREP.y + 32;
    ctx.globalAlpha = activeIngs.has(ing) ? 1 : 0.45;
    drawIngredient(ctx, ing, x, y, 13);
    ctx.globalAlpha = 1;
    ctx.fillStyle = activeIngs.has(ing) ? PALETTE.goldSoft : PALETTE.grey;
    ctx.font = '700 10px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(ing.toUpperCase(), x, y + 26);
  });

  // The pass: plated dishes waiting to be served.
  ctx.fillStyle = '#16323a';
  roundRect(ctx, PASS.x, PASS.y, PASS.w, PASS.h, 12);
  ctx.fill();
  ctx.strokeStyle = PALETTE.panelEdge;
  ctx.stroke();
  ctx.fillStyle = PALETTE.cream;
  ctx.font = '800 13px system-ui, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('PASS — click a plate to serve', PASS.x + 14, PASS.y + 24);
  state.pass.forEach((dish, i) => {
    const x = PASS.x + 330 + i * 150;
    const y = PASS.y + 31;
    ctx.fillStyle = '#fff3d6';
    ctx.beginPath();
    ctx.ellipse(x, y, 52, 18, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#c9b8a3';
    ctx.lineWidth = 2;
    ctx.stroke();
    dish.recipe.ings.forEach((ing, j) => {
      drawIngredient(ctx, ing, x - 30 + j * 20, y - 4, 8);
    });
    if (!dimmed) hotspot(`pass-${i}`, x - 56, y - 22, 112, 44, () => actions.onServe(i));
  });
  if (state.pass.length === 0) {
    ctx.fillStyle = PALETTE.grey;
    ctx.font = '700 13px system-ui, sans-serif';
    ctx.fillText('no plates yet — finish a dish, then plate it', PASS.x + 330, PASS.y + 36);
  }
}
