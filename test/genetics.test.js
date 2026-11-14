import test from 'node:test';
import assert from 'node:assert/strict';
import { GENETICS_BALANCE, inheritRatings, inheritAffinities, inheritedGrowthFactor } from '../genetics.js';
import { heightReference } from '../growth.js';

const KEYS = ['intelligence', 'strength', 'attractiveness', 'social', 'creativity', 'health', 'stability'];
const values = value => Object.fromEntries(KEYS.map(key => [key, value]));
function parent(rating = 5, aptitude = 0, tendency = 1, growthSex = 'male') {
  const adult = heightReference(20, growthSex).median, birth = heightReference(0, growthSex).median;
  const height = (adult + (tendency - 1) * (adult - birth)) / 2.54;
  return { age: 30, growthSex, maturityAge: 18, height, adultHeight: height, growthFactor: tendency,
    stats: values(rating), aptitudes: values(aptitude) };
}
function seededNormal(seed) {
  let rng = seed >>> 0;
  const uniform = () => { rng = (Math.imul(rng, 1664525) + 1013904223) >>> 0; return (rng + .5) / 4294967296; };
  return () => Math.max(-3, Math.min(3, Math.sqrt(-2 * Math.log(uniform())) * Math.cos(2 * Math.PI * uniform())));
}
const average = list => list.reduce((sum, value) => sum + value, 0) / list.length;
const variance = list => { const mean = average(list); return average(list.map(value => (value - mean) ** 2)); };

test('zero variation inherits both parents across every stat and affinity without changing the draw schedule', () => {
  const first = parent(2, -2, .92), second = parent(8, 3, 1.08, 'female');
  KEYS.forEach((key, index) => { first.stats[key] = index; second.stats[key] = 10 - index; });
  const saved = structuredClone([first, second]); let draws = 0;
  const normal = () => { draws++; return 2.5; };
  assert.deepEqual(inheritRatings([first, second], normal, 0), values(5));
  assert.deepEqual(inheritAffinities([first, second], normal, 0), values(1));
  assert.equal(inheritedGrowthFactor([first, second], normal, 0), 1);
  assert.equal(draws, 15);
  assert.deepEqual([first, second], saved);
  assert.deepEqual(inheritRatings([parent(2), parent(8)], () => 0), values(5));
  assert.deepEqual(inheritAffinities([parent(5, -3), parent(5, 2)], () => 0), values(-1));
});

test('the shared randomness setting scales ratings, affinities and growth while explicit overrides remain available', () => {
  const parents = [parent(), parent(5, 0, 1, 'female')], previous = GENETICS_BALANCE.randomness;
  try {
    GENETICS_BALANCE.randomness = 0;
    assert.deepEqual(inheritRatings(parents, () => .5), values(5));
    assert.deepEqual(inheritAffinities(parents, () => .5), values(0));
    assert.equal(inheritedGrowthFactor(parents, () => .5), 1);
    GENETICS_BALANCE.randomness = 1;
    assert.deepEqual(inheritRatings(parents, () => .5), values(6.25));
    assert.deepEqual(inheritAffinities(parents, () => .5), values(1));
    assert.equal(inheritedGrowthFactor(parents, () => .5), 1.0235);
    GENETICS_BALANCE.randomness = 2;
    assert.deepEqual(inheritRatings(parents, () => .5), values(7.5));
    assert.deepEqual(inheritAffinities(parents, () => .5), values(2));
    assert.equal(inheritedGrowthFactor(parents, () => .5), 1.047);
    assert.deepEqual(inheritRatings(parents, () => .5, 1), values(6.25));
  } finally { GENETICS_BALANCE.randomness = previous; }
});

test('inheritance reads parental base ratings rather than temporary effective abilities or household bonuses', () => {
  const first = parent(3, -1), second = parent(7, 1, 1, 'female');
  first.effects = [{ years: 3, modifiers: values(10) }];
  first.effectiveStats = values(10); first.lifestyle = 10;
  second.effects = [{ years: 3, modifiers: values(-10) }];
  second.effectiveStats = values(0); second.lifestyle = 0;
  const before = structuredClone([first, second]);
  assert.deepEqual(inheritRatings([first, second], () => 0), values(5));
  assert.deepEqual(inheritAffinities([first, second], () => 0), values(0));
  assert.deepEqual([first, second], before);
});

test('affinity rounding treats positive and negative residuals symmetrically, including exact half steps', () => {
  for (const center of [0, .5, 1, 2.5, 3]) {
    for (const draw of [0, .3125, .5, 1, 2, 3]) {
      const positive = inheritAffinities([parent(5, center)], () => draw);
      const negative = inheritAffinities([parent(5, -center)], () => -draw);
      for (const key of KEYS) {
        assert.equal(negative[key], -positive[key] || 0);
        assert.ok(Number.isInteger(positive[key]) && positive[key] >= -3 && positive[key] <= 3);
      }
    }
  }
  assert.equal(inheritAffinities([parent()], () => .3125).health, 1);
  assert.equal(inheritAffinities([parent()], () => -.3125).health, -1);
});

