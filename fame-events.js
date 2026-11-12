import { fameOpportunityChance, hasFame } from './fame.js?v=event-effect-lines';

// Fictional encounters unlocked by public recognition. Rewards describe the
// encounter itself; routine praise, inconvenience and money never imply a
// permanent mental-stability change. The engine owns rolls and the yearly cap.
const outcome = value => ({ modifiers: {}, years: 0, ...value });
const choice = (id, label, description, effects = {}) => outcome({ id, label, description, ...effects });
const event = value => outcome({ category: 'Fame', minAge: 6, maxAge: 84,
  requiresFame: true, baseChance: .01, kind: 'positive', ...value });
const invitation = (kind, name, description) => event({
  id: `fame_${kind}_offer`, name, description, requiresFame: false, fameKind: kind,
  // Cause metadata only; invitation rates use the dedicated weighted formula.
  statFactors: [['social', 'high'], ['attractiveness', 'high']],
  minAge: kind === 'personal' ? 13 : 6, maxAge: kind === 'personal' ? 84 : 17,
  choices: [
    choice('pursue', { sports: 'Pursue the sports invitation', extracurricular: 'Pursue the activity invitation', personal: 'Become a public face' }[kind],
      'You accept the public opportunity and begin building a reputation.', { fameAction: 'start', fameKind: kind }),
    choice('decline', { sports: 'Keep sport out of the spotlight', extracurricular: 'Keep the activity private', personal: 'Keep your public profile private' }[kind],
      'You decline the invitation and keep your life out of the spotlight.'),
  ],
});

