// WOK HEI — boot, state and the simulation step. The screen flow is:
// title -> playing <-> paused -> nightComplete -> shop -> next night
// ... -> victory after night 5, or gameover when reputation runs out.
// Every action the player takes goes through the `actions` object the
// renderers call, so clicks, keys and the autopilot share one path.

import { COMBO_FULL, NIGHTS, PASS_BASE, REPUTATION, UPGRADES } from './config.js';
import { initAudio, setMuted, setSizzle, sfx } from './audio.js';
import { addCallout, flashScreen, shakeScreen, updateCallouts } from './feel.js';
import { startLoop } from './fixed-step-loop.js';
import { goldZone } from './heat.js';
import { attach, consumeKey, drainKeys } from './input.js';
import { assignTicket, makeTicket, serveDish, updateTickets, waitingTickets } from './orders.js';
import { spawnBurst, spawnSteam, updateParticles } from './particles.js';
import { drawGame, setupCanvas } from './render.js';
import { STATIONS } from './render-kitchen.js';
import { loadSave, recordNight } from './save.js';
import { stageShot } from './shots.js';
import { makeRng } from './random.js';
import { recipesForNight } from './recipes.js';
import { starsFor, tipFrac } from './customers.js';
import { binWok, newWok, seasonWok, startDish, tossWok, updateWok } from './wok.js';

export function createState(night, seed) {
  const nightDef = NIGHTS[night - 1];
  const state = {
    screen: 'title',
    night,
    nightDef,
    seed,
    rng: makeRng(seed * 7919 + night * 131),
    customers: [
      'Auntie Mei', 'Uncle Bo', 'Siti', 'Pak Rudi', 'Mei-Lin', 'Dewi',
      'Ah Kong', 'Lina', 'Budi', 'Grace', 'Mr. Tan', 'Yuki', 'Fajar', 'Nora',
    ],
    elapsed: 0,
    timeLeft: nightDef.duration,
    score: 0,
    tips: 0,
    combo: 0,
    hei: 0,
    streak: 0,
    bestStreak: 0,
    woks: [newWok(0), newWok(1), newWok(2)],
    tickets: [],
    pass: [],
    upgrades: {},
    particles: [],
    callouts: [],
    shake: 0,
    flash: 0,
    selectedWok: 0,
    reputation: REPUTATION,
    served: 0,
    expired: 0,
    totalTickets: 0,
    spawnTimer: 3,
    surgeActive: false,
    surgeTimer: 0,
    surgeDone: false,
    spiceUsed: false,
    save: loadSave(),
    muted: false,
    nightResult: null,
    shopChoices: [],
    nightStartScore: 0,
    nightStartTips: 0,
  };
  state.goldZone = (wok) => goldZone(wok.recipe, wok.progress, state.upgrades);
  return state;
}

function wokCenter(id) {
  const st = STATIONS[id];
  return { x: st.x + st.w / 2, y: st.y + 100 };
}

function startNight(state, night) {
  const fresh = createState(night, state.seed + night * 17);
  fresh.score = state.score;
  fresh.tips = state.tips;
  fresh.bestStreak = state.bestStreak;
  fresh.upgrades = { ...state.upgrades };
  fresh.save = state.save;
  fresh.muted = state.muted;
  fresh.screen = 'playing';
  fresh.nightStartScore = state.score;
  fresh.nightStartTips = state.tips;
  return fresh;
}

function endNight(state, finished) {
  const total = state.totalTickets;
  const stars = starsFor(state.served, total);
  const menu = recipesForNight(state.night + 1);
  const unlocked =
    state.night < 5 && menu.length > recipesForNight(state.night).length
      ? menu[recipesForNight(state.night).length].name
      : null;
  state.nightResult = {
    stars,
    served: state.served,
    total,
    score: state.score - state.nightStartScore,
    tips: state.tips - state.nightStartTips,
    bestStreak: state.bestStreak,
    unlocked,
  };
  state.save = recordNight(state.save, state.night, stars, state.score, state.bestStreak);
  state.screen = 'nightComplete';
  sfx.star();
}

