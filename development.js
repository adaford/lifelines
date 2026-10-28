// Game-balanced development. Reference cohorts use cry level 3 and balanced
// focus (3 per area). These constants are fitted by scripts/calibrate-percentiles.mjs.
export const DEVELOPMENT_BALANCE = {
  "skillScale": {
    "intelligence": 0.550879,
    "strength": 0.964072,
    "social": 0.608378,
    "creativity": 0.701911
  },
  "wellbeingTarget": {
    "health": 5.033235,
    "stability": 4.758119
  },
  "wellbeingReversion": {
    "health": 0.06,
    "stability": 0.08
  }
};

const clamp = (value, low, high) => Math.max(low, Math.min(high, value));
const number = (value, fallback) => Number.isFinite(value) ? value : fallback;

export function skillGrowth(person, key, amount) {
  const affinity = clamp(number(person.aptitudes?.[key], 0), -3, 3);
  const scale = person.age < 18 ? DEVELOPMENT_BALANCE.skillScale[key] ?? 1 : 1;
  return amount * (1 + affinity * .18) * scale;
}

// Wellbeing is not a learned skill. It varies around a middle rating while
// choices and events can move it in either direction; high scores do not drift
// automatically to the ceiling. Call with the age at the start of the year.
export function childhoodWellbeing(person) {
  if (person.alive === false || person.age >= 18) return { health: 0, stability: 0 };
  const health = number(person.stats?.health, 5);
  const stability = number(person.stats?.stability, 5);
  const result = {
    health: DEVELOPMENT_BALANCE.wellbeingReversion.health * (DEVELOPMENT_BALANCE.wellbeingTarget.health - health),
    stability: DEVELOPMENT_BALANCE.wellbeingReversion.stability * (DEVELOPMENT_BALANCE.wellbeingTarget.stability - stability),
  };
  if (person.age < 3) {
    const intensity = (clamp(number(person.cryLevel, 3), 1, 5) - 1) / 4;
    result.health += .06 * (intensity - .5);
    return result;
  }
  const focus = Object.fromEntries(['work', 'social', 'family', 'self'].map(key => [key, clamp(number(person.focus?.[key], 3), 0, 5)]));
  const spare = Math.max(0, 12 - Object.values(focus).reduce((sum, value) => sum + value, 0));
  result.health += .035 * (focus.self - 3);
  result.stability += -.1 * (focus.work - 3) + .07 * (focus.self - 3) + .025 * (focus.family - 3) + .018 * (focus.social - 3) + spare * .04;
  return result;
}
