// WOK HEI — shot staging. `?shot=<name>&seed=N` builds a scene by
// playing the real rules forward from a fresh world with a simple
// autopilot, then freezes it: the screenshot is a real frame of the
// game's own code, never edited or composited.

import { MAX_TICKETS } from './config.js';
import { goldZone } from './heat.js';
import { makeTicket } from './orders.js';
import { spawnBurst, spawnSteam, updateParticles } from './particles.js';
import { addCallout, updateCallouts } from './feel.js';
import { STATIONS } from './render-kitchen.js';
import { startDish, tossWok, updateWok } from './wok.js';

// The autopilot plays the rules: steer each wok's burner toward the
// middle of its gold zone, toss in the gold, plate when ready, serve
// when the pass is full.
function autopilot(state, dt) {
  state.spawnTimer -= dt;
  if (state.spawnTimer <= 0 && state.tickets.filter((t) => t.state === 'waiting').length < MAX_TICKETS) {
    const t = makeTicket(state);
    state.tickets.push(t);
    state.totalTickets += 1;
    state.spawnTimer = state.nightDef.spawnEvery;
  }
  for (const t of state.tickets) {
    if (t.state !== 'waiting') continue;
    const wok = state.woks.find((w) => w.state === 'idle');
    if (!wok) break;
    t.state = 'cooking';
    t.wokId = wok.id;
    startDish(wok, t.recipe, false);
  }
  for (const wok of state.woks) {
    if (wok.state !== 'cooking') continue;
    const zone = goldZone(wok.recipe, wok.progress, state.upgrades);
    const mid = (zone.lo + zone.hi) / 2;
    wok.burner = wok.heat < mid - 4 ? 2 : wok.heat > mid + 4 ? 1 : wok.burner;
    if (wok.heat >= zone.lo && wok.heat <= zone.hi && wok.tossCooldown <= 0) {
      tossWok(wok, state.upgrades);
    }
  }
  for (const wok of state.woks) {
    const prev = wok.state;
    updateWok(wok, dt, state.upgrades);
    if (prev === 'cooking' && wok.state === 'ready') {
      const maxPass = 2 + (state.upgrades.pass ? 2 : 0);
      if (state.pass.length < maxPass) {
        const ticket = state.tickets.find((t) => t.wokId === wok.id && t.state === 'cooking');
        state.pass.push({ recipe: wok.recipe, quality: wok.quality, ticketId: ticket ? ticket.id : -1, patienceFrac: 0.7 });
        if (ticket) ticket.state = 'plated';
        wok.state = 'idle';
        wok.recipe = null;
        wok.progress = 0;
        wok.heat = 18;
      }
    }
  }
  updateParticles(state.particles, dt);
  updateCallouts(state, dt);
}

function runFor(state, seconds) {
  const steps = Math.round(seconds * 60);
  for (let i = 0; i < steps; i++) {
    state.elapsed += 1 / 60;
    state.timeLeft = Math.max(0, state.timeLeft - 1 / 60);
    autopilot(state, 1 / 60);
  }
}

function flameAt(state, wokId) {
  const st = STATIONS[wokId];
  spawnBurst(state.particles, st.x + st.w / 2, st.y + 90, 'flame', 16);
}

export function stageShot(createState, name, seed) {
  if (name === 'cover') {
    const state = createState(3, seed);
    state.screen = 'playing';
    state.score = 1840;
    state.hei = 7;
    state.combo = 2;
    runFor(state, 26);
    state.timeLeft = 62;
    // Fill the rail: two more waiting tickets so the order board reads full.
    while (state.tickets.filter((t) => t.state === 'waiting').length < 2) {
      state.tickets.push(makeTicket(state));
    }
    // Freeze one wok mid-toss with a flame burst and a callout.
    const wok = state.woks.find((w) => w.state === 'cooking') || state.woks[1];
    wok.tossAnim = 0.6;
    flameAt(state, wok.id);
    const st = STATIONS[wok.id];
    // Callout sits above the station's top edge, clear of the SEASON button.
    addCallout(state, 'PERFECT TOSS!', st.x + st.w / 2, st.y - 10, '#ffd97a');
    // Guarantee a plate on the pass for the cover.
    if (state.pass.length === 0) {
      const recipe = state.tickets[0] ? state.tickets[0].recipe : null;
      if (recipe) state.pass.push({ recipe, quality: 0.92, ticketId: -1, patienceFrac: 0.8 });
    }
    return state;
  }

  if (name === 'heat') {
    const state = createState(2, seed);
    state.screen = 'playing';
    state.score = 420;
    state.hei = 4;
    state.combo = 1;
    state.timeLeft = 88;
    runFor(state, 9);
    // Start a second dish in a free wok so the heat moment is not lonely.
    const extra = makeTicket(state);
    state.tickets.push(extra);
    const free = state.woks.find((w) => w.state === 'idle');
    if (free) {
      extra.state = 'cooking';
      extra.wokId = free.id;
      startDish(free, extra.recipe, false);
    }
    const wok = state.woks[0];
    if (wok.state === 'cooking') {
      const zone = goldZone(wok.recipe, wok.progress, state.upgrades);
      wok.heat = (zone.lo + zone.hi) / 2;
      wok.tossAnim = 0.55;
      flameAt(state, 0);
      const st = STATIONS[0];
      addCallout(state, 'PERFECT TOSS!', st.x + st.w / 2, st.y - 10, '#ffd97a');
    }
    return state;
  }

  if (name === 'rush') {
    const state = createState(4, seed);
    state.screen = 'playing';
    state.score = 3120;
    state.hei = 9;
    state.combo = 3;
    state.streak = 3;
    state.bestStreak = 3;
    runFor(state, 34);
    state.timeLeft = 34;
    // A full rail with patience nearly gone: top the rail up with fresh
    // waiting tickets first, then drain their patience bars.
    while (state.tickets.filter((t) => t.state === 'waiting').length < 3) {
      state.tickets.push(makeTicket(state));
    }
    for (const t of state.tickets) {
      if (t.state === 'waiting') t.patience = Math.min(t.patience, 7 + state.rng.range(0, 5));
    }
    // One burnt wok, smoking.
    const burnt = state.woks.find((w) => w.state === 'cooking');
    if (burnt) {
      burnt.state = 'burnt';
      const st = STATIONS[burnt.id];
      for (let i = 0; i < 6; i++) spawnSteam(state.particles, st.x + st.w / 2, st.y + 80);
    }
    addCallout(state, 'FULL HEI! ×2', 640, 300, '#ffc23d');
    return state;
  }

  if (name === 'night') {
    const state = createState(3, seed);
    state.score = 6420;
    state.tips = 380;
    state.bestStreak = 5;
    state.nightResult = {
      stars: 3,
      served: 14,
      total: 15,
      score: 6420,
      tips: 380,
      bestStreak: 5,
      unlocked: 'Beef Chow Fun',
    };
    state.screen = 'nightComplete';
    return state;
  }

  // Unknown shot name: plain title screen.
  const state = createState(1, seed);
  state.screen = 'title';
  return state;
}
