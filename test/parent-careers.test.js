import test from 'node:test';
import assert from 'node:assert/strict';
import { initialParentCareer, careerForecast, advanceParentCareer, parentCareerJob } from '../parent-careers.js';
import { JOBS } from '../jobs.js';

const parent = (overrides = {}) => ({ name: 'Alex Morgan', age: 30, alive: true, lifestyle: 4, stats: { health: 5, stability: 5 }, ...overrides });
function seeded(seed) {
  const random = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return (seed + .5) / 4294967296; };
  return { random, normal: () => Math.sqrt(-2 * Math.log(random())) * Math.cos(2 * Math.PI * random()) };
}
function sequence(...values) {
  return () => {
    assert.ok(values.length, 'unexpected random draw');
    return values.shift();
  };
}

test('initial careers preserve household support without rerolling migration values', () => {
  for (let lifestyle = 0; lifestyle <= 10; lifestyle++) {
    const person = parent({ lifestyle });
    const before = structuredClone(person);
    assert.deepEqual(initialParentCareer(person, 5), { focus: 5, status: 'employed', progress: lifestyle, years: 8 });
    assert.deepEqual(person, before);
  }
  assert.equal(initialParentCareer(parent({ age: 65 })).status, 'retired');
});

test('routine forecast is pure, slows near the ceiling, and rewards career focus', () => {
  const outcomes = [0, 3, 5].map(focus => {
    const person = parent({ career: initialParentCareer(parent(), focus) });
    const before = structuredClone(person);
    const first = careerForecast(person);
    assert.deepEqual(person, before);
    assert.deepEqual(first, careerForecast(person));
    for (let year = 0; year < 18; year++) { person.career = careerForecast(person); person.age++; }
    return person.career.progress;
  });
  assert.ok(outcomes[0] < outcomes[1] && outcomes[1] < outcomes[2]);
  assert.ok(outcomes[2] < 9, 'even high focus does not guarantee a maximum lifestyle');
  const comfortable = parent({ lifestyle: 9, career: initialParentCareer(parent({ lifestyle: 9 }), 3) });
  assert.ok(careerForecast(comfortable).progress - 9 < .15);
});

test('actual routine career changes vary across seeds while replaying identical seeds', () => {
  const run = seed => {
    const rng = seeded(seed), person = parent({ career: initialParentCareer(parent()) });
    const values = [];
    for (let year = 0; year < 10; year++) {
      person.career = advanceParentCareer(person, rng).career;
      values.push(person.career.progress);
      person.age++;
    }
    return values;
  };
  assert.deepEqual(run(51), run(51));
  assert.notDeepEqual(run(51), run(52));
  const person = parent({ career: initialParentCareer(parent()) });
  const before = structuredClone(person);
  advanceParentCareer(person, seeded(12));
  assert.deepEqual(person, before);
});

test('job loss reduces support and recovery rebuilds it without erasing the setback', () => {
  const person = parent({ career: initialParentCareer(parent()) });
  const lost = advanceParentCareer(person, { random: sequence(0, .5), normal: () => assert.fail('loss does not need a normal draw') });
  assert.equal(lost.career.status, 'unemployed');
  assert.equal(lost.career.progress, 2.723, 'loss slows toward the lower Lifestyle pole');
  assert.equal(lost.event.title, 'A parent lost their job');
  person.career = lost.career;
  assert.equal(careerForecast(person).progress, 2.6947);
  const recovered = advanceParentCareer(person, { random: sequence(0, .5) });
  assert.equal(recovered.career.status, 'employed');
  assert.equal(recovered.career.progress, 3.4276);
  assert.equal(recovered.event.title, 'Back at work');
  assert.ok(recovered.career.progress < 4);
});

test('focus and wellbeing improve employment prospects without guaranteeing recovery', () => {
  const unemployed = focus => parent({ career: { ...initialParentCareer(parent(), focus), status: 'unemployed' } });
  assert.equal(advanceParentCareer(unemployed(0), { random: () => .35 }).career.status, 'unemployed');
  assert.equal(advanceParentCareer(unemployed(5), { random: () => .35 }).career.status, 'employed');
  assert.equal(advanceParentCareer(unemployed(5), { random: () => .9 }).career.status, 'unemployed');
  const struggling = unemployed(5);
  struggling.stats = { health: 1, stability: 1 };
  assert.equal(advanceParentCareer(struggling, { random: () => .35 }).career.status, 'unemployed');
});

test('average wellbeing and absent stats use neutral job-loss risk', () => {
  const average = parent({ career: initialParentCareer(parent()) });
  const options = () => ({ random: sequence(.02, 1), normal: () => 0 });
  const result = advanceParentCareer(average, options());
  assert.equal(result.career.status, 'employed');
  assert.equal(result.event, null);
  assert.deepEqual(advanceParentCareer({ ...average, stats: undefined }, options()), result);
  const unwell = { ...average, stats: { health: 1, stability: 1 } };
  assert.equal(advanceParentCareer(unwell, options()).career.status, 'unemployed');
});

