// Fictional life-sim probabilities and consequences, not real-world risk estimates.
// Each eligible event gets an independent yearly roll. The engine caps a year at five.
// Low/high factors are curved so extreme traits matter much more than small changes.
import { legacyFocusValue, focusMaxFor } from './focus-rules.js?v=causal-stat-outcomes';
import { APTITUDE_EVENTS } from './cross-aptitude-events.js?v=causal-stat-outcomes';
import { schoolActivity, activityEligible } from './school.js?v=causal-stat-outcomes';

const low = key => [key, 'low'];
const high = key => [key, 'high'];
const temporary = (modifiers, years = 1, lifestyle = 0) => ({ modifiers, years, ...(lifestyle ? { lifestyle } : {}) });
// Keep the timed-effect notation and runtime available for saved lives. New
// catalog outcomes merge its amounts into permanent changes; limits and point changes expire.
const change = statChanges => ({ statChanges });
const choice = (id, label, description, outcome) => ({ id, label, description, ...outcome });
function permanentOutcome(outcome) {
  const result = { ...outcome, statChanges: { ...outcome.statChanges }, modifiers: {}, years: outcome.focusLimits || outcome.focusPoints ? outcome.years || 1 : 0 };
  for (const [key, amount] of Object.entries(outcome.modifiers || {})) result.statChanges[key] = (result.statChanges[key] || 0) + amount;
  // Legacy material fields do not imply a permanent mental-stability change.
  result.statChanges = Object.fromEntries(Object.entries(result.statChanges).filter(([, amount]) => amount));
  if (!Object.keys(result.statChanges).length) delete result.statChanges;
  delete result.lifestyle;
  if (outcome.choices) result.choices = outcome.choices.map(permanentOutcome);
  return result;
}
const group = (category, defaults, entries) => entries.map(entry => permanentOutcome({ category, years: 1, modifiers: {}, ...defaults, ...entry }));
export const PERSONAL_EVENT_RATE_MULTIPLIER = 3;

