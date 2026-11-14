// Reproducible catalog audit: source/target ownership, age coverage, polarity,
// and an optional exact comparison with a frozen pre-change normalized catalog.
// node scripts/audit-events.mjs --output test-artifacts/life-events-audit.json
import { writeFile, readFile } from 'node:fs/promises';
import { EVENTS } from '../engine.js';
import { LIFE_EVENT_STATS, LIFE_EVENT_STAGES, eventDescriptionAtAge } from '../life-events.js';
import { eventChances } from '../events.js';
import { familyEventChances } from '../family-events.js';

const args = process.argv.slice(2);
const option = key => args.includes(key) ? args[args.indexOf(key) + 1] : null;
const stats = Object.fromEntries(LIFE_EVENT_STATS.filter(key => key !== 'lifestyle').map(key => [key, 5]));
function sources(event) {
  const owner = event.subjectType || 'player';
  const list = (event.statFactors || []).map(([stat, direction]) => ({ owner: stat === 'lifestyle' ? 'household' : owner, stat, direction }));
  if (event.relationshipFactor) list.push({ owner, stat: 'relationship', direction: event.relationshipFactor });
  for (const field of ['minStats', 'maxStats']) for (const stat of Object.keys(event[field] || {})) list.push({ owner: stat === 'lifestyle' ? 'household' : owner, stat, direction: field === 'minStats' ? 'high' : 'low' });
  for (const [field, direction] of [['minStability', 'high'], ['maxStability', 'low']]) if (event[field] !== undefined) list.push({ owner, stat: 'stability', direction });
  if (event.requiresFame || event.minFame !== undefined || event.maxFame !== undefined) list.push({ owner: 'player', stat: 'fame', direction: 'conditional' });
  if (['good_grades', 'poor_grades'].includes(event.id) || (event.conditions || []).some(condition => ['excellentSchoolGrade', 'poorSchoolGrade'].includes(condition))) list.push({ owner: 'player', stat: 'intelligence', direction: 'grade' });
  if (event.id === 'household_parent_abandonment') list.push({ owner, stat: 'stability', direction: 'low' }, { owner, stat: 'relationship', direction: 'low' });
  return [...new Map(list.map(source => [`${source.owner}:${source.stat}:${source.direction}`, source])).values()];
}
function effects(outcome, event) {
  const result = [];
  for (const field of ['statChanges', 'playerChanges', 'subjectChanges', 'modifiers', 'aptitudeChanges']) for (const [stat, amount] of Object.entries(outcome[field] || {})) if (amount) {
    result.push({ owner: stat === 'lifestyle' ? 'household' : field === 'subjectChanges' ? event.subjectType : 'player', stat, amount, field });
  }
  for (const [field, owner, stat] of [['relationship', event.subjectType, 'relationship'], ['householdLifestyle', 'household', 'lifestyle'], ['lifestyle', 'household', 'lifestyle'], ['fameSupport', 'household', 'lifestyle'], ['fameChange', 'player', 'fame']]) if (outcome[field]) result.push({ owner, stat, amount: outcome[field], field });
  return result;
}
const definitions = EVENTS.map(event => ({
  id: event.id, name: event.name, kind: event.kind, scope: event.subjectType || 'personal',
  minAge: event.minAge, maxAge: event.maxAge, minPlayerAge: event.minPlayerAge, maxPlayerAge: event.maxPlayerAge,
  baseChance: event.baseChance, supplemental: Boolean(event.supplemental), sources: sources(event),
  outcomes: [event, ...(event.choices || [])].map(outcome => ({ id: outcome.id, effects: effects(outcome, event) })),
  stories: event.descriptionsByStage || { original: event.description },
}));
const conflicts = definitions.flatMap(event => event.outcomes.flatMap(outcome => outcome.effects.filter(effect => event.sources.some(source => source.owner === effect.owner && source.stat === effect.stat)).map(effect => ({ event: event.id, outcome: outcome.id, ...effect }))));
const coverage = [];
for (const role of ['personal', 'parent', 'partner', 'child', 'sibling']) for (const stage of LIFE_EVENT_STAGES) {
  if (['parent', 'partner'].includes(role) && stage.min < 18) continue;
  const state = { age: role === 'personal' ? stage.min : Math.max(18, Math.min(84, stage.min)), stats: { ...stats }, lifestyle: 5, focus: { work: 2, social: 2, family: 2, self: 2, creative: 2 }, parents: [], children: [], siblings: [] };
  const person = { id: 'relative', name: 'Jamie', age: stage.min, stats: { ...stats }, relationship: 5 };
  if (role === 'parent') state.parents = [person];
  if (role === 'partner') state.partner = person;
  if (role === 'child') state.children = [person];
  if (role === 'sibling') state.siblings = [person];
  const rates = role === 'personal' ? eventChances(state, stats) : familyEventChances(state, stats);
  const available = new Set(rates.filter(rate => rate.chance > 0).map(rate => rate.eventId || rate.id));
  const keys = role === 'personal' ? LIFE_EVENT_STATS : [...LIFE_EVENT_STATS, 'relationship'];
  for (const source of keys) for (const target of keys.filter(stat => stat !== source)) for (const kind of ['positive', 'negative']) {
    const candidates = definitions.filter(event => event.scope === role && available.has(event.id) && event.kind === kind
      && event.sources.some(cause => cause.stat === source)
      && event.outcomes.some(outcome => outcome.effects.some(effect => effect.stat === target && Math.sign(effect.amount) === (kind === 'positive' ? 1 : -1))));
    coverage.push({ role, stage: stage.id, source, target, kind, eventIds: candidates.map(event => event.id) });
  }
}
const signed = EVENTS.filter(event => ['positive', 'negative'].includes(event.kind));
const report = {
  catalog: { definitions: EVENTS.length, decisions: EVENTS.filter(event => event.choices).length, kinds: Object.fromEntries(['positive', 'negative', 'neutral'].map(kind => [kind, EVENTS.filter(event => event.kind === kind).length])), positiveShareOfSigned: signed.filter(event => event.kind === 'positive').length / signed.length },
  scope: 'Seven personal ratings, household Lifestyle, and family Relationship. Parent and guardian share adult parent stories. Partner stories are adult-only. Fame is an optional separate public-status system, not a birth or childhood ability.',
  coverage: { cells: coverage.length, missing: coverage.filter(cell => !cell.eventIds.length), matrix: coverage },
  causalConflicts: conflicts,
  definitions,
};
const baselinePath = option('--baseline');
if (baselinePath) {
  const baseline = JSON.parse(await readFile(baselinePath, 'utf8'));
  const current = new Map(EVENTS.map(event => [event.id, event]));
  report.baseline = { definitions: baseline.length, removed: baseline.filter(event => !current.has(event.id)).map(event => event.id), changed: baseline.filter(event => current.has(event.id) && JSON.stringify(event) !== JSON.stringify(current.get(event.id))).map(event => event.id) };
}
const output = option('--output');
if (output) await writeFile(output, `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify({ ...report.catalog, coverageCells: coverage.length, missing: report.coverage.missing.length, causalConflicts: conflicts.length, baseline: report.baseline, output }, null, 2));
if (conflicts.length || report.coverage.missing.length || report.baseline?.removed.length || report.baseline?.changed.length) process.exitCode = 1;
