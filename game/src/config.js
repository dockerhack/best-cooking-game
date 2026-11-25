// WOK HEI — shared constants: canvas, palette, nights, tuning.
// Night market at dusk: dark teal, orange flame, gold callouts.

export const W = 1280;
export const H = 720;

export const PALETTE = {
  bg: '#0d2b2e',
  bgDeep: '#082024',
  panel: '#123a3d',
  panelEdge: '#1d5257',
  gold: '#f5b942',
  goldSoft: '#ffd97a',
  flame: '#ff7a1a',
  flameHot: '#ffc23d',
  ember: '#e2483d',
  cream: '#fff3d6',
  ink: '#10201f',
  teal: '#2e8b8b',
  green: '#7fc96b',
  red: '#e2483d',
  grey: '#8fa8a3',
};

// One night of service: how long the shift runs, how fast tickets arrive,
// how long customers wait, which recipes are on the menu, when the surge hits.
export const NIGHTS = [
  { name: 'First Lanterns', duration: 120, spawnEvery: 14, patience: 55, unlock: 4, surgeAt: -1 },
  { name: 'Friday Crowd', duration: 135, spawnEvery: 12, patience: 50, unlock: 6, surgeAt: -1 },
  { name: 'Festival Night', duration: 150, spawnEvery: 10, patience: 45, unlock: 8, surgeAt: 75 },
  { name: 'Typhoon Eve', duration: 150, spawnEvery: 9, patience: 40, unlock: 10, surgeAt: 70 },
  { name: 'Grand Finale', duration: 165, spawnEvery: 8, patience: 38, unlock: 12, surgeAt: 60 },
];

export const PASS_BASE = 2; // plated dishes the pass holds before the upgrade
export const REPUTATION = 3; // expired tickets a night tolerates before closing early
export const MAX_TICKETS = 5; // tickets the rail holds at once
export const BURN_HEAT = 92; // heat above this starts burning the dish
export const BURN_GRACE = 2.5; // seconds above BURN_HEAT before the dish is ruined
export const COMBO_FULL = 3; // perfect tosses in a row that trigger FULL HEI

// Upgrade shop: pick one after each night. Each is a named system the
// judge can see in the results screen and in the source outline.
export const UPGRADES = [
  { id: 'burner', name: 'Dragon Burner', desc: 'Flames run hotter — heat rises 30% faster.' },
  { id: 'gold', name: 'Wide Gold Zone', desc: 'The gold zone is 10 points wider on every recipe.' },
  { id: 'spice', name: 'Spice Rack', desc: 'One free auto-season on every dish, every night.' },
  { id: 'pass', name: 'Bigger Pass', desc: 'The pass holds 2 more plated dishes.' },
  { id: 'cool', name: 'Cool Hands', desc: 'Dishes survive 1.5s longer above the burn line.' },
];
