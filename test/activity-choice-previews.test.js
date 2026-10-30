import test from 'node:test';
import assert from 'node:assert/strict';
import { createGame, migrateSave } from '../engine.js';
import { TODDLER_FOCUS } from '../development.js';
import { toddlerChoiceImpacts } from '../choice-impacts.js';

function toddler() {
  const state = createGame({ seed: 71321 });
  state.age = 3;
  state.focus = { ...TODDLER_FOCUS };
  for (const key of Object.keys(state.stats)) {
    state.stats[key] = 5;
    state.aptitudes[key] = 0;
  }
  for (const parent of state.parents) {
    parent.stats.stability = 5;
    parent.aptitudes.stability = 0;
    parent.relationship = 5;
  }
  return state;
}

function selected(state, activity, points) {
  const candidate = structuredClone(state);
  candidate.focus[activity] = points;
  let excess = Object.values(candidate.focus).reduce((sum, value) => sum + value, 0) - 12;
  for (const key of ['creative', 'work', 'social', 'self', 'family']) {
    if (key === activity || excess <= 0) continue;
    const taken = Math.min(candidate.focus[key], excess);
    candidate.focus[key] -= taken;
    excess -= taken;
  }
  return candidate;
}

test('Play shows only its own skill contribution below and above the balanced allocation', () => {
  const state = toddler();
  const expected = [[-1, 3], [-1, 2], [-1, 1], null, [1, 2], [1, 3]];
  for (let points = 0; points <= 5; points++) {
    const entries = toddlerChoiceImpacts(selected(state, 'work', points), 'work');
    if (!expected[points]) {
      assert.deepEqual(entries, []);
      continue;
    }
    assert.deepEqual(entries.map(entry => entry.stat), ['strength', 'social']);
    for (const entry of entries) {
      assert.equal(entry.group, 'you');
      assert.equal(Math.sign(entry.change), expected[points][0]);
      assert.equal(entry.level, expected[points][1]);
    }
  }
  state.parents.forEach(parent => { parent.career.status = 'unemployed'; });
  state.stats.health = 1;
  state.stats.stability = 1;
  const entries = toddlerChoiceImpacts(selected(state, 'work', 1), 'work');
  assert.deepEqual(entries.map(entry => entry.stat), ['strength', 'social'], 'household changes, wellbeing reversion and unused-point rest do not belong to Play');
});

test('Electronics and crafts retain their relative stat strengths as points change', () => {
  const state = toddler();
  const low = toddlerChoiceImpacts(selected(state, 'social', 0), 'social');
  assert.equal(Math.sign(low.find(entry => entry.stat === 'intelligence').change), -1);
  assert.equal(Math.sign(low.find(entry => entry.stat === 'social').change), 1);
  assert.deepEqual(toddlerChoiceImpacts(state, 'social'), []);
  for (const points of [3, 4, 5]) {
    const entries = toddlerChoiceImpacts(selected(state, 'social', points), 'social');
    assert.equal(entries.find(entry => entry.stat === 'intelligence').level, points - 2);
    const social = entries.find(entry => entry.stat === 'social');
    assert.ok(social.change < 0);
    assert.equal(social.level, 1);
  }
  const crafts = toddlerChoiceImpacts(selected(state, 'creative', 5), 'creative');
  assert.equal(crafts.find(entry => entry.stat === 'intelligence').level, 1);
  assert.equal(crafts.find(entry => entry.stat === 'creativity').level, 3);
});

test('Family time separates personal wellbeing, parent wellbeing and relationships without intelligence', () => {
  const state = toddler();
  const high = toddlerChoiceImpacts(selected(state, 'family', 5), 'family');
  assert.deepEqual(high.filter(entry => entry.group === 'you').map(entry => entry.stat), ['social', 'stability']);
  assert.ok(high.every(entry => entry.change > 0 && entry.level === 2));
  for (const parent of state.parents) {
    const entries = high.filter(entry => entry.parentId === parent.id);
    assert.deepEqual(entries.map(entry => [entry.group, entry.stat]), [['others', 'stability'], ['relationships', 'relationship']]);
  }
  const two = toddlerChoiceImpacts(state, 'family');
  assert.equal(two.length, state.parents.length);
  assert.ok(two.every(entry => entry.stat === 'relationship' && entry.parentId && entry.change < 0), 'two Family points reduce parent relationships without changing parent mental stability');
  const one = toddlerChoiceImpacts(selected(state, 'family', 1), 'family');
  assert.ok(one.filter(entry=>entry.parentId && entry.stat==='stability').every(entry=>entry.change<0), 'one Family point reduces parent mental stability');
  const three = toddlerChoiceImpacts(selected(state, 'family', 3), 'family');
  assert.ok(!three.some(entry => entry.parentId && entry.stat === 'relationship'), 'three Family points are neutral for parent relationships');
  assert.ok(three.filter(entry=>entry.parentId && entry.stat==='stability').every(entry=>entry.change>0));
  state.parents[0].alive = false;
  assert.ok(!toddlerChoiceImpacts(selected(state, 'family', 5), 'family').some(entry => entry.parentId === state.parents[0].id));
});

