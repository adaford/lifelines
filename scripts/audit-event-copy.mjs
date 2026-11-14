// Audit every exported event, choice and age-specific narrative. Optional
// frozen-runtime comparison proves that only description strings changed.
// node scripts/audit-event-copy.mjs --baseline .git/short-event-copy-baseline --output test-artifacts/short-event-copy-catalog.json
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { isDeepStrictEqual } from 'node:util';

export const COPY_LIMITS = Object.freeze({ sentences: 2, words: 50 });
const sentenceSegments = new Intl.Segmenter('en', { granularity: 'sentence' });
const wordSegments = new Intl.Segmenter('en', { granularity: 'word' });
export function copyMetrics(text) {
  return {
    sentences: [...sentenceSegments.segment(text)].filter(part => part.segment.trim()).length,
    words: [...wordSegments.segment(text)].filter(part => part.isWordLike).length,
  };
}
export async function loadCatalog(directory) {
  const load = filename => import(pathToFileURL(resolve(directory, filename)).href);
  const [personal, family, fame] = await Promise.all([load('events.js'), load('family-events.js'), load('fame-events.js')]);
  return [...personal.EVENTS, ...family.FAMILY_EVENTS, ...fame.FAME_EVENTS];
}
export function narrativeEntries(events) {
  return events.flatMap(event => [
    { eventId: event.id, path: 'description', text: event.description },
    ...Object.entries(event.descriptionsByStage || {}).map(([stage, text]) => ({ eventId: event.id, path: `descriptionsByStage.${stage}`, text })),
    ...(event.choices || []).flatMap(choice => [
      { eventId: event.id, choiceId: choice.id, path: `choices.${choice.id}.description`, text: choice.description },
      ...Object.entries(choice.descriptionsByStage || {}).map(([stage, text]) => ({ eventId: event.id, choiceId: choice.id, path: `choices.${choice.id}.descriptionsByStage.${stage}`, text })),
    ]),
  ]);
}
// Retain all other values and array order, including names, labels, identifiers,
// stage keys, random rates, gates, effects and choice availability.
export function withoutNarrative(value) {
  if (Array.isArray(value)) return value.map(withoutNarrative);
  if (!value || typeof value !== 'object') return value;
  return Object.fromEntries(Object.entries(value).filter(([key]) => key !== 'description').map(([key, item]) =>
    [key, key === 'descriptionsByStage' ? Object.fromEntries(Object.keys(item).map(stage => [stage, null])) : withoutNarrative(item)]));
}
const entryKey = entry => `${entry.eventId}/${entry.path}`;
export function auditEventCopy(events, baseline = null) {
  const entries = narrativeEntries(events);
  const rows = entries.map(entry => ({ ...entry, ...(typeof entry.text === 'string' ? copyMetrics(entry.text) : { sentences: 0, words: 0 }) }));
  const violations = rows.filter(row => typeof row.text !== 'string' || !row.text.trim()
    || row.sentences > COPY_LIMITS.sentences || row.words > COPY_LIMITS.words);
  const counts = {
    definitions: events.length,
    decisions: events.filter(event => event.choices?.length).length,
    choices: events.reduce((sum, event) => sum + (event.choices?.length || 0), 0),
    descriptions: entries.length,
    stageVariants: entries.filter(entry => entry.path.includes('descriptionsByStage.')).length,
    maximumSentences: Math.max(0, ...rows.map(row => row.sentences)),
    maximumWords: Math.max(0, ...rows.map(row => row.words)),
    overPreferred40Words: rows.filter(row => row.words > 40).length,
  };
  const report = { limits: COPY_LIMITS, counts, violations, baseline: null, changes: [] };
  if (baseline) {
    const previous = narrativeEntries(baseline), priorByKey = new Map(previous.map(entry => [entryKey(entry), entry]));
    const currentByKey = new Map(entries.map(entry => [entryKey(entry), entry]));
    const oldById = new Map(baseline.map(event => [event.id, event]));
    const changedNonNarrative = events.filter(event => !oldById.has(event.id)
      || !isDeepStrictEqual(withoutNarrative(event), withoutNarrative(oldById.get(event.id)))).map(event => event.id);
    report.baseline = {
      definitions: baseline.length,
      sameEventOrder: isDeepStrictEqual(events.map(event => event.id), baseline.map(event => event.id)),
      changedNonNarrative,
      missingNarratives: previous.filter(entry => !currentByKey.has(entryKey(entry))).map(entryKey),
      addedNarratives: entries.filter(entry => !priorByKey.has(entryKey(entry))).map(entryKey),
    };
    report.changes = entries.filter(entry => priorByKey.has(entryKey(entry)) && entry.text !== priorByKey.get(entryKey(entry)).text).map(entry => ({
      eventId: entry.eventId, ...(entry.choiceId ? { choiceId: entry.choiceId } : {}), path: entry.path,
      before: priorByKey.get(entryKey(entry)).text, after: entry.text,
      beforeMetrics: copyMetrics(priorByKey.get(entryKey(entry)).text), afterMetrics: copyMetrics(entry.text),
    }));
  }
  return report;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2), option = key => args.includes(key) ? args[args.indexOf(key) + 1] : null;
  const root = fileURLToPath(new URL('..', import.meta.url));
  const events = await loadCatalog(root), baselinePath = option('--baseline');
  const report = auditEventCopy(events, baselinePath ? await loadCatalog(resolve(baselinePath)) : null);
  const output = option('--output');
  if (output) {
    await mkdir(dirname(resolve(output)), { recursive: true });
    await writeFile(output, `${JSON.stringify(report, null, 2)}\n`);
  }
  console.log(JSON.stringify({ ...report.counts, violations: report.violations.length, changedDescriptions: report.changes.length,
    baseline: report.baseline, ...(output ? { output } : {}) }, null, 2));
  if (report.violations.length || report.baseline && (!report.baseline.sameEventOrder || report.baseline.changedNonNarrative.length
    || report.baseline.missingNarratives.length || report.baseline.addedNarratives.length)) process.exitCode = 1;
}
