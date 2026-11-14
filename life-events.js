// Ordinary, fictional experiences connecting causes to different consequences.
// A definition has age-specific stories, rather than seven near-identical rolls.
import { causalBridge } from './life-event-bridges.js?v=short-events-toddler-order';
export const LIFE_EVENT_STATS = ['intelligence', 'strength', 'attractiveness', 'social', 'creativity', 'health', 'stability', 'lifestyle'];
export const LIFE_EVENT_STAGES = [
  { id: 'infant', min: 0, max: 1, place: 'At a baby group' },
  { id: 'toddler', min: 2, max: 4, place: 'At a preschool play session' },
  { id: 'child', min: 5, max: 12, place: 'At a neighborhood children\'s program' },
  { id: 'teen', min: 13, max: 17, place: 'At a youth program' },
  { id: 'adult', min: 18, max: 39, place: 'At a community program' },
  { id: 'midlife', min: 40, max: 64, place: 'At a local adult learning center' },
  { id: 'senior', min: 65, max: 120, place: 'At an older adults\' community group' },
];
const sourceLabels = {
  intelligence: 'Learning', strength: 'Movement', attractiveness: 'Appearance', social: 'Communication',
  creativity: 'Imagination', health: 'Health', stability: 'Coping', lifestyle: 'Access', relationship: 'Trust',
};
const targetLabels = {
  intelligence: 'learning sessions', strength: 'movement sessions', attractiveness: 'personal care', social: 'shared conversations',
  creativity: 'creative sessions', health: 'a healthier routine', stability: 'dependable support', lifestyle: 'household access', relationship: 'time together',
};
// Every target describes a repeated experience. Small interruptions and prizes
// never become unexplained permanent mental-stability changes.
const activities = {
  intelligence: [
    'A caregiver uses regular picture and sound games to strengthen {poss} pattern recognition.',
    'A caregiver uses sorting games and stories to develop {poss} problem-solving skills.',
    'Guided projects give {who} regular practice solving unfamiliar problems.',
    'Regular research projects help {who} develop reasoning skills.',
    'A practical course helps {who} learn to compare information and solve problems.',
    'An adult class gives {who} regular practice learning unfamiliar skills.',
    'A local-history class helps {who} practice comparing sources and learning new material.',
  ],
  strength: [
    'A caregiver supports regular reaching, rolling and floor play to build {poss} strength.',
    'A caregiver supervises climbing and balance games to build {poss} strength.',
    'Regular active play helps {who} build strength.',
    'Supervised conditioning helps {who} build strength gradually.',
    'A beginner exercise group helps {who} build strength gradually.',
    'Adapted exercise helps {who} build strength at a manageable pace.',
    'Supported strength and balance exercises help {who} build strength safely.',
  ],
  attractiveness: [
    'A caregiver receives daily-care help, allowing {poss} skin irritation to settle gradually.',
    'A caregiver receives daily-care help, allowing {poss} skin irritation to settle gradually.',
    'Consistent personal care lets {poss} skin irritation settle gradually.',
    'Consistent personal care improves the condition of {poss} skin and hair.',
    'Consistent personal care improves the condition of {poss} skin and hair.',
    'Practical help sustains personal care, improving {poss} skin and hair.',
    'Practical help sustains gentle daily care, improving {poss} skin and hair.',
  ],
  social: [
    'A caregiver arranges regular face-to-face play, helping {who} practice sounds and expressions.',
    'A caregiver supports regular playtime, helping {who} practice turn-taking and communicating needs.',
    'Cooperative games give {who} regular practice listening and explaining ideas.',
    'A welcoming group gives {who} regular conversation practice without rushing.',
    'Regular group discussions help {who} practice listening and expressing ideas.',
    'Regular group meetings help {who} practice listening and expressing ideas.',
    'Regular group visits keep {poss} conversational skills in use.',
  ],
  creativity: [
    'A caregiver offers regular sensory play, helping {who} explore sounds and textures.',
    'A caregiver offers regular pretend play and art, helping {who} invent and experiment.',
    'Regular art sessions help {who} practice inventing stories and exploring materials.',
    'Regular workshops give {who} practice experimenting and revising ideas.',
    'Regular making sessions help {who} develop original ideas.',
    'Regular workshops help {who} experiment beyond familiar routines.',
    'Accessible art sessions help {who} explore materials and develop new ideas.',
  ],
  health: [
    'Practical help lets a caregiver maintain feeding and rest, improving {poss} health.',
    'Practical help lets a caregiver maintain meals, rest and safe play, improving {poss} health.',
    'Regular meals, rest and safe active play improve {poss} physical wellbeing.',
    'Regular meals, rest and manageable exercise improve {poss} physical wellbeing.',
    'Regular meals, rest and manageable exercise improve {poss} physical wellbeing.',
    'Regular meals, sleep and manageable exercise improve {poss} physical wellbeing.',
    'Regular meals, rest and suitable activity improve {poss} physical wellbeing.',
  ],
  stability: [
    'A caregiver and trusted helper provide months of reassurance, strengthening {poss} lasting sense of safety.',
    'A caregiver and trusted helper provide months of reassurance, strengthening {poss} lasting sense of safety.',
    'A trusted adult provides regular support through difficult months, helping {who} feel secure again.',
    'Regular support through difficult months helps {who} develop lasting coping skills.',
    'Regular support through difficult months helps {who} develop lasting coping skills.',
    'Regular support through difficult months helps {who} develop lasting coping skills.',
    'A reliable visitor offers support through difficult months, helping {who} feel secure and connected.',
  ],
  relationship: [
    'A caregiver arranges regular supported visits, strengthening the bond between you and {name}.',
    'A caregiver supports regular shared play, strengthening the bond between you and {name}.',
    'Regular shared projects help you and {name} listen to each other and build trust.',
    'Regular shared activities help you and {name} listen to each other and build trust.',
    'Regular shared activities help you and {name} listen to each other and build trust.',
    'Regular shared activities help you and {name} listen to each other and build trust.',
    'Regular shared visits strengthen the bond between you and {name}.',
  ],
};
const missed = {
  intelligence: ['picture games', 'sorting games', 'guided learning', 'supported study', 'a practical course', 'an adult class', 'a local-history class'],
  strength: ['supported floor play', 'supervised movement games', 'active play', 'conditioning sessions', 'an exercise group', 'adapted exercise', 'supported strength exercises'],
  social: ['face-to-face play', 'supported playtime', 'cooperative games', 'group conversations', 'group discussions', 'group meetings', 'group visits'],
  creativity: ['sensory play', 'pretend play', 'art sessions', 'creative workshops', 'making sessions', 'creative workshops', 'accessible art sessions'],
  relationship: ['supported visits', 'shared playtime', 'shared projects', 'time together', 'shared activities', 'shared activities', 'shared visits'],
};
const lostPractice = {
  intelligence: '{poss} learning skills less practiced', strength: '{poss} muscles less conditioned',
  social: '{who} less practiced in communication', creativity: '{who} less practiced at exploring ideas',
};
function consequence(target, positive, index, young, family) {
  if (target === 'lifestyle') {
    const scope = family ? ' for shared visits' : '';
    if (positive) return `${young ? 'A caregiver arranges' : 'The program provides'} transport and equipment${scope}, easing your household costs for the coming year.`;
    return `${young ? 'A caregiver pays' : 'You pay'} for replacement transport and equipment${scope}, straining your household resources for the coming year.`;
  }
  if (positive) return activities[target][index];
  if (lostPractice[target]) return young
    ? `A caregiver cannot arrange ${missed[target][index]}, leaving ${lostPractice[target]} over months.`
    : `Months without ${missed[target][index]} leave ${lostPractice[target]}.`;
  if (target === 'attractiveness') return young
    ? 'Without practical help, a caregiver struggles with daily care, and {poss} skin irritation persists.'
    : 'Personal care repeatedly slips, and {poss} skin irritation persists.';
  if (target === 'health') return young
    ? 'A caregiver struggles to maintain meals and rest without help, weakening {poss} health over months.'
    : 'Months of disrupted meals and rest weaken {poss} physical wellbeing.';
  if (target === 'stability') return young
    ? "Despite a caregiver's efforts, months without a trusted helper erode {poss} lasting sense of safety."
    : 'Months without dependable support during an already difficult stretch erode {poss} sense of safety and ability to cope.';
  return young
    ? `A caregiver cannot sustain ${missed[target][index]}, gradually weakening the bond between you and {name}.`
    : 'Months of missed contact put distance between you and {name}.';
}
function makeStory(source, target, positive, stage, family) {
  const index = LIFE_EVENT_STAGES.indexOf(stage);
  const young = stage.max < 5;
  const bridge = causalBridge(source, target, positive, young);
  const opening = bridge[0].toLowerCase() + bridge.slice(1);
  return `${stage.place}, ${opening} ${consequence(target, positive, index, young, family)}`
    .replaceAll('{who}', family ? '{name}' : 'you').replaceAll('{poss}', family ? "{name}'s" : 'your');
}
function entry(source, target, positive, subjectType) {
  const family = Boolean(subjectType);
  const amount = positive ? .18 : -.18;
  const stages = LIFE_EVENT_STAGES.filter(stage => !['parent', 'partner'].includes(subjectType) || stage.min >= 18);
  const descriptionsByStage = Object.fromEntries(stages.map(stage => [stage.id, makeStory(source, target, positive, stage, family)]));
  return {
    id: `life_${subjectType || 'personal'}_${source}_${target}_${positive ? 'support' : 'setback'}`,
    name: `${sourceLabels[source]} and ${targetLabels[target]}: ${positive ? 'a supported place' : 'an interrupted place'}`,
    category: family ? 'Life with family' : 'Everyday opportunities and barriers',
    description: descriptionsByStage[stages[0].id], descriptionsByStage,
    ...(family ? { subjectType } : {}),
    minAge: stages[0].min, maxAge: family ? 120 : 84,
    ...(subjectType === 'partner' || subjectType === 'child' ? { minPlayerAge: 18 } : {}),
    kind: positive ? 'positive' : 'negative', severity: target === 'stability' ? 'moderate' : 'minor',
    // Tiny per-entry base rates keep the full matrix from dominating older
    // encounters. Supplemental entries do not multiply low-stat hazard floors.
    baseChance: family ? .00012 : .0003, supplemental: true,
    ...(source === 'relationship' ? { relationshipFactor: positive ? 'high' : 'low' }
      : { statFactors: [[source, positive && source !== 'attractiveness' ? 'high' : 'low']] }),
    years: target === 'lifestyle' ? 1 : 0, modifiers: {},
    ...(target === 'lifestyle' ? { householdLifestyle: amount }
      : target === 'relationship' ? { relationship: amount }
        : family ? { subjectChanges: { [target]: amount } } : { statChanges: { [target]: amount } }),
  };
}
function matrix(subjectType) {
  const stats = subjectType ? [...LIFE_EVENT_STATS, 'relationship'] : LIFE_EVENT_STATS;
  return stats.flatMap(source => stats.filter(target => target !== source).flatMap(target => [entry(source, target, true, subjectType), entry(source, target, false, subjectType)]));
}
export const LIFE_PERSONAL_EVENTS = matrix();
export const LIFE_FAMILY_EVENTS = ['parent', 'partner', 'child', 'sibling'].flatMap(matrix);

// Call when an event occurs. History keeps that captured story forever; a
// birthday or later reload must never reinterpret an old occurrence.
export function eventDescriptionAtAge(event, age) {
  const stage = LIFE_EVENT_STAGES.find(stage => age >= stage.min && age <= stage.max);
  return event?.descriptionsByStage?.[stage?.id] || event?.description || '';
}
