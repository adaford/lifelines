import test from 'node:test';
import assert from 'node:assert/strict';
import { splitEventOutcome, formatStatNarrative } from '../display.js';

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
    'Your health 50 → 51; Daniel Reed: Health 6 → 5.8.',
    'Your health 5 → 5.1; Daniel Reed: Health 6 → 5.8; custom ending.',
    'Your health 5 → 5.1; Your intelligence 4 → 4.2.',
  ]) assert.deepEqual(splitEventOutcome(text), [text]);
});
