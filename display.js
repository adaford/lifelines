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

function infantInches(inches, age) {
  const value = numeric(inches);
  return Number.isFinite(age) && age >= 0 && age < 2 && value !== null && value >= 0 ? (Math.round(value * 10) / 10).toFixed(1) : null;
}

export function formatHeight(inches, age) {
  const infant = infantInches(inches, age);
  if (infant !== null) return `${infant}"`;
  const height = heightParts(inches);
  return height ? `${height.feet}'${height.inches}"` : '—';
}

export function heightDescription(inches, age) {
  const infant = infantInches(inches, age);
  if (infant !== null) return `${infant} ${Number(infant) === 1 ? 'inch' : 'inches'}`;
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

const outcomeStat = '(?:Intelligence|Strength|Attractiveness|Social(?: ability)?|Creativity|Health|(?:Mental\\s+)?stability|Lifestyle|Relationships?)';
const outcomePart = new RegExp(`^(?:(?<person>.+?):\\s*${outcomeStat}|(?<prefix>.*?)Your\\s+${outcomeStat}|(?<lifestylePrefix>.*?)Lifestyle)\\s+(?<before>${amount})${arrow}(?<after>${amount})(?<suffix>[.!?](?:\\s.*)?)?$`, 'iu');

// Separate recorded effects by person without changing saved prose or treating
// an ordinary semicolon in a custom story as an effect boundary.
export function splitEventOutcome(text) {
  const source = String(text ?? '');
  const parts = source.split(';');
  if (parts.length < 2) return [source];
  const parsed = parts.map((part, index) => {
    const match = outcomePart.exec(part.trim());
    if (!match || [match.groups.before, match.groups.after].some(value => Number(value) < 1 || Number(value) > 10)) return null;
    const { person, prefix, lifestylePrefix, suffix } = match.groups;
    if (index > 0 && (prefix || lifestylePrefix) || index < parts.length - 1 && suffix) return null;
    return { person: person?.trim() || null };
  });
  if (parsed.some(part => !part)) return [source];
  // A selected option can precede the first named person's recorded effects.
  // A later exact name lets us keep that person's following effects together.
  if (parsed[0].person) {
    const repeated = parsed.slice(1).find(part => part.person && parsed[0].person.endsWith(`. ${part.person}`));
    if (repeated) parsed[0].person = repeated.person;
  }
  const lines = [parts[0]];
  for (let index = 1; index < parts.length; index++) {
    if (parsed[index].person === parsed[index - 1].person) lines[lines.length - 1] += `;${parts[index]}`;
    else lines.push(parts[index].trimStart());
  }
  return lines;
}

function formatValues(text, age) {
  return text
    .replace(/\bsocial ability\b/gi, match => match[0] === 'S' ? 'Social' : 'social')
    .replace(heightPair, (_, prefix, before, beforeUnit, separator, after, afterUnit) => `${prefix}${formatHeight(heightInches(before, beforeUnit || afterUnit), age - 1)}${separator}${formatHeight(heightInches(after, afterUnit), age)}`)
    .replace(heightSingle, (_, prefix, value, unit) => `${prefix}${formatHeight(heightInches(value, unit), age)}`)
    .replace(ratingPattern, (match, prefix, before, separator, after) => {
      const values = [before, after].filter(value => value !== undefined).map(Number);
      if (values.some(value => value < 1 || value > 10)) return match;
      return `${prefix}${formatRating(before)}${separator === undefined ? '' : `${separator}${formatRating(after)}`}`;
    });
}

const escapePattern = value => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Format recorded prose at display time. Names take precedence over numbers:
// a character named "Health 7" must never become "Health 7.0".
export function formatStatNarrative(text, state, age = state?.age) {
  const source = String(text ?? '');
  if (!source) return source;
  const people = [state, ...(state?.parents || []), ...(state?.siblings || []), ...(state?.children || []), state?.partner, ...(state?.encounters || []), state?.pregnancy?.otherParent, ...(state?.lineage || []), ...(state?.yearSummary?.parents || [])].filter(Boolean);
  const names = new Set(people.flatMap(person => [person.name, person.familyName, ...(person.children || []).map(child => child.name)]).filter(name => typeof name === 'string' && name.trim()).map(name => name.trim()));
  if (!names.size) return formatValues(source, age);
  const pattern = new RegExp(`(?<![\\p{L}\\p{M}\\p{N}_-])(?:${[...names].sort((a, b) => b.length - a.length).map(escapePattern).join('|')})(?![\\p{L}\\p{M}\\p{N}_-])`, 'gu');
  let result = '', cursor = 0;
  for (const match of source.matchAll(pattern)) {
    result += formatValues(source.slice(cursor, match.index), age) + match[0];
    cursor = match.index + match[0].length;
  }
  return result + formatValues(source.slice(cursor), age);
}
