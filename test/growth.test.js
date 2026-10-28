import test from 'node:test';
import assert from 'node:assert/strict';
import { heightReference, growthHeightAt, advanceHeight, heightPercentile } from '../growth.js';

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
    const person = { age, height: M, growthSex: sex, maturityAge: 18 };
    assert.ok(Math.abs(heightPercentile(person) - 50) < .01);
    person.height = M * Math.pow(1 + L * S * 1.644854, 1 / L);
    assert.ok(Math.abs(heightPercentile(person) - 95) < .02);
    person.height = M * Math.pow(1 - L * S * 1.644854, 1 / L);
    assert.ok(Math.abs(heightPercentile(person) - 5) < .02);
  }
  assert.ok(heightPercentile({ age: 0, height: 50, growthSex: 'male', maturityAge: 17 }) > 50);
  assert.equal(heightPercentile({ age: 16, height: 165, growthSex: 'female', maturityAge: 16 }), null);
  assert.equal(heightPercentile({ age: 17, height: 180, growthSex: 'male', maturityAge: 18 }) !== null, true);
});

test('growth is rapid in infancy, steady through childhood, and includes a pubertal spurt', () => {
  const male = age => growthHeightAt(age, 176.85, 17, 'male', 49.8842);
  assert.ok(male(1) - male(0) > 24 && male(1) - male(0) < 27);
  assert.ok(male(2) - male(1) > 10 && male(2) - male(1) < 13);
  for (let age = 5; age <= 10; age++) assert.ok(male(age + 1) - male(age) > 4 && male(age + 1) - male(age) < 7);
  assert.ok(male(14) - male(13) > male(11) - male(10));
  assert.ok(male(17) - male(16) < 2.5);
});

test('individual birth and adult variation retains realistic childhood population spread', () => {
  let seed = 81293;
  const uniform = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return (seed + .5) / 4294967296; };
  const normal = () => Math.sqrt(-2 * Math.log(uniform())) * Math.cos(2 * Math.PI * uniform());
  for (const sex of ['male', 'female']) {
    const maturity = sex === 'female' ? 15 : 17;
    const birth = heightReference(0, sex), adult = heightReference(20, sex);
    const samples = Object.fromEntries([0, 1, 5, 10].map(age => [age, []]));
    for (let i = 0; i < 3000; i++) {
      const birthHeight = birth.median + normal() * birth.sd;
      const adultHeight = adult.median + normal() * adult.sd;
      for (const age of Object.keys(samples)) samples[age].push(growthHeightAt(+age, adultHeight, maturity, sex, birthHeight));
    }
    for (const [age, values] of Object.entries(samples)) {
      const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
      const sd = Math.sqrt(values.reduce((sum, value) => sum + (value - mean) ** 2, 0) / values.length);
      const reference = heightReference(+age, sex);
      assert.ok(Math.abs(mean - reference.median) < .5, `${sex} age ${age} median ${mean}`);
      assert.ok(sd / reference.sd > .9 && sd / reference.sd < 1.1, `${sex} age ${age} SD ${sd}`);
      assert.ok(new Set(values).size > 500, 'every person has their own curve');
    }
  }
});

test('all maturity timings reach fixed adult height without shrinking or endpoint overshoot', () => {
  for (const sex of ['male', 'female']) for (let maturity = 14; maturity <= 18; maturity++) for (const adult of [145, 165, 180, 205]) {
    let previous = 0;
    for (let age = 0; age <= 20; age++) {
      const height = growthHeightAt(age, adult, maturity, sex, 50);
      assert.ok(height >= previous);
      assert.ok(height <= adult);
      if (age >= maturity) assert.equal(height, adult);
      previous = height;
    }
  }
});

test('migration anchors preserve measurements and fit only the remaining growth', () => {
  const anchor = { age: 10, height: 145 };
  assert.equal(growthHeightAt(10, 180, 17, 'male', 50, anchor), 145);
  assert.ok(growthHeightAt(11, 180, 17, 'male', 50, anchor) > 145);
  assert.equal(growthHeightAt(17, 180, 17, 'male', 50, anchor), 180);
  assert.equal(growthHeightAt(18, 160, 17, 'male', 50, { age: 17, height: 165 }), 165);
});

test('annual variation uses supplied randomness, remains bounded, and fades at maturity', () => {
  const original = { age: 0, height: 50, adultHeight: 180, maturityAge: 17, birthHeight: 50, growthSex: 'male' };
  assert.ok(advanceHeight(original, -1) < advanceHeight(original, 0));
  assert.ok(advanceHeight(original, 1) > advanceHeight(original, 0));
  assert.deepEqual(original, { age: 0, height: 50, adultHeight: 180, maturityAge: 17, birthHeight: 50, growthSex: 'male' });
  for (const residual of [-3, -1, 0, 1, 3]) {
    const person = { ...original };
    while (person.age < 17) {
      const next = advanceHeight(person, residual);
      assert.ok(next >= person.height && next <= person.adultHeight);
      if (person.age < 16) assert.ok(next < person.adultHeight);
      person.height = next; person.age++;
    }
    assert.equal(person.height, person.adultHeight);
    assert.equal(advanceHeight(person, 3), person.height);
    assert.equal(heightPercentile(person), null);
  }
});
