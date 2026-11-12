import test from 'node:test';
import assert from 'node:assert/strict';
import { splitEventOutcome, splitJournalEventOutcome, formatStatNarrative, focusCapLabel } from '../display.js';

test('completed review effects give each stat its own line, including repeated stats for one person', () => {
  const text = 'Your mental stability 5.45 → 5.2; Daniel Reed: Mental stability 6.12 → 5.72; Daniel Reed: Health 7.14 → 6.99.';
  assert.deepEqual(splitEventOutcome(text), [
    'Your mental stability 5.45 → 5.2',
    'Daniel Reed: Mental stability 6.12 → 5.72',
    'Daniel Reed: Health 7.14 → 6.99.',
  ]);
  assert.deepEqual(splitEventOutcome(text).map(line => formatStatNarrative(line)), [
    'Your mental stability 5.5 → 5.2',
    'Daniel Reed: Mental stability 6.1 → 5.7',
    'Daniel Reed: Health 7.1 → 7.0.',
  ]);
});

test('selected options, exact values, and trailing temporary effects survive line separation', () => {
  const text = 'Accept the offer. Your health 6 -> 5.8; Your intelligence 4.12 -> 4.62; Alex: Jo Reed: Relationship 5 -> 5.4; Lifestyle 4.13 -> 5.13. Friends max 2. Temporary effects: 1 year.';
  assert.deepEqual(splitEventOutcome(text), [
    'Accept the offer. Your health 6 -> 5.8',
    'Your intelligence 4.12 -> 4.62',
    'Alex: Jo Reed: Relationship 5 -> 5.4',
    'Lifestyle 4.13 -> 5.13.', "'Friends' focus max 2.", 'Temporary effects: 1 year.',
  ]);
  const familyOnly = 'Arrange support. Dr. Jo Reed: Mental stability 3 → 4; Dr. Jo Reed: Health 4 → 4.1; Sam Reed: Relationship 7 → 7.2.';
  assert.deepEqual(splitEventOutcome(familyOnly), [
    'Arrange support. Dr. Jo Reed: Mental stability 3 → 4',
    'Dr. Jo Reed: Health 4 → 4.1',
    'Sam Reed: Relationship 7 → 7.2.',
  ]);
});

test('player lifestyle and every stat have separate lines in recorded order', () => {
  const text = 'Your social ability 4 → 4.1; Lifestyle 3 → 4; Anna Reed: Relationship 6 → 6.2; Daniel Reed: Relationship 5 → 5.2; Your health 5 → 5.1.';
  assert.deepEqual(splitEventOutcome(text), [
    'Your social ability 4 → 4.1',
    'Lifestyle 3 → 4',
    'Anna Reed: Relationship 6 → 6.2',
    'Daniel Reed: Relationship 5 → 5.2',
    'Your health 5 → 5.1.',
  ]);
});

