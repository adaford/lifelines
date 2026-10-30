import test from 'node:test';
import assert from 'node:assert/strict';
import { createGame, advanceYear, annualForecast, caregivers, effectiveStats, eventOdds, householdLifestyle, mortalityOdds, migrateSave, validateSave, EVENTS, resolveEventChoice, chooseEducation, needsEducationChoice, successionInfo, succeed } from '../engine.js';
import { abandonmentChance } from '../family-events.js';

const copy = value => structuredClone(value);
const noVariation = { mortalityRandom: () => 1, growthRandom: () => 0, parentCareerRandom: () => 1 };
function child() {
  const state = createGame({ seed: 13579 });
  state.age = 3;
  state.focus = { work: 3, social: 2, family: 2, self: 3, creative: 2 };
  for (const person of [state, ...state.parents]) for (const key in person.stats) person.stats[key] = 5;
  for (const parent of state.parents) { parent.stats.stability = 0; parent.relationship = 0; }
  return state;
}
function adopted() {
  const state = child();
  state.rng = 558;
  assert.equal(advanceYear(state, noVariation).ok, true);
  assert.equal(state.parents.filter(parent => parent.abandonedAt !== undefined).length, 2);
  return state;
}
function resolveChoices(state) {
  while (state.pendingEvents.length) {
    const event = EVENTS.find(event => event.id === state.pendingEvents[0].eventId);
    assert.equal(resolveEventChoice(state, event.choices[0].id).ok, true);
  }
}

test('zero ratings survive saves, effective modifiers and full-range review deltas without rescaling', () => {
  const state = child();
  for (const person of [state, ...state.parents]) {
    for (const key in person.stats) person.stats[key] = 0;
    person.lifestyle = 0;
    if (person !== state) { person.relationship = 0; person.career.progress = 0; }
  }
  state.effects = [{ id: 'zero-floor', name: 'Setback', description: '', years: 2, modifiers: { health: -3, stability: -3 }, kind: 'negative' }];
  assert.equal(effectiveStats(state).health, 0);
  assert.equal(householdLifestyle(state), 0);
  assert.equal(validateSave(state), true);
  assert.deepEqual(migrateSave(copy(state)), state);
  state.age = 4;
  const delta = (before, after) => ({ before, after, change: after - before });
  state.yearSummary = { fromAge: 3, toAge: 4, dismissed: false, stats: Object.fromEntries(Object.keys(state.stats).map(key => [key, delta(0, 10)])), lifestyle: delta(10, 0), parents: [], events: [] };
  assert.equal(validateSave(state), true);
  state.stats.health = -.01;
  assert.equal(validateSave(state), false);
});

test('schema 14 migration changes metadata only and keeps its original floor contract', () => {
  const previous = child();
  previous.version = 14;
  delete previous.guardian;
  for (const parent of previous.parents) { parent.stats.stability = 1.25; parent.relationship = 1.5; }
  const snapshot = copy(previous);
  assert.deepEqual(migrateSave(previous), { ...snapshot, version: 15 });
  assert.deepEqual(previous, snapshot);
  previous.stats.health = 0;
  assert.equal(migrateSave(previous), null);
});

test('abandonment odds are rare, depend on both parent traits, and never reroll previews', () => {
  const state = child(), parent = state.parents[0];
  assert.equal(abandonmentChance(state, parent), .02);
  parent.relationship = 8;
  const lowStability = abandonmentChance(state, parent);
  parent.stats.stability = 8;
  const secure = abandonmentChance(state, parent);
  assert.ok(secure < lowStability && secure < .001);
  parent.relationship = 0;
  assert.ok(abandonmentChance(state, parent) > secure);
  const snapshot = copy(state);
  assert.equal(eventOdds(state).find(roll => roll.eventId === 'household_parent_abandonment' && roll.subjectId === parent.id).chance, abandonmentChance(state, parent));
  annualForecast(state); caregivers(state); eventOdds(state);
  assert.deepEqual(state, snapshot);
  parent.abandonedAt = 3;
  assert.equal(abandonmentChance(state, parent), 0);
  delete parent.abandonedAt;
  parent.alive = false;
  assert.equal(abandonmentChance(state, parent), 0);
  parent.alive = true; state.age = 18;
  assert.equal(abandonmentChance(state, parent), 0);
});

