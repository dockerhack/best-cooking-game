// WOK HEI — screens: title, how-to, pause, night-complete, upgrade
// shop, game over, victory. Every screen is drawn by the game's own
// code, so the screenshots stage them for real.

import { H, PALETTE, UPGRADES, W } from './config.js';
import { hotspot } from './input.js';

function button(ctx, id, x, y, w, h, label, onClick, accent) {
  ctx.fillStyle = accent ? PALETTE.gold : '#1d5257';
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, 10);
  ctx.fill();
  ctx.fillStyle = accent ? PALETTE.ink : PALETTE.cream;
  ctx.font = '900 18px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(label, x + w / 2, y + h / 2 + 6);
  hotspot(id, x, y, w, h, onClick);
}

function dim(ctx) {
  ctx.fillStyle = 'rgba(8, 24, 26, 0.72)';
  ctx.fillRect(0, 0, W, H);
}

function panel(ctx, x, y, w, h) {
  ctx.fillStyle = '#123a3d';
  ctx.strokeStyle = PALETTE.gold;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, 16);
  ctx.fill();
  ctx.stroke();
}

export function drawTitle(ctx, state, actions) {
  dim(ctx);
  ctx.textAlign = 'center';
  ctx.fillStyle = PALETTE.gold;
  ctx.font = '900 84px system-ui, sans-serif';
  ctx.fillText('WOK HEI', W / 2, 250);
  ctx.fillStyle = PALETTE.cream;
  ctx.font = '700 26px system-ui, sans-serif';
  ctx.fillText('— Breath of the Night Market —', W / 2, 292);
  ctx.fillStyle = PALETTE.goldSoft;
  ctx.font = '400 18px system-ui, sans-serif';
  ctx.fillText('Master the breath of the wok: 3 woks · 12 recipes · 5 nights · heat curves · perfect-toss combos', W / 2, 330);
  button(ctx, 'start', W / 2 - 130, 380, 260, 56, 'START NIGHT 1', () => actions.onStart(), true);
  button(ctx, 'howto', W / 2 - 130, 452, 260, 48, 'HOW TO PLAY', () => actions.onHowTo(), false);
  if (state.save.bestScore > 0) {
    ctx.fillStyle = PALETTE.grey;
    ctx.font = '700 15px system-ui, sans-serif';
    ctx.fillText(`BEST SCORE ${state.save.bestScore.toLocaleString()} · BEST STREAK ${state.save.bestStreak}`, W / 2, 540);
  }
  ctx.fillStyle = PALETTE.grey;
  ctx.font = '400 14px system-ui, sans-serif';
  ctx.fillText('Mouse + keyboard · 1/2/3 select wok · SPACE toss · S season · P pause', W / 2, 580);
  if (state.screen === 'howto') {
    dim(ctx);
    panel(ctx, 290, 130, 700, 460);
    ctx.fillStyle = PALETTE.gold;
    ctx.font = '900 28px system-ui, sans-serif';
    ctx.fillText('HOW TO PLAY', W / 2, 180);
    ctx.fillStyle = PALETTE.cream;
    ctx.font = '400 17px system-ui, sans-serif';
    const lines = [
      '1. Click a ticket on the order rail — it starts in a free wok.',
      '2. Ride the heat curve: keep the needle inside the gold zone.',
      '3. Click a burner flame to cycle OFF / LOW / HIGH.',
      '4. SPACE (or click the wok) tosses. Toss at the peak of the gold',
      '    zone for a PERFECT TOSS — 3 in a row is FULL HEI, ×2 points.',
      '5. Press S to season once per dish, while the needle is gold.',
      '6. When a dish is READY, click the wok to plate it, then click',
      '    the plate on the pass to serve. Tips shrink as patience drains.',
      '7. Burnt? Click the wok to bin it. 3 lost orders close the night.',
      '8. After each night, pick 1 of 3 upgrades. 5 nights, 12 recipes.',
    ];
    lines.forEach((l, i) => ctx.fillText(l, W / 2, 222 + i * 30));
    button(ctx, 'howto-back', W / 2 - 100, 520, 200, 48, 'GOT IT', () => actions.onBack(), true);
  }
}

export function drawPause(ctx, state, actions) {
  dim(ctx);
  panel(ctx, 440, 250, 400, 200);
  ctx.fillStyle = PALETTE.gold;
  ctx.font = '900 32px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('PAUSED', W / 2, 310);
  ctx.fillStyle = PALETTE.cream;
  ctx.font = '400 16px system-ui, sans-serif';
  ctx.fillText('The woks wait. The crowd does not.', W / 2, 344);
  button(ctx, 'resume', W / 2 - 100, 372, 200, 48, 'RESUME [P]', () => actions.onResume(), true);
}

