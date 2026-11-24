import test from 'node:test';
import assert from 'node:assert/strict';
import { EVENTS } from '../engine.js';
import { eventHasConsequence } from '../event-rates.js';

// Every option of a live choice event must offer something the other lacks:
// no option is at least as good on every effect and better on one (record 042).
const effects = choice => {
  const result = {};
  const add = (key, amount) => { if (amount) result[key] = (result[key] || 0) + amount; };
  for (const [field, prefix] of [['statChanges', 'you'], ['playerChanges', 'you'], ['modifiers', 'you'], ['subjectChanges', 'them'], ['aptitudeChanges', 'affinity']]) {
    for (const [key, amount] of Object.entries(choice[field] || {})) add(`${prefix}:${key}`, amount);
  }
  add('relationship', choice.relationship);
  add('household', choice.years > 0 ? choice.householdLifestyle : 0);
  add('fameSupport', choice.fameSupport);
  if (choice.fameAction === 'start') add('fame', 1);
  for (const field of ['focusCapacity', 'focusMinimums']) for (const stage of Object.values(choice[field] || {})) {
    for (const [key, amount] of Object.entries(stage)) add(`${field}:${key}`, field === 'focusMinimums' ? -amount : amount);
  }
  add('focusPoints', choice.focusPoints);
  return result;
};
const dominates = (a, b) => {
  const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
  return [...keys].every(key => (a[key] || 0) >= (b[key] || 0)) && [...keys].some(key => (a[key] || 0) > (b[key] || 0));
};

test('no live choice event has an option that dominates another', () => {
  const offenders = [];
  for (const event of EVENTS.filter(event => event.choices?.length && eventHasConsequence(event))) {
    const options = event.choices.map(effects);
    for (const [i, a] of options.entries()) for (const [j, b] of options.entries()) {
      if (i !== j && dominates(a, b)) offenders.push(`${event.id}: ${event.choices[i].id} over ${event.choices[j].id}`);
    }
  }
  assert.deepEqual(offenders, []);
});
