import test from 'node:test';
import assert from 'node:assert/strict';
import { initialParentCareer, careerForecast, advanceParentCareer } from '../parent-careers.js';

const parent = (overrides = {}) => ({ name: 'Alex Morgan', age: 30, alive: true, lifestyle: 4, stats: { health: 8, stability: 8 }, ...overrides });
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
  for (let lifestyle = 1; lifestyle <= 10; lifestyle++) {
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
  assert.equal(lost.career.progress, 2.5);
  assert.equal(lost.event.title, 'A parent lost their job');
  person.career = lost.career;
  assert.equal(careerForecast(person).progress, 2.455);
  const recovered = advanceParentCareer(person, { random: sequence(0, .5) });
  assert.equal(recovered.career.status, 'employed');
  assert.equal(recovered.career.progress, 3.05);
  assert.equal(recovered.event.title, 'Back at work');
  assert.ok(recovered.career.progress < 4);
});

test('focus and wellbeing improve employment prospects without guaranteeing recovery', () => {
  const unemployed = focus => parent({ career: { ...initialParentCareer(parent(), focus), status: 'unemployed' } });
  assert.equal(advanceParentCareer(unemployed(0), { random: () => .4 }).career.status, 'unemployed');
  assert.equal(advanceParentCareer(unemployed(5), { random: () => .4 }).career.status, 'employed');
  assert.equal(advanceParentCareer(unemployed(5), { random: () => .9 }).career.status, 'unemployed');
  const struggling = unemployed(5);
  struggling.stats = { health: 1, stability: 1 };
  assert.equal(advanceParentCareer(struggling, { random: () => .4 }).career.status, 'unemployed');
});

test('career progress is bounded and promotions are separate from ordinary growth', () => {
  const person = parent({ lifestyle: 9.9 });
  person.career = initialParentCareer(person, 5);
  const promoted = advanceParentCareer(person, { random: sequence(.9, 0, 1), normal: () => 3 });
  assert.equal(promoted.career.progress, 10);
  assert.equal(promoted.event.title, 'A parent moved ahead at work');
  person.career = { ...person.career, progress: 1.1 };
  assert.equal(advanceParentCareer(person, { random: sequence(0, 1) }).career.progress, 1);
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
