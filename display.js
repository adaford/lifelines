const numeric = value => value !== null && value !== undefined && value !== '' && Number.isFinite(Number(value)) ? Number(value) : null;

export function formatRating(value) {
  const rating = numeric(value);
  return rating === null ? '—' : rating.toFixed(1);
}

function heightParts(valueInches) {
  const value = numeric(valueInches);
  if (value === null || value < 0) return null;
  const inches = Math.round(value);
  return { feet: Math.floor(inches / 12), inches: inches % 12 };
}

export function formatHeight(inches) {
  const height = heightParts(inches);
  return height ? `${height.feet}'${height.inches}` : '—';
}

export function heightDescription(inches) {
  const height = heightParts(inches);
  return height ? `${height.feet} ${height.feet === 1 ? 'foot' : 'feet'} ${height.inches} ${height.inches === 1 ? 'inch' : 'inches'}` : '—';
}

const amount = '\\d+(?:\\.\\d+)?';
const arrow = '\\s*(?:→|->)\\s*';
const label = '\\b(?:Intelligence|Strength|Attractiveness|Social(?: ability)?|Creativity|Health|(?:Mental\\s+)?stability|Lifestyle|Relationships?)(?:\\s*:\\s*|\\s+)';
const valueEnd = '(?![\\p{L}\\p{M}\\p{N}_]|\\.\\d)(?!\\s*(?:→|->|%|percent\\b|per cent\\b|focus\\b|points?\\b|years?\\b|months?\\b|chance\\b|probability\\b))';
const ratingPattern = new RegExp(`(${label})(${amount})(?:(${arrow})(${amount}))?${valueEnd}`, 'giu');
const heightUnit = '(cm|inches|inch)';
const heightPair = new RegExp(`(\\bHeight(?:\\s*:\\s*|\\s+))(${amount})(?:\\s*${heightUnit})?(${arrow})(${amount})\\s*${heightUnit}\\b`, 'gi');
const heightSingle = new RegExp(`(\\bHeight(?:\\s*:\\s*|\\s+))(${amount})\\s*${heightUnit}\\b`, 'gi');
const heightInches = (value, unit) => Number(value) / (unit.toLowerCase() === 'cm' ? 2.54 : 1);

function formatValues(text) {
  return text
    .replace(/\bsocial ability\b/gi, match => match[0] === 'S' ? 'Social' : 'social')
    .replace(heightPair, (_, prefix, before, beforeUnit, separator, after, afterUnit) => `${prefix}${formatHeight(heightInches(before, beforeUnit || afterUnit))}${separator}${formatHeight(heightInches(after, afterUnit))}`)
    .replace(heightSingle, (_, prefix, value, unit) => `${prefix}${formatHeight(heightInches(value, unit))}`)
    .replace(ratingPattern, (match, prefix, before, separator, after) => {
      const values = [before, after].filter(value => value !== undefined).map(Number);
      if (values.some(value => value < 1 || value > 10)) return match;
      return `${prefix}${formatRating(before)}${separator === undefined ? '' : `${separator}${formatRating(after)}`}`;
    });
}

const escapePattern = value => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Format recorded prose at display time. Names take precedence over numbers:
// a character named "Health 7" must never become "Health 7.0".
export function formatStatNarrative(text, state) {
  const source = String(text ?? '');
  if (!source) return source;
  const people = [state, ...(state?.parents || []), ...(state?.siblings || []), ...(state?.children || []), state?.partner, ...(state?.encounters || []), state?.pregnancy?.otherParent, ...(state?.lineage || []), ...(state?.yearSummary?.parents || [])].filter(Boolean);
  const names = new Set(people.flatMap(person => [person.name, person.familyName, ...(person.children || []).map(child => child.name)]).filter(name => typeof name === 'string' && name.trim()).map(name => name.trim()));
  if (!names.size) return formatValues(source);
  const pattern = new RegExp(`(?<![\\p{L}\\p{M}\\p{N}_-])(?:${[...names].sort((a, b) => b.length - a.length).map(escapePattern).join('|')})(?![\\p{L}\\p{M}\\p{N}_-])`, 'gu');
  let result = '', cursor = 0;
  for (const match of source.matchAll(pattern)) {
    result += formatValues(source.slice(cursor, match.index)) + match[0];
    cursor = match.index + match[0].length;
  }
  return result + formatValues(source.slice(cursor));
}