function step(state, dt) {
  state.elapsed += dt;
  updateParticles(state.particles, dt);
  updateCallouts(state, dt);
  if (state.screen !== 'playing') return;

  // Keyboard.
  if (consumeKey('Digit1')) state.selectedWok = 0;
  if (consumeKey('Digit2')) state.selectedWok = 1;
  if (consumeKey('Digit3')) state.selectedWok = 2;
  if (consumeKey('Space')) actions.tossSelected(state);
  if (consumeKey('KeyS')) actions.seasonSelected(state);
  if (consumeKey('KeyP')) state.screen = 'paused';
  if (consumeKey('KeyM')) actions.toggleMute(state);

  state.timeLeft -= dt;

  // Rush-hour surge: tickets arrive twice as fast for 20 seconds.
  if (state.nightDef.surgeAt > 0 && !state.surgeDone && state.elapsed >= state.nightDef.surgeAt) {
    state.surgeActive = true;
    state.surgeTimer = 20;
    state.surgeDone = true;
    addCallout(state, 'RUSH HOUR!', 640, 260, '#ff7a1a');
    shakeScreen(state, 0.4);
  }
  if (state.surgeActive) {
    state.surgeTimer -= dt;
    if (state.surgeTimer <= 0) state.surgeActive = false;
  }

  // Ticket spawns.
  state.spawnTimer -= dt;
  const interval = state.surgeActive ? state.nightDef.spawnEvery / 2 : state.nightDef.spawnEvery;
  if (state.spawnTimer <= 0 && waitingTickets(state).length < 5) {
    const t = makeTicket(state);
    state.tickets.push(t);
    state.totalTickets += 1;
    state.spawnTimer = interval;
  }

  // Tickets age; an expired one costs reputation.
  const expiredBefore = state.expired;
  updateTickets(state, dt);
  if (state.expired > expiredBefore) {
    addCallout(state, 'ORDER LOST', 640, 300, '#e2483d');
    shakeScreen(state, 0.35);
    sfx.burn();
  }

  // Woks cook, burn, finish.
  let cooking = 0;
  for (const wok of state.woks) {
    if (wok.state === 'cooking') cooking++;
    const prev = wok.state;
    updateWok(wok, dt, state.upgrades);
    if (prev === 'cooking' && wok.state === 'ready') {
      const c = wokCenter(wok.id);
      addCallout(state, 'READY!', c.x, c.y - 60, '#7fc96b');
      sfx.ding();
    }
    if (prev === 'cooking' && wok.state === 'burnt') {
      const c = wokCenter(wok.id);
      addCallout(state, 'BURNT!', c.x, c.y - 60, '#e2483d');
      state.combo = 0;
      state.streak = 0;
      shakeScreen(state, 0.3);
      sfx.burn();
    }
    if (wok.state === 'cooking' && state.rng.next() < dt * 2) {
      const c = wokCenter(wok.id);
      spawnSteam(state.particles, c.x, c.y - 30);
    }
  }
  setSizzle(cooking / 3);

  if (state.reputation <= 0) {
    state.screen = 'gameover';
    return;
  }
  if (state.timeLeft <= 0) {
    endNight(state, true);
  }
}

// The step function above is the whole simulation; the actions below
// are the only way the player (or the autopilot) changes it.