export const FAME_EVENTS = [
  invitation('sports', 'A scout wants to introduce you', 'After watching your sporting performances and how you handle the crowd, a scout offers to introduce you to a wider audience.'),
  invitation('extracurricular', 'Your activity catches a producer\'s eye', 'Your recent activity performances catch a local producer\'s attention. They offer to feature your work and introduce you to a wider audience.'),
  invitation('personal', 'An invitation to become a public face', 'A community campaign notices how comfortably you connect with people and present yourself, and invites you to become one of its public faces.'),

  event({ id: 'fame_local_profile', name: 'A reporter follows your preparations',
    description: 'A local reporter spends an afternoon watching you prepare for an appearance. Answering their follow-up questions gives you interview practice, and the published profile brings a paid invitation.',
    statChanges: { social: .25 }, fameSupport: .2 }),
  event({ id: 'fame_school_assembly', name: 'Questions at a school assembly', maxAge: 17,
    description: 'Your school asks you to speak at assembly about your experience. Pupils send questions in advance, and a teacher coaches you through clear, engaging answers.',
    statChanges: { social: .3 }, fameChange: .2 }),
  event({ id: 'fame_youth_clinic', name: 'A coach asks you to demonstrate', minAge: 10, fameKinds: ['sports'],
    description: 'A coach invites you to demonstrate drills at a youth sports clinic. Repeating the movements sharpens your training, explaining them develops your communication, and the club pays an appearance fee.',
    statChanges: { strength: .2, social: .2 }, fameSupport: .25 }),
  event({ id: 'fame_sports_equipment', name: 'A supplier fits you with training equipment', minAge: 8, fameKinds: ['sports'],
    description: 'A sports supplier offers properly fitted equipment and a coached practice session in return for permission to use your photograph in its shop.',
    statChanges: { strength: .15 }, fameSupport: .35 }),
  event({ id: 'fame_technique_mentor', name: 'A specialist reviews your technique', minAge: 8, fameKinds: ['sports'],
    description: 'A retired competitor recognizes you at training and offers a session reviewing slow-motion recordings. You practice the corrected movements and learn how to read the analysis.',
    statChanges: { strength: .3, intelligence: .1 } }),
  event({ id: 'fame_regional_showcase', name: 'A place in a regional sports showcase', minAge: 8, fameKinds: ['sports'],
    description: 'A regional organizer invites you to a showcase and a question session with spectators. Your performance reaches a new audience, and speaking afterward gives you practice with unfamiliar people.',
    statChanges: { social: .2 }, fameChange: .35 }),
  event({ id: 'fame_activity_collaboration', name: 'A showcase pairs you with another participant', minAge: 8, fameKinds: ['extracurricular'],
    description: 'An activity showcase pairs you with another recognized participant to devise an original demonstration. Working out a shared presentation develops your ideas and conversation, and the organizer covers your materials.',
    statChanges: { creativity: .3, social: .15 }, fameSupport: .2 }),
  event({ id: 'fame_activity_feature', name: 'An editor commissions a demonstration', fameKinds: ['extracurricular'],
    description: 'A youth magazine asks you to turn your activity experience into an illustrated demonstration. Planning an original presentation develops your creativity, and publication brings new readers to your work.',
    statChanges: { creativity: .2 }, fameChange: .25 }),
  event({ id: 'fame_training_bursary', name: 'A foundation funds advanced coaching', minAge: 13, fameKinds: ['sports', 'extracurricular'], baseChance: .008,
    description: 'A foundation offers coaching fees after reviewing your public work. The coach helps you analyze unfamiliar techniques, and the grant covers expenses your household had been meeting.',
    statChanges: { intelligence: .25 }, fameSupport: .35 }),
  event({ id: 'fame_equipment_loan', name: 'An organizer loans specialist equipment', fameKinds: ['extracurricular'],
    description: 'An event organizer offers a long-term loan of the specialist equipment you normally borrow or rent for your activity, removing a recurring expense while you continue participating.',
    fameSupport: .4 }),
  event({ id: 'fame_campaign_host', name: 'A campaign asks you to greet visitors', minAge: 13, fameKinds: ['personal'],
    description: 'A community campaign hires you to welcome visitors at a public launch. The coordinator coaches you through introductions and difficult questions before you meet the crowd.',
    statChanges: { social: .35 }, fameSupport: .2 }),
  event({ id: 'fame_portrait_session', name: 'A photographer prepares your campaign portraits', minAge: 13, fameKinds: ['personal'],
    description: 'A campaign photographer coaches your posture, grooming and expression during a portrait session. Talking through the shots develops your ease with the crew, and the published portraits reach a wider audience.',
    statChanges: { attractiveness: .2, social: .15 }, fameChange: .2 }),
  event({ id: 'fame_radio_questions', name: 'A producer rehearses a radio interview', minAge: 13,
    description: 'A radio producer invites you onto a local program and rehearses questions with you. Checking the background facts and learning to give concise answers build your reasoning and communication.',
    statChanges: { intelligence: .15, social: .3 } }),
  event({ id: 'fame_panel_moderator', name: 'A host lets you lead the questions', minAge: 13,
    description: 'At a public discussion, the host invites you to lead a short question session. They show you how to invite quieter speakers in and bring wandering answers back to the topic.',
    statChanges: { social: .25 } }),
  event({ id: 'fame_charity_appearance', name: 'A fundraiser invites you to welcome supporters', minAge: 10,
    description: 'A local fundraiser asks you to welcome supporters and explain the project at its open day. Practicing with the volunteers improves your conversation, and a business offers to cover future appearance expenses.',
    statChanges: { social: .25 }, fameSupport: .2 }),
  event({ id: 'fame_community_film', name: 'A film crew invites your ideas', minAge: 13,
    description: 'A community film crew asks you to appear in a short project and help devise a scene. Developing the scene together stretches your imagination and gives you practice negotiating creative choices.',
    statChanges: { creativity: .25, social: .15 } }),
  event({ id: 'fame_overseas_exchange', name: 'An overseas audience sends questions', minAge: 13,
    description: 'An overseas youth group recognizes your work and arranges a supervised video exchange. You research their questions beforehand and learn to explain unfamiliar ideas across a language barrier.',
    statChanges: { intelligence: .15, social: .2 } }),
  event({ id: 'fame_hosted_visit', name: 'A festival covers your visit', minAge: 18,
    description: 'A festival invites you for a public conversation and pays for travel and accommodation. Meeting the hosts and discussing your experience give you more practice with unfamiliar groups.',
    statChanges: { social: .15 }, fameSupport: .4 }),
  event({ id: 'fame_meal_support', name: 'A catering team helps plan your meals', minAge: 13,
    description: 'An appearance organizer arranges balanced meals during a busy run of engagements. The catering team helps you keep regular eating habits and covers meals you would otherwise buy.',
    statChanges: { health: .2 }, fameSupport: .3 }),
  event({ id: 'fame_sports_recovery', name: 'A physiotherapist joins your training team', minAge: 8, fameKinds: ['sports'],
    description: 'A sports program offers regular physiotherapy sessions as part of its support for your appearances. Guided recovery exercises improve your movement and help you train without neglecting physical care.',
    statChanges: { health: .25, strength: .15 }, fameSupport: .2 }),
  event({ id: 'fame_boundary_coaching', name: 'An experienced guest coaches your introductions', minAge: 13,
    description: 'An experienced guest notices you struggling to end long conversations after appearances. They practice polite introductions and boundaries with you, then recommend you for a small paid engagement.',
    statChanges: { social: .2 }, fameSupport: .3 }),
  event({ id: 'fame_peer_support', name: 'A regular support group for public figures', minAge: 13, baseChance: .008,
    description: 'After months of feeling isolated by public attention, you join a regular peer-support group with a trained facilitator. Repeated conversations help you process the strain and rebuild dependable connections.',
    statChanges: { stability: .25, social: .15 } }),

  event({ id: 'fame_persistent_harassment', name: 'Repeated threats reach your home', minAge: 13, minFame: 6, baseChance: .005, kind: 'negative',
    description: 'Someone repeatedly sends threatening messages and turns up near your home. A safety team intervenes, but weeks of fear and withdrawn outings leave lasting distress and interrupt social contact.',
    statChanges: { stability: -.4, social: -.15 } }),
  event({ id: 'fame_sponsor_withdrawal', name: 'A sponsor ends its local program', baseChance: .008, kind: 'negative',
    description: 'A sponsor closes its local program and ends the payments covering your appearances. You must meet those recurring costs again while looking for replacement support.',
    fameSupport: -.4 }),
  event({ id: 'fame_misquoted_interview', name: 'An edited interview leaves out your explanation', minAge: 13, baseChance: .007, kind: 'negative',
    description: 'A published interview cuts away the explanation behind one answer. Invitations are withdrawn while you contact organizers to correct the account, reducing your reach and opportunities to meet people.',
    statChanges: { social: -.2 }, fameChange: -.4 }),
  event({ id: 'fame_overbooked_appearances', name: 'A crowded appearance schedule disrupts sleep', minAge: 10, baseChance: .008, kind: 'negative',
    description: 'An organizer schedules a run of appearances with early departures and late journeys home. Repeated lost sleep and irregular meals take a physical toll before the schedule is corrected.',
    statChanges: { health: -.25 } }),
  event({ id: 'fame_damaged_equipment', name: 'Equipment is damaged in transit', fameKinds: ['sports', 'extracurricular'], baseChance: .007, kind: 'negative',
    description: 'Equipment sent ahead for a public demonstration arrives damaged. Replacing the uncovered items uses funds that had been supporting your regular activities.',
    fameSupport: -.3 }),

  event({ id: 'fame_campaign_contract', name: 'A national campaign offers a contract', minAge: 13, minFame: 4, baseChance: .007, kind: 'neutral',
    description: 'A campaign offers you either a traveling series of appearances or a smaller local agreement. The larger contract reaches more people but means weeks of irregular meals and sleep.', choices: [
      choice('travel', 'Accept the traveling campaign', 'You work through the traveling schedule, meeting new audiences and earning regular support while the disruption takes a physical toll.',
        { statChanges: { social: .2, health: -.2 }, fameChange: .6, fameSupport: .6 }),
      choice('local', 'Choose the local agreement', 'You make a smaller set of local appearances and keep your usual routine around them.',
        { statChanges: { social: .1 }, fameChange: .2, fameSupport: .2 }),
    ] }),
  event({ id: 'fame_documentary_request', name: 'A documentary team requests access', minAge: 10, baseChance: .007, kind: 'neutral',
    description: 'A documentary team wants to follow your preparations for an upcoming appearance. You can take part in the interviews or help create a short demonstration that keeps your daily life private.', choices: [
      choice('interview', 'Take part in the interviews', 'You practice explaining your experience on camera. The finished interviews reach a larger audience and include an appearance fee.',
        { statChanges: { social: .3 }, fameChange: .5, fameSupport: .3 }),
      choice('demonstration', 'Make a focused demonstration', 'You work with the crew to devise an engaging demonstration and agree to show only the finished piece.',
        { statChanges: { creativity: .25 }, fameChange: .2 }),
    ] }),
  event({ id: 'fame_publicist_offer', name: 'A publicist offers to manage requests', minAge: 13, minFame: 3, baseChance: .007, kind: 'neutral',
    description: 'A publicist offers to arrange interviews and answer appearance requests for a recurring fee. You can hire them or learn to manage a smaller list yourself.', choices: [
      choice('hire', 'Hire the publicist', 'Coached interviews improve your communication and reach, while the recurring fee reduces the support available to your household.',
        { statChanges: { social: .2 }, fameChange: .3, fameSupport: -.2 }),
      choice('manage', 'Manage a smaller list yourself', 'You learn to compare requests, check agreements and speak directly with organizers.',
        { statChanges: { intelligence: .25, social: .15 } }),
    ] }),
];

export function fameEventChances(state, stats = state?.stats) {
  const inactive = !state || state.alive === false || state.ended || state.needsSuccession;
  return FAME_EVENTS.map(entry => {
    let chance = 0;
    if (!inactive && state.age >= entry.minAge && state.age <= entry.maxAge) {
      if (!entry.requiresFame) chance = fameOpportunityChance(state, entry.fameKind, stats);
      else if (hasFame(state) && (!entry.fameKinds || entry.fameKinds.includes(state.fame.kind))
          && state.fame.rating >= (entry.minFame ?? 0) && state.fame.rating <= (entry.maxFame ?? 10)) {
        chance = Math.min(.12, entry.baseChance * 3 * (.5 + Math.max(0, Math.min(10, state.fame.rating)) / 10));
      }
    }
    return { id: entry.id, name: entry.name, chance };
  });
}
