// WOK HEI — the ticket rail. Orders arrive on a schedule, wait with a
// patience bar, and are assigned to the first free wok with one click.
// Serving a plated dish scores it: base x quality x tip x combo.

import { MAX_TICKETS } from './config.js';
import { recipeById, recipesForNight } from './recipes.js';

let ticketSeq = 0;

export function makeTicket(state) {
  const menu = recipesForNight(state.night);
  const recipe = state.rng.pick(menu);
  const patience = state.nightDef.patience * state.rng.range(0.9, 1.15);
  return {
    id: ++ticketSeq,
    recipe,
    customer: state.rng.pick(state.customers),
    patience,
    maxPatience: patience,
    state: 'waiting', // waiting | cooking | served | expired
    wokId: -1,
  };
}

export function updateTickets(state, dt) {
  for (const t of state.tickets) {
    if (t.state !== 'waiting') continue;
    t.patience -= dt;
    if (t.patience <= 0) {
      t.state = 'expired';
      t.patience = 0;
      state.expired += 1;
      state.reputation -= 1;
    }
  }
  state.tickets = state.tickets.filter((t) => t.state !== 'expired' || t.flash > 0);
}

// Click a waiting ticket: it starts cooking in the first free wok.
export function assignTicket(state, ticket) {
  const wok = state.woks.find((w) => w.state === 'idle');
  if (!wok) return null;
  ticket.state = 'cooking';
  ticket.wokId = wok.id;
  return wok;
}

// A plated dish leaves the pass and scores.
export function serveDish(state, passIndex) {
  const dish = state.pass[passIndex];
  if (!dish) return 0;
  state.pass.splice(passIndex, 1);
  const ticket = state.tickets.find((t) => t.id === dish.ticketId);
  if (ticket) ticket.state = 'served';
  const tip = 0.8 + 0.4 * (dish.patienceFrac || 0);
  const comboMult = state.combo >= 3 ? 2 : 1;
  const points = Math.round(dish.recipe.base * dish.quality * tip * comboMult);
  state.score += points;
  state.served += 1;
  state.tips += Math.round(dish.recipe.base * dish.quality * (tip - 0.8));
  return points;
}

export function waitingTickets(state) {
  return state.tickets.filter((t) => t.state === 'waiting');
}

export function freeWokCount(state) {
  return state.woks.filter((w) => w.state === 'idle').length;
}

export { recipeById, MAX_TICKETS };
