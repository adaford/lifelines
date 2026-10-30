// Ratings use the same scale throughout life. Balanced toddler activities use
// TODDLER_FOCUS; later focus is 3 per area. Childhood event drift is fitted by
// scripts/calibrate-percentiles.mjs.
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
    "intelligence": -0.038872,
    "strength": -0.008339,
    "social": -0.032837,
    "creativity": -0.03333
  },
  "wellbeingTarget": {
    "health": 5.043729,
    "stability": 4.6597
  },
  "wellbeingReversion": {
    "health": 0.06,
    "stability": 0.08
  }
};

const clamp = (value, low, high) => Math.max(low, Math.min(high, value));
const number = (value, fallback) => Number.isFinite(value) ? value : fallback;
const skills = ['intelligence', 'strength', 'social', 'creativity'];

export const TODDLER_FOCUS = { work: 3, social: 2, family: 2, self: 3, creative: 2 };
const toddlerCoefficients = {
  work: { strength: .1, social: .055 },
  social: { intelligence: .09, social: -.055 },
  family: { intelligence: .02, social: .055, stability: .035 },
  self: { health: .1, stability: .08 },
  creative: { creativity: .11 },
};
const toddlerFocus = person => Object.fromEntries(Object.keys(TODDLER_FOCUS).map(key => [key, clamp(number(person.focus?.[key], key === 'creative' ? 0 : 3), 0, 5)]));
function toddlerPractice(focus) {
  return Object.fromEntries(skills.map(skill => [skill, Object.entries(toddlerCoefficients).reduce((sum, [key, coefficients]) => sum + (coefficients[skill] || 0) * (focus[key] - TODDLER_FOCUS[key]), 0)]));
}
function practiceResponse(effort, aptitude) {
  return effort * (effort >= 0 ? 1 + aptitude * .12 : 1 - aptitude * .1);
}

// Natural resilience changes responses to routine choices, not the background
// return toward a central wellbeing rating. Missing legacy values are neutral.
export function wellbeingResponse(person, key, amount) {
  const aptitude = clamp(number(person.aptitudes?.[key], 0), -3, 3);
  return practiceResponse(amount, aptitude);
}

function toddlerWellbeingPractice(focus) {
  return {
    health: .1 * (focus.self - 3),
    stability: .08 * (focus.self - 3) + .035 * (focus.family - 2),
  };
}

function infantPractice(person) {
  const level = clamp(number(person.cryLevel, 3), 1, 5);
  return {
    intelligence: [-.08, -.04, .04, .08, .12][level - 1],
    strength: 0,
    social: .02 * (level - 3),
    creativity: .02 * (level - 3),
  };
}

// Isolate the chosen crying level from care, natural development and event
// balancing. The engine uses the same effects in its complete annual mean.
export function infantChoiceEffects(person) {
  const effects = { intelligence: 0, strength: 0, social: 0, creativity: 0, health: 0, stability: 0 };
  if (person.alive === false || person.age >= 2) return effects;
  const practice = infantPractice(person);
  const care = .02 * (clamp(number(person.careFocus, 3), 0, 5) - 3);
  for (const skill of skills) {
    const aptitude = clamp(number(person.aptitudes?.[skill], 0), -3, 3);
    effects[skill] = 1.15 * (practiceResponse(practice[skill] + care, aptitude) - practiceResponse(care, aptitude));
  }
  const level = clamp(number(person.cryLevel, 3), 1, 5);
  effects.health = wellbeingResponse(person, 'health', .06 * ((level - 1) / 4 - .5));
  effects.stability = wellbeingResponse(person, 'stability', [-.24, -.12, .12, .24, .36][level - 1]);
  return effects;
}

// Contribution from the selected points, separate from background development
// and unused-point rest. Pure and shared with the activity impact labels.
export function toddlerActivityEffects(person) {
  const focus = toddlerFocus(person);
  const practice = toddlerPractice(focus);
  const wellbeing = toddlerWellbeingPractice(focus);
  return Object.fromEntries(Object.entries(toddlerCoefficients).map(([key, coefficients]) => {
    const without = toddlerPractice({ ...focus, [key]: 0 });
    const withoutWellbeing = toddlerWellbeingPractice({ ...focus, [key]: 0 });
    return [key, Object.fromEntries(Object.entries(coefficients).map(([stat, coefficient]) => {
      if (!skills.includes(stat)) return [stat, wellbeingResponse(person, stat, wellbeing[stat]) - wellbeingResponse(person, stat, withoutWellbeing[stat])];
      const aptitude = clamp(number(person.aptitudes?.[stat], 0), -3, 3);
      return [stat, 1.15 * (practiceResponse(practice[stat], aptitude) - practiceResponse(without[stat], aptitude))];
    }))];
  }));
}

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
    ? Object.fromEntries(Object.entries(infantPractice(person)).map(([key, effect]) => [key, effect + babyCare]))
    : age < 5 ? toddlerPractice(toddlerFocus(person)) : {
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
    const response = practiceResponse(effort, aptitude);
    const current = number(person.stats?.[key], naturalSkillRating(aptitude));
    const tendency = DEVELOPMENT_BALANCE.skillReversion * (naturalSkillRating(aptitude) - current);
    const eventBias = age < 18 ? number(DEVELOPMENT_BALANCE.childhoodBias[key], 0) : 0;
    return [key, (response + tendency) * flexibility + eventBias];
  }));
}

// Wellbeing varies around a middle rating while natural resilience shapes its
// response to choices. Events can also move it; high scores do not drift
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
    const effects = infantChoiceEffects(person);
    result.health += effects.health;
    result.stability += effects.stability;
    return result;
  }
  const focus = person.age < 5 ? toddlerFocus(person) : Object.fromEntries(['work', 'social', 'family', 'self'].map(key => [key, clamp(number(person.focus?.[key], 3), 0, 5)]));
  const spare = Math.max(0, 12 - Object.values(focus).reduce((sum, value) => sum + value, 0));
  if (person.age < 5) {
    const practice = toddlerWellbeingPractice(focus);
    result.health += wellbeingResponse(person, 'health', practice.health);
    result.stability += wellbeingResponse(person, 'stability', practice.stability + spare * .04);
    return result;
  }
  result.health += wellbeingResponse(person, 'health', .035 * (focus.self - 3));
  result.stability += wellbeingResponse(person, 'stability', -.1 * (focus.work - 3) + .07 * (focus.self - 3) + .025 * (focus.family - 3) + .018 * (focus.social - 3) + spare * .04);
  return result;
}
