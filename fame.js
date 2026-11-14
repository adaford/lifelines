// Fictional fame progression. These pure rules never roll randomness or mutate a life.
// Keep this module independent of enrollment, development and focus catalogs.
const KINDS = ['sports', 'extracurricular', 'personal'];
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const finite = (value, fallback = 0) => Number.isFinite(value) ? value : fallback;
const rating = value => clamp(finite(value), 0, 10);
const tenth = value => Math.round(value * 10) / 10;

export function hasFame(person) {
  return Boolean(person?.fame && KINDS.includes(person.fame.kind) && Number.isFinite(person.fame.rating));
}

export function fameFocusKey(person) {
  return hasFame(person) ? person.fame.kind === 'personal' ? 'self' : person.fame.kind : null;
}

export function fameActivityMatches(person, kind, id) {
  return hasFame(person) && ['sports', 'extracurricular'].includes(kind)
    && person.fame.kind === kind && typeof id === 'string' && person.fame.activityId === id
    && (person.school?.[kind]?.id === id || kind === 'sports' && person.education?.sport?.id === id);
}

export function fameLearningBonus(person, stat) {
  return hasFame(person) && stat === 'social' ? 5 : 0;
}

export function fameFocusChange(person, points = person?.focus?.[fameFocusKey(person)]) {
  if (!hasFame(person)) return 0;
  // Focus-based rating movement is half its former annual magnitude.
  const steps = person.fame.kind === 'personal' ? [-.6, -.2, 0, .2, .6] : [-.6, -.2, .2, .6];
  return steps[Math.round(clamp(finite(points), 0, steps.length - 1))];
}

export function fameNextRating(person, normalDraw = 0) {
  if (!hasFame(person)) return null;
  const magnitude = 1 + .2 * clamp(finite(normalDraw), -3, 3);
  return tenth(clamp(rating(person.fame.rating) + fameFocusChange(person) * magnitude, 0, 10));
}

export function fameStartingRating(normalDraw = 0) {
  return tenth(clamp(5 + 2 * finite(normalDraw), 0, 10));
}

export function fameLossChance(value) {
  return .02 + .48 * (1 - rating(value) / 10) ** 3;
}

export function fameLifestyleBonus(person) {
  if (!hasFame(person)) return 0;
  const current = rating(person.fame.rating);
  return clamp((current >= 7 ? (current - 6) * .5 : 0) + clamp(finite(person.fame.support), -2, 2), -2, 3);
}

export function fameOpportunityChance(person, kind, stats = person?.stats) {
  if (!person || !Number.isFinite(person.age) || person.alive === false || person.ended || person.needsSuccession || hasFame(person)) return 0;
  const social = rating(stats?.social), appearance = rating(stats?.attractiveness);
  if (kind === 'personal') {
    return person.age >= 13 && person.age <= 84 ? .05 * ((social + appearance) / 20) ** 10 : 0;
  }
  if (!['sports', 'extracurricular'].includes(kind) || person.age < 6 || person.age > 17) return 0;
  const enrolled = person.school?.[kind];
  if (!enrolled?.id || !Number.isFinite(enrolled.success) || !(person.focus?.[kind] > 0)) return 0;
  // Catalog-specific eligibility (such as Lacrosse's Lifestyle requirement)
  // is checked by the engine before including this invitation in its roll pool.
  const weighted = .5 * rating(enrolled.success) + .25 * social + .25 * appearance;
  return .20 * (weighted / 10) ** 8;
}
