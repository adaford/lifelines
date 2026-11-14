import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import * as game from '../engine.js';
import { BIRTH_CONDITIONS, aptitudeBounds, perkAffinityBonus } from '../birth-conditions.js';

const copy = value => structuredClone(value);
const keys = ['intelligence', 'strength', 'attractiveness', 'social', 'creativity', 'health', 'stability'];
const values = value => Object.fromEntries(keys.map(key => [key, value]));
const calm = { eventRandom: () => 1, mortalityRandom: () => 1, growthRandom: () => 0, parentCareerRandom: () => 1, fameRandom: () => 1 };
const positive = ['rapid_processing', 'strong_working_memory', 'verbal_aptitude', 'spatial_reasoning', 'number_sense'];
const negative = ['deliberate_processing', 'working_memory_difficulty', 'slow_learner', 'forgetful', 'spatial_difficulty'];
const baselineUrl = new URL('../.git/affinity-overflow-baseline/engine.js', import.meta.url);
const baseline = existsSync(baselineUrl) ? await import(baselineUrl.href) : null;
function lifeAt(runtime, age, seed = 71026) {
  const state = runtime.createGame({ seed });
  while (state.age < age) {
    if (runtime.needsEducationChoice(state)) assert.equal(runtime.chooseEducation(state, 'work').ok, true);
    assert.equal(runtime.advanceYear(state, calm).ok, true);
  }
  if (runtime.needsEducationChoice(state)) assert.equal(runtime.chooseEducation(state, 'work').ok, true);
  return state;
}
function roundTrip(state) {
  const encoded = JSON.stringify(state), original = copy(state);
  assert.equal(game.validateSave(state), true);
  const loaded = game.migrateSave(JSON.parse(encoded));
  assert.equal(JSON.stringify(loaded), encoded, 'loading neither clips nor reapplies recorded perks');
  game.eventOdds(loaded); game.annualForecast(loaded); game.datingPotential(loaded);
  assert.equal(JSON.stringify(loaded), encoded, 'derived reads preserve all saved fields and RNG');
  assert.deepEqual(game.migrateSave(copy(loaded)), original, 'a second load is identical');
  assert.deepEqual(state, original, 'validation and migration never mutate input');
}
function family() {
  const state = lifeAt(game, 25);
  state.encounters = []; state.pregnancy = null;
  assert.equal(game.haveChild(state).ok, true);
  state.siblings = [{ ...copy(state.children[0]), id: 'overflow-sibling' }];
  state.partner = { ...copy(state.parents.find(person => person.gender === 'female')), id: 'overflow-partner', age: 25,
    relationship: 5, yearsTogether: 1, married: false, lastProposalAge: -1 };
  state.guardian = { ...copy(state.parents[0]), id: 'overflow-guardian', guardianRole: 'aunt', adoptedAt: 3 };
  state.pregnancy = { otherParent: copy(state.partner), carrierId: state.partner.id, carrierName: state.partner.name,
    startedAge: state.age, dueAge: state.age + 1, casual: false };
  state.lineage = [{ ...copy(state.parents[0]), generation: 1, money: 100, estate: 90, share: 90, children: [], retired: true }];
  for (const person of [state, ...state.parents, state.guardian, ...state.children, ...state.siblings, state.partner, state.pregnancy.otherParent, ...state.lineage]) {
    person.conditions = []; person.aptitudes = values(0);
  }
  state.yearSummary = null;
  assert.equal(game.validateSave(state), true);
  return state;
}
const slots = [
  ['player', state => state], ['mother', state => state.parents[0]], ['father', state => state.parents[1]],
  ['guardian', state => state.guardian], ['child', state => state.children[0]], ['sibling', state => state.siblings[0]],
  ['partner', state => state.partner], ['pregnancy copy', state => state.pregnancy.otherParent], ['ancestor', state => state.lineage[0]],
  ['prospect', state => {
    if (!state.encounters.length) {
      state.encounters = [{ ...copy(state.partner), id: 'overflow-prospect' }];
      state.partner = null; state.pregnancy = null;
    }
    return state.encounters[0];
  }],
];