export const EVENTS = [
  ...APTITUDE_EVENTS,
  ...group('Changing plans', { minAge: 2, baseChance: .018, kind: 'neutral' }, [
    { id: 'broken_bone', name: 'Broken bone', description: 'During active play or exercise, a fall on steps breaks a bone, cutting short active outings while it heals.', schoolFocusFactors: ['sports'], kind: 'negative', focusFactors: ['self'], toddlerFocusFactors: ['work'], ...change({ stability: -.15 }), years: 1, focusLimits: { toddler: { work: 2 }, standard: { social: 2, self: 2 } } },
    { id: 'broken_tablet', name: 'Broken tablet', description: 'Your tablet stops working.', maxAge: 3, kind: 'negative', toddlerFocusFactors: ['social'], choices: [
      choice('borrow', 'Borrow a shared tablet', 'Sharing limits your screen time.', { ...temporary({}), focusLimits: { toddler: { social: 2 } } }),
      choice('screen_break', 'Take a screen break', 'Put screen time into other activities.', { ...change({ health: .2 }), ...temporary({}), focusLimits: { toddler: { social: 0 } } }),
    ] },
    { id: 'art_workshop', name: 'An artist visits the nursery', description: 'A visiting artist offers clay workshops during your usual playtime.', maxAge: 3, kind: 'positive', toddlerFocusFactors: ['creative'], choices: [
      choice('join', 'Join the workshop', 'Develop your art skills with less time for play.', { ...change({ creativity: .5, intelligence: .15 }), ...temporary({}), focusLimits: { toddler: { work: 2 } } }),
      choice('skip', 'Keep your playtime', 'Spend the time playing with others.', change({ social: .2 })),
    ] },
    { id: 'extra_lessons', name: 'A teacher offers extra lessons', description: 'A teacher offers you a place in a small tutoring group that meets when your friends get together.', minAge: 5, maxAge: 16, conditions: ['school'], focusFactors: ['work'], choices: [
      choice('study', 'Take the lessons', 'Study more with less time for friends.', { ...change({ intelligence: .5 }), ...temporary({}), focusLimits: { standard: { social: 2 } } }),
      choice('decline', 'Keep your schedule', 'Keep your free time.', change({})),
    ] },
    { id: 'rehearsal_commitment', name: 'A place in the holiday show', description: 'The school director offers you a part in the holiday show, with rehearsals during study time.', minAge: 5, maxAge: 16, conditions: ['school'], focusFactors: ['social'], choices: [
      choice('perform', 'Commit to rehearsals', 'Practice performing with less time for schoolwork.', { ...change({ creativity: .5, social: .2 }), ...temporary({}), focusLimits: { standard: { work: 2 } } }),
      choice('backstage', 'Help at one performance', 'Contribute without regular rehearsals.', change({ creativity: .2 })),
    ] },
    { id: 'demanding_project', name: 'Asked to lead a project', description: 'Your manager asks you to rescue a delayed project, with meetings that would cut into family time.', minAge: 18, conditions: ['employed'], focusFactors: ['work'], choices: [
      choice('lead', 'Lead the project', 'Build skills with less time for family.', { ...change({ intelligence: .4, social: .2 }), ...temporary({ stability: -.2 }), focusLimits: { standard: { family: 2 } } }),
      choice('share', 'Share the workload', 'Develop your skills with a lighter commitment.', change({ intelligence: .2 })),
    ] },
    { id: 'disrupted_sleep', name: 'Construction outside your window', description: 'Early construction noise carries through your poorly insulated home, and you have no affordable quieter place to sleep. Repeated waking leaves less energy for school or work.', minAge: 5, baseChance: .012, kind: 'negative', statFactors: [low('lifestyle')], ...temporary({ health: -.3 }), focusLimits: { standard: { work: 2 } } },
    { id: 'relative_needs_help', name: 'A relative needs help after surgery', description: 'A relative recovering from surgery asks for regular help during your usual working hours.', minAge: 18, focusFactors: ['family'], choices: [
      choice('help', 'Help regularly', 'Support your relative with less time for work.', { ...change({ social: .4 }), ...temporary({}), focusLimits: { standard: { work: 2 } } }),
      choice('arrange', 'Arrange other support', 'Find help while keeping your routine.', change({ social: .15 })),
    ] },
  ]),
  ...group('Early years', { minAge: 0, maxAge: 2, baseChance: .025, kind: 'positive' }, [
    { id: 'first_words', name: 'Joining a relative\'s word games', description: 'You quickly pick up the simple word games a visiting relative plays with you. Their afternoon visits become lively back-and-forth games that help you feel at ease around people.', statFactors: [high('intelligence')], ...change({ social: .2 }) },
    { id: 'wobbly_steps', name: 'Exploring a play tunnel', description: 'You push and pull your way through a play tunnel brought by a family friend, uncovering hidden toys and figuring out how to reach them.', statFactors: [high('strength')], ...change({ intelligence: .2 }) },
    { id: 'bedtime_stories', name: 'A clever relative visits', description: 'A clever relative starts visiting regularly, reading picture books and teaching you little naming games.', ...change({ intelligence: .2 }) },
    { id: 'musical_baby', name: 'A musician develops your rhythms', description: 'You invent playful rhythms during a visiting musician\'s playgroup session, and they spend extra time helping you build on your ideas with songs and rattles.', statFactors: [high('creativity')], ...change({}) },
    { id: 'gentle_playgroup', name: 'An invitation to baby group', description: 'A neighbor invites your caregiver to a small baby group, giving you new children to play beside.', ...change({ social: .2 }) },
    { id: 'baby_cold', name: 'A cold interrupts feeding and sleep', description: 'You catch a cold at a playgroup gathering, and a blocked nose makes feeding and sleep uncomfortable.', kind: 'negative', statFactors: [low('health')], ...temporary({}) },
    { id: 'teething', name: 'A noisy building repair', description: 'Long-delayed building repairs fill your home with drilling and unfamiliar workers. With no quieter place available, the disruption leaves you distressed.', statFactors: [low('lifestyle')], kind: 'negative', ...temporary({ stability: -.4 }) },
    { id: 'sleepless_baby', name: 'A broken nursery fan', description: 'The nursery fan breaks during hot weather, and your household cannot replace it promptly. Repeated sleepless nights leave you worn out.', kind: 'negative', statFactors: [low('lifestyle')], ...temporary({ health: -.3 }) },
    { id: 'sensory_discovery', name: 'A handmade discovery blanket', description: 'A family friend gives you a blanket with safe fabric flaps and hidden pictures, then shows you how to explore it.', ...change({ creativity: .25, intelligence: .2 }) },
    { id: 'baby_tumble', name: 'A bump against the cot', description: 'While pushing yourself up during play, you cannot quite support your weight and bump your head against the cot, leaving a bruise and a fright.', kind: 'negative', statFactors: [low('strength')], ...temporary({ health: -.15 }) },
    { id: 'soothing_routine', name: 'A trusted babysitter steps in', description: 'A familiar babysitter takes over during a hectic stretch at home, giving you patient, reassuring care.', ...temporary({ stability: .3 }, 2) },
    { id: 'copycat_game', name: 'A puppet show just for you', description: 'An older cousin brings homemade puppets and spends visits acting out silly conversations with you.', ...change({ social: .3, creativity: .2 }) },
  ]),
  ...group('Growing up', { minAge: 2, maxAge: 12, baseChance: .011, kind: 'positive' }, [
    { id: 'treehouse', name: 'A backyard invention', description: 'Your imaginative playhouse design catches a neighbor\'s interest. They bring spare cardboard and help you build tunnels and opening windows.', schoolFocusFactors: ['extracurricular'], focusFactors: ['self'], toddlerFocusFactors: ['creative'], statFactors: [high('creativity')], ...change({ intelligence: .2 }) },
    { id: 'learning_bike', name: 'Invited on a neighborhood ride', description: 'After seeing you keep up during outdoor games, older children invite you on a gentle bike ride and stay beside you until you feel part of the group.', schoolFocusFactors: ['sports'], minAge: 5, focusFactors: ['self'], statFactors: [high('strength')], ...change({ social: .2 }) },
    { id: 'playground_fall', name: 'A playground fall', description: 'You struggle to hold yourself on playground equipment and fall against a rough edge, leaving a small scar and interrupting active play.', kind: 'negative', statFactors: [low('strength')], focusFactors: ['social'], toddlerFocusFactors: ['work'], ...change({ attractiveness: -.1 }), years: 1, focusLimits: { toddler: { work: 2 }, standard: { self: 2 } } },
    { id: 'lost_toy', name: 'Struggling after a favorite toy is lost', description: 'After your favorite make-believe toy goes missing on an outing, you struggle to settle into any replacement game. The distress repeatedly interrupts imaginative play.', kind: 'negative', statFactors: [low('stability')], ...temporary({ creativity: -.2 }) },
    { id: 'child_library', name: 'A storyteller visits the library', description: 'A visiting storyteller notices how quickly you follow the story, asks you to invent an ending, and acts it out with puppets.', schoolFocusFactors: ['extracurricular'], focusFactors: ['self'], toddlerFocusFactors: ['creative'], statFactors: [high('intelligence')], ...change({ creativity: .2 }) },
    { id: 'school_play', name: 'A part in the play', description: 'You are offered a small part in a community performance.', minAge: 3, conditions: ['schoolAge'], focusFactors: ['social'], choices: [choice('perform', 'Take the part', 'The stage stretches your confidence, but rehearsals feel stressful.', { ...change({ social: .4, creativity: .3 }), ...temporary({}) }), choice('backstage', 'Help backstage', 'You find a quieter way to contribute.', change({ creativity: .3, intelligence: .2 }))] },
    { id: 'child_pet', name: 'A neighbor needs a pet sitter', description: 'A neighbor asks whether you would like to help care for their pet.', minAge: 3, conditions: ['schoolAge'], focusFactors: ['family'], choices: [choice('help', 'Help with the pet', 'The routine teaches patience and brings a new connection.', change({ social: .25 })), choice('decline', 'Keep your own time', 'You put the spare time into an imaginative hobby.', change({ creativity: .25 }))] },
    { id: 'birthday_left_out', name: 'An invitation never comes', description: 'Being left out of a birthday gathering stings.', kind: 'negative', focusFactors: ['social'], toddlerFocusFactors: ['work'], statFactors: [low('social')], ...temporary({}) },
    { id: 'child_kindness', name: 'A new child joins your game', description: 'A child who has just moved nearby asks to join your game, and the afternoon starts a friendship.', focusFactors: ['social'], toddlerFocusFactors: ['work'], ...change({ social: .2 }) },
    { id: 'child_argument', name: 'A game turns into an argument', description: 'When the rules of a game seem unfair, you struggle to keep your frustration in check and the disagreement becomes an argument.', minAge: 3, conditions: ['schoolAge'], kind: 'negative', focusFactors: ['social'], statFactors: [low('stability')], choices: [choice('listen', 'Hear everyone out', 'It takes effort to settle down and find common ground.', change({ social: .3 })), choice('leave', 'Leave the game', 'Space helps you calm down, but the others feel distant.', { ...change({}), ...temporary({ social: -.25 }) })] },
    { id: 'family_outing', name: 'A surprise picnic', description: 'Your family packs a surprise picnic and takes you to watch boats on the river.', focusFactors: ['family'], ...change({}) },
    { id: 'child_art', name: 'Your art goes on display', description: 'The local library displays your picture, and visitors stop to ask you about it.', schoolFocusFactors: ['extracurricular'], statFactors: [high('creativity')], focusFactors: ['self'], toddlerFocusFactors: ['creative'], ...change({ social: .2 }) },
  ]),
  ...group('School', { minAge: 5, maxAge: 17, conditions: ['school'], baseChance: .009, kind: 'positive' }, [
    { id: 'good_grades', name: 'An excellent report card', description: 'Your teacher reads out your strong results, and classmates invite you to celebrate with them.', statFactors: [high('intelligence')], focusFactors: ['work'], ...change({ social: .2 }) },
    { id: 'poor_grades', name: 'A difficult report card', description: 'Your report card arrives with failed assignments and a request for a meeting with your caregiver.', kind: 'negative', statFactors: [low('intelligence')], neglectFactors: ['work'], ...temporary({}) },
    { id: 'science_prize', name: 'A prize at the science fair', description: 'Judges award your experiment a prize and ask you to demonstrate it to visiting families.', statFactors: [high('intelligence'), high('creativity')], focusFactors: ['work'], ...change({ social: .2 }) },
    { id: 'reading_award', name: 'A reading prize at assembly', description: 'Your teacher presents you with a reading prize at assembly and praises the effort you put in.', statFactors: [high('intelligence')], focusFactors: ['work'], ...change({}) },
    { id: 'school_team', name: 'A place on the school team', description: 'A coach asks you to try out for the team.', statFactors: [high('strength')], choices: [choice('join', 'Join the team', 'Training builds strength, while the busy schedule adds pressure.', { ...change({}), ...temporary({}) }), choice('skip', 'Keep time for studying', 'You spend the extra time on a subject you enjoy.', change({ intelligence: .3 }))] },
    { id: 'test_anxiety', name: 'Panic during a surprise test', description: 'During an unexpected test, you become too anxious to settle into the questions. The pressure keeps disrupting your concentration well beyond the lesson.', kind: 'negative', statFactors: [low('stability')], focusFactors: ['work'], ...temporary({ intelligence: -.3 }) },
    { id: 'group_project', name: 'A group project needs a plan', description: 'Your teacher assigns a local-history display, but your group cannot agree how to divide the work.', focusFactors: ['social'], choices: [choice('lead', 'Bring the group together', 'Organizing everyone gives your social skills a workout.', change({ social: .45 })), choice('research', 'Focus on the research', 'You learn more about the subject while others coordinate.', change({ intelligence: .35 }))] },
    { id: 'school_bullying', name: 'A classmate keeps picking on you', description: 'Repeated unkind comments make school feel harder.', kind: 'negative', choices: [choice('support', 'Tell a trusted adult', 'You get support, though the experience still takes time to process.', { ...change({ stability: .25 }), ...temporary({ social: -.2 }) }), choice('friends', 'Ask friends to stand with you', 'Leaning on friends builds connection while you work through the stress.', { ...change({ social: .35 }), ...temporary({ stability: -.2 }) })] },
    { id: 'spelling_final', name: 'A spelling final', description: 'You qualify for a school competition and discover how far practice can take you.', statFactors: [high('intelligence')], focusFactors: ['work'], ...change({ social: .1 }) },
    { id: 'school_music', name: 'Asked to join the school concert', description: 'The music teacher hears you practicing and invites you to rehearse with the concert group.', schoolFocusFactors: ['extracurricular'], statFactors: [high('creativity')], focusFactors: ['self'], ...change({ social: .2 }) },
    { id: 'missed_homework', name: 'Misread homework instructions', description: 'After leaving your homework until the last minute, you misunderstand the submission instructions and miss the deadline. Explaining the mistake in class leaves you unsettled.', kind: 'negative', neglectFactors: ['work'], statFactors: [low('intelligence')], ...temporary({}) },
    { id: 'study_buddy', name: 'A classmate offers to study together', description: 'A classmate invites you to weekly study sessions where you explain tricky problems to each other.', focusFactors: ['social', 'work'], ...change({ intelligence: .2, social: .1 }) },
    { id: 'school_speech', name: 'An unexpected speech', description: 'You are asked to say a few words in front of your class.', statFactors: [high('social')], choices: [choice('speak', 'Give it a try', 'You gain confidence through a nervous moment.', { ...change({}), ...temporary({}) }), choice('written', 'Offer a written piece', 'You express your thoughts in a form that suits you.', change({ creativity: .35 }))] },
    { id: 'school_exchange', name: 'A visiting student joins your class', description: 'Your teacher pairs you with a visiting student, who shares stories and games from home.', focusFactors: ['social'], ...change({ social: .3, intelligence: .2 }) },
    { id: 'school_mistake', name: 'A wrong answer shakes your confidence', description: 'After classmates laugh at a wrong answer, you find it hard to regain your composure. Worry about another mistake keeps you from speaking in later group discussions.', kind: 'negative', statFactors: [low('stability')], ...temporary({ social: -.3 }) },
    { id: 'teacher_feedback', name: 'A teacher stays after class', description: 'A teacher offers to stay after class and help you rework a project that did not go as planned.', focusFactors: ['work'], choices: [choice('revise', 'Try another draft', 'Working through the feedback develops your understanding.', change({ intelligence: .4 })), choice('newidea', 'Start a fresh idea', 'A different approach gets your imagination moving.', change({ creativity: .3 }))] },
  ]),
  ...group('Teen years', { minAge: 13, maxAge: 17, baseChance: .009, kind: 'neutral' }, [
    { id: 'peer_drinking', name: 'Pressure to drink is hard to shake', description: 'At a gathering, a friend pressures you to drink with the group. Feeling overwhelmed, you find it hard to hold onto your own preference as you decide how to respond.', focusFactors: ['social'], statFactors: [low('stability')], choices: [choice('drink', 'Go along with it', 'You feel included, but the decision has a cost.', change({ social: 1, intelligence: -1, health: -.3 })), choice('decline', 'Say no and stay', 'Holding your boundary feels steady, even if the moment is awkward.', change({ social: -.2 }))] },
    { id: 'skip_class', name: 'A plan to skip class', description: 'Friends suggest spending the afternoon away from school.', focusFactors: ['social'], neglectFactors: ['work'], choices: [choice('skip', 'Join them', 'You bond over the adventure and miss useful lessons.', change({ social: .5, intelligence: -.4 })), choice('attend', 'Stay for class', 'You learn something worthwhile, but miss the shared joke.', change({ intelligence: .35, social: -.15 }))] },
    { id: 'teen_crush', name: 'Your crush sits beside you', description: 'The person you like takes the empty seat beside you at a gathering, giving you a chance to talk.', focusFactors: ['social'], statFactors: [high('attractiveness')], choices: [choice('talk', 'Start a conversation', 'Making the effort builds confidence and brings some nerves.', { ...change({ social: .45 }), ...temporary({}) }), choice('private', 'Keep it to yourself', 'You channel the feeling into something creative.', change({ creativity: .3 }))] },
    { id: 'teen_rumor', name: 'A rumor spreads', description: 'Someone invents a story about who you are dating and shares it around your friend group.', kind: 'negative', focusFactors: ['social'], ...temporary({ stability: -.3 }) },
    { id: 'online_dare', name: 'A dare puts you under pressure', description: 'A group asks you to attempt an uncomfortable stunt for the camera. Their taunts leave you too unsettled to think clearly about how to respond.', focusFactors: ['social'], statFactors: [low('stability')], choices: [choice('attempt', 'Attempt the dare', 'The attention comes with a painful lesson.', change({ social: .5, health: -.7, strength: -.3 })), choice('refuse', 'Suggest a safer idea', 'Your alternative wins fewer cheers but leaves you feeling more grounded.', change({ creativity: .3, social: -.1 }))] },
    { id: 'teen_style', name: 'A friend offers a makeover', description: 'A friend who customizes clothes brings a bag of outfits and offers to help you try a different look.', focusFactors: ['self'], choices: [choice('bold', 'Try something bold', 'Experimenting sharpens your eye and attracts attention.', change({ attractiveness: .4, creativity: .2 })), choice('comfortable', 'Choose what feels comfortable', 'Feeling like yourself helps you feel settled.', change({}))] },
    { id: 'teen_club', name: 'Invited to a costume-making club', description: 'A classmate invites you to a costume-making club where others share your unusual ideas.', focusFactors: ['social'], kind: 'positive', ...change({ social: .2, creativity: .15 }) },
    { id: 'teen_body_image', name: 'An unkind photo comparison', description: 'Someone posts your photo beside an edited image and makes fun of the difference in a group chat.', kind: 'negative', statFactors: [low('attractiveness')], focusFactors: ['social'], ...temporary({ stability: -.6, social: -.3 }) },
    { id: 'teen_volunteer', name: 'A weekend volunteering offer', description: 'A relative who volunteers at a local food bank asks you to help unload deliveries and greet people at a weekend collection.', focusFactors: ['family'], choices: [choice('volunteer', 'Spend the weekend helping', 'Meeting people through shared work broadens your world.', change({ social: .35, strength: .15 })), choice('recharge', 'Keep a quiet weekend', 'Some time to yourself restores your balance.', change({}))] },
    { id: 'teen_talent', name: 'A sound engineer offers lessons', description: 'A sound engineer notices your creative experiments and offers to teach you how recording equipment works.', schoolFocusFactors: ['extracurricular'], kind: 'positive', focusFactors: ['self'], statFactors: [high('creativity')], ...change({ intelligence: .3 }) },
  ]),
  ...group('College', { minAge: 18, conditions: ['college'], baseChance: .012, kind: 'positive' }, [
    { id: 'college_honors', name: 'Academic honors', description: 'The college invites you to an honors reception, where lecturers introduce you to other students.', statFactors: [high('intelligence')], focusFactors: ['work'], ...change({ social: .25 }) },
    { id: 'college_research', name: 'A research invitation', description: 'A lecturer invites you to help interview residents for a research project beyond the syllabus.', statFactors: [high('intelligence')], focusFactors: ['work'], choices: [choice('research', 'Join the project', 'You learn a great deal, though the extra work is demanding.', { ...change({}), ...temporary({}) }), choice('balance', 'Keep your current schedule', 'You protect time for yourself and your friends.', change({ social: .15 }))] },
    { id: 'college_exam_failure', name: 'An exam goes badly', description: 'Your exam result falls below the pass mark, and the college schedules a resit.', kind: 'negative', statFactors: [low('intelligence')], neglectFactors: ['work'], ...temporary({}) },
    { id: 'college_roommate', name: 'A roommate disagreement', description: 'You have trouble explaining your need for quiet to your roommate. Unclear requests and frustrated replies turn the guest schedule into a disagreement.', kind: 'negative', statFactors: [low('social')], choices: [choice('discuss', 'Talk through the problem', 'An uncomfortable conversation improves your ability to work with others.', change({})), choice('space', 'Spend more time elsewhere', 'The distance brings relief but weakens the connection.', change({}))] },
    { id: 'college_society', name: 'A society welcomes you', description: 'A campus society invites you to its welcome meal and saves you a seat with the regulars.', focusFactors: ['social'], ...change({ social: .2 }) },
    { id: 'college_presentation', name: 'A presentation wins a showcase place', description: 'A lecturer selects your presentation for a campus showcase and helps you turn it into an exhibit.', statFactors: [high('social'), high('intelligence')], focusFactors: ['work'], ...change({ creativity: .2 }) },
    { id: 'college_all_nighter', name: 'The deadline is tomorrow', description: 'An unfinished assignment tempts you to work through the night.', kind: 'neutral', neglectFactors: ['work'], choices: [choice('push', 'Work through the night', 'You learn under pressure but pay for it physically.', change({ intelligence: .4, health: -.5 })), choice('rest', 'Rest and submit what you have', 'You protect your health while accepting a disappointing result.', change({ health: .2 }))] },
    { id: 'college_exhibition', name: 'A campus exhibition', description: 'The student gallery selects your work for an exhibition, and visitors stop to discuss it with you.', focusFactors: ['self'], statFactors: [high('creativity')], ...change({ social: .1 }) },
    { id: 'college_homesick', name: 'A trip home is cancelled', description: 'Your low-cost service home is cancelled, and replacement transport is beyond your budget. Missing the visit leaves you withdrawn from campus activities afterward.', kind: 'negative', statFactors: [low('lifestyle')], ...temporary({ social: -.3 }) },
    { id: 'college_peer_support', name: 'A peer mentor checks in', description: 'A student mentor invites you for a private check-in and helps you talk through a difficult term.', focusFactors: ['social'], ...temporary({ stability: .3 }, 2) },
  ]),
  ...group('Adult life', { minAge: 18, baseChance: .008, kind: 'negative' }, [
    { id: 'financial_scam', name: 'A fake rental listing', description: 'A convincing rental listing turns out to be fake, leaving you shaken after trusting the supposed owner.', statFactors: [low('intelligence')], ...temporary({ stability: -.4 }, 2, -1) },
    { id: 'investment_pitch', name: 'A too-good offer', description: 'An acquaintance pitches a business scheme. You struggle to make sense of its warning signs while they insist you must decide before checking the details.', focusFactors: ['social'], statFactors: [low('intelligence')], kind: 'neutral', choices: [choice('accept', 'Take the chance', 'The promise falls apart, leaving an expensive lesson.', { ...temporary({ stability: -.4 }, 2, -1), ...change({}) }), choice('check', 'Ask questions and walk away', 'Looking closely teaches you what to watch for.', change({}))] },
    { id: 'identity_mixup', name: 'Mistaken for someone else', description: 'An official letter accuses you of someone else\'s unpaid obligation, and repeated calls are needed to correct it.', ...temporary({}, 1, -1) },
    { id: 'smart_purchase', name: 'A housing offer comes through', description: 'A housing application you carefully compared and checked is accepted, easing a long-running worry.', kind: 'positive', statFactors: [high('intelligence')], focusFactors: ['self'], ...temporary({ stability: .2 }, 2, 1) },
    { id: 'impulse_purchase', name: 'A pushy sales demonstration', description: 'At a sales demonstration, you buy equipment you do not need and spend weeks distracted by trying to undo the purchase.', statFactors: [low('stability')], ...temporary({ intelligence: -.2 }, 2, -1) },
    { id: 'rash_move', name: 'Tempted by a sudden move', description: 'An acquaintance offers a room in another town. Already feeling unsettled, you are tempted to abandon your plans and move immediately rather than take time to think.', statFactors: [low('stability')], kind: 'neutral', choices: [choice('rush', 'Act on the impulse', 'The change brings novelty and a costly period of upheaval.', { ...change({ creativity: .4 }), ...temporary({}, 2, -1) }), choice('pause', 'Talk it through first', 'Sharing the feeling helps you choose your next steps more calmly.', change({ social: .2 }))] },
    { id: 'public_outburst', name: 'An argument at the checkout', description: 'During a dispute over your place in a queue, you lose your composure and start shouting in front of people you know.', statFactors: [low('stability')], focusFactors: ['social'], ...temporary({ social: -.4 }, 2) },
    { id: 'reckless_night', name: 'A night gets out of hand', description: 'Feeling overwhelmed, you join friends in heavy drinking and struggle to rein in your reactions. The night ends with you being asked to leave after an argument.', statFactors: [low('stability')], focusFactors: ['social'], ...temporary({ health: -.7, social: -.5 }) },
    { id: 'community_project', name: 'A neighborhood repair day', description: 'Neighbors are rebuilding a neglected community garden and ask you to help with construction or the layout.', kind: 'neutral', focusFactors: ['social'], choices: [choice('build', 'Help with the practical work', 'Working together strengthens you and builds local connections.', change({ strength: .3, social: .25 })), choice('design', 'Help with the ideas', 'A thoughtful contribution gives your imagination a purpose.', change({ creativity: .35, intelligence: .15 }))] },
    { id: 'adult_class', name: 'Free places at an evening class', description: 'The community center opens free places in electronics repair and pottery classes.', kind: 'neutral', focusFactors: ['self'], choices: [choice('technical', 'Choose a practical subject', 'A new set of ideas stretches your thinking.', change({ intelligence: .4 })), choice('creative', 'Choose a creative subject', 'Making things gives you a new outlet.', change({ creativity: .4 }))] },
    { id: 'lost_valuables', name: 'Your bag disappears', description: 'Your bag disappears from a busy cafe, taking a keepsake you cannot replace.', ...temporary({}, 1, -1) },
    { id: 'practical_solution', name: 'A repair cafe needs your help', description: 'A repair-cafe volunteer asks you to help fix a broken lamp, and together you devise an unusual replacement part.', kind: 'positive', statFactors: [high('intelligence')], focusFactors: ['self'], ...change({ creativity: .25 }) },
    { id: 'neighborhood_dispute', name: 'A dispute next door', description: 'A neighbor leaves belongings across the shared entrance. You struggle to explain the problem clearly, and frustrated exchanges turn it into an ongoing dispute.', statFactors: [low('social')], choices: [choice('talk', 'Find a compromise', 'Listening takes effort but develops your people skills.', change({})), choice('distance', 'Keep your distance', 'The immediate pressure eases, while the relationship stays cool.', { ...change({}), ...temporary({}) })] },
    { id: 'unexpected_bill', name: 'A burst pipe at home', description: 'A worn pipe that your household could not afford to replace bursts at home, leaving you to arrange repairs and worry about the damage.', statFactors: [low('lifestyle')], baseChance: .007, ...temporary({}, 1, -1) },
    { id: 'adult_good_timing', name: 'A neighbor returns your lost keys', description: 'A neighbor spots your lost keys just before you need to leave and brings them to your door.', kind: 'positive', focusFactors: ['social'], ...temporary({}, 1, 1) },
  ]),
  ...group('Working life', { minAge: 18, conditions: ['employed'], baseChance: .009, kind: 'positive' }, [
    { id: 'career_recognition', name: 'A manager reads out a thank-you', description: 'Your manager reads out a message praising your work at a team meeting.', focusFactors: ['work'], statFactors: [high('intelligence')], ...temporary({}, 2, 1) },
    { id: 'work_friend', name: 'A colleague takes you under their wing', description: 'An experienced colleague starts inviting you to lunch, sharing useful techniques and helping you settle in.', focusFactors: ['social'], statFactors: [high('social')], ...change({ intelligence: .2 }) },
    { id: 'work_error', name: 'A mistake reaches a customer', description: 'A customer spots an error in your work and sends it back, with your manager copied into the complaint.', kind: 'negative', statFactors: [low('intelligence')], neglectFactors: ['work'], ...temporary({}) },
    { id: 'work_conflict', name: 'A tense meeting', description: 'When a missed deadline comes up at a meeting, you struggle to explain your role calmly. Misunderstandings and frustrated replies turn the discussion into a personal argument.', kind: 'negative', statFactors: [low('social'), low('stability')], choices: [choice('listen', 'Ask for a calmer conversation', 'Working through it improves your ability to handle disagreement.', change({})), choice('defend', 'Push your point harder', 'You make yourself heard but strain the relationship.', change({}))] },
    { id: 'overtime_offer', name: 'Asked to cover an absent colleague', description: 'Your manager asks you to take over an absent colleague\'s duties alongside your own work.', kind: 'neutral', focusFactors: ['work'], choices: [choice('accept', 'Take it on', 'The extra responsibility develops your understanding and adds pressure.', { ...change({ intelligence: .3, stability: -.3, health: -.2 }), years: 1, focusLimits: { standard: { self: 2 } } }), choice('decline', 'Protect your balance', 'Maintaining your limits helps you feel steadier.', change({}))] },
    { id: 'work_idea', name: 'A failed system needs a workaround', description: 'A system failure stalls the team until your improvised workaround gets the work moving again.', statFactors: [high('creativity')], focusFactors: ['work'], ...change({ intelligence: .2 }), ...temporary({}, 2, 1) },
    { id: 'work_training', name: 'A specialist visits your workplace', description: 'A visiting specialist gives you hands-on training with unfamiliar equipment and answers your questions.', focusFactors: ['work'], ...change({ intelligence: .25 }) },
    { id: 'professional_network', name: 'A professional introduction', description: 'A colleague introduces you to an experienced contact who reviews your work and shares practical advice.', focusFactors: ['social'], statFactors: [high('social')], ...change({ intelligence: .2 }), ...temporary({}, 2, 1) },
    { id: 'work_overlooked', name: 'Your contribution goes unheard', description: 'You struggle to explain your contribution at a team meeting. The manager credits the most visible work without recognizing your part, leaving you discouraged.', kind: 'negative', statFactors: [low('social')], ...temporary({}, 1, -1) },
    { id: 'unsafe_lift', name: 'A strain on the job', description: 'You strain your back moving a heavy load at work and have to reduce physical duties while it heals.', kind: 'negative', conditions: ['physicalJob'], statFactors: [low('strength')], focusFactors: ['work'], ...change({ stability: -.2 }), years: 2, focusLimits: { standard: { work: 2, self: 2 } } },
    { id: 'client_impression', name: 'Chosen to welcome visitors', description: 'Your manager asks you to welcome visiting clients, whose friendly response helps the conversation flow.', statFactors: [high('social')], focusFactors: ['work'], ...change({}), ...temporary({}, 1, 1) },
    { id: 'work_boundaries', name: 'After-hours calls from your manager', description: 'Your manager starts calling with work requests during evenings you had set aside for yourself.', kind: 'neutral', focusFactors: ['work'], neglectFactors: ['self'], choices: [choice('boundaries', 'Set a clearer boundary', 'A difficult conversation protects your peace.', change({ stability: .4, social: .15 })), choice('continue', 'Keep pushing this year', 'The effort stretches your skills and your wellbeing.', { ...change({ intelligence: .3 }), ...temporary({ health: -.4, stability: -.5 }) })] },
  ]),
  ...group('Family', { minAge: 18, conditions: ['children'], baseChance: .01, kind: 'positive' }, [
    { id: 'family_tradition', name: 'A family gathering at your home', description: 'Relatives organize a shared meal at your home and bring food so you can enjoy time with your children.', focusFactors: ['family'], ...change({}) },
    { id: 'child_confides', name: 'Your child opens up', description: 'Your child tells you that a friend has been excluding them and asks what they should do.', conditions: ['olderChild'], focusFactors: ['family'], choices: [choice('listen', 'Make time to listen', 'Listening closely strengthens your ability to connect.', change({ social: .4 })), choice('solve', 'Help work out a plan', 'Thinking through it together brings clarity.', change({ intelligence: .3, social: .15 }))] },
    { id: 'missed_milestone', name: 'You miss a family celebration', description: 'You miss a celebration for your child, and seeing the photographs afterward leaves you feeling distant from everyone.', kind: 'negative', neglectFactors: ['family'], focusFactors: ['work'], ...temporary({ social: -.3 }) },
    { id: 'family_argument', name: 'An argument over family plans', description: 'A disagreement over who should arrange a family visit erupts into accusations about who makes the effort.', kind: 'negative', neglectFactors: ['family'], statFactors: [low('social')], ...temporary({}, 2) },
    { id: 'family_cooking', name: 'A relative shares a family recipe', description: 'A relative visits to teach you a family recipe, helping you improvise when an ingredient is missing.', focusFactors: ['family'], ...change({ creativity: .3 }) },
    { id: 'family_adventure', name: 'A surprise day at the coast', description: 'Relatives invite you and your children on a trip to the coast, with time to talk and explore together.', focusFactors: ['family'], ...change({ social: .1 }) },
    { id: 'parenting_doubt', name: 'Criticism shakes your parenting confidence', description: 'After a relative criticizes how you care for your child, you find it hard to put the comment in perspective. Doubt keeps interrupting your confidence in everyday decisions.', kind: 'negative', statFactors: [low('stability')], choices: [choice('support', 'Ask someone you trust', 'Advice and reassurance help you regain your footing.', change({ social: .25 })), choice('read', 'Learn more about the problem', 'Understanding the situation helps you respond more thoughtfully.', change({ intelligence: .35 }))] },
    { id: 'child_thanks', name: 'A thank-you picture from your child', description: 'Your child gives you a drawing of a day you spent together and tells you why it mattered.', conditions: ['talkingChild'], focusFactors: ['family'], ...change({}) },
  ]),
  ...group('Social life', { minAge: 6, baseChance: .008, kind: 'positive' }, [
    { id: 'friendship', name: 'Befriending a new artist nearby', description: 'You strike up an easy conversation with a new neighbor who makes art. They invite you to draw together, beginning a friendship that encourages your ideas.', focusFactors: ['social'], statFactors: [high('social')], ...change({ creativity: .2 }) },
    { id: 'conflict', name: 'A friend cancels and goes without you', description: 'A friend cancels your plans, then you learn they spent the afternoon with the same group without inviting you.', kind: 'negative', focusFactors: ['social'], ...temporary({}) },
    { id: 'social_invitation', name: 'Invited to a neighborhood gathering', description: 'A neighbor invites you to a gathering where most of the guests will be strangers.', focusFactors: ['social'], kind: 'neutral', choices: [choice('join', 'Go along', 'Meeting new people stretches your confidence.', { ...change({ social: .4 }), ...temporary({}) }), choice('quiet', 'Choose a quiet evening', 'Time to yourself helps you feel settled.', change({}))] },
    { id: 'friend_reunion', name: 'An old friend returns', description: 'An old friend returns to town and invites you to revisit a place where you used to spend time together.', minAge: 18, focusFactors: ['social'], ...change({ social: .15 }) },
    { id: 'social_misread', name: 'A joke lands badly', description: 'A social cue passes you by, and a joke hurts someone’s feelings.', kind: 'negative', focusFactors: ['social'], statFactors: [low('social')], ...temporary({}) },
    { id: 'trusted_friend', name: 'A friend asks you to mediate', description: 'Two friends disagree over a shared project, and one asks you to help them talk it through.', focusFactors: ['social'], statFactors: [high('social')], ...change({}) },
    { id: 'gossip_choice', name: 'A rumor worth repeating?', description: 'Someone shares a private story and waits for your reaction.', minAge: 13, focusFactors: ['social'], kind: 'neutral', choices: [choice('spread', 'Pass the story along', 'The attention is immediate, but trust takes a hit.', { ...change({ social: .3 }), ...temporary({ social: -.7 }, 2) }), choice('private', 'Keep it private', 'Resisting the attention leaves you feeling more grounded.', change({}))] },
    { id: 'welcoming_presence', name: 'Asked to welcome a new arrival', description: 'At a community gathering, the organizer asks you to show a newcomer around and introduce them to people.', statFactors: [high('social')], focusFactors: ['social'], ...change({}) },
    { id: 'social_comparison', name: 'Left out of the group photo', description: 'At a gathering, a group makes an unkind comment about your looks and leaves you out of its photograph. The appearance-based exclusion hurts your confidence and sense of belonging.', kind: 'negative', statFactors: [low('attractiveness')], focusFactors: ['social'], ...temporary({ social: -.3 }) },
    { id: 'friend_repair', name: 'An apology from an old friend', description: 'A friend sends an apology for an old argument and asks to meet so you can clear the air.', focusFactors: ['social'], kind: 'neutral', choices: [choice('apologize', 'Own your part', 'A sincere conversation makes connection easier.', change({ social: .4 })), choice('space', 'Ask for more time', 'You create room to settle your thoughts, though distance remains.', change({ social: -.15 }))] },
  ]),
  ...group('Health and movement', { minAge: 2, baseChance: .007, kind: 'negative' }, [
    { id: 'injury', name: 'A fall on a rough path', description: 'Feeling weak and lightheaded on an outing, you stumble on a rough path and scrape your face. You have to cut back on active outings while you recover.', statFactors: [low('health')], jobFactors: { athlete: 5, dance_instructor: 3, firefighter: 2 }, ...change({ attractiveness: -.1 }), years: 2, focusLimits: { toddler: { work: 2 }, standard: { self: 2 } } },
    { id: 'illness', name: 'A difficult infection recovery', description: 'After an infection reaches your household, you become ill and struggle to recover. The prolonged illness leaves you weak and unsettled.', minAge: 0, statFactors: [low('health')], ...temporary({ strength: -.3, stability: -.2 }) },
    { id: 'sports_sprain', name: 'A training sprain', description: 'During a sudden turn in training, you struggle to support your weight and sprain a joint, leaving it tender.', minAge: 18, conditions: ['sportsJob'], focusFactors: ['work'], statFactors: [low('strength')], jobFactors: { athlete: 3 }, ...change({ stability: -.2 }), years: 2, focusLimits: { standard: { work: 2, self: 2 } } },
    { id: 'overtraining', name: 'A coach pushes past your limits', description: 'A coach adds extra drills despite your fatigue, and your performance drops as exhaustion builds.', minAge: 18, conditions: ['sportsJob'], focusFactors: ['work'], neglectFactors: ['self'], statFactors: [low('health')], ...temporary({ strength: -.3 }) },
    { id: 'stamina_gain', name: 'A community activity pass', description: 'A local center gives you a pass for supervised pool sessions, with staff helping you stay active at your own pace.', schoolFocusFactors: ['sports'], kind: 'positive', focusFactors: ['self'], toddlerFocusFactors: ['work'], ...change({ health: .2 }) },
    { id: 'healthy_stretch', name: 'Keeping up with neighborhood games', description: 'You feel well enough to keep up with regular outdoor games organized by a neighbor. Sustained play helps build your strength and leaves you more settled.', toddlerFocusFactors: ['work'], schoolFocusFactors: ['sports'], kind: 'positive', statFactors: [high('health')], focusFactors: ['self'], ...temporary({ strength: .2 }, 2) },
    { id: 'minor_strain', name: 'A heavy door catches your arm', description: 'You struggle to hold a heavy door open and it catches your arm, leaving it sore and making daily activities frustrating.', statFactors: [low('strength')], ...change({}), years: 1, focusLimits: { toddler: { work: 3 }, standard: { self: 3 } } },
    { id: 'health_check', name: 'A clinician spots a useful change', description: 'At a check-up, a clinician spots a problem in your daily habits and shows you how to address it.', minAge: 18, kind: 'positive', focusFactors: ['self'], ...change({ health: .3, intelligence: .15 }) },
    { id: 'sport_triumph', name: 'A prize at a sporting event', description: 'You win recognition at a sporting event, and other participants come over to congratulate you.', minAge: 18, conditions: ['sportsJob'], kind: 'positive', statFactors: [high('strength')], focusFactors: ['work'], ...temporary({ social: .2 }, 2, 1) },
    { id: 'low_energy', name: 'A stomach bug disrupts your plans', description: 'A stomach bug leaves you exhausted and missing the activities where you usually see people.', statFactors: [low('health')], ...temporary({ strength: -.5, social: -.3 }) },
  ]),
  ...group('Inner life', { minAge: 5, baseChance: .007, kind: 'positive' }, [
    { id: 'inspiration', name: 'An inventor opens their workshop', description: 'At a public workshop, your inventive questions catch the owner\'s interest. The inventor invites you behind the display to explain how the machines work.', schoolFocusFactors: ['extracurricular'], focusFactors: ['self'], statFactors: [high('creativity')], ...change({ intelligence: .2 }) },
    { id: 'creative_block', name: 'Your project is rejected', description: 'An organizer rejects the creative project you submitted to a community display, shaking your confidence.', schoolFocusFactors: ['extracurricular'], kind: 'negative', focusFactors: ['self'], statFactors: [low('creativity')], ...temporary({}) },
    { id: 'mentor', name: 'A maker offers to teach you', description: 'A local maker notices a project you have been working on and offers a workshop session, teaching you how to plan and build your own designs.', focusFactors: ['work'], ...change({ intelligence: .25, creativity: .15 }) },
    { id: 'breakthrough', name: 'A puzzle designer shares their method', description: 'You quickly solve a demonstration puzzle at a workshop. Impressed by your reasoning, the designer shows you how difficult problems can become inventive games.', minAge: 6, focusFactors: ['work'], statFactors: [high('intelligence')], ...change({ creativity: .25 }) },
    { id: 'burnout', name: 'Overwhelmed by a group workload', description: 'After others drop their share of a project, you struggle to manage the pressure. Distress drives repeated late nights until your concentration and health suffer.', minAge: 13, kind: 'negative', focusFactors: ['work'], neglectFactors: ['self'], statFactors: [low('stability')], ...temporary({ intelligence: -.3, health: -.3 }, 2) },
    { id: 'crisis', name: 'Struggling to trust after a betrayal', description: 'After a friend shares something you told them in confidence, you cannot shake the distress. You begin avoiding other people even when they offer support.', minAge: 13, kind: 'negative', statFactors: [low('stability')], ...temporary({ social: -.35 }, 2) },
    { id: 'grounding_habit', name: 'A counselor visits your community group', description: 'A visiting counselor teaches your community group a calming exercise and helps you try it for yourself.', focusFactors: ['self'], ...change({ stability: .2 }) },
    { id: 'creative_share', name: 'Your work is chosen for a display', description: 'A community organizer selects something you made for a public display and invites you to meet the visitors.', schoolFocusFactors: ['extracurricular'], minAge: 13, statFactors: [high('creativity')], focusFactors: ['self'], ...change({ social: .15 }) },
    { id: 'unfiltered_message', name: 'A message sent too quickly', description: 'An emotional message leaves your phone before you have thought it through.', minAge: 13, kind: 'negative', statFactors: [low('stability')], focusFactors: ['social'], ...temporary({ social: -.3 }) },
    { id: 'quiet_confidence', name: 'Helping an activity group settle in', description: 'You stay calm while a new outdoor activity group finds its rhythm, helping others feel included. Taking part in the activities brings exercise and new connections.', schoolFocusFactors: ['sports'], statFactors: [high('stability')], focusFactors: ['self'], ...change({ health: .2, social: .1 }) },
  ]),
  ...group('Later years', { minAge: 60, baseChance: .012, kind: 'positive' }, [
    { id: 'elder_story', name: 'A local historian records your story', description: 'A relative introduces you to a local historian, who asks to interview you about the neighborhood and listens closely to your memories.', focusFactors: ['family'], ...change({ social: .3 }) },
    { id: 'elder_mentor', name: 'A young neighbor asks for advice', description: 'A younger neighbor brings you a project they are stuck on and returns later to show how your advice helped.', statFactors: [high('intelligence')], focusFactors: ['social'], ...change({ social: .2 }) },
    { id: 'elder_stiffness', name: 'Struggling with an inaccessible building', description: 'The unreliable lift in your poorly maintained building breaks again. Without an affordable accessible alternative, you struggle with the stairs and begin dreading outings.', kind: 'negative', statFactors: [low('strength'), low('lifestyle')], ...temporary({ stability: -.3 }, 2) },
    { id: 'elder_recovery', name: 'Steady progress with physiotherapy', description: 'During a physiotherapist\'s visits, your good health helps you tolerate the exercises and recover between sessions. The progress rebuilds confidence and strength.', focusFactors: ['self'], statFactors: [high('health')], ...change({ stability: .2, strength: .2 }) },
    { id: 'elder_loneliness', name: 'Withdrawing after a visitor moves away', description: 'After a regular visitor moves away, you struggle to manage the loss of contact. With little other company in your routine, you stop reaching out and spend more time alone.', kind: 'negative', neglectFactors: ['social', 'family'], statFactors: [low('stability')], ...temporary({ social: -.3 }) },
    { id: 'elder_reunion', name: 'An invitation to an old reunion', description: 'Former neighbors invite you to a reunion and bring photographs of the years you lived nearby.', focusFactors: ['social'], ...change({ social: .15 }) },
    { id: 'elder_hobby', name: 'A place at a community workshop', description: 'The community center offers you a place in either a woodworking workshop or a local-history class.', focusFactors: ['self'], choices: [choice('make', 'Make something with your hands', 'Learning a craft renews your imagination.', change({ creativity: .4 })), choice('learn', 'Explore a subject', 'Fresh ideas keep you curious.', change({ intelligence: .4 }))] },
    { id: 'elder_fall', name: 'A fall at home', description: 'A loss of balance means slowing down while you recover.', kind: 'negative', statFactors: [low('strength'), low('health')], ...change({ attractiveness: -.3, stability: -.2 }), years: 2, focusLimits: { standard: { self: 2 } } },
    { id: 'elder_perspective', name: 'Talking through an old disagreement', description: 'An old friend asks to revisit a long-standing disagreement. You keep the conversation calm, listen without rushing to defend yourself, and find a way to reconnect.', statFactors: [high('stability')], ...change({ social: .2 }) },
    { id: 'elder_record', name: 'Keeping a piece of your story', description: 'Your family suggests recording some of your memories.', focusFactors: ['family'], choices: [choice('write', 'Write them down', 'Putting memories into words becomes a creative project.', change({ creativity: .4, intelligence: .15 })), choice('tell', 'Share the stories together', 'An afternoon of conversation brings everyone closer.', change({ social: .35 }))] },
  ]),
  ...group('Good fortune', { minAge: 18, baseChance: .006, kind: 'positive' }, [
    { id: 'windfall', name: 'A stranger returns your wallet', description: 'A stranger finds your lost wallet and brings it back with everything still inside.', ...temporary({}, 2, 1) },
  ]),
  ...group('Early years', { minAge: 0, maxAge: 1, baseChance: .01, kind: 'positive' }, [
    { id: 'baby_hand_coordination', name: 'A toy library delivers a play kit', description: 'A toy-library volunteer brings easy-grip toys and shows your caregiver new reaching and matching games to play with you.', ...change({ strength: .2, intelligence: .15 }) },
    { id: 'baby_separation_anxiety', name: 'Struggling to settle with a sitter', description: 'While your regular caregiver is away, you struggle to settle with a new sitter. Repeated distress cuts short the games and shared play they try with you.', kind: 'negative', statFactors: [low('stability')], ...temporary({ social: -.2 }) },
  ]),
  ...group('Growing up', { minAge: 2, maxAge: 3, baseChance: .008, kind: 'neutral' }, [
    { id: 'toddler_swim_class', name: 'A place in swimming lessons', description: 'The local pool offers you a place in supervised swimming lessons during your usual screen time.', toddlerFocusFactors: ['work'], choices: [
      choice('swim', 'Take the lessons', 'Practice swimming instead of using electronics.', { ...change({ strength: .4, health: .15 }), ...temporary({}), focusLimits: { toddler: { social: 1 } } }),
      choice('watch', 'Watch and meet others', 'Meet other children without joining the lessons.', change({ social: .2 })),
    ] },
    { id: 'toddler_messy_paint', name: 'Invited to paint a nursery mural', description: 'A visiting artist invites you to add a picture to the nursery mural using finger paints or shape stamps.', toddlerFocusFactors: ['creative'], choices: [
      choice('experiment', 'Experiment with finger paints', 'Try new textures despite the frustration of spills.', change({ creativity: .4 })),
      choice('patterns', 'Copy shapes and patterns', 'Practice matching shapes and colors.', change({ intelligence: .25, creativity: .15 })),
    ] },
    { id: 'toddler_new_playmate', name: 'A new playmate', description: 'Another child wants to use your favorite toys.', toddlerFocusFactors: ['work'], choices: [
      choice('share', 'Take turns', 'Practice sharing even when waiting is frustrating.', change({ social: .4 })),
      choice('separate', 'Play separately', 'Keep your own toys but miss time together.', change({ social: -.15 })),
    ] },
    { id: 'toddler_nursery_days', name: 'A nursery place opens up', description: 'A local nursery offers you longer days with its play group, which would reduce your time at home.', choices: [
      choice('full_days', 'Try full days', 'Spend more time playing with other children.', { ...change({ social: .4, strength: .2 }), ...temporary({}), focusLimits: { toddler: { family: 1 } } }),
      choice('short_days', 'Keep shorter days', 'Meet other children while keeping time at home.', change({ social: .15 })),
    ] },
    { id: 'toddler_sore_fingers', name: 'Fingers caught in a drawer', description: 'While reaching into a drawer for craft supplies, you catch your fingers as it closes, leaving them too sore for drawing and crafts.', kind: 'negative', toddlerFocusFactors: ['creative'], ...temporary({ health: -.2 }), focusLimits: { toddler: { creative: 1 } } },
    { id: 'toddler_puzzle_box', name: 'A puzzle box from a neighbor', description: 'A neighbor gives you a handmade puzzle box, but one stubborn piece refuses to fit.', toddlerFocusFactors: ['creative'], choices: [
      choice('persist', 'Keep trying alone', 'Solve more of the puzzle through frustrating trial and error.', change({ intelligence: .35 })),
      choice('ask', 'Ask someone to help', 'Solve the puzzle together.', change({ intelligence: .2, social: .15 })),
    ] },
  ]),
  ...group('School', { minAge: 5, maxAge: 12, conditions: ['school'], baseChance: .006, kind: 'neutral' }, [
    { id: 'school_garden', name: 'School garden', description: 'The school garden needs a planting crew and a design.', choices: [
      choice('plant', 'Join the planting crew', 'Work outdoors during your usual free time.', { ...change({ strength: .3, health: .2 }), ...temporary({}), focusLimits: { standard: { self: 2 } } }),
      choice('design', 'Design the planting plan', 'Plan where the plants should grow.', change({ intelligence: .25, creativity: .2 })),
    ] },
    { id: 'school_friend_moves', name: 'A friend moves away', description: 'A close friend leaves your school.', kind: 'negative', focusFactors: ['social'], ...temporary({ social: -.4, stability: -.3 }, 2) },
    { id: 'school_lost_project', name: 'A lost school project', description: 'Your finished project disappears before the deadline.', kind: 'negative', focusFactors: ['work'], choices: [
      choice('rebuild', 'Rebuild it quickly', 'Repeat the work under pressure.', { ...change({ intelligence: .35 }), ...temporary({}) }),
      choice('explain', 'Explain what happened', 'Ask for help and accept an incomplete result.', change({ social: .2, intelligence: -.15 })),
    ] },
    { id: 'school_class_representative', name: 'Class representative', description: 'Your class needs someone to speak at school meetings.', focusFactors: ['social'], choices: [
      choice('stand', 'Stand for the role', 'Practice speaking while meetings reduce family time.', { ...change({ social: .45 }), ...temporary({}), focusLimits: { standard: { family: 2 } } }),
      choice('poster', 'Design a campaign poster', 'Help a classmate communicate their ideas.', change({ creativity: .3, social: .1 })),
    ] },
  ]),
  ...group('Teen years', { minAge: 13, maxAge: 16, baseChance: .006, kind: 'neutral' }, [
    { id: 'teen_answer_leak', name: 'Leaked test answers', description: 'A classmate offers you the answers before a test.', focusFactors: ['social'], choices: [
      choice('refuse', 'Refuse the answers', 'Keep your own work, despite pressure from classmates.', change({ social: -.2 })),
      choice('copy', 'Use the answers', 'Fit in with the group while skipping the learning.', change({ social: .25, intelligence: -.4 })),
    ] },
    { id: 'teen_band_disagreement', name: 'An invitation to perform divides the band', description: 'Friends invite you to perform with their band at a school show, but disagree about which song to play.', schoolFocusFactors: ['extracurricular'], focusFactors: ['self'], statFactors: [high('creativity')], choices: [
      choice('compromise', 'Work on a compromise', 'Combine ideas through stressful rehearsals.', { ...change({ social: .2 }), ...temporary({}) }),
      choice('solo', 'Make music alone', 'Keep creative control with less time around friends.', change({ social: -.2 })),
    ] },
    { id: 'teen_group_chat', name: 'An overwhelming group chat', description: 'Constant messages interrupt your downtime.', focusFactors: ['social'], kind: 'negative', choices: [
      choice('mute', 'Mute the chat', 'Protect your downtime and step back from the group.', { ...change({}), ...temporary({}), focusLimits: { standard: { social: 1 } } }),
      choice('reply', 'Keep replying', 'Stay involved while the interruptions continue.', { ...change({ social: .3 }), ...temporary({}) }),
    ] },
    { id: 'teen_first_aid', name: 'A first-aid course at the fire station', description: 'The fire station offers a first-aid course during your free afternoons.', focusFactors: ['self'], choices: [
      choice('train', 'Take the course', 'Learn practical skills during your usual personal time.', { ...change({ intelligence: .35, health: .25 }), ...temporary({}), focusLimits: { standard: { self: 2 } } }),
      choice('decline', 'Keep the afternoons free', 'Protect time to rest.', change({})),
    ] },
  ]),
  ...group('Everyday life', { minAge: 18, maxAge: 59, baseChance: .007, kind: 'neutral' }, [
    { id: 'college_noisy_housing', name: 'Noisy student housing', description: 'Noise carries through your poorly insulated student housing, and a quieter room is beyond your budget. The interruptions disrupt study and sleep.', statFactors: [low('lifestyle')], conditions: ['college'], kind: 'negative', ...temporary({ intelligence: -.25, stability: -.35 }) },
    { id: 'college_field_study', name: 'Field study offer', description: 'A field study placement would take you away from home.', conditions: ['college'], focusFactors: ['work'], choices: [
      choice('travel', 'Take the placement', 'Learn through fieldwork while spending less time with family.', { ...change({ intelligence: .45, strength: .2 }), ...temporary({}), focusLimits: { standard: { family: 1 } } }),
      choice('local', 'Research locally', 'Study the same topic close to home.', change({ intelligence: .25, creativity: .1 })),
    ] },
    { id: 'work_commute_disrupted', name: 'Your usual route closes', description: 'Repairs close your usual route to work. With no affordable alternative transport, the long detour cuts into your working time.', statFactors: [low('lifestyle')], conditions: ['employed'], kind: 'negative', ...temporary({}), focusLimits: { standard: { work: 3 } } },
    { id: 'community_kitchen', name: 'Community kitchen', description: 'A community kitchen needs organizers and cooks.', focusFactors: ['social'], choices: [
      choice('organize', 'Organize the shifts', 'Coordinate volunteers while giving up some family time.', { ...change({ social: .4, strength: .2 }), ...temporary({}), focusLimits: { standard: { family: 2 } } }),
      choice('cook', 'Learn to cook there', 'Practice cooking without a regular commitment.', change({ health: .25, intelligence: .15 })),
    ] },
  ]),
  ...group('Later years', { minAge: 60, maxAge: 83, baseChance: .008, kind: 'neutral' }, [
    { id: 'elder_safer_home', name: 'Volunteers make your home safer', description: 'A volunteer team installs brighter lights and clears awkward walkways, making it easier to move around your home.', kind: 'positive', ...temporary({ health: .3, strength: .15 }, 2) },
    { id: 'elder_walking_group', name: 'Walking group', description: 'A regular walking group meets during family visiting time.', focusFactors: ['self'], choices: [
      choice('regular', 'Join the regular walks', 'Build a routine with the group.', { ...change({ strength: .3, health: .2 }), ...temporary({}), focusLimits: { standard: { family: 2 } } }),
      choice('occasional', 'Walk when you can', 'Stay active without a fixed schedule.', change({ health: .15, social: .1 })),
    ] },
    { id: 'elder_photo_archive', name: 'A box of family photographs arrives', description: 'A relative brings you a box of old family photographs and asks for help identifying and preserving them.', focusFactors: ['family'], choices: [
      choice('digitize', 'Create a digital archive', 'Learn new tools while spending less time out with friends.', { ...change({ intelligence: .3, creativity: .35 }), ...temporary({}), focusLimits: { standard: { social: 2 } } }),
      choice('gather', 'Invite people to identify them', 'Share the work and the memories.', change({ social: .3 })),
    ] },
    { id: 'elder_heatwave', name: 'Struggling through a heatwave', description: 'During a heatwave, you become weak and unwell in the heat. The difficulty tolerating it limits outings and disrupts sleep.', kind: 'negative', statFactors: [low('health')], ...temporary({ stability: -.2 }), focusLimits: { standard: { social: 3 } } },
  ]),
  ...group('School activities', { minAge: 5, maxAge: 17, conditions: ['school'], baseChance: .008, minFocus: 1, kind: 'positive' }, [
    { id: 'school_sports_injury', name: 'An accident at practice', description: 'You hit your face during sports practice and are left with a small scar.', activityFocus: 'sports', kind: 'negative', ...change({ attractiveness: -.3 }) },
    { id: 'sports_teammate_invite', name: 'An invitation after practice', description: 'A teammate invites you to join the group after practice, helping you get to know people beyond the sessions.', activityFocus: 'sports', ...change({ social: .2 }) },
    { id: 'study_headache', name: 'Headaches interrupt your studies', description: 'Long study sessions leave you with recurring headaches, forcing you to clear time for recovery next year.', activityFocus: 'work', minFocus: 3, baseChance: .01, kind: 'negative', focusPoints: -1, years: 1 },
    { id: 'teacher_study_feedback', name: 'A teacher reviews your extra work', description: 'A teacher notices your extra work and gives you a detailed explanation that makes a difficult topic click.', activityFocus: 'work', ...change({ intelligence: .2 }) },
    { id: 'school_activity_showcase', name: 'Invited to explain your activity', description: 'Your extracurricular group asks you to introduce its work at a school open day, giving you practice speaking with visitors.', activityFocus: 'extracurricular', ...change({ social: .2 }) },
    { id: 'club_deadline_pressure', name: 'An activity deadline moves forward', description: 'An extracurricular organizer brings a group event forward, leaving you rushed to finish your preparations.', activityFocus: 'extracurricular', kind: 'negative', ...change({}) },
    { id: 'school_friends_outing', name: 'Friends invite you on an outing', description: 'Friends include you in a weekend outing, and shared games and conversation bring you closer.', activityFocus: 'social', ...change({ social: .2 }) },
    { id: 'family_recipe_lesson', name: 'A relative teaches you a family recipe', description: 'A relative invites you into the kitchen to prepare a family recipe and encourages you to invent your own variation.', activityFocus: 'family', ...change({ creativity: .2 }) },
  ]),
];

