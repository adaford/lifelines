import { focusEffect, focusBudget, defaultFocus } from '../focus-rules.js';
import test from 'node:test';
import assert from 'node:assert/strict';
import { createGame, migrateSave, annualForecast } from '../engine.js';
import { TODDLER_FOCUS, TODDLER_ACTIVITY_EFFECTS, toddlerActivityNeutral, skillChanges } from '../development.js';
import { toddlerChoiceImpacts, toddlerActivityImpacts, choiceImpacts } from '../choice-impacts.js';

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
  let excess = Object.values(candidate.focus).reduce((sum, value) => sum + value, 0) - focusBudget(candidate.age);
  for (const key of ['creative', 'work', 'social', 'self', 'family']) {
    if (key === activity || excess <= 0) continue;
    const taken = Math.min(candidate.focus[key], excess);
    candidate.focus[key] -= taken;
    excess -= taken;
  }
  return candidate;
}

test('activity previews show half-strength gains and losses without changing relative signs', () => {
  const cases = [
    ['work', 4, 'strength', .09, 3],
    ['work', 0, 'strength', -.09, 3],
    ['social', 0, 'social', .05, 3],
    ['social', 4, 'intelligence', .08, 3],
    ['creative', 0, 'intelligence', -.08, 3],
    ['creative', 4, 'creativity', .09, 3],
    ['self', 4, 'health', .08, 3],
    ['self', 0, 'stability', -.06, 3],
    ['family', 4, 'stability', .06, 3],
  ];
  for (const [activity, points, stat, expected, level] of cases) {
    const entries = toddlerChoiceImpacts(selected(toddler(), activity, points), activity);
    const entry = entries.find(entry => entry.stat === stat && !entry.parentId);
    assert.ok(Math.abs(entry.change - expected) < 1e-10, `${activity} ${points}: ${stat} has the halved contribution rounded to stat precision`);
    assert.equal(entry.level, level, `${activity} ${points}: signs retain their relative strength`);
    assert.ok(entries.every(entry => entry.stat !== 'lifestyle'));
  }
  for (const points of [0, 1, 2, 3, 4]) {
    const state = selected(toddler(), 'family', points);
    const entries = toddlerChoiceImpacts(state, 'family');
    for (const parent of state.parents) {
      const relationship = entries.find(entry => entry.parentId === parent.id && entry.stat === 'relationship');
      const stability = entries.find(entry => entry.parentId === parent.id && entry.stat === 'stability');
      if (points === 2) assert.equal(relationship, undefined);
      else assert.ok(Math.abs(relationship.change - focusEffect(points) * .04) < 1e-10);
      if (points === 2) assert.equal(stability, undefined);
      else assert.ok(Math.abs(stability.change - (Math.round((5 + focusEffect(points) * .0125) * 100) / 100 - 5)) < 1e-10);
    }
  }
});

test('crying previews halve personal and caregiver effects once and match the annual forecast', () => {
  const state = toddler();
  state.age = 1;
  state.focus = { work: 3, social: 3, family: 3, self: 3 };
  const expected = {
    intelligence: [-.05, -.02, .02, .05, .07],
    stability: [-.12, -.06, .06, .12, .18],
    health: [-.01, -.01, 0, .01, .01],
  };
  const parentStability = [.1, 0, -.3, -.6, -.9];
  for (let cryLevel = 1; cryLevel <= 5; cryLevel++) {
    state.cryLevel = cryLevel;
    const before = structuredClone(state);
    const entries = choiceImpacts(state);
    for (const [stat, amounts] of Object.entries(expected)) {
      const entry = entries.find(entry => entry.stat === stat && !entry.parentId);
      if (!amounts[cryLevel - 1]) assert.equal(entry, undefined);
      else assert.ok(Math.abs(entry.change - amounts[cryLevel - 1]) < 1e-10, `${stat} at cry level ${cryLevel}`);
    }
    const forecast = annualForecast(state);
    for (const parent of state.parents) {
      const predicted = forecast.parents.find(person => person.id === parent.id);
      for (const [stat, amount] of [['stability', parentStability[cryLevel - 1]], ['relationship', .1 * (cryLevel - 3)]]) {
        const entry = entries.find(entry => entry.parentId === parent.id && entry.stat === stat);
        if (!amount) assert.equal(entry, undefined);
        else assert.ok(Math.abs(entry.change - amount) < 1e-10, `${stat} for ${parent.id} at cry level ${cryLevel}`);
        assert.ok(Math.abs(predicted[stat].change - amount) < 1e-10, 'preview and annual parent changes use the same scale');
      }
    }
    assert.ok(!entries.some(entry => entry.stat === 'lifestyle' || entry.stat === 'strength' && !entry.parentId));
    assert.deepEqual(state, before, 'previewing the scaled changes preserves saves and RNG');
  }
});

