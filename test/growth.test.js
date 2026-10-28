import test from 'node:test';
import assert from 'node:assert/strict';
import { heightReference, populationMedianAt, advanceGrowth, advanceHeight, heightPercentile } from '../growth.js';
const inches = cm => Math.round(cm / 2.54 * 100) / 100;
const centimeters = value => value * 2.54;

test('height reference matches WHO newborns and CDC exact birthdays', () => {
  assert.equal(heightReference(0, 'male').median, 49.8842);
  assert.equal(heightReference(0, 'female').median, 49.1477);
  assert.equal(heightReference(1, 'male').median, 75.7488);
  assert.ok(Math.abs(heightReference(10, 'male').median - 138.61884085) < .001);
  assert.ok(Math.abs(heightReference(20, 'female').median - 163.338251) < .001);
  for (const sex of ['male', 'female']) for (let age = 0; age <= 20; age++) {
    const ref = heightReference(age, sex);
    assert.ok(ref.sd > 1 && ref.sd < 9);
  }
});

test('height percentile compares measured height with same-age reference until maturity', () => {
  for (const sex of ['male', 'female']) for (const age of [0, 1, 2, 5, 10, 13]) {
    const { L, M, S } = heightReference(age, sex);
    const person = { age, height: inches(M), growthSex: sex, maturityAge: 18 };
    // Hundredth-inch storage introduces at most .0127 cm of rounding.
    assert.ok(Math.abs(heightPercentile(person) - 50) < .3);
    person.height = inches(M * Math.pow(1 + L * S * 1.644854, 1 / L));
    assert.ok(Math.abs(heightPercentile(person) - 95) < .1);
    person.height = inches(M * Math.pow(1 - L * S * 1.644854, 1 / L));
    assert.ok(Math.abs(heightPercentile(person) - 5) < .1);
  }
  assert.ok(heightPercentile({ age: 0, height: inches(50), growthSex: 'male', maturityAge: 17 }) > 50);
  assert.equal(heightPercentile({ age: 16, height: inches(165), growthSex: 'female', maturityAge: 16 }), null);
  assert.equal(heightPercentile({ age: 17, height: inches(180), growthSex: 'male', maturityAge: 18 }) !== null, true);
});

test('growth is rapid in infancy, steady through childhood, and includes a pubertal spurt', () => {
  const male = age => populationMedianAt(age, 17, 'male');
  assert.ok(male(1) - male(0) > 24 && male(1) - male(0) < 27);
  assert.ok(male(2) - male(1) > 10 && male(2) - male(1) < 13);
  for (let age = 5; age <= 10; age++) assert.ok(male(age + 1) - male(age) > 4 && male(age + 1) - male(age) < 7);
  assert.ok(male(14) - male(13) > male(11) - male(10));
  assert.ok(male(17) - male(16) < 2.5);
});

test('actual yearly growth keeps childhood medians and approximate population spread', () => {
  let seed = 81293;
  const uniform = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return (seed + .5) / 4294967296; };
  const normal = () => Math.max(-3, Math.min(3, Math.sqrt(-2 * Math.log(uniform())) * Math.cos(2 * Math.PI * uniform())));
  for (const growthSex of ['male', 'female']) {
    const birth = heightReference(0, growthSex);
    const samples = Object.fromEntries([0, 1, 5, 10].map(age => [age, []]));
    for (let i = 0; i < 3000; i++) {
      const person = { age: 0, height: inches(birth.median + normal() * birth.sd), growthSex,
        growthFactor: Math.max(.8, Math.min(1.2, 1 + normal() * .054)),
        maturityAge: Math.max(14, Math.min(18, Math.round((growthSex === 'female' ? 15 : 17) + normal() * .7))), stats: { health: 5 } };
      samples[0].push(centimeters(person.height));
      while (person.age < 10) {
        Object.assign(person, advanceGrowth(person, normal())); person.age++;
        if (samples[person.age]) samples[person.age].push(centimeters(person.height));
      }
    }
    for (const [age, values] of Object.entries(samples)) {
      values.sort((a, b) => a - b);
      const median = values[values.length / 2];
      const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
      const sd = Math.sqrt(values.reduce((sum, value) => sum + (value - mean) ** 2, 0) / values.length);
      const reference = heightReference(+age, growthSex);
      assert.ok(Math.abs(median - reference.median) < .5, `${growthSex} age ${age} median ${median}`);
      // This increment model approximates childhood spread rather than fitting
      // individual endpoints: age-1 male SD is ~19% high and age-10 SD ~15% low.
      const tolerance = +age === 0 ? .1 : .25;
      assert.ok(Math.abs(sd / reference.sd - 1) < tolerance, `${growthSex} age ${age} SD ${sd}`);
      assert.ok(new Set(values).size > 200);
    }
  }
});