const SPORTS_JOBS = new Set(['athlete', 'personal_trainer', 'sports_coach', 'yoga_instructor', 'lifeguard', 'dance_instructor', 'outdoor_guide']);
const PHYSICAL_JOBS = new Set(['builder', 'electrician', 'plumber', 'carpenter', 'mechanic', 'welder', 'warehouse_associate', 'firefighter', 'park_ranger', 'athlete', 'personal_trainer', 'lifeguard', 'dance_instructor', 'outdoor_guide', 'housekeeper']);

function activityFocusPoints(event, state) {
  const points = state.focus?.[event.activityFocus];
  return Number.isFinite(points) ? Math.max(0, Math.min(focusMaxFor(state, event.activityFocus), points)) : 0;
}

function eligible(event, state, job) {
  if (state.age < event.minAge || state.age > (event.maxAge ?? Infinity)) return false;
  if (Object.entries(event.aptitudeChanges || {}).some(([key, amount]) => amount > 0 ? (state.aptitudes?.[key] || 0) >= 3 : (state.aptitudes?.[key] || 0) <= -3)) return false;
  if (event.activityFocus) {
    if (activityFocusPoints(event, state) < (event.minFocus || 1)) return false;
    if (['sports', 'extracurricular'].includes(event.activityFocus)
        && !activityEligible(state, schoolActivity(event.activityFocus, state.school?.[event.activityFocus]?.id))) return false;
  }
  return (event.conditions || []).every(condition => {
    if (condition === 'school') return state.age >= 5 && state.age < 18;
    // Keep old minAge metadata valid for choices already queued in saved lives.
    if (condition === 'schoolAge') return state.age >= 5;
    if (condition === 'college') return state.education?.status === 'college';
    if (condition === 'employed') return Boolean(job);
    if (condition === 'children') return state.children?.some(child => child.alive !== false);
    if (condition === 'talkingChild') return state.children?.some(child => child.alive !== false && child.age >= 3);
    if (condition === 'olderChild') return state.children?.some(child => child.alive !== false && child.age >= 6);
    if (condition === 'sportsJob') return SPORTS_JOBS.has(job?.id);
    if (condition === 'physicalJob') return PHYSICAL_JOBS.has(job?.id);
    return false;
  });
}

