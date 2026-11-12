import test from 'node:test';
import assert from 'node:assert/strict';
import { EVENTS } from '../engine.js';

// These are authored causes, including eligibility formulas. A displayed cause
// may be omitted near neutral, but that must not waive the catalog invariant.
function causalSources(event) {
  const subject = event.subjectType ? 'subject' : 'player';
  const owner = stat => stat === 'lifestyle' ? 'household' : subject;
  const sources = new Set((event.statFactors || []).map(([stat]) => `${owner(stat)}:${stat}`));
  for (const stat of [...Object.keys(event.minStats || {}), ...Object.keys(event.maxStats || {})]) sources.add(`${owner(stat)}:${stat}`);
  if (event.minStability !== undefined || event.maxStability !== undefined) sources.add(`${subject}:stability`);
  if (event.relationshipFactor) sources.add(`${subject}:relationship`);
  if (event.requiresFame || event.minFame !== undefined || event.maxFame !== undefined) sources.add('player:fame');
  if (event.id === 'household_parent_abandonment') {
    sources.add('subject:stability'); sources.add('subject:relationship');
  }
  if (['good_grades', 'poor_grades'].includes(event.id)
      || (event.conditions || []).some(condition => ['excellentSchoolGrade', 'poorSchoolGrade'].includes(condition))) {
    sources.add('player:intelligence');
  }
  // Target-aptitude bounds merely prevent exceeding +/-3. Ongoing learning
  // bonuses, focus, age and job/enrollment prerequisites are separate systems.
  return sources;
}

function directEffects(outcome) {
  const effects = [];
  for (const field of ['statChanges', 'playerChanges', 'modifiers', 'aptitudeChanges']) {
    for (const [stat, amount] of Object.entries(outcome[field] || {})) {
      if (amount) effects.push({ key: `${stat === 'lifestyle' ? 'household' : 'player'}:${stat}`, field });
    }
  }
  for (const [stat, amount] of Object.entries(outcome.subjectChanges || {})) {
    if (amount) effects.push({ key: `subject:${stat}`, field: 'subjectChanges' });
  }
  if (outcome.relationship) effects.push({ key: 'subject:relationship', field: 'relationship' });
  if (outcome.lifestyle) effects.push({ key: 'household:lifestyle', field: 'lifestyle' });
  if (outcome.fameSupport) effects.push({ key: 'household:lifestyle', field: 'fameSupport' });
  if (outcome.fameChange) effects.push({ key: 'player:fame', field: 'fameChange' });
  return effects;
}

test('every event and choice keeps direct rating and aptitude effects off its causal person-stat pairs', () => {
  const violations = [];
  let checked = 0;
  for (const event of EVENTS) {
    const sources = causalSources(event);
    for (const outcome of [event, ...(event.choices || [])]) {
      checked++;
      for (const effect of directEffects(outcome)) {
        if (sources.has(effect.key)) violations.push(`${event.id}${outcome === event ? '' : `/${outcome.id}`}: ${effect.field} changes causal ${effect.key}`);
      }
    }
  }
  assert.ok(checked > 400, 'the invariant covers the full catalog and every decision');
  assert.deepEqual(violations, []);
});

test('a relative can still affect the player in the same stat and unrelated family bonds remain available', () => {
  const support = EVENTS.find(event => event.id === 'household_parent_support');
  assert.ok(support.statFactors.some(([stat]) => stat === 'stability'));
  assert.equal(support.playerChanges.stability, .2, 'a parent’s distress can still affect the player’s wellbeing');
  assert.equal(support.subjectChanges?.stability, undefined);
  assert.equal(support.relationship, .15, 'an unrelated relationship effect remains');
  const stories = EVENTS.find(event => event.id === 'household_parent_stories');
  assert.equal(stories.playerChanges.creativity, .2, 'the parent’s Creativity may develop the child’s Creativity');
  assert.equal(stories.playerChanges.intelligence, .2);
  const abandonment = EVENTS.find(event => event.id === 'household_parent_abandonment');
  assert.equal(abandonment.relationship, undefined, 'a weak bond cannot directly weaken itself through the event');
  assert.equal(abandonment.playerChanges.stability, -3, 'separation still affects the child, a different person');
});

test('rare target-affinity bounds preserve their different-stat rating and learning consequences', () => {
  const rare = EVENTS.filter(event => event.rare);
  assert.equal(rare.length, 84);
  for (const event of rare) {
    const [source] = event.statFactors[0];
    const [[target, amount]] = Object.entries(event.aptitudeChanges);
    assert.notEqual(source, target, event.id);
    assert.equal(event.statChanges[target], amount * .3, event.id);
    assert.equal(event.baseChance, .00015, event.id);
  }
});
