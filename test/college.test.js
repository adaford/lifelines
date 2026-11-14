import test from 'node:test';
import assert from 'node:assert/strict';
import {
  COLLEGES, COLLEGE_BALANCE, collegeById, collegeAdmissionChance, createCollegeOffers,
  parentCollegeWillingness, studentLivingLifestyle, collegeGradeScore,
  graduateOpportunityStrength, graduateCareerWeight, graduateJobOffers,
} from '../college.js';
import { JOBS } from '../jobs.js';
import { gradeLetter } from '../school.js';
import { incomeForLifestyle, lifestyleFromResources } from '../lifestyle.js';

function student(seed = 1) {
  return {
    seed, id: 'student', generation: 1, rng: 98765, age: 18, money: 0,
    stats: { intelligence: 5, strength: 5, social: 5, creativity: 5, attractiveness: 5, health: 5, stability: 5 },
    school: { gpa: 80, sports: null, extracurricular: null },
    parents: [{ id: 'parent', alive: true, relationship: 10, lifestyle: 6 }],
    guardian: null, jobId: null,
  };
}

test('college grades apply difficulty before final clipping and reward effort at every ability', () => {
  assert.equal(gradeLetter(collegeGradeScore(9.5, 4, 10)), 'A');
  assert.ok(collegeGradeScore(2, 2, 5) >= 83, 'a guided college allows a B at two study points');
  assert.ok(collegeGradeScore(9.5, 2, 5) < 70, 'the same effort is insufficient at the hardest college');
  for (const college of COLLEGES) {
    for (let intelligence = 0; intelligence <= 10; intelligence++) {
      let previous = 50;
      for (let focus = 0; focus <= 4; focus++) {
        const score = collegeGradeScore(college.difficulty, focus, intelligence);
        assert.ok(score >= previous && score <= 100);
        previous = score;
        assert.ok(collegeGradeScore(college.difficulty, focus, intelligence, -3) <= score);
        assert.ok(collegeGradeScore(college.difficulty, focus, intelligence, 3) >= score);
      }
    }
  }
  assert.equal(collegeGradeScore(9.5, 0, 0, -100), 50);
  assert.equal(collegeGradeScore(2, 4, 10, 100), 100);
});

test('admissions improve with academic and activity performance while accessible routes remain available', () => {
  for (const college of COLLEGES) {
    const low = collegeAdmissionChance(college, 50);
    const high = collegeAdmissionChance(college, 100);
    assert.ok(low > 0 && high >= low && high <= 1);
    assert.ok(collegeAdmissionChance(college, 80, 10) >= collegeAdmissionChance(college, 80, 0));
  }
  assert.equal(collegeAdmissionChance(collegeById('community_transfer'), 50), 1);
  assert.ok(collegeAdmissionChance(collegeById('selective_university'), 80)
    < collegeAdmissionChance(collegeById('regional_college'), 80));
  assert.equal(collegeById('unknown'), null);
});

test('offers, scholarships and parent willingness are pure deterministic draws independent of gameplay RNG', () => {
  const state = student(71);
  state.school = { gpa: 100, sports: { id: 'soccer', success: 10 }, extracurricular: { id: 'piano', success: 10 } };
  const before = structuredClone(state), offers = createCollegeOffers(state);
  assert.deepEqual(createCollegeOffers(JSON.parse(JSON.stringify(state))), offers);
  assert.deepEqual(createCollegeOffers({ ...state, rng: 1234 }), offers);
  assert.deepEqual(state, before);
  assert.equal(offers.offeredAge, 18);
  assert.equal(offers.schoolGpa, 100);
  assert.ok(offers.offers.some(offer => offer.collegeId === 'community_transfer'));
  assert.equal(new Set(offers.offers.map(offer => offer.collegeId)).size, offers.offers.length);
});

test('each excellent achievement can earn partial and full scholarships, but ordinary results cannot', () => {
  for (const kind of ['academic', 'sports', 'extracurricular']) {
    const coverage = new Set();
    for (let seed = 0; seed < 250; seed++) {
      const state = student(seed);
      state.school.gpa = kind === 'academic' ? 100 : 80;
      if (kind !== 'academic') state.school[kind] = { id: kind === 'sports' ? 'soccer' : 'piano', success: 10 };
      for (const offer of createCollegeOffers(state).offers) {
        if (!offer.scholarship) continue;
        assert.equal(offer.scholarship.kind, kind);
        coverage.add(offer.scholarship.coverage);
        assert.ok(offer.requiredLifestyle < collegeById(offer.collegeId).requiredLifestyle);
        if (offer.scholarship.coverage === 1) {
          assert.equal(offer.requiredLifestyle, 0);
          assert.equal(offer.annualPersonalCost, 0);
          assert.equal(offer.affordable, true);
        }
      }
    }
    assert.deepEqual([...coverage].sort(), [.25, .5, .75, 1], kind);
  }
  for (let seed = 0; seed < 50; seed++) {
    const state = student(seed);
    state.school = { gpa: 89.9, sports: { id: 'soccer', success: 7.99 }, extracurricular: { id: 'piano', success: 7.99 } };
    assert.ok(createCollegeOffers(state).offers.every(offer => offer.scholarship === null));
  }
});

