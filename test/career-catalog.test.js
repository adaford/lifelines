import test from 'node:test';
import assert from 'node:assert/strict';
import { JOBS, JOB_CATEGORIES } from '../jobs.js';
import { CAREER_PROFILES } from '../career-profiles.js';
import { careerFit, careerYear } from '../career-rules.js';
import { lifestyleFromResources } from '../lifestyle.js';

const byId = id => JOBS.find(job => job.id === id);
const stats = { intelligence: 5, strength: 5, attractiveness: 5, social: 5, creativity: 5, health: 5, stability: 5 };

test('every career has an authored path, normalized success factors and a distinct bounded earning ceiling', () => {
  assert.equal(JOBS.length, 101);
  assert.equal(JOB_CATEGORIES.length, 10);
  assert.deepEqual(new Set(JOBS.map(job => job.id)), new Set(Object.keys(CAREER_PROFILES)));
  assert.equal(new Set(JOBS.map(job => job.name)).size, JOBS.length);
  const paths = new Set();
  for (const job of JOBS) {
    assert.ok(job.advancementPotential > 0 && job.advancementPotential <= 10, job.id);
    assert.ok(Number.isFinite(job.maxSalary) && job.maxSalary > job.baseSalary, job.id);
    assert.equal(job.baseLifestyle, lifestyleFromResources(job.baseSalary, 0), job.id);
    assert.equal(job.maxLifestyle, lifestyleFromResources(job.maxSalary, 0), job.id);
    assert.ok(job.maxLifestyle > job.baseLifestyle && job.maxLifestyle < 10, job.id);
    assert.ok(job.advancementDescription.length > 40 && job.advancementDescription.length < 220, job.id);
    paths.add(job.advancementDescription);
    assert.ok(Math.abs(Object.values(job.weights).reduce((sum, weight) => sum + weight, 0) - 1) < 1e-12, job.id);
    const baseline = careerFit(job, stats);
    for (const key of Object.keys(job.weights)) {
      assert.ok(careerFit(job, { ...stats, [key]: 8 }) > baseline, `${job.id}: ${key} helps`);
      assert.ok(careerFit(job, { ...stats, [key]: 2 }) < baseline, `${job.id}: ${key} matters when lower`);
    }
  }
  assert.equal(paths.size, JOBS.length, 'each role has its own reviewed progression explanation');
});

test('sales success prioritizes communication and reasoning while physical and visual work use their relevant abilities', () => {
  assert.deepEqual(byId('sales').affinities, { social: 3, intelligence: 3 });
  assert.equal(careerFit(byId('sales'), { ...stats, social: 8 }), careerFit(byId('sales'), { ...stats, intelligence: 8 }));
  assert.equal(careerFit(byId('sales'), { ...stats, attractiveness: 10, strength: 10 }), careerFit(byId('sales'), stats));
  assert.ok(careerFit(byId('plumber'), { ...stats, strength: 9 }) > careerFit(byId('plumber'), stats));
  assert.equal(careerFit(byId('computer_scientist'), { ...stats, strength: 9 }), careerFit(byId('computer_scientist'), stats));
  assert.ok(careerFit(byId('fashion_model'), { ...stats, attractiveness: 9 }) > careerFit(byId('fashion_model'), { ...stats, social: 9 }));
  assert.deepEqual(JOBS.filter(job => job.weights.attractiveness).map(job => job.id).sort(), ['fashion_model', 'performer']);
});

test('trade advancement remains meaningful while research and ownership have broader career ceilings', () => {
  const plumber = byId('plumber'), scientist = byId('computer_scientist'), owner = byId('business_owner');
  assert.ok(plumber.maxSalary > plumber.baseSalary * 2);
  assert.ok(plumber.advancementPotential < scientist.advancementPotential);
  assert.ok(plumber.maxLifestyle < scientist.maxLifestyle && scientist.maxLifestyle < owner.maxLifestyle);
  assert.match(plumber.advancementDescription, /master plumbing, supervision.*business ownership is a separate path/);
  assert.match(scientist.advancementDescription, /principal scientist.*laboratory leadership/);
  assert.equal(scientist.requiresCollege, true);
  assert.ok(scientist.minAge >= 21);
  assert.ok(byId('barista').advancementPotential < byId('sales').advancementPotential);
  assert.ok(byId('judge').baseLifestyle > byId('sales').baseLifestyle, 'high starting earnings need not imply the broadest ladder');
  assert.ok(byId('judge').advancementPotential < byId('sales').advancementPotential);
});

test('every job ceiling is enforced by the actual career model under extreme skill, focus and tenure', () => {
  for (const job of JOBS) {
    const result = careerYear({ job, stats: Object.fromEntries(Object.keys(stats).map(key => [key, 100])), focus: 100, years: 1000, progress: 100 });
    assert.ok(result.income <= job.maxSalary, job.id);
    assert.equal(result.income, job.maxSalary, `${job.id}: qualified maximum work can reach its own cap`);
    assert.equal(lifestyleFromResources(result.income, 0), job.maxLifestyle);
    const ordinary = careerYear({ job, stats, focus: 2, years: 0, progress: 0 });
    const better = careerYear({ job, stats: Object.fromEntries(Object.keys(stats).map(key => [key, 8])), focus: 2, years: 0, progress: 0 });
    assert.ok(better.performance > ordinary.performance && better.income > ordinary.income, job.id);
  }
});
