import test from 'node:test';
import assert from 'node:assert/strict';
import { LIFE_EVENT_STATS, LIFE_EVENT_STAGES, LIFE_PERSONAL_EVENTS, LIFE_FAMILY_EVENTS, eventDescriptionAtAge } from '../life-events.js';
import { EVENTS, eventChances } from '../events.js';
import { FAMILY_EVENTS, familyEventChances } from '../family-events.js';
import { FAME_EVENTS } from '../fame-events.js';

const all = [...EVENTS, ...FAMILY_EVENTS, ...FAME_EVENTS];
const additions = [...LIFE_PERSONAL_EVENTS, ...LIFE_FAMILY_EVENTS];
const stats = Object.fromEntries(LIFE_EVENT_STATS.filter(key => key !== 'lifestyle').map(key => [key, 5]));
const stateAt = age => ({ age, stats: { ...stats }, lifestyle: 5, focus: { work: 2, social: 2, family: 2, self: 2, creative: 2 }, parents: [], children: [], siblings: [] });
const targetOf = event => event.householdLifestyle ? 'lifestyle' : event.relationship ? 'relationship' : Object.keys(event.statChanges || event.subjectChanges || {})[0];
const sourceOf = event => event.relationshipFactor ? 'relationship' : event.statFactors[0][0];

test('ordinary life events cover every other stat in both signs at every appropriate life stage and family role', () => {
  for (const role of ['personal', 'parent', 'partner', 'child', 'sibling']) {
    const keys = role === 'personal' ? LIFE_EVENT_STATS : [...LIFE_EVENT_STATS, 'relationship'];
    for (const stage of LIFE_EVENT_STAGES) {
      if (['parent', 'partner'].includes(role) && stage.min < 18) continue;
      const state = stateAt(role === 'personal' ? stage.min : Math.max(18, Math.min(84, stage.min)));
      const subject = { id: 'relative', name: 'Jamie', age: stage.min, stats: { ...stats }, relationship: 5, alive: true };
      if (role === 'parent') state.parents = [subject];
      if (role === 'child') state.children = [subject];
      if (role === 'sibling') state.siblings = [subject];
      if (role === 'partner') state.partner = subject;
      const rates = new Map((role === 'personal' ? eventChances(state, state.stats) : familyEventChances(state, state.stats)).map(rate => [rate.eventId || rate.id, rate.chance]));
      const eligible = additions.filter(event => (event.subjectType || 'personal') === role && rates.get(event.id) > 0);
      for (const source of keys) for (const target of keys.filter(key => key !== source)) for (const kind of ['positive', 'negative']) {
        const matching = eligible.filter(event => sourceOf(event) === source && targetOf(event) === target && event.kind === kind);
        assert.equal(matching.length, 1, `${role}/${stage.id}: ${source} -> ${target} ${kind}`);
        assert.ok(matching[0].descriptionsByStage[stage.id], 'coverage requires an authored story for the actual age');
      }
    }
  }
});

test('new catalog effects have one noncausal target and balanced signs without excessive neutral-age odds', () => {
  assert.equal(LIFE_PERSONAL_EVENTS.length, 112);
  assert.equal(LIFE_FAMILY_EVENTS.length, 576);
  assert.equal(new Set(all.map(event => event.id)).size, all.length);
  assert.equal(additions.filter(event => event.kind === 'positive').length, additions.filter(event => event.kind === 'negative').length);
  const signed = all.filter(event => ['positive', 'negative'].includes(event.kind));
  const positiveShare = signed.filter(event => event.kind === 'positive').length / signed.length;
  assert.ok(positiveShare >= .45 && positiveShare <= .55, `full catalog positive share ${positiveShare}`);
  for (const event of additions) {
    assert.notEqual(sourceOf(event), targetOf(event), event.id);
    assert.equal(Object.keys(event.statChanges || event.subjectChanges || {}).length + Number(Boolean(event.relationship)) + Number(Boolean(event.householdLifestyle)), 1, event.id);
    const amount = event.householdLifestyle || event.relationship || Object.values(event.statChanges || event.subjectChanges)[0];
    assert.equal(Math.sign(amount), event.kind === 'positive' ? 1 : -1);
    assert.ok(event.name.length <= 100 && event.id.length <= 100);
    assert.equal(event.years, targetOf(event) === 'lifestyle' ? 1 : 0);
  }
  const state = stateAt(30);
  state.parents = [{ id: 'parent', name: 'Sam', age: 60, stats: { ...stats }, relationship: 5 }];
  const ids = new Set(additions.map(event => event.id));
  const sum = rates => rates.filter(rate => ids.has(rate.eventId || rate.id)).reduce((total, rate) => total + rate.chance, 0);
  assert.ok(sum(eventChances(state, stats)) < .2, 'new personal catalog stays below .2 expected events at neutral stats');
  assert.ok(sum(familyEventChances(state, stats)) < .1, 'new relative catalog stays below .1 expected events per neutral relative');
});

test('stories are age-appropriate, sustained, and selected without rewriting the catalog', () => {
  const event = LIFE_PERSONAL_EVENTS.find(event => event.id === 'life_personal_health_strength_support');
  const snapshot = structuredClone(event);
  assert.match(eventDescriptionAtAge(event, 0), /baby group.*reaching, rolling/s);
  assert.match(eventDescriptionAtAge(event, 2), /preschool.*climbing and balance/s);
  assert.match(eventDescriptionAtAge(event, 13), /youth program.*conditioning/s);
  assert.match(eventDescriptionAtAge(event, 70), /older adults.*appropriate support/s);
  assert.equal(eventDescriptionAtAge({ description: 'An old story.' }, 70), 'An old story.');
  assert.deepEqual(event, snapshot);
  for (const event of additions) for (const description of Object.values(event.descriptionsByStage)) {
    assert.ok(description.length > 100 && description.length <= 1000, event.id);
    assert.doesNotMatch(description, /\{(?:who|poss)\}/, event.id);
    if (targetOf(event) === 'stability') assert.match(description, /dependable|trusted|regular support|reliable visitor/, event.id);
  }
});

test('guardians use parent coverage and dead or departed relatives cannot receive new events', () => {
  const state = stateAt(10);
  state.guardian = { id: 'guardian', name: 'Alex', age: 65, stats: { ...stats }, relationship: 5 };
  const rates = () => familyEventChances(state, stats).filter(rate => rate.eventId.startsWith('life_'));
  assert.equal(rates().filter(rate => rate.chance > 0).length, 144);
  state.guardian.alive = false;
  assert.ok(rates().every(rate => rate.chance === 0));
  delete state.guardian;
  state.parents = [{ id: 'dad', name: 'Alex', age: 40, stats: { ...stats }, relationship: 5, abandonedAt: 5 }];
  assert.ok(rates().every(rate => rate.chance === 0));
});
