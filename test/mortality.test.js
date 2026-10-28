import test from 'node:test';
import assert from 'node:assert/strict';
import { baselineAnnualMortality, mortalityRisk, rollMortality } from '../mortality.js';

const person = (age, health = 5, stability = 5) => ({ age, alive: true, stats: { health, stability } });
const close = (actual, expected, tolerance = 1e-12) => assert.ok(Math.abs(actual - expected) < tolerance, `${actual} should equal ${expected}`);
function seededRandom(seed) {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6D2B79F5) >>> 0;
    let value = Math.imul(state ^ state >>> 15, state | 1);
    value ^= value + Math.imul(value ^ value >>> 7, value | 61);
    return ((value ^ value >>> 14) >>> 0) / 4294967296;
  };
}

test('reference health reproduces observed annual rates across the lifespan', () => {
  const expected = [[0,.005570], [1,.0004355], [10,.000113], [30,.0014815], [50,.004078], [65,.0133215], [85,.082216], [100,.348124], [119,.926604]];
  for (const [age, rate] of expected) {
    close(baselineAnnualMortality(age), rate);
    close(mortalityRisk(person(age)).total, rate);
    close(mortalityRisk({ age, alive: true }).total, rate, 1e-12);
  }
  assert.ok(mortalityRisk(person(0)).total > mortalityRisk(person(1)).total);
  assert.ok(mortalityRisk(person(1)).total > mortalityRisk(person(10)).total);
  assert.ok(mortalityRisk(person(85)).total > mortalityRisk(person(65)).total);
});

test('health changes disease risk and stability has only a modest adult accident effect', () => {
  for (const age of [0, 10, 30, 65, 85, 100]) {
    const healthy = mortalityRisk(person(age, 10));
    const unwell = mortalityRisk(person(age, 1));
    assert.ok(unwell.disease > healthy.disease);
    assert.ok(unwell.total > healthy.total);
    assert.ok(healthy.total > 0);
  }
  const calm = mortalityRisk(person(30, 5, 10));
  const stressed = mortalityRisk(person(30, 5, 1));
  assert.ok(stressed.accident > calm.accident);
  assert.ok(stressed.accident / calm.accident < 1.4);
  assert.deepEqual(mortalityRisk(person(0, 5, 1)), mortalityRisk(person(0, 5, 10)));
  assert.deepEqual(mortalityRisk(person(12, 5, 1)), mortalityRisk(person(12, 5, 10)));
});

test('all risks are bounded and causes partition rather than duplicate annual mortality', () => {
  for (let age = 0; age <= 130; age++) {
    for (const health of [1, 5, 10]) {
      const risk = mortalityRisk(person(age, health, 1));
      assert.ok(risk.total > 0 && risk.total < 1);
      assert.ok(risk.disease > 0 && risk.accident > 0);
      close(risk.disease + risk.accident, risk.total);
    }
  }
  assert.equal(rollMortality(person(85), () => .99), null);
  assert.equal(rollMortality(person(120), () => .99999), null);
});

test('one draw yields one cause, dead people consume no randomness, and lookup is read-only', () => {
  const actor = person(85);
  const before = structuredClone(actor);
  const risk = mortalityRisk(actor);
  let draws = 0;
  assert.deepEqual(rollMortality(actor, () => { draws++; return 0; }), { cause: 'disease' });
  assert.deepEqual(rollMortality(actor, () => { draws++; return risk.disease + risk.accident / 2; }), { cause: 'accident' });
  assert.equal(rollMortality(actor, () => { draws++; return risk.total; }), null);
  assert.equal(draws, 3);
  assert.deepEqual(actor, before);
  assert.equal(rollMortality({ ...actor, alive: false }, () => { throw Error('must not roll'); }), null);
  assert.deepEqual(mortalityRisk({ ...actor, alive: false }), { total: 0, disease: 0, accident: 0, baseline: 0 });
});

test('seeded populations produce realistic annual death frequencies, with no event cap bias', () => {
  const random = seededRandom(20231028);
  const count = 200000;
  for (const age of [0, 10, 30, 65, 85]) {
    const actor = person(age);
    const risk = mortalityRisk(actor);
    let deaths = 0;
    let accidents = 0;
    for (let i = 0; i < count; i++) {
      const death = rollMortality(actor, random);
      if (death) deaths++;
      if (death?.cause === 'accident') accidents++;
    }
    // Five binomial standard deviations tolerates sampling noise but catches
    // percent/fraction errors and accidentally rolling each cause as all-cause.
    const tolerance = 5 * Math.sqrt(count * risk.total * (1 - risk.total)) + 2;
    assert.ok(Math.abs(deaths - count * risk.total) < tolerance, `age ${age}: ${deaths} deaths`);
    const causeTolerance = 5 * Math.sqrt(count * risk.accident * (1 - risk.accident)) + 2;
    assert.ok(Math.abs(accidents - count * risk.accident) < causeTolerance, `age ${age}: ${accidents} accidents`);
  }
});
