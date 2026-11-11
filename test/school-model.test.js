import test from 'node:test';
import assert from 'node:assert/strict';
import { SPORTS, EXTRACURRICULARS, SCHOOL_OFFER_COUNT, MAX_SCHOOL_OFFERS, schoolOfferRules, schoolActivity, gradeScore, gradeLetter,
  activityPerformance, activitySuccessChange, activityEligible, annualSchoolOffers, createSchoolRecord } from '../school.js';
import { heightReference } from '../growth.js';

const copy = value => structuredClone(value);
const near = (actual, expected) => assert.ok(Math.abs(actual - expected) < 1e-10, `${actual} versus ${expected}`);
function pupil(age = 12) {
  return { id: 'pupil-42', seed: 84102, rng: 55219, generation: 2, age, growthSex: 'male',
    height: heightReference(age, 'male').median / 2.54, maturityAge: 16, lifestyle: 5,
    stats: { intelligence: 5, strength: 5, social: 5, creativity: 5, attractiveness: 5, health: 5, stability: 5 },
    focus: { work: 2, social: 2, family: 2, self: 2, sports: 1, extracurricular: 1 } };
}

test('study sets the main grade and Intelligence adjusts it without making effort ineffective', () => {
  assert.deepEqual([0, 1, 2, 3, 4].map(study => gradeScore(study, 5)), [50, 65, 80, 90, 97]);
  assert.equal(gradeScore(3, 3), 86);
  assert.equal(gradeScore(3, 3), gradeScore(2, 8), 'more study lets a lower-Intelligence pupil match a higher-Intelligence pupil');
  assert.deepEqual([0, 1, 2, 3, 4].map(study => gradeScore(study, 0)), [50, 55, 70, 80, 87]);
  assert.equal(gradeScore(0, 10), 60, 'high Intelligence does not replace study');
  assert.ok(gradeScore(4, 0) > gradeScore(0, 10));
  for (const intelligence of [0, 1.2, 5, 9.9, 10]) {
    const results = [0, 1, 2, 3, 4].map(study => gradeScore(study, intelligence));
    assert.deepEqual(results, [...results].sort((a, b) => a - b));
    assert.ok(results.every(score => score >= 50 && score <= 100));
  }
});

test('Intelligence has a bounded adjustment and fractional study grades interpolate continuously', () => {
  for (const study of [0, .25, 1, 1.5, 2, 2.5, 3, 3.75, 4]) {
    const baseline = gradeScore(study, 5);
    const results = [0, 1.2, 5, 9.9, 10].map(intelligence => gradeScore(study, intelligence));
    assert.deepEqual(results, [...results].sort((a, b) => a - b));
    assert.ok(results.every(score => Math.abs(score - baseline) <= 10));
  }
  assert.equal(gradeScore(.25, 5), 53.8);
  assert.equal(gradeScore(2.5, 5), 85);
  assert.equal(gradeScore(3.5, 5), 93.5);
  assert.equal(gradeScore(3, 6.55), 93.1);
  assert.equal(gradeScore(-2, 5), 50);
  assert.equal(gradeScore(20, 20), 100);
  assert.equal(gradeScore(NaN, 5), 50);
  assert.equal(gradeScore(2, -100), gradeScore(2, 0));
  assert.equal(gradeScore(2, 100), gradeScore(2, 10));
});

test('every A+ through F- band changes at its exact threshold', () => {
  const bands = [[50, 'F-'], [53, 'F'], [57, 'F+'], [60, 'D-'], [63, 'D'], [67, 'D+'],
    [70, 'C-'], [73, 'C'], [77, 'C+'], [80, 'B-'], [83, 'B'], [87, 'B+'],
    [90, 'A-'], [93, 'A'], [97, 'A+']];
  for (const [index, [minimum, letter]] of bands.entries()) {
    assert.equal(gradeLetter(minimum), letter);
    if (index) assert.equal(gradeLetter(minimum - .1), bands[index - 1][1]);
  }
  assert.equal(gradeLetter(-100), 'F-');
  assert.equal(gradeLetter(100), 'A+');
  assert.equal(gradeLetter(1000), 'A+');
});

