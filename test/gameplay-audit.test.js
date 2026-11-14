import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createGame, advanceYear, chooseEducation, needsEducationChoice, offeredColleges,
  joinCollegeSport, leaveCollegeSport, setFocus, fitFocusAllocation, resolveEventChoice,
  takeJob, quitJob, haveChild, successionInfo, succeed, quitFame,
  validateSave, migrateSave, annualForecast, eventOdds, focusMinimums,
  effectiveStats, lifestyleFromResources,
  respondToEncounter, proposeMarriage, endRelationship,
  EVENTS, JOBS,
} from '../engine.js';
import { SPORTS } from '../school.js';

const copy = state => structuredClone(state);
const calm = { eventRandom: () => 1, mortalityRandom: () => 1, growthRandom: () => 0, parentCareerRandom: () => 1, fameRandom: () => 1 };
function check(state, label) {
  const before = copy(state);
  assert.equal(validateSave(state), true, `${label}: valid ${state.age}-year-old ${state.education.status} state`);
  assert.deepEqual(migrateSave(JSON.parse(JSON.stringify(state))), before, `${label}: exact reload`);
  assert.deepEqual(state, before, `${label}: validation is read-only`);
}
function action(state, label, run) {
  const before = copy(state), result = run();
  if (result.ok) check(state, label);
  else assert.deepEqual(state, before, `${label}: rejection is atomic (${result.reason})`);
  return result;
}
function livingAt(age = 18, seed = 55019) {
  const state = createGame({ seed });
  while (state.age < age) assert.equal(advanceYear(state, calm).ok, true);
  check(state, 'initial state');
  return state;
}
function fundedCollege(state) {
  state.money = 1000000;
  delete state.collegeApplications;
  assert.equal(action(state, 'college entry', () => chooseEducation(state, 'college')).ok, true);
}
function killPlayer(state) {
  let calls = 0;
  assert.equal(action(state, 'death transition', () => advanceYear(state, { ...calm, mortalityRandom: () => calls++ === 0 ? 0 : 1 })).ok, true);
  assert.equal(state.alive, false);
}

test('an adult heir can leave an unfinished college team through a second succession without inheriting its focus key', () => {
  const state = livingAt(); fundedCollege(state);
  assert.equal(action(state, 'first adoption', () => haveChild(state)).ok, true);
  assert.equal(action(state, 'college year', () => advanceYear(state, calm)).ok, true);
  assert.equal(action(state, 'second adoption', () => haveChild(state)).ok, true);
  while (state.age < 38) assert.equal(action(state, 'raise children', () => advanceYear(state, calm)).ok, true);
  killPlayer(state);
  const candidates = successionInfo(state).candidates;
  assert.ok(candidates[0].age >= 18 && candidates[1].age >= 18);
  assert.equal(action(state, 'adult child succession', () => succeed(state, candidates[0].id)).ok, true);
  assert.equal(state.school, null);
  assert.equal(action(state, 'adult heir college', () => chooseEducation(state, 'college')).ok, true);
  assert.equal(action(state, 'free team focus', () => setFocus(state, 'social', 0)).ok, true);
  assert.equal(action(state, 'adult heir team', () => joinCollegeSport(state, 'soccer')).ok, true);
  killPlayer(state);
  const info = successionInfo(state);
  assert.equal(info.route, 'siblings');
  assert.equal(action(state, 'adult sibling succession', () => succeed(state, info.candidates[0].id)).ok, true);
  assert.equal(state.focus.sports, undefined);
  assert.equal(state.education.sport, undefined);
  assert.equal(state.housing, undefined);
  assert.equal(state.collegeApplications, undefined);
});

