import { legacyFocusValue } from './focus-rules.js?v=event-causality';
import { gradeScore } from './school.js?v=event-causality';
// Fictional household events. Subject changes affect the named person; player
// changes affect you. Relationship changes affect your bond with that person.
// Individual rolls join the ordinary event pool and share its five-event cap.
const low = key => [key, 'low'];
const high = key => [key, 'high'];
export const FAMILY_EVENT_RATE_MULTIPLIER = 2.5;
const option = (id, label, description, outcome) => ({ id, label, description, ...outcome });
function permanentOutcome(outcome) {
  const result = { ...outcome, playerChanges: { ...outcome.playerChanges }, modifiers: {}, years: outcome.focusLimits ? outcome.years || 1 : 0 };
  for (const [key, amount] of Object.entries(outcome.modifiers || {})) result.playerChanges[key] = (result.playerChanges[key] || 0) + amount;
  if (outcome.lifestyle) result.playerChanges.stability = (result.playerChanges.stability || 0) + outcome.lifestyle * .2;
  result.playerChanges = Object.fromEntries(Object.entries(result.playerChanges).filter(([, amount]) => amount));
  if (!Object.keys(result.playerChanges).length) delete result.playerChanges;
  delete result.lifestyle;
  if (outcome.choices) result.choices = outcome.choices.map(permanentOutcome);
  return result;
}
const group = (subjectType, defaults, entries) => entries.map(event => permanentOutcome({
  subjectType, category: subjectType === 'parent' ? 'Growing up at home' : subjectType === 'partner' ? 'Your relationship' : 'Your children',
  years: 0, modifiers: {}, kind: 'positive', ...defaults, ...event,
}));