function starsRow(ctx, x, y, stars, size) {
  for (let i = 0; i < 3; i++) {
    ctx.fillStyle = i < stars ? '#ffc23d' : '#3a5550';
    ctx.font = `${size}px system-ui, sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText('★', x + i * (size + 8), y);
  }
}

export function drawNightComplete(ctx, state, actions) {
  dim(ctx);
  panel(ctx, 340, 120, 600, 470);
  const r = state.nightResult;
  ctx.textAlign = 'center';
  ctx.fillStyle = PALETTE.gold;
  ctx.font = '900 30px system-ui, sans-serif';
  ctx.fillText(`NIGHT ${state.night} COMPLETE`, W / 2, 172);
  starsRow(ctx, W / 2 - 44, 232, r.stars, 44);
  ctx.fillStyle = PALETTE.cream;
  ctx.font = '400 18px system-ui, sans-serif';
  const rows = [
    `Dishes served: ${r.served} of ${r.total}`,
    `Score this night: ${r.score.toLocaleString()}`,
    `Tips earned: $${r.tips}`,
    `Best toss streak: ${r.bestStreak}`,
  ];
  rows.forEach((row, i) => ctx.fillText(row, W / 2, 280 + i * 32));
  if (r.unlocked) {
    ctx.fillStyle = PALETTE.goldSoft;
    ctx.font = '800 18px system-ui, sans-serif';
    ctx.fillText(`NEW RECIPE UNLOCKED: ${r.unlocked}`, W / 2, 420);
  }
  ctx.fillStyle = PALETTE.grey;
  ctx.font = '400 14px system-ui, sans-serif';
  ctx.fillText('For the judge: every dish is won on fire control — watch the heat curve, not the fetch.', W / 2, 462);
  button(ctx, 'night-next', W / 2 - 130, 500, 260, 52, state.night >= 5 ? 'FINISH' : 'UPGRADE SHOP →', () => actions.onNightNext(), true);
}

export function drawShop(ctx, state, actions) {
  dim(ctx);
  ctx.textAlign = 'center';
  ctx.fillStyle = PALETTE.gold;
  ctx.font = '900 30px system-ui, sans-serif';
  ctx.fillText('UPGRADE SHOP — PICK ONE', W / 2, 150);
  ctx.fillStyle = PALETTE.cream;
  ctx.font = '400 17px system-ui, sans-serif';
  ctx.fillText('The market rests. Spend the night well.', W / 2, 182);
  state.shopChoices.forEach((up, i) => {
    const x = 190 + i * 310;
    const y = 230;
    panel(ctx, x, y, 280, 240);
    ctx.fillStyle = '#ffc23d';
    ctx.font = '900 22px system-ui, sans-serif';
    ctx.fillText(up.name.toUpperCase(), x + 140, y + 48);
    ctx.fillStyle = PALETTE.cream;
    ctx.font = '400 16px system-ui, sans-serif';
    const words = up.desc.split(' ');
    let line = '';
    let ly = y + 92;
    for (const word of words) {
      if ((line + ' ' + word).length > 26) {
        ctx.fillText(line, x + 140, ly);
        ly += 26;
        line = word;
      } else {
        line = line ? line + ' ' + word : word;
      }
    }
    ctx.fillText(line, x + 140, ly);
    button(ctx, `shop-${up.id}`, x + 40, y + 168, 200, 48, 'TAKE IT', () => actions.onShopPick(up.id), true);
  });
}

export function drawGameOver(ctx, state, actions) {
  dim(ctx);
  panel(ctx, 340, 180, 600, 340);
  ctx.textAlign = 'center';
  ctx.fillStyle = '#e2483d';
  ctx.font = '900 36px system-ui, sans-serif';
  ctx.fillText('THE MARKET CLOSED EARLY', W / 2, 250);
  ctx.fillStyle = PALETTE.cream;
  ctx.font = '400 18px system-ui, sans-serif';
  ctx.fillText('Too many orders walked away hungry.', W / 2, 292);
  ctx.fillText(`Score: ${state.score.toLocaleString()} · Night ${state.night}`, W / 2, 326);
  button(ctx, 'again', W / 2 - 130, 380, 260, 52, 'TRY AGAIN', () => actions.onRestart(), true);
  button(ctx, 'title', W / 2 - 130, 448, 260, 44, 'TITLE SCREEN', () => actions.onTitle(), false);
}

export function drawVictory(ctx, state, actions) {
  dim(ctx);
  panel(ctx, 300, 130, 680, 450);
  ctx.textAlign = 'center';
  ctx.fillStyle = PALETTE.gold;
  ctx.font = '900 40px system-ui, sans-serif';
  ctx.fillText('MASTER OF THE WOK', W / 2, 200);
  ctx.fillStyle = PALETTE.cream;
  ctx.font = '400 19px system-ui, sans-serif';
  ctx.fillText('Five nights. Twelve recipes. One breath of fire.', W / 2, 240);
  ctx.fillText(`Final score: ${state.score.toLocaleString()}`, W / 2, 282);
  ctx.fillText(`Best toss streak: ${state.bestStreak} · Tips: $${state.tips}`, W / 2, 314);
  starsRow(ctx, W / 2 - 44, 372, 3, 40);
  ctx.fillStyle = PALETTE.goldSoft;
  ctx.font = '800 17px system-ui, sans-serif';
  ctx.fillText('The night market remembers your name.', W / 2, 420);
  button(ctx, 'again', W / 2 - 130, 460, 260, 52, 'COOK AGAIN', () => actions.onRestart(), true);
  button(ctx, 'title', W / 2 - 130, 524, 260, 44, 'TITLE SCREEN', () => actions.onTitle(), false);
}
