// Fictional birth-condition mechanics for Lifelines, not medical descriptions.
// Affinity shifts apply once at creation without changing ratings; focus effects persist.
const condition = (id, name, description, aptitudeChanges = {}, extra = {}) => ({ id, name, description, birthChance: .012, aptitudeChanges, ...extra });
export const MAX_BIRTH_CONDITIONS = 5;
export const INHERITANCE_CHANCE_BOOST_PER_PARENT = .25;
export const LEGACY_INHERITANCE_CHANCE_PER_PARENT = .003;
// Compatibility export: this is now the maximum boost with two carrying parents.
export const INHERITANCE_CHANCE_MULTIPLIER = 1 + 2 * INHERITANCE_CHANCE_BOOST_PER_PARENT;
const LEGACY_BIRTH_CONDITIONS = [
  condition('autism', 'Autism', 'A different pattern of learning and social energy.', { intelligence: 1 }, { focusLimits: { standard: { social: 1 } }, birthChance: .008 }),
  condition('high_energy', 'High energy', 'More energy available for yearly activities.', {}, { focusPoints: 1, group: 'energy' }),
  condition('low_energy', 'Low energy', 'Less energy available for yearly activities.', {}, { focusPoints: -1, group: 'energy' }),
  condition('restless', 'Restless', 'Extra drive makes settling down harder.', { stability: -1 }, { focusPoints: 1 }),
  condition('unhurried', 'Unhurried', 'A calmer pace leaves less room for plans.', { stability: 1 }, { focusPoints: -1 }),
  condition('quick_learner', 'Quick learner', 'New ideas come readily.', { intelligence: 1 }, { group: 'learning' }),
  condition('slow_learner', 'Slow learner', 'New ideas take more effort.', { intelligence: -1 }, { group: 'learning' }),
  condition('vivid_imagination', 'Vivid imagination', 'Imagining possibilities comes easily.', { creativity: 1 }, { group: 'imagination' }),
  condition('literal_thinker', 'Literal thinker', 'Concrete ideas are easier than imagined ones.', { creativity: -1, intelligence: 1 }, { group: 'imagination' }),
  condition('social_ease', 'Social ease', 'Connecting with people feels natural.', { social: 1 }, { group: 'social_ease' }),
  condition('social_hesitancy', 'Shy', 'New interactions take more effort.', { social: -1 }, { group: 'social_ease' }),
  condition('robust_constitution', 'Robust constitution', 'A strong starting foundation for health.', { health: 1 }, { group: 'constitution' }),
  condition('delicate_constitution', 'Delicate constitution', 'A more delicate starting foundation for health.', { health: -1 }, { group: 'constitution' }),
  condition('powerful_build', 'Powerful build', 'Physical strength comes readily.', { strength: 1 }, { group: 'build' }),
  condition('light_build', 'Light build', 'A lighter frame starts with less strength.', { strength: -1 }, { group: 'build' }),
  condition('striking_features', 'Striking features', 'Distinctive features catch the eye.', { attractiveness: 1 }, { group: 'features' }),
  condition('unassuming_features', 'Unassuming features', 'An appearance that draws less attention.', { attractiveness: -1 }, { group: 'features' }),
  condition('even_tempered', 'Even tempered', 'Feelings tend to settle smoothly.', { stability: 1 }, { group: 'temperament' }),
  condition('volatile_temper', 'Volatile temper', 'Feelings are harder to settle.', { stability: -1 }, { group: 'temperament' }),
  condition('sharp_memory', 'Sharp memory', 'Details are easier to retain.', { intelligence: 1 }),
  condition('forgetful', 'Forgetful', 'Details are easier to lose track of.', { intelligence: -1 }),
  condition('musical_ear', 'Musical ear', 'Patterns of sound spark ideas.', { creativity: 1 }),
  condition('rhythm_challenged', 'Rhythm challenged', 'Patterns of sound take more effort.', { creativity: -1 }),
  condition('steady_hands', 'Steady hands', 'Fine movement supports making things.', { creativity: 1, strength: 1 }),
  condition('shaky_hands', 'Shaky hands', 'Fine movement takes more care.', { creativity: -1, strength: -1 }),
  condition('warm_presence', 'Warm presence', 'Others find your manner welcoming.', { social: 1, attractiveness: 1 }),
  condition('guarded_presence', 'Guarded presence', 'Your manner can be hard to read.', { social: -1, attractiveness: -1 }),
  condition('curious_mind', 'Curious mind', 'Questions and possibilities draw your attention.', { intelligence: 1, creativity: 1 }),
  condition('narrow_interests', 'Narrow interests', 'Familiar interests hold your attention.', { intelligence: 1, creativity: -1 }),
  condition('adventurous', 'Adventurous', 'Novelty invites you in, sometimes at a cost.', { creativity: 1, health: -1 }),
  condition('cautious', 'Cautious', 'Careful habits leave less room for novelty.', { health: 1, creativity: -1 }),
  condition('deep_sleeper', 'Deep sleeper', 'Rest comes readily.', { health: 1, stability: 1 }, { group: 'sleep' }),
  condition('light_sleeper', 'Light sleeper', 'Rest is easily interrupted.', { health: -1, stability: -1 }, { group: 'sleep' }),
  condition('sensitive_hearing', 'Sensitive hearing', 'Sound feeds imagination but can be tiring.', { creativity: 1, stability: -1 }),
  condition('sensory_resilience', 'Sensory resilience', 'Busy surroundings are easier to handle.', { stability: 1 }),
  condition('sensory_overload', 'Sensory overload', 'Busy surroundings can be draining.', { stability: -1 }, { focusLimits: { standard: { social: 3 } } }),
  condition('spatial_talent', 'Spatial talent', 'Shapes and spaces fit together readily.', { intelligence: 1, creativity: 1 }),
  condition('spatial_difficulty', 'Spatial difficulty', 'Shapes and spaces take more work.', { intelligence: -1, creativity: -1 }),
  condition('verbal_fluency', 'Verbal fluency', 'Words come readily.', { intelligence: 1, social: 1 }),
  condition('word_finding_difficulty', 'Word-finding difficulty', 'Finding the right words takes time.', { intelligence: -1, social: -1 }),
  condition('patient', 'Patient', 'Waiting and repetition are easier to bear.', { stability: 1, social: 1 }),
  condition('impatient', 'Impatient', 'Waiting and repetition wear on you.', { stability: -1, social: -1 }),
  condition('competitive', 'Competitive', 'Challenges bring drive and tension.', { strength: 1, stability: -1 }),
  condition('cooperative', 'Cooperative', 'Shared effort helps connections form.', { social: 1, strength: -1 }),
  condition('expressive_face', 'Expressive face', 'Your feelings are easy to read.', { social: 1, attractiveness: 1 }),
  condition('unreadable_face', 'Unreadable face', 'Your feelings are less apparent to others.', { social: -1, stability: 1 }),
  condition('natural_balance', 'Natural balance', 'Balance and coordination come readily.', { strength: 1 }),
  condition('clumsy', 'Clumsy', 'Balance and coordination take more effort.', { strength: -1, health: -1 }),
  condition('flexible', 'Flexible', 'Movement feels supple and comfortable.', { strength: 1, health: 1 }),
  condition('stiff_joints', 'Stiff joints', 'Movement needs more care and recovery.', { strength: -1, health: -1 }, { focusLimits: { toddler: { work: 3 }, standard: { self: 3 } } }),
  condition('resilient_skin', 'Resilient skin', 'Skin starts with a resilient appearance.', { health: 1, attractiveness: 1 }),
  condition('sensitive_skin', 'Sensitive skin', 'Skin starts needing extra care.', { health: -1, attractiveness: -1 }),
  condition('bright_smile', 'Bright smile', 'A smile helps make a warm impression.', { attractiveness: 1, social: 1 }),
  condition('dental_difficulties', 'Dental difficulties', 'Dental care presents an early challenge.', { attractiveness: -1, health: -1 }),
  condition('confident_voice', 'Confident voice', 'Speaking carries a natural assurance.', { social: 1 }),
  condition('quiet_voice', 'Quiet voice', 'Being heard takes more effort.', { social: -1 }),
  condition('strong_endurance', 'Strong endurance', 'Sustained effort comes more readily.', { strength: 1, health: 1 }),
  condition('low_endurance', 'Low endurance', 'Sustained effort is more tiring.', { strength: -1, health: -1 }, { focusLimits: { toddler: { work: 3 }, standard: { self: 3 } } }),
  condition('focused_attention', 'Focused attention', 'One task can hold your attention deeply.', { intelligence: 1, social: -1 }),
  condition('wandering_attention', 'Wandering attention', 'Attention follows new possibilities.', { intelligence: -1, creativity: 1 }),
  condition('quick_reactions', 'Quick reactions', 'Responding to movement comes readily.', { strength: 1, intelligence: 1 }),
  condition('slow_reactions', 'Slow reactions', 'Responding to movement takes more time.', { strength: -1, intelligence: -1 }),
  condition('optimistic', 'Optimistic', 'Possibilities tend to feel hopeful.', { stability: 1, social: 1 }),
  condition('pessimistic', 'Pessimistic', 'Possibilities tend to feel uncertain.', { stability: -1, social: -1 }),
  condition('inventive', 'Inventive', 'Unusual solutions come readily.', { creativity: 1, intelligence: 1 }),
  condition('routine_bound', 'Routine bound', 'Predictable routines bring steadiness.', { creativity: -1, stability: 1 }),
  condition('empathetic', 'Empathetic', 'Other peoples feelings are easy to notice and hard to ignore.', { social: 1, stability: -1 }),
  condition('emotionally_distant', 'Emotionally distant', 'Distance makes feelings easier to manage but connection harder.', { social: -1, stability: 1 }),
  condition('vigorous', 'Vigorous', 'Extra drive supports physical activity.', { strength: 1 }, { focusPoints: 1, group: 'stamina_points' }),
  condition('easily_drained', 'Easily drained', 'Everyday effort can use up your reserves.', { strength: -1 }, { focusPoints: -1, group: 'stamina_points' }),
  condition('self_starter', 'Self-starter', 'Starting a plan takes less effort.', { stability: -1 }, { focusPoints: 1, group: 'initiative' }),
  condition('slow_to_start', 'Slow to start', 'Starting a plan takes more time.', { stability: 1 }, { focusPoints: -1, group: 'initiative' }),
  condition('bold', 'Bold', 'Speaking up comes easily, even under uncertainty.', { social: 1, health: -1 }),
  condition('timid', 'Timid', 'Care and hesitation often come together.', { social: -1, health: 1 }),
  condition('detail_oriented', 'Detail oriented', 'Small details hold your attention.', { intelligence: 1, creativity: -1 }),
  condition('big_picture_thinker', 'Big-picture thinker', 'Broad possibilities stand out more than details.', { creativity: 1, intelligence: -1 }),
  condition('natural_storyteller', 'Natural storyteller', 'Stories connect ideas and people.', { creativity: 1, social: 1 }),
  condition('brief_communicator', 'Brief communicator', 'Keeping things short leaves less room for expression.', { creativity: -1, social: -1 }),
  condition('calm_under_pressure', 'Calm under pressure', 'Pressure is easier to contain.', { stability: 1 }),
  condition('easily_startled', 'Easily startled', 'Sudden changes unsettle you readily.', { stability: -1 }),
  condition('strong_appetite', 'Strong appetite', 'A ready appetite supports early physical development.', { health: 1, strength: 1 }),
  condition('low_appetite', 'Low appetite', 'Eating enough can take extra attention.', { health: -1, strength: -1 }),
  condition('symmetrical_features', 'Symmetrical features', 'Balanced features shape an early impression.', { attractiveness: 1 }),
  condition('uneven_features', 'Uneven features', 'Uneven features shape an early impression.', { attractiveness: -1 }),
  condition('radiant_complexion', 'Radiant complexion', 'A clear complexion draws attention.', { attractiveness: 1 }),
  condition('blemish_prone', 'Blemish prone', 'An uneven complexion needs extra care.', { attractiveness: -1 }),
  condition('analytical', 'Analytical', 'Breaking problems into parts comes readily.', { intelligence: 1, social: -1 }),
  condition('intuitive', 'Intuitive', 'Instinct helps connections more than formal analysis.', { social: 1, intelligence: -1 }),
  condition('gentle', 'Gentle', 'A gentle manner supports connection.', { social: 1, strength: -1 }),
  condition('forceful', 'Forceful', 'Physical drive can overwhelm a social moment.', { strength: 1, social: -1 }),
  condition('inner_drive', 'Inner drive', 'More yearly effort is available, with less ease in company.', { social: -1 }, { focusPoints: 1 }),
  condition('needs_recovery', 'Needs more rest', 'Fewer yearly plans leave room for a steadier pace.', { stability: 1 }, { focusPoints: -1 }),
  condition('screen_sensitive', 'Screen fatigue', 'Screens are tiring, while hands-on ideas come readily.', { creativity: 1 }, { focusLimits: { toddler: { social: 1 } } }),
  condition('movement_sensitive', 'Uncoordinated', 'Physical activities take extra care; quiet learning comes more easily.', { intelligence: 1 }, { focusLimits: { toddler: { work: 1 }, standard: { self: 2 } } }),
  condition('socially_driven', 'Socially driven', 'People hold your attention more than solitary learning.', { social: 1, intelligence: -1 }),
  condition('solitary_thinker', 'Solitary thinker', 'Quiet thought comes more readily than group plans.', { intelligence: 1, social: -1 }, { focusLimits: { standard: { social: 3 } } }),
  condition('crafts_drawn', 'Drawn to crafts', 'Making things comes readily but long screen sessions are tiring.', { creativity: 1 }, { focusLimits: { toddler: { social: 3 } } }),
  condition('overcommitter', 'Overcommitter', 'Extra plans are possible, but maintaining balance is harder.', { stability: -1, health: -1 }, { focusPoints: 1 }),
  condition('measured_pace', 'Measured pace', 'Fewer plans support a more settled starting point.', { stability: 1, health: 1 }, { focusPoints: -1 }),
  condition('adaptable', 'Adaptable', 'New situations and approaches feel easier to explore.', { creativity: 1, stability: 1 }),
];