test('ordinary prose, incomplete changes, and custom semicolons are preserved exactly', () => {
  for (const text of [
    '', 'None', 'No stat changes.',
    'The trip was delayed; everyone arrived later.',
    'Your health 5 → 5.1; this custom story continues.',
    'A custom opening; Your health 5 → 5.1; Daniel Reed: Health 6 → 5.8.',
    'Your health 5; Daniel Reed: Health 6 → 5.8.',
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
  assert.deepEqual(splitEventOutcome(text), splitJournalEventOutcome(text), 'year reviews use the same per-stat lines as the journal');
});

test('journal stat lines preserve choice labels, names, relationship and lifestyle endpoints', () => {
  const text = 'Arrange support. Dr. Jo Reed: Mental stability 0 -> 1.25; Dr. Jo Reed: Health 10 -> 9.75; Alex: Jo Reed: Relationship 5 -> 5.4; Lifestyle 0 -> 10. Temporary effects: 1 year.';
  assert.deepEqual(splitJournalEventOutcome(text), [
    'Arrange support. Dr. Jo Reed: Mental stability 0 -> 1.25',
    'Dr. Jo Reed: Health 10 -> 9.75',
    'Alex: Jo Reed: Relationship 5 -> 5.4',
    'Lifestyle 0 -> 10.', 'Temporary effects: 1 year.',
  ]);
});

test('trailing limits and custom prose do not collapse preceding journal stat lines', () => {
  const prefix = 'Accept the offer. Your health 5 → 4; Your strength 5 → 4';
  assert.deepEqual(splitJournalEventOutcome(`${prefix}. Play max 2; Friends max 2. Temporary effects: 1 year.`), [
    'Accept the offer. Your health 5 → 4',
    'Your strength 5 → 4.', "'Play' focus max 2", "'Friends' focus max 2.", 'Temporary effects: 1 year.',
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
  ]) assert.deepEqual(splitJournalEventOutcome(text), [text]);
});


test('temporary amounts and effective transitions retain separate journal lines', () => {
  const text = 'Try it. Your intelligence 10.2 → 10.4; +.2 Intelligence; -.5 Mental stability. Temporary effects: 2 years.';
  assert.deepEqual(splitJournalEventOutcome(text), [
    'Try it. Your intelligence 10.2 → 10.4', '+.2 Intelligence', '-.5 Mental stability.', 'Temporary effects: 2 years.',
  ]);
  assert.equal(formatStatNarrative('Your health -1 → 0; Your creativity 10 → 11'), 'Your health -1.0 → 0.0; Your creativity 10.0 → 11.0');
  assert.equal(splitJournalEventOutcome('Your health 50 → 51; Daniel Reed: Health 6 → 5.8.').length, 2);
});

test('legacy focus caps use named focus labels and remain separate even without rating changes', () => {
  for (const label of ['Yourself', 'Play', 'Electronics', 'Family time', 'Rest', 'Arts & crafts', 'School', 'Friends', 'Family', 'Sports', 'Extracurriculars', 'College', 'Career']) {
    assert.equal(focusCapLabel(label, 2), `'${label}' focus max 2`);
    assert.deepEqual(splitEventOutcome(`${label} max 2.`), [`'${label}' focus max 2.`]);
    assert.deepEqual(splitEventOutcome(`'${label}' focus max 2.`), [`'${label}' focus max 2.`], 'formatted cap labels are idempotent');
  }
  const text = 'Keep your time. No stat changes. Yourself max 2; Sports max 1. Temporary effects: 1 year.';
  assert.deepEqual(splitEventOutcome(text), [
    'Keep your time. No stat changes.', "'Yourself' focus max 2", "'Sports' focus max 1.", 'Temporary effects: 1 year.',
  ]);
  assert.equal(text, 'Keep your time. No stat changes. Yourself max 2; Sports max 1. Temporary effects: 1 year.', 'display formatting leaves the recorded string intact');
});

test('mixed permanent, temporary, focus, aptitude and fame effects split at periods, semicolons and newlines', () => {
  const text = 'Take the invitation. Your social 5.25 → 5.5. +.2 Intelligence; Your social learning ability +2 → +3.\n'
    + '-1 School focus capacity; +2 Family minimum focus. -1 total focus point; Total focus points 10 -> 9.\r\n'
    + 'Fame begins at 5.4/10; +5 Social learning ability while famous. Fame 5.4 -> 6.2; Household lifestyle 4.75 -> 5.25.\n\n'
    + 'Fame household support 0 -> +.2; Temporary effects: 2 years.';
  const expected = [
    'Take the invitation. Your social 5.25 → 5.5.', '+.2 Intelligence', 'Your social learning ability +2 → +3.',
    '-1 School focus capacity', '+2 Family minimum focus.', '-1 total focus point', 'Total focus points 10 -> 9.',
    'Fame begins at 5.4/10', '+5 Social learning ability while famous.', 'Fame 5.4 -> 6.2', 'Household lifestyle 4.75 -> 5.25.',
    'Fame household support 0 -> +.2', 'Temporary effects: 2 years.',
  ];
  assert.deepEqual(splitEventOutcome(text), expected);
  assert.deepEqual(splitJournalEventOutcome(text), expected);
});

test('effect separators cannot split names, decimal values or consume later family changes into an earlier effect', () => {
  const name = "Dr. I. O'Neil Jr.";
  const text = `Fame 5.2 -> 6.1. +.25 Health. Yourself max 2. ${name}: Health -1.25 -> 0.5. Alex: Jo Reed: Relationship 5 -> 5.4.`;
  assert.deepEqual(splitEventOutcome(text), [
    'Fame 5.2 -> 6.1.', '+.25 Health.', "'Yourself' focus max 2.",
    `${name}: Health -1.25 -> 0.5.`, 'Alex: Jo Reed: Relationship 5 -> 5.4.',
  ]);
  for (const custom of [
    'Yourself max 2 is the title of a painting; it is not a focus restriction.',
    'Your health 5 -> 5.1%; Dr. Jo Reed: Health 5 -> 5.2.',
    'Your health 5 -> 5.1. This custom story continues; with its own punctuation.',
    'A custom opening; Your health 5 -> 5.1; Daniel Reed: Health 6 -> 5.8.',
    'Someone says "Yourself max 2"; the note is quoted exactly.',
  ]) assert.deepEqual(splitEventOutcome(custom), [custom]);
});

test('legacy label-first signed deltas separate without rewriting old instability, bonds or minus signs', () => {
  const text = 'Health +.2; Social -0.2; Instability +0.3; Strength +0. Yourself max 2. Temporary effects: 1 year.';
  assert.deepEqual(splitEventOutcome(text), [
    'Health +.2', 'Social -0.2', 'Instability +0.3', 'Strength +0.', "'Yourself' focus max 2.", 'Temporary effects: 1 year.',
  ]);
  const named = 'Your Mental instability −.3; Dr. Jo Reed: Bond +0.2; Alex: Jo Reed: Bonds −0.1. Friends max 1.';
  assert.deepEqual(splitJournalEventOutcome(named), [
    'Your Mental instability −.3', 'Dr. Jo Reed: Bond +0.2', 'Alex: Jo Reed: Bonds −0.1.', "'Friends' focus max 1.",
  ]);
  for (const custom of ['Health +.2 percent; Social -0.2.', 'Someone says Health +.2; another person disagrees.']) {
    assert.deepEqual(splitEventOutcome(custom), [custom]);
  }
});
