import test from 'node:test';
import assert from 'node:assert/strict';
import { datingPotential, datingHeightRating, meetingChances, createProspects, prospectQuality } from '../relationships.js';
import { heightReference } from '../growth.js';

const keys = ['intelligence', 'strength', 'attractiveness', 'social', 'creativity', 'health', 'stability'];
const reference = heightReference(20, 'male');
const actor = (value = 5, heightZ = 0) => ({ age: 28, alive: true,
  stats: Object.fromEntries(keys.map(key => [key, value])), lifestyle: value,
  height: (reference.median + heightZ * reference.sd) / 2.54, growthSex: 'male',
  gender: 'male', attractedTo: ['female'], focus: { social: 2 }, partner: null });
const close = (actual, expected) => assert.ok(Math.abs(actual - expected) < 1e-10, `${actual} versus ${expected}`);
function helpers(seed) {
  let value = seed, nextId = 0;
  const random = () => { value = (Math.imul(value, 1664525) + 1013904223) >>> 0; return value / 2 ** 32; };
  return { random, integer: (low, high) => low + Math.floor(random() * (high - low + 1)),
    uid: () => `person-${++nextId}`, personName: () => 'Alex Reed' };
}

test('height, appearance and Lifestyle have equal dating weight; every other personal stat has one fifth', () => {
  const state = actor(), base = datingPotential(state), before = structuredClone(state);
  close(base, 5);
  const attractive = structuredClone(state); attractive.stats.attractiveness++;
  const wealthy = structuredClone(state); wealthy.lifestyle++;
  const primaryGain = datingPotential(attractive) - base;
  close(datingPotential(wealthy) - base, primaryGain);
  const taller = actor(5, 1);
  close((datingPotential(taller) - base) / (datingHeightRating(taller) - 5), primaryGain);
  for (const key of keys.filter(key => key !== 'attractiveness')) {
    const changed = structuredClone(state); changed.stats[key]++;
    close(datingPotential(changed) - base, primaryGain / 5);
    assert.ok(meetingChances(changed).expected > meetingChances(state).expected, key);
  }
  close(datingPotential({ ...state, aptitudes: Object.fromEntries(keys.map(key => [key, 3])) }), base);
  assert.deepEqual(state, before, 'the derived score never adds a saved field');
});

test('adult height uses its own growth reference and has a bounded, monotone contribution', () => {
  for (const growthSex of ['male', 'female']) {
    const median = heightReference(20, growthSex).median;
    close(datingHeightRating({ height: median / 2.54, growthSex }), 5);
    assert.ok(datingHeightRating({ height: (median + 10) / 2.54, growthSex }) > 5);
    assert.ok(datingHeightRating({ height: (median - 10) / 2.54, growthSex }) < 5);
  }
  close(datingPotential(actor(0, -5)), 0);
  close(datingPotential(actor(10, 5)), 10);
  close(datingPotential({ ...actor(), stats: Object.fromEntries(keys.map(key => [key, 100])), lifestyle: 100, height: 200 }), 10);
  const older = { ...actor(), age: 80 };
  close(datingPotential(older), datingPotential(actor()));
});

test('higher potential produces more and stronger yearly options across independent seeds while retaining chance', t => {
  const low = actor(2, -1.5), high = actor(8, 1.5), counts = [0, 0], qualities = [[], []];
  const realizedCounts = [new Set(), new Set()];
  for (let seed = 1; seed <= 3000; seed++) for (const [index, state] of [low, high].entries()) {
    const before = structuredClone(state);
    const prospects = createProspects(state, helpers(seed * 7919));
    counts[index] += prospects.length;
    realizedCounts[index].add(prospects.length);
    qualities[index].push(...prospects.map(prospectQuality));
    assert.deepEqual(state, before);
    assert.ok(prospects.every(person => person.gender === 'female' && person.age >= 18));
    assert.ok(prospects.length <= 5);
  }
  const means = qualities.map(values => values.reduce((sum, value) => sum + value, 0) / values.length);
  assert.ok(counts[1] > counts[0] * 3);
  assert.ok(means[1] > means[0] + 2);
  assert.ok(realizedCounts.every(values => values.size > 1), 'potential never fixes an annual count');
  assert.ok(Math.min(...qualities[1]) < Math.max(...qualities[0]), 'quality distributions overlap');
  t.diagnostic(JSON.stringify({ yearsPerGroup: 3000, prospects: counts, averageQuality: means }));
});

test('dating potential does not bypass relationship, mortality or retirement gates', () => {
  for (const change of [{ age: 17 }, { age: 85 }, { alive: false }, { partner: { alive: true } }, { ended: true }, { needsSuccession: true }]) {
    const state = { ...actor(10, 5), ...change };
    assert.equal(meetingChances(state).expected, 0);
    assert.deepEqual(createProspects(state, helpers(1)), []);
  }
});