test('career progress is bounded and promotions are separate from ordinary growth', () => {
  const person = parent({ lifestyle: 9.9 });
  person.career = initialParentCareer(person, 5);
  const promoted = advanceParentCareer(person, { random: sequence(.9, 0, 1), normal: () => 3 });
  assert.equal(promoted.career.progress, 9.9, 'an inherited high household rating cannot grow beyond the job ceiling');
  assert.equal(promoted.event.title, 'A parent moved ahead at work');
  person.career = { ...person.career, progress: 1.1 };
  assert.equal(advanceParentCareer(person, { random: sequence(0, 1) }).career.progress, .5671, 'loss slows near zero rather than immediately exhausting support');
  person.career = { ...person.career, progress: 0, status: 'unemployed' };
  assert.equal(careerForecast(person).progress, 0);
  assert.equal(advanceParentCareer(person, { random: sequence(.9), normal: () => -3 }).career.progress, 0);
  assert.ok(advanceParentCareer(person, { random: sequence(0, .5) }).career.progress > 0);
});

test('dead and retired parents preserve support without consuming random draws', () => {
  const rng = { random: () => assert.fail('no uniform draw'), normal: () => assert.fail('no normal draw') };
  for (const person of [parent({ alive: false }), parent({ age: 65 }), parent({ age: 45 })]) {
    person.career = initialParentCareer(person);
    if (person.age === 45) person.career.status = 'retired';
    const before = structuredClone(person);
    const actual = advanceParentCareer(person, rng);
    assert.deepEqual(actual, { career: person.career, event: null });
    assert.deepEqual(careerForecast(person), person.career);
    assert.deepEqual(person, before);
  }
  const turning65 = parent({ age: 65, career: initialParentCareer(parent({ age: 64 })) });
  assert.equal(advanceParentCareer(turning65, rng).career.status, 'retired');
});

test('new parents receive deterministic eligible occupations while legacy records stay untouched until a future year', () => {
  const person = parent({ id: 'parent-deterministic', stats: { intelligence: 5, social: 5, strength: 5, creativity: 5, attractiveness: 5, health: 5, stability: 5 } });
  const before = structuredClone(person);
  const first = initialParentCareer(person, 3, { assignJob: true });
  assert.deepEqual(initialParentCareer(person, 3, { assignJob: true }), first);
  assert.deepEqual(person, before);
  const job = JOBS.find(job => job.id === first.jobId);
  assert.ok(job.minAge <= person.age);
  for (const [stat, minimum] of Object.entries(job.requirements)) assert.ok(person.stats[stat] >= minimum);
  assert.equal(first.progress, person.lifestyle);
  assert.equal(first.advancement, .2);
  person.career = initialParentCareer(person);
  const saved = structuredClone(person);
  const future = careerForecast(person);
  assert.equal(future.jobId, first.jobId);
  assert.ok(future.advancement >= first.advancement);
  assert.deepEqual(person, saved, 'previewing a future occupation does not materialize it into the save');
});

test('parent advancement uses actual job skill weights and preserves the same random branch schedule', () => {
  const job = JOBS.find(job => job.id === 'sales');
  const setup = value => parent({ stats: { intelligence: value, social: value, health: 5, stability: 5 },
    career: { focus: 4, status: 'employed', progress: 4, years: 4, jobId: job.id, advancement: .1 } });
  const weak = setup(2), strong = setup(8);
  assert.ok(careerForecast(strong).progress > careerForecast(weak).progress);
  assert.ok(careerForecast(strong).advancement > careerForecast(weak).advancement);
  let uniforms = 0, normals = 0;
  const result = advanceParentCareer(strong, { random: () => { uniforms++; return 1; }, normal: () => { normals++; return 0; } });
  assert.equal(uniforms, 2, 'job-loss and promotion checks retain their separate rolls');
  assert.equal(normals, 1, 'ordinary yearly variation retains its draw');
  assert.deepEqual(result.career, careerForecast(strong));
  weak.career.focus = 0;
  const noContribution = advanceParentCareer(weak, { random: () => 1, normal: () => 3 }).career;
  assert.equal(noContribution.progress, weak.career.progress);
  assert.equal(noContribution.advancement, weak.career.advancement);
});

test('parent role ceilings restrict new gains without confiscating inherited household support', () => {
  const person = parent({ stats: { intelligence: 10, strength: 10, social: 10, creativity: 10, attractiveness: 10 },
    career: { focus: 5, status: 'employed', progress: 9, years: 20, jobId: 'plumber', advancement: .7 } });
  const cap = parentCareerJob(person).maxLifestyle;
  assert.ok(cap < person.career.progress);
  assert.equal(careerForecast(person).progress, 9);
  assert.equal(advanceParentCareer(person, { random: sequence(1, 0, 1), normal: () => 3 }).career.progress, 9);
  person.career.progress = cap - .001;
  const promoted = advanceParentCareer(person, { random: sequence(1, 0, 1), normal: () => 3 }).career;
  assert.equal(promoted.progress, cap);
});