test('annual gains never shrink height and stop at each maturity timing even at extreme draws', () => {
  for (const growthSex of ['male', 'female']) for (let maturityAge = 14; maturityAge <= 18; maturityAge++) {
    for (const growthFactor of [.8, 1.2]) for (const health of [1, 5]) for (const draw of [-3, 3]) {
      const person = { age: 0, height: inches(50), growthSex, maturityAge, growthFactor, stats: { health } };
      while (person.age <= 20) {
        const next = advanceGrowth(person, draw);
        assert.ok(next.height >= person.height);
        if (person.age >= maturityAge) assert.equal(next.height, person.height);
        Object.assign(person, next); person.age++;
      }
    }
  }
});

test('annual growth is an independent gain with no personal endpoint or catch-up', () => {
  const original = { age: 0, height: inches(50), adultHeight: inches(180), maturityAge: 17, birthHeight: inches(50), growthSex: 'male', growthFactor: 1, stats: { health: 5 } };
  const before = structuredClone(original);
  assert.ok(advanceHeight(original, -1) < advanceHeight(original, 0));
  assert.ok(advanceHeight(original, 1) > advanceHeight(original, 0));
  for (const adultHeight of [null, inches(145), inches(210), inches(999)]) {
    assert.deepEqual(advanceGrowth({ ...original, adultHeight, heightGrowthLoss: inches(20), growthAnchor: { age: 0, height: inches(60) } }, .5), advanceGrowth(original, .5));
  }
  const finalHeights = [];
  for (const residual of [-3, -1, 0, 1, 3]) {
    const person = structuredClone(original);
    while (person.age < 17) {
      const next = advanceGrowth(person, residual);
      assert.deepEqual(Object.keys(next), ['height']);
      assert.ok(next.height >= person.height);
      Object.assign(person, next); person.age++;
    }
    finalHeights.push(person.height);
    assert.equal(advanceHeight(person, 3), person.height);
    assert.equal(heightPercentile(person), null);
  }
  assert.ok(finalHeights.every((height, i) => i === 0 || height > finalHeights[i - 1]), 'different yearly paths yield different adult heights');
  assert.deepEqual(original, before);
});

test('health and inherited growth factor influence each year without removing random variation', () => {
  const person = { age: 0, height: inches(50), maturityAge: 17, growthSex: 'male', growthFactor: 1, stats: { health: 5 } };
  const before = structuredClone(person);
  for (const draw of [-3, -1, 0, 1, 3]) {
    const reference = advanceGrowth({ ...person, stats: undefined }, draw);
    assert.deepEqual(advanceGrowth(person, draw), reference, 'average health 5 has no growth penalty');
    assert.deepEqual(advanceGrowth({ ...person, stats: { health: 7 } }, draw), reference);
    assert.deepEqual(advanceGrowth({ ...person, stats: { health: 10 } }, draw), reference);
    const moderate = advanceGrowth({ ...person, stats: { health: 4 } }, draw);
    const poor = advanceGrowth({ ...person, stats: { health: 1 } }, draw);
    assert.ok(poor.height < moderate.height && moderate.height < reference.height);
    assert.ok(Math.abs((poor.height - person.height) / (reference.height - person.height) - .85) < .002);
    assert.equal(advanceHeight({ ...person, stats: { health: 1 } }, draw), poor.height);
    assert.ok(advanceHeight({ ...person, growthFactor: .9 }, draw) < advanceHeight({ ...person, growthFactor: 1.1 }, draw));
  }
  const ill = { ...person, stats: { health: 1 } };
  assert.ok(advanceGrowth(ill, -1).height < advanceGrowth(ill, 1).height);
  assert.deepEqual(person, before);
});

