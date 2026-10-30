// Build authentic centimetre fixtures from current inch-based saves. Call once
// before downgrading the version; preserve exact actor values for round trips.
export function toLegacyCentimeters(value) {
  if (!value || typeof value !== 'object') return value;
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