test('college sport commitments, temporary restrictions and pending decisions reject actions atomically', () => {
  const state = livingAt(); fundedCollege(state);
  assert.equal(action(state, 'free focus', () => setFocus(state, 'social', 0)).ok, true);
  assert.equal(action(state, 'join', () => joinCollegeSport(state, 'soccer')).ok, true);
  assert.equal(action(state, 'practice', () => setFocus(state, 'sports', 2)).ok, true);
  state.effects.push({ id: 'audit-team-commitment', name: 'Team commitment', description: '', years: 1, kind: 'neutral', modifiers: {}, focusMinimums: { standard: { sports: 1 } } });
  check(state, 'saved team commitment');
  for (const [label, run] of [
    ['leave committed team', () => leaveCollegeSport(state)],
    ['switch committed team', () => joinCollegeSport(state, 'tennis')],
    ['withdraw committed focus', () => setFocus(state, 'sports', 0)],
  ]) assert.equal(action(state, label, run).ok, false);
  assert.equal(action(state, 'complete committed year', () => advanceYear(state, calm)).ok, true);
  assert.equal(focusMinimums(state).sports, 0);
  assert.equal(action(state, 'leave completed commitment', () => leaveCollegeSport(state)).ok, true);
  state.effects.push({ id: 'audit-physical-limit', name: 'Recovery', description: '', years: 1, kind: 'negative', modifiers: {}, focusLimits: { standard: { self: 0 } } });
  state.focus = fitFocusAllocation(state, state.focus);
  check(state, 'saved recovery limit');
  assert.equal(action(state, 'join while physically restricted', () => joinCollegeSport(state, 'swimming')).ok, false);
  assert.equal(action(state, 'complete recovery', () => advanceYear(state, calm)).ok, true);
  assert.equal(action(state, 'join after recovery', () => joinCollegeSport(state, 'swimming')).ok, true);
  assert.equal(state.focus.sports, 1, 'joining adds only its explicitly assigned point');
  assert.equal(state.focus.self, 0, 'expiry never refills prior allocation');
  assert.equal(action(state, 'first new team report', () => advanceYear(state, calm)).ok, true);
  state.pendingEvents = [{ eventId: 'fame_sports_offer', age: state.age, fameActivityId: 'swimming' }];
  state.lastYearEvents = ['fame_sports_offer'];
  check(state, 'queued invitation');
  for (const [label, run] of [
    ['pending leave', () => leaveCollegeSport(state)], ['pending switch', () => joinCollegeSport(state, 'tennis')],
    ['pending focus', () => setFocus(state, 'work', 0)], ['pending career', () => takeJob(state, 'retail')],
    ['pending advance', () => advanceYear(state)], ['stale choice', () => resolveEventChoice(state, 'pursue', 'wrong-event')],
  ]) assert.equal(action(state, label, run).ok, false);
  assert.equal(action(state, 'resolve invitation', () => resolveEventChoice(state, 'pursue', 'fame_sports_offer')).ok, true);
  assert.equal(action(state, 'switch famous team', () => joinCollegeSport(state, 'tennis')).ok, true);
  assert.equal(state.fame, null);
  assert.equal(state.education.sport.id, 'tennis');
  assert.equal(state.education.sport.seasons, 0);
  assert.equal(state.education.sport.success, null);
});

test('school sports and extracurricular Fame both coexist safely with changing college teams', () => {
  for (const kind of ['sports', 'extracurricular']) {
    const state = livingAt(17, kind === 'sports' ? 18017 : 18018);
    state.school.sports = { id: 'soccer', success: 10 };
    state.school.extracurricular = { id: 'chess', success: 10 };
    state.focus = fitFocusAllocation(state, { work: 2, social: 0, family: 2, self: 1, sports: 2, extracurricular: 2 });
    state.pendingEvents = [{ eventId: `fame_${kind}_offer`, age: 17, fameActivityId: kind === 'sports' ? 'soccer' : 'chess' }];
    state.lastYearEvents = [`fame_${kind}_offer`];
    assert.equal(action(state, 'school fame accepted', () => resolveEventChoice(state, 'pursue', `fame_${kind}_offer`)).ok, true);
    assert.equal(action(state, 'famous adulthood transition', () => advanceYear(state, calm)).ok, true);
    fundedCollege(state);
    for (const key of ['work', 'social', 'family', 'self']) action(state, 'free budget', () => setFocus(state, key, 0));
    assert.equal(action(state, 'new college team', () => joinCollegeSport(state, 'tennis')).ok, true);
    assert.equal(state.fame?.kind ?? null, kind === 'sports' ? null : 'extracurricular');
    const school = copy(state.school);
    assert.equal(action(state, 'college team season', () => advanceYear(state, calm)).ok, true);
    assert.deepEqual(state.school.sports, school.sports);
    assert.equal(action(state, 'leave college team', () => leaveCollegeSport(state)).ok, true);
    assert.equal(state.focus.sports, undefined);
    if (kind === 'extracurricular') {
      assert.equal(state.fame.kind, 'extracurricular');
      assert.equal(action(state, 'end separate fame', () => quitFame(state)).ok, true);
    }
    assert.equal(action(state, 'rejoin previous team', () => joinCollegeSport(state, 'soccer')).ok, true);
    assert.equal(state.education.sport.success, null);
  }
});

