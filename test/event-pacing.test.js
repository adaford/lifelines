import test from 'node:test';
import assert from 'node:assert/strict';
import { EVENTS, eventChances } from '../events.js';
import { familyEventChances } from '../family-events.js';
import { JOBS } from '../jobs.js';

const keys = ['health', 'stability', 'intelligence', 'strength', 'social', 'creativity', 'attractiveness'];
function balancedLife(age) {
  const stats = Object.fromEntries(keys.map(key => [key, 5]));
  return {
    age, stats, lifestyle: 5,
    focus: age >= 2 && age < 5 ? { work: 3, social: 2, family: 2, self: 3, creative: 2 } : { work: 3, social: 3, family: 3, self: 3 },
    education: { status: age < 18 ? 'school' : 'workforce' },
    parents: [
      { id: 'mom', age: age + 30, stats: { ...stats }, relationship: 8 },
      { id: 'dad', age: age + 32, stats: { ...stats }, relationship: 8 },
    ],
    children: [], effects: [], rng: 12345,
  };
}
const retail = JOBS.find(job => job.id === 'retail');
const chances = state => eventChances(state, state.stats, state.age >= 18 ? retail : null);
const chanceOf = (state, id, job = null) => eventChances(state, state.stats, job).find(event => event.id === id).chance;

test('ordinary events occur in most balanced years without approaching the five-event limit', () => {
  for (const age of [0, 2, 4, 8, 15, 25, 50]) {
    const state = balancedLife(age);
    const before = structuredClone(state);
    const rates = [...chances(state), ...familyEventChances(state)].map(event => event.chance);
    const any = 1 - rates.reduce((none, chance) => none * (1 - chance), 1);
    const expected = rates.reduce((sum, chance) => sum + chance, 0);
    // Exact Poisson-binomial mass for zero through four independent rolls.
    // The remainder is the chance of reaching the shared five-event cap.
    const countMass = [1, 0, 0, 0, 0];
    for (const rate of rates) {
      for (let count = 4; count >= 0; count--) {
        countMass[count] = countMass[count] * (1-rate) + (count > 0 ? countMass[count-1] * rate : 0);
      }
    }
    const capped = 1-countMass.reduce((sum,mass)=>sum+mass,0);
    assert.ok(any >= .6 && any < .92, `age ${age}: ${any}`);
    assert.ok(countMass[0] > .05, `age ${age}: quiet years remain possible (${countMass[0]})`);
    assert.ok(expected < 2.5, `age ${age}: ${expected} expected rolls`);
    assert.ok(capped < .1, `age ${age}: five-event cap probability ${capped}`);
    assert.deepEqual(state, before, 'reading odds preserves saves and RNG');
  }
});

test('higher rates retain hard probability caps and inactive or ineligible events never roll', () => {
  for (const rating of [1, 10]) {
    const state = balancedLife(15);
    for (const person of [state, ...state.parents]) for (const key of keys) person.stats[key] = rating;
    const personal = chances(state);
    const household = familyEventChances(state);
    assert.ok(personal.every(event => Number.isFinite(event.chance) && event.chance >= 0 && event.chance <= .18));
    assert.ok(household.every(event => Number.isFinite(event.chance) && event.chance >= 0 && event.chance <= .12));
    state.ended = true;
    assert.ok(chances(state).every(event => event.chance === 0));
    assert.deepEqual(familyEventChances(state), []);
  }
  assert.equal(chanceOf(balancedLife(1), 'broken_bone'), 0);
  assert.ok(chanceOf(balancedLife(2), 'broken_bone') > 0);
  assert.equal(chanceOf(balancedLife(30), 'demanding_project'), 0);
  assert.ok(chanceOf(balancedLife(30), 'demanding_project', retail) > 0);
});

test('new toddler and school decisions resolve before their activity labels change', () => {
  for (const id of ['broken_tablet', 'art_workshop']) {
    assert.equal(chanceOf(balancedLife(1), id), 0);
    assert.ok(chanceOf(balancedLife(2), id) > 0);
    assert.ok(chanceOf(balancedLife(3), id) > 0);
    assert.equal(chanceOf(balancedLife(4), id), 0);
  }
  for (const id of ['extra_lessons', 'rehearsal_commitment']) {
    assert.equal(chanceOf(balancedLife(4), id), 0);
    assert.ok(chanceOf(balancedLife(5), id) > 0);
    assert.ok(chanceOf(balancedLife(16), id) > 0);
    assert.equal(chanceOf(balancedLife(17), id), 0);
  }
});

test('changing-plan outcomes offer distinct rewards and enforceable one-year commitments', () => {
  const fracture = EVENTS.find(event => event.id === 'broken_bone');
  assert.equal(fracture.focusLimits.toddler.work, 2);
  assert.equal(fracture.focusLimits.standard.social, 2);
  assert.ok(fracture.modifiers.health < 0);
  for (const event of EVENTS.filter(event => event.category === 'Changing plans')) {
    const outcomes = event.choices || [event];
    assert.ok(outcomes.some(outcome => outcome.focusLimits), event.id);
    if (event.choices) {
      assert.notDeepEqual(event.choices[0].focusLimits, event.choices[1].focusLimits, event.id);
      assert.ok(event.choices.some(choice => Object.values(choice.statChanges || {}).some(amount => amount > 0)), event.id);
    }
    for (const outcome of outcomes.filter(outcome => outcome.focusLimits)) {
      assert.equal(outcome.years, 1, event.id);
      for (const [stage, caps] of Object.entries(outcome.focusLimits)) {
        assert.ok(['toddler', 'standard'].includes(stage));
        assert.ok(Object.keys(caps).length);
        for (const [key, cap] of Object.entries(caps)) {
          assert.ok((stage === 'toddler' ? ['work', 'social', 'family', 'self', 'creative'] : ['work', 'social', 'family', 'self']).includes(key));
          assert.ok(Number.isInteger(cap) && cap >= 0 && cap < 5);
        }
      }
    }
  }
});
