import { MAX_FOCUS, DEFAULT_FOCUS, focusEffect, defaultFocus, focusMaxFor, focusNeutralFor, isSchoolActivityFocus } from './focus-rules.js?v=perk-affinity-overflow';
import { currentSchoolActivity, currentSchoolEnrollment, activityEligible } from './school.js?v=perk-affinity-overflow';
import { fameFocusKey, fameActivityMatches, fameLearningBonus } from './fame.js?v=perk-affinity-overflow';
// Ratings use the same scale throughout life. Balanced toddler activities use
// TODDLER_FOCUS; core areas use 2, enrolled school activities use 1.
// Existing ratings change only through practice, care, events, or aging.
export const BIRTH_VARIATION = {
  skill: 2,
  health: 2,
  stability: 2,
  appearance: 2,
  inheritedAppearance: 1.5,
};

export const DEVELOPMENT_BALANCE = {
  "innateScale": 0.6
};

const clamp = (value, low, high) => Math.max(low, Math.min(high, value));
const number = (value, fallback) => Number.isFinite(value) ? value : fallback;
const skills = ['intelligence', 'strength', 'social', 'creativity'];
const skillFlexibility = age => age < 18 ? 1.15 : age < 40 ? 1 : age < 60 ? .85 : .65;
// Fame changes current learning response, never a person's stored natural aptitude.
export const effectiveAptitude = (person, stat) => number(person.aptitudes?.[stat], 0) + fameLearningBonus(person, stat);

export const TODDLER_FOCUS = defaultFocus(2);
// Scale only yearly decision contributions, leaving natural development,
// aging, and event outcomes independent of the player's allocation.
export const YEARLY_DECISION_SCALE = .25;
// Crying is an infant choice, not a focus-point allocation. Keep its existing
// contribution and caregiver strain while halving focus-based family care.
const INFANT_DECISION_SCALE = .5;
// Choices should move ratings visibly without restoring the old background
// deductions. Keep caregiver strain and autonomous development independent.
export const CHOICE_STAT_MULTIPLIER = 6;
export const INFANT_STABILITY_MULTIPLIER = 2;
export const SKILL_VARIATION = { proportional: .1 };
const choiceCoefficients = activities => Object.fromEntries(Object.entries(activities).map(([area, effects]) =>
  [area, Object.fromEntries(Object.entries(effects).map(([stat, amount]) => [stat, amount * CHOICE_STAT_MULTIPLIER]))]));
export const PARENT_FAMILY_RELATIONSHIP_GAIN = .08 * YEARLY_DECISION_SCALE;
export const PARENT_FAMILY_STABILITY_GAIN = .025;
export const TODDLER_ACTIVITY_EFFECTS = choiceCoefficients({
  work: { strength: .05, social: .0275 },
  social: { intelligence: .045, social: -.0275 },
  family: { social: .0275 },
  self: { health: .05, stability: .04 },
  creative: { creativity: .055, intelligence: .045 },
});
export const STANDARD_FOCUS_EFFECTS = choiceCoefficients({
  work: { intelligence: .0375, stability: -.05 },
  social: { social: .04, creativity: .04, stability: .05 },
  family: { social: .04, stability: .05 },
  self: { intelligence: .0375, strength: .05, creativity: .04, health: .0175, stability: .05 },
});
export const SCHOOL_FOCUS_EFFECTS = choiceCoefficients({
  work: { intelligence: .0375, creativity: .04, social: -.04, stability: -.05 },
  social: { social: .04, stability: .05 },
  family: { social: .04, stability: .05 },
  self: { attractiveness: .0375, health: .0175, stability: .05 },
  sports: {},
  extracurricular: {},
});
// Inactivity affects these general abilities, independent of the selected
// activity's positive training. These per-unit inputs already include scaling.
export const SCHOOL_INACTIVITY_EFFECTS = {
  sports: { strength: .3, social: .24 },
  extracurricular: { creativity: .24, intelligence: .225 },
};
const hasSchoolFocus = person => person.age >= 5 && person.age < 18 && !person.autonomousFocus;
const adultActivityKinds = person => !person.autonomousFocus && person.age >= 18
  ? ['sports', 'extracurricular'].filter(kind => isSchoolActivityFocus(person, kind)) : [];