test('supported positive and negative perk totals round-trip in every saved actor location', () => {
  const base = family();
  for (const [name, actor] of slots) for (const [conditions, intelligence] of [[positive, 8], [negative, -8]]) {
    const state = copy(base), person = actor(state);
    person.conditions = [...conditions]; person.aptitudes.intelligence = intelligence;
    assert.equal(Math.abs(perkAffinityBonus(person, 'intelligence')), 5, name);
    assert.equal(game.validateSave(state), true, `${name}: ${intelligence}`);
    roundTrip(state);
  }
});

test('unsupported, noninteger and nonfinite affinity overflow is rejected without rewriting any actor', () => {
  const base = family();
  for (const [name, actor] of slots) {
    for (const [conditions, intelligence] of [
      [[], 4], [[], -4], [['rapid_processing'], 5], [['rapid_processing'], -4],
      [['deliberate_processing'], -5], [['deliberate_processing'], 4],
      [['rapid_processing', 'deliberate_processing'], 4], [['rapid_processing', 'deliberate_processing'], -4],
      [['rapid_processing', 'strong_working_memory', 'deliberate_processing'], 5],
      [positive, 9], [negative, -9], [positive, 3.5], [negative, -3.5],
      [positive, NaN], [positive, Infinity], [negative, -Infinity], [positive, '4'],
    ]) {
      const state = copy(base), person = actor(state);
      person.conditions = [...conditions]; person.aptitudes.intelligence = intelligence;
      const before = copy(state);
      assert.equal(game.validateSave(state), false, `${name}: unsupported ${intelligence} with ${conditions}`);
      assert.equal(game.migrateSave(state), null, name);
      assert.deepEqual(state, before, 'rejection never repairs or mutates invalid data');
    }
    const supported = copy(base), person = actor(supported);
    person.conditions = ['rapid_processing', 'strong_working_memory', 'deliberate_processing'];
    person.aptitudes.intelligence = 4;
    assert.deepEqual(aptitudeBounds(person, 'intelligence'), { min: -3, max: 4 }, 'net bonuses determine the interval');
    roundTrip(supported);
    person.conditions = ['rapid_processing', 'rapid_processing'];
    assert.equal(game.validateSave(supported), false, 'repeated perk IDs cannot manufacture overflow support');
    person.conditions = ['invented-perk'];
    assert.equal(game.validateSave(supported), false);
  }
  for (const version of [17, 18, 19]) for (const [condition, value] of [['rapid_processing', 3], ['deliberate_processing', -3]]) {
    const old = game.createGame({ seed: 12791 });
    for (const person of [old, ...old.parents]) { person.conditions = []; person.aptitudes = values(0); }
    old.conditions = [condition]; old.aptitudes.intelligence = value; old.version = version;
    const migrated = game.migrateSave(copy(old));
    assert.ok(migrated, `schema ${version} retains its original valid affinity boundary`);
    assert.equal(migrated.aptitudes.intelligence, value, 'historical perk migration retains its original clipping rule');
    old.aptitudes.intelligence = value + Math.sign(value);
    assert.equal(game.migrateSave(old), null, `schema ${version} cannot claim a newly supported overflow`);
    old.version = 20;
    assert.equal(game.validateSave(old), true, 'the same supported total is valid only in the current format');
  }
});

