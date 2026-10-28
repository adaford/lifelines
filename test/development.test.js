import test from 'node:test';
import assert from 'node:assert/strict';
import {
  EVENTS, SKILLS, createGame, advanceYear, annualForecast, setCryLevel,
  validateSave, migrateSave, needsEducationChoice, chooseEducation,
  resolveEventChoice, haveChild, succeed,
} from '../engine.js';

const copy = value => structuredClone(value);
const survives = { mortalityRandom: () => 1 };
const meanYear = { ...survives, growthRandom: () => 0 };
const round = value => Math.round(value * 100) / 100;
const median = values => [...values].sort((a, b) => a - b)[Math.floor(values.length / 2)];
const average = values => values.reduce((a, b) => a + b, 0) / values.length;
const standardDeviation = values => Math.sqrt(average(values.map(value => (value - average(values)) ** 2)));
function finishChoices(state) {
  while (state.pendingEvents.length) {
    const pending = state.pendingEvents[0];
    const event = EVENTS.find(event => event.id === pending.eventId);
    assert.equal(resolveEventChoice(state, event.choices[0].id, event.id, pending.subjectId || '').ok, true);
  }
}
function aged(age, seed = 43, gender = 'male') {
  const state = createGame({ seed, surname: 'Growth', gender });
  while (state.age < age) {
    finishChoices(state);
    if (needsEducationChoice(state)) chooseEducation(state, 'work');
    assert.equal(advanceYear(state, meanYear).ok, true);
  }
  finishChoices(state);
  if (needsEducationChoice(state)) chooseEducation(state, 'work');
  return state;
}
function legacyV7(state) {
  const legacy = copy(state);
  legacy.version = 7;
  for (const person of [legacy, ...legacy.parents, ...legacy.children, ...legacy.siblings, ...legacy.lineage, legacy.partner, ...legacy.encounters, legacy.pregnancy?.otherParent].filter(Boolean)) {
    if (person.adultHeight === null) person.adultHeight = 170;
    for (const key of ['growthSex', 'growthFactor', 'maturityAge', 'birthHeight', 'growthAnchor', 'parentRole', 'career']) delete person[key];
    person.appearancePeakAge = 30;
  }
  return legacy;
}

test('new families have a mom and dad with varied bonds centered near eight', () => {
  const bonds = [];
  const appearances = [];
  const heights = new Set();
  for (let seed = 1; seed <= 1000; seed++) {
    const state = createGame({ seed });
    assert.equal(state.gender, 'male');
    assert.equal(state.parents.find(parent => parent.parentRole === 'mom')?.gender, 'female');
    assert.equal(state.parents.find(parent => parent.parentRole === 'dad')?.gender, 'male');
    bonds.push(...state.parents.map(parent => parent.relationship));
    appearances.push(state.stats.attractiveness);
    heights.add(state.height);
    assert.equal(validateSave(state), true, `seed ${seed}`);
  }
  assert.ok(bonds.every(bond => bond >= 5 && bond <= 10));
  assert.ok(Math.abs(average(bonds) - 8) < .2, `mean ${average(bonds)}`);
  assert.ok(Math.abs(median(bonds) - 8) < .2, `median ${median(bonds)}`);
  assert.ok(standardDeviation(bonds) > .7 && standardDeviation(bonds) < 1.2);
  assert.ok(new Set(bonds).size > 100, 'bonds vary across families');
  assert.ok(appearances.every(value => value >= 1 && value <= 10));
  assert.ok(median(appearances) >= 4 && median(appearances) <= 8);
  assert.ok(appearances.filter(value => value >= 4 && value <= 8).length > 750);
  assert.ok(heights.size > 50, 'newborn length varies instead of always being 50cm');
});

test('mean attractiveness stays at its initial level and declines only after the chosen threshold', () => {
  for (const gender of ['male', 'female', 'nonbinary']) {
    const state = createGame({ seed: 344, gender });
    const start = state.stats.attractiveness;
    setCryLevel(state, 5);
    for (let year = 0; year < 3; year++) {
      assert.equal(annualForecast(state).stats.attractiveness.change, 0);
      advanceYear(state, meanYear);
      assert.equal(state.stats.attractiveness, start, 'crying does not train appearance');
    }
    const threshold = gender === 'female' ? 22 : 30;
    const adult = aged(threshold - 1, 345, gender);
    adult.stats.attractiveness = 7;
    adult.effects = [];
    adult.focus = { work: 5, social: 1, family: 1, self: 5 };
    assert.equal(annualForecast(adult).stats.attractiveness.change, 0);
    advanceYear(adult, meanYear);
    finishChoices(adult);
    adult.stats.attractiveness = 7;
    adult.effects = [];
    assert.equal(annualForecast(adult).stats.attractiveness.change, -.06);
    assert.equal(adult.appearancePeakAge, threshold);
  }
});

test('hard crying has a substantially larger mean mental-stability cost while all levels build bonds', () => {
  const state = createGame({ seed: 57 });
  state.parents.forEach(parent => { parent.stats.stability = 7; parent.relationship = 7; });
  const changes = [];
  for (let level = 1; level <= 5; level++) {
    setCryLevel(state, level);
    const forecast = annualForecast(state);
    assert.ok(forecast.parents.every(parent => parent.relationship.change > 0));
    changes.push(forecast.parents[0].stability.change);
  }
  assert.equal(changes[0], .2);
  assert.equal(changes[4], -1.8);
  assert.ok(changes[3] - changes[4] > changes[0] - changes[1], 'higher crying levels have increasing strain');
});

