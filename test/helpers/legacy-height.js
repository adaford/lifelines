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
  legacyRatingFloor(value);
  roundLifestyleField(value);
  Object.values(value).forEach(integerLifestyleForLegacy);
  return value;
}

// Build authentic centimetre and whole-lifestyle fixtures from current saves.
// Call once before downgrading the version.
export function toLegacyCentimeters(value) {
  if (!value || typeof value !== 'object') return value;
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
