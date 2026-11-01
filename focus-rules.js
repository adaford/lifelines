import { conditionFocusPoints } from './birth-conditions.js?v=focus-single-1';

// One shared allocation scale for all playable focus stages.
export const MAX_FOCUS = 4;
export const DEFAULT_FOCUS = 2;
export const STANDARD_FOCUS_KEYS = ['work', 'social', 'family', 'self'];
export const TODDLER_FOCUS_KEYS = [...STANDARD_FOCUS_KEYS, 'creative'];
export const focusKeysForAge = age => age >= 2 && age < 5 ? [...TODDLER_FOCUS_KEYS] : [...STANDARD_FOCUS_KEYS];
export function focusBudget(ageOrPerson) {
  const person = ageOrPerson && typeof ageOrPerson === 'object' ? ageOrPerson : null;
  const age = person ? person.age : ageOrPerson;
  return Math.max(0, DEFAULT_FOCUS * focusKeysForAge(age).length + (person ? conditionFocusPoints(person) : 0));
}
export const defaultFocus = age => Object.fromEntries(focusKeysForAge(age).map(key => [key, DEFAULT_FOCUS]));
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
  const result = Object.fromEntries(focusKeysForAge(person.age).map(key => [key, Math.max(0, Math.min(MAX_FOCUS, allocation[key] ?? DEFAULT_FOCUS))]));
  const keys = Object.keys(result);
  let excess = Object.values(result).reduce((sum, points) => sum + points, 0) - focusBudget(person);
  while (excess > 0) {
    const key = keys.reduce((largest, next) => result[next] > result[largest] ? next : largest);
    result[key]--; excess--;
  }
  return result;
}