const actions = {
  onStart(state) {
    initAudio();
    sfx.click();
    return startNight(state, 1);
  },
  onHowTo(state) {
    state.screen = 'howto';
    return state;
  },
  onBack(state) {
    state.screen = 'title';
    return state;
  },
  onPause(state) {
    if (state.screen === 'playing') state.screen = 'paused';
    else if (state.screen === 'paused') state.screen = 'playing';
    return state;
  },
  onResume(state) {
    state.screen = 'playing';
    return state;
  },
  onMute(state) {
    state.muted = !state.muted;
    setMuted(state.muted);
    return state;
  },
  toggleMute(state) {
    return actions.onMute(state);
  },
  onRestart() {
    const fresh = createState(1, (Math.random() * 1e9) | 0);
    fresh.screen = 'title';
    return fresh;
  },
  onTitle() {
    const fresh = createState(1, (Math.random() * 1e9) | 0);
    fresh.screen = 'title';
    return fresh;
  },
  onTicket(state, id) {
    const ticket = state.tickets.find((t) => t.id === id && t.state === 'waiting');
    if (!ticket) return state;
    const wok = assignTicket(state, ticket);
    if (!wok) {
      addCallout(state, 'NO FREE WOK!', 640, 300, '#e2483d');
      return state;
    }
    const autoSeason = !!state.upgrades.spice && !state.spiceUsed;
    if (autoSeason) state.spiceUsed = true;
    startDish(wok, ticket.recipe, autoSeason);
    state.selectedWok = wok.id;
    sfx.click();
    return state;
  },
  onWok(state, id) {
    const wok = state.woks[id];
    state.selectedWok = id;
    if (wok.state === 'cooking') return actions.tossWok(state, wok);
    if (wok.state === 'ready') return actions.plateWok(state, wok);
    if (wok.state === 'burnt') {
      binWok(wok);
      addCallout(state, 'BINNED', wokCenter(id).x, wokCenter(id).y - 60, '#8fa8a3');
      sfx.click();
    }
    return state;
  },
  tossWok(state, wok) {
    const result = tossWok(wok, state.upgrades);
    const c = wokCenter(wok.id);
    if (result === 'perfect') {
      state.combo += 1;
      state.streak += 1;
      state.bestStreak = Math.max(state.bestStreak, state.streak);
      state.hei = Math.min(10, state.hei + 1);
      spawnBurst(state.particles, c.x, c.y - 20, 'flame', 14);
      if (state.combo >= COMBO_FULL) {
        addCallout(state, 'FULL HEI! ×2', c.x, c.y - 110, '#ffc23d');
        flashScreen(state, 0.5);
      } else {
        addCallout(state, 'PERFECT TOSS!', c.x, c.y - 110, '#ffd97a');
      }
      shakeScreen(state, 0.2);
      sfx.perfect();
    } else if (result === 'ok') {
      state.combo = 0;
      state.streak = 0;
      spawnSteam(state.particles, c.x, c.y - 20);
      sfx.toss();
    }
    return state;
  },
  tossSelected(state) {
    return actions.tossWok(state, state.woks[state.selectedWok]);
  },
  seasonSelected(state) {
    const wok = state.woks[state.selectedWok];
    if (wok.state !== 'cooking') return state;
    const ok = seasonWok(wok, state.upgrades);
    const c = wokCenter(wok.id);
    if (ok) {
      addCallout(state, 'SEASONED +15%', c.x, c.y - 80, '#7fc96b');
      sfx.ding();
    } else if (!wok.seasoned) {
      addCallout(state, 'TOO EARLY — SEASON IN THE GOLD', c.x, c.y - 80, '#e2483d');
    }
    return state;
  },
  onSeason(state, id) {
    state.selectedWok = id;
    return actions.seasonSelected(state);
  },
  onBurner(state, id) {
    const wok = state.woks[id];
    wok.burner = (wok.burner + 1) % 3;
    sfx.click();
    return state;
  },
  plateWok(state, wok) {
    const maxPass = PASS_BASE + (state.upgrades.pass ? 2 : 0);
    if (state.pass.length >= maxPass) {
      addCallout(state, 'PASS FULL — SERVE A PLATE', 640, 300, '#e2483d');
      return state;
    }
    const ticket = state.tickets.find((t) => t.wokId === wok.id && t.state === 'cooking');
    const patienceFrac = ticket ? tipFrac(ticket.patience, ticket.maxPatience) : 0.5;
    state.pass.push({ recipe: wok.recipe, quality: wok.quality, ticketId: ticket ? ticket.id : -1, patienceFrac });
    if (ticket) ticket.state = 'plated';
    wok.state = 'idle';
    wok.recipe = null;
    wok.progress = 0;
    wok.heat = 18;
    sfx.click();
    return state;
  },
  onServe(state, i) {
    const dish = state.pass[i];
    if (!dish) return state;
    const points = serveDish(state, i);
    const c = { x: 330 + i * 150 + 240, y: 620 };
    addCallout(state, `+${points}`, c.x, c.y - 40, '#ffd97a');
    sfx.serve();
    return state;
  },
  onNightNext(state) {
    if (state.night >= 5) {
      state.screen = 'victory';
      return state;
    }
    const owned = Object.keys(state.upgrades);
    const pool = UPGRADES.filter((u) => !owned.includes(u.id));
    state.shopChoices = state.rng.shuffle(pool).slice(0, 3);
    state.screen = 'shop';
    return state;
  },
  onShopPick(state, id) {
    state.upgrades[id] = true;
    return startNight(state, state.night + 1);
  },
};

let booted = false;

function boot() {
  // Module scripts run before DOMContentLoaded fires, so the readyState
  // check below AND the listener would both fire: guard against a
  // double boot, which would attach two click listeners (every click
  // dispatching twice) and run two simulation loops at 2x speed.
  if (booted) return;
  booted = true;
  const canvas = document.getElementById('game');
  setupCanvas(canvas);
  attach(canvas);
  const ctx = canvas.getContext('2d');
  let state = createState(1, 20261125);

  // Actions mutate state; several return a fresh state (night changes).
  const bound = {};
  for (const key of Object.keys(actions)) {
    bound[key] = (...args) => {
      const next = actions[key](state, ...args);
      if (next && next !== state) state = next;
      return state;
    };
  }

  const params = new URLSearchParams(location.search);
  if (params.has('shot')) {
    const name = params.get('shot') || 'cover';
    const seed = Number(params.get('seed') || 1);
    state = stageShot(createState, name, seed);
    drawGame(ctx, state, bound);
    drawGame(ctx, state, bound);
    window.__shotReady = true;
    return;
  }

  drainKeys();
  startLoop(
    (dt) => {
      step(state, dt);
    },
    () => {
      drawGame(ctx, state, bound);
    },
  );
}

document.addEventListener('DOMContentLoaded', boot);
if (document.readyState !== 'loading') boot();
