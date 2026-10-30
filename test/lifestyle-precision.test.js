import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createGame, annualForecast, advanceYear, householdLifestyle, lifestyleFromResources,
  JOBS, EVENTS, resolveEventChoice, needsEducationChoice, chooseEducation, haveChild,
} from '../engine.js';
import { TODDLER_FOCUS } from '../development.js';
import { createProspects } from '../relationships.js';

const ordinaryYear = { mortalityRandom: () => 1, growthRandom: () => 0, parentCareerRandom: () => 1 };
const round = value => Math.round(value * 100) / 100;
function finishChoices(state) {
  while (state.pendingEvents.length) {
    const pending = state.pendingEvents[0];
    const event = EVENTS.find(event => event.id === pending.eventId);
    assert.equal(resolveEventChoice(state, event.choices[0].id, event.id, pending.subjectId || '').ok, true);
  }
}

test('lifestyle responds continuously to resources and retains hundredths within the rating bounds', () => {
  assert.equal(lifestyleFromResources(11000), 1.5);
  assert.equal(lifestyleFromResources(11220), 1.51);
  assert.equal(lifestyleFromResources(11330), 1.52);
  assert.equal(lifestyleFromResources(0, 12500), 1.58);
  assert.equal(lifestyleFromResources(0, 25000), 2);
  assert.equal(lifestyleFromResources(66000, 0), 4);
  assert.equal(lifestyleFromResources(-100, NaN), 1);
  assert.equal(lifestyleFromResources(1e15), 10);
  assert.equal(lifestyleFromResources(0, 1e15), 10);
  for (const job of JOBS) assert.equal(job.baseLifestyle, lifestyleFromResources(job.baseSalary), job.name);
});

test('routine household progress changes lifestyle by fractions and its forecast preserves saved values', () => {
  const state = createGame({ seed: 321 });
  state.age = 2;
  state.focus = { ...TODDLER_FOCUS };
  state.lifestyle = 4.2;
  state.parents.forEach((parent, index) => {
    parent.lifestyle = 4.2;
    parent.career = { focus: 3, status: 'employed', progress: index ? 4.3 : 4.1, years: 8 };
  });
  const sibling = { ...structuredClone(state), id: 'sibling-precision', age: 1, relationship: 5 };
  state.siblings = [sibling];
  const before = structuredClone(state);
  assert.equal(householdLifestyle(state), 4.2);
  const forecast = annualForecast(state);
  assert.deepEqual(forecast.lifestyle, { before: 4.2, after: 4.35, change: .15 });
  assert.ok(forecast.parents.every(parent => parent.lifestyle.after === 4.35));
  assert.deepEqual(state, before, 'forecast must not alter saved ratings or RNG');
  assert.equal(advanceYear(state, ordinaryYear).ok, true);
  assert.equal(state.lifestyle, 4.35);
  assert.ok(state.parents.every(parent => parent.lifestyle === 4.35));
  assert.equal(state.siblings[0].lifestyle, 4.35);
  assert.deepEqual(state.yearSummary.lifestyle, forecast.lifestyle);
});

test('dependent family costs preserve the fractional part of adult lifestyle', () => {
  const state = createGame({ seed: 6321 });
  while (state.age < 25) {
    finishChoices(state);
    if (needsEducationChoice(state)) chooseEducation(state, 'work');
    assert.equal(advanceYear(state, ordinaryYear).ok, true);
  }
  finishChoices(state);
  state.effects = [];
  state.money = 0;
  state.income = 123456;
  state.lifestyle = lifestyleFromResources(state.income);
  assert.equal(state.lifestyle, 6.61);
  assert.equal(haveChild(state).ok, true);
  assert.equal(state.lifestyle, 5.61);
  assert.equal(state.children[0].lifestyle, 5.61);
});

test('new prospective partners have bounded lifestyle ratings with hundredth precision', () => {
  const state = createGame({ seed: 93 });
  state.age = 25;
  state.stats = Object.fromEntries(Object.keys(state.stats).map(key => [key, 8]));
  state.lifestyle = 6.25;
  let nextId = 0;
  const people = createProspects(state, { random: () => .17, integer: low => low, uid: () => `prospect-${++nextId}`, personName: () => 'Alex Reed' });
  assert.ok(people.length > 0);
  assert.ok(people.some(person => !Number.isInteger(person.lifestyle)));
  for (const person of people) {
    assert.ok(person.lifestyle >= 0 && person.lifestyle <= 10);
    assert.equal(person.lifestyle, round(person.lifestyle));
  }
});
