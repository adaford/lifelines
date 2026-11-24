import test from 'node:test';
import assert from 'node:assert/strict';
import { statEventFactor, statPoolTarget, balanceEventOdds, eventClass, eventValence } from '../event-rates.js';
import { lowHealthDeathChance, mortalityRisk } from '../mortality.js';
import { EVENT_BALANCE as B } from '../balance.js';
import { EVENTS, createGame, advanceYear, eventOdds, caregivers, validateSave, migrateSave } from '../engine.js';
import { changedRating } from '../rating-changes.js';

const close = (actual, expected, message = '') => assert.ok(Math.abs(actual - expected) < 1e-12, `${message}: ${actual} versus ${expected}`);
const calm = { mortalityRandom: () => 1, growthRandom: () => 0, parentCareerRandom: () => 1, fameRandom: () => 1 };
const copy = value => structuredClone(value);

test('the stat factor is quiet at neutral, strongest at its own extreme and zero at the opposite one', () => {
  close(statEventFactor(5, 'low'), B.factorAtNeutral); close(statEventFactor(5, 'high'), B.factorAtNeutral);
  close(statEventFactor(0, 'low'), B.factorAtExtreme); close(statEventFactor(10, 'high'), B.factorAtExtreme);
  close(statEventFactor(10, 'low'), 0); close(statEventFactor(0, 'high'), 0);
  assert.deepEqual([B.factorAtNeutral, B.factorAtExtreme], [.4, 4]);
  for (let value = 0; value < 10; value += .25) {
    assert.ok(statEventFactor(value, 'low') > statEventFactor(value + .25, 'low'), `low falls at ${value}`);
    assert.ok(statEventFactor(value, 'high') < statEventFactor(value + .25, 'high'), `high rises at ${value}`);
    close(statEventFactor(value, 'low'), statEventFactor(10 - value, 'high'), 'directions mirror each other');
  }
  assert.ok([-3, 13].every(value => [0, 4].includes(statEventFactor(value, 'low'))), 'ratings past the scale clamp to its ends');
});

test('rating pools start one point from neutral and reach their maximum at the extreme', () => {
  for (const value of [4, 4.5, 5, 5.5, 6]) for (const direction of ['low', 'high']) assert.equal(statPoolTarget(value, direction), 0, `${value} ${direction}`);
  assert.ok(statPoolTarget(3.99, 'low') > 0 && statPoolTarget(6.01, 'high') > 0);
  close(statPoolTarget(0, 'low'), B.lowPoolMax); close(statPoolTarget(10, 'high'), B.highPoolMax);
  assert.deepEqual([B.lowPoolMax, B.highPoolMax], [.9, .6]);
  assert.equal(statPoolTarget(10, 'low'), 0); assert.equal(statPoolTarget(0, 'high'), 0);
  for (let value = 0; value < 4; value += .5) assert.ok(statPoolTarget(value, 'low') > statPoolTarget(value + .5, 'low'));
  for (const value of [undefined, NaN, '2']) assert.equal(statPoolTarget(value, 'low'), 0);
});

const synthetic = (id, extra = {}) => ({ id, name: id, ...extra });
const statEvent = (id, extra = {}) => synthetic(id, { statFactors: [['health', 'low']], statChanges: { social: -.2 }, ...extra });
const good = id => synthetic(id, { statChanges: { social: .2 } }), bad = id => synthetic(id, { statChanges: { social: -.2 } });
const total = (rows, events, test) => rows.filter((row, index) => test(events[index])).reduce((sum, row) => sum + row.chance, 0);
function balance(entries, recent) {
  const events = entries.map(([event]) => event), rolls = entries.map(([event, chance]) => ({ id: event.id, chance }));
  const frozen = copy(rolls);
  const result = balanceEventOdds(rolls, roll => events.find(event => event.id === (roll.eventId || roll.id)), recent);
  assert.deepEqual(rolls, frozen, 'balancing returns copies');
  return { events, rolls, result };
}

test('an event that happened last year is less likely to repeat, including relatives\' keyed rolls', () => {
  assert.equal(B.repeatFactor, .15);
  const { rolls, result } = balance([[statEvent('stat_a'), .2], [statEvent('stat_b'), .1], [statEvent('household_x', { subjectType: 'parent' }), .08]], ['stat_a', 'household_x:mom']);
  close(result[0].chance, rolls[0].chance * B.repeatFactor);
  assert.equal(result[1].chance, rolls[1].chance);
  close(result[2].chance, rolls[2].chance * B.repeatFactor);
  const state = createGame({ seed: 4401 }), odds = eventOdds(state);
  const roll = odds.find(roll => roll.chance > 0 && eventClass(EVENTS.find(event => event.id === roll.id)) === 'stat');
  const repeated = eventOdds({ ...state, lastYearEvents: [roll.id] }).find(entry => entry.id === roll.id);
  close(repeated.chance, roll.chance * B.repeatFactor, 'eventOdds applies the saved lastYearEvents');
});