test('health affects the final growing year and attained height freezes at every maturity timing', () => {
  for (const growthSex of ['male', 'female']) for (let maturityAge = 14; maturityAge <= 18; maturityAge++) {
    const birthHeight = inches(heightReference(0, growthSex).median);
    const original = { age: 0, height: birthHeight, maturityAge, growthSex, growthFactor: 1, stats: { health: 5 } };
    const healthy = structuredClone(original), moderate = structuredClone(original), poor = structuredClone(original);
    moderate.stats.health = 4; poor.stats.health = 1;
    while (healthy.age < maturityAge) {
      const draw = [-1.2, .3, 1.1, -.7][healthy.age % 4];
      const gains = [];
      for (const person of [healthy, moderate, poor]) {
        const next = advanceGrowth(person, draw);
        assert.ok(next.height >= person.height, 'height never shrinks');
        gains.push(next.height - person.height);
        Object.assign(person, next); person.age++;
      }
      assert.ok(gains[0] > gains[1] && gains[1] > gains[2], "health changes this year's gain, including the last year");
      assert.ok(poor.height < moderate.height && moderate.height < healthy.height);
    }
    for (const person of [healthy, moderate, poor]) {
      assert.deepEqual(advanceGrowth(person, 3), { height: person.height });
      assert.equal(heightPercentile(person), null);
    }
    assert.ok(centimeters(healthy.height - poor.height) > 10);
  }
  assert.deepEqual(advanceGrowth({ age: 10, height: inches(130), maturityAge: 17, alive: false }, 3), { height: inches(130) });
});

test('recovered health and old targets never repay missed growth or alter saved height', () => {
  const healthy = { age: 0, height: inches(50), maturityAge: 17, growthSex: 'male', growthFactor: 1, stats: { health: 5 } };
  const recovered = structuredClone(healthy);
  recovered.stats.health = 1;
  let missedGrowth;
  while (healthy.age < 17) {
    if (healthy.age === 3) { recovered.stats.health = 5; missedGrowth = healthy.height - recovered.height; }
    const draw = [.7, -.4, .2][healthy.age % 3];
    Object.assign(healthy, advanceGrowth(healthy, draw)); healthy.age++;
    Object.assign(recovered, advanceGrowth(recovered, draw)); recovered.age++;
    if (missedGrowth !== undefined) assert.ok(Math.abs(healthy.height - recovered.height - missedGrowth) < .02);
  }
  const migrated = { age: 10, height: inches(145), adultHeight: inches(205), growthAnchor: { age: 10, height: inches(145) }, maturityAge: 17, growthSex: 'male', growthFactor: 1, stats: { health: 5 } };
  const short = { ...migrated, height: inches(120), adultHeight: inches(150) };
  assert.ok(Math.abs((advanceHeight(migrated) - migrated.height) - (advanceHeight(short) - short.height)) < .001);
  assert.equal(migrated.height, inches(145));
});

test('yearly stochastic growth produces approximately reference adult medians and dispersion', () => {
  let seed = 81293;
  const uniform = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return (seed + .5) / 4294967296; };
  const normal = () => Math.max(-3, Math.min(3, Math.sqrt(-2 * Math.log(uniform())) * Math.cos(2 * Math.PI * uniform())));
  for (const growthSex of ['male', 'female']) {
    const birth = heightReference(0, growthSex), adult = heightReference(20, growthSex);
    const heights = [];
    for (let i = 0; i < 3000; i++) {
      const person = { age: 0, height: inches(birth.median + normal() * birth.sd), growthSex,
        growthFactor: Math.max(.8, Math.min(1.2, 1 + normal() * .054)),
        maturityAge: Math.max(14, Math.min(18, Math.round((growthSex === 'female' ? 15 : 17) + normal() * .7))), stats: { health: 5 } };
      while (person.age < person.maturityAge) { Object.assign(person, advanceGrowth(person, normal())); person.age++; }
      heights.push(centimeters(person.height));
    }
    heights.sort((a, b) => a - b);
    const mean = heights.reduce((sum, height) => sum + height, 0) / heights.length;
    const sd = Math.sqrt(heights.reduce((sum, height) => sum + (height - mean) ** 2, 0) / heights.length);
    assert.ok(Math.abs(heights[heights.length / 2] - adult.median) < .5, `${growthSex} median ${heights[heights.length / 2]}`);
    assert.ok(sd / adult.sd > .9 && sd / adult.sd < 1.12, `${growthSex} SD ${sd}`);
    assert.ok(new Set(heights).size > 500);
  }
});
