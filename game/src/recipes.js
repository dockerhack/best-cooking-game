// WOK HEI — the menu. 12 named recipes, each with its own heat curve:
// phase 0 is the sear (hot gold zone), phase 1 the finish (cooler gold
// zone). A dish is won by riding the curve, not by waiting.
// Ingredients are drawn from a small pantry; every recipe names 3-4.

export const INGREDIENTS = {
  rice: { name: 'Rice', color: '#fff3d6', shape: 'grain' },
  noodle: { name: 'Noodles', color: '#f5c542', shape: 'strand' },
  chicken: { name: 'Chicken', color: '#f2a58c', shape: 'chunk' },
  beef: { name: 'Beef', color: '#a8543f', shape: 'chunk' },
  pork: { name: 'Char Siu', color: '#c65a4e', shape: 'chunk' },
  prawn: { name: 'Prawn', color: '#ff8f6b', shape: 'curl' },
  squid: { name: 'Squid', color: '#e8dcc8', shape: 'ring' },
  tofu: { name: 'Tofu', color: '#f7efdd', shape: 'cube' },
  egg: { name: 'Egg', color: '#ffd94d', shape: 'yolk' },
  greens: { name: 'Greens', color: '#7fc96b', shape: 'leaf' },
  chilli: { name: 'Chilli', color: '#e2483d', shape: 'pod' },
  peanut: { name: 'Peanut', color: '#d9a066', shape: 'nut' },
  garlic: { name: 'Garlic', color: '#efe6d0', shape: 'clove' },
  mushroom: { name: 'Mushroom', color: '#c9b8a3', shape: 'cap' },
  ginger: { name: 'Ginger', color: '#e8c97a', shape: 'root' },
  coconut: { name: 'Coconut', color: '#f2ede2', shape: 'milk' },
  sausage: { name: 'Sausage', color: '#b06a4a', shape: 'link' },
  sprout: { name: 'Bean Sprout', color: '#eef3c8', shape: 'sprout' },
  pepper: { name: 'Pepper', color: '#3a3a3a', shape: 'dot' },
  sichuan: { name: 'Sichuan', color: '#c23b2e', shape: 'dot' },
  lemongrass: { name: 'Lemongrass', color: '#cfe08a', shape: 'stalk' },
  cucumber: { name: 'Cucumber', color: '#8fce6e', shape: 'slice' },
  butter: { name: 'Butter', color: '#ffe9a8', shape: 'pat' },
};

export const RECIPES = [
  { id: 'fried-rice', name: 'Char Siu Fried Rice', base: 120, cookTime: 14, phase0: [68, 88], phase1: [42, 62], ings: ['rice', 'pork', 'egg', 'greens'], color: '#f5b942' },
  { id: 'pad-see-ew', name: 'Pad See Ew', base: 130, cookTime: 15, phase0: [64, 86], phase1: [40, 58], ings: ['noodle', 'chicken', 'egg', 'greens'], color: '#e8a33d' },
  { id: 'kung-pao', name: 'Kung Pao Chicken', base: 150, cookTime: 16, phase0: [72, 92], phase1: [45, 62], ings: ['chicken', 'peanut', 'chilli', 'pepper'], color: '#e2483d' },
  { id: 'mapo-tofu', name: 'Mapo Tofu', base: 140, cookTime: 15, phase0: [60, 80], phase1: [38, 56], ings: ['tofu', 'chilli', 'sichuan', 'greens'], color: '#c23b2e' },
  { id: 'dan-dan', name: 'Dan Dan Noodles', base: 135, cookTime: 15, phase0: [66, 86], phase1: [42, 60], ings: ['noodle', 'pork', 'peanut', 'chilli'], color: '#d97b2f' },
  { id: 'squid', name: 'Salt & Pepper Squid', base: 160, cookTime: 13, phase0: [74, 94], phase1: [48, 64], ings: ['squid', 'pepper', 'chilli', 'garlic'], color: '#efe6d0' },
  { id: 'hainanese', name: 'Hainanese Chicken Rice', base: 150, cookTime: 17, phase0: [58, 76], phase1: [36, 54], ings: ['chicken', 'rice', 'ginger', 'cucumber'], color: '#fff3d6' },
  { id: 'tom-yum', name: 'Tom Yum Goong', base: 170, cookTime: 16, phase0: [62, 82], phase1: [40, 58], ings: ['prawn', 'mushroom', 'lemongrass', 'chilli'], color: '#ff8f6b' },
  { id: 'chow-fun', name: 'Beef Chow Fun', base: 155, cookTime: 15, phase0: [70, 90], phase1: [44, 62], ings: ['noodle', 'beef', 'sprout', 'greens'], color: '#a8543f' },
  { id: 'claypot', name: 'Claypot Rice', base: 165, cookTime: 18, phase0: [64, 84], phase1: [38, 55], ings: ['rice', 'sausage', 'egg', 'greens'], color: '#b06a4a' },
  { id: 'laksa', name: 'Singapore Laksa', base: 175, cookTime: 17, phase0: [60, 80], phase1: [38, 56], ings: ['noodle', 'prawn', 'coconut', 'chilli'], color: '#ff9a3d' },
  { id: 'wok-prawns', name: 'Wok Hei Garlic Prawns', base: 190, cookTime: 14, phase0: [76, 95], phase1: [48, 66], ings: ['prawn', 'garlic', 'butter', 'chilli'], color: '#ffc23d' },
];

export function recipeById(id) {
  return RECIPES.find((r) => r.id === id) || RECIPES[0];
}

// The menu grows with the nights: night 1 serves 4 recipes, night 5 all 12.
export function recipesForNight(night) {
  const count = Math.min(3 + night, RECIPES.length);
  return RECIPES.slice(0, count);
}