test('one parent leaves once, the other takes over, and both receive the recorded consequences', () => {
  const state = child();
  state.parents[1].stats.stability = 8; state.parents[1].relationship = 8;
  state.rng = 351;
  const forecast = annualForecast(state);
  assert.equal(advanceYear(state, noVariation).ok, true);
  const [departed, remaining] = state.parents;
  assert.equal(departed.abandonedAt, 4);
  assert.equal(departed.alive, true);
  assert.equal(departed.relationship, 0);
  assert.deepEqual(caregivers(state), [remaining]);
  assert.equal(state.guardian, null);
  assert.equal(remaining.stats.stability, Math.round((forecast.parents[1].stability.after - 3) * 100) / 100);
  assert.equal(remaining.stats.health, 4);
  assert.equal(state.effects[0].years, 3);
  assert.deepEqual(state.effects[0].modifiers, { stability: -3, social: -1.5, health: -1 });
  assert.equal(state.lifestyle, Math.round(remaining.career.progress * 100) / 100);
  assert.ok(state.history.some(entry => entry.title.includes('Takes over your care') && entry.text.includes('Health 5')));
  assert.equal(validateSave(state), true);
  assert.deepEqual(migrateSave(copy(state)), state);
  assert.ok(eventOdds(state).filter(roll => roll.subjectId === departed.id).every(roll => roll.chance === 0));
  const future = annualForecast(state).parents.find(parent => parent.id === departed.id);
  assert.equal(future.relationship.change, 0);
  assert.equal(future.lifestyle.change, 0);
  assert.equal(future.stability.change, 0);
});

test('two departures in one year stack setbacks and create one persistent adult-relative guardian', () => {
  const state = adopted();
  assert.equal(state.lastYearEvents.length, 2);
  assert.equal(state.effects.length, 3);
  assert.equal(state.effects.filter(effect => effect.id.startsWith('household_parent_abandonment:')).length, 2);
  assert.deepEqual(state.effects.find(effect => effect.id.startsWith('relative_adoption:')).modifiers, { stability: -1.5, social: -.5 });
  assert.equal(effectiveStats(state).stability, 0);
  assert.ok(state.guardian.age >= 18);
  assert.ok(['aunt', 'uncle'].includes(state.guardian.guardianRole));
  assert.equal(state.guardian.familyName, state.familyName);
  assert.equal(state.guardian.adoptedAt, 4);
  assert.ok(!state.parents.some(parent => parent.name === state.guardian.name));
  assert.deepEqual(caregivers(state), [state.guardian]);
  assert.equal(state.lifestyle, state.guardian.lifestyle);
  assert.equal(validateSave(state), true);
  const restored = migrateSave(copy(state));
  assert.deepEqual(restored, state);
  assert.ok(eventOdds(state).some(roll => roll.subjectId === state.guardian.id && roll.chance > 0));
  assert.equal(abandonmentChance(state, state.guardian), 0);
  assert.ok(mortalityOdds(state).some(person => person.id === state.guardian.id));
  const age = state.guardian.age, careerYears = state.guardian.career.years;
  assert.ok(annualForecast(state).parents.some(parent => parent.id === state.guardian.id));
  advanceYear(state, noVariation); advanceYear(restored, noVariation);
  assert.deepEqual(restored, state);
  assert.equal(state.guardian.age, age + 1);
  assert.equal(state.guardian.career.years, careerYears + 1);
  assert.equal(validateSave(state), true);
});

test('a remaining parent dying after abandonment transfers care without repeating abandonment', () => {
  const state = child();
  state.parents[0].abandonedAt = 2;
  state.parents[0].relationship = 0;
  let person = 0;
  advanceYear(state, { ...noVariation, mortalityRandom: () => ++person === 3 ? 0 : 1 });
  assert.equal(state.parents[1].alive, false);
  assert.ok(state.guardian?.alive);
  assert.equal(state.effects.filter(effect => effect.id.startsWith('relative_adoption:')).length, 1);
  assert.equal(state.effects.filter(effect => effect.id.startsWith('household_parent_abandonment:')).length, 0);
  assert.equal(validateSave(state), true);
});

