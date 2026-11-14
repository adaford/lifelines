import test from 'node:test';
import assert from 'node:assert/strict';
import { boostLowStatRates, lowStatEventTarget, LOW_STAT_EVENT_CAP } from '../event-rates.js';
import { FAMILY_EVENTS, familyEventChances, abandonmentChance } from '../family-events.js';

const close = (actual, expected, message) => assert.ok(Math.abs(actual - expected) < 1e-12, `${message || ''}: ${actual} versus ${expected}`);
const union = rows => 1 - rows.reduce((none, row) => none * (1 - row.chance), 1);
const event = (id, keys = ['health'], extra = {}) => ({ id, statFactors: keys.map(key => [key, 'low']), ...extra });
const rate = (id, chance) => ({ id, name: id, chance });

test('very low ratings target an event about every other year with a smooth shoulder toward ordinary ratings', () => {
  for (const [rating, target] of [[-5, .6], [0, .6], [1, .55], [2, .5], [2.5, .375], [3, .25], [3.5, .125], [4, 0], [5, 0], [10, 0]]) {
    close(lowStatEventTarget(rating), target);
  }
  for (const value of [undefined, null, '1', NaN, Infinity, -Infinity]) assert.equal(lowStatEventTarget(value), 0);
  const catalog = [event('first'), event('second')];
  const rates = [rate('first', .04), rate('second', .02)];
  for (const rating of [0, 1, 2, 2.5, 3, 3.5]) {
    const boosted = boostLowStatRates(catalog, rates, { health: rating });
    close(union(boosted), lowStatEventTarget(rating));
    assert.ok(boosted.every((row, index) => row.chance >= rates[index].chance));
  }
  assert.deepEqual(boostLowStatRates(catalog, rates, { health: 4 }), rates);
});

test('sparse ordinary event pools can reach the target while major crises and rare events keep their own odds', () => {
  const catalog = [event('small'), event('major', ['health'], { severity: 'major' }), event('rare', ['health'], { rare: true }), event('locked')];
  const rates = [rate('small', .08), rate('major', .04), rate('rare', .0004), rate('locked', 0)];
  const boosted = boostLowStatRates(catalog, rates, { health: 2 });
  close(union(boosted.slice(0, 2)), .5);
  assert.equal(boosted[1].chance, .04);
  assert.equal(boosted[2].chance, .0004);
  assert.equal(boosted[3].chance, 0);
  close(boostLowStatRates([catalog[0]], [rates[0]], { health: -2 })[0].chance, LOW_STAT_EVENT_CAP);
  assert.deepEqual(boostLowStatRates([catalog[1]], [rates[1]], { health: 0 }), [rates[1]], 'a sparse pool of major crises alone is not inflated');
});

test('supplemental coverage neither consumes an original hazard floor nor creates new floors for every relative stat', () => {
  const original = [event('original')];
  const supplemental = event('coverage', ['health'], { supplemental: true });
  const base = [rate('original', .02)];
  const extra = rate('coverage', .001);
  const without = boostLowStatRates(original, base, { health: 1 });
  const withExtra = boostLowStatRates([...original, supplemental], [...base, extra], { health: 1 });
  assert.deepEqual(withExtra[0], without[0], 'the existing 55% ordinary floor is unchanged');
  assert.deepEqual(withExtra[1], extra, 'coverage keeps its own small base chance');
  assert.deepEqual(boostLowStatRates([supplemental], [extra], { health: 0 }), [extra], 'a newly covered pool is not inflated to 60%');
});

