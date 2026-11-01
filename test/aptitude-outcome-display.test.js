import test from 'node:test';
import assert from 'node:assert/strict';
import { splitEventOutcome, splitJournalEventOutcome, formatStatNarrative } from '../display.js';

test('aptitude event outcomes separate journal and review lines and preserve signed integer learning ability', () => {
  for (const [before, after] of [['0', '+1'], ['-2', '-3'], ['+2', '+3'], ['+1', '0']]) {
    const rating = 'Your social 5 → 5.3';
    const aptitude = `Your social learning ability ${before} → ${after}.`;
    const text = `${rating}; ${aptitude}`;
    assert.deepEqual(splitJournalEventOutcome(text), [rating, aptitude]);
    assert.deepEqual(splitEventOutcome(text), [rating, aptitude]);
    assert.equal(formatStatNarrative(aptitude), aptitude);
    assert.equal(formatStatNarrative(rating), 'Your social 5.0 → 5.3');
  }
});