test('a guardian ages and can die; a replacement relative is saved once with a new setback', () => {
  const state = adopted(), oldGuardian = state.guardian.id;
  let person = 0;
  advanceYear(state, { ...noVariation, mortalityRandom: () => ++person === 4 ? 0 : 1 });
  assert.notEqual(state.guardian.id, oldGuardian);
  assert.ok(state.guardian.alive);
  assert.ok(state.history.some(entry => entry.title.startsWith('Remembering')));
  assert.equal(state.effects.filter(effect => effect.id.startsWith('relative_adoption:')).length, 2);
  assert.equal(validateSave(state), true);
  assert.deepEqual(migrateSave(copy(state)), state);
});

test('adoption effects fit alongside the maximum ordinary temporary-effect history', () => {
  const state = adopted();
  state.effects = Array.from({ length: 25 }, (_, index) => ({ id: `ordinary-${index}`, name: 'Event', description: '', years: 5, modifiers: { intelligence: .1 }, kind: 'positive' }));
  state.effects.push(...Array.from({ length: 2 }, (_, index) => ({ id: `relative_adoption:${index}`, name: 'Adopted', description: '', years: 2, modifiers: { stability: -1.5, social: -.5 }, kind: 'negative' })));
  assert.equal(validateSave(state), true);
  assert.deepEqual(migrateSave(copy(state)), state);
  state.effects.push(copy(state.effects[0]));
  assert.equal(validateSave(state), false);
});

test('guardian fields are validated and sibling succession preserves established care', () => {
  const state = adopted();
  for (const [key, value] of [['guardianRole', 'stranger'], ['adoptedAt', -1], ['relationship', -1], ['age', 15]]) {
    const invalid = copy(state); invalid.guardian[key] = value;
    assert.equal(validateSave(invalid), false, key);
  }
  const sibling = copy(state);
  const heir = { ...copy(sibling), id: 'sibling-heir', name: `Sam ${sibling.familyName}`, age: 2, money: 0, relationship: 8, parentIds: state.parents.map(parent => parent.id) };
  sibling.siblings = [heir];
  sibling.alive = false; sibling.death = { age: 4, cause: 'accident' }; sibling.needsSuccession = true;
  const guardianId = sibling.guardian.id;
  assert.equal(successionInfo(sibling).route, 'siblings');
  assert.equal(succeed(sibling, heir.id).ok, true);
  assert.equal(sibling.guardian.id, guardianId);
  assert.equal(sibling.parents[0].abandonedAt, 4, 'preserve the actual family history age');
  assert.equal(validateSave(sibling), true);
  const original = copy(state);
  while (state.age < 18) { resolveChoices(state); assert.equal(advanceYear(state, noVariation).ok, true); }
  assert.equal(needsEducationChoice(state), true);
  chooseEducation(state, 'work');
  assert.equal(state.guardian.id, original.guardian.id);
  assert.equal(validateSave(state), true);
});

test('an older sibling can retain a younger adult relative, while unrelated succession clears guardianship', () => {
  const state = adopted();
  state.guardian.age = 25;
  for (const parent of state.parents) parent.age = 50;
  const heir = { ...copy(state), id: 'older-sibling', name: `Alex ${state.familyName}`, age: 30, height: 65, adultHeight: 65, money: 0, relationship: 8 };
  state.siblings = [heir];
  state.alive = false; state.death = { age: state.age, cause: 'accident' }; state.needsSuccession = true;
  assert.equal(validateSave(state), true);
  const guardianId = state.guardian.id;
  assert.equal(succeed(state, heir.id).ok, true);
  assert.equal(state.guardian.id, guardianId);
  assert.equal(validateSave(state), true);
  const unrelated = adopted();
  unrelated.alive = false; unrelated.death = { age: unrelated.age, cause: 'accident' }; unrelated.needsSuccession = true;
  assert.equal(successionInfo(unrelated).route, 'beneficiary');
  assert.equal(succeed(unrelated, successionInfo(unrelated).beneficiary.id).ok, true);
  assert.equal(unrelated.guardian, null);
  assert.equal(validateSave(unrelated), true);
});
