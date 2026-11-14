import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createGame, advanceYear, offeredColleges, chooseEducation, joinCollegeSport, leaveCollegeSport,
  setFocus, resolveEventChoice, quitFame, focusLimits, annualForecast, validateSave, migrateSave,
  takeJob, quitJob, canTakeJob, effectiveStats, eventOdds,
  EVENTS, haveChild, successionInfo, succeed,
} from '../engine.js';
import { COLLEGES, collegeById, collegeGradeScore, createCollegeOffers } from '../college.js';
import { incomeForLifestyle } from '../lifestyle.js';
import { collegeSportSuccessAfterYear } from '../college-sports.js';
import { defaultFocus, focusBudget } from '../focus-rules.js';

const calm = { eventRandom: () => 1, mortalityRandom: () => 1, growthRandom: () => 0, parentCareerRandom: () => 1, fameRandom: () => 1 };
const copy = value => structuredClone(value);
let adultBase;
function adult() {
  if (!adultBase) {
    const state = createGame({ seed: 772341, firstName: 'Alex', surname: 'College', gender: 'male' });
    for (const person of [state, ...state.parents]) {
      person.conditions = [];
      for (const key of Object.keys(person.stats)) { person.stats[key] = 5; person.aptitudes[key] = 0; }
    }
    while (state.age < 17) assert.equal(advanceYear(state, calm).ok, true);
    state.money = 1000000;
    state.stats.intelligence = 10;
    state.focus = { work: 4, social: 2, family: 2, self: 2, sports: 0, extracurricular: 0 };
    assert.equal(advanceYear(state, calm).ok, true);
    state.focus = defaultFocus(state);
    adultBase = state;
  }
  return copy(adultBase);
}
function enroll() {
  const state = adult();
  assert.equal(chooseEducation(state, 'college', 'community_transfer').ok, true);
  return state;
}
function reload(state) {
  const before = copy(state);
  assert.equal(validateSave(state), true, `valid ${state.age}-year-old ${state.education.status} save`);
  assert.deepEqual(migrateSave(JSON.parse(JSON.stringify(state))), before);
  assert.deepEqual(state, before);
}
function team(ability = 10) {
  const state = enroll();
  for (const key of Object.keys(state.stats)) state.stats[key] = ability;
  for (const key of Object.keys(state.aptitudes)) state.aptitudes[key] = 0;
  state.school.sports = { id: 'soccer', success: 9.2 };
  assert.equal(setFocus(state, 'social', 0).ok, true);
  assert.equal(joinCollegeSport(state, 'soccer').ok, true);
  assert.equal(setFocus(state, 'sports', 2).ok, true);
  return state;
}

test('the final school year captures college offers and funding once, with unchanged reads and reloads', () => {
  const state = adult();
  assert.equal(state.education.status, 'undecided');
  assert.equal(state.collegeApplications.offeredAge, 18);
  assert.equal(state.collegeApplications.schoolGpa, state.school.gpa);
  const initial = offeredColleges(state), before = copy(state);
  assert.ok(initial.length > 0);
  for (let repeat = 0; repeat < 3; repeat++) { assert.deepEqual(offeredColleges(state), initial); reload(state); }
  assert.deepEqual(state, before);
  state.parents.forEach(parent => { parent.relationship = 0; parent.lifestyle = 0; });
  state.school.gpa = 50;
  assert.deepEqual(offeredColleges(state), initial, 'changing later circumstances cannot reroll a captured award');
  reload(state);
});

test('unaffordable or missing named colleges fail without mutations and immediate work stays available', () => {
  const state = adult();
  delete state.collegeApplications;
  state.money = 0;
  state.school.gpa = 50; state.school.sports = null; state.school.extracurricular = null;
  state.parents.forEach(parent => { parent.alive = false; });
  const before = copy(state), offers = offeredColleges(state);
  assert.ok(offers.length > 0 && offers.every(offer => !offer.affordable));
  assert.deepEqual(state, before, 'legacy fallback reads must remain pure');
  for (const collegeId of [offers[0].collegeId, 'missing']) {
    assert.equal(chooseEducation(state, 'college', collegeId).ok, false);
    assert.deepEqual(state, before);
  }
  assert.equal(chooseEducation(state, 'college').ok, false);
  assert.deepEqual(state, before);
  assert.equal(chooseEducation(state, 'work').ok, true);
  assert.equal(state.education.status, 'workforce');
  assert.ok(state.jobOffers.length > 0);
  reload(state);
});

