import test from 'node:test';
import assert from 'node:assert/strict';
import { createGame, migrateSave } from '../engine.js';
import { TODDLER_FOCUS, TODDLER_ACTIVITY_EFFECTS } from '../development.js';
import { toddlerChoiceImpacts, toddlerActivityImpacts } from '../choice-impacts.js';

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
  const expected = [[-1, 3], [-1, 2], [-1, 1], null, [1, 1], [1, 3]];
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

test('Electronics and crafts preserve two-sign effects at zero points', () => {
  const state = toddler();
  const low = toddlerChoiceImpacts(selected(state, 'social', 0), 'social');
  assert.equal(Math.sign(low.find(entry => entry.stat === 'intelligence').change), -1);
  assert.equal(Math.sign(low.find(entry => entry.stat === 'social').change), 1);
  assert.equal(low.find(entry => entry.stat === 'social').level, 2);
  assert.equal(low.find(entry => entry.stat === 'intelligence').level, 2);
  assert.equal(toddlerChoiceImpacts(selected(state, 'social', 1), 'social').find(entry => entry.stat === 'social').level, 1);
  assert.deepEqual(toddlerChoiceImpacts(state, 'social'), []);
  for (const points of [3, 4, 5]) {
    const entries = toddlerChoiceImpacts(selected(state, 'social', points), 'social');
    assert.equal(entries.find(entry => entry.stat === 'intelligence').level, points - 2);
    const social = entries.find(entry => entry.stat === 'social');
    assert.ok(social.change < 0);
    assert.equal(social.level, points - 2);
  }
  const crafts = toddlerChoiceImpacts(selected(state, 'creative', 5), 'creative');
  assert.equal(crafts.find(entry => entry.stat === 'intelligence').level, 3);
  assert.equal(crafts.find(entry => entry.stat === 'creativity').level, 3);
  const noCrafts = toddlerChoiceImpacts(selected(state, 'creative', 0), 'creative').find(entry => entry.stat === 'intelligence');
  assert.ok(noCrafts.change < 0);
  assert.equal(noCrafts.level, 2);
});

test('every activity follows reduced-point ranks and increased-point endpoints across aptitudes and allocations', () => {
  const allocations = [TODDLER_FOCUS, { work: 5, social: 0, family: 1, self: 1, creative: 5 }, { work: 0, social: 5, family: 5, self: 2, creative: 0 }];
  for (const aptitude of [-3, 0, 3]) for (const focus of allocations) {
    const state = toddler();
    state.focus = { ...focus };
    for (const key of Object.keys(state.aptitudes)) state.aptitudes[key] = aptitude;
    state.parents.forEach((parent, index) => { parent.aptitudes.stability = index ? -aptitude : aptitude; });
    for (const [activity, coefficients] of Object.entries(TODDLER_ACTIVITY_EFFECTS)) {
      for (let points = 0; points <= 5; points++) {
        const candidate = selected(state, activity, points), before = structuredClone(candidate);
        const entries = toddlerChoiceImpacts(candidate, activity);
        const expected = Object.entries(coefficients).map(([stat, coefficient]) => ({ stat, direction: Math.sign(coefficient), neutral: TODDLER_FOCUS[activity] }));
        if (activity === 'family') for (const parent of state.parents) {
          expected.push({ stat: 'stability', parentId: parent.id, direction: 1, neutral: 2 });
          expected.push({ stat: 'relationship', parentId: parent.id, direction: 1, neutral: 3 });
        }
        for (const { stat, parentId, direction, neutral } of expected) {
          const entry = entries.find(entry => entry.stat === stat && entry.parentId === parentId);
          const distance = (points - neutral) * direction;
          const label = `${activity} ${points}: ${parentId || 'you'} ${stat}, aptitude ${aptitude}`;
          if (!distance) assert.equal(entry, undefined, `${label} hides neutral effects`);
          else {
            assert.ok(entry, label);
            assert.equal(Math.sign(entry.change), Math.sign(distance), label);
            const options = points < neutral ? neutral : 5 - neutral;
            const expectedLevel = points < neutral ? Math.abs(distance)
              : options < 2 ? 1 : 1 + Math.round(2 * (Math.abs(distance) - 1) / (options - 1));
            assert.equal(entry.level, expectedLevel, label);
          }
        }
        assert.equal(entries.length, expected.filter(({ neutral }) => points !== neutral).length);
        assert.deepEqual(candidate, before, 'reading every alternative preserves the save and RNG');
      }
    }
  }
});

test('temporary activity caps preserve the full sign scale and static help stays comparative', () => {
  const state = selected(toddler(), 'social', 1);
  state.effects = [{ id: 'limited-screen', name: 'Limited screen time', description: '', years: 1, modifiers: {}, kind: 'neutral', focusLimits: { toddler: { social: 1 } } }];
  const electronics = toddlerChoiceImpacts(state, 'social');
  assert.equal(electronics.find(entry => entry.stat === 'social').level, 1, 'a temporary maximum does not turn one point into the strongest option');
  assert.equal(electronics.find(entry => entry.stat === 'intelligence').level, 1);
  const helpLevel = (activity, stat) => toddlerActivityImpacts(activity).find(entry => entry.stat === stat).level;
  assert.equal(helpLevel('social', 'social'), 1);
  assert.equal(helpLevel('creative', 'intelligence'), 1);
  assert.equal(helpLevel('family', 'relationship'), 2);
});

test('Family time separates personal wellbeing, parent wellbeing and relationships without intelligence', () => {
  const state = toddler();
  const high = toddlerChoiceImpacts(selected(state, 'family', 5), 'family');
  assert.deepEqual(high.filter(entry => entry.group === 'you').map(entry => entry.stat), ['social', 'stability']);
  assert.ok(high.every(entry => entry.change > 0 && entry.level === 3));
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