test('activity catalogs support fresh annual offers and keep training specific to the activity', () => {
  assert.equal(SPORTS.length, 28);
  assert.equal(EXTRACURRICULARS.length, 22);
  for (const [kind, entries] of [['sports', SPORTS], ['extracurricular', EXTRACURRICULARS]]) {
    assert.ok(entries.length >= 16);
    assert.equal(new Set(entries.map(entry => entry.id)).size, entries.length);
    for (const entry of entries) {
      assert.equal(schoolActivity(kind, entry.id), entry);
      assert.ok(entry.name.length > 0);
      assert.ok(Object.values(entry.weights).every(weight => Number.isFinite(weight) && weight > 0));
      assert.ok(Object.values(entry.training).every(amount => Number.isFinite(amount) && amount > 0));
      near(Object.values(entry.weights).reduce((sum, weight) => sum + weight, 0), 1);
    }
  }
  for (const sport of SPORTS) {
    assert.ok(sport.weights.strength > 0, `${sport.id} retains Strength in performance`);
    assert.equal(sport.training.strength, .3);
    assert.equal(sport.training.social, .24);
    assert.equal(sport.training.health, undefined);
    assert.equal(sport.training.stability, undefined);
  }
  for (const id of ['soccer', 'football', 'tennis']) assert.deepEqual(schoolActivity('sports', id).weights, { strength: 1 });
  assert.deepEqual(schoolActivity('extracurricular', 'chess').training, { intelligence: .225 });
  for (const id of ['piano', 'violin', 'guitar', 'drums', 'flute']) assert.deepEqual(schoolActivity('extracurricular', id).training, { creativity: .24 });
  assert.deepEqual(schoolActivity('extracurricular', 'modeling').training, { attractiveness: .225 });
  assert.equal(schoolActivity('sports', 'chess'), null);
  assert.equal(schoolActivity('unknown', 'basketball'), null);
});

test('performance uses relevant stats and compares basketball height with same-age growth references', () => {
  const basketball = schoolActivity('sports', 'basketball');
  for (const age of [5, 10, 17]) for (const growthSex of ['male', 'female']) {
    const person = pupil(age), reference = heightReference(age, growthSex);
    person.growthSex = growthSex;
    person.gender = 'nonbinary'; // Identity never chooses a growth reference.
    person.height = reference.median / 2.54;
    person.maturityAge = 14;
    const before = copy(person);
    near(activityPerformance(person, basketball), 5);
    assert.deepEqual(person, before);
    person.height = (reference.median + reference.sd) / 2.54;
    near(activityPerformance(person, basketball), 5.6);
    person.height = (reference.median - reference.sd) / 2.54;
    near(activityPerformance(person, basketball), 4.4);
  }
  const person = pupil();
  person.stats.strength = 8;
  person.stats.attractiveness = 2;
  near(activityPerformance(person, basketball), 7.1);
  near(activityPerformance(person, schoolActivity('sports', 'cheerleading')), 5.6);
  const soccer = schoolActivity('sports', 'soccer');
  assert.equal(activityPerformance(person, soccer), 8);
  person.stats.intelligence = 0; person.stats.creativity = 10; person.height = 100;
  assert.equal(activityPerformance(person, soccer), 8, 'irrelevant ratings do not change a strength-only performance');
  person.stats.strength = 100;
  assert.equal(activityPerformance(person, soccer), 10, 'effective ratings above ten cannot overflow performance');
  assert.equal(activityPerformance(person, null), 0);
});

test('endurance, precision, tactical, and artistic sports reward their performance stats without adding training effects', () => {
  const cases = [
    ['cross_country', { strength: .6, health: .4 }],
    ['rowing', { strength: .65, health: .35 }],
    ['golf', { strength: .55, stability: .45 }],
    ['cycling', { strength: .6, health: .4 }],
    ['triathlon', { strength: .55, health: .45 }],
    ['archery', { strength: .55, stability: .45 }],
    ['diving', { strength: .6, stability: .4 }],
    ['orienteering', { strength: .5, intelligence: .3, health: .2 }],
    ['sport_climbing', { strength: .55, intelligence: .3, stability: .15 }],
    ['figure_skating', { strength: .5, creativity: .35, stability: .15 }],
    ['artistic_swimming', { strength: .5, creativity: .3, health: .2 }],
  ];
  for (const [id, weights] of cases) {
    const selected = schoolActivity('sports', id), person = pupil(), before = copy(person);
    assert.deepEqual(selected.weights, weights);
    assert.deepEqual(selected.training, { strength: .3, social: .24 }, `${id} performance factors do not become training bonuses`);
    near(activityPerformance(person, selected), 5);
    for (const stat of Object.keys(person.stats)) {
      const lower = { ...person, stats: { ...person.stats, [stat]: 2 } };
      const higher = { ...person, stats: { ...person.stats, [stat]: 8 } };
      const difference = activityPerformance(higher, selected) - activityPerformance(lower, selected);
      near(difference, 6 * (weights[stat] || 0));
      if (weights[stat]) {
        assert.ok(activitySuccessChange(higher, selected, 1) > activitySuccessChange(lower, selected, 1), `${id}: ${stat} improves success with equal effort`);
      } else {
        assert.equal(activitySuccessChange(higher, selected, 1), activitySuccessChange(lower, selected, 1), `${id}: unrelated ${stat} does not affect success`);
      }
    }
    assert.deepEqual(person, before, 'performance and success reads preserve ratings and RNG');
  }
});