test('displayed affordability agrees with enrollment and all four payments at rounded funding boundaries', () => {
  const template = adult();
  template.parents.forEach(parent => { parent.alive = false; });
  template.school.gpa = 80;
  template.school.sports = template.school.extracurricular = null;
  const checked = new Set();
  for (const college of COLLEGES) {
    const required = Math.round(incomeForLifestyle(college.requiredLifestyle)) * 4;
    for (const money of [required - 1, required]) {
      let state;
      for (let seed = 1; seed <= 100; seed++) {
        const candidate = copy(template);
        candidate.seed = seed; candidate.money = money;
        candidate.collegeApplications = createCollegeOffers(candidate);
        if (candidate.collegeApplications.offers.some(offer => offer.collegeId === college.id)) { state = candidate; break; }
      }
      assert.ok(state, college.id);
      const offer = offeredColleges(state).find(offer => offer.collegeId === college.id);
      const before = copy(state);
      assert.equal(offer.affordable, money === required, college.id);
      assert.equal(chooseEducation(state, 'college', college.id).ok, offer.affordable, college.id);
      if (!offer.affordable) assert.deepEqual(state, before);
      else {
        for (let year = 1; year <= 4; year++) {
          assert.equal(advanceYear(state, calm).ok, true);
          assert.equal(state.money, required * (4 - year) / 4);
          reload(state);
        }
      }
      checked.add(college.id);
    }
  }
  assert.equal(checked.size, 6);
});

test('four college years charge captured funding, report cumulative grades, and produce saved graduate offers', () => {
  const state = enroll();
  const offer = state.collegeApplications.offers.find(offer => offer.collegeId === state.education.collegeId);
  const college = collegeById(state.education.collegeId), history = copy(state.collegeApplications);
  assert.equal(state.housing.status, 'campus');
  assert.ok(state.lifestyle >= 2.5);
  assert.equal(state.education.gpa, null);
  let cumulative = 0;
  for (let year = 1; year <= 4; year++) {
    const grade = collegeGradeScore(college.difficulty, state.focus.work, effectiveStats(state).intelligence);
    cumulative = Math.round(((cumulative * (year - 1) + grade) / year) * 100) / 100;
    const money = state.money;
    assert.equal(advanceYear(state, calm).ok, true);
    assert.equal(state.education.years, year);
    assert.equal(state.education.gpa, cumulative);
    assert.equal(state.expenses, offer.annualPersonalCost);
    assert.equal(state.money, Math.max(0, Math.round(money - offer.annualPersonalCost)));
    assert.deepEqual(state.collegeApplications, history);
    assert.equal(state.education.status, year === 4 ? 'graduate' : 'college');
    reload(state);
  }
  assert.ok(state.jobOffers.length >= 5 && state.jobOffers.length <= 18);
  assert.ok(state.jobOffers.includes('retail'));
  assert.notEqual(state.housing.status, 'campus');
  const before = copy(state); annualForecast(state);
  assert.deepEqual(state, before, 'graduate offers and awards never reroll during forecasts');
});

test('new dependents cannot consume the remaining personal funding committed to four college years', () => {
  const state = adult();
  state.school.gpa = 80; state.school.sports = null; state.school.extracurricular = null;
  state.parents.forEach(parent => { parent.alive = false; });
  delete state.collegeApplications;
  const yearlyCost = createCollegeOffers(state).offers.find(offer => offer.collegeId === 'community_transfer').annualPersonalCost;
  assert.ok(yearlyCost > 0);
  state.money = yearlyCost * 4;
  state.collegeApplications = createCollegeOffers(state);
  assert.equal(chooseEducation(state, 'college', 'community_transfer').ok, true);
  for (let year = 1; year <= 4; year++) {
    assert.equal(haveChild(state).ok, true);
    const before = copy(state);
    annualForecast(state);
    assert.deepEqual(state, before, 'forecast cannot spend the committed funding');
    assert.equal(advanceYear(state, calm).ok, true);
    assert.equal(state.money, yearlyCost * (4 - year), 'each year pays its tuition while preserving the remaining commitment');
    assert.equal(state.education.years, year);
    assert.equal(state.education.status, year === 4 ? 'graduate' : 'college');
    reload(state);
  }
});