test('maximum saved resources remain valid after earnings, adult-child savings and combined inheritances', () => {
  const maximum = 1e15;
  const worker = livingAt();
  assert.equal(action(worker, 'wealthy workforce entry', () => chooseEducation(worker, 'work')).ok, true);
  worker.money = maximum;
  for (const key of Object.keys(worker.stats)) worker.stats[key] = 10;
  if (!worker.jobOffers.includes('athlete')) worker.jobOffers[worker.jobOffers.length - 1] = 'athlete';
  check(worker, 'existing maximum resource save');
  assert.equal(action(worker, 'qualified high-income career', () => takeJob(worker, 'athlete')).ok, true);
  assert.equal(action(worker, 'earn above existing resource ceiling', () => advanceYear(worker, calm)).ok, true);
  assert.ok(worker.income > worker.expenses, 'the annual earnings would exceed the saved ceiling without a bound');
  assert.equal(worker.money, maximum);

  const family = livingAt(); fundedCollege(family);
  assert.equal(action(family, 'first wealthy heir', () => haveChild(family)).ok, true);
  assert.equal(action(family, 'separate adoption year', () => advanceYear(family, calm)).ok, true);
  assert.equal(action(family, 'second wealthy heir', () => haveChild(family)).ok, true);
  while (family.age < 38) assert.equal(advanceYear(family, calm).ok, true);
  family.money = maximum;
  for (const child of family.children) child.money = maximum;
  check(family, 'maximum adult-child balances');
  assert.equal(action(family, 'adult children save new earnings', () => advanceYear(family, calm)).ok, true);
  assert.ok(family.children.every(child => child.money === maximum));
  killPlayer(family);
  const info = successionInfo(family);
  assert.ok(info.share > 0);
  assert.equal(action(family, 'combine inherited and existing wealth', () => succeed(family, info.candidates[0].id)).ok, true);
  assert.equal(family.money, maximum);
  assert.equal(family.siblings.length, 1);
  assert.equal(family.siblings[0].money, maximum);
});

test('the full accepted legacy modifier capacity survives actions, expiry and saved year reviews', () => {
  for (const direction of [-1, 1]) {
    const state = livingAt();
    assert.equal(action(state, 'legacy workforce entry', () => chooseEducation(state, 'work')).ok, true);
    state.effects = Array.from({ length: 64 }, (_, index) => ({
      id: `legacy-capacity-${index}`, name: 'Saved temporary modifier', description: '', years: 1,
      kind: direction > 0 ? 'positive' : 'negative', modifiers: { intelligence: direction * 10 }, lifestyle: direction * 10,
    }));
    state.yearSummary = null;
    check(state, 'previously accepted full-capacity legacy save');
    const unmodifiedIntelligence = state.stats.intelligence;
    assert.equal(action(state, 'refresh resources with legacy modifiers', () => takeJob(state, 'retail')).ok, true);
    assert.equal(effectiveStats(state).intelligence, Math.round((unmodifiedIntelligence + direction * 640) * 100) / 100);
    assert.ok(Math.abs(state.lifestyle - lifestyleFromResources(state.income, state.money) - direction * 640) < .0001);
    const beforeEffective = effectiveStats(state), beforeLifestyle = state.lifestyle;
    const forecast = annualForecast(state);
    check(state, 'legacy forecast leaves saved modifiers exact');
    assert.equal(action(state, 'expire full-capacity legacy effects', () => advanceYear(state, calm)).ok, true);
    assert.equal(state.effects.length, 0);
    assert.equal(state.yearSummary.stats.intelligence.before, beforeEffective.intelligence);
    assert.equal(state.yearSummary.stats.intelligence.after, effectiveStats(state).intelligence);
    assert.equal(state.yearSummary.lifestyle.before, beforeLifestyle);
    assert.deepEqual(state.yearSummary.stats, forecast.stats);
    assert.deepEqual(state.yearSummary.lifestyle, forecast.lifestyle);
    assert.ok(state.lifestyle >= 0 && state.lifestyle <= 10);
  }
});