// New lives use specific profiles rather than fixed stereotypes or arbitrary opposites.
// Gameplay affinities and probabilities are abstractions, not IQ, prevalence or
// Mendelian inheritance. Predispositions do not guarantee a later diagnosis.
// Clinical framing reviewed against:
// https://www.nimh.nih.gov/health/publications/autism-spectrum-disorder
// https://www.nichd.nih.gov/health/topics/learning/conditioninfo
// https://www.nimh.nih.gov/health/publications/bipolar-disorder
const profile = (id, name, description, kind, aptitudeChanges = {}, extra = {}) =>
  condition(id, name, description, aptitudeChanges, { birthChance: .025, kind, ...extra });
export const ACTIVE_BIRTH_CONDITIONS = [
  profile('rapid_processing', 'Quick processing', 'New information is usually easier for you to process during learning.', 'positive', { intelligence: 1 }, { group: 'processing' }),
  profile('strong_working_memory', 'Strong working memory', 'Holding several pieces of information in mind supports learning.', 'positive', { intelligence: 1 }, { group: 'working_memory' }),
  profile('verbal_aptitude', 'Verbal aptitude', 'Learning and using language comes readily.', 'positive', { intelligence: 1, social: 1 }, { group: 'language' }),
  profile('spatial_reasoning', 'Spatial reasoning', 'Visualizing shapes and layouts supports problem solving and design.', 'positive', { intelligence: 1, creativity: 1 }, { group: 'spatial' }),
  profile('number_sense', 'Number sense', 'Recognizing quantities and numerical patterns comes readily.', 'positive', { intelligence: 1 }, { group: 'numeracy_support' }),
  profile('pitch_memory', 'Pitch memory', 'Remembering pitch supports musical learning and expression.', 'positive', { creativity: 1 }, { group: 'pitch' }),
  profile('visual_imagination', 'Visual imagination', 'Clear mental images support visual ideas and creative practice.', 'positive', { creativity: 1 }),
  profile('motor_coordination', 'Motor coordination', 'Coordinating movements makes physical skills easier to learn.', 'positive', { strength: 1 }, { group: 'coordination' }),
  profile('aerobic_capacity', 'Aerobic potential', 'Your physical makeup supports building endurance through activity.', 'positive', { strength: 1, health: 1 }, { group: 'endurance' }),
  profile('muscle_response', 'Strong training response', 'Your muscles respond readily to appropriate physical training.', 'positive', { strength: 1 }),
  profile('physical_resilience', 'Physical resilience', 'Your constitution supports recovery when care and rest are available.', 'positive', { health: 1 }, { group: 'recovery' }),
  profile('settled_sleep', 'Settled sleep', 'Sleep is less easily disrupted, supporting rest and coping.', 'positive', { health: 1, stability: 1 }, { group: 'sleep_profile' }),
  profile('emotion_regulation', 'Steady emotional regulation', 'Settling strong feelings comes more readily with practice and support.', 'positive', { stability: 1 }, { group: 'regulation' }),
  profile('social_approach', 'Outgoing temperament', 'Approaching unfamiliar people feels relatively comfortable.', 'positive', { social: 1 }, { group: 'social_approach' }),
  profile('expressive_communication', 'Expressive communication', 'Coordinating voice and expression helps others understand you.', 'positive', { social: 1 }, { group: 'speech' }),
  profile('skin_barrier', 'Resilient skin barrier', 'Your skin is less prone to irritation and needs less recovery care.', 'positive', { health: 1 }, { group: 'skin' }),
  profile('enamel_resilience', 'Resilient enamel', 'Your tooth enamel offers a helpful foundation alongside ordinary dental care.', 'positive', { health: 1 }, { group: 'dental' }),
  profile('steady_appetite', 'Steady appetite', 'Reliable appetite signals make regular nourishment easier.', 'positive', { health: 1 }, { group: 'appetite' }),
  profile('attention_flexibility', 'Flexible attention', 'Shifting attention between tasks takes relatively little effort.', 'positive', { intelligence: 1 }, { group: 'attention' }),
  profile('task_initiative', 'Easy task initiation', 'Starting and organizing daily tasks uses less of your available time.', 'positive', {}, { focusPoints: 1, group: 'initiation' }),
  profile('exceptional_reasoning', 'Exceptional reasoning', 'Unusually strong reasoning supports learning; it does not imply mental illness or mastery without practice.', 'positive', { intelligence: 1 }, { birthChance: .005 }),
  profile('sensory_tolerance', 'Sensory tolerance', 'Ordinary noise and other sensations are less likely to exhaust your attention.', 'positive', { stability: 1 }, { group: 'sensory' }),
  profile('deliberate_processing', 'Deliberate processing', 'Processing unfamiliar information takes extra time; this does not determine your eventual achievements.', 'negative', { intelligence: -1 }, { group: 'processing' }),
  profile('working_memory_difficulty', 'Working-memory difficulty', 'Keeping several instructions in mind takes extra practice and external reminders.', 'negative', { intelligence: -1 }, { group: 'working_memory' }),
  profile('language_processing_difficulty', 'Language-processing difficulty', 'Following rapid conversation takes extra effort and communication support.', 'negative', { social: -1 }, { group: 'language' }),
  profile('spatial_processing_difficulty', 'Spatial-processing difficulty', 'Learning layouts and visual construction takes extra practice.', 'negative', { creativity: -1 }, { group: 'spatial' }),
  profile('dyscalculia', 'Dyscalculia', 'This specific learning disability makes number tasks harder. Tools and support take planning time; general intelligence is unchanged.', 'negative', {}, { focusPoints: -1, group: 'numeracy_support' }),
  profile('pitch_discrimination_difficulty', 'Pitch-discrimination difficulty', 'Distinguishing pitch makes some musical practice harder; other creative interests remain open.', 'negative', { creativity: -1 }, { group: 'pitch' }),
  profile('developmental_coordination', 'Coordination difficulty', 'Learning coordinated movement takes more practice and adapted instruction.', 'negative', { strength: -1 }, { group: 'coordination' }),
  profile('limited_endurance', 'Limited endurance', 'Physical effort requires more recovery and careful pacing.', 'negative', { strength: -1, health: -1 }, { group: 'endurance' }),
  profile('connective_tissue_vulnerability', 'Joint vulnerability', 'Your joints need additional protection and paced physical training.', 'negative', { health: -1, strength: -1 }),
  profile('slow_recovery', 'Slow physical recovery', 'Recovery after exertion or illness tends to take more care and rest.', 'negative', { health: -1 }, { group: 'recovery' }),
  profile('interrupted_sleep', 'Interrupted-sleep tendency', 'Sleep is easily disturbed, making rest and coping harder.', 'negative', { health: -1, stability: -1 }, { group: 'sleep_profile' }),
  profile('stress_reactivity', 'High stress reactivity', 'Strong stress responses can take more time and support to settle.', 'negative', { stability: -1 }, { group: 'regulation' }),
  profile('inhibited_temperament', 'Inhibited temperament', 'Unfamiliar social situations take more time to feel comfortable.', 'negative', { social: -1 }, { group: 'social_approach' }),
  profile('speech_motor_difficulty', 'Speech-motor difficulty', 'Coordinating speech takes extra practice and communication support; intelligence is unchanged.', 'negative', { social: -1 }, { group: 'speech' }),
  profile('eczema_predisposition', 'Eczema predisposition', 'A tendency toward skin irritation can make physical care more demanding.', 'negative', { health: -1 }, { group: 'skin' }),
  profile('enamel_vulnerability', 'Enamel vulnerability', 'Your teeth need additional preventive care and may recover less easily from damage.', 'negative', { health: -1 }, { group: 'dental' }),
  profile('low_appetite_signals', 'Low appetite signals', 'Regular nourishment can require additional attention and support.', 'negative', { health: -1 }, { group: 'appetite' }),
  profile('distractible_attention', 'Distractible attention', 'Managing interruptions takes planning time; this is not a measure of intelligence.', 'negative', {}, { focusPoints: -1, group: 'attention' }),
  profile('initiation_difficulty', 'Task-initiation difficulty', 'Getting tasks underway uses extra planning time and practical support.', 'negative', {}, { focusPoints: -1, group: 'initiation' }),
  profile('dyslexia', 'Dyslexia', 'This specific learning disability affects reading and spelling. Accessible tools take planning time; general intelligence is unchanged.', 'negative', {}, { focusPoints: -1, group: 'reading_support' }),
  profile('bipolar_predisposition', 'Bipolar predisposition', 'An inherited vulnerability can make mood regulation harder. This is a risk profile, not a diagnosis at birth or a guarantee of later illness.', 'negative', { stability: -1 }, { birthChance: .008 }),
  profile('autism_individual', 'Autism: sensory support', 'For this person, sensory and communication differences make busy interactions harder. Strengths vary independently; autism does not set intelligence.', 'negative', { social: -1 }, { birthChance: .008, group: 'autism_profile', inheritanceIds: ['autism', 'autism_individual', 'autism_pattern_profile'] }),
  profile('autism_pattern_profile', 'Autism: pattern strengths', 'This person has strong pattern learning and needs extra planning for sensory comfort. This is one individual profile, not a universal autistic trait.', 'mixed', { intelligence: 1 }, { focusPoints: -1, birthChance: .008, group: 'autism_profile', inheritanceIds: ['autism', 'autism_individual', 'autism_pattern_profile'] }),
  profile('gifted_dyslexic_profile', 'Strong reasoning with dyslexia', 'Strong reasoning and a specific reading disability coexist. Accessible reading tools take extra planning time.', 'mixed', { intelligence: 1 }, { focusPoints: -1, group: 'reading_support', birthChance: .008 }),
  profile('musical_sensory_profile', 'Musical ear with sound sensitivity', 'For this person, sensitive hearing supports musical detail but managing noisy surroundings uses extra time.', 'mixed', { creativity: 1 }, { focusPoints: -1, group: 'sensory' }),
  profile('energetic_sensitive_profile', 'Energetic, sensitive temperament', 'This person has energy for extra plans and strong stress responses that take more support to settle.', 'mixed', { stability: -1 }, { focusPoints: 1, group: 'regulation' }),
];
// Explicit successor profiles keep old parental traits relevant without drawing
// both the retired perk and its replacement. These are fictional trait-family
// links, not claims that one named clinical condition causes another.
export const LEGACY_INHERITANCE_SUCCESSORS = Object.freeze(Object.fromEntries(Object.entries({
  autism: ['autism_individual', 'autism_pattern_profile'],
  quick_learner: ['rapid_processing'],
  slow_learner: ['deliberate_processing'],
  vivid_imagination: ['visual_imagination'],
  social_ease: ['social_approach'],
  social_hesitancy: ['inhibited_temperament'],
  robust_constitution: ['physical_resilience'],
  delicate_constitution: ['slow_recovery'],
  even_tempered: ['emotion_regulation'],
  volatile_temper: ['stress_reactivity'],
  sharp_memory: ['strong_working_memory'],
  forgetful: ['working_memory_difficulty'],
  musical_ear: ['pitch_memory'],
  steady_hands: ['motor_coordination'],
  deep_sleeper: ['settled_sleep'],
  light_sleeper: ['interrupted_sleep'],
  sensitive_hearing: ['musical_sensory_profile'],
  sensory_resilience: ['sensory_tolerance'],
  spatial_talent: ['spatial_reasoning'],
  spatial_difficulty: ['spatial_processing_difficulty'],
  verbal_fluency: ['verbal_aptitude'],
  word_finding_difficulty: ['language_processing_difficulty'],
  expressive_face: ['expressive_communication'],
  natural_balance: ['motor_coordination'],
  clumsy: ['developmental_coordination'],
  stiff_joints: ['connective_tissue_vulnerability'],
  resilient_skin: ['skin_barrier'],
  sensitive_skin: ['eczema_predisposition'],
  dental_difficulties: ['enamel_vulnerability'],
  strong_endurance: ['aerobic_capacity'],
  low_endurance: ['limited_endurance'],
  wandering_attention: ['distractible_attention'],
  self_starter: ['task_initiative'],
  slow_to_start: ['initiation_difficulty'],
  bold: ['social_approach'],
  timid: ['inhibited_temperament'],
  calm_under_pressure: ['emotion_regulation'],
  easily_startled: ['stress_reactivity'],
  strong_appetite: ['steady_appetite'],
  low_appetite: ['low_appetite_signals'],
  movement_sensitive: ['developmental_coordination'],
  restless: ['energetic_sensitive_profile'],
  overcommitter: ['energetic_sensitive_profile'],
}).map(([id, successors]) => [id, Object.freeze(successors)])));