const hasActivityPractice = person => hasSchoolFocus(person) || adultActivityKinds(person).length > 0;
function schoolActivityPoints(person, kind) {
  const activity = currentSchoolActivity(person, kind);
  return activity && activityEligible(person, activity)
    ? clamp(Math.round(number(person.focus?.[kind], 1)), 0, focusMaxFor(person, kind)) : 0;
}
// Schoolwork has its own learning curves. Activities use -1,+1,+2,+3 units;
// only a matching famous source can actually allocate the third point.
export function schoolFocusSteps(area, stat, points) {
  if (area === 'sports' || area === 'extracurricular') return [-1, 1, 2, 3][clamp(Math.round(number(points, 1)), 0, 3)];
  const index = clamp(Math.round(number(points, DEFAULT_FOCUS)), 0, MAX_FOCUS);
  if (area === 'work' && stat === 'intelligence') return [-3, -2, 0, 2, 3][index];
  if (area === 'work' && stat === 'creativity') return [-2, -1, 0, 1, 2][index];
  return focusEffect(points);
}
// One sign has one raw magnitude for the same stat across player choices.
// Selected-point curves are shared by simulation and previews below.
export function focusEffectStrength(coefficients, area, stat) {
  return coefficients[area]?.[stat] ? 1 : 0;
}
// Autonomous parents retain their internal 0-5 allocation model; their yearly
// rating contributions are halved with the player's focus contributions.
const AUTONOMOUS_FOCUS_EFFECTS = {
  work: { intelligence: .075, stability: -.1 },
  social: { social: .08, creativity: .025, stability: .018 },
  family: { social: .025, stability: .025 },
  self: { intelligence: .035, strength: .1, creativity: .08, health: .035, stability: .07 },
};
export function standardFocusCoefficients(person, career = null) {
  const source = person.autonomousFocus ? AUTONOMOUS_FOCUS_EFFECTS : hasSchoolFocus(person) ? SCHOOL_FOCUS_EFFECTS : STANDARD_FOCUS_EFFECTS;
  const coefficients = Object.fromEntries(Object.entries(source).map(([area, effects]) => [area, { ...effects }]));
  const activityKinds = hasSchoolFocus(person) ? ['sports', 'extracurricular'] : adultActivityKinds(person);
  for (const kind of activityKinds) {
    const activity = currentSchoolActivity(person, kind);
    coefficients[kind] = (person.school || currentSchoolEnrollment(person, kind)) && schoolActivityPoints(person, kind) === 0
      ? { ...SCHOOL_INACTIVITY_EFFECTS[kind] }
      : activity && activityEligible(person, activity) ? { ...activity.training } : {};
  }
  const fameArea = !person.autonomousFocus && fameFocusKey(person);
  const fameSource = fameArea === 'self' || fameActivityMatches(person, fameArea, currentSchoolEnrollment(person, fameArea)?.id);
  if (fameSource && Object.hasOwn(coefficients, fameArea)) coefficients[fameArea].social = (coefficients[fameArea].social || 0) + .24;
  if (person.age >= 18) for (const key of skills) {
    const extra = .035 * (person.autonomousFocus ? 1 : CHOICE_STAT_MULTIPLIER) * clamp(number(career?.weights?.[key], 0), 0, 1);
    if (extra) coefficients.work[key] = (coefficients.work[key] || 0) + extra;
  }
  return coefficients;
}
export function standardFocusPractice(person, career = null, excludedArea = null) {
  const result = Object.fromEntries([...skills, 'health', 'stability'].map(key => [key, 0]));
  for (const [area, effects] of Object.entries(standardFocusCoefficients(person, career))) {
    if (area === excludedArea) continue;
    for (const [stat, coefficient] of Object.entries(effects)) {
      const activityArea = !person.autonomousFocus && isSchoolActivityFocus(person, area);
      const points = activityArea
        ? schoolActivityPoints(person, area) : person.focus?.[area];
      const effort = person.autonomousFocus ? clamp(number(person.focus?.[area], 3), 0, 5) - 3
        : hasSchoolFocus(person) || activityArea ? schoolFocusSteps(area, stat, points) : focusEffect(points);
      result[stat] = (result[stat] || 0) + coefficient * effort;
    }
  }
  return result;
}
// Every activity is neutral at two. Crafts Intelligence only changes at the
// endpoints, by one unit; its Creativity keeps the normal triple endpoints.
// Electronics uses linear Intelligence (-4..4) and Social (-2..2) units.
export const toddlerActivityNeutral = () => DEFAULT_FOCUS;
export function toddlerActivitySteps(activity, stat, points) {
  if (activity === 'social') {
    const offset = clamp(Math.round(number(points, DEFAULT_FOCUS)), 0, MAX_FOCUS) - DEFAULT_FOCUS;
    return offset * (stat === 'intelligence' ? 2 : 1);
  }
  const effort = focusEffect(points);
  return activity === 'creative' && stat === 'intelligence'
    ? Math.abs(effort) === 3 ? Math.sign(effort) : 0
    : effort;
}
const toddlerFocus = person => Object.fromEntries(Object.keys(TODDLER_FOCUS).map(key => [key, clamp(number(person.focus?.[key], DEFAULT_FOCUS), 0, MAX_FOCUS)]));
function toddlerPractice(focus) {
  return Object.fromEntries(skills.map(skill => [skill, Object.entries(TODDLER_ACTIVITY_EFFECTS).reduce((sum, [key, coefficients]) => sum + (coefficients[skill] || 0) * toddlerActivitySteps(key, skill, focus[key]), 0)]));
}
function practiceResponse(effort, aptitude) {
  return effort * (effort >= 0 ? 1 + aptitude * .08 : 1 - aptitude * .07);
}
function personalPracticeResponse(person, stat, amount) {
  if (stat === 'health' || stat === 'stability') return wellbeingResponse(person, stat, amount);
  const aptitude = effectiveAptitude(person, stat);
  return YEARLY_DECISION_SCALE * skillFlexibility(number(person.age, 18)) * practiceResponse(amount, aptitude);
}

