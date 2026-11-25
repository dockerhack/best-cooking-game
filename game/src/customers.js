// WOK HEI — the night-market crowd. Named customers with a patience
// curve: serve them while their bar is full and they tip; serve them
// late and the tip dries up.

export const CUSTOMERS = [
  'Auntie Mei', 'Uncle Bo', 'Siti', 'Pak Rudi', 'Mei-Lin', 'Dewi',
  'Ah Kong', 'Lina', 'Budi', 'Grace', 'Mr. Tan', 'Yuki', 'Fajar', 'Nora',
];

// Tip as a fraction of the dish base: 1.0 served instantly, 0.4 at the
// last second. The patience bar is the tip meter.
export function tipFrac(patienceLeft, maxPatience) {
  if (maxPatience <= 0) return 0.4;
  const f = Math.max(0, Math.min(1, patienceLeft / maxPatience));
  return 0.4 + 0.6 * f;
}

// Stars for a finished night: 3 for near-perfect service.
export function starsFor(served, total) {
  if (total <= 0) return 1;
  const r = served / total;
  if (r >= 0.9) return 3;
  if (r >= 0.7) return 2;
  return 1;
}