test('activity previews hide blocked effects without reranking partial gains or retained modifiers', () => {
  const state = selected(toddler(), 'work', 5);
  state.stats.strength = 9.99;
  let strength = toddlerChoiceImpacts(state, 'work').find(entry => entry.stat === 'strength');
  assert.ok(strength.change > 0 && strength.change < .02);
  assert.equal(strength.level, 3);
  state.stats.strength = 10;
  assert.ok(!toddlerChoiceImpacts(state, 'work').some(entry => entry.stat === 'strength'));
  state.stats.strength = 9;
  state.effects = [{ id: 'strong', years: 2, modifiers: { strength: 1 } }];
  assert.ok(!toddlerChoiceImpacts(state, 'work').some(entry => entry.stat === 'strength'));
  state.effects[0].years = 1;
  assert.ok(toddlerChoiceImpacts(state, 'work').some(entry => entry.stat === 'strength'), 'expiring modifiers do not hide next year activity gains');
  const low = selected(toddler(), 'work', 0);
  low.stats.strength = 0;
  assert.ok(!toddlerChoiceImpacts(low, 'work').some(entry => entry.stat === 'strength'));
  low.stats.strength = .01;
  const nearZero = toddlerChoiceImpacts(low, 'work').find(entry => entry.stat === 'strength');
  assert.equal(nearZero.change, -.01);
  assert.equal(nearZero.level, 3, 'partial clipping near zero retains the strongest loss sign');
  const family = selected(toddler(), 'family', 5);
  family.parents.forEach(parent => { parent.relationship = 10; parent.stats.stability = 10; });
  assert.ok(toddlerChoiceImpacts(family, 'family').every(entry => !entry.parentId));
});

test('family activity previews follow the remaining caregiver and adopted relative', () => {
  const state = selected(toddler(), 'family', 5);
  state.parents[0].abandonedAt = 2;
  let entries = toddlerChoiceImpacts(state, 'family').filter(entry => entry.parentId);
  assert.ok(entries.length > 0);
  assert.ok(entries.every(entry => entry.parentId === state.parents[1].id));
  state.parents[1].abandonedAt = 2;
  state.guardian = { ...structuredClone(state.parents[0]), id: 'guardian-test', guardianRole: 'aunt', adoptedAt: 2 };
  delete state.guardian.abandonedAt;
  const before = structuredClone(state);
  entries = toddlerChoiceImpacts(state, 'family').filter(entry => entry.parentId);
  assert.deepEqual(entries.map(entry => [entry.parentId, entry.stat]), [
    ['guardian-test', 'stability'], ['guardian-test', 'relationship'],
  ]);
  assert.deepEqual(state, before, 'caregiver previews do not consume RNG or alter saves');
});

test('activity previews survive reloads, preserve saves and RNG, and disappear when progression is blocked', () => {
  const state = selected(toddler(), 'family', 5);
  const before = structuredClone(state);
  const entries = toddlerChoiceImpacts(state, 'family');
  assert.deepEqual(state, before);
  const reloaded = migrateSave(JSON.parse(JSON.stringify(state)));
  assert.ok(reloaded);
  assert.deepEqual(toddlerChoiceImpacts(reloaded, 'family'), entries);
  for (const update of [{ age: 1 }, { age: 5 }, { ended: true }, { alive: false }, { needsSuccession: true }, { pendingEvents: [{}] }]) {
    assert.deepEqual(toddlerChoiceImpacts({ ...state, ...update }, 'family'), []);
  }
  assert.deepEqual(toddlerChoiceImpacts(state, 'unknown'), []);
  assert.deepEqual(state, before);
});
