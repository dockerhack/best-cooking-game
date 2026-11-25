// WOK HEI — best score and night stars, kept in localStorage like the
// kit's starter. A failed read never breaks the game.

const KEY = 'wok-hei-save-v1';

export function loadSave() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { bestScore: 0, bestStreak: 0, stars: [0, 0, 0, 0, 0] };
    const parsed = JSON.parse(raw);
    return {
      bestScore: parsed.bestScore | 0,
      bestStreak: parsed.bestStreak | 0,
      stars: Array.isArray(parsed.stars) ? parsed.stars.slice(0, 5) : [0, 0, 0, 0, 0],
    };
  } catch {
    return { bestScore: 0, bestStreak: 0, stars: [0, 0, 0, 0, 0] };
  }
}

export function recordNight(save, night, stars, score, streak) {
  const next = {
    bestScore: Math.max(save.bestScore, score),
    bestStreak: Math.max(save.bestStreak, streak),
    stars: save.stars.slice(),
  };
  if (night >= 1 && night <= 5) next.stars[night - 1] = Math.max(next.stars[night - 1] || 0, stars);
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // storage full or blocked: the night still counts in this session
  }
  return next;
}
