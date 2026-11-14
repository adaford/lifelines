import { JOBS } from '../../jobs.js';

function legacyFocusFixture(value) {
  if (!(value.version >= 17) || !value.focus) return;
  delete value.focus.sports;
  delete value.focus.extracurricular;
  const toddler = value.age >= 2 && value.age < 5;
  for (const key of Object.keys(value.focus)) {
    const neutral = toddler && !['work', 'self'].includes(key) ? [0, 1, 2, 3, 5] : [0, 1, 3, 4, 5];
    value.focus[key] = neutral[value.focus[key]];
  }
}
function removeNewFocusMetadata(value) {
  // Synthetic pre-20 fixtures cannot contain modern perk overflow. Restore
  // the old stored-affinity contract when explicitly constructing old data.
  if (value.aptitudes) for (const key of Object.keys(value.aptitudes)) value.aptitudes[key] = Math.max(-3, Math.min(3, value.aptitudes[key]));
  // Explicit downgrade helpers also restore the four-area school format in
  // recorded decisions. Production migrations must preserve those old reviews.
  if (value.focus) { delete value.focus.sports; delete value.focus.extracurricular; }
  if (value.focus && value.workLabel) { delete value.focusMax; delete value.focusBudget; delete value.focusCaps; }
  delete value.collegeSport;
  // Modern adult simulations capture funding and housing. They did not exist
  // in these explicitly downgraded fixtures and must not masquerade as old data.
  delete value.collegeApplications;
  delete value.housing;
  if (value.education?.collegeId !== undefined) {
    if (value.education.status === 'graduate') {
      value.jobOffers = [...new Set([...(value.jobId ? [value.jobId] : []), 'retail',
        ...value.jobOffers, ...JOBS.map(job => job.id)])].slice(0, 15);
    }
    delete value.education.collegeId;
    delete value.education.gpa;
  }
  if (value.education) delete value.education.sport;
  if (value.fromAge !== undefined) delete value.school;
  else if (value.school !== undefined) value.school = null;
}

const legacyRating = number => Math.max(1, number);
function legacyRatingField(object, key) {
  const value = object[key];
  if (typeof value === 'number') object[key] = legacyRating(value);
  else if (value && typeof value.before === 'number' && typeof value.after === 'number') {
    value.before = legacyRating(value.before);
    value.after = legacyRating(value.after);
    value.change = Math.round((value.after - value.before) * 100) / 100;
  }
}

// A current simulated life may contain ratings below the old save contract.
// Normalize only rated fields when constructing an explicitly legacy fixture;
// never change signed modifiers, aptitudes, focus points, or height.
export function legacyRatingFloor(value) {
  if (!value || typeof value !== 'object') return value;
  if (value.stats) for (const key of Object.keys(value.stats)) legacyRatingField(value.stats, key);
  if (value.stats || value.lifestyle?.before !== undefined) legacyRatingField(value, 'lifestyle');
  if (value.stats || value.stability?.before !== undefined) {
    legacyRatingField(value, 'relationship');
    legacyRatingField(value, 'stability');
  }
  if (value.career) legacyRatingField(value.career, 'progress');
  Object.values(value).forEach(legacyRatingFloor);
  return value;
}

function roundLifestyleField(value) {
  if (typeof value.lifestyle === 'number' && value.stats) value.lifestyle = Math.max(1, Math.round(value.lifestyle));
  else if (value.lifestyle && typeof value.lifestyle.before === 'number' && typeof value.lifestyle.after === 'number') {
    value.lifestyle.before = Math.max(1, Math.round(value.lifestyle.before));
    value.lifestyle.after = Math.max(1, Math.round(value.lifestyle.after));
    value.lifestyle.change = value.lifestyle.after - value.lifestyle.before;
  }
}

// Versions through 12 stored whole lifestyle ratings, including review values.
export function integerLifestyleForLegacy(value) {
  if (!value || typeof value !== 'object') return value;
  removeNewFocusMetadata(value);
  legacyRatingFloor(value);
  roundLifestyleField(value);
  Object.values(value).forEach(integerLifestyleForLegacy);
  return value;
}

// Build authentic centimetre and whole-lifestyle fixtures from current saves.
// Call once before downgrading the version.
export function toLegacyCentimeters(value) {
  if (!value || typeof value !== 'object') return value;
  legacyFocusFixture(value);
  removeNewFocusMetadata(value);
  legacyRatingFloor(value);
  roundLifestyleField(value);
  if (value.aptitudes) { delete value.aptitudes.health; delete value.aptitudes.stability; }
  for (const [key, item] of Object.entries(value)) {
    if (['height', 'birthHeight', 'adultHeight'].includes(key) && typeof item === 'number') value[key] = item * 2.54;
    else if (key === 'height' && item && typeof item.before === 'number' && typeof item.after === 'number') {
      item.before *= 2.54;
      item.after *= 2.54;
      item.change = Math.round((item.after - item.before) * 100) / 100;
    } else toLegacyCentimeters(item);
  }
  return value;
}

// The pre-v12 format stored only the five skill aptitudes.
export function stripWellbeingAptitudes(value) {
  if (!value || typeof value !== 'object') return value;
  legacyFocusFixture(value);
  removeNewFocusMetadata(value);
  legacyRatingFloor(value);
  roundLifestyleField(value);
  if (value.aptitudes) { delete value.aptitudes.health; delete value.aptitudes.stability; }
  Object.values(value).forEach(stripWellbeingAptitudes);
  return value;
}

// Expected migrated state: existing skill aptitudes and every rating survive.
export function neutralWellbeingAptitudes(value) {
  if (!value || typeof value !== 'object') return value;
  if (value.aptitudes) Object.assign(value.aptitudes, { health: 0, stability: 0 });
  Object.values(value).forEach(neutralWellbeingAptitudes);
  return value;
}
