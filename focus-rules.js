import { conditionFocusPoints } from './birth-conditions.js?v=causal-stat-outcomes';
import { fameFocusKey, fameActivityMatches } from './fame.js?v=causal-stat-outcomes';

// One shared allocation scale for all playable focus stages.
export const MAX_FOCUS = 4;
export const DEFAULT_FOCUS = 2;
export const STANDARD_FOCUS_KEYS = ['work', 'social', 'family', 'self'];
export const TODDLER_FOCUS_KEYS = [...STANDARD_FOCUS_KEYS, 'creative'];
export const SCHOOL_FOCUS_KEYS = [...STANDARD_FOCUS_KEYS, 'sports', 'extracurricular'];
const ageOf = ageOrPerson => ageOrPerson && typeof ageOrPerson === 'object' ? ageOrPerson.age : ageOrPerson;
const famousActivityFocus = (person, key) => fameActivityMatches(person, key, person?.school?.[key]?.id);
export function focusKeysForAge(ageOrPerson) {
  const age = ageOf(ageOrPerson);
  if (age >= 2 && age < 5) return [...TODDLER_FOCUS_KEYS];
  if (age >= 5 && age < 18) return [...SCHOOL_FOCUS_KEYS];
  const source = fameFocusKey(ageOrPerson);
  return [...STANDARD_FOCUS_KEYS, ...(age >= 18 && famousActivityFocus(ageOrPerson, source) ? [source] : [])];
}
// The original school activity scale also follows a famous source into adulthood.
export const isSchoolActivityFocus = (ageOrPerson, key) => ageOf(ageOrPerson) >= 5
  && (ageOf(ageOrPerson) < 18 && ['sports', 'extracurricular'].includes(key) || famousActivityFocus(ageOrPerson, key));
export const focusMaxFor = (ageOrPerson, key) => isSchoolActivityFocus(ageOrPerson, key)
  ? famousActivityFocus(ageOrPerson, key) ? 3 : 2 : MAX_FOCUS;
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
export const defaultFocus = ageOrPerson => Object.fromEntries(focusKeysForAge(ageOrPerson).map(key => [key,
  isSchoolActivityFocus(ageOrPerson, key) ? ageOf(ageOrPerson) < 18 && ageOrPerson?.school?.[key] ? 1 : 0 : DEFAULT_FOCUS]));
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
  const result = Object.fromEntries(focusKeysForAge(person).map(key => [key, Math.max(0, Math.min(isSchoolActivityFocus(person, key) && !person.school?.[key] ? 0 : focusMaxFor(person, key), allocation[key] ?? defaults[key]))]));
  const keys = Object.keys(result);
  let excess = Object.values(result).reduce((sum, points) => sum + points, 0) - focusBudget(person);
  while (excess > 0) {
    const key = keys.reduce((largest, next) => result[next] > result[largest] ? next : largest);
    result[key]--; excess--;
  }
  return result;
}
