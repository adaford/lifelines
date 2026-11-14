// Render-only recognition of exact stories saved before the concise-copy update.
// These frozen templates never enter the event catalog or change saved data.
import { causalBridge } from './life-event-bridges-history.js?v=short-events-toddler-order';
const LIFE_EVENT_STAGES = [{"id":"infant","min":0,"max":1,"place":"At a baby group"},{"id":"toddler","min":2,"max":4,"place":"At a preschool play session"},{"id":"child","min":5,"max":12,"place":"At a neighborhood children's program"},{"id":"teen","min":13,"max":17,"place":"At a youth program"},{"id":"adult","min":18,"max":39,"place":"At a community program"},{"id":"midlife","min":40,"max":64,"place":"At a local adult learning center"},{"id":"senior","min":65,"max":120,"place":"At an older adults' community group"}];
const activities = {
  intelligence: [
    'Repeated picture and sound games give {who} practice recognizing patterns and anticipating what comes next.',
    'Regular sorting games and picture stories give {who} practice solving small problems.',
    'Patient explanations and hands-on projects help {who} practice unfamiliar school concepts.',
    'A tutor works through practical research projects with {who}, building reasoning through repeated practice.',
    'A practical course gives {who} regular practice comparing information and solving unfamiliar problems.',
    'A small adult class gives {who} regular practice learning unfamiliar practical skills.',
    'A local-history class gives {who} regular practice comparing sources and learning unfamiliar material.',
  ],
  strength: [
    'Supported reaching, rolling and floor play give {who} regular opportunities to build strength.',
    'Supervised climbing and balance games give {who} regular practice using growing muscles.',
    'A welcoming movement group gives {who} regular, age-appropriate exercise.',
    'Supervised conditioning sessions give {who} a gradual, manageable strength-building routine.',
    'A beginner exercise group helps {who} build strength with a manageable routine.',
    'An adapted exercise group helps {who} build strength without rushing the workload.',
    'An accessible exercise group offers {who} gradual strength and balance practice with appropriate support.',
  ],
  attractiveness: [
    'A caregiver receives practical help keeping up gentle daily care, and visible skin irritation gradually settles.',
    'A caregiver receives practical help keeping up gentle daily care, and visible skin irritation gradually settles.',
    'Practical help with a consistent personal-care routine lets persistent skin irritation gradually settle.',
    'Practical help with a consistent personal-care routine improves the condition of skin and hair over time.',
    'A manageable personal-care routine improves the condition of skin and hair over time.',
    'Practical help makes a consistent personal-care routine possible, improving the condition of skin and hair.',
    'Practical help makes gentle personal care easier to maintain, improving the condition of skin and hair.',
  ],
  social: [
    'Regular face-to-face play with familiar adults gives {who} practice exchanging sounds and expressions.',
    'Small, supported play sessions give {who} practice taking turns and communicating needs.',
    'Repeated cooperative games give {who} practice listening, taking turns and explaining ideas.',
    'A welcoming small group gives {who} regular practice talking and listening without being rushed.',
    'A welcoming discussion group gives {who} regular practice listening and expressing ideas.',
    'Regular small-group meetings give {who} practice listening and expressing ideas with unfamiliar people.',
    'Regular small-group visits give {who} opportunities to exchange stories and keep conversational skills in use.',
  ],
  creativity: [
    'Regular sensory play with safe textures and sounds gives {who} room to try new combinations.',
    'Regular pretend play and simple art sessions give {who} room to invent and experiment.',
    'A recurring art group gives {who} practice inventing stories and trying unfamiliar materials.',
    'A recurring creative workshop gives {who} time to experiment and revise ideas.',
    'Regular making sessions give {who} practice experimenting with materials and developing original ideas.',
    'A recurring creative workshop gives {who} practice experimenting beyond familiar routines.',
    'An accessible art group gives {who} practice experimenting with materials and developing new ideas.',
  ],
  health: [
    'Practical help gives the caregiver a more reliable feeding and rest routine, improving {poss} physical wellbeing.',
    'Practical help makes regular meals, rest and safe active play easier to maintain for {who}.',
    'Practical support makes regular meals, rest and safe active play easier to maintain for {who}.',
    'Practical support helps {who} maintain regular meals, rest and manageable physical activity.',
    'Practical support helps {who} keep regular meals, rest and manageable physical activity in the week.',
    'Practical support helps {who} maintain regular meals, sleep and manageable physical activity.',
    'Practical support helps {who} maintain regular meals, rest and physical activity suited to current needs.',
  ],
  stability: [
    'The same trusted helper returns throughout a difficult stretch, giving {who} dependable, soothing care and a lasting sense of safety.',
    'A trusted helper returns regularly during a difficult stretch, providing {who} with dependable reassurance and a lasting sense of safety.',
    'The same trusted adult checks in throughout a difficult stretch, helping {who} rebuild a lasting sense of safety and support.',
    'A trusted support worker checks in throughout a difficult stretch, helping {who} build coping strategies and a dependable support network.',
    'Regular support through a difficult stretch helps {who} build coping strategies and a dependable support network.',
    'Regular support through a difficult stretch helps {who} build coping strategies and a dependable support network.',
    'A reliable visitor offers support through a difficult stretch, helping {who} rebuild a lasting sense of safety and connection.',
  ],
  lifestyle: [
    'A community fund covers transport and lends useful baby equipment to the household for the coming year.',
    'A community fund covers transport and lends useful play equipment to the household for the coming year.',
    'A community fund covers transport and essential program materials for the household for the coming year.',
    'A community fund covers transport and essential program materials for the household for the coming year.',
    'A community fund covers transport and lends essential equipment to the household for the coming year.',
    'A community fund covers transport and lends essential equipment to the household for the coming year.',
    'A community fund covers accessible transport and lends practical household equipment for the coming year.',
  ],
  relationship: [
    'Regular supported visits make care more responsive and strengthen the bond between you and {name}.',
    'Regular supported playtime helps you and {name} become more comfortable together.',
    'Regular shared projects give you and {name} time to listen to each other and build trust.',
    'Regular shared activities give you and {name} time to listen to each other and build trust.',
    'Regular shared activities give you and {name} time to listen to each other and build trust.',
    'Regular shared activities give you and {name} time to listen to each other and build trust.',
    'Regular shared visits give you and {name} time to listen to each other and strengthen your bond.',
  ],
};
const missed = {
  intelligence: ['picture and sound games', 'sorting games and stories', 'guided learning sessions', 'supported study sessions', 'a practical course', 'an adult learning course', 'a local-history class'],
  strength: ['supported floor play', 'supervised movement games', 'regular active play', 'a conditioning group', 'an exercise group', 'an adapted exercise group', 'accessible strength and balance sessions'],
  attractiveness: ['help with daily skin care', 'help with daily skin care', 'help maintaining a personal-care routine', 'help maintaining a personal-care routine', 'a manageable personal-care routine', 'help maintaining a personal-care routine', 'help maintaining gentle daily care'],
  social: ['face-to-face play', 'supported group play', 'cooperative games', 'small-group conversations', 'a discussion group', 'small-group meetings', 'regular group visits'],
  creativity: ['sensory play sessions', 'pretend-play sessions', 'an art group', 'a creative workshop', 'regular making sessions', 'a creative workshop', 'an accessible art group'],
  health: ['practical feeding and rest support', 'practical help with meals and rest', 'help maintaining meals and rest', 'help maintaining meals and rest', 'practical help with meals and rest', 'practical help with meals and rest', 'practical help with meals and rest'],
  stability: ['a familiar, reassuring helper', 'a trusted regular helper', 'a trusted adult\'s regular support', 'a trusted support worker', 'a dependable support network', 'a dependable support network', 'a trusted regular visitor'],
  lifestyle: ['loaned baby equipment', 'loaned play equipment', 'transport and program materials', 'transport and program materials', 'transport and equipment', 'transport and equipment', 'accessible transport and equipment'],
  relationship: ['regular supported visits', 'shared playtime', 'shared projects', 'time to talk together', 'shared activities', 'shared activities', 'regular shared visits'],
};
const loss = {
  intelligence: 'Months with fewer opportunities to practice unfamiliar problems leave learning skills less well exercised.',
  strength: 'Months of missed movement leave muscles less conditioned.',
  attractiveness: 'Personal care repeatedly slips during the disruption, and visible skin irritation persists.',
  social: 'Months of missed exchanges leave conversational and turn-taking skills less well practiced.',
  creativity: 'Months with fewer opportunities to experiment leave creative skills less well practiced.',
  health: 'The prolonged disruption repeatedly interferes with meals and rest, wearing down physical wellbeing.',
  stability: 'The loss of dependable support lasts for months during an already difficult stretch, eroding a lasting sense of safety and ability to cope.',
  lifestyle: 'Replacement costs and travel charges stretch the household\'s access to everyday resources for the coming year.',
  relationship: 'Repeated missed contact over several months puts distance between you and {name}.',
};
function sourceStory(source, positive, young) {
  const good = {
    intelligence: young ? '{poss} interest in repeated patterns helps a caregiver choose an engaging activity' : '{poss} quick grasp of a demonstration catches a facilitator\'s attention',
    strength: young ? '{poss} confident movement helps a caregiver find a suitable activity' : '{poss} ability to manage the physical activities catches a facilitator\'s attention',
    attractiveness: young ? 'after repeated adult comments about {poss} appearance, a worker helps the caregiver keep visits welcoming' : 'after repeated unkind comments about {poss} appearance, a worker offers practical support',
    social: young ? '{poss} readiness to engage in back-and-forth play helps a facilitator find a welcoming place' : '{poss} ease in conversation helps make a connection with a facilitator',
    creativity: young ? '{poss} inventive play catches a facilitator\'s attention' : '{poss} inventive contribution catches an organizer\'s attention',
    health: '{poss} sustained physical wellbeing makes regular attendance possible',
    stability: young ? '{poss} ability to settle with reassurance makes a regular group comfortable to attend' : '{poss} ability to cope with unfamiliar situations makes a regular group comfortable to attend',
    lifestyle: 'the household can manage transport and program costs',
    relationship: 'the trust between you and {name} makes a shared invitation easier to accept',
  };
  const bad = {
    intelligence: young ? 'the facilitator moves through unfamiliar games too quickly for {who}, without offering a simpler explanation' : 'the program\'s complicated instructions are hard for {who} to follow, and the provider offers no clearer explanation',
    strength: young ? 'the venue\'s physical setup is difficult for {who} to manage, and the provider does not adapt it' : 'the venue\'s physical demands are difficult for {who} to manage, and no accessible alternative is offered',
    attractiveness: young ? 'adults repeatedly avoid visits with {who} because of unfair appearance judgments' : 'an organizer repeatedly excludes {who} because of unfair appearance judgments',
    social: young ? 'the group rushes unfamiliar social exchanges without helping {who} settle into them' : 'misunderstood conversations repeatedly disrupt {poss} attendance, and no one helps clarify the arrangements',
    creativity: young ? 'the activities rely on inventing unfamiliar games, and the group offers {who} no help getting started' : 'the sessions demand improvised ideas, and no structured starting point is offered when {who} struggles',
    health: 'recurring illness repeatedly keeps {who} away, and the provider offers no way to participate from home',
    stability: young ? 'persistent distress makes the busy sessions overwhelming for {who}, and no quieter support is arranged' : 'persistent distress makes the busy sessions overwhelming for {who}, and no quieter support is arranged',
    lifestyle: 'the household cannot afford the transport and program charges, and no fee relief is available',
    relationship: 'unresolved friction between you and {name} repeatedly disrupts shared arrangements',
  };
  return (positive ? good : bad)[source];
}
function makeStory(source, target, positive, stage, family) {
  const index = LIFE_EVENT_STAGES.indexOf(stage);
  const young = stage.max < 5;
  const subject = family ? '{name}' : 'you';
  const possessive = family ? "{name}'s" : 'your';
  const bridge = causalBridge(source, target, positive, young);
  const care = young ? ' A caregiver handles the arrangements and takes part throughout.' : '';
  const shared = family && target === 'lifestyle' ? ' The transport and equipment are shared for visits with you, so the resource change applies to your household.' : '';
  const story = positive
    ? `${stage.place}, ${sourceStory(source, true, young)}. ${bridge}${care} ${activities[target][index]}${shared}`
    : `${stage.place}, ${sourceStory(source, false, young)}. ${bridge}${care} As a result, ${subject} repeatedly miss${family ? 'es' : ''} ${missed[target][index]}. ${loss[target]}${shared}`;
  return story.replaceAll('visible skin irritation', '{poss} visible skin irritation').replaceAll('condition of skin and hair', 'condition of {poss} skin and hair')
    .replaceAll('{who}', subject).replaceAll('{poss}', possessive);
}

const cache = new WeakMap();
export function legacyLifeEventCopies(event) {
  if (!event?.descriptionsByStage || !/^life_(personal|parent|partner|child|sibling)_/.test(event.id || '')) return [];
  if (cache.has(event)) return cache.get(event);
  const [, role, source, target, kind] = event.id.split('_');
  const copies = LIFE_EVENT_STAGES.filter(stage => event.descriptionsByStage[stage.id]).map(stage => ({
    ...event,
    description: makeStory(source, target, kind === 'support', stage, role !== 'personal'),
    shortDescription: event.descriptionsByStage[stage.id],
    copyOnly: true,
  }));
  cache.set(event, copies);
  return copies;
}