test('college sport reports preserve high-school records and obey the adult focus budget', () => {
  const state = team(9), highSchool = copy(state.school);
  assert.equal(focusBudget(state), 8);
  assert.equal(focusLimits(state).sports, 2);
  const expected = collegeSportSuccessAfterYear({ ...state, stats: effectiveStats(state) }, null, 2);
  assert.equal(advanceYear(state, calm).ok, true);
  assert.equal(state.education.sport.success, expected);
  assert.equal(state.education.sport.seasons, 1);
  assert.deepEqual(state.school, highSchool);
  assert.equal(state.yearSummary.decisions.focus.sports, 2);
  reload(state);
  const usedBeforeLeaving = Object.values(state.focus).reduce((sum, points) => sum + points, 0);
  assert.equal(leaveCollegeSport(state).ok, true);
  assert.equal(state.education.sport, undefined);
  assert.equal(state.focus.sports, undefined);
  assert.equal(Object.values(state.focus).reduce((sum, points) => sum + points, 0), usedBeforeLeaving - 2);
  assert.deepEqual(state.school, highSchool);
  reload(state);
});

test('college Fame acceptance preserves allocated sport focus and ends without removing the college team', () => {
  const state = team(), highSchool = copy(state.school);
  state.pendingEvents = [{ eventId: 'fame_sports_offer', age: state.age, fameActivityId: 'soccer' }];
  state.lastYearEvents = ['fame_sports_offer'];
  assert.equal(resolveEventChoice(state, 'pursue', 'fame_sports_offer').ok, true);
  assert.equal(state.fame.activityId, 'soccer');
  assert.equal(state.focus.sports, 2);
  assert.equal(focusLimits(state).sports, 3);
  assert.equal(advanceYear(state, calm).ok, true);
  assert.equal(state.education.sport.seasons, 1);
  assert.deepEqual(state.school, highSchool, 'adult Fame must not separately update the old school report');
  reload(state);
  assert.equal(quitFame(state).ok, true);
  assert.equal(state.fame, null);
  assert.equal(state.education.sport.id, 'soccer');
  assert.equal(state.focus.sports, 2);
  assert.equal(focusLimits(state).sports, 2);
  reload(state);
});

test('college Fame uses earned college performance and professional recruitment is uncertain and rolled once', () => {
  const original = team();
  assert.equal(eventOdds(original).find(event => event.id === 'fame_sports_offer').chance, 0, 'high-school success alone gives no college Fame invitation');
  assert.equal(advanceYear(original, calm).ok, true);
  assert.ok(eventOdds(original).find(event => event.id === 'fame_sports_offer').chance > 0);
  assert.ok(eventOdds(original).find(event => event.id === 'fame_sports_offer').chance <= .06);
  for (const recruited of [false, true]) {
    const state = copy(original);
    let recruitingDraws = 0;
    const options = { ...calm, fameRandom: () => { recruitingDraws++; return recruited ? 0 : 1; } };
    for (let year = 1; year < 4; year++) assert.equal(advanceYear(state, options).ok, true);
    assert.equal(state.education.status, 'graduate');
    assert.equal(state.education.sport.seasons, 4);
    assert.equal(state.education.sport.professionalOffer, recruited);
    assert.equal(recruitingDraws, 1);
    assert.equal(state.focus.sports, undefined);
    if (!state.jobOffers.includes('athlete')) state.jobOffers[state.jobOffers.length - 1] = 'athlete';
    assert.equal(canTakeJob(state, 'athlete').ok, recruited, 'ordinary graduate offers cannot bypass scouting');
    reload(state);
    assert.equal(advanceYear(state, options).ok, true);
    assert.equal(recruitingDraws, 1, 'a saved result must not reroll after graduation');
    assert.equal(state.education.sport.professionalOffer, recruited);
    reload(state);
  }
});

test('parents provide exactly three complete years of housing and job switches do not reset that allowance', () => {
  const state = adult(); state.money = 0;
  state.parents.forEach(parent => { parent.relationship = 10; parent.lifestyle = 4; });
  assert.equal(chooseEducation(state, 'work').ok, true);
  assert.equal(state.housing.status, 'parents');
  assert.equal(state.housing.yearsWithFamily, 0);
  state.focus = defaultFocus(state);
  for (let year = 1; year <= 3; year++) {
    assert.equal(advanceYear(state, calm).ok, true);
    assert.equal(state.housing.yearsWithFamily, year);
    assert.equal(state.housing.status, year === 3 ? 'homeless' : 'parents');
    reload(state);
  }
  if (!state.jobOffers.includes('retail')) state.jobOffers[state.jobOffers.length - 1] = 'retail';
  assert.equal(takeJob(state, 'retail').ok, true);
  assert.equal(state.housing.status, 'independent');
  assert.equal(state.housing.yearsWithFamily, 3);
  assert.equal(quitJob(state).ok, true);
  assert.equal(state.housing.status, 'homeless');
  assert.equal(state.housing.yearsWithFamily, 3);
  reload(state);
});

