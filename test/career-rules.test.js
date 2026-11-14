import test from 'node:test';
import assert from 'node:assert/strict';
import { CAREER_BALANCE, careerFit, careerYear, initialCareerProgress } from '../career-rules.js';
import { JOBS } from '../jobs.js';
import { lifestyleFromResources, incomeForLifestyle } from '../lifestyle.js';

const stats = value => Object.fromEntries(['intelligence', 'strength', 'attractiveness', 'social', 'creativity', 'health', 'stability'].map(key => [key, value]));

test('all job fit inputs and ceilings work through the shared career calculation', () => {
  for (const job of JOBS) {
    assert.equal(careerFit(job, stats(0)), 0);
    assert.ok(Math.abs(careerFit(job, stats(10)) - 1) < 1e-12);
    assert.ok(Math.abs(careerFit(job, stats(5)) - .5) < 1e-12);
    const strongest = careerYear({ job, stats: stats(10), focus: 4, years: 50, progress: 1 });
    assert.equal(strongest.income, job.maxSalary, job.id);
    assert.equal(strongest.performance, 1);
    assert.equal(strongest.progress, 1);
    assert.equal(lifestyleFromResources(strongest.income, 0), job.maxLifestyle, job.id);
    for (const value of [0, 3, 5, 8, 10]) for (const focus of [0, 2, 4]) {
      const outcome = careerYear({ job, stats: stats(value), focus, years: 10, progress: .4 });
      assert.ok(outcome.income >= 0 && outcome.income <= job.maxSalary, job.id);
      assert.ok(outcome.performance >= 0 && outcome.performance <= 1, job.id);
      assert.ok(outcome.progress >= .4 && outcome.progress <= 1, job.id);
    }
  }
});

test('skill, focus and experience improve success while role potential never guarantees it', () => {
  const job = JOBS.find(job => job.id === 'sales');
  const input = { job, stats: stats(5), focus: 2, years: 0, progress: 0 };
  const ordinary = careerYear(input);
  for (const better of [{ ...input, stats: stats(8) }, { ...input, focus: 4 }, { ...input, years: 20 }]) {
    const result = careerYear(better);
    assert.ok(result.performance > ordinary.performance);
    assert.ok(result.income > ordinary.income);
    assert.ok(result.progress > ordinary.progress);
  }
  assert.equal(careerYear({ ...input, focus: 0 }).progress, 0, 'no allocated work focus supplies no advancement');
  assert.equal(careerYear({ ...input, stats: stats(0), focus: 4 }).progress, 0, 'focus alone cannot replace job competence');
  assert.equal(careerYear({ ...input, job: { ...job, advancementPotential: 0 }, focus: 4 }).progress, 0, 'a role with no advancement path has no ladder to climb');
  const perfect = careerYear({ ...input, stats: stats(10), focus: 4 });
  assert.ok(perfect.income < job.maxSalary, 'a brilliant new hire does not immediately reach the role ceiling');
  assert.ok(perfect.progress < .1);
});

test('career functions are pure and finite, with an explicit tunable advancement rate', () => {
  const input = { job: JOBS.find(job => job.id === 'computer_scientist'), stats: stats(8), focus: 3, years: 12, progress: .3 };
  const before = structuredClone(input), first = careerYear(input);
  assert.deepEqual(careerYear(input), first);
  assert.deepEqual(input, before);
  assert.deepEqual(careerYear(), { performance: 0, progress: 0, income: 0 });
  assert.equal(initialCareerProgress(20), .5);
  assert.equal(initialCareerProgress(-5), 0);
  assert.equal(initialCareerProgress(500), 1);
  assert.equal(initialCareerProgress(NaN), 0);
  const prior = CAREER_BALANCE.advancementRate;
  try {
    CAREER_BALANCE.advancementRate = 0;
    assert.equal(careerYear(input).progress, input.progress);
    CAREER_BALANCE.advancementRate = prior / 2;
    assert.ok(Math.abs((careerYear(input).progress - input.progress) * 2 - (first.progress - input.progress)) <= .000002);
  } finally { CAREER_BALANCE.advancementRate = prior; }
});

test('career fit reads declared skills, clamps temporary extremes and leaves unrelated ratings out', () => {
  const job = JOBS.find(job => job.id === 'sales');
  const initial = stats(5);
  for (const [key, weight] of Object.entries(job.weights)) {
    assert.ok(Math.abs(careerFit(job, { ...initial, [key]: 10 }) - careerFit(job, initial) - .5 * weight) < 1e-12);
  }
  assert.equal(careerFit(job, { ...initial, health: 10, stability: 0 }), careerFit(job, initial));
  assert.equal(careerFit(job, stats(100)), careerFit(job, stats(10)));
  assert.equal(careerFit(job, stats(-100)), 0);
  assert.ok(Number.isFinite(careerYear({ job, stats: stats(NaN), focus: NaN, progress: NaN, years: NaN }).income));
});

test('inverse Lifestyle fallback caps earnings through the expensive final tenth without a numeric cliff', () => {
  const job = { weights: { intelligence: 1 }, baseSalary: 100000, advancementPotential: 10 };
  let priorIncome = 0;
  for (const maxLifestyle of [8.5, 9, 9.8, 9.9, 9.99, 9.9999, 10]) {
    const result = careerYear({ job: { ...job, maxLifestyle }, stats: { intelligence: 10 }, focus: 4, years: 40, progress: 1 });
    assert.ok(result.income >= priorIncome);
    assert.ok(result.income <= incomeForLifestyle(maxLifestyle));
    assert.ok(lifestyleFromResources(result.income, 0) <= maxLifestyle);
    priorIncome = result.income;
  }
});