test('activity success rewards performance and focus with bounded supplied variation and no internal RNG', () => {
  const person = pupil(), chess = schoolActivity('extracurricular', 'chess');
  person.stats.intelligence = 6;
  const before = copy(person);
  assert.equal(activitySuccessChange(person, chess, 0), -.25);
  assert.equal(activitySuccessChange(person, chess, 1), .35);
  assert.equal(activitySuccessChange(person, chess, 2), .95);
  for (const points of [0, 1, 2]) {
    const mean = activitySuccessChange(person, chess, points, 0);
    near(activitySuccessChange(person, chess, points, 3) - mean, .36);
    near(mean - activitySuccessChange(person, chess, points, -3), .36);
    assert.equal(activitySuccessChange(person, chess, points, 100), activitySuccessChange(person, chess, points, 3));
    assert.equal(activitySuccessChange(person, chess, points, -100), activitySuccessChange(person, chess, points, -3));
  }
  const better = copy(person); better.stats.intelligence = 8;
  assert.ok(activitySuccessChange(better, chess, 1) > activitySuccessChange(person, chess, 1));
  assert.deepEqual(person, before);
});

test('wrestling favors shorter age-relative height while swimming favors taller height at the same strength', () => {
  const wrestling = schoolActivity('sports', 'wrestling'), swimming = schoolActivity('sports', 'swimming');
  assert.deepEqual(wrestling.weights, { strength: .7, height: .3 });
  assert.deepEqual(swimming.weights, { strength: .7, height: .3 });
  assert.equal(wrestling.heightPreference, 'shorter');
  for (const age of [5, 12, 17]) for (const growthSex of ['male', 'female']) {
    const person = pupil(age), reference = heightReference(age, growthSex);
    person.growthSex = growthSex;
    person.maturityAge = 14;
    person.height = reference.median / 2.54;
    const shorter = { ...person, height: (reference.median - reference.sd) / 2.54 };
    const taller = { ...person, height: (reference.median + reference.sd) / 2.54 };
    const before = copy([shorter, person, taller]);
    for (const activity of [wrestling, swimming]) {
      near(activityPerformance(person, activity), 5);
      near(activityPerformance({ ...person, stats: { ...person.stats, strength: 7 } }, activity) - activityPerformance(person, activity), 1.4);
    }
    near(activityPerformance(shorter, wrestling), 5.6);
    near(activityPerformance(taller, wrestling), 4.4);
    near(activityPerformance(shorter, swimming), 4.4);
    near(activityPerformance(taller, swimming), 5.6);
    assert.ok(activitySuccessChange(shorter, wrestling, 1) > activitySuccessChange(taller, wrestling, 1));
    assert.ok(activitySuccessChange(taller, swimming, 1) > activitySuccessChange(shorter, swimming, 1));
    assert.deepEqual([shorter, person, taller], before, 'performance reads preserve growth, ratings, and RNG');
  }
});

test('lifestyle gates expensive school sports without preventing the offer from being displayed', () => {
  const person = pupil(), lacrosse = schoolActivity('sports', 'lacrosse');
  assert.equal(lacrosse.minLifestyle, 7);
  for (const lifestyle of [0, 6.99]) assert.equal(activityEligible({ ...person, lifestyle }, lacrosse), false);
  for (const lifestyle of [7, 10]) assert.equal(activityEligible({ ...person, lifestyle }, lacrosse), true);
  assert.equal(activityEligible({ ...person, lifestyle: 0 }, schoolActivity('sports', 'soccer')), true);
  for (const age of [0, 4, 18, 30]) assert.equal(activityEligible({ ...person, age, lifestyle: 10 }, lacrosse), false);
  assert.equal(activityEligible(person, null), false);
  assert.ok(annualSchoolOffers({ ...person, lifestyle: 10 }, 'sports').length === 10, 'wealth increases access while individual activity eligibility remains separate');
});

