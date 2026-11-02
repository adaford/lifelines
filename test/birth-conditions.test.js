import test from 'node:test';
import assert from 'node:assert/strict';
import { BIRTH_CONDITIONS, MAX_BIRTH_CONDITIONS, generateBirthConditions, assignBirthConditions, applyBirthConditions, validateBirthConditions } from '../birth-conditions.js';
import { createGame, advanceYear, chooseEducation, resolveEventChoice, EVENTS, haveChild, focusLimits, focusLimitDetails, setFocus, validateSave, migrateSave, successionInfo, succeed } from '../engine.js';
import { defaultFocus, focusBudget, fitFocusBudget } from '../focus-rules.js';
import { createSchoolRecord } from '../school.js';
import { createProspects } from '../relationships.js';

const clone = value => structuredClone(value);
const stats = () => Object.fromEntries(['health', 'stability', 'attractiveness', 'intelligence', 'strength', 'social', 'creativity'].map(key => [key, 5]));
const aptitudes = () => Object.fromEntries(Object.keys(stats()).map(key => [key, 0]));
const calm = { mortalityRandom: () => 1, growthRandom: () => 0, parentCareerRandom: () => 1 };
function finishChoices(state) {
  while (state.pendingEvents.length) {
    const event = EVENTS.find(entry => entry.id === state.pendingEvents[0].eventId);
    assert.equal(resolveEventChoice(state, event.choices[0].id, event.id).ok, true);
  }
}
function adult(seed = 80319) {
  const state = createGame({ seed });
  while (state.age < 18) { assert.equal(advanceYear(state, calm).ok, true); finishChoices(state); }
  chooseEducation(state, 'work');
  return state;
}

test('all 100 birth conditions are reachable without parents and either parent modestly increases their chance', () => {
  assert.equal(BIRTH_CONDITIONS.length, 100);
  assert.equal(new Set(BIRTH_CONDITIONS.map(entry => entry.id)).size, 100);
  assert.equal(MAX_BIRTH_CONDITIONS, 5);
  for (const [target, entry] of BIRTH_CONDITIONS.entries()) {
    assert.ok(entry.birthChance > 0 && entry.birthChance < .05);
    assert.equal(entry.statChanges, undefined, `${entry.id} has no direct rating changes`);
    assert.ok(Object.keys(entry.aptitudeChanges).length || entry.focusPoints || entry.focusLimits, entry.id);
    for (const [key, amount] of Object.entries(entry.aptitudeChanges)) {
      assert.ok(Object.hasOwn(stats(), key), `${entry.id} changes a known affinity`);
      assert.ok(amount === -1 || amount === 1, `${entry.id} changes affinities by one integer step`);
    }
    const roll = fraction => { let index = 0; return () => index++ === target ? entry.birthChance * fraction : .999; };
    assert.deepEqual(generateBirthConditions(roll(.5)), [entry.id], `${entry.id} can occur spontaneously`);
    assert.deepEqual(generateBirthConditions(roll(1.25)), []);
    assert.deepEqual(generateBirthConditions(roll(1.25), [[entry.id], []]), [entry.id]);
    assert.deepEqual(generateBirthConditions(roll(1.25), [[], [entry.id]]), [entry.id]);
    assert.deepEqual(generateBirthConditions(roll(1.75), [[entry.id], [entry.id]]), [], 'two parents do not compound the boost');
  }
});

test('birth assignment is deterministic, unique, capped at five, and never repeats affinity changes', () => {
  const maximum = generateBirthConditions(() => 0);
  assert.equal(maximum.length, 5);
  assert.equal(validateBirthConditions(maximum), true);
  const groups = maximum.map(id => BIRTH_CONDITIONS.find(entry => entry.id === id).group).filter(Boolean);
  assert.equal(new Set(groups).size, groups.length);
  let nonempty = 0;
  for (let seed = 1; seed <= 100; seed++) {
    const person = { id: 'newborn', stats: stats(), aptitudes: aptitudes(), rng: 123 };
    const same = clone(person);
    assignBirthConditions(person, seed);
    assignBirthConditions(same, seed);
    assert.deepEqual(person, same);
    assert.deepEqual(person.stats, stats(), 'assignment preserves all generated ratings');
    assert.equal(validateBirthConditions(person.conditions), true);
    nonempty += Number(person.conditions.length > 0);
    const assigned = clone(person);
    assignBirthConditions(person, seed + 1, [{ conditions: ['autism'] }]);
    assert.deepEqual(person, assigned, 'a later read or assignment cannot reroll or apply bonuses twice');
    assert.equal(person.rng, 123);
  }
  assert.ok(nonempty > 20 && nonempty < 100);
});

