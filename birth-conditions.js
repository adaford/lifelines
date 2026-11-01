// Fictional birth-condition mechanics for Lifelines, not medical descriptions.
// Stat amounts apply once when a new person is created; point effects persist.
const condition = (id, name, description, statChanges = {}, extra = {}) => ({ id, name, description, birthChance: .012, statChanges, ...extra });
export const MAX_BIRTH_CONDITIONS = 5;
export const INHERITANCE_CHANCE_MULTIPLIER = 1.5;
export const BIRTH_CONDITIONS = [
  condition('autism', 'Autism', 'A different pattern of learning and social energy.', { intelligence: .7 }, { focusLimits: { standard: { social: 1 } }, birthChance: .008 }),
  condition('high_energy', 'High energy', 'More energy available for yearly activities.', {}, { focusPoints: 1, group: 'energy' }),
  condition('low_energy', 'Low energy', 'Less energy available for yearly activities.', {}, { focusPoints: -1, group: 'energy' }),
  condition('restless', 'Restless', 'Extra drive makes settling down harder.', { stability: -.4 }, { focusPoints: 1 }),
  condition('unhurried', 'Unhurried', 'A calmer pace leaves less room for plans.', { stability: .4 }, { focusPoints: -1 }),
  condition('quick_learner', 'Quick learner', 'New ideas come readily.', { intelligence: .6 }, { group: 'learning' }),
  condition('slow_learner', 'Slow learner', 'New ideas take more effort.', { intelligence: -.6 }, { group: 'learning' }),
  condition('vivid_imagination', 'Vivid imagination', 'Imagining possibilities comes easily.', { creativity: .6 }, { group: 'imagination' }),
  condition('literal_thinker', 'Literal thinker', 'Concrete ideas are easier than imagined ones.', { creativity: -.4, intelligence: .2 }, { group: 'imagination' }),
  condition('social_ease', 'Social ease', 'Connecting with people feels natural.', { social: .6 }, { group: 'social_ease' }),
  condition('social_hesitancy', 'Social hesitancy', 'New interactions take more effort.', { social: -.6 }, { group: 'social_ease' }),
  condition('robust_constitution', 'Robust constitution', 'A strong starting foundation for health.', { health: .6 }, { group: 'constitution' }),
  condition('delicate_constitution', 'Delicate constitution', 'A more delicate starting foundation for health.', { health: -.6 }, { group: 'constitution' }),
  condition('powerful_build', 'Powerful build', 'Physical strength comes readily.', { strength: .6 }, { group: 'build' }),
  condition('light_build', 'Light build', 'A lighter frame starts with less strength.', { strength: -.6 }, { group: 'build' }),
  condition('striking_features', 'Striking features', 'Distinctive features catch the eye.', { attractiveness: .6 }, { group: 'features' }),
  condition('unassuming_features', 'Unassuming features', 'An appearance that draws less attention.', { attractiveness: -.6 }, { group: 'features' }),
  condition('even_tempered', 'Even tempered', 'Feelings tend to settle smoothly.', { stability: .6 }, { group: 'temperament' }),
  condition('volatile_temper', 'Volatile temper', 'Feelings are harder to settle.', { stability: -.6 }, { group: 'temperament' }),
  condition('sharp_memory', 'Sharp memory', 'Details are easier to retain.', { intelligence: .5 }),
  condition('forgetful', 'Forgetful', 'Details are easier to lose track of.', { intelligence: -.5 }),
  condition('musical_ear', 'Musical ear', 'Patterns of sound spark ideas.', { creativity: .5 }),
  condition('rhythm_challenged', 'Rhythm challenged', 'Patterns of sound take more effort.', { creativity: -.5 }),
  condition('steady_hands', 'Steady hands', 'Fine movement supports making things.', { creativity: .3, strength: .2 }),
  condition('shaky_hands', 'Shaky hands', 'Fine movement takes more care.', { creativity: -.3, strength: -.2 }),
  condition('warm_presence', 'Warm presence', 'Others find your manner welcoming.', { social: .4, attractiveness: .2 }),
  condition('guarded_presence', 'Guarded presence', 'Your manner can be hard to read.', { social: -.4, attractiveness: -.2 }),
  condition('curious_mind', 'Curious mind', 'Questions and possibilities draw your attention.', { intelligence: .3, creativity: .3 }),
  condition('narrow_interests', 'Narrow interests', 'Familiar interests hold your attention.', { intelligence: .2, creativity: -.4 }),
  condition('adventurous', 'Adventurous', 'Novelty invites you in, sometimes at a cost.', { creativity: .4, health: -.2 }),
  condition('cautious', 'Cautious', 'Careful habits leave less room for novelty.', { health: .3, creativity: -.3 }),
  condition('deep_sleeper', 'Deep sleeper', 'Rest comes readily.', { health: .3, stability: .2 }, { group: 'sleep' }),
  condition('light_sleeper', 'Light sleeper', 'Rest is easily interrupted.', { health: -.3, stability: -.2 }, { group: 'sleep' }),
  condition('sensitive_hearing', 'Sensitive hearing', 'Sound feeds imagination but can be tiring.', { creativity: .3, stability: -.3 }),
  condition('sensory_resilience', 'Sensory resilience', 'Busy surroundings are easier to handle.', { stability: .4 }),
  condition('sensory_overload', 'Sensory overload', 'Busy surroundings can be draining.', { stability: -.4 }, { focusLimits: { standard: { social: 3 } } }),
  condition('spatial_talent', 'Spatial talent', 'Shapes and spaces fit together readily.', { intelligence: .4, creativity: .2 }),
  condition('spatial_difficulty', 'Spatial difficulty', 'Shapes and spaces take more work.', { intelligence: -.4, creativity: -.2 }),
  condition('verbal_fluency', 'Verbal fluency', 'Words come readily.', { intelligence: .3, social: .3 }),
  condition('word_finding_difficulty', 'Word-finding difficulty', 'Finding the right words takes time.', { intelligence: -.2, social: -.4 }),
  condition('patient', 'Patient', 'Waiting and repetition are easier to bear.', { stability: .4, social: .2 }),
  condition('impatient', 'Impatient', 'Waiting and repetition wear on you.', { stability: -.4, social: -.2 }),
  condition('competitive', 'Competitive', 'Challenges bring drive and tension.', { strength: .3, stability: -.3 }),
  condition('cooperative', 'Cooperative', 'Shared effort helps connections form.', { social: .4, strength: -.1 }),
  condition('expressive_face', 'Expressive face', 'Your feelings are easy to read.', { social: .3, attractiveness: .2 }),
  condition('unreadable_face', 'Unreadable face', 'Your feelings are less apparent to others.', { social: -.3, stability: .2 }),
  condition('natural_balance', 'Natural balance', 'Balance and coordination come readily.', { strength: .5 }),
  condition('clumsy', 'Clumsy', 'Balance and coordination take more effort.', { strength: -.4, health: -.1 }),
  condition('flexible', 'Flexible', 'Movement feels supple and comfortable.', { strength: .3, health: .2 }),
  condition('stiff_joints', 'Stiff joints', 'Movement needs more care and recovery.', { strength: -.3, health: -.2 }, { focusLimits: { toddler: { work: 3 }, standard: { self: 3 } } }),
  condition('resilient_skin', 'Resilient skin', 'Skin starts with a resilient appearance.', { health: .2, attractiveness: .3 }),
  condition('sensitive_skin', 'Sensitive skin', 'Skin starts needing extra care.', { health: -.2, attractiveness: -.3 }),
  condition('bright_smile', 'Bright smile', 'A smile helps make a warm impression.', { attractiveness: .3, social: .2 }),
  condition('dental_difficulties', 'Dental difficulties', 'Dental care presents an early challenge.', { attractiveness: -.3, health: -.2 }),
  condition('confident_voice', 'Confident voice', 'Speaking carries a natural assurance.', { social: .4 }),
  condition('quiet_voice', 'Quiet voice', 'Being heard takes more effort.', { social: -.4 }),
  condition('strong_endurance', 'Strong endurance', 'Sustained effort comes more readily.', { strength: .3, health: .3 }),
  condition('low_endurance', 'Low endurance', 'Sustained effort is more tiring.', { strength: -.3, health: -.3 }, { focusLimits: { toddler: { work: 3 }, standard: { self: 3 } } }),
  condition('focused_attention', 'Focused attention', 'One task can hold your attention deeply.', { intelligence: .4, social: -.2 }),
  condition('wandering_attention', 'Wandering attention', 'Attention follows new possibilities.', { intelligence: -.3, creativity: .3 }),
  condition('quick_reactions', 'Quick reactions', 'Responding to movement comes readily.', { strength: .4, intelligence: .1 }),
  condition('slow_reactions', 'Slow reactions', 'Responding to movement takes more time.', { strength: -.4, intelligence: -.1 }),
  condition('optimistic', 'Optimistic', 'Possibilities tend to feel hopeful.', { stability: .4, social: .2 }),
  condition('pessimistic', 'Pessimistic', 'Possibilities tend to feel uncertain.', { stability: -.4, social: -.2 }),
  condition('inventive', 'Inventive', 'Unusual solutions come readily.', { creativity: .5, intelligence: .1 }),
  condition('routine_bound', 'Routine bound', 'Predictable routines bring steadiness.', { creativity: -.4, stability: .2 }),
  condition('empathetic', 'Empathetic', 'Other peoples feelings are easy to notice and hard to ignore.', { social: .4, stability: -.2 }),
  condition('emotionally_distant', 'Emotionally distant', 'Distance makes feelings easier to manage but connection harder.', { social: -.4, stability: .2 }),
  condition('vigorous', 'Vigorous', 'Extra drive supports physical activity.', { strength: .2 }, { focusPoints: 1, group: 'stamina_points' }),
  condition('easily_drained', 'Easily drained', 'Everyday effort can use up your reserves.', { strength: -.2 }, { focusPoints: -1, group: 'stamina_points' }),
  condition('self_starter', 'Self-starter', 'Starting a plan takes less effort.', { stability: -.2 }, { focusPoints: 1, group: 'initiative' }),
  condition('slow_to_start', 'Slow to start', 'Starting a plan takes more time.', { stability: .2 }, { focusPoints: -1, group: 'initiative' }),
  condition('bold', 'Bold', 'Speaking up comes easily, even under uncertainty.', { social: .4, health: -.2 }),
  condition('timid', 'Timid', 'Care and hesitation often come together.', { social: -.4, health: .2 }),
  condition('detail_oriented', 'Detail oriented', 'Small details hold your attention.', { intelligence: .4, creativity: -.2 }),
  condition('big_picture_thinker', 'Big-picture thinker', 'Broad possibilities stand out more than details.', { creativity: .4, intelligence: -.2 }),
  condition('natural_storyteller', 'Natural storyteller', 'Stories connect ideas and people.', { creativity: .3, social: .3 }),
  condition('brief_communicator', 'Brief communicator', 'Keeping things short leaves less room for expression.', { creativity: -.3, social: -.2 }),
  condition('calm_under_pressure', 'Calm under pressure', 'Pressure is easier to contain.', { stability: .5 }),
  condition('easily_startled', 'Easily startled', 'Sudden changes unsettle you readily.', { stability: -.5 }),
  condition('strong_appetite', 'Strong appetite', 'A ready appetite supports early physical development.', { health: .3, strength: .2 }),
  condition('low_appetite', 'Low appetite', 'Eating enough can take extra attention.', { health: -.3, strength: -.2 }),
  condition('symmetrical_features', 'Symmetrical features', 'Balanced features shape an early impression.', { attractiveness: .5 }),
  condition('uneven_features', 'Uneven features', 'Uneven features shape an early impression.', { attractiveness: -.5 }),
  condition('radiant_complexion', 'Radiant complexion', 'A clear complexion draws attention.', { attractiveness: .4 }),
  condition('blemish_prone', 'Blemish prone', 'An uneven complexion needs extra care.', { attractiveness: -.4 }),
  condition('analytical', 'Analytical', 'Breaking problems into parts comes readily.', { intelligence: .4, social: -.2 }),
  condition('intuitive', 'Intuitive', 'Instinct helps connections more than formal analysis.', { social: .3, intelligence: -.2 }),
  condition('gentle', 'Gentle', 'A gentle manner supports connection.', { social: .3, strength: -.2 }),
  condition('forceful', 'Forceful', 'Physical drive can overwhelm a social moment.', { strength: .3, social: -.2 }),
  condition('inner_drive', 'Inner drive', 'More yearly effort is available, with less ease in company.', { social: -.3 }, { focusPoints: 1 }),
  condition('needs_recovery', 'Needs recovery', 'Fewer yearly plans leave room for a steadier pace.', { stability: .3 }, { focusPoints: -1 }),
  condition('screen_sensitive', 'Screen sensitive', 'Screens are tiring, while hands-on ideas come readily.', { creativity: .3 }, { focusLimits: { toddler: { social: 1 } } }),
  condition('movement_sensitive', 'Movement sensitive', 'Physical activity needs care, while ideas hold your attention.', { intelligence: .3 }, { focusLimits: { toddler: { work: 1 }, standard: { self: 2 } } }),
  condition('socially_driven', 'Socially driven', 'People hold your attention more than solitary learning.', { social: .5, intelligence: -.3 }),
  condition('solitary_thinker', 'Solitary thinker', 'Quiet thought comes more readily than group plans.', { intelligence: .5, social: -.3 }, { focusLimits: { standard: { social: 3 } } }),
  condition('crafts_drawn', 'Drawn to crafts', 'Making things comes readily but long screen sessions are tiring.', { creativity: .4 }, { focusLimits: { toddler: { social: 3 } } }),
  condition('overcommitter', 'Overcommitter', 'Extra plans are possible, but maintaining balance is harder.', { stability: -.4, health: -.2 }, { focusPoints: 1 }),
  condition('measured_pace', 'Measured pace', 'Fewer plans support a more settled starting point.', { stability: .4, health: .2 }, { focusPoints: -1 }),
  condition('adaptable', 'Adaptable', 'New situations and approaches feel easier to explore.', { creativity: .2, stability: .2 }),
];
const byId = new Map(BIRTH_CONDITIONS.map(entry => [entry.id, entry]));
export const getBirthConditions = person => (person?.conditions || []).map(id => byId.get(id)).filter(Boolean);
export const validateBirthConditions = ids => Array.isArray(ids) && ids.length <= MAX_BIRTH_CONDITIONS && new Set(ids).size === ids.length && ids.every(id => byId.has(id));
export const conditionFocusPoints = person => getBirthConditions(person).reduce((sum, entry) => sum + (entry.focusPoints || 0), 0);
export function conditionFocusLimits(person, stage) {
  const limits = {};
  for (const entry of getBirthConditions(person)) for (const [key, cap] of Object.entries(entry.focusLimits?.[stage] || {})) limits[key] = Math.min(limits[key] ?? 4, cap);
  return limits;
}
export function generateBirthConditions(random, parentConditions = []) {
  const inherited = new Set(parentConditions.flat());
  const candidates = BIRTH_CONDITIONS.filter(entry => random() < entry.birthChance * (inherited.has(entry.id) ? INHERITANCE_CHANCE_MULTIPLIER : 1));
  // Shuffle before truncating so the five-condition cap never favors catalog order.
  for (let i = candidates.length - 1; i > 0; i--) {
    const j = Math.min(i, Math.floor(random() * (i + 1)));
    [candidates[i], candidates[j]] = [candidates[j], candidates[i]];
  }
  const groups = new Set();
  return candidates.filter(entry => {
    if (!entry.group) return true;
    if (groups.has(entry.group)) return false;
    groups.add(entry.group);
    return true;
  }).slice(0, MAX_BIRTH_CONDITIONS).map(entry => entry.id);
}
export function applyBirthConditions(person) {
  const changes = {};
  for (const entry of getBirthConditions(person)) for (const [key, amount] of Object.entries(entry.statChanges)) changes[key] = (changes[key] || 0) + amount;
  for (const [key, amount] of Object.entries(changes)) person.stats[key] = Math.round(Math.max(0, Math.min(10, person.stats[key] + amount)) * 100) / 100;
  return person;
}
export function assignBirthConditions(person, seed = 0, parents = []) {
  if (Array.isArray(person.conditions)) return person;
  let value = 2166136261;
  for (const char of `${seed}:${person.id}:birth-conditions`) value = Math.imul(value ^ char.charCodeAt(0), 16777619) >>> 0;
  const random = () => { value = (Math.imul(value, 1664525) + 1013904223) >>> 0; return value / 4294967296; };
  person.conditions = generateBirthConditions(random, parents.map(parent => parent.conditions || []));
  return applyBirthConditions(person);
}
