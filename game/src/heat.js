// WOK HEI — heat curves. Each recipe has two gold zones: a hot sear
// for the first half of the dish, then a cooler finish. The gauge shows
// the current zone; the dish only cooks while the needle sits inside it.

export function goldZone(recipe, progress, upgrades) {
  const wide = upgrades && upgrades.gold ? 5 : 0;
  const zone = progress < 0.5 ? recipe.phase0 : recipe.phase1;
  return { lo: Math.max(0, zone[0] - wide), hi: Math.min(100, zone[1] + wide) };
}

export function inGoldZone(heat, zone) {
  return heat >= zone.lo && heat <= zone.hi;
}

// How fast the dish cooks at this heat: full speed in the gold zone,
// a crawl just outside it, nothing when the wok is cold.
export function cookRate(heat, zone) {
  if (inGoldZone(heat, zone)) return 1;
  if (heat < 20) return 0;
  const dist = heat < zone.lo ? zone.lo - heat : heat - zone.hi;
  return dist <= 12 ? 0.25 : 0.08;
}

// Burner targets: off drifts to room heat, low simmers, high roars.
// The Dragon Burner upgrade pulls the needle up 30% faster.
export function burnerTarget(level) {
  return level === 0 ? 15 : level === 1 ? 48 : 96;
}

export function heatStep(heat, level, dt, upgrades) {
  const rate = (upgrades && upgrades.burner ? 29 : 22) * dt;
  const target = burnerTarget(level);
  if (heat < target) return Math.min(target, heat + rate);
  return Math.max(target, heat - rate);
}