test('annual development varies around the pure mean forecast and is reproducible from a saved seed', () => {
  const template = createGame({ seed: 76 });
  template.aptitudes.intelligence = 0;
  template.parents.forEach(parent => { parent.stats.stability = 7; parent.relationship = 7; });
  setCryLevel(template, 5);
  const beforePreview = copy(template);
  const forecast = annualForecast(template);
  assert.deepEqual(annualForecast(template), forecast);
  assert.deepEqual(template, beforePreview, 'forecast does not alter state or RNG');
  const gains = [];
  const stressChanges = [];
  for (let rng = 1; rng <= 160; rng++) {
    const state = copy(template);
    state.rng = rng;
    const reloaded = migrateSave(JSON.parse(JSON.stringify(state)));
    advanceYear(state, survives);
    advanceYear(reloaded, survives);
    assert.deepEqual(reloaded, state, 'the same save produces the same stochastic year');
    assert.equal(validateSave(state), true);
    if (state.lastYearEvents.length) continue;
    gains.push(round(state.stats.intelligence - template.stats.intelligence));
    stressChanges.push(round(state.parents[0].stats.stability - template.parents[0].stats.stability));
  }
  assert.ok(gains.length > 60);
  assert.ok(new Set(gains).size > 6, 'ordinary gains vary even without a random event');
  const expectedGain = forecast.stats.intelligence.change;
  assert.ok(Math.abs(median(gains) - expectedGain) < Math.max(.02, expectedGain * .15));
  const relativeSpread = standardDeviation(gains) / expectedGain;
  assert.ok(relativeSpread > .1 && relativeSpread < .3, 'annual variation stays modest relative to calibrated growth');
  assert.ok(standardDeviation(stressChanges) > .1);
});

test('v7 migration preserves existing height, bonds, random state and non-infant appearance', () => {
  const legacy = legacyV7(aged(10, 584));
  legacy.parents[0].relationship = 6.3;
  legacy.parents[1].relationship = 9.1;
  const before = copy(legacy);
  const migrated = migrateSave(legacy);
  assert.ok(migrated);
  assert.equal(migrated.version, 9);
  for (const key of ['rng', 'seed', 'nextId', 'age', 'height', 'stats', 'pendingEvents', 'history', 'yearSummary']) assert.deepEqual(migrated[key], before[key], key);
  assert.deepEqual(migrated.parents.map(parent => parent.relationship), [6.3, 9.1]);
  assert.deepEqual(legacy, before, 'migration leaves the original object unchanged');
  assert.equal(validateSave(migrated), true);
  assert.deepEqual(migrateSave(legacy), migrated, 'migration never rerolls a growth profile');
  const height = migrated.height;
  advanceYear(migrated, meanYear);
  assert.ok(migrated.height > height && migrated.height - height < 18, 'legacy height continues smoothly');

  const infant = legacyV7(createGame({ seed: 585 }));
  infant.stats.attractiveness = 1.2;
  const upgraded = migrateSave(infant);
  assert.ok(upgraded.stats.attractiveness >= 3);
  assert.equal(upgraded.height, infant.height);
  assert.equal(upgraded.rng, infant.rng);
  for (const skill of SKILLS.filter(skill => skill.key !== 'attractiveness')) assert.equal(upgraded.stats[skill.key], infant.stats[skill.key]);
});

test('young heirs preserve their growth profile and reach adult height within their recorded maturity age', () => {
  const state = aged(64, 730);
  assert.equal(haveChild(state).ok, true);
  advanceYear(state, meanYear);
  finishChoices(state);
  const heir = copy(state.children[0]);
  assert.equal(succeed(state, heir.id).ok, true);
  for (const key of ['height', 'adultHeight', 'growthSex', 'growthFactor', 'maturityAge', 'birthHeight', 'growthAnchor']) assert.deepEqual(state[key], heir[key], key);
  assert.ok(state.maturityAge >= 14 && state.maturityAge <= 18);
  assert.equal(state.adultHeight, null, 'a growing heir has no predetermined endpoint');
  let previousHeight = state.height;
  while (state.age < state.maturityAge) {
    finishChoices(state);
    advanceYear(state, meanYear);
    assert.ok(state.height >= previousHeight);
    if (state.age < state.maturityAge) assert.equal(state.adultHeight, null);
    previousHeight = state.height;
    assert.equal(validateSave(state), true);
  }
  assert.equal(state.height, state.adultHeight);
  finishChoices(state);
  if (needsEducationChoice(state)) chooseEducation(state, 'work');
  advanceYear(state, meanYear);
  assert.equal(state.height, state.adultHeight, 'adult height stops changing');
});


test('saved growth profiles reject malformed ages, references, and partial family metadata', () => {
  const original = createGame({ seed: 870 });
  for (const mutate of [
    s => { s.maturityAge = 13; },
    s => { s.maturityAge = 19; },
    s => { s.birthHeight = NaN; },
    s => { s.growthSex = 'unknown'; },
    s => { s.growthFactor = -.1; },
    s => { s.growthFactor = 1.21; },
    s => { s.adultHeight = NaN; },
    s => { s.growthAnchor = { age: 3, height: 80 }; },
    s => { delete s.parents[0].growthSex; },
    s => { s.parents[0].parentRole = 'unknown'; },
  ]) {
    const invalid = copy(original);
    mutate(invalid);
    assert.equal(validateSave(invalid), false);
    assert.equal(migrateSave(invalid), null);
  }
  assert.equal(validateSave(original), true);
});
