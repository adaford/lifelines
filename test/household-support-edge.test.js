import { changedLifestyle, lifestyleFromResources } from '../lifestyle.js';
﻿import test from 'node:test';
import assert from 'node:assert/strict';
import { createGame, JOBS, haveChild, householdLifestyle, familyLifestyle,
  quitFame, succeed, validateSave, migrateSave } from '../engine.js';
import { defaultFocus } from '../focus-rules.js';

const clone = value => structuredClone(value);
function adult(age = 25, income = 88000) {
  const state = createGame({ seed: 432117, firstName: 'Jamie', surname: 'Support' });
  Object.assign(state, { age, conditions: [], effects: [], maturityAge: 18, height: 68,
    adultHeight: 68, growthAnchor: null, fame: null, money: 0, income,
    education: { status: 'workforce', years: 0 },
    jobOffers: JOBS.filter(job => !job.requiresCollege).slice(0, 10).map(job => job.id),
    focus: defaultFocus(age) });
  for (const parent of state.parents) {
    parent.age = age + 25;
    parent.lifestyle = 4;
    parent.career.progress = 4;
  }
  assert.equal(validateSave(state), true);
  return state;
}
const support = amount => ({ id: 'test-household-support', name: 'Transport arrangement',
  description: 'A temporary change to household transport access.', years: 1,
  modifiers: {}, kind: amount > 0 ? 'positive' : 'negative', householdLifestyle: amount });
function reload(state) {
  assert.equal(validateSave(state), true);
  const before = clone(state);
  assert.deepEqual(migrateSave(clone(state)), before);
  assert.deepEqual(state, before);
}

test('an adult household grant or cost does not spill into young siblings in the parental household', () => {
  for (const amount of [.18, -.18]) {
    const state = adult();
    assert.equal(haveChild(state).ok, true);
    const sibling = state.children.pop();
    sibling.id = 'younger-sibling';
    sibling.parentIds = state.parents.map(parent => parent.id);
    sibling.lifestyle = 4;
    state.siblings.push(sibling);
    state.effects = [support(amount)];
    state.fame = { kind: 'personal', activityId: null, rating: 5, support: 0, startedAge: 20 };
    const parentResources = state.parents.map(parent => [parent.lifestyle, clone(parent.career)]);
    const rng = state.rng;
    assert.equal(quitFame(state).ok, true, 'refresh current household support without advancing the year');
    assert.equal(state.lifestyle, changedLifestyle(lifestyleFromResources(state.income, state.money), amount), 'adult current household receives its own transport support');
    assert.equal(sibling.lifestyle, 4, 'younger sibling retains the parental household support');
    assert.equal(householdLifestyle(state), 4);
    assert.equal(familyLifestyle(state, state.parents[0]), 4);
    assert.deepEqual(state.parents.map(parent => [parent.lifestyle, parent.career]), parentResources);
    assert.equal(state.rng, rng);
    reload(state);
  }
});

test('succession ends temporary household support without capitalizing it into the next household', () => {
  for (const [amount, income] of [[.18, 88000], [-.18, 88000], [2, 198000], [2, 100000000]]) {
    const base = lifestyleFromResources(income, 0);
    const underlying = changedLifestyle(base, -1);
    const recorded = changedLifestyle(base, amount - 1);
    const state = adult(65, income);
    state.effects = [support(amount)];
    assert.equal(haveChild(state).ok, true);
    assert.equal(state.lifestyle, recorded);
    const heir = clone(state.children[0]);
    const beforeHistory = clone(state.history);
    reload(state);
    assert.equal(succeed(state, heir.id).ok, true);
    assert.equal(state.age, heir.age);
    assert.equal(state.lifestyle, underlying, 'the successor gets underlying household resources, including when support was clipped');
    assert.equal(state.parents[0].lifestyle, underlying);
    assert.equal(state.parents[0].career.progress, underlying);
    assert.deepEqual(state.effects, []);
    assert.equal(state.lineage.at(-1).lifestyle, recorded, 'historical chapter retains the actual recorded lifestyle');
    assert.deepEqual(state.stats, heir.stats);
    assert.deepEqual(state.aptitudes, heir.aptitudes);
    for (const entry of beforeHistory) assert.deepEqual(state.history.find(next => next.id === entry.id), entry);
    reload(state);
  }
});
