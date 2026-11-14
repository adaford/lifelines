import test from 'node:test';
import assert from 'node:assert/strict';
import { LIFESTYLE_BALANCE, LIFESTYLE_INCOME_ANCHORS, lifestyleFromResources, incomeForLifestyle, lifestyleChange, changedLifestyle, roundLifestyle, lifestyleDisplayValue } from '../lifestyle.js';

test('economic Lifestyle follows the authored logarithmic anchors and their inverse', () => {
  for (const [income, rating] of LIFESTYLE_INCOME_ANCHORS) {
    assert.equal(lifestyleFromResources(income, 0), rating);
    assert.ok(Math.abs(incomeForLifestyle(rating) - income) < .000001);
  }
  assert.equal(lifestyleFromResources(0, 0), 1);
  assert.ok(lifestyleFromResources(1000, 0) < 1.2, 'small resources cannot skip the first segment');
  let previous = 1;
  for (let income = 0; income <= 100000000; income += 5000) {
    const value = lifestyleFromResources(income, 0);
    assert.ok(value >= previous && value <= 10);
    previous = value;
  }
  for (let tenth = 11; tenth <= 100; tenth++) {
    const rating = tenth / 10;
    assert.ok(Math.abs(lifestyleFromResources(incomeForLifestyle(rating), 0) - rating) <= .0001);
  }
});

test('the final tenth requires far more resources and never rounds up before its threshold', () => {
  const last = incomeForLifestyle(10) - incomeForLifestyle(9.9);
  const previous = incomeForLifestyle(9.9) - incomeForLifestyle(9.8);
  assert.ok(last > previous * 30);
  assert.ok(lifestyleFromResources(incomeForLifestyle(10) - 1, 0) < 10);
  assert.equal(lifestyleDisplayValue(9.95), 9.9);
  assert.equal(lifestyleDisplayValue(9.9999), 9.9);
  assert.equal(lifestyleDisplayValue(10), 10);
  assert.equal(roundLifestyle(9.999999), 9.9999);
  assert.equal(roundLifestyle(.000001), .0001);
});

test('reserves support a sustainable annual resource level without changing their owner', () => {
  const income = 50000, money = income / LIFESTYLE_BALANCE.reserveDrawRate;
  assert.equal(lifestyleFromResources(0, money), lifestyleFromResources(income, 0));
  assert.equal(lifestyleFromResources(income, money), lifestyleFromResources(income, 0), 'earnings and reserves are alternative support, not double-counted income');
  assert.equal(lifestyleFromResources(-100, -200), 1);
  assert.equal(lifestyleFromResources(NaN, Infinity), 1);
});

test('direct Lifestyle changes slow toward both poles and zero input creates no movement', () => {
  assert.ok(Math.abs(lifestyleChange(5, .2) - .2) < 1e-12);
  assert.ok(lifestyleChange(9.9, .2) < lifestyleChange(9, .2));
  assert.ok(lifestyleChange(9, .2) < lifestyleChange(5, .2));
  assert.ok(Math.abs(lifestyleChange(.1, -.2)) < Math.abs(lifestyleChange(1, -.2)));
  assert.ok(Math.abs(lifestyleChange(1, -.2)) < Math.abs(lifestyleChange(5, -.2)));
  assert.equal(lifestyleChange(10, .2), 0);
  assert.equal(lifestyleChange(0, -.2), 0);
  assert.equal(changedLifestyle(5.123456789, 0), 5.123456789, 'no cause preserves even a legacy high-precision rating exactly');
  for (const value of [0, .1, 5, 9.9, 10]) {
    assert.equal(lifestyleChange(value, 0), 0);
    assert.equal(changedLifestyle(value, 0), value);
    assert.ok(lifestyleChange(value, .2) >= 0);
    assert.ok(lifestyleChange(value, -.2) <= 0);
  }
  const prior = LIFESTYLE_BALANCE.changeScale;
  try {
    LIFESTYLE_BALANCE.changeScale = .5;
    assert.ok(Math.abs(lifestyleChange(5, .2) - .1) < 1e-12);
    LIFESTYLE_BALANCE.changeScale = 0;
    assert.equal(changedLifestyle(5.123456789, .2), 5.123456789, 'disabling contributions must not introduce rounding drift');
  } finally { LIFESTYLE_BALANCE.changeScale = prior; }
});
