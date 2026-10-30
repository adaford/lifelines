import test from 'node:test';
import assert from 'node:assert/strict';
import { createGame, migrateSave } from '../engine.js';
import { schoolFocusEffects } from '../development.js';
import { schoolChoiceImpacts } from '../choice-impacts.js';

function student(age = 12) {
  const state = createGame({ seed: 71321 });
  state.age = age;
  state.education = { status: age < 18 ? 'school' : 'college', years: 0 };
  state.focus = { work: 3, social: 3, family: 3, self: 3 };
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

function selected(state, area, points) {
  const candidate = structuredClone(state);
  candidate.focus[area] = points;
  let excess = Object.values(candidate.focus).reduce((sum, value) => sum + value, 0) - 12;
  for (const key of ['work', 'social', 'family', 'self']) {
    if (key === area || excess <= 0) continue;
    const taken = Math.min(candidate.focus[key], excess);
    candidate.focus[key] -= taken;
    excess -= taken;
  }
  return candidate;
}

const ownStats = {
  work: { intelligence: 1, stability: -1 },
  social: { social: 1, creativity: 1, stability: 1 },
  family: { social: 1, stability: 1 },
  self: { intelligence: 1, strength: 1, creativity: 1, health: 1, stability: 1 },
};

test('school and college show each choice contribution with toddler-style relative signs', () => {
  for (const age of [5, 12, 17, 19]) for (const aptitude of [-3, 0, 3]) {
    const state = student(age);
    for (const stat of Object.keys(state.aptitudes)) state.aptitudes[stat] = aptitude;
    for (const [area, affected] of Object.entries(ownStats)) for (let points = 0; points <= 5; points++) {
      const candidate = selected(state, area, points), before = structuredClone(candidate);
      const entries = schoolChoiceImpacts(candidate, area).filter(entry => !entry.parentId);
      assert.deepEqual(entries.map(entry => entry.stat).sort(), points === 3 ? [] : Object.keys(affected).sort(), `${age} ${area} ${points} includes only the choice's stats`);
      for (const entry of entries) {
        assert.equal(Math.sign(entry.change), Math.sign(points - 3) * affected[entry.stat]);
        assert.equal(entry.level, [3, 2, 1, 0, 1, 3][points], `${age} ${area} ${points} ${entry.stat}`);
      }
      assert.deepEqual(candidate, before, 'comparison does not mutate choices, saves, or RNG');
    }
  }
});

test('school contribution magnitudes include halved practice and stress without background or unused rest', () => {
  const state = student();
  const low = selected(state, 'work', 0);
  let effects = schoolFocusEffects(low, 'work');
  assert.ok(Math.abs(effects.intelligence + .129375) < 1e-10);
  assert.ok(Math.abs(effects.stability - .15) < 1e-10, 'less School relieves only its own stress');
  assert.equal(effects.health, 0);
  const high = selected(state, 'self', 5);
  effects = schoolFocusEffects(high, 'self');
  for (const [stat, amount] of Object.entries({ intelligence: .04025, strength: .115, creativity: .092, health: .035, stability: .07 })) {
    assert.ok(Math.abs(effects[stat] - amount) < 1e-10, `${stat} uses half-strength self-focus`);
  }
  const initial = schoolChoiceImpacts(low, 'work');
  low.parents.forEach(parent => { parent.career.status = 'unemployed'; parent.stats.stability = 1; });
  low.stats.intelligence = 4;
  low.stats.health = 1;
  low.focus.social = 0;
  low.focus.family = 0;
  low.focus.self = 0;
  assert.deepEqual(schoolChoiceImpacts(low, 'work').map(({ stat, change, level }) => ({ stat, change: Math.round(change * 100), level })),
    initial.map(({ stat, change, level }) => ({ stat, change: Math.round(change * 100), level })), 'household decline, reversion, and spare points stay out of the School row');
  const college = selected(student(19), 'work', 5);
  const collegeEffects = schoolFocusEffects(college, 'work');
  assert.ok(Math.abs(collegeEffects.intelligence - .075) < 1e-10);
  assert.ok(Math.abs(collegeEffects.stability + .1) < 1e-10);
});

test('Family previews retain school caregiver neutral points and follow guardians', () => {
  const state = student();
  for (let points = 0; points <= 5; points++) {
    const entries = schoolChoiceImpacts(selected(state, 'family', points), 'family');
    for (const parent of state.parents) {
      const stability = entries.find(entry => entry.parentId === parent.id && entry.stat === 'stability');
      const relationship = entries.find(entry => entry.parentId === parent.id && entry.stat === 'relationship');
      if (points === 3) assert.equal(stability, undefined);
      else {
        assert.ok(Math.abs(stability.change - (points - 3) * .0125) < 1e-10);
        assert.equal(stability.level, [3, 2, 1, 0, 1, 3][points]);
      }
      if (points === 2) assert.equal(relationship, undefined);
      else {
        assert.ok(Math.abs(relationship.change - (points - 2) * .04) < 1e-10);
        assert.equal(relationship.level, [2, 1, 0, 1, 2, 3][points]);
      }
    }
    assert.ok(entries.every(entry => entry.stat !== 'lifestyle'));
  }
  state.parents.forEach(parent => { parent.abandonedAt = 11; });
  state.guardian = { ...structuredClone(state.parents[0]), id: 'guardian-school', guardianRole: 'aunt', adoptedAt: 11 };
  delete state.guardian.abandonedAt;
  const entries = schoolChoiceImpacts(selected(state, 'family', 5), 'family').filter(entry => entry.parentId);
  assert.deepEqual(entries.map(entry => [entry.parentId, entry.stat]), [['guardian-school', 'stability'], ['guardian-school', 'relationship']]);
});

test('school rows respect active caps and rating limits without reranking signs', () => {
  const state = selected(student(), 'work', 5);
  state.effects = [{ id: 'limited-school', name: 'Recovery', years: 1, modifiers: {}, focusLimits: { standard: { work: 2 } } }];
  const before = structuredClone(state);
  const capped = schoolChoiceImpacts(state, 'work');
  assert.equal(capped.find(entry => entry.stat === 'intelligence').level, 1);
  assert.ok(capped.find(entry => entry.stat === 'intelligence').change < 0);
  assert.deepEqual(state, before, 'reading the cap never reallocates saved points');
  state.effects = [];
  state.stats.intelligence = 9.99;
  let entry = schoolChoiceImpacts(state, 'work').find(entry => entry.stat === 'intelligence');
  assert.ok(entry.change > 0 && entry.change < .02);
  assert.equal(entry.level, 3);
  state.stats.intelligence = 10;
  assert.ok(!schoolChoiceImpacts(state, 'work').some(entry => entry.stat === 'intelligence'));
  state.stats.intelligence = 9;
  state.effects = [{ id: 'bright', years: 2, modifiers: { intelligence: 1 } }];
  assert.ok(!schoolChoiceImpacts(state, 'work').some(entry => entry.stat === 'intelligence'));
  state.effects[0].years = 1;
  assert.ok(schoolChoiceImpacts(state, 'work').some(entry => entry.stat === 'intelligence'), 'expiry is separate from the upcoming choice');
  const low = selected(student(), 'work', 0);
  low.stats.intelligence = 0;
  assert.ok(!schoolChoiceImpacts(low, 'work').some(entry => entry.stat === 'intelligence'));
  const family = selected(student(), 'family', 5);
  family.parents.forEach(parent => { parent.stats.stability = 10; parent.relationship = 10; });
  assert.ok(schoolChoiceImpacts(family, 'family').every(entry => !entry.parentId));
});

test('school rows survive reloads and hide outside school or when progression is blocked', () => {
  const state = selected(student(), 'family', 5);
  const before = structuredClone(state), entries = schoolChoiceImpacts(state, 'family');
  const reloaded = migrateSave(JSON.parse(JSON.stringify(state)));
  assert.ok(reloaded);
  assert.deepEqual(schoolChoiceImpacts(reloaded, 'family'), entries);
  for (const update of [{ age: 4 }, { age: 19, education: { status: 'workforce', years: 0 } }, { age: 18, education: { status: 'undecided', years: 0 } }, { ended: true }, { alive: false }, { needsSuccession: true }, { pendingEvents: [{}] }]) {
    assert.deepEqual(schoolChoiceImpacts({ ...state, ...update }, 'family'), []);
  }
  assert.deepEqual(schoolChoiceImpacts(state, 'creative'), []);
  assert.deepEqual(state, before);
});
