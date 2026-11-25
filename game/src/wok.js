// WOK HEI — one wok station. A wok holds a dish through its states:
// idle -> cooking -> ready -> (plated) ; cooking -> burnt -> (binned).
// Heat is the whole game: ride the gold zone, toss at its peak, season
// once at the golden moment.

import { BURN_GRACE, BURN_HEAT } from './config.js';
import { cookRate, goldZone, heatStep, inGoldZone } from './heat.js';

export function newWok(id) {
  return {
    id,
    state: 'idle', // idle | cooking | ready | burnt
    recipe: null,
    progress: 0,
    goldTime: 0,
    heat: 18,
    burner: 1, // 0 off | 1 low | 2 high
    quality: 0.6,
    seasoned: false,
    burnTimer: 0,
    tossCooldown: 0,
    tossAnim: 0, // 0..1, drives the toss arc in the renderer
    flash: 0,
  };
}

export function startDish(wok, recipe, autoSeason) {
  wok.state = 'cooking';
  wok.recipe = recipe;
  wok.progress = 0;
  wok.goldTime = 0;
  wok.quality = 0.6;
  wok.seasoned = !!autoSeason;
  wok.burnTimer = 0;
  wok.tossCooldown = 0;
  wok.tossAnim = 0;
  if (autoSeason) wok.quality += 0.12;
}

export function updateWok(wok, dt, upgrades) {
  if (wok.state !== 'cooking') return;
  const zone = goldZone(wok.recipe, wok.progress, upgrades);
  wok.heat = heatStep(wok.heat, wok.burner, dt, upgrades);
  const rate = cookRate(wok.heat, zone);
  wok.progress += (rate * dt) / wok.recipe.cookTime;
  if (inGoldZone(wok.heat, zone)) wok.goldTime += dt;
  if (wok.tossCooldown > 0) wok.tossCooldown -= dt;
  if (wok.tossAnim > 0) wok.tossAnim = Math.max(0, wok.tossAnim - dt * 2.2);
  if (wok.flash > 0) wok.flash -= dt;

  // Above the burn line the dish is on borrowed time.
  const grace = BURN_GRACE + (upgrades && upgrades.cool ? 1.5 : 0);
  if (wok.heat > BURN_HEAT) {
    wok.burnTimer += dt;
    if (wok.burnTimer >= grace) {
      wok.state = 'burnt';
      wok.progress = 0;
    }
  } else {
    wok.burnTimer = Math.max(0, wok.burnTimer - dt);
  }

  if (wok.progress >= 1) {
    wok.progress = 1;
    wok.state = 'ready';
  }
}

// A toss cools the wok a little and, at the peak of the gold zone,
// is a PERFECT TOSS: quality, HEI and a flame burst.
export function tossWok(wok, upgrades) {
  if (wok.state !== 'cooking' || wok.tossCooldown > 0) return 'none';
  wok.tossCooldown = 0.9;
  wok.tossAnim = 1;
  const zone = goldZone(wok.recipe, wok.progress, upgrades);
  wok.heat = Math.max(15, wok.heat - 8);
  if (inGoldZone(wok.heat + 8, zone)) {
    wok.quality = Math.min(1.2, wok.quality + 0.06);
    return 'perfect';
  }
  wok.quality = Math.min(1.2, wok.quality + 0.02);
  return 'ok';
}

// One timing decision per dish: season while the needle is gold.
export function seasonWok(wok, upgrades) {
  if (wok.state !== 'cooking' || wok.seasoned) return false;
  const zone = goldZone(wok.recipe, wok.progress, upgrades);
  wok.seasoned = true;
  if (inGoldZone(wok.heat, zone)) {
    wok.quality = Math.min(1.2, wok.quality + 0.15);
    return true;
  }
  return false;
}

export function binWok(wok) {
  wok.state = 'idle';
  wok.recipe = null;
  wok.progress = 0;
  wok.quality = 0.6;
  wok.seasoned = false;
  wok.burnTimer = 0;
  wok.heat = 18;
}
