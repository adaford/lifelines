import test from 'node:test';
import assert from 'node:assert/strict';
import { formatRating, formatStatNarrative, splitEventOutcome } from '../display.js';
import { desirability, meetingChances, prospectQuality, createProspects } from '../relationships.js';
import { mortalityRisk } from '../mortality.js';
import { eventChances } from '../events.js';

const stats = rating => Object.fromEntries(['health', 'stability', 'intelligence', 'strength', 'attractiveness', 'social', 'creativity'].map(key => [key, rating]));
const adult = rating => ({ age: 30, alive: true, stats: stats(rating), lifestyle: rating, focus: { work: 3, social: 3, family: 3, self: 3 }, effects: [], children: [], education: { status: 'workforce' } });

test('zero and fractional ratings remain formatted and grouped by affected person', () => {
  assert.equal(formatRating(0), '0.0');
  assert.equal(formatRating(.04), '0.0');
  const text = 'Your mental stability 1.2 -> 0; Alex Reed: Health 0.1 -> 0; Alex Reed: Relationship 0 -> 0.2.';
  assert.deepEqual(splitEventOutcome(text).map(line => formatStatNarrative(line)), [
    'Your mental stability 1.2 -> 0.0',
    'Alex Reed: Health 0.1 -> 0.0; Alex Reed: Relationship 0.0 -> 0.2.',
  ]);
  assert.equal(formatStatNarrative('Dr. Health 0: Health 0 -> 0.23.', { guardian: { name: 'Dr. Health 0' } }), 'Dr. Health 0: Health 0.0 -> 0.2.', 'guardian names take precedence over numeric formatting');
});

test('zero ratings produce valid encounter opportunities and bounded prospects', () => {
  const state = adult(0);
  assert.equal(desirability(state), 0);
  assert.equal(prospectQuality(state), 0);
  const chance = meetingChances(state);
  assert.equal(chance.slots, 1);
  assert.ok(chance.chance > 0 && chance.chance <= 1);
  let id = 0;
  const helpers = { random: () => .001, integer: low => low, uid: prefix => `${prefix}-${++id}`, personName: () => 'Alex Reed' };
  const prospects = createProspects(state, helpers);
  assert.equal(prospects.length, 1);
  assert.ok(Object.values(prospects[0].stats).every(value => Number.isFinite(value) && value >= 0 && value <= 10));
  assert.ok(prospects[0].lifestyle >= 0 && prospects[0].lifestyle <= 10);
});

test('zero wellbeing extends health risks while keeping event odds finite and ordered', () => {
  assert.ok(mortalityRisk(adult(0)).disease > mortalityRisk(adult(1)).disease);
  const zero = adult(0), low = adult(1);
  const before = structuredClone(zero);
  const zeroOdds = eventChances(zero, zero.stats);
  const lowOdds = eventChances(low, low.stats);
  assert.ok(zeroOdds.every(event => Number.isFinite(event.chance) && event.chance >= 0 && event.chance <= .18));
  assert.ok(zeroOdds.find(event => event.id === 'financial_scam').chance >= lowOdds.find(event => event.id === 'financial_scam').chance);
  assert.deepEqual(zero, before);
});
