// Fictional household events. Subject changes affect the named person; player
// changes affect you. Relationship changes affect your bond with that person.
// Individual rolls join the ordinary event pool and share its five-event cap.
const low = key => [key, 'low'];
const high = key => [key, 'high'];
const option = (id, label, description, outcome) => ({ id, label, description, ...outcome });
const group = (subjectType, defaults, entries) => entries.map(event => ({
  subjectType, category: subjectType === 'parent' ? 'Growing up at home' : subjectType === 'partner' ? 'Your relationship' : 'Your children',
  years: 0, modifiers: {}, kind: 'positive', ...defaults, ...event,
}));

export const FAMILY_EVENTS = [
  // These are experiences of the child, not responsibilities placed on them.
  // Stability represents the caregiver's current stress and capacity; support
  // can help an overwhelmed parent recover, and no outcome is inevitable.
  ...group('parent', { minAge: 0, maxAge: 120, minPlayerAge: 0, maxPlayerAge: 17, baseChance: .012 }, [
    { id: 'household_parent_sleepless', name: 'Tired days after broken nights', description: '{name} struggles to rest, leaving you both unsettled.', maxPlayerAge: 2, kind: 'negative', statFactors: [low('stability')], subjectChanges: { stability: -.3, health: -.1 }, playerChanges: { stability: -.2 } },
    { id: 'household_parent_soothing', name: 'A familiar, comforting voice', description: '{name} holds you close and responds to your sounds. You begin to recognize the comfort of being heard.', maxPlayerAge: 2, statFactors: [high('stability')], playerChanges: { stability: .25, social: .15 }, relationship: .3 },
    { id: 'household_parent_overloaded', name: 'Stress spills into the day', description: "{name}'s stress makes them impatient and leaves you unsettled.", minPlayerAge: 3, kind: 'negative', statFactors: [low('stability')], relationshipFactor: 'low', subjectChanges: { stability: -.15 }, playerChanges: { stability: -.3 }, relationship: -.2 },
    { id: 'household_parent_routine', name: 'Small routines feel reassuring', description: '{name} makes time for familiar meals, play and rest. Knowing what comes next helps you feel secure.', statFactors: [high('stability')], playerChanges: { stability: .25, health: .1 }, relationship: .2 },
    { id: 'household_parent_illness', name: 'A parent needs time to recover', description: '{name} is ill, and you miss your time together.', kind: 'negative', statFactors: [low('health')], subjectChanges: { health: -.35 }, playerChanges: { stability: -.2 } },
    { id: 'household_parent_support', name: 'Someone helps with the load', description: '{name} accepts help with everyday responsibilities. A little rest makes home feel calmer for both of you.', statFactors: [low('stability')], subjectChanges: { stability: .5, health: .1 }, playerChanges: { stability: .2 }, relationship: .15 },
    { id: 'household_parent_stories', name: 'Time to wonder together', description: '{name} shares stories and follows your questions. Their attention gives your curiosity room to grow.', minPlayerAge: 3, statFactors: [high('creativity')], relationshipFactor: 'high', playerChanges: { intelligence: .2, creativity: .2 }, relationship: .25 },
    { id: 'household_parent_listening', name: 'A parent makes room to listen', description: '{name} listens patiently. You feel understood.', minPlayerAge: 3, statFactors: [high('social')], relationshipFactor: 'high', subjectChanges: { stability: .1 }, playerChanges: { social: .2, stability: .2 }, relationship: .3 },
  ]),
  ...group('partner', { minAge: 18, maxAge: 84, baseChance: .008 }, [
    { id: 'household_partner_learning', name: 'A difficult idea becomes clear', description: '{name} works through a subject that once felt out of reach.', statFactors: [high('intelligence')], subjectChanges: { intelligence: .35, stability: .15 } },
    { id: 'household_partner_illness', name: 'A rough patch of health', description: '{name} has an illness that interrupts familiar routines and worries you.', kind: 'negative', statFactors: [low('health')], subjectChanges: { health: -.5 }, playerChanges: { stability: -.2 } },
    { id: 'household_partner_friend', name: 'A connection that matters', description: '{name} supports a friend through a difficult moment and comes home feeling closer to others.', statFactors: [high('social')], subjectChanges: { social: .3, stability: .2 }, playerChanges: { social: .15 } },
    { id: 'household_partner_creative', name: 'A creative project finds an audience', description: 'Something {name} made receives encouraging attention and brings a little extra comfort to your household.', statFactors: [high('creativity')], subjectChanges: { creativity: .3 }, lifestyle: 1, years: 1 },
    { id: 'household_partner_fitness', name: 'Feeling stronger', description: '{name} reaches a personal movement goal through steady practice.', statFactors: [high('strength')], subjectChanges: { strength: .3, health: .2 } },
    { id: 'household_partner_confidence', name: 'A welcome confidence boost', description: '{name} feels comfortable in their appearance and more at ease around others.', statFactors: [high('attractiveness')], subjectChanges: { stability: .3, social: .15 }, relationship: .15 },
    { id: 'household_partner_insecurity', name: 'A difficult mirror day', description: '{name} is comparing their appearance with others and asks how you see them.', kind: 'neutral', statFactors: [low('attractiveness')], choices: [
      option('reassure', 'Make time for reassurance', 'You remind {name} of the things you value about them.', { subjectChanges: { stability: .4 }, relationship: .4 }),
      option('space', 'Respect a little space', '{name} takes time to reflect while you clear your own head.', { subjectChanges: { stability: .2 }, playerChanges: { stability: .25 }, relationship: .1 }),
    ] },
    { id: 'household_partner_argument', name: 'A conversation turns sharp', description: 'A stressful moment turns a small disagreement with {name} into something bigger.', kind: 'negative', statFactors: [low('stability')], relationshipFactor: 'low', choices: [
      option('listen', 'Slow down and listen', 'You and {name} make room to explain what is really wrong.', { subjectChanges: { social: .2 }, playerChanges: { social: .2 }, relationship: .6 }),
      option('dismiss', 'Insist on your own view', 'You avoid a difficult conversation, but {name} feels unheard.', { subjectChanges: { stability: -.2 }, playerChanges: { stability: .1 }, relationship: -.6 }),
    ] },
    { id: 'household_partner_offer', name: 'An offer that sounds too good', description: '{name} is excited about a promise that has some worrying gaps.', kind: 'neutral', statFactors: [low('intelligence')], choices: [
      option('review', 'Look through it together', 'Careful questions help {name} recognize the weak points.', { subjectChanges: { intelligence: .35 }, playerChanges: { intelligence: .15 }, relationship: .2 }),
      option('back', 'Back the plan', 'The promise falls short, leaving {name} discouraged and your household stretched.', { subjectChanges: { intelligence: .15, stability: -.3 }, playerChanges: { stability: -.2 }, lifestyle: -1, years: 2 }),
    ] },
    { id: 'household_partner_overwhelmed', name: 'Too much to carry', description: '{name} feels overwhelmed, and the strain reaches your shared routines.', kind: 'negative', statFactors: [low('stability')], neglectFactors: ['family'], subjectChanges: { health: -.3, stability: -.3 }, playerChanges: { stability: -.2 }, relationship: -.2 },
    { id: 'household_partner_forgotten', name: 'Time together keeps slipping away', description: 'Plans with {name} repeatedly give way to other demands.', kind: 'negative', neglectFactors: ['family'], subjectChanges: { stability: -.2 }, playerChanges: { stability: -.15 }, relationship: -.6 },
    { id: 'household_partner_weekend', name: 'A free day together', description: 'You and {name} unexpectedly have time to yourselves.', focusFactors: ['family'], choices: [
      option('outdoors', 'Go somewhere active', 'A shared outing gives you and {name} a chance to move and reconnect.', { subjectChanges: { strength: .2 }, playerChanges: { strength: .2 }, relationship: .4 }),
      option('quiet', 'Enjoy a quiet day', 'You and {name} settle into an easy day without a demanding schedule.', { subjectChanges: { stability: .25 }, playerChanges: { stability: .25 }, relationship: .3 }),
    ] },
    { id: 'household_partner_open', name: 'An honest conversation', description: '{name} shares something important, and you both feel better understood.', focusFactors: ['family'], statFactors: [high('social')], subjectChanges: { stability: .2 }, playerChanges: { stability: .2 }, relationship: .5 },
    { id: 'household_partner_hobby', name: 'A new interest', description: '{name} wants to try a hobby and wonders whether you would enjoy it too.', statFactors: [high('creativity')], choices: [
      option('join', 'Try it together', 'Learning alongside {name} brings a little shared excitement.', { subjectChanges: { creativity: .3 }, playerChanges: { creativity: .2 }, relationship: .5 }),
      option('encourage', 'Encourage their own interest', '{name} enjoys having room to explore, while you pursue a subject of your own.', { subjectChanges: { creativity: .4 }, playerChanges: { intelligence: .2 }, relationship: .1 }),
    ] },
    { id: 'household_partner_shared_load', name: 'The household needs a reset', description: 'You and {name} disagree about how the everyday responsibilities are shared.', kind: 'neutral', conditions: ['married'], neglectFactors: ['family'], choices: [
      option('share', 'Take on more together', 'The extra effort tires you, but {name} feels supported.', { subjectChanges: { stability: .3 }, playerChanges: { health: -.2 }, relationship: .5 }),
      option('help', 'Arrange some outside help', 'A simpler routine helps you and {name} breathe, at a cost to your lifestyle.', { subjectChanges: { stability: .3 }, playerChanges: { stability: .3 }, relationship: .2, lifestyle: -1, years: 1 }),
    ] },
    { id: 'household_partner_anniversary', name: 'Remembering how it began', description: 'You and {name} look back on your time together and notice how much you have shared.', conditions: ['togetherYear'], focusFactors: ['family'], relationshipFactor: 'high', subjectChanges: { stability: .3 }, playerChanges: { stability: .3 }, relationship: .5 },
  ]),
  ...group('child', { minAge: 0, maxAge: 84, baseChance: .009 }, [
    { id: 'household_child_sleep', name: 'A run of restless nights', description: '{name} has trouble settling, leaving both of you tired.', maxAge: 2, kind: 'negative', statFactors: [low('stability')], subjectChanges: { health: -.2 }, playerChanges: { stability: -.25 } },
    { id: 'household_child_words', name: 'A new way to communicate', description: '{name} begins using familiar words in an unexpected way.', minAge: 1, maxAge: 2, statFactors: [high('intelligence')], subjectChanges: { intelligence: .3, social: .2 }, playerChanges: { stability: .15 } },
    { id: 'household_child_curiosity', name: 'Everything becomes a question', description: '{name} wants to explore every corner of the day.', minAge: 1, maxAge: 5, statFactors: [high('creativity')], choices: [
      option('explore', 'Explore together', 'Following that curiosity helps {name} discover new things, though it takes energy.', { subjectChanges: { intelligence: .3, creativity: .2 }, playerChanges: { stability: -.1 }, relationship: .3 }),
      option('routine', 'Build discovery into a routine', 'A familiar rhythm helps {name} feel secure while learning at a calmer pace.', { subjectChanges: { stability: .3 }, playerChanges: { stability: .15 }, relationship: .2 }),
    ] },
    { id: 'household_child_tumble', name: 'A playground tumble', description: '{name} has a fall while playing and needs a gentler stretch of days.', minAge: 3, maxAge: 12, kind: 'negative', statFactors: [low('strength')], subjectChanges: { health: -.4, strength: -.2 }, playerChanges: { stability: -.1 } },
    { id: 'household_child_friend', name: 'A friendship takes root', description: '{name} finds someone who shares their sense of fun.', minAge: 3, maxAge: 17, statFactors: [high('social')], subjectChanges: { social: .3, stability: .15 } },
    { id: 'household_child_left_out', name: 'Feeling left out', description: '{name} comes home upset after being excluded by a group.', minAge: 5, maxAge: 17, kind: 'negative', statFactors: [low('social')], choices: [
      option('listen', 'Listen without rushing', 'Feeling heard helps {name} recover some confidence.', { subjectChanges: { stability: .4 }, relationship: .5 }),
      option('activity', 'Find a welcoming activity', '{name} gets another chance to connect, while you make room to help.', { subjectChanges: { social: .3 }, playerChanges: { stability: -.1 }, relationship: .3 }),
    ] },
    { id: 'household_child_grades', name: 'A report worth celebrating', description: '{name} brings home strong results and takes pride in the work behind them.', minAge: 6, maxAge: 17, statFactors: [high('intelligence')], focusFactors: ['family'], subjectChanges: { intelligence: .25, social: .2 }, playerChanges: { stability: .2 } },
    { id: 'household_child_school', name: 'A subject is not clicking', description: '{name} is struggling with schoolwork and worries about falling behind.', minAge: 6, maxAge: 17, kind: 'neutral', statFactors: [low('intelligence')], neglectFactors: ['family'], choices: [
      option('home', 'Work through it together', 'Patient practice helps {name} understand, even if the evenings become demanding.', { subjectChanges: { intelligence: .4 }, playerChanges: { stability: -.1 }, relationship: .4 }),
      option('teacher', 'Ask the teacher for support', '{name} gets a clearer plan and feels less alone with the problem.', { subjectChanges: { intelligence: .3, stability: .15 }, relationship: .2 }),
    ] },
    { id: 'household_child_art', name: 'An idea earns recognition', description: 'An imaginative piece of work makes {name} want to keep creating.', minAge: 6, maxAge: 17, statFactors: [high('creativity')], subjectChanges: { creativity: .3, stability: .2 } },
    { id: 'household_child_team', name: 'A chance to join the team', description: '{name} is invited to try a school team, adding another demand to the calendar.', minAge: 6, maxAge: 17, statFactors: [high('strength')], choices: [
      option('support', 'Support the extra practice', '{name} gains strength and confidence while you help manage the busy schedule.', { subjectChanges: { strength: .4, health: .1 }, playerChanges: { stability: -.15 }, relationship: .3 }),
      option('balance', 'Keep the schedule lighter', '{name} finds more room to study and unwind.', { subjectChanges: { intelligence: .2, stability: .2 }, relationship: .15 }),
    ] },
    { id: 'household_child_peer', name: 'A risky invitation', description: '{name} is feeling pressure to join friends in a plan they are unsure about.', minAge: 13, maxAge: 17, kind: 'neutral', statFactors: [low('stability')], choices: [
      option('talk', 'Talk through the pressure', '{name} practices making a decision without losing their own voice.', { subjectChanges: { stability: .3, social: .1 }, relationship: .4 }),
      option('strict', 'Set a firm boundary', 'The immediate risk passes, but {name} feels shut out of the conversation.', { subjectChanges: { health: .2, social: -.3 }, playerChanges: { stability: .1 }, relationship: -.4 }),
    ] },
    { id: 'household_child_image', name: 'Comparing appearances', description: '{name} feels unhappy about the way they look next to other people.', minAge: 10, maxAge: 17, kind: 'neutral', statFactors: [low('attractiveness')], choices: [
      option('confidence', 'Talk about self-worth', '{name} begins to separate their worth from an unfair comparison.', { subjectChanges: { stability: .35 }, relationship: .3 }),
      option('expression', 'Explore their own style', '{name} finds a way to express themselves that feels more comfortable.', { subjectChanges: { attractiveness: .2, stability: .1 }, playerChanges: { creativity: .15 }, relationship: .2 }),
    ] },
    { id: 'household_child_illness', name: 'A child is under the weather', description: '{name} feels unwell, and caring for them weighs on your mind.', kind: 'negative', statFactors: [low('health')], subjectChanges: { health: -.5 }, playerChanges: { stability: -.2 } },
    { id: 'household_child_gratitude', name: 'Your time matters', description: '{name} finds a small way to show that your attention makes a difference.', minAge: 3, focusFactors: ['family'], relationshipFactor: 'high', subjectChanges: { stability: .25 }, playerChanges: { stability: .3, social: .2 }, relationship: .3 },
    { id: 'household_child_direction', name: 'An adult child feels uncertain', description: '{name} is questioning their next step and asks for your perspective.', minAge: 18, kind: 'neutral', statFactors: [low('stability')], choices: [
      option('explore', 'Explore possibilities together', '{name} considers unfamiliar options while you make time for a long conversation.', { subjectChanges: { intelligence: .35, creativity: .2 }, playerChanges: { stability: -.1 }, relationship: .4 }),
      option('listen', 'Let them talk it through', '{name} feels steadier after being heard without pressure.', { subjectChanges: { stability: .35, social: .2 }, playerChanges: { stability: .1 }, relationship: .35 }),
    ] },
    { id: 'household_child_milestone', name: 'An independent achievement', description: '{name} works through a difficult personal goal and shares the good news.', minAge: 18, statFactors: [high('intelligence')], subjectChanges: { intelligence: .2, social: .2 }, playerChanges: { stability: .25 }, relationship: .2 },
  ]),
];

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
function traitFactor(value, direction) {
  const scaled = direction === 'low' ? (10 - clamp(value, 1, 10)) / 9 : (clamp(value, 1, 10) - 1) / 9;
  return direction === 'low' ? .08 + 3.68 * scaled ** 2 : .12 + 3.52 * scaled ** 2;
}
function eligible(event, state, subject) {
  if (subject.alive === false || subject.age < event.minAge || subject.age > event.maxAge) return false;
  if (state.age < (event.minPlayerAge ?? 0) || state.age > (event.maxPlayerAge ?? Infinity)) return false;
  if (event.subjectType === 'partner' && state.age < 18) return false;
  return (event.conditions || []).every(condition => {
    if (condition === 'married') return subject.married === true;
    if (condition === 'dating') return subject.married === false;
    if (condition === 'togetherYear') return subject.yearsTogether >= 1;
    return false;
  });
}