test('annual offers at maximum Lifestyle are ten distinct fresh choices without mutating saves or using Math.random', () => {
  assert.equal(SCHOOL_OFFER_COUNT, 3);
  assert.equal(MAX_SCHOOL_OFFERS, 10);
  const person = { ...pupil(5), lifestyle: 10 };
  const random = Math.random;
  Math.random = () => { throw new Error('School offers must not draw from ambient RNG'); };
  try {
    for (const kind of ['sports', 'extracurricular']) {
      let previous = [];
      for (let age = 5; age < 18; age++) {
        person.age = age;
        const entries = kind === 'sports' ? SPORTS : EXTRACURRICULARS;
        const enrolled = entries.find(entry => !previous.includes(entry.id)).id;
        person.school = { [kind]: { id: enrolled, success: 4 } };
        const before = copy(person), oldOffers = [...previous];
        const offers = annualSchoolOffers(person, kind, previous);
        assert.equal(offers.length, 10);
        assert.equal(new Set(offers).size, 10);
        assert.ok(offers.every(id => schoolActivity(kind, id) && !previous.includes(id) && id !== enrolled));
        assert.deepEqual(annualSchoolOffers(copy(person), kind, [...previous]), offers);
        assert.deepEqual(person, before);
        assert.deepEqual(previous, oldOffers);
        previous = offers;
      }
    }
  } finally { Math.random = random; }
  assert.deepEqual(annualSchoolOffers(person, 'unknown'), []);
});

test('a school record computes a starting grade without inventing a completed report or joining an activity', () => {
  const person = pupil(5), before = copy(person);
  person.stats.intelligence = 8;
  const expected = copy(person);
  const record = createSchoolRecord(person);
  assert.equal(record.gpa, 86);
  assert.equal(gradeLetter(record.gpa), 'B');
  assert.equal(record.reportedAge, null);
  assert.equal(record.offersAge, 5);
  assert.equal(record.sports, null);
  assert.equal(record.extracurricular, null);
  assert.deepEqual(record.offers.sports, annualSchoolOffers(person, 'sports'));
  assert.deepEqual(record.offers.extracurricular, annualSchoolOffers(person, 'extracurricular'));
  assert.deepEqual(person, expected);
  assert.equal(person.rng, before.rng);
});


test('Lifestyle controls offer probability and count with clamped boundaries', () => {
  for (const [lifestyle, chance, count] of [[-5, .2, 2], [0, .2, 2], [1, .28, 2], [5, .6, 5], [10, 1, 10], [15, 1, 10]]) {
    const rules = schoolOfferRules(lifestyle);
    near(rules.chance, chance);
    assert.equal(rules.count, count);
  }
  assert.equal(schoolOfferRules(4.49).count, 4);
  assert.equal(schoolOfferRules(4.5).count, 5);
  for (const age of [0, 4, 18, 80]) for (const kind of ['sports', 'extracurricular']) {
    assert.deepEqual(annualSchoolOffers({ ...pupil(age), lifestyle: 10 }, kind), []);
  }
});

test('sampled school offers match Lifestyle rates and independently allow both, either, or neither category', () => {
  const samples = 10000;
  for (const lifestyle of [0, 1, 5, 10]) {
    const rules = schoolOfferRules(lifestyle);
    let sports = 0, extracurricular = 0, both = 0;
    for (let index = 0; index < samples; index++) {
      const person = { ...pupil(5 + index % 13), seed: index + 1, id: `offer-sample-${index}`, lifestyle };
      const sportOffers = annualSchoolOffers(person, 'sports');
      const clubOffers = annualSchoolOffers(person, 'extracurricular');
      for (const offers of [sportOffers, clubOffers]) assert.ok(offers.length === 0 || offers.length === rules.count);
      sports += Number(sportOffers.length > 0);
      extracurricular += Number(clubOffers.length > 0);
      both += Number(sportOffers.length > 0 && clubOffers.length > 0);
    }
    for (const count of [sports, extracurricular]) assert.ok(Math.abs(count / samples - rules.chance) < .025,
      `${lifestyle} Lifestyle: observed ${count / samples}, expected ${rules.chance}`);
    assert.ok(Math.abs(both / samples - rules.chance ** 2) < .025, 'category rolls remain independent');
    if (lifestyle < 10) {
      assert.ok(both > 0 && sports > both && extracurricular > both);
      assert.ok(samples - sports - extracurricular + both > 0, 'some years have no offers at all');
    } else assert.equal(both, samples);
  }
});