test('every birth condition affects affinities without writing to ratings or other saved values', () => {
  for (const entry of BIRTH_CONDITIONS) {
    const person = { id: 'newborn', stats: Object.freeze({ ...stats(), intelligence: 9.8, health: .1 }),
      aptitudes: aptitudes(), conditions: [entry.id], rng: 123, focus: { work: 2, social: 2, family: 2, self: 2 } };
    const before = clone(person), originalStats = person.stats;
    assert.equal(applyBirthConditions(person), person);
    assert.equal(person.stats, originalStats, `${entry.id} does not replace the ratings object`);
    assert.deepEqual(person, { ...before, aptitudes: { ...aptitudes(), ...entry.aptitudeChanges } }, entry.id);
  }
});

test('affinity changes stack once, cancel before clamping, and remain within integer limits', () => {
  const gifted = { stats: stats(), aptitudes: { ...aptitudes(), intelligence: 2 },
    conditions: ['quick_learner', 'sharp_memory', 'curious_mind'] };
  applyBirthConditions(gifted);
  assert.equal(gifted.aptitudes.intelligence, 3, 'overlapping positive affinities stop at +3');
  assert.equal(gifted.aptitudes.creativity, 1);
  assert.deepEqual(gifted.stats, stats());
  const vulnerable = { stats: stats(), aptitudes: { ...aptitudes(), health: -2 },
    conditions: ['delicate_constitution', 'low_appetite', 'low_endurance'] };
  applyBirthConditions(vulnerable);
  assert.equal(vulnerable.aptitudes.health, -3, 'overlapping negative affinities stop at -3');
  assert.equal(vulnerable.aptitudes.strength, -2);
  assert.deepEqual(vulnerable.stats, stats());
  const balanced = { stats: stats(), aptitudes: { ...aptitudes(), intelligence: 3 }, conditions: ['sharp_memory', 'forgetful'] };
  const reversed = { ...clone(balanced), conditions: [...balanced.conditions].reverse() };
  applyBirthConditions(balanced);
  applyBirthConditions(reversed);
  assert.equal(balanced.aptitudes.intelligence, 3, 'opposing affinities cancel before the upper bound is applied');
  assert.deepEqual(balanced.aptitudes, reversed.aptitudes, 'condition ordering does not change the result');
  const assigned = clone(gifted);
  assignBirthConditions(gifted, 8, [{ conditions: ['autism'] }]);
  assert.deepEqual(gifted, assigned, 'an already assigned person never receives the shifts again');
});

test('condition bonuses and lifelong limits apply to focus actions and coexist with temporary limits', () => {
  const state = createGame({ seed: 80319 });
  state.age = 6;
  state.conditions = ['autism', 'high_energy'];
  state.focus = { ...defaultFocus(6), social: 1 };
  state.school = createSchoolRecord(state);
  assert.equal(focusBudget(state), 11);
  assert.equal(focusBudget({ ...state, age: 3 }), 11);
  assert.equal(focusBudget({ ...state, conditions: ['low_energy'] }), 9);
  assert.deepEqual(fitFocusBudget({ ...state, conditions: ['low_energy'] }, { ...defaultFocus(6), work: 4 }), { work: 3, social: 2, family: 2, self: 2, sports: 0, extracurricular: 0 });
  assert.equal(setFocus(state, 'social', 2).ok, false);
  assert.equal(setFocus(state, 'work', 4).ok, true);
  assert.equal(focusLimitDetails(state)[0].permanent, true);
  assert.equal(focusLimitDetails(state)[0].years, null);
  state.effects = [{ id: 'temporary', name: 'Recovery', description: '', modifiers: {}, kind: 'negative', years: 1, focusLimits: { standard: { social: 0 } } }];
  state.focus.social = 0;
  assert.equal(focusLimits(state).social, 0);
  assert.equal(advanceYear(state, calm).ok, true);
  assert.equal(state.effects.some(effect => effect.id === 'temporary'), false);
  assert.equal(focusLimits(state).social, 1);
  assert.deepEqual(state.conditions, ['autism', 'high_energy']);
  assert.equal(state.yearSummary.decisions.focusBudget, 11);
  assert.equal(validateSave(state), true);
  assert.deepEqual(migrateSave(clone(state)), state);
});

test('new parents, players, and dating prospects carry saved conditions with their affinity effects', () => {
  const state = createGame({ seed: 80319 });
  for (const person of [state, ...state.parents]) assert.equal(validateBirthConditions(person.conditions), true);
  const expected = { id: state.id, stats: stats() };
  assignBirthConditions(expected, state.seed, state.parents);
  assert.deepEqual(state.conditions, expected.conditions);
  state.age = 25;
  state.stats = stats();
  state.stats.attractiveness = state.stats.social = 10;
  state.lifestyle = 10;
  let nextId = 0;
  const prospects = createProspects(state, { random: () => .1, integer: (low) => low, uid: prefix => `${prefix}-${++nextId}`, personName: () => 'Riley Reed' });
  assert.ok(prospects.length);
  for (const person of prospects) {
    assert.equal(validateBirthConditions(person.conditions), true);
    const expected = { id: person.id, stats: stats() };
    assignBirthConditions(expected, `${state.seed}:${state.rng}`);
    assert.deepEqual(person.conditions, expected.conditions);
  }
});

