import { conditionFocusPoints } from './birth-conditions.js?v=activity-events';

// One shared allocation scale for all playable focus stages.
export const MAX_FOCUS = 4;
export const DEFAULT_FOCUS = 2;
export const STANDARD_FOCUS_KEYS = ['work', 'social', 'family', 'self'];
export const TODDLER_FOCUS_KEYS = [...STANDARD_FOCUS_KEYS, 'creative'];
export const SCHOOL_FOCUS_KEYS = [...STANDARD_FOCUS_KEYS, 'sports', 'extracurricular'];
export const focusKeysForAge = age => age >= 2 && age < 5 ? [...TODDLER_FOCUS_KEYS] : age >= 5 && age < 18 ? [...SCHOOL_FOCUS_KEYS] : [...STANDARD_FOCUS_KEYS];
const ageOf = ageOrPerson => ageOrPerson && typeof ageOrPerson === 'object' ? ageOrPerson.age : ageOrPerson;
export const isSchoolActivityFocus = (ageOrPerson, key) => ageOf(ageOrPerson) >= 5 && ageOf(ageOrPerson) < 18 && ['sports', 'extracurricular'].includes(key);
export const focusMaxFor = (ageOrPerson, key) => isSchoolActivityFocus(ageOrPerson, key) ? 2 : MAX_FOCUS;
export const focusNeutralFor = (ageOrPerson, key) => isSchoolActivityFocus(ageOrPerson, key) ? 1 : DEFAULT_FOCUS;
export const temporaryFocusPoints = person => (person?.effects || []).reduce((sum, effect) => sum + (
  effect.years > 0 && Number.isInteger(effect.focusPoints) && Math.abs(effect.focusPoints) <= 4 ? effect.focusPoints : 0
), 0);
export function focusBudget(ageOrPerson) {
  const person = ageOrPerson && typeof ageOrPerson === 'object' ? ageOrPerson : null;
  const age = person ? person.age : ageOrPerson;
  const base = age >= 5 && age < 18 ? 10 : DEFAULT_FOCUS * focusKeysForAge(age).length;
  return Math.max(0, base + (person ? conditionFocusPoints(person) + temporaryFocusPoints(person) : 0));
}
export const defaultFocus = ageOrPerson => Object.fromEntries(focusKeysForAge(ageOf(ageOrPerson)).map(key => [key,
  isSchoolActivityFocus(ageOrPerson, key) ? ageOrPerson?.school?.[key] ? 1 : 0 : DEFAULT_FOCUS]));
export function focusEffect(points = DEFAULT_FOCUS) {
  const value = Number.isFinite(points) ? Math.max(0, Math.min(MAX_FOCUS, Math.round(points))) : DEFAULT_FOCUS;
  return [-3, -1, 0, 1, 3][value];
}
// Keep non-stat progress and chance formulas on their established scale.
export function legacyFocusValue(points = DEFAULT_FOCUS, oldNeutral = 3) {
  const value = Number.isFinite(points) ? Math.max(0, Math.min(MAX_FOCUS, Math.round(points))) : DEFAULT_FOCUS;
  return (oldNeutral === 2 ? [0, 1, 2, 3.5, 5] : [0, 1.5, 3, 4, 5])[value];
}

// Pure allocation normalization for balanced simulations and stage changes.
export function fitFocusBudget(person, allocation) {
  const defaults = defaultFocus(person);
  const result = Object.fromEntries(focusKeysForAge(person.age).map(key => [key, Math.max(0, Math.min(isSchoolActivityFocus(person, key) && !person.school?.[key] ? 0 : focusMaxFor(person, key), allocation[key] ?? defaults[key]))]));
  const keys = Object.keys(result);
  let excess = Object.values(result).reduce((sum, points) => sum + points, 0) - focusBudget(person);
  while (excess > 0) {
    const key = keys.reduce((largest, next) => result[next] > result[largest] ? next : largest);
    result[key]--; excess--;
  }
  return result;
}