// Retain every legacy ID and its mechanics for historical saves, including old
// schema affinity migration and lifelong focus caps. Unmapped legacy traits have
// only a rare parental-inheritance route, never an independent birth chance.
export const BIRTH_CONDITIONS = [
  ...ACTIVE_BIRTH_CONDITIONS,
  ...LEGACY_BIRTH_CONDITIONS.map(entry => ({ ...entry, legacy: true, birthChance: 0 })),
];

const byId = new Map(BIRTH_CONDITIONS.map(entry => [entry.id, entry]));
export const getBirthConditions = person => (person?.conditions || []).map(id => byId.get(id)).filter(Boolean);
// Stored affinity includes the birth perks already applied once at creation.
// Sum opposing perks before deriving bounds; old saved values in -3..3 remain
// valid even when a perk would now allow a larger positive or negative total.
export const perkAffinityBonus = (person, key) => getBirthConditions(person).reduce((sum, entry) => sum + (entry.aptitudeChanges[key] || 0), 0);
export function aptitudeBounds(person, key) {
  const bonus = perkAffinityBonus(person, key);
  return { min: -3 + Math.min(0, bonus), max: 3 + Math.max(0, bonus) };
}
export const validateBirthConditions = ids => Array.isArray(ids) && ids.length <= MAX_BIRTH_CONDITIONS && new Set(ids).size === ids.length && ids.every(id => byId.has(id));
export const conditionFocusPoints = person => getBirthConditions(person).reduce((sum, entry) => sum + (entry.focusPoints || 0), 0);
export function conditionFocusLimits(person, stage) {
  const limits = {};
  for (const entry of getBirthConditions(person)) for (const [key, cap] of Object.entries(entry.focusLimits?.[stage] || {})) limits[key] = Math.min(limits[key] ?? 4, cap);
  return limits;
}
export function generateBirthConditions(random, parentConditions = []) {
  const parents = parentConditions.slice(0, 2).map(ids => new Set(ids.flatMap(id =>
    [id, ...(LEGACY_INHERITANCE_SUCCESSORS[id] || [])])));
  const carryingParents = ids => parents.filter(parent => ids.some(id => parent.has(id))).length;
  const candidates = ACTIVE_BIRTH_CONDITIONS.filter(entry => random() < entry.birthChance
    * (1 + INHERITANCE_CHANCE_BOOST_PER_PARENT * carryingParents([entry.id, ...(entry.inheritanceIds || [])])));
  for (const entry of LEGACY_BIRTH_CONDITIONS) {
    if (LEGACY_INHERITANCE_SUCCESSORS[entry.id]) continue;
    const parentCount = carryingParents([entry.id]);
    if (parentCount && random() < LEGACY_INHERITANCE_CHANCE_PER_PARENT * parentCount) candidates.push(entry);
  }
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
  for (const entry of getBirthConditions(person)) for (const [key, amount] of Object.entries(entry.aptitudeChanges)) changes[key] = (changes[key] || 0) + amount;
  person.aptitudes ??= {};
  for (const [key, amount] of Object.entries(changes)) person.aptitudes[key] = (person.aptitudes[key] ?? 0) + amount;
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