test('homelessness causes health, social and stability losses while reserves preserve housing without a job', () => {
  const state = adult(); state.money = 0;
  state.parents.forEach(parent => { parent.relationship = 0; });
  assert.equal(chooseEducation(state, 'work').ok, true);
  assert.equal(state.housing.status, 'homeless');
  state.focus = defaultFocus(state);
  for (const key of Object.keys(state.stats)) { state.stats[key] = 5; state.aptitudes[key] = 0; }
  const secure = copy(state); secure.money = 100000;
  // Reevaluate through a real explicit job action before comparing the routines.
  for (const candidate of [state, secure]) {
    if (!candidate.jobOffers.includes('retail')) candidate.jobOffers[candidate.jobOffers.length - 1] = 'retail';
    assert.equal(takeJob(candidate, 'retail').ok, true);
    candidate.income = 999999;
    assert.equal(quitJob(candidate).ok, true);
  }
  assert.equal(state.housing.status, 'homeless', 'quitting cannot reuse the former job income');
  assert.equal(secure.housing.status, 'independent', 'unemployment does not consume existing reserves at once');
  for (const candidate of [state, secure]) assert.equal(advanceYear(candidate, calm).ok, true);
  for (const key of ['health', 'social', 'stability']) assert.ok(state.stats[key] < secure.stats[key], key);
  assert.equal(secure.housing.status, 'independent');
  assert.ok(secure.money > 0 && secure.money < 100000);
  reload(state); reload(secure);
});

test('legacy adult and college saves retain absent optional records on reads and reloads', () => {
  for (const education of [{ status: 'undecided', years: 0 }, { status: 'college', years: 0 }]) {
    const state = adult(); delete state.collegeApplications; delete state.housing;
    state.education = education;
    if (education.status === 'college') {
      state.jobOffers = [];
      assert.equal(advanceYear(state, calm).ok, true);
      delete state.housing;
    }
    const before = copy(state);
    offeredColleges(state); annualForecast(state); reload(state);
    assert.deepEqual(state, before);
    if (education.status === 'college') {
      assert.equal(advanceYear(state, calm).ok, true);
      assert.equal(state.education.years, 2);
      assert.equal(state.education.collegeId, undefined);
      assert.equal(state.collegeApplications, undefined);
      reload(state);
    }
  }
});

test('college, sports and housing mean forecasts remain pure and match the completed quiet routine', () => {
  const states = [enroll(), team(8.4)];
  for (const parents of [false, true]) {
    const state = adult(); state.money = 0;
    state.parents.forEach(parent => { parent.relationship = parents ? 10 : 0; parent.lifestyle = 4; });
    assert.equal(chooseEducation(state, 'work').ok, true);
    states.push(state);
  }
  const expiringHome = copy(states.at(-1)); expiringHome.housing.yearsWithFamily = 2; states.push(expiringHome);
  for (const state of states) {
    const before = copy(state), forecast = annualForecast(state);
    assert.deepEqual(annualForecast(state), forecast);
    assert.deepEqual(state, before, 'forecast preserves college reports, housing allowance, history, and RNG');
    const actual = copy(state);
    assert.equal(advanceYear(actual, calm).ok, true);
    assert.deepEqual(actual.yearSummary.stats, forecast.stats);
    assert.deepEqual(actual.yearSummary.lifestyle, forecast.lifestyle);
    reload(actual);
  }
});

test('a college Fame source survives graduation when it differs from the retained high-school sport', () => {
  const state = team();
  assert.equal(joinCollegeSport(state, 'tennis').ok, true);
  const highSchool = copy(state.school);
  state.pendingEvents = [{ eventId: 'fame_sports_offer', age: state.age, fameActivityId: 'tennis' }];
  state.lastYearEvents = ['fame_sports_offer'];
  assert.equal(resolveEventChoice(state, 'pursue', 'fame_sports_offer').ok, true);
  for (let year = 0; year < 4; year++) {
    assert.equal(advanceYear(state, calm).ok, true);
    assert.equal(state.focus.sports, 2);
    assert.deepEqual(state.school, highSchool);
    reload(state);
  }
  assert.equal(state.education.status, 'graduate');
  assert.equal(state.fame.activityId, 'tennis');
  assert.equal(advanceYear(state, calm).ok, true);
  assert.equal(state.focus.sports, 2);
  assert.deepEqual(state.school, highSchool);
  reload(state);
});

