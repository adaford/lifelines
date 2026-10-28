// Ratings use the same scale throughout life. Balanced focus is 3 per area;
// childhood event drift is fitted by scripts/calibrate-percentiles.mjs.
export const BIRTH_VARIATION = {
  skill: 2,
  health: 2,
  stability: 2,
  appearance: 2,
  inheritedAppearance: 1.5,
};

export const DEVELOPMENT_BALANCE = {
  "innateScale": 0.8,
  "skillReversion": 0.012,
  "childhoodBias": {
    "intelligence": -0.034749,
    "strength": -0.006114,
    "social": -0.034802,
    "creativity": -0.033537
  },
  "wellbeingTarget": {
    "health": 5.022861,
    "stability": 4.723184
  },
  "wellbeingReversion": {
    "health": 0.06,
    "stability": 0.08
  }
};

const clamp = (value, low, high) => Math.max(low, Math.min(high, value));
const number = (value, fallback) => Number.isFinite(value) ? value : fallback;
const skills = ['intelligence', 'strength', 'social', 'creativity'];

// This is a weak innate tendency, not a destination or a preselected final score.
export function naturalSkillRating(aptitude = 0) {
  return clamp(5 + DEVELOPMENT_BALANCE.innateScale * clamp(number(aptitude, 0), -3, 3), 1, 10);
}

// Pure annual means; the engine adds seeded individual variation afterwards.
export function skillChanges(person, career = null) {
  if (person.alive === false) return Object.fromEntries(skills.map(key => [key, 0]));
  const age = number(person.age, 18);
  const flexibility = age < 18 ? 1.15 : age < 40 ? 1 : age < 60 ? .85 : .65;
  const focus = Object.fromEntries(['work', 'social', 'family', 'self'].map(key => [key, clamp(number(person.focus?.[key], 3), 0, 5) - 3]));
  const babyCare = .02 * (clamp(number(person.careFocus, 3), 0, 5) - 3);
  const practice = age < 2
    ? Object.fromEntries(skills.map(key => [key, .02 * (clamp(number(person.cryLevel, 3), 1, 5) - 3) + babyCare]))
    : age < 5 ? {
      // Ages 2–4: work=Play, social=Explore, family=Family time, self=Rest.
      intelligence: .09 * focus.social + .02 * focus.family,
      strength: .1 * focus.work,
      social: .055 * focus.work + .055 * focus.family,
      creativity: .055 * focus.work + .055 * focus.social,
    } : {
      intelligence: .075 * focus.work + .035 * focus.self,
      strength: .1 * focus.self,
      social: .08 * focus.social + .025 * focus.family,
      creativity: .08 * focus.self + .025 * focus.social,
    };
  return Object.fromEntries(skills.map(key => {
    const aptitude = clamp(number(person.aptitudes?.[key], 0), -3, 3);
    const careerPractice = age >= 18 ? .035 * clamp(number(career?.weights?.[key], 0), 0, 1) * focus.work : 0;
    const effort = practice[key] + careerPractice;
    // Aptitude helps improvement and buffers loss without eliminating either.
    const response = effort * (effort >= 0 ? 1 + aptitude * .12 : 1 - aptitude * .1);
    const current = number(person.stats?.[key], naturalSkillRating(aptitude));
    const tendency = DEVELOPMENT_BALANCE.skillReversion * (naturalSkillRating(aptitude) - current);
    const eventBias = age < 18 ? number(DEVELOPMENT_BALANCE.childhoodBias[key], 0) : 0;
    return [key, (response + tendency) * flexibility + eventBias];
  }));
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
  if (person.age < 2) {
    const intensity = (clamp(number(person.cryLevel, 3), 1, 5) - 1) / 4;
    result.health += .06 * (intensity - .5);
    return result;
  }
  const focus = Object.fromEntries(['work', 'social', 'family', 'self'].map(key => [key, clamp(number(person.focus?.[key], 3), 0, 5)]));
  const spare = Math.max(0, 12 - Object.values(focus).reduce((sum, value) => sum + value, 0));
  if (person.age < 5) {
    result.health += .05 * (focus.self - 3);
    result.stability += .08 * (focus.self - 3) + .035 * (focus.family - 3) + spare * .04;
    return result;
  }
  result.health += .035 * (focus.self - 3);
  result.stability += -.1 * (focus.work - 3) + .07 * (focus.self - 3) + .025 * (focus.family - 3) + .018 * (focus.social - 3) + spare * .04;
  return result;
}