export function eventChances(state, stats, job) {
  const inactive = state.ended || state.needsSuccession;
  const focus = state.age < 2 ? { work: 0, social: 0, family: 0, self: 0 } : Object.fromEntries(Object.entries(state.focus || {}).map(([key, value]) => [key,
    legacyFocusValue(state.age >= 5 && state.age < 18 && ['sports', 'extracurricular'].includes(key) ? value * 2 : value,
      state.age < 5 && !['work', 'self'].includes(key) ? 2 : 3)]));
  return EVENTS.map(event => {
    let chance = inactive || !eligible(event, state, job) ? 0 : event.baseChance * (event.rare ? 1 : PERSONAL_EVENT_RATE_MULTIPLIER);
    if (event.activityFocus) chance *= activityFocusPoints(event, state);
    const focusFactors = state.age < 5 && event.toddlerFocusFactors
      || state.age >= 5 && state.age < 18 && event.schoolFocusFactors || event.focusFactors || [];
    for (const key of focusFactors) chance *= .4 + (focus[key] ?? 0) * .25;
    for (const key of event.neglectFactors || []) chance *= .25 + (5 - focus[key]) * .35;
    for (const [key, direction] of event.statFactors || []) {
      const value = Math.max(0, Math.min(10, key === 'lifestyle' ? state.lifestyle : stats[key]));
      const fraction = direction === 'low' ? (10 - value) / 9 : Math.max(0, (value - 1) / 9);
      chance *= direction === 'low' ? .08 + 3.68 * fraction ** 2 : .12 + 3.52 * fraction ** 2;
    }
    if (job && event.jobFactors?.[job.id]) chance *= event.jobFactors[job.id];
    return { id: event.id, name: event.name, chance: Math.min(event.rare ? .0006 : .18, chance) };
  });
}