test('Play shows only its own skill contribution below and above the balanced allocation', () => {
  const state = toddler();
  const expected = [[-1, 3], [-1, 1], null, [1, 1], [1, 3]];
  for (let points = 0; points <= 4; points++) {
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

test('Electronics and crafts use the requested signs across all five allocations', () => {
  const state = toddler(), before = structuredClone(state);
  const expected = {
    social: { social: ['+++', '+', '', '-', '---'], intelligence: ['---', '-', '', '+', '+++'] },
    creative: { creativity: ['---', '-', '', '+', '+++'], intelligence: ['---', '-', '', '+', '+++'] },
  };
  for (const [activity, stats] of Object.entries(expected)) for (let points = 0; points <= 4; points++) {
    const entries = toddlerChoiceImpacts(selected(state, activity, points), activity);
    for (const [stat, signs] of Object.entries(stats)) {
      const entry = entries.find(entry => entry.stat === stat);
      assert.equal(entry ? (entry.change > 0 ? '+' : '-').repeat(entry.level) : '', signs[points], `${activity} ${points}: ${stat}`);
    }
  }
  assert.deepEqual(state, before, 'reading each allocation preserves stats and RNG');
});

test('toddler skill changes are proportional to displayed signs before aptitude and boundary response', () => {
  const state = toddler();
  for (const [activity, coefficients] of Object.entries(TODDLER_ACTIVITY_EFFECTS)) {
    for (const stat of ['intelligence', 'strength', 'social', 'creativity'].filter(stat => coefficients[stat])) {
      const baseline = { ...state, focus: { work: 0, social: 0, family: 0, self: 0, creative: 0, [activity]: 2 } };
      baseline.focus[activity] = toddlerActivityNeutral(activity, stat);
      const neutral = skillChanges(baseline)[stat];
      for (let points = 0; points <= 4; points++) {
        const candidate = { ...baseline, focus: { ...baseline.focus, [activity]: points } };
        const actual = skillChanges(candidate)[stat] - neutral;
        const entry = toddlerChoiceImpacts(candidate, activity).find(entry => entry.stat === stat);
        if (!entry) assert.ok(Math.abs(actual) < 1e-10, `${activity} ${points}: hidden effect is neutral`);
        else assert.ok(Math.abs(actual / (Math.sign(entry.change) * entry.level) - Math.abs(coefficients[stat]) * .5 * 1.15 / toddlerActivityImpacts(activity).find(item => item.stat === stat).level) < 1e-10,
          `${activity} ${points}: each displayed sign has one equal raw skill contribution`);
      }
    }
  }
});

test('every activity follows reduced-point ranks and increased-point endpoints across aptitudes and allocations', () => {
  const allocations = [TODDLER_FOCUS, { work: 4, social: 0, family: 1, self: 1, creative: 4 }, { work: 0, social: 4, family: 4, self: 2, creative: 0 }];
  for (const aptitude of [-3, 0, 3]) for (const focus of allocations) {
    const state = toddler();
    state.focus = { ...focus };
    for (const key of Object.keys(state.aptitudes)) state.aptitudes[key] = aptitude;
    state.parents.forEach((parent, index) => { parent.aptitudes.stability = index ? -aptitude : aptitude; });
    for (const [activity, coefficients] of Object.entries(TODDLER_ACTIVITY_EFFECTS)) {
      for (let points = 0; points <= 4; points++) {
        const candidate = selected(state, activity, points), before = structuredClone(candidate);
        const entries = toddlerChoiceImpacts(candidate, activity);
        const expected = Object.entries(coefficients).map(([stat, coefficient]) => ({ stat, direction: Math.sign(coefficient), neutral: toddlerActivityNeutral(activity, stat) }));
        if (activity === 'family') for (const parent of state.parents) {
          expected.push({ stat: 'stability', parentId: parent.id, direction: 1, neutral: 2 });
          expected.push({ stat: 'relationship', parentId: parent.id, direction: 1, neutral: 2 });
        }
        for (const { stat, parentId, direction, neutral } of expected) {
          const entry = entries.find(entry => entry.stat === stat && entry.parentId === parentId);
          const distance = (points - neutral) * direction;
          const label = `${activity} ${points}: ${parentId || 'you'} ${stat}, aptitude ${aptitude}`;
          if (!distance) assert.equal(entry, undefined, `${label} hides neutral effects`);
          else {
            assert.ok(entry, label);
            assert.equal(Math.sign(entry.change), Math.sign(distance), label);
            const strength = parentId ? 1 : toddlerActivityImpacts(activity).find(item => item.stat === stat).level;
            const expectedLevel = Math.abs(focusEffect(points)) * strength;
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
  assert.equal(helpLevel('family', 'relationship'), 1);
});

test('Family time separates personal wellbeing, parent wellbeing and relationships without intelligence', () => {
  const state = toddler();
  const high = toddlerChoiceImpacts(selected(state, 'family', 4), 'family');
  assert.deepEqual(high.filter(entry => entry.group === 'you').map(entry => entry.stat), ['social', 'stability']);
  assert.ok(high.every(entry => entry.change > 0 && entry.level === 3));
  for (const parent of state.parents) {
    const entries = high.filter(entry => entry.parentId === parent.id);
    assert.deepEqual(entries.map(entry => [entry.group, entry.stat]), [['others', 'stability'], ['relationships', 'relationship']]);
  }
  const two = toddlerChoiceImpacts(state, 'family');
  assert.deepEqual(two, [], 'two Family points are neutral for personal and caregiver effects');
  const one = toddlerChoiceImpacts(selected(state, 'family', 1), 'family');
  assert.ok(one.filter(entry=>entry.parentId && entry.stat==='stability').every(entry=>entry.change<0), 'one Family point reduces parent mental stability');
  const three = toddlerChoiceImpacts(selected(state, 'family', 3), 'family');
  assert.ok(three.filter(entry => entry.parentId && entry.stat === 'relationship').every(entry => entry.change > 0 && entry.level === 1), 'three Family points start improving parent relationships');
  assert.ok(three.filter(entry=>entry.parentId && entry.stat==='stability').every(entry=>entry.change>0));
  state.parents[0].alive = false;
  assert.ok(!toddlerChoiceImpacts(selected(state, 'family', 4), 'family').some(entry => entry.parentId === state.parents[0].id));
});

test('activity previews hide blocked effects without reranking partial gains or retained modifiers', () => {
  const state = selected(toddler(), 'work', 4);
  state.stats.strength = 9.99;
  let strength = toddlerChoiceImpacts(state, 'work').find(entry => entry.stat === 'strength');
  assert.ok(strength.change > 0 && strength.change < .02);
  assert.equal(strength.level, 3);
  state.stats.strength = 10;
  assert.ok(!toddlerChoiceImpacts(state, 'work').some(entry => entry.stat === 'strength'));
  state.stats.strength = 9;
  state.effects = [{ id: 'strong', years: 2, modifiers: { strength: 1 } }];
  assert.ok(toddlerChoiceImpacts(state, 'work').some(entry => entry.stat === 'strength'), 'a retained buff does not cap the effective rating at ten');
  state.effects[0].years = 1;
  assert.ok(toddlerChoiceImpacts(state, 'work').some(entry => entry.stat === 'strength'), 'expiring modifiers do not hide next year activity gains');
  const low = selected(toddler(), 'work', 0);
  low.stats.strength = 0;
  assert.ok(!toddlerChoiceImpacts(low, 'work').some(entry => entry.stat === 'strength'));
  low.stats.strength = .01;
  const nearZero = toddlerChoiceImpacts(low, 'work').find(entry => entry.stat === 'strength');
  assert.equal(nearZero.change, -.01);
  assert.equal(nearZero.level, 3, 'partial clipping near zero retains the strongest loss sign');
  const family = selected(toddler(), 'family', 4);
  family.parents.forEach(parent => { parent.relationship = 10; parent.stats.stability = 10; });
  assert.ok(toddlerChoiceImpacts(family, 'family').every(entry => !entry.parentId));
});

test('family activity previews follow the remaining caregiver and adopted relative', () => {
  const state = selected(toddler(), 'family', 4);
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
  const state = selected(toddler(), 'family', 4);
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