export const FAMILY_EVENTS = [
  ...group('parent', { minAge: 18, maxAge: 200, minPlayerAge: 5, maxPlayerAge: 17, baseChance: .009 }, [
    { id: 'household_school_proud_parent', name: 'Your report goes on the fridge', description: '{name} pins up your excellent school report and tells relatives about your work, giving you both a lift.', conditions: ['excellentSchoolGrade'], subjectChanges: { stability: .25 }, playerChanges: { stability: .2, social: .15 }, relationship: .25 },
    { id: 'household_school_celebration', name: 'A report-card celebration', description: '{name} celebrates your excellent report with a homemade meal and an afternoon at the park together.', conditions: ['excellentSchoolGrade'], subjectChanges: { stability: .2 }, playerChanges: { health: .15, stability: .15 }, relationship: .2 },
    { id: 'household_school_disappointment', name: 'A difficult report-card conversation', description: '{name} reacts angrily to your poor report, and an evening of criticism leaves you both upset.', conditions: ['poorSchoolGrade'], kind: 'negative', subjectChanges: { stability: -.2 }, playerChanges: { stability: -.25, health: -.1 }, relationship: -.25 },
    { id: 'household_school_grounding', name: 'Grounded after a poor report', description: '{name} grounds you after a poor school report, cutting back your time with friends for the coming year.', conditions: ['poorSchoolGrade'], kind: 'negative', subjectChanges: { stability: -.1 }, playerChanges: { stability: -.2, social: -.15 }, relationship: -.2, years: 1, focusLimits: { standard: { social: 1 } } },
  ]),
  ...group('parent', { minAge: 18, maxAge: 200, minPlayerAge: 0, maxPlayerAge: 17, baseChance: .00005 }, [
    { id: 'household_parent_abandonment', name: 'Abandons you', description: '{name} leaves the family. Your remaining parent takes over; otherwise an adult relative adopts you.', kind: 'negative', years: 3, modifiers: { stability: -3, social: -1.5, health: -1 }, relationship: -10 },
  ]),
  // These are experiences of the child, not responsibilities placed on them.
  // Stability represents the caregiver's current stress and capacity; support
  // can help an overwhelmed parent recover, and no outcome is inevitable.
  ...group('parent', { minAge: 0, maxAge: 120, minPlayerAge: 0, maxPlayerAge: 17, baseChance: .012 }, [
    { id: 'household_parent_sleepless', name: 'Night works outside your window', description: 'Overnight road repairs carry through the thin windows of your small home. With no quiet room to move to, you and {name} keep waking; lost sleep leaves home tense and exhausting.', maxPlayerAge: 2, kind: 'negative', statFactors: [low('lifestyle')], subjectChanges: { stability: -.3, health: -.1 }, playerChanges: { stability: -.2 } },
    { id: 'household_parent_soothing', name: 'A noisy reunion, a quiet corner', description: 'When a family reunion overwhelms you, {name} takes you somewhere quiet and helps you greet relatives one at a time.', maxPlayerAge: 2, statFactors: [high('stability')], playerChanges: { stability: .25, social: .15 }, relationship: .3 },
    { id: 'household_parent_overloaded', name: 'An argument on the way home', description: '{name} snaps at you after you both miss the bus, and the argument continues all the way home.', minPlayerAge: 3, kind: 'negative', statFactors: [low('stability')], relationshipFactor: 'low', subjectChanges: { stability: -.15 }, playerChanges: { stability: -.3 }, relationship: -.2 },
    { id: 'household_parent_routine', name: 'A family nurse visits', description: '{name} arranges a home visit with a family nurse, who helps make your meals and bedtime more comfortable.', statFactors: [high('stability')], playerChanges: { stability: .25, health: .1 }, relationship: .2 },
    { id: 'household_parent_illness', name: 'A parent catches the flu', description: '{name} catches the flu and has to stay in bed; you worry and miss spending time together.', kind: 'negative', statFactors: [low('health')], subjectChanges: { health: -.35 }, playerChanges: { stability: -.2 } },
    { id: 'household_parent_support', name: 'A neighbor brings meals', description: 'After {name} struggles to keep up with meals and laundry, a neighbor brings cooked food and helps with chores for a few weeks, giving you both a calmer home.', statFactors: [low('stability')], subjectChanges: { stability: .5, health: .1 }, playerChanges: { stability: .2 }, relationship: .15 },
    { id: 'household_parent_stories', name: 'A museum lends you a discovery box', description: '{name} borrows a museum box of fossils and replicas, then spends afternoons helping you investigate and draw them.', minPlayerAge: 3, statFactors: [high('creativity')], relationshipFactor: 'high', playerChanges: { intelligence: .2, creativity: .2 }, relationship: .25 },
    { id: 'household_parent_listening', name: 'A snack after a falling-out', description: 'After an argument with a friend, {name} takes you out for a snack and helps you work out what to say next.', minPlayerAge: 3, statFactors: [high('social')], relationshipFactor: 'high', subjectChanges: { stability: .1 }, playerChanges: { social: .2, stability: .2 }, relationship: .3 },
  ]),
  ...group('partner', { minAge: 18, maxAge: 84, baseChance: .008 }, [
    { id: 'household_partner_learning', name: 'A tutor offers extra sessions', description: 'After {name} works through a difficult problem at an open class, a volunteer tutor invites them to a small study group with more challenging material.', statFactors: [high('intelligence')], subjectChanges: { intelligence: .35, stability: .15 } },
    { id: 'household_partner_illness', name: 'A chest infection', description: '{name} develops a chest infection and needs treatment and rest; canceled plans and worry wear on you.', kind: 'negative', statFactors: [low('health')], subjectChanges: { health: -.5 }, playerChanges: { stability: -.2 } },
    { id: 'household_partner_friend', name: 'Helping a friend move out', description: 'When a friend moves after a breakup, {name} brings people together to help and organizes small dinners afterward. You join in and get to know the group better.', statFactors: [high('social')], subjectChanges: { social: .3, stability: .2 }, playerChanges: { social: .15 } },
    { id: 'household_partner_creative', name: 'A stall at the makers market', description: 'A market organizer offers {name} a stall and advice on their handmade work; seeing people enjoy it lifts your spirits too.', statFactors: [high('creativity')], subjectChanges: { creativity: .3 }, lifestyle: 1, years: 1 },
    { id: 'household_partner_fitness', name: 'A trainer offers a guest pass', description: 'After watching {name} handle a demanding exercise at a community session, a trainer offers a guest pass and coaches them through further strength training.', statFactors: [high('strength')], subjectChanges: { strength: .3, health: .2 } },
    { id: 'household_partner_confidence', name: 'An invitation to a portrait exhibition', description: 'A photographer invites {name} to appear in a neighborhood portrait exhibition; you attend together and meet the other participants.', statFactors: [high('attractiveness')], subjectChanges: { stability: .3, social: .15 }, relationship: .15 },
    { id: 'household_partner_insecurity', name: 'An unkind comment in a group photo', description: 'Someone posts a cruel comment about {name} beneath a group photo, and they ask how you see them.', kind: 'neutral', statFactors: [low('attractiveness')], choices: [
      option('reassure', 'Make time for reassurance', 'You remind {name} of the things you value about them.', { subjectChanges: { stability: .4 }, relationship: .4 }),
      option('space', 'Respect a little space', '{name} takes time to reflect while you clear your own head.', { subjectChanges: { stability: .2 }, playerChanges: { stability: .25 }, relationship: .1 }),
    ] },
    { id: 'household_partner_argument', name: 'Two invitations, one argument', description: 'You and {name} accept invitations for the same evening. Already overwhelmed, {name} struggles to discuss a compromise, and the scheduling clash becomes an argument.', kind: 'negative', statFactors: [low('stability')], relationshipFactor: 'low', choices: [
      option('listen', 'Slow down and listen', 'You and {name} make room to explain what is really wrong.', { subjectChanges: { social: .2 }, playerChanges: { social: .2 }, relationship: .6 }),
      option('dismiss', 'Insist on your own view', 'You avoid a difficult conversation, but {name} feels unheard.', { subjectChanges: { stability: -.2 }, playerChanges: { stability: .1 }, relationship: -.6 }),
    ] },
    { id: 'household_partner_offer', name: 'A suspicious business seminar', description: '{name} is persuaded by an easy-money business seminar and wants to sign up without understanding how the business works. The organizer avoids questions about what participants actually do.', kind: 'neutral', statFactors: [low('intelligence')], choices: [
      option('review', 'Look through it together', 'Careful questions help {name} recognize the weak points.', { subjectChanges: { intelligence: .35 }, playerChanges: { intelligence: .15 }, relationship: .2 }),
      option('back', 'Back the plan', 'The promise falls short, leaving {name} discouraged and your household stretched.', { subjectChanges: { intelligence: .15, stability: -.3 }, playerChanges: { stability: -.2 }, lifestyle: -1, years: 2 }),
    ] },
    { id: 'household_partner_overwhelmed', name: 'Hospital visits become overwhelming', description: 'While a relative is in hospital, {name} struggles to cope with visits and worry. Sleep unravels, and with little time to support each other, exhaustion and canceled plans strain your relationship.', kind: 'negative', statFactors: [low('stability')], neglectFactors: ['family'], subjectChanges: { health: -.3, stability: -.3 }, playerChanges: { stability: -.2 }, relationship: -.2 },
    { id: 'household_partner_forgotten', name: 'A missed dinner reservation', description: 'You forget a dinner reservation with {name}, leaving them waiting alone and both of you upset.', kind: 'negative', neglectFactors: ['family'], subjectChanges: { stability: -.2 }, playerChanges: { stability: -.15 }, relationship: -.6 },
    { id: 'household_partner_weekend', name: 'A weekend together at a lakeside cabin', description: 'You and {name} make time for a weekend together and accept an invitation to stay at a friend\'s lakeside cabin.', focusFactors: ['family'], choices: [
      option('outdoors', 'Go somewhere active', 'A shared outing gives you and {name} a chance to move and reconnect.', { subjectChanges: { strength: .2 }, playerChanges: { strength: .2 }, relationship: .4 }),
      option('quiet', 'Enjoy a quiet day', 'You and {name} settle into an easy day without a demanding schedule.', { subjectChanges: { stability: .25 }, playerChanges: { stability: .25 }, relationship: .3 }),
    ] },
    { id: 'household_partner_open', name: 'A letter in an old box', description: 'Finding an old letter prompts {name} to tell you about a painful friendship they had never discussed, bringing you closer.', focusFactors: ['family'], statFactors: [high('social')], subjectChanges: { stability: .2 }, playerChanges: { stability: .2 }, relationship: .5 },
    { id: 'household_partner_hobby', name: 'Two places in a pottery class', description: 'After seeing {name} experiment with clay at an open session, a pottery teacher offers two places in a beginners class. {name} invites you along.', statFactors: [high('creativity')], choices: [
      option('join', 'Try it together', 'Learning alongside {name} brings a little shared excitement.', { subjectChanges: { creativity: .3 }, playerChanges: { creativity: .2 }, relationship: .5 }),
      option('encourage', 'Encourage their own interest', '{name} enjoys having room to explore, while you pursue a subject of your own.', { subjectChanges: { creativity: .4 }, playerChanges: { intelligence: .2 }, relationship: .1 }),
    ] },
    { id: 'household_partner_shared_load', name: 'Housework piles up before a visit', description: 'Housework has kept being put off, and guests are due while laundry and dirty dishes pile up. {name} asks you to rethink how you share the chores.', kind: 'neutral', conditions: ['married'], neglectFactors: ['family'], choices: [
      option('share', 'Take on more together', 'The extra effort tires you, but {name} feels supported.', { subjectChanges: { stability: .3 }, playerChanges: { health: -.2 }, relationship: .5 }),
      option('help', 'Arrange some outside help', 'A simpler routine helps you and {name} breathe, with some worry about relying on outside help.', { subjectChanges: { stability: .3 }, playerChanges: { stability: .3 }, relationship: .2, lifestyle: -1, years: 1 }),
    ] },
    { id: 'household_partner_anniversary', name: 'A surprise anniversary picnic', description: '{name} packs a picnic with photos from your time together, and you spend the afternoon revisiting those memories.', conditions: ['togetherYear'], focusFactors: ['family'], relationshipFactor: 'high', subjectChanges: { stability: .3 }, playerChanges: { stability: .3 }, relationship: .5 },
  ]),
  ...group('child', { minAge: 0, maxAge: 84, baseChance: .009 }, [
    { id: 'household_child_sleep', name: 'No quiet room away from the barking', description: 'A dog next door barks through the thin walls of your small home. With no quieter sleeping space available, {name} keeps waking and you both become exhausted.', maxAge: 2, kind: 'negative', statFactors: [low('lifestyle')], subjectChanges: { health: -.2 }, playerChanges: { stability: -.25 } },
    { id: 'household_child_words', name: 'A relative brings harder picture games', description: 'During a visit, {name} quickly picks up a picture-naming game. A relative who used to teach starts bringing harder word games and picture books, giving you a welcome hand too.', minAge: 1, maxAge: 2, statFactors: [high('intelligence')], subjectChanges: { intelligence: .3, social: .2 }, playerChanges: { stability: .15 } },
    { id: 'household_child_curiosity', name: 'Imaginative play at a nature exhibit', description: 'At a neighborhood nature exhibit, {name} turns the animal models into make-believe games and eagerly joins the hands-on sessions.', minAge: 1, maxAge: 5, statFactors: [high('creativity')], choices: [
      option('explore', 'Join the hands-on sessions', 'You help {name} investigate the displays and make animal models, though the busy visits take energy.', { subjectChanges: { intelligence: .3, creativity: .2 }, playerChanges: { stability: -.1 }, relationship: .3 }),
      option('routine', 'Visit during a quiet hour', 'A short, unhurried visit gives you and {name} a reassuring outing together.', { subjectChanges: { stability: .3 }, playerChanges: { stability: .15 }, relationship: .2 }),
    ] },
    { id: 'household_child_tumble', name: 'A playground tumble', description: '{name} struggles to hold their weight on the playground climbing bars, loses their grip and falls. They need a gentler stretch of days to recover.', minAge: 3, maxAge: 12, kind: 'negative', statFactors: [low('strength')], subjectChanges: { health: -.4, strength: -.2 }, playerChanges: { stability: -.1 } },
    { id: 'household_child_friend', name: 'A new neighbor becomes a playmate', description: '{name} greets a new child next door and draws them into a game. They begin inviting each other over, and a friendship takes shape.', minAge: 3, maxAge: 17, statFactors: [high('social')], subjectChanges: { social: .3, stability: .15 } },
    { id: 'household_child_left_out', name: 'Left off the party invitations', description: 'After struggling to join conversations with classmates, {name} learns about a party they were not invited to and comes home upset.', minAge: 5, maxAge: 17, kind: 'negative', statFactors: [low('social')], choices: [
      option('listen', 'Listen without rushing', 'Feeling heard helps {name} recover some confidence.', { subjectChanges: { stability: .4 }, relationship: .5 }),
      option('activity', 'Find a welcoming activity', '{name} gets another chance to connect, while you make room to help.', { subjectChanges: { social: .3 }, playerChanges: { stability: -.1 }, relationship: .3 }),
    ] },
    { id: 'household_child_grades', name: 'Invited to lead a class demonstration', description: 'After {name} explains a tricky science problem clearly, a teacher asks them to demonstrate an experiment to classmates. Preparing and presenting it builds skills and makes you proud.', minAge: 6, maxAge: 17, statFactors: [high('intelligence')], focusFactors: ['family'], subjectChanges: { intelligence: .25, social: .2 }, playerChanges: { stability: .2 } },
    { id: 'household_child_school', name: 'A teacher calls about missed work', description: '{name} has trouble understanding several assignments and leaves them unfinished. A teacher contacts you to arrange extra explanations and a support plan.', minAge: 6, maxAge: 17, kind: 'neutral', statFactors: [low('intelligence')], neglectFactors: ['family'], choices: [
      option('home', 'Work through it together', 'Patient practice helps {name} understand, even if the evenings become demanding.', { subjectChanges: { intelligence: .4 }, playerChanges: { stability: -.1 }, relationship: .4 }),
      option('teacher', 'Ask the teacher for support', '{name} gets a clearer plan and feels less alone with the problem.', { subjectChanges: { intelligence: .3, stability: .15 }, relationship: .2 }),
    ] },
    { id: 'household_child_art', name: 'The library exhibits their artwork', description: 'The library selects a picture by {name} for its exhibition and invites them to an artist-led workshop.', minAge: 6, maxAge: 17, statFactors: [high('creativity')], subjectChanges: { creativity: .3, stability: .2 } },
    { id: 'household_child_team', name: 'A chance to join the team', description: 'After {name} performs strongly in a school practice, a coach invites them to try the team, adding another demand to the calendar.', minAge: 6, maxAge: 17, statFactors: [high('strength')], choices: [
      option('support', 'Support the extra practice', '{name} gains strength and confidence while you help manage the busy schedule.', { subjectChanges: { strength: .4, health: .1 }, playerChanges: { stability: -.15 }, relationship: .3 }),
      option('balance', 'Keep the schedule lighter', '{name} finds more room to study and unwind.', { subjectChanges: { intelligence: .2, stability: .2 }, relationship: .15 }),
    ] },
    { id: 'household_child_peer', name: 'A dare leaves them overwhelmed', description: 'When friends dare {name} to sneak into a boarded-up building, they become overwhelmed and struggle to stand by their own judgment. They ask you to help them handle the pressure.', minAge: 13, maxAge: 17, kind: 'neutral', statFactors: [low('stability')], choices: [
      option('talk', 'Talk through the pressure', '{name} practices making a decision without losing their own voice.', { subjectChanges: { stability: .3, social: .1 }, relationship: .4 }),
      option('strict', 'Set a firm boundary', 'The immediate risk passes, but {name} feels shut out of the conversation.', { subjectChanges: { health: .2, social: -.3 }, playerChanges: { stability: .1 }, relationship: -.4 }),
    ] },
    { id: 'household_child_image', name: 'Classmates mock a school photo', description: 'Classmates make fun of a school photo of {name}, leaving them reluctant to be photographed again.', minAge: 10, maxAge: 17, kind: 'neutral', statFactors: [low('attractiveness')], choices: [
      option('confidence', 'Talk about self-worth', '{name} begins to separate their worth from an unfair comparison.', { subjectChanges: { stability: .35 }, relationship: .3 }),
      option('expression', 'Explore their own style', '{name} finds a way to express themselves that feels more comfortable.', { subjectChanges: { attractiveness: .2, stability: .1 }, playerChanges: { creativity: .15 }, relationship: .2 }),
    ] },
    { id: 'household_child_illness', name: 'A stomach bug strikes', description: '{name} catches a stomach bug, and arranging care while they recover leaves you worried.', kind: 'negative', statFactors: [low('health')], subjectChanges: { health: -.5 }, playerChanges: { stability: -.2 } },
    { id: 'household_child_gratitude', name: 'A handmade thank-you card', description: '{name} surprises you with a handmade card about time you spent together, starting a warm conversation over the memories.', minAge: 3, focusFactors: ['family'], relationshipFactor: 'high', subjectChanges: { stability: .25 }, playerChanges: { stability: .3, social: .2 }, relationship: .3 },
    { id: 'household_child_direction', name: 'Anxious about a possible new direction', description: 'After receiving a course offer, {name} loses sleep worrying about whether to change direction. They ask for your help sorting through the uncertainty.', minAge: 18, kind: 'neutral', statFactors: [low('stability')], choices: [
      option('explore', 'Explore possibilities together', '{name} considers unfamiliar options while you make time for a long conversation.', { subjectChanges: { intelligence: .35, creativity: .2 }, playerChanges: { stability: -.1 }, relationship: .4 }),
      option('listen', 'Let them talk it through', '{name} feels steadier after being heard without pressure.', { subjectChanges: { stability: .35, social: .2 }, playerChanges: { stability: .1 }, relationship: .35 }),
    ] },
    { id: 'household_child_milestone', name: 'Invited to teach a community class', description: 'After {name} helps visitors understand a subject at an open day, a community center asks them to teach a beginner class. Preparing lessons and meeting learners gives them good news to share with you.', minAge: 18, statFactors: [high('intelligence')], subjectChanges: { intelligence: .2, social: .2 }, playerChanges: { stability: .25 }, relationship: .2 },
  ]),
  ...group('parent', { minAge: 0, maxAge: 120, minPlayerAge: 0, maxPlayerAge: 17, baseChance: .006 }, [
    { id: 'household_parent_park_walks', name: 'A family activity group opens', description: 'A new park group invites {name} to walks and age-appropriate movement games with you, giving you both more exercise.', maxPlayerAge: 4, subjectChanges: { health: .15 }, playerChanges: { health: .2, strength: .15 }, relationship: .15 },
    { id: 'household_parent_cooking', name: 'A family cooking workshop', description: '{name} sets aside time to take you to a community cooking workshop, where you measure ingredients and invent a filling together.', minPlayerAge: 3, focusFactors: ['family'], subjectChanges: { stability: .1 }, playerChanges: { intelligence: .15, creativity: .2 }, relationship: .2 },
    { id: 'household_parent_shift_change', name: 'A relative needs evening help', description: 'An injured relative asks {name} for help each evening, leaving less time for you and more strain at home.', minPlayerAge: 2, kind: 'negative', subjectChanges: { stability: -.15 }, playerChanges: { stability: -.2 }, relationship: -.2 },
    { id: 'household_parent_missed_pickup', name: 'A missed school pickup', description: 'Overwhelmed and distracted by a difficult day, {name} loses track of the time and arrives late to collect you from school.', minPlayerAge: 5, kind: 'negative', statFactors: [low('stability')], subjectChanges: { stability: -.2 }, playerChanges: { stability: -.15 }, relationship: -.2 },
  ]),
  ...group('partner', { minAge: 18, maxAge: 84, minPlayerAge: 18, baseChance: .006 }, [
    { id: 'household_partner_language_course', name: 'A language course', description: '{name} invites you to evening language classes.', focusFactors: ['family'], choices: [
      option('join', 'Attend together', 'Classes replace some evenings with friends.', { subjectChanges: { intelligence: .35 }, playerChanges: { intelligence: .35 }, relationship: .3, years: 1, focusLimits: { standard: { social: 2 } } }),
      option('separate', 'Keep separate schedules', '{name} takes the course while you keep your plans.', { subjectChanges: { intelligence: .35 }, playerChanges: { social: .15 }, relationship: .1 }),
    ] },
    { id: 'household_partner_roof_leak', name: 'A leaking roof', description: 'A roof leak disrupts your home with {name}.', kind: 'negative', baseChance: .005, choices: [
      option('repair', 'Handle the repairs together', 'Repair work uses your spare evenings.', { subjectChanges: { strength: .2, stability: -.15 }, playerChanges: { strength: .25, health: -.15 }, relationship: .25, years: 1, focusLimits: { standard: { social: 1 } } }),
      option('hire', 'Hire repair help', 'Outside help protects your time, though arranging it is stressful.', { subjectChanges: { stability: .15 }, playerChanges: { stability: .15 }, lifestyle: -1, years: 1 }),
    ] },
    { id: 'household_partner_travel_plans', name: 'Two trips on the same dates', description: '{name} is invited on an art retreat during a history tour you want to take, and you need to decide whether to travel together.', kind: 'neutral', choices: [
      option('together', 'Plan a shared trip', 'A longer trip leaves less time for work.', { subjectChanges: { stability: .2 }, playerChanges: { creativity: .25 }, relationship: .4, years: 1, focusLimits: { standard: { work: 3 } } }),
      option('apart', 'Travel separately', 'You pursue different interests and spend less time together.', { subjectChanges: { creativity: .3 }, playerChanges: { intelligence: .3 }, relationship: -.2 }),
    ] },
    { id: 'household_partner_lost_keys', name: 'Lost house keys', description: '{name} loses the house keys during a busy day.', kind: 'negative', subjectChanges: { stability: -.2 }, playerChanges: { stability: -.15 }, relationship: -.1 },
  ]),
  ...group('child', { minAge: 0, maxAge: 17, minPlayerAge: 18, baseChance: .007 }, [
    { id: 'household_child_care_closure', name: 'Childcare closes', description: "{name}'s childcare provider closes unexpectedly.", maxAge: 4, kind: 'negative', choices: [
      option('home', 'Provide care yourself', 'Caregiving leaves less time for work.', { subjectChanges: { stability: .2 }, playerChanges: { stability: -.15 }, relationship: .3, years: 1, focusLimits: { standard: { work: 2 } } }),
      option('replace', 'Arrange replacement care', 'New care protects your schedule, though the transition brings worry.', { subjectChanges: { social: .2 }, relationship: .1, lifestyle: -1, years: 1 }),
    ] },
    { id: 'household_child_science_fair', name: 'A science fair', description: '{name} asks for help building a science exhibit.', minAge: 6, maxAge: 16, choices: [
      option('build', 'Build it together', 'The project takes time from your own activities.', { subjectChanges: { intelligence: .35, creativity: .25 }, playerChanges: { intelligence: .15 }, relationship: .3, years: 1, focusLimits: { standard: { self: 2 } } }),
      option('advise', 'Offer occasional advice', '{name} builds independently with a little guidance.', { subjectChanges: { intelligence: .2, stability: .15 }, relationship: .15 }),
    ] },
    { id: 'household_child_driving', name: 'Driving practice', description: '{name} wants help learning to drive.', minAge: 16, maxAge: 17, kind: 'neutral', choices: [
      option('teach', 'Practice together', 'Driving sessions replace some time with friends.', { subjectChanges: { intelligence: .3, stability: .2 }, playerChanges: { stability: -.1 }, relationship: .35, years: 1, focusLimits: { standard: { social: 2 } } }),
      option('instructor', 'Arrange driving lessons', 'Lessons protect your time, though arranging them is stressful.', { subjectChanges: { intelligence: .35, stability: .15 }, playerChanges: { stability: .15 }, relationship: .1, lifestyle: -1, years: 1 }),
    ] },
    { id: 'household_child_rescued_stray', name: 'A rescued stray', description: '{name} helps a lost animal reach its owner.', minAge: 6, subjectChanges: { social: .25, stability: .15 }, playerChanges: { stability: .1 }, relationship: .15 },
  ]),
];

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
function traitFactor(value, direction) {
  const scaled = direction === 'low' ? (10 - clamp(value, 0, 10)) / 9 : Math.max(0, (clamp(value, 0, 10) - 1) / 9);
  return direction === 'low' ? .08 + 3.68 * scaled ** 2 : .12 + 3.52 * scaled ** 2;
}
function eligible(event, state, subject, playerStats = state.stats) {
  if (subject.alive === false || subject.age < event.minAge || subject.age > event.maxAge) return false;
  if (event.subjectType === 'parent' && subject.abandonedAt !== undefined) return false;
  if (event.id === 'household_parent_abandonment' && !(state.parents || []).includes(subject)) return false;
  if (state.age < (event.minPlayerAge ?? 0) || state.age > (event.maxPlayerAge ?? Infinity)) return false;
  if (event.subjectType === 'partner' && state.age < 18) return false;
  return (event.conditions || []).every(condition => {
    if (condition === 'married') return subject.married === true;
    if (condition === 'dating') return subject.married === false;
    if (condition === 'togetherYear') return subject.yearsTogether >= 1;
    if (condition === 'excellentSchoolGrade') return Boolean(state.school) && gradeScore(state.focus.work, playerStats.intelligence) >= 90;
    if (condition === 'poorSchoolGrade') return Boolean(state.school) && gradeScore(state.focus.work, playerStats.intelligence) < 70;
    return false;
  });
}