test('attained parental heights override stale tendencies using each growth reference without inventing endpoints', () => {
  const father = parent(5, 0, 1.08, 'male'), mother = parent(5, 0, 1.08, 'female');
  father.growthFactor = .8; mother.growthFactor = .9;
  father.adultHeight = 40; mother.adultHeight = 40;
  const before = structuredClone([father, mother]);
  assert.equal(inheritedGrowthFactor([father, mother], () => 0), 1.08);
  assert.deepEqual([father, mother], before);
  assert.equal(inheritedGrowthFactor([parent(5, 0, 1, 'male'), parent(5, 0, 1, 'female')], () => 0), 1);
  const unavailable = { age: 30, growthSex: 'female', growthFactor: .94, height: null, adultHeight: null };
  assert.equal(inheritedGrowthFactor([unavailable], () => 0), .94);
  const stillGrowing = { ...unavailable, age: 10, maturityAge: 17, height: 50, adultHeight: 80 };
  assert.equal(inheritedGrowthFactor([stillGrowing], () => 0), .94, 'an old childhood endpoint is not an attained adult height');
  const recordedAdult = parent(5, 0, 1.05, 'female'); delete recordedAdult.height;
  assert.equal(inheritedGrowthFactor([recordedAdult], () => 0), 1.05);
  const unknownReference = { ...parent(5, 0, 1, 'female'), growthFactor: 1.04 }; delete unknownReference.growthSex;
  assert.equal(inheritedGrowthFactor([unknownReference], () => 0), 1.04, 'missing growth reference does not infer sex from height or gender');
  assert.equal(inheritedGrowthFactor([], () => 0), 1);
});

test('bounded inheritance never uses global randomness and stays valid with extreme inputs', () => {
  const previous = Math.random;
  try {
    Math.random = () => { throw new Error('unseeded inheritance'); };
    for (const value of [-100, 100, NaN, Infinity]) {
      const parents = [parent(value, value, 1), parent(value, value, 1, 'female')];
      for (const scale of [0, .5, 1, 10, 100]) {
        const ratings = inheritRatings(parents, () => value, scale);
        const affinities = inheritAffinities(parents, () => value, scale);
        const growth = inheritedGrowthFactor(parents, () => value, scale);
        assert.deepEqual(Object.keys(ratings), KEYS);
        assert.deepEqual(Object.keys(affinities), KEYS);
        assert.ok(Object.values(ratings).every(rating => Number.isFinite(rating) && rating >= 0 && rating <= 10));
        assert.ok(Object.values(affinities).every(affinity => Number.isInteger(affinity) && affinity >= -3 && affinity <= 3));
        assert.ok(Number.isFinite(growth) && growth >= .8 && growth <= 1.2);
      }
    }
  } finally { Math.random = previous; }
});

test('seeded offspring cohorts preserve parental ordering with low-from-high and high-from-low outliers', t => {
  const groups = {
    low: [parent(1, -3, .92), parent(1, -3, .92, 'female')],
    mixed: [parent(1, -3, .92), parent(9, 3, 1.08, 'female')],
    high: [parent(9, 3, 1.08), parent(9, 3, 1.08, 'female')],
  };
  const cohorts = {};
  for (const [group, parents] of Object.entries(groups)) {
    const normal = seededNormal(872193), ratings = Object.fromEntries(KEYS.map(key => [key, []])), affinities = Object.fromEntries(KEYS.map(key => [key, []])), growth = [];
    for (let child = 0; child < 6000; child++) {
      const inherited = inheritRatings(parents, normal), aptitude = inheritAffinities(parents, normal);
      for (const key of KEYS) { ratings[key].push(inherited[key]); affinities[key].push(aptitude[key]); }
      growth.push(inheritedGrowthFactor(parents, normal));
    }
    cohorts[group] = { ratings, affinities, growth };
  }
  for (const key of KEYS) {
    const means = ['low', 'mixed', 'high'].map(group => average(cohorts[group].ratings[key]));
    assert.ok(means[0] < means[1] - 2 && means[1] < means[2] - 2, `${key}: ${means}`);
    assert.ok(cohorts.high.ratings[key].some(value => value < 3), `${key}: low child from high parents`);
    assert.ok(cohorts.low.ratings[key].some(value => value > 7), `${key}: high child from low parents`);
    assert.ok(cohorts.high.affinities[key].some(value => value < 0), `${key}: negative affinity from positive parents`);
    assert.ok(cohorts.low.affinities[key].some(value => value > 0), `${key}: positive affinity from negative parents`);
    assert.ok(average(cohorts.low.affinities[key]) < -1.5 && average(cohorts.high.affinities[key]) > 1.5);
    assert.ok(Math.abs(average(cohorts.mixed.affinities[key])) < .08);
  }
  assert.ok(average(cohorts.low.growth) < .95 && average(cohorts.high.growth) > 1.05);
  assert.ok(cohorts.high.growth.some(value => value < 1) && cohorts.low.growth.some(value => value > 1));
  t.diagnostic(JSON.stringify(Object.fromEntries(Object.keys(groups).map(group => [group, {
    ratingMean: average(cohorts[group].ratings.intelligence), affinityMean: average(cohorts[group].affinities.intelligence), growthMean: average(cohorts[group].growth),
  }]))));
});

test('greater configured randomness broadens an otherwise identical seeded family distribution', () => {
  const parents = [parent(), parent(5, 0, 1, 'female')], spreads = [];
  for (const scale of [0, .25, 1, 2]) {
    const normal = seededNormal(40127), ratings = [], affinities = [], growth = [];
    for (let child = 0; child < 4000; child++) {
      ratings.push(inheritRatings(parents, normal, scale).health);
      affinities.push(inheritAffinities(parents, normal, scale).stability);
      growth.push(inheritedGrowthFactor(parents, normal, scale));
    }
    spreads.push([variance(ratings), variance(affinities), variance(growth)]);
  }
  assert.deepEqual(spreads[0], [0, 0, 0]);
  for (let index = 1; index < spreads.length; index++) for (let measure = 0; measure < 3; measure++) {
    assert.ok(spreads[index][measure] > spreads[index - 1][measure], `${index}: ${measure}`);
  }
});
