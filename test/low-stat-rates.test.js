import test from 'node:test';
import assert from 'node:assert/strict';
import { boostLowStatRates, lowStatEventTarget, LOW_STAT_EVENT_CAP } from '../event-rates.js';
import { FAMILY_EVENTS, familyEventChances, abandonmentChance } from '../family-events.js';
import { EVENT_BALANCE } from '../balance.js';

const close = (actual, expected, message) => assert.ok(Math.abs(actual - expected) < 1e-12, `${message || ''}: ${actual} versus ${expected}`);
const union = rows => 1 - rows.reduce((none, row) => none * (1 - row.chance), 1);
// Pools count only live events, so each synthetic event carries a consequence.
const event = (id, keys = ['health'], extra = {}) => ({ id, statFactors: keys.map(key => [key, 'low']), statChanges: { creativity: .1 }, ...extra });
const pooled = (target, count) => Math.min(target, 1 - (1 - LOW_STAT_EVENT_CAP) ** count);
const rate = (id, chance) => ({ id, name: id, chance });

test('very low ratings target a frequent event pool with a curved shoulder that starts one point below neutral', () => {
  const curve = rating => .9 * ((4 - rating) / 4) ** 1.5;
  for (const [rating, target] of [[-5, .9], [0, .9], [1, curve(1)], [2, curve(2)], [2.5, curve(2.5)], [3, curve(3)], [3.5, curve(3.5)], [4, 0], [5, 0], [10, 0]]) {
    close(lowStatEventTarget(rating), target, `rating ${rating}`);
  }
  close(lowStatEventTarget(3), .1125); close(lowStatEventTarget(0), .9);
  for (const value of [undefined, null, '1', NaN, Infinity, -Infinity]) assert.equal(lowStatEventTarget(value), 0);
  const catalog = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'].map(id => event(id));
  const rates = catalog.map(({ id }, index) => rate(id, .001 * (index + 1)));
  for (const rating of [0, 1, 2, 2.5, 3, 3.5]) {
    const boosted = boostLowStatRates(catalog, rates, { health: rating });
    close(union(boosted), lowStatEventTarget(rating), `rating ${rating}`);
    assert.ok(boosted.every((row, index) => row.chance >= rates[index].chance && row.chance <= LOW_STAT_EVENT_CAP + 1e-12));
  }
  const thin = boostLowStatRates(catalog.slice(0, 2), rates.slice(0, 2), { health: 0 });
  close(union(thin), pooled(.9, 2), 'a two-event pool saturates at its per-event cap');
  assert.deepEqual(boostLowStatRates(catalog, rates, { health: 4 }), rates);
});

test('sparse ordinary event pools can reach the target while major crises and rare events keep their own odds', () => {
  const catalog = [event('small'), event('major', ['health'], { severity: 'major' }), event('rare', ['health'], { rare: true }), event('locked')];
  const rates = [rate('small', .08), rate('major', .04), rate('rare', .0004), rate('locked', 0)];
  const boosted = boostLowStatRates(catalog, rates, { health: 2 });
  close(union(boosted.slice(0, 2)), lowStatEventTarget(2));
  assert.equal(boosted[1].chance, .04);
  assert.equal(boosted[2].chance, .0004);
  assert.equal(boosted[3].chance, 0);
  close(boostLowStatRates([catalog[0]], [rates[0]], { health: -2 })[0].chance, LOW_STAT_EVENT_CAP);
  assert.deepEqual(boostLowStatRates([catalog[1]], [rates[1]], { health: 0 }), [rates[1]], 'a sparse pool of major crises alone is not inflated');
});

test('retired events without consequences neither join a pool nor receive its boost, while supplemental coverage shares it', () => {
  const original = [event('original'), event('second')];
  const retired = event('retired', ['health'], { statChanges: {} });
  const supplemental = event('coverage', ['health'], { supplemental: true });
  const base = [rate('original', .02), rate('second', .01)];
  const without = boostLowStatRates(original, base, { health: 1 });
  const withRetired = boostLowStatRates([...original, retired], [...base, rate('retired', .05)], { health: 1 });
  assert.deepEqual(withRetired.slice(0, 2), without, 'a retired definition does not count toward the floor');
  assert.deepEqual(withRetired[2], rate('retired', .05), 'a retired definition keeps its own chance');
  const withExtra = boostLowStatRates([...original, supplemental], [...base, rate('coverage', .01)], { health: 1 });
  close(union(withExtra), lowStatEventTarget(1), 'supplemental coverage is part of the pool');
  assert.ok(withExtra[2].chance > .01 && union(withExtra) > union(without));
});

test('overlapping low stats use the largest shared-event boost and do not depend on stat or catalog order', () => {
  const catalog = [event('shared', ['health', 'social']), event('health'), event('social', ['social'])];
  const rates = [rate('shared', .03), rate('health', .06), rate('social', .01)];
  const healthOnly = boostLowStatRates(catalog, rates, { health: 2, social: 5 });
  const socialOnly = boostLowStatRates(catalog, rates, { health: 5, social: 0 });
  const both = boostLowStatRates(catalog, rates, { health: 2, social: 0 });
  close(both[0].chance, Math.max(healthOnly[0].chance, socialOnly[0].chance));
  assert.ok(union([both[0], both[1]]) >= lowStatEventTarget(2) - 1e-12);
  close(union([both[0], both[2]]), pooled(lowStatEventTarget(0), 2), 'a two-event social pool saturates at its cap');
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
    assert.ok(union(related) >= EVENT_BALANCE.relativePoolScale * lowStatEventTarget(2) - 1e-12, `age ${age}: ${union(related)}`);
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