test('all existing perk definitions support only their net per-stat bounds while old clipped totals stay valid', () => {
  const base = game.createGame({ seed: 12791 });
  base.aptitudes = values(0);
  base.focus = Object.fromEntries(Object.keys(base.focus).map(key => [key, 0]));
  for (const condition of BIRTH_CONDITIONS) {
    const state = copy(base); state.conditions = [condition.id];
    for (const key of keys) {
      const bonus = condition.aptitudeChanges[key] || 0;
      const bounds = { min: -3 + Math.min(0, bonus), max: 3 + Math.max(0, bonus) };
      assert.deepEqual(aptitudeBounds(state, key), bounds);
      for (const value of new Set([bounds.min, bounds.max, -3, 3])) {
        state.aptitudes[key] = value;
        assert.equal(game.validateSave(state), true, `${condition.id}: ${key} ${value}`);
        assert.deepEqual(game.migrateSave(copy(state)), state);
      }
      for (const value of [bounds.min - 1, bounds.max + 1]) {
        state.aptitudes[key] = value;
        assert.equal(game.validateSave(state), false, `${condition.id}: ${key} ${value}`);
      }
      state.aptitudes[key] = 0;
    }
  }
});

test('actual child succession retains overflow support in the player, ancestor, parents and sibling records', () => {
  const state = lifeAt(game, 65);
  state.encounters = []; state.pregnancy = null;
  state.conditions = ['rapid_processing']; state.aptitudes.intelligence = 4;
  assert.equal(game.haveChild(state).ok, true);
  state.children[0].conditions = ['deliberate_processing']; state.children[0].aptitudes = { ...values(0), intelligence: -4 };
  const sibling = { ...copy(state.children[0]), id: 'second-overflow-child', name: `Alex ${state.familyName}`, conditions: ['rapid_processing'], aptitudes: { ...values(0), intelligence: 4 } };
  state.children.push(sibling);
  const previousId = state.id, heirId = state.children[0].id;
  roundTrip(state);
  assert.equal(game.succeed(state, heirId).ok, true);
  assert.equal(state.aptitudes.intelligence, -4);
  assert.deepEqual(state.conditions, ['deliberate_processing']);
  for (const former of [state.parents.find(person => person.id === previousId), state.lineage.find(person => person.id === previousId)]) {
    assert.equal(former.aptitudes.intelligence, 4);
    assert.deepEqual(former.conditions, ['rapid_processing']);
  }
  assert.equal(state.siblings[0].aptitudes.intelligence, 4);
  roundTrip(state);
  assert.equal(game.advanceYear(state, calm).ok, true);
  roundTrip(state);
});

test('genuine pre-overflow saves preserve clipped affinities, pending decisions, history and RNG exactly', { skip: baseline ? false : 'Optional genuine pre-overflow runtime is absent' }, t => {
  let snapshots = 0, pending = 0, clipped = 0;
  function check(state) {
    assert.equal(baseline.validateSave(state), true);
    for (const person of [state, ...state.parents, ...state.children, state.partner, ...state.encounters].filter(Boolean)) {
      assert.ok(Object.values(person.aptitudes).every(value => value >= -3 && value <= 3));
      if (keys.some(key => perkAffinityBonus(person, key) * person.aptitudes[key] > 0 && Math.abs(person.aptitudes[key]) === 3)) clipped++;
    }
    roundTrip(state); snapshots++;
  }
  for (let seed = 1; seed <= 20; seed++) {
    const state = baseline.createGame({ seed: seed * 7919 }), age = seed * 11 % 31;
    check(state);
    let capturedPending = false;
    while (state.age < age) {
      while (state.pendingEvents.length) {
        if (!capturedPending) { check(state); pending++; capturedPending = true; }
        const item = state.pendingEvents[0], event = baseline.EVENTS.find(entry => entry.id === item.eventId);
        assert.equal(baseline.resolveEventChoice(state, event.choices[0].id, event.id, item.subjectId).ok, true);
      }
      if (baseline.needsEducationChoice(state)) assert.equal(baseline.chooseEducation(state, 'work').ok, true);
      assert.equal(baseline.advanceYear(state, { mortalityRandom: () => 1 }).ok, true);
    }
    check(state);
  }
  assert.ok(pending > 0 && clipped > 0, 'the old-runtime sample includes pending choices and previously bounded perk totals');
  t.diagnostic(`${snapshots} genuine saved checkpoints across 20 old-runtime lives; ${pending} unresolved-choice checkpoints and ${clipped} actor records with clipped perk-supported affinity totals.`);
});