test('biological births use both parents while adoption uses the independent birth pool', () => {
  const state = adult();
  state.conditions = ['high_energy', 'quick_learner'];
  state.yearSummary = null;
  state.focus = defaultFocus(state.age);
  state.partner = { ...clone(state.parents.find(person => person.gender === 'female')), id: 'co-parent', age: 25, conditions: ['autism', 'vivid_imagination'], relationship: 5, yearsTogether: 1, married: true, lastProposalAge: -1 };
  state.encounters = [];
  state.pregnancy = { otherParent: clone(state.partner), carrierId: state.partner.id, carrierName: state.partner.name, startedAge: state.age, dueAge: state.age + 1, casual: false };
  assert.equal(advanceYear(state, calm).ok, true);
  const born = state.children.at(-1);
  assert.equal(born.adopted, false);
  const expected = { id: born.id, stats: stats() };
  assignBirthConditions(expected, `${state.seed}:${state.rng}`, [state, state.partner]);
  assert.deepEqual(born.conditions, expected.conditions);
  finishChoices(state);
  assert.equal(advanceYear(state, calm).ok, true);
  finishChoices(state);
  state.pregnancy = null;
  assert.equal(haveChild(state).ok, true);
  const adopted = state.children.at(-1);
  const expectedAdopted = { id: adopted.id, stats: stats() };
  assignBirthConditions(expectedAdopted, `${state.seed}:${state.rng}`, []);
  assert.deepEqual(adopted.conditions, expectedAdopted.conditions);
  assert.equal(adopted.adopted, true);
  assert.equal(validateSave(state), true);
});

test('succession keeps the chosen childs conditions and applies their budget without repeating birth bonuses', () => {
  const state = adult();
  state.encounters = [];
  assert.equal(haveChild(state).ok, true);
  const heir = state.children[0];
  heir.conditions = ['autism', 'high_energy'];
  heir.age = 6;
  const before = clone(heir.stats);
  state.age = 65;
  state.yearSummary = null;
  assert.equal(succeed(state, heir.id).ok, true);
  assert.deepEqual(state.conditions, ['autism', 'high_energy']);
  assert.deepEqual(state.stats, before);
  assert.equal(focusBudget(state), 11);
  assert.equal(state.focus.social, 1);
  assert.equal(validateSave(state), true);
  const noChildren = adult();
  noChildren.age = 65;
  const snapshot = clone(noChildren);
  const beneficiary = successionInfo(noChildren).beneficiary;
  assert.equal(validateBirthConditions(beneficiary.conditions), true);
  assert.deepEqual(successionInfo(noChildren).beneficiary, beneficiary);
  assert.deepEqual(noChildren, snapshot, 'heir previews do not consume RNG or mutate the save');
});

test('older saves receive empty condition lists without changing existing ratings, history, or RNG', () => {
  const state = adult();
  assert.equal(haveChild(state).ok, true);
  state.version = 16;
  delete state.school;
  state.focus = { work: 3, social: 3, family: 3, self: 3 };
  state.yearSummary = null;
  const visit = (value, action) => {
    if (!value || typeof value !== 'object') return;
    if (value.stats && value.aptitudes) action(value);
    for (const child of Object.values(value)) visit(child, action);
  };
  visit(state, person => { delete person.conditions; });
  const before = clone(state);
  const loaded = migrateSave(state);
  assert.ok(loaded);
  const expected = clone(before);
  expected.version = 20;
  expected.school = null;
  expected.focus = defaultFocus(expected.age);
  visit(expected, person => { person.conditions = []; });
  assert.deepEqual(loaded, expected);
  assert.deepEqual(state, before);
  assert.deepEqual(migrateSave(loaded), loaded);
});

test('invalid, repeated, missing, and more-than-five saved conditions are rejected for every person', () => {
  const state = createGame({ seed: 80319 });
  for (const ids of [['unknown_condition'], ['autism', 'autism'], BIRTH_CONDITIONS.slice(0, 6).map(entry => entry.id), null, undefined]) {
    assert.equal(validateBirthConditions(ids), false);
    for (const target of ['player', 'parent']) {
      const malformed = clone(state);
      (target === 'player' ? malformed : malformed.parents[0]).conditions = ids;
      assert.equal(validateSave(malformed), false);
      assert.equal(migrateSave(malformed), null);
    }
  }
});