// Add this choice contribution to the existing appearance mean. The engine
// retains its appearance noise draw and applies rating response/bounds once.
export function schoolAppearanceChange(person) {
  if (!hasActivityPractice(person) || person.alive === false) return 0;
  const effort = standardFocusPractice(person).attractiveness || 0;
  return personalPracticeResponse(person, 'attractiveness', effort);
}

// Natural resilience changes responses to routine choices. It never supplies
// a change of its own. Missing legacy values are neutral.
export function wellbeingResponse(person, key, amount, scale = YEARLY_DECISION_SCALE) {
  const aptitude = effectiveAptitude(person, key);
  return scale * practiceResponse(amount, aptitude);
}

// Simulation and choice previews share these contributions. Callers apply
// rating bounds and rounding in their existing order.
export function caregiverCryEffects(person, level) {
  return {
    stability: wellbeingResponse(person, 'stability', [.2, 0, -.6, -1.2, -1.8][level - 1], INFANT_DECISION_SCALE),
    relationship: INFANT_DECISION_SCALE * .2 * (level - 3),
  };
}

export function unemploymentFocusCoefficient(person, career) {
  return !career && person.education.status !== 'college' && focusEffect(person.focus.work) > 0 ? -.15 : 0;
}

export function unemploymentStabilityChange(person, career) {
  const coefficient = unemploymentFocusCoefficient(person, career);
  return coefficient ? wellbeingResponse(person, 'stability', coefficient * focusEffect(person.focus.work)) : 0;
}

function toddlerWellbeingPractice(focus) {
  return {
    health: TODDLER_ACTIVITY_EFFECTS.self.health * focusEffect(focus.self),
    stability: TODDLER_ACTIVITY_EFFECTS.self.stability * focusEffect(focus.self),
  };
}

function infantPractice(person) {
  const level = clamp(number(person.cryLevel, 3), 1, 5);
  return {
    intelligence: CHOICE_STAT_MULTIPLIER * [-.08, -.04, .04, .08, .12][level - 1],
    strength: 0,
    social: CHOICE_STAT_MULTIPLIER * .02 * (level - 3),
    creativity: CHOICE_STAT_MULTIPLIER * .02 * (level - 3),
  };
}

// Isolate the chosen crying level from care, natural development and event
// balancing. The engine uses the same effects in its complete annual mean.
export function infantChoiceEffects(person) {
  const effects = { intelligence: 0, strength: 0, social: 0, creativity: 0, health: 0, stability: 0 };
  if (person.alive === false || person.age >= 2) return effects;
  const practice = infantPractice(person);
  const care = YEARLY_DECISION_SCALE / INFANT_DECISION_SCALE * CHOICE_STAT_MULTIPLIER * .02 * focusEffect(number(person.careFocus, DEFAULT_FOCUS));
  for (const skill of skills) {
    const aptitude = effectiveAptitude(person, skill);
    effects[skill] = INFANT_DECISION_SCALE * 1.15 * (practiceResponse(practice[skill] + care, aptitude) - practiceResponse(care, aptitude));
  }
  const level = clamp(number(person.cryLevel, 3), 1, 5);
  effects.health = wellbeingResponse(person, 'health', CHOICE_STAT_MULTIPLIER * .06 * ((level - 1) / 4 - .5), INFANT_DECISION_SCALE);
  effects.stability = wellbeingResponse(person, 'stability', INFANT_STABILITY_MULTIPLIER * [-.24, -.12, .12, .24, .36][level - 1], INFANT_DECISION_SCALE);
  return effects;
}

// Contribution from the selected points, separate from background development
// and unused-point rest. Pure and shared with the activity impact labels.
export function toddlerActivityEffects(person) {
  const focus = toddlerFocus(person);
  const practice = toddlerPractice(focus);
  const wellbeing = toddlerWellbeingPractice(focus);
  return Object.fromEntries(Object.entries(TODDLER_ACTIVITY_EFFECTS).map(([key, coefficients]) => {
    const without = toddlerPractice({ ...focus, [key]: DEFAULT_FOCUS });
    const withoutWellbeing = toddlerWellbeingPractice({ ...focus, [key]: DEFAULT_FOCUS });
    return [key, Object.fromEntries(Object.entries(coefficients).map(([stat, coefficient]) => {
      if (!skills.includes(stat)) return [stat, wellbeingResponse(person, stat, wellbeing[stat]) - wellbeingResponse(person, stat, withoutWellbeing[stat])];
      const aptitude = effectiveAptitude(person, stat);
      return [stat, YEARLY_DECISION_SCALE * 1.15 * (practiceResponse(practice[stat], aptitude) - practiceResponse(without[stat], aptitude))];
    }))];
  }));
}

