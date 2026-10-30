import test from 'node:test';
import assert from 'node:assert/strict';
import { splitEventOutcome, splitJournalEventOutcome, formatStatNarrative } from '../display.js';

test('completed effects keep each person on a separate line and their stats together', () => {
  const text = 'Your mental stability 5.45 → 5.2; Daniel Reed: Mental stability 6.12 → 5.72; Daniel Reed: Health 7.14 → 6.99.';
  assert.deepEqual(splitEventOutcome(text), [
    'Your mental stability 5.45 → 5.2',
    'Daniel Reed: Mental stability 6.12 → 5.72; Daniel Reed: Health 7.14 → 6.99.',
  ]);
  assert.deepEqual(splitEventOutcome(text).map(line => formatStatNarrative(line)), [
    'Your mental stability 5.5 → 5.2',
    'Daniel Reed: Mental stability 6.1 → 5.7; Daniel Reed: Health 7.1 → 7.0.',
  ]);
});

test('selected options, exact values, and trailing temporary effects survive line separation', () => {
  const text = 'Accept the offer. Your health 6 -> 5.8; Your intelligence 4.12 -> 4.62; Alex: Jo Reed: Relationship 5 -> 5.4; Lifestyle 4.13 -> 5.13. Friends max 2. Temporary effects: 1 year.';
  assert.deepEqual(splitEventOutcome(text), [
    'Accept the offer. Your health 6 -> 5.8; Your intelligence 4.12 -> 4.62',
    'Alex: Jo Reed: Relationship 5 -> 5.4',
    'Lifestyle 4.13 -> 5.13. Friends max 2. Temporary effects: 1 year.',
  ]);
  const familyOnly = 'Arrange support. Dr. Jo Reed: Mental stability 3 → 4; Dr. Jo Reed: Health 4 → 4.1; Sam Reed: Relationship 7 → 7.2.';
  assert.deepEqual(splitEventOutcome(familyOnly), [
    'Arrange support. Dr. Jo Reed: Mental stability 3 → 4; Dr. Jo Reed: Health 4 → 4.1',
    'Sam Reed: Relationship 7 → 7.2.',
  ]);
});

test('player lifestyle and stats stay together while different named people separate in recorded order', () => {
  const text = 'Your social ability 4 → 4.1; Lifestyle 3 → 4; Anna Reed: Relationship 6 → 6.2; Daniel Reed: Relationship 5 → 5.2; Your health 5 → 5.1.';
  assert.deepEqual(splitEventOutcome(text), [
    'Your social ability 4 → 4.1; Lifestyle 3 → 4',
    'Anna Reed: Relationship 6 → 6.2',
    'Daniel Reed: Relationship 5 → 5.2',
    'Your health 5 → 5.1.',
  ]);
});

test('ordinary prose, incomplete changes, and custom semicolons are preserved exactly', () => {
  for (const text of [
    '', 'None', 'No stat changes.', 'Keep your time. No stat changes. Friends max 2. Temporary effects: 1 year.',
    'The trip was delayed; everyone arrived later.',
    'Your health 5 → 5.1; this custom story continues.',
    'A custom opening; Your health 5 → 5.1; Daniel Reed: Health 6 → 5.8.',
    'Your health 5; Daniel Reed: Health 6 → 5.8.',
    'Your health 5 → 5.1; Daniel Reed: Health 6 → 5.8; custom ending.',
    'Your health 5 → 5.1; Your intelligence 4 → 4.2.',
  ]) assert.deepEqual(splitEventOutcome(text), [text]);
});

test('journal results put every stat on its own line, including multiple stats for one person', () => {
  const text = 'Your mental stability 5.45 → 5.2; Your social ability 4 → 4.1; Daniel Reed: Mental stability 6.12 → 5.72; Daniel Reed: Health 7.14 → 6.99.';
  assert.deepEqual(splitJournalEventOutcome(text), [
    'Your mental stability 5.45 → 5.2',
    'Your social ability 4 → 4.1',
    'Daniel Reed: Mental stability 6.12 → 5.72',
    'Daniel Reed: Health 7.14 → 6.99.',
  ]);
  assert.deepEqual(splitJournalEventOutcome(text).map(line => formatStatNarrative(line)), [
    'Your mental stability 5.5 → 5.2',
    'Your social 4.0 → 4.1',
    'Daniel Reed: Mental stability 6.1 → 5.7',
    'Daniel Reed: Health 7.1 → 7.0.',
  ]);
  assert.equal(splitEventOutcome(text).length, 2, 'year reviews retain their per-person grouping');
});

test('journal stat lines preserve choice labels, names, relationship and lifestyle endpoints', () => {
  const text = 'Arrange support. Dr. Jo Reed: Mental stability 0 -> 1.25; Dr. Jo Reed: Health 10 -> 9.75; Alex: Jo Reed: Relationship 5 -> 5.4; Lifestyle 0 -> 10. Temporary effects: 1 year.';
  assert.deepEqual(splitJournalEventOutcome(text), [
    'Arrange support. Dr. Jo Reed: Mental stability 0 -> 1.25',
    'Dr. Jo Reed: Health 10 -> 9.75',
    'Alex: Jo Reed: Relationship 5 -> 5.4',
    'Lifestyle 0 -> 10. Temporary effects: 1 year.',
  ]);
});

test('trailing limits and custom prose do not collapse preceding journal stat lines', () => {
  const prefix = 'Accept the offer. Your health 5 → 4; Your strength 5 → 4';
  assert.deepEqual(splitJournalEventOutcome(`${prefix}. Play max 2; Friends max 2. Temporary effects: 1 year.`), [
    'Accept the offer. Your health 5 → 4',
    'Your strength 5 → 4. Play max 2; Friends max 2. Temporary effects: 1 year.',
  ]);
  assert.deepEqual(splitJournalEventOutcome(`${prefix}; the explanation continues; with a final detail.`), [
    'Accept the offer. Your health 5 → 4',
    'Your strength 5 → 4; the explanation continues; with a final detail.',
  ]);
});

test('journal formatting preserves ordinary semicolons and incomplete or invalid rating changes', () => {
  for (const text of [
    '', 'None', 'No stat changes.',
    'The trip was delayed; everyone arrived later.',
    'Your health 5 → 5.1; this custom story continues.',
    'A custom opening; Your health 5 → 5.1; Daniel Reed: Health 6 → 5.8.',
    'Your health 5; Daniel Reed: Health 6 → 5.8.',
    'Keep your time. No stat changes. Play max 2; Friends max 2. Temporary effects: 1 year.',
  ]) assert.deepEqual(splitJournalEventOutcome(text), [text]);
});


test('temporary amounts and effective transitions retain separate journal lines', () => {
  const text = 'Try it. Your intelligence 10.2 → 10.4; +.2 Intelligence; -.5 Mental stability. Temporary effects: 2 years.';
  assert.deepEqual(splitJournalEventOutcome(text), [
    'Try it. Your intelligence 10.2 → 10.4', '+.2 Intelligence', '-.5 Mental stability. Temporary effects: 2 years.',
  ]);
  assert.equal(formatStatNarrative('Your health -1 → 0; Your creativity 10 → 11'), 'Your health -1.0 → 0.0; Your creativity 10.0 → 11.0');
  assert.equal(splitJournalEventOutcome('Your health 50 → 51; Daniel Reed: Health 6 → 5.8.').length, 2);
});
