// Build authentic centimetre fixtures from current inch-based saves. Call once
// before downgrading the version; preserve exact actor values for round trips.
export function toLegacyCentimeters(value) {
  if (!value || typeof value !== 'object') return value;
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