// The center of a new person's birth distribution, never a target for growth.
export function naturalSkillRating(aptitude = 0) {
  return clamp(5 + DEVELOPMENT_BALANCE.innateScale * clamp(number(aptitude, 0), -3, 3), 0, 10);
}

// Pure annual means; the engine adds seeded individual variation afterwards.
export function skillChanges(person, career = null, practiceScale = person.autonomousFocus ? .5 : YEARLY_DECISION_SCALE) {
  if (person.alive === false) return Object.fromEntries(skills.map(key => [key, 0]));
  const age = number(person.age, 18);
  const flexibility = skillFlexibility(age);
  const babyCare = CHOICE_STAT_MULTIPLIER * .02 * focusEffect(number(person.careFocus, DEFAULT_FOCUS));
  const practice = age < 2
    ? Object.fromEntries(Object.entries(infantPractice(person)).map(([key, effect]) => [key, effect * INFANT_DECISION_SCALE / YEARLY_DECISION_SCALE + babyCare]))
    : age < 5 ? toddlerPractice(toddlerFocus(person)) : standardFocusPractice(person, career);
  return Object.fromEntries(skills.map(key => {
    const aptitude = effectiveAptitude(person, key);
    const effort = practice[key];
    // Aptitude helps improvement and buffers loss without eliminating either.
    const response = practiceScale * (person.autonomousFocus ? .5 : 1) * practiceResponse(effort, aptitude);
    return [key, response * flexibility];
  }));
}

// School and college rows isolate one allocation from the other choices.
// Background development and the rest earned by unused points are excluded.
export function schoolFocusEffects(person, area, career = null) {
  const areas = Object.keys(standardFocusCoefficients(person, career));
  if (person.alive === false || person.age < 5 || !areas.includes(area)) return {};
  const focus = Object.fromEntries(areas.map(key => [key, clamp(number(person.focus?.[key], focusNeutralFor(person, key)), 0, focusMaxFor(person, key))]));
  const chosen = standardFocusPractice({ ...person, focus }, career);
  // No selected activity point is neutral. Remove this area's raw inputs to
  // isolate its contribution while retaining the other areas' net response.
  const baseline = standardFocusPractice({ ...person, focus }, career, area);
  const keys = [...skills, 'health', 'stability', ...(hasActivityPractice(person) ? ['attractiveness'] : [])];
  return Object.fromEntries(keys.map(key => [key,
    personalPracticeResponse(person, key, chosen[key] || 0) - personalPracticeResponse(person, key, baseline[key] || 0),
  ]));
}

// Complete focus contribution against no choice inputs, without aging,
// natural development, unused-point rest, finances, or expiring effects.
export function focusChoiceEffects(person, career = null) {
  const practice = standardFocusPractice(person, career);
  return {
    ...Object.fromEntries(skills.map(key => [key, person.alive === false ? 0 : personalPracticeResponse(person, key, practice[key])])),
    health: wellbeingResponse(person, 'health', practice.health),
    stability: wellbeingResponse(person, 'stability', practice.stability),
    ...(hasActivityPractice(person) ? { attractiveness: schoolAppearanceChange(person) } : {}),
  };
}

// Choices supply wellbeing changes; a low or high rating supplies none by
// itself. Call with the age at the start of the year.
export function childhoodWellbeing(person) {
  if (person.alive === false || person.age >= 18) return { health: 0, stability: 0 };
  const result = { health: 0, stability: 0 };
  if (person.age < 2) {
    const effects = infantChoiceEffects(person);
    result.health += effects.health;
    result.stability += effects.stability;
    return result;
  }
  const focus = person.age < 5 ? toddlerFocus(person) : Object.fromEntries(['work', 'social', 'family', 'self'].map(key => [key, clamp(number(person.focus?.[key], DEFAULT_FOCUS), 0, MAX_FOCUS)]));
  if (person.age < 5) {
    const practice = toddlerWellbeingPractice(focus);
    result.health += wellbeingResponse(person, 'health', practice.health);
    result.stability += wellbeingResponse(person, 'stability', practice.stability);
    return result;
  }
  const practice = standardFocusPractice(person);
  result.health += wellbeingResponse(person, 'health', practice.health);
  result.stability += wellbeingResponse(person, 'stability', practice.stability);
  return result;
}