test('poor relationships usually withhold help, while dead and absent caregivers supply none', () => {
  let poorSupport = 0, closeSupport = 0;
  for (let seed = 0; seed < 400; seed++) {
    const poor = student(seed), close = student(seed);
    poor.parents[0].relationship = 0;
    poorSupport += Number(createCollegeOffers(poor).funding.supporters[0].willing);
    closeSupport += Number(createCollegeOffers(close).funding.supporters[0].willing);
  }
  assert.ok(poorSupport < 25 && closeSupport > 375, `${poorSupport} poor / ${closeSupport} close`);
  assert.ok(parentCollegeWillingness(0) < parentCollegeWillingness(5));
  assert.ok(parentCollegeWillingness(5) < parentCollegeWillingness(10));
  const state = student();
  state.parents[0].alive = false;
  state.parents.push({ id: 'absent', alive: true, abandonedAt: 10, relationship: 10, lifestyle: 10 });
  assert.deepEqual(createCollegeOffers(state).funding.supporters, []);
  assert.equal(createCollegeOffers(state).funding.familyContribution, 0);
});

test('funding combines resources once per household and personal savings cover all four years', () => {
  let state;
  for (let seed = 0; seed < 50; seed++) {
    const candidate = student(seed);
    candidate.parents.push({ ...candidate.parents[0], id: 'second' });
    if (createCollegeOffers(candidate).funding.supporters.every(parent => parent.willing)) { state = candidate; break; }
  }
  assert.ok(state);
  state.money = 40000;
  const offers = createCollegeOffers(state);
  assert.equal(offers.funding.familyContribution, lifestyleFromResources(incomeForLifestyle(6) * .3));
  assert.equal(offers.funding.personalContribution, lifestyleFromResources(10000));
  assert.equal(offers.funding.availableLifestyle, lifestyleFromResources(incomeForLifestyle(6) * .3 + 10000));
  assert.ok(offers.funding.availableLifestyle < offers.funding.familyContribution + offers.funding.personalContribution);
  const unsupported = student(); unsupported.parents = [];
  let first = createCollegeOffers(unsupported).offers[0];
  assert.equal(first.affordable, false);
  const cost = incomeForLifestyle(collegeById(first.collegeId).requiredLifestyle);
  unsupported.money = cost * COLLEGE_BALANCE.years;
  first = createCollegeOffers(unsupported).offers[0];
  assert.equal(first.affordable, true);
  assert.ok(Math.abs(first.annualPersonalCost * 4 - unsupported.money) <= 2);
  assert.equal(studentLivingLifestyle(unsupported, first), COLLEGE_BALANCE.campusLifestyle);
  unsupported.money = 100000000;
  assert.equal(studentLivingLifestyle(unsupported, first), lifestyleFromResources(0, unsupported.money));
});

test('graduate lottery keeps all careers possible and improves count and quality across cohorts', () => {
  const low = { collegeId: 'community_transfer', gpa: 50 }, high = { collegeId: 'selective_university', gpa: 100 };
  assert.ok(graduateOpportunityStrength(high) > graduateOpportunityStrength(low));
  assert.ok(graduateOpportunityStrength({ ...low, gpa: 100 }) > graduateOpportunityStrength(low));
  assert.ok(graduateOpportunityStrength({ ...low, collegeId: high.collegeId }) > graduateOpportunityStrength(low));
  for (const college of COLLEGES) for (const job of JOBS) {
    assert.ok(graduateCareerWeight(job, graduateOpportunityStrength({ collegeId: college.id, gpa: 50 })) > 0, `${college.id}: ${job.id}`);
  }
  const totals = { low: { count: 0, quality: 0 }, high: { count: 0, quality: 0 } };
  const observedLow = new Set();
  for (let seed = 0; seed < 500; seed++) {
    const state = student(seed), before = structuredClone(state);
    for (const [key, outcome] of Object.entries({ low, high })) {
      const offers = graduateJobOffers(state, outcome);
      assert.ok(offers.length >= 5 && offers.length <= 18);
      assert.equal(new Set(offers).size, offers.length);
      assert.ok(offers.includes('retail'));
      totals[key].count += offers.length;
      totals[key].quality += offers.reduce((sum, id) => sum + JOBS.find(job => job.id === id).advancementPotential, 0) / offers.length;
      if (key === 'low') offers.forEach(id => observedLow.add(id));
    }
    assert.deepEqual(state, before);
  }
  assert.equal(observedLow.size, JOBS.length, 'even the weakest degree sees every career over an independent cohort');
  assert.ok(totals.high.count / 500 > totals.low.count / 500 + 5);
  assert.ok(totals.high.quality / 500 > totals.low.quality / 500 + .5);
  const employed = student(); employed.jobId = 'plumber';
  assert.ok(graduateJobOffers(employed, low).includes('plumber'));
  assert.deepEqual(graduateJobOffers(employed, high), graduateJobOffers({ ...employed, rng: 1 }, high));
});