function finishChoices(state, counts) {
  while (state.pendingEvents.length) {
    const pending = state.pendingEvents[0], event = EVENTS.find(event => event.id === pending.eventId);
    const choice = event.fameKind ? 'decline' : event.choices[0].id;
    const result = resolveEventChoice(state, choice, pending.eventId, pending.subjectId);
    assert.equal(result.ok, true, `resolve ${pending.eventId}: ${result.reason}`);
    counts.choices++;
    reload(state);
  }
}

test('forty seeded adult lives preserve college, Fame and housing saves through events, recovery and succession', t => {
  const counts = { years: 0, choices: 0, events: 0, successions: 0 }, statuses = new Set();
  for (let life = 0; life < 40; life++) {
    const state = adult();
    state.seed = 661901 + life * 499; state.rng = (state.seed * 2654435761) >>> 0;
    state.money = life % 2 ? 500000 : 0;
    state.parents.forEach(parent => { parent.relationship = life % 4 < 2 ? 10 : 0; parent.lifestyle = 5; });
    for (const key of Object.keys(state.stats)) state.stats[key] = life % 5 ? 8 : 10;
    state.school.sports = { id: 'soccer', success: 10 };
    state.collegeApplications = createCollegeOffers(state);
    assert.equal(chooseEducation(state, life % 2 ? 'college' : 'work').ok, true);
    if (life % 2) {
      assert.equal(setFocus(state, 'social', 0).ok, true);
      assert.equal(joinCollegeSport(state, life % 4 === 1 ? 'tennis' : 'soccer').ok, true);
      assert.equal(setFocus(state, 'sports', 2).ok, true);
      if (life % 3 === 0) {
        state.pendingEvents = [{ eventId: 'fame_sports_offer', age: state.age, fameActivityId: state.education.sport.id }];
        state.lastYearEvents = ['fame_sports_offer'];
        assert.equal(resolveEventChoice(state, 'pursue', 'fame_sports_offer').ok, true);
      }
    }
    reload(state);
    while (state.age < 30) {
      finishChoices(state, counts);
      statuses.add(state.housing.status);
      if (state.age === 22) {
        state.money = 0;
        if (!state.jobOffers.includes('retail')) state.jobOffers[state.jobOffers.length - 1] = 'retail';
        assert.equal(takeJob(state, 'retail').ok, true);
        assert.equal(quitJob(state).ok, true);
      }
      if (state.age === 26) {
        if (!state.jobOffers.includes('retail')) state.jobOffers[state.jobOffers.length - 1] = 'retail';
        assert.equal(takeJob(state, 'retail').ok, true);
        assert.equal(state.housing.status, 'independent');
      }
      if (state.age === 28 && life % 3 === 0) assert.equal(haveChild(state).ok, true);
      const before = copy(state); annualForecast(state);
      assert.deepEqual(state, before);
      assert.equal(advanceYear(state, { mortalityRandom: () => 1 }).ok, true, `life ${life}, age ${state.age}`);
      counts.years++; counts.events += state.lastYearEvents.length;
      reload(state);
    }
    finishChoices(state, counts);
    let deaths = 0;
    assert.equal(advanceYear(state, { eventRandom: () => 1, mortalityRandom: () => deaths++ === 0 ? 0 : 1 }).ok, true);
    assert.equal(state.alive, false);
    reload(state);
    const info = successionInfo(state);
    assert.equal(info.eligible, true);
    assert.equal(succeed(state, info.candidates[0].id).ok, true);
    assert.equal(state.collegeApplications, undefined);
    assert.equal(state.housing, undefined);
    assert.equal(state.education.collegeId, undefined);
    assert.equal(state.education.sport, undefined);
    assert.equal(state.fame, null);
    reload(state);
    counts.successions++;
  }
  assert.equal(counts.years, 480);
  assert.equal(counts.successions, 40);
  assert.ok(counts.events > 100 && counts.choices > 10, JSON.stringify(counts));
  assert.deepEqual([...statuses].sort(), ['campus', 'homeless', 'independent', 'parents']);
  t.diagnostic(JSON.stringify(counts));
});
