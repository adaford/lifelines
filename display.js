import { lifestyleDisplayValue } from './lifestyle.js?v=perk-affinity-overflow';
export const escapeHTML = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

export const focusCapLabel = (label, maximum) => `'${String(label)}' focus max ${maximum}`;

const numeric = value => value !== null && value !== undefined && value !== '' && Number.isFinite(Number(value)) ? Number(value) : null;

export function formatRating(value) {
  const rating = numeric(value);
  return rating === null ? '—' : rating.toFixed(1);
}
export function formatLifestyleRating(value) {
  const rating = numeric(value);
  return rating === null ? '—' : lifestyleDisplayValue(rating).toFixed(1);
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
const ratingAmount = `-?${amount}`;
const arrow = '\\s*(?:→|->)\\s*';
const label = '\\b(?:Intelligence|Strength|Attractiveness|Social(?: ability)?|Creativity|Health|(?:Mental\\s+)?stability|Lifestyle|Relationships?)(?:\\s*:\\s*|\\s+)';
const valueEnd = '(?![\\p{L}\\p{M}\\p{N}_]|\\.\\d)(?!\\s*(?:→|->|%|percent\\b|per cent\\b|focus\\b|points?\\b|years?\\b|months?\\b|chance\\b|probability\\b))';
const ratingPattern = new RegExp(`(${label})(${ratingAmount})(?:(${arrow})(${ratingAmount}))?${valueEnd}`, 'giu');
const heightUnit = '(cm|inches|inch)';
const heightPair = new RegExp(`(\\bHeight(?:\\s*:\\s*|\\s+))(${amount})(?:\\s*${heightUnit})?(${arrow})(${amount})\\s*${heightUnit}\\b`, 'gi');
const heightSingle = new RegExp(`(\\bHeight(?:\\s*:\\s*|\\s+))(${amount})\\s*${heightUnit}\\b`, 'gi');
const heightInches = (value, unit) => Number(value) / (unit.toLowerCase() === 'cm' ? 2.54 : 1);

const outcomeStat = '(?:Intelligence|Strength|Attractiveness|Social(?: ability)?|Creativity|Health|(?:Mental\\s+)?(?:in)?stability|Lifestyle|Relationships?|Bonds?)';
const focusName = '(?:Arts\\s*&\\s*crafts|Family\\s+time|Extracurriculars?|Electronics|Yourself|Friends|College|Career|School|Sports|Study|Family|Play|Rest|Work)';
const signedAmount = `[+−-](?:${amount}|\\.\\d+)`;
const personLabel = '[^;\\r\\n]+?:\\s*';
const effectPatterns = [
  new RegExp(`^(?:Your\\s+${outcomeStat}|${personLabel}${outcomeStat}|(?:Household\\s+)?Lifestyle|Relationships?)\\s+(?:(?:learning ability|aptitude|affinity)\\s+)?[+-]?${amount}${arrow}[+-]?${amount}${valueEnd}`, 'iu'),
  new RegExp(`^(?:Your\\s+|${personLabel})?${outcomeStat}\\s+${signedAmount}${valueEnd}`, 'iu'),
  new RegExp(`^(?:${personLabel})?${signedAmount}\\s+${outcomeStat}(?:\\s+(?:learning ability|aptitude|affinity)(?:\\s+while famous)?)?\\b`, 'iu'),
  new RegExp(`^(?:Focus\\s+)?['"]?(?<focus>${focusName})['"]?\\s+(?:focus\\s+)?max\\s+(?<maximum>\\d+)${valueEnd}`, 'iu'),
  new RegExp(`^${signedAmount}\\s+['"]?${focusName}['"]?\\s+(?:focus capacity|minimum focus)\\b`, 'iu'),
  new RegExp(`^['"]?${focusName}['"]?\\s+(?:focus\\s+)?(?:minimum|min|capacity)\\s+[+-]?\\d+${valueEnd}`, 'iu'),
  new RegExp(`^${signedAmount}\\s+(?:total\\s+)?focus points?\\b`, 'iu'),
  new RegExp(`^(?:Total\\s+)?focus points?\\s+[+-]?${amount}(?:${arrow}[+-]?${amount})?${valueEnd}`, 'iu'),
  new RegExp(`^Fame(?: rating)?\\s+${ratingAmount}${arrow}${ratingAmount}${valueEnd}|^Fame begins at\\s+${ratingAmount}/10\\b`, 'iu'),
  new RegExp(`^Fame(?: household)? support\\s+[+-]?(?:${amount}|\\.\\d+)${arrow}[+-]?(?:${amount}|\\.\\d+)${valueEnd}`, 'iu'),
  /^(?:Temporary effects:\s*|Duration:\s*)?\d+\s+years?\b/iu,
  /^No stat changes\b/iu,
];

function recordedEffect(source, allowPrefix) {
  const starts = [source.match(/^\s*/u)[0].length];
  if (allowPrefix) {
    // A recorded choice label may precede the first effect. Do not step over
    // custom semicolons/newlines or split periods inside a relative's name.
    const first = source.split(/[;\r\n]/u, 1)[0];
    for (const match of first.matchAll(/[.!?][ \t]+/gu)) starts.push(match.index + match[0].length);
  }
  for (const start of starts) {
    // Prefer the first complete effect over a later "Name: Stat" match that
    // could otherwise swallow an earlier buff, cap, duration or fame effect.
    const match = effectPatterns.map(pattern => pattern.exec(source.slice(start)))
      .filter(match => match && /^(?:\s*[.!?;\r\n]|\s*$)/u.test(source.slice(start + match[0].length)))
      .sort((left, right) => left[0].length - right[0].length)[0];
    if (!match) continue;
    const rendered = match.groups?.focus ? focusCapLabel(match.groups.focus, match.groups.maximum) : match[0];
    return { end: start + match[0].length, rendered: source.slice(0, start) + rendered };
  }
  return null;
}

// Split only a leading sequence of complete, recognized effects. Decimal
// points and names stay inside their effect; unknown prose stays untouched.
// This reads historical strings without modifying the saved record.
export function splitEventOutcome(text) {
  const original = String(text ?? '');
  let source = original, current = recordedEffect(source, true);
  if (!current) return [original];
  const lines = [];
  while (current) {
    const tail = source.slice(current.end);
    const separator = /^([.!?]?)[ \t]*(?:;[ \t]*|\r?\n[ \t]*)/u.exec(tail)
      || /^([.!?])[ \t]+/u.exec(tail);
    const remaining = separator ? tail.slice(separator[0].length).trimStart() : '';
    const next = separator && recordedEffect(remaining, false);
    if (!next) { lines.push(current.rendered + tail); break; }
    lines.push(current.rendered + separator[1]);
    source = remaining; current = next;
  }
  return lines;
}

// Retain the existing export for callers; both surfaces share one rule.
export const splitJournalEventOutcome = splitEventOutcome;

function formatValues(text, age) {
  return text
    .replace(/\bsocial ability\b/gi, match => match[0] === 'S' ? 'Social' : 'social')
    .replace(heightPair, (_, prefix, before, beforeUnit, separator, after, afterUnit) => `${prefix}${formatHeight(heightInches(before, beforeUnit || afterUnit), age - 1)}${separator}${formatHeight(heightInches(after, afterUnit), age)}`)
    .replace(heightSingle, (_, prefix, value, unit) => `${prefix}${formatHeight(heightInches(value, unit), age)}`)
    .replace(ratingPattern, (match, prefix, before, separator, after) => {
      const values = [before, after].filter(value => value !== undefined).map(Number);
      // Singles outside the base range may be ordinary prose. Explicit rating
      // transitions also describe effective totals beyond the base bounds.
      if (separator === undefined && values.some(value => value < 0 || value > 10)) return match;
      const format = /lifestyle/i.test(prefix) ? formatLifestyleRating : formatRating;
      return `${prefix}${format(before)}${separator === undefined ? '' : `${separator}${format(after)}`}`;
    });
}

const escapePattern = value => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Format recorded prose at display time. Names take precedence over numbers:
// a character named "Health 7" must never become "Health 7.0".
export function formatStatNarrative(text, state, age = state?.age) {
  const source = String(text ?? '');
  if (!source) return source;
  const people = [state, state?.guardian, ...(state?.parents || []), ...(state?.siblings || []), ...(state?.children || []), state?.partner, ...(state?.encounters || []), state?.pregnancy?.otherParent, ...(state?.lineage || []), ...(state?.yearSummary?.parents || [])].filter(Boolean);
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