test('overlapping low stats use the largest shared-event boost and do not depend on stat or catalog order', () => {
  const catalog = [event('shared', ['health', 'social']), event('health'), event('social', ['social'])];
  const rates = [rate('shared', .03), rate('health', .06), rate('social', .01)];
  const healthOnly = boostLowStatRates(catalog, rates, { health: 2, social: 5 });
  const socialOnly = boostLowStatRates(catalog, rates, { health: 5, social: 0 });
  const both = boostLowStatRates(catalog, rates, { health: 2, social: 0 });
  close(both[0].chance, Math.max(healthOnly[0].chance, socialOnly[0].chance));
  assert.ok(union([both[0], both[1]]) >= .5);
  close(union([both[0], both[2]]), .6);
  const reversed = boostLowStatRates([...catalog].reverse().map(entry => ({ ...entry, statFactors: [...entry.statFactors].reverse() })), [...rates].reverse(), { social: 0, health: 2 }).reverse();
  both.forEach((row, index) => close(row.chance, reversed[index].chance));
  assert.ok(both.every(row => row.chance <= LOW_STAT_EVENT_CAP));
});

test('boosting leaves healthy, high-only, ineligible, and already frequent events unchanged and never mutates its inputs', () => {
  const catalog = [event('frequent'), event('high', ['health'], { statFactors: [['health', 'high']] }), event('locked')];
  const rates = [rate('frequent', .75), rate('high', .08), rate('locked', 0)];
  const values = { health: 0 };
  const before = structuredClone({ catalog, rates, values });
  catalog.forEach(entry => { entry.statFactors.forEach(Object.freeze); Object.freeze(entry.statFactors); Object.freeze(entry); });
  rates.forEach(Object.freeze); Object.freeze(catalog); Object.freeze(rates); Object.freeze(values);
  const boosted = boostLowStatRates(catalog, rates, values);
  assert.deepEqual(boosted, rates, 'a current rate above the low-stat cap is never reduced');
  assert.notEqual(boosted, rates);
  boosted.forEach((row, index) => assert.notEqual(row, rates[index]));
  assert.deepEqual({ catalog, rates, values }, before);
  assert.deepEqual(boostLowStatRates([event('empty')], [rate('empty', .01)], {}), [rate('empty', .01)]);
});

function household(age) {
  const stats = Object.fromEntries(['health', 'stability', 'intelligence', 'strength', 'social', 'creativity', 'attractiveness'].map(key => [key, 5]));
  return { age, stats, focus: { work: 2, social: 2, family: 2, self: 2 }, education: { status: 'school' },
    parents: [{ id: 'mom', name: 'Mom', age: age + 30, stats: { ...stats }, relationship: 8 }, { id: 'dad', name: 'Dad', age: age + 31, stats: { ...stats }, relationship: 8 }], children: [], effects: [], rng: 12345 };
}

test('household rate floors follow each named parent rather than the player or another parent across childhood', () => {
  for (const age of [0, 3, 8, 15]) {
    const state = household(age);
    const ordinary = familyEventChances(state);
    state.stats.stability = 0;
    assert.deepEqual(familyEventChances(state), ordinary, 'player stability does not change parental eligibility or boosts');
    state.parents[0].stats.stability = 2;
    const before = structuredClone(state);
    const boosted = familyEventChances(state);
    assert.deepEqual(boosted.filter(row => row.subjectId === 'dad'), ordinary.filter(row => row.subjectId === 'dad'));
    const related = boosted.filter(row => row.subjectId === 'mom' && FAMILY_EVENTS.find(entry => entry.id === row.eventId)?.statFactors?.some(([key, direction]) => key === 'stability' && direction === 'low'));
    assert.ok(union(related) >= .5 - 1e-12, `age ${age}: ${union(related)}`);
    const abandonment = boosted.find(row => row.subjectId === 'mom' && row.eventId === 'household_parent_abandonment');
    assert.equal(abandonment.chance, abandonmentChance(state, state.parents[0]));
    for (const row of boosted.filter(row => row.subjectId === 'mom' && FAMILY_EVENTS.find(entry => entry.id === row.eventId)?.severity === 'major')) {
      assert.ok(row.chance <= .12, 'major parental events retain their individual cap');
    }
    assert.deepEqual(state, before);
    state.parents[0].alive = false;
    assert.ok(familyEventChances(state).filter(row => row.subjectId === 'mom').every(row => row.chance === 0));
    state.parents[0].alive = true; state.parents[0].abandonedAt = age;
    assert.ok(familyEventChances(state).filter(row => row.subjectId === 'mom').every(row => row.chance === 0));
  }
});