test('a new scheduling commitment coexists with a full legacy modifier collection until each expires', () => {
  const state = livingAt();
  assert.equal(action(state, 'workforce path for overtime', () => chooseEducation(state, 'work')).ok, true);
  assert.equal(action(state, 'retail role for overtime', () => takeJob(state, 'retail')).ok, true);
  assert.equal(action(state, 'first working year', () => advanceYear(state, calm)).ok, true);
  state.effects = Array.from({ length: 64 }, (_, index) => ({
    id: `saved-legacy-${index}`, name: 'Saved temporary modifier', description: '', years: 2,
    kind: 'positive', modifiers: { intelligence: .1 },
  }));
  state.pendingEvents = [{ eventId: 'overtime_offer', age: state.age }];
  state.lastYearEvents = ['overtime_offer'];
  const retained = copy(state.effects);
  check(state, 'full legacy collection with a real pending choice');
  assert.equal(action(state, 'accept extra duties', () => resolveEventChoice(state, 'accept', 'overtime_offer')).ok, true);
  assert.equal(state.effects.length, 65);
  assert.deepEqual(state.effects.slice(0, 64), retained, 'new scheduling costs never discard or rewrite old effects');
  assert.equal(state.effects.at(-1).id, 'overtime_offer');
  assert.deepEqual(state.effects.at(-1).modifiers, {});
  assert.deepEqual(state.effects.at(-1).focusCapacity, { standard: { self: -2, sports: -1 } });
  assert.equal(action(state, 'complete new commitment', () => advanceYear(state, calm)).ok, true);
  assert.equal(state.effects.length, 64);
  assert.ok(state.effects.every(effect => effect.years === 1));
  assert.equal(action(state, 'expire preserved legacy collection', () => advanceYear(state, calm)).ok, true);
  assert.equal(state.effects.length, 0);
});

