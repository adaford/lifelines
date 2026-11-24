import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { copyMetrics, narrativeEntries, withoutNarrative, auditEventCopy, loadCatalog } from '../scripts/audit-event-copy.mjs';
import { legacyLifeEventCopies } from '../life-event-copy-history.js';
import { pendingEventChoices } from '../engine.js';
import { SCHOOL_BALANCE } from '../balance.js';

const root = fileURLToPath(new URL('..', import.meta.url));
const events = await loadCatalog(root);
const baselineUrl = new URL('../.baselines/short-event-copy/', import.meta.url);
const hasBaseline = existsSync(new URL('events.js', baselineUrl));

test('every event, choice and age-specific narrative uses at most two concise sentences', t => {
  const before = structuredClone(events), report = auditEventCopy(events);
  assert.equal(report.counts.definitions, 1077);
  assert.equal(new Set(events.map(event => event.id)).size, events.length);
  assert.equal(report.counts.decisions, 81);
  assert.ok(report.counts.stageVariants > 3000, 'the limit applies to all authored age variants, not just the default description');
  assert.ok(report.counts.choices > 150, 'all choice narratives are included');
  assert.deepEqual(report.violations, [], 'every description must be nonempty and fit two sentences and 50 template words');
  assert.deepEqual(events, before, 'copy inspection is read-only');
  const stats = SCHOOL_BALANCE.honorsStats, scheduled = events.filter(event => event.scheduled && event.choices);
  assert.equal(scheduled.length, 2);
  for (const event of scheduled) for (const options of [stats.slice(0, 3), stats.slice(2)]) for (const choice of pendingEventChoices(event, { options })) {
    const metrics = copyMetrics(choice.description);
    assert.ok(choice.label && metrics.sentences >= 1 && metrics.sentences <= 2 && metrics.words <= 50, `${event.id}/${choice.id}: concrete honors copy`);
  }
  t.diagnostic(JSON.stringify(report.counts));
});

test('copy metrics recognize decimals without overlooking extra sentences or long text', () => {
  assert.deepEqual(copyMetrics('A tutor explains 2.5 exercises. You practice.'), { sentences: 2, words: 7 });
  const fake = { id: 'fixture', name: 'Fixture', description: 'First event. Second event. Third event.',
    descriptionsByStage: { child: 'Practice. '.repeat(3) }, choices: [{ id: 'yes', label: 'Yes', description: Array(51).fill('word').join(' ') }] };
  const report = auditEventCopy([fake]);
  assert.equal(report.violations.length, 3);
  assert.deepEqual(narrativeEntries([fake]).map(entry => entry.path), ['description', 'descriptionsByStage.child', 'choices.yes.description']);
});

test('copy comparison preserves stage coverage and every non-description gameplay field', () => {
  const original = { id: 'fixture', name: 'Original name', description: 'Original story.', baseChance: .05,
    descriptionsByStage: { child: 'Original childhood.', adult: 'Original adulthood.' },
    choices: [{ id: 'accept', label: 'Accept', description: 'Original choice.', statChanges: { social: .2 } }] };
  const rewritten = structuredClone(original);
  rewritten.description = 'Revised story.'; rewritten.descriptionsByStage.child = 'Revised childhood.';
  rewritten.choices[0].description = 'Revised choice.';
  assert.deepEqual(withoutNarrative(rewritten), withoutNarrative(original));
  const report = auditEventCopy([rewritten], [original]);
  assert.equal(report.changes.length, 3);
  assert.deepEqual(report.baseline.changedNonNarrative, []);
  for (const mutate of [event => { event.baseChance = .06; }, event => { event.name = 'Changed name'; },
    event => { event.choices[0].label = 'Different choice'; }, event => { event.choices[0].statChanges.social = .3; },
    event => { delete event.descriptionsByStage.child; }]) {
    const altered = structuredClone(rewritten); mutate(altered);
    assert.deepEqual(auditEventCopy([altered], [original]).baseline.changedNonNarrative, ['fixture']);
  }
});

// Later rule changes may change mechanics; the frozen catalog still proves that
// no ID or narrative was lost and that every rewritten story stays concise.
test('the frozen pre-edit full catalog keeps every ID and narrative, adding stories only for new events', { skip: hasBaseline ? false : 'Optional frozen copy baseline is absent' }, async t => {
  const baseline = await loadCatalog(fileURLToPath(baselineUrl)), oldIds = new Set(baseline.map(event => event.id));
  const report = auditEventCopy(events, baseline);
  assert.equal(report.baseline.definitions, 1073);
  assert.deepEqual(events.map(event => event.id).filter(id => oldIds.has(id)), baseline.map(event => event.id), 'retained IDs keep their order');
  assert.deepEqual(report.baseline.missingNarratives, []);
  assert.deepEqual(report.baseline.addedNarratives.filter(key => oldIds.has(key.split('/')[0])), [], 'only new events add narratives');
  assert.ok(report.changes.length > 0, 'the comparison must exercise actual shortened narratives');
  for (const change of report.changes) {
    assert.ok(change.before && change.after && change.before !== change.after);
    assert.ok(change.afterMetrics.sentences <= 2 && change.afterMetrics.words <= 50, `${change.eventId}/${change.path}`);
  }
  t.diagnostic(`${report.changes.length} changed description fields; ${report.baseline.changedNonNarrative.length} events changed other fields.`);
});

test('historical story recognition reproduces every frozen age variant and maps it to the matching concise variant', { skip: hasBaseline ? false : 'Optional frozen copy baseline is absent' }, async t => {
  const baseline = new Map((await loadCatalog(fileURLToPath(baselineUrl))).map(event => [event.id, event]));
  const before = structuredClone(events);
  let checked = 0;
  for (const event of events) {
    const copies = legacyLifeEventCopies(event), old = baseline.get(event.id);
    if (!event.descriptionsByStage) {
      assert.deepEqual(copies, []);
      continue;
    }
    assert.equal(copies.length, Object.keys(old.descriptionsByStage).length, event.id);
    assert.ok(copies.some(copy => copy.description === old.description), `${event.id}: original default story remains recognizable`);
    for (const [stage, description] of Object.entries(old.descriptionsByStage)) {
      const matches = copies.filter(copy => copy.description === description);
      assert.equal(matches.length, 1, `${event.id}/${stage}: the exact old story is reproduced once`);
      assert.equal(matches[0].shortDescription, event.descriptionsByStage[stage], `${event.id}/${stage}: no age reinterpretation`);
      assert.equal(matches[0].copyOnly, true);
      checked++;
    }
  }
  assert.equal(checked, 3664);
  assert.deepEqual(events, before, 'recognition does not rewrite catalog descriptions or mechanics');
  t.diagnostic(`${checked} frozen age-specific stories reproduced byte-for-byte with their corresponding concise descriptions.`);
});