export function familyEventChances(state) {
  if (state.ended || state.needsSuccession) return [];
  const actors = [
    ...(state.parents || []).map(person => ({ subjectType: 'parent', person })),
    ...(state.partner ? [{ subjectType: 'partner', person: state.partner }] : []),
    ...(state.children || []).map(person => ({ subjectType: 'child', person })),
  ];
  const focus = state.focus || { work: 0, social: 0, family: 0, self: 0 };
  const result = [];
  for (const { subjectType, person } of actors) {
    for (const event of FAMILY_EVENTS.filter(event => event.subjectType === subjectType)) {
      let chance = eligible(event, state, person) ? event.baseChance : 0;
      for (const [key, direction] of event.statFactors || []) chance *= traitFactor(person.stats[key], direction);
      for (const key of event.focusFactors || []) chance *= .4 + focus[key] * .25;
      for (const key of event.neglectFactors || []) chance *= .25 + (5 - focus[key]) * .35;
      if (event.relationshipFactor) chance *= traitFactor(person.relationship ?? 5, event.relationshipFactor);
      result.push({ id: `${event.id}:${person.id}`, eventId: event.id, name: `${person.name}: ${event.name}`, chance: clamp(chance, 0, .12), subjectType, subjectId: person.id });
    }
  }
  return result;
}