test('seeded action sequences keep mortal multi-generation lives valid through choices and competing commitments', t => {
  const counts = { years: 0, decisions: 0, acceptedActions: 0, rejectedActions: 0, deaths: 0, successions: 0, collegeEntries: 0, teamChanges: 0 };
  let controlSeed = 0x5a71c0de;
  const draw = n => { controlSeed = (Math.imul(controlSeed, 1664525) + 1013904223) >>> 0; return controlSeed % n; };
  const checkedAction = (state, label, run) => {
    const result = action(state, label, run);
    counts[result.ok ? 'acceptedActions' : 'rejectedActions']++;
    return result;
  };
  for (let run = 0; run < 24; run++) {
    const state = livingAt(16, 940019 + run * 65537);
    state.money = [0, 120000, 700000][run % 3];
    if (run % 4 === 0) {
      const kind = run % 8 === 0 ? 'sports' : 'extracurricular', id = kind === 'sports' ? 'soccer' : 'chess';
      state.school[kind] = { id, success: 10 };
      state.focus = fitFocusAllocation(state, { ...state.focus, social: 0, [kind]: 2 });
      state.pendingEvents = [{ eventId: `fame_${kind}_offer`, age: state.age, fameActivityId: id }];
      state.lastYearEvents = [`fame_${kind}_offer`];
      assert.equal(checkedAction(state, 'seeded initial fame', () => resolveEventChoice(state, 'pursue', `fame_${kind}_offer`)).ok, true);
    }
    for (let step = 0; step < 90; step++) {
      const label = `run ${run} step ${step} generation ${state.generation} age ${state.age}`;
      while (state.pendingEvents.length) {
        const pending = state.pendingEvents[0], event = EVENTS.find(event => event.id === pending.eventId);
        assert.equal(checkedAction(state, `${label} pending advance`, () => advanceYear(state)).ok, false);
        const index = draw(event.choices.length), choice = event.choices[index];
        let result = checkedAction(state, `${label} ${event.id}/${choice.id}`, () => resolveEventChoice(state, choice.id, event.id, pending.subjectId));
        if (!result.ok) {
          for (const fallback of event.choices.filter(candidate => candidate.id !== choice.id)) {
            result = checkedAction(state, `${label} fallback ${event.id}/${fallback.id}`, () => resolveEventChoice(state, fallback.id, event.id, pending.subjectId));
            if (result.ok) break;
          }
        }
        assert.equal(result.ok, true, `${label}: at least one event outcome remains available`);
        counts.decisions++;
      }
      if (state.needsSuccession) {
        if (!state.alive) counts.deaths++;
        const info = successionInfo(state);
        assert.equal(info.eligible, true, `${label}: succession is available`);
        const heir = info.candidates[draw(info.candidates.length)];
        assert.equal(checkedAction(state, `${label} successor ${heir.id}`, () => succeed(state, heir.id)).ok, true);
        counts.successions++;
      }
      if (needsEducationChoice(state)) {
        const offers = offeredColleges(state);
        const attemptCollege = run % 3 !== 0;
        const offer = offers[draw(offers.length)];
        const result = attemptCollege
          ? checkedAction(state, `${label} education`, () => chooseEducation(state, 'college', offer.collegeId))
          : checkedAction(state, `${label} workforce`, () => chooseEducation(state, 'work'));
        if (!result.ok) assert.equal(checkedAction(state, `${label} workforce fallback`, () => chooseEducation(state, 'work')).ok, true);
        if (state.education.status === 'college') counts.collegeEntries++;
      }
      for (let move = 0; move < 4; move++) {
        const type = draw(10);
        let operation;
        if (type === 0) {
          const key = ['work', 'social', 'family', 'self', 'sports', 'extracurricular'][draw(6)], value = draw(6) - 1;
          operation = () => setFocus(state, key, value);
        } else if (type === 1) {
          const id = SPORTS[draw(SPORTS.length)].id;
          operation = () => joinCollegeSport(state, id);
        } else if (type === 2) operation = () => leaveCollegeSport(state);
        else if (type === 3) operation = () => quitFame(state);
        else if (type === 4) {
          const job = draw(3) ? state.jobOffers[draw(Math.max(1, state.jobOffers.length))] : JOBS[draw(JOBS.length)].id;
          operation = () => takeJob(state, job);
        } else if (type === 5) operation = () => quitJob(state);
        else if (type === 6) operation = () => haveChild(state);
        else if (type === 7) {
          const encounter = state.encounters[draw(Math.max(1, state.encounters.length))];
          const decision = ['relationship', 'casual', 'ignore'][draw(3)];
          operation = () => respondToEncounter(state, encounter?.id ?? 'missing', decision);
        } else if (type === 8) operation = () => proposeMarriage(state);
        else operation = () => endRelationship(state);
        const result = checkedAction(state, `${label} move ${move} type ${type}`, operation);
        if (type === 1 && result.ok) counts.teamChanges++;
      }
      const before = copy(state);
      annualForecast(state); eventOdds(state); successionInfo(state);
      assert.deepEqual(state, before, `${label}: informational reads preserve the complete state`);
      assert.equal(checkedAction(state, `${label} yearly progression`, () => advanceYear(state)).ok, true);
      counts.years++;
    }
  }
  assert.equal(counts.years, 2160);
  assert.ok(counts.deaths > 10 && counts.successions > 10);
  assert.ok(counts.decisions > 100 && counts.collegeEntries > 5 && counts.teamChanges > 5);
  assert.ok(counts.acceptedActions > 1000 && counts.rejectedActions > 1000);
  t.diagnostic(JSON.stringify(counts));
});