test('random events split evenly between good and bad and stay below a third of stat-driven volume', () => {
  const plenty = balance([[statEvent('s1'), .2], [statEvent('s2'), .2], [good('g1'), .1], [good('g2'), .05], [bad('b1'), .02], [synthetic('fame', { requiresFame: true, statChanges: { social: .1 } }), .07]]);
  const positive = total(plenty.result, plenty.events, event => eventClass(event) === 'random' && eventValence(event) > 0);
  const negative = total(plenty.result, plenty.events, event => eventClass(event) === 'random' && eventValence(event) < 0);
  close(positive, negative, 'good and bad random volume match');
  close(negative, .02, 'the scarcer side is kept');
  assert.equal(plenty.result.at(-1).chance, .07, 'fame odds follow fame rules');
  const sparse = balance([[statEvent('s1'), .03], [good('g1'), .1], [bad('b1'), .1], [synthetic('choice', { choices: [{ id: 'a', statChanges: { social: .2 } }, { id: 'b', statChanges: { creativity: .2 } }] }), .05]]);
  const stat = total(sparse.result, sparse.events, event => eventClass(event) === 'stat');
  const random = total(sparse.result, sparse.events, event => eventClass(event) === 'random');
  assert.equal(stat, .03);
  close(random, stat / B.statToRandomRatio, 'random volume is cut to one per three stat events');
  close(sparse.result[1].chance, sparse.result[2].chance);
  for (const { result, events } of [plenty, sparse]) {
    assert.ok(total(result, events, event => eventClass(event) === 'random') <= total(result, events, event => eventClass(event) === 'stat') / B.statToRandomRatio + 1e-12);
  }
  const oneSided = balance([[statEvent('s1'), .9], [good('g1'), .1]]);
  close(oneSided.result[1].chance, .1 * B.oneSidedRandomScale, 'with no bad random events the good ones are scaled down');
  const state = createGame({ seed: 4402 }), odds = eventOdds(state);
  const sum = test => odds.filter(roll => test(EVENTS.find(event => event.id === (roll.eventId || roll.id)))).reduce((value, roll) => value + roll.chance, 0);
  assert.ok(sum(event => eventClass(event) === 'random') <= sum(event => eventClass(event) === 'stat') / B.statToRandomRatio + 1e-12, 'a real year keeps the ratio');
});

test('very poor Health adds its own yearly death chance at every age', () => {
  for (const [health, chance] of [[0, .2], [1, .1], [2, .05], [2.5, 0], [3, 0], [4, 0], [7, 0], [10, 0]]) close(lowHealthDeathChance(health), chance, `health ${health}`);
  assert.ok(lowHealthDeathChance(2.25) > 0 && lowHealthDeathChance(2.25) < .05, 'the extra risk fades out between 2 and 2.5');
  assert.equal(lowHealthDeathChance(-2), .2); assert.equal(lowHealthDeathChance(NaN), 0);
  for (const age of [0, 8, 30, 70]) for (const health of [0, 1, 2, 3, 4]) {
    const risk = mortalityRisk({ age, alive: true, stats: { health, stability: 5 } });
    assert.ok(risk.total >= lowHealthDeathChance(health) - 1e-12, `age ${age}, health ${health}`);
    assert.ok(risk.disease >= lowHealthDeathChance(health) - 1e-12, 'the frailty risk is a disease risk');
    close(risk.disease + risk.accident, risk.total);
  }
});

test('a household event changes both caregivers and carries no person prefix', () => {
  // teething is a personal household event; household_parent_sleepless is the family version.
  const ids = ['teething', 'household_parent_sleepless'];
  const original = createGame({ seed: 4403 });
  original.lifestyle = .5;
  for (const parent of original.parents) parent.lifestyle = .5;
  assert.equal(caregivers(original).length, 2);
  const found = new Map();
  for (let attempt = 1; attempt <= 400 && found.size < ids.length; attempt++) {
    const state = copy(original);
    state.rng = Math.imul(attempt, 2654435761) >>> 0;
    assert.equal(advanceYear(state, calm).ok, true);
    for (const id of ids) if (!found.has(id) && state.lastYearEvents.some(key => key.split(':')[0] === id)) found.set(id, state);
  }
  assert.deepEqual([...found.keys()].sort(), [...ids].sort(), 'both low-Lifestyle household events occur');
  for (const [id, state] of found) {
    const event = EVENTS.find(event => event.id === id);
    assert.equal(state.lastYearEvents.filter(key => key.split(':')[0] === id).length, 1, 'the household rolls once, not once per caregiver');
    const entry = state.history.find(entry => entry.title === event.name);
    assert.ok(entry, 'the title names no single caregiver');
    assert.ok(!state.history.some(entry => entry.title.endsWith(`: ${event.name}`)));
    for (const parent of caregivers(state)) for (const [key, amount] of Object.entries(event.subjectChanges)) {
      const label = { health: 'Health', stability: 'Mental stability' }[key];
      const values = entry.text.match(new RegExp(`${parent.name}: ${label} (\\d+(?:\\.\\d+)?) → (\\d+(?:\\.\\d+)?)`));
      assert.ok(values, `${parent.name} ${key} changes: ${entry.text}`);
      assert.notEqual(values[1], values[2]);
      assert.equal(Number(values[2]), changedRating(Number(values[1]), amount));
    }
    assert.equal(validateSave(state), true);
    assert.deepEqual(migrateSave(copy(state)), state);
  }
});