// Fictional rarity curve, independent of the ordinary event multiplier. Both
// low stability and a weak relationship increase risk; even the maximum is 2%.
export function abandonmentChance(state, parent) {
  if (!parent || state.age >= 18 || state.ended || state.needsSuccession || parent.alive === false || parent.abandonedAt !== undefined || !(state.parents || []).includes(parent)) return 0;
  const strain = (10 - clamp(parent.stats.stability, 0, 10)) / 10;
  const distance = (10 - clamp(parent.relationship, 0, 10)) / 10;
  return .00005 + .01995 * strain ** 2 * distance ** 2;
}

export function familyEventChances(state, playerStats = state.stats) {
  if (state.ended || state.needsSuccession) return [];
  const actors = [
    ...(state.parents || []).map(person => ({ subjectType: 'parent', person })),
    ...(state.guardian && !(state.parents || []).some(person => person.alive !== false && person.abandonedAt === undefined) ? [{ subjectType: 'parent', person: state.guardian }] : []),
    ...(state.partner ? [{ subjectType: 'partner', person: state.partner }] : []),
    ...(state.children || []).map(person => ({ subjectType: 'child', person })),
  ];
  const focus = Object.fromEntries(['work', 'social', 'family', 'self'].map(key => [key, legacyFocusValue(state.focus?.[key], state.age >= 2 && state.age < 5 && !['work', 'self'].includes(key) ? 2 : 3)]));
  const result = [];
  for (const { subjectType, person } of actors) {
    const eventStats = { ...person.stats, lifestyle: state.lifestyle };
    for (const event of FAMILY_EVENTS.filter(event => event.subjectType === subjectType)) {
      let chance = eligible(event, state, person, playerStats) ? event.id === 'household_parent_abandonment' ? abandonmentChance(state, person) : event.baseChance * FAMILY_EVENT_RATE_MULTIPLIER : 0;
      for (const [key, direction] of event.statFactors || []) chance *= traitFactor(eventStats[key], direction);
      for (const key of event.focusFactors || []) chance *= .4 + focus[key] * .25;
      for (const key of event.neglectFactors || []) chance *= .25 + (5 - focus[key]) * .35;
      if (event.relationshipFactor) chance *= traitFactor(person.relationship ?? 5, event.relationshipFactor);
      result.push({ id: `${event.id}:${person.id}`, eventId: event.id, name: `${person.name}: ${event.name}`, chance: clamp(chance, 0, .12), subjectType, subjectId: person.id });
    }
  }
  return result;
}
