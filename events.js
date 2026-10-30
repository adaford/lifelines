// Fictional life-sim probabilities and consequences, not real-world risk estimates.
// Each eligible event gets an independent yearly roll. The engine caps a year at five.
// Low/high factors are curved so extreme traits matter much more than small changes.
const low = key => [key, 'low'];
const high = key => [key, 'high'];
const temporary = (modifiers, years = 1, lifestyle = 0) => ({ modifiers, years, ...(lifestyle ? { lifestyle } : {}) });
// Lasting learning and connection use small direct changes; short-lived strain,
// wellbeing boosts, lifestyle changes, and commitments retain timed effects.
const change = statChanges => ({ statChanges });
const choice = (id, label, description, outcome) => ({ id, label, description, ...outcome });
const group = (category, defaults, entries) => entries.map(entry => ({ category, years: 1, modifiers: {}, ...defaults, ...entry }));
export const PERSONAL_EVENT_RATE_MULTIPLIER = 3;

export const EVENTS = [
  ...group('Changing plans', { minAge: 2, baseChance: .018, kind: 'neutral' }, [
    { id: 'broken_bone', name: 'Broken bone', description: 'A broken bone means less active play and fewer outings while you recover.', kind: 'negative', focusFactors: ['self'], toddlerFocusFactors: ['work'], ...temporary({ health: -.6, strength: -.4 }), focusLimits: { toddler: { work: 2 }, standard: { social: 2 } } },
    { id: 'broken_tablet', name: 'Broken tablet', description: 'Your tablet stops working.', maxAge: 3, kind: 'negative', toddlerFocusFactors: ['social'], choices: [
      choice('borrow', 'Borrow a shared tablet', 'Sharing limits your screen time.', { ...temporary({ stability: -.2 }), focusLimits: { toddler: { social: 2 } } }),
      choice('screen_break', 'Take a screen break', 'Put screen time into other activities.', { ...change({ health: .2 }), ...temporary({}), focusLimits: { toddler: { social: 0 } } }),
    ] },
    { id: 'art_workshop', name: 'Art workshop', description: 'An art workshop overlaps with playtime.', maxAge: 3, kind: 'positive', toddlerFocusFactors: ['creative'], choices: [
      choice('join', 'Join the workshop', 'Develop your art skills with less time for play.', { ...change({ creativity: .5, intelligence: .15 }), ...temporary({}), focusLimits: { toddler: { work: 2 } } }),
      choice('skip', 'Keep your playtime', 'Spend the time playing with others.', change({ social: .2 })),
    ] },
    { id: 'extra_lessons', name: 'Extra lessons', description: 'Extra lessons would take time away from friends.', minAge: 5, maxAge: 16, conditions: ['school'], focusFactors: ['work'], choices: [
      choice('study', 'Take the lessons', 'Study more with less time for friends.', { ...change({ intelligence: .5 }), ...temporary({ stability: -.2 }), focusLimits: { standard: { social: 2 } } }),
      choice('decline', 'Keep your schedule', 'Keep your free time.', change({ stability: .15 })),
    ] },
    { id: 'rehearsal_commitment', name: 'Rehearsal commitment', description: 'A performance needs rehearsals during study time.', minAge: 5, maxAge: 16, conditions: ['school'], focusFactors: ['social'], choices: [
      choice('perform', 'Commit to rehearsals', 'Practice performing with less time for schoolwork.', { ...change({ creativity: .5, social: .2 }), ...temporary({}), focusLimits: { standard: { work: 2 } } }),
      choice('backstage', 'Help at one performance', 'Contribute without regular rehearsals.', change({ creativity: .2 })),
    ] },
    { id: 'demanding_project', name: 'Demanding work project', description: 'Leading a project would reduce your family time.', minAge: 18, conditions: ['employed'], focusFactors: ['work'], choices: [
      choice('lead', 'Lead the project', 'Build skills with less time for family.', { ...change({ intelligence: .4, social: .2 }), ...temporary({ stability: -.2 }), focusLimits: { standard: { family: 2 } } }),
      choice('share', 'Share the workload', 'Develop your skills with a lighter commitment.', change({ intelligence: .2 })),
    ] },
    { id: 'disrupted_sleep', name: 'Disrupted sleep', description: 'Poor sleep reduces your capacity for school or work.', minAge: 5, baseChance: .012, kind: 'negative', statFactors: [low('stability')], ...temporary({ health: -.3, stability: -.3 }), focusLimits: { standard: { work: 2 } } },
    { id: 'relative_needs_help', name: 'A relative needs help', description: 'A relative needs regular help during your usual work time.', minAge: 18, focusFactors: ['family'], choices: [
      choice('help', 'Help regularly', 'Support your relative with less time for work.', { ...change({ social: .4, stability: .2 }), ...temporary({}), focusLimits: { standard: { work: 2 } } }),
      choice('arrange', 'Arrange other support', 'Find help while keeping your routine.', change({ social: .15 })),
    ] },
  ]),
  ...group('Early years', { minAge: 0, maxAge: 2, baseChance: .025, kind: 'positive' }, [
    { id: 'first_words', name: 'Words find their way', description: 'A familiar sound becomes a word, and your family celebrates the discovery.', statFactors: [high('intelligence')], ...change({ intelligence: .2, social: .15 }) },
    { id: 'wobbly_steps', name: 'Wobbly steps', description: 'You find your balance and explore a little farther under watchful eyes.', statFactors: [high('strength')], ...change({ strength: .2 }) },
    { id: 'bedtime_stories', name: 'One more bedtime story', description: 'A favorite story becomes a comforting part of your evenings.', ...change({ intelligence: .2, stability: .1 }) },
    { id: 'musical_baby', name: 'A tune to remember', description: 'You keep responding to a little tune, inventing your own version of it.', statFactors: [high('creativity')], ...change({ creativity: .2 }) },
    { id: 'gentle_playgroup', name: 'New little faces', description: 'A small playgroup gives you a safe place to notice and copy other children.', ...change({ social: .2 }) },
    { id: 'baby_cold', name: 'A stuffy little nose', description: 'A cold makes the household slow down for a while.', kind: 'negative', statFactors: [low('health')], ...temporary({ health: -.6 }) },
    { id: 'teething', name: 'Teething troubles', description: 'Tender gums make an ordinary stretch of days more uncomfortable.', kind: 'negative', ...temporary({ stability: -.4 }) },
    { id: 'sleepless_baby', name: 'Restless nights', description: 'Settling down takes longer, leaving you tired and unsettled.', kind: 'negative', statFactors: [low('stability')], ...temporary({ health: -.3, stability: -.4 }) },
    { id: 'sensory_discovery', name: 'A world of textures', description: 'Safe new shapes, colors, and textures keep your attention.', ...change({ creativity: .25, intelligence: .2 }) },
    { id: 'baby_tumble', name: 'A little tumble', description: 'Exploring ends in a bump and a comforting cuddle.', kind: 'negative', statFactors: [low('strength')], ...temporary({ strength: -.25, health: -.25 }) },
    { id: 'soothing_routine', name: 'A comforting rhythm', description: 'A predictable daily routine helps you feel secure.', ...temporary({ stability: .3 }, 2) },
    { id: 'copycat_game', name: 'The copying game', description: 'You discover that making a funny face can make someone smile back.', ...change({ social: .3, creativity: .2 }) },
  ]),
  ...group('Growing up', { minAge: 2, maxAge: 12, baseChance: .011, kind: 'positive' }, [
    { id: 'treehouse', name: 'A backyard invention', description: 'Cardboard and spare cushions become a tiny world of your own.', focusFactors: ['self'], toddlerFocusFactors: ['creative'], statFactors: [high('creativity')], ...change({ intelligence: .2, creativity: .2 }) },
    { id: 'learning_bike', name: 'Finding your balance', description: 'Practice finally turns a shaky ride into a confident one.', minAge: 5, focusFactors: ['self'], statFactors: [high('strength')], ...change({ strength: .25, stability: .1 }) },
    { id: 'playground_fall', name: 'A playground fall', description: 'A misstep interrupts a lively afternoon.', kind: 'negative', statFactors: [low('strength')], focusFactors: ['social'], toddlerFocusFactors: ['work'], ...temporary({ strength: -.7, health: -.4 }) },
    { id: 'lost_toy', name: 'Your favorite toy is missing', description: 'Losing something familiar makes this year feel less settled.', kind: 'negative', statFactors: [low('stability')], ...temporary({ stability: -.5 }) },
    { id: 'child_library', name: 'A library discovery', description: 'You find a shelf of books you cannot wait to explore.', focusFactors: ['self'], toddlerFocusFactors: ['social'], statFactors: [high('intelligence')], ...change({ intelligence: .2 }) },
    { id: 'school_play', name: 'A part in the play', description: 'You are offered a small part in a community performance.', minAge: 3, conditions: ['schoolAge'], focusFactors: ['social'], choices: [choice('perform', 'Take the part', 'The stage stretches your confidence, but rehearsals feel stressful.', { ...change({ social: .4, creativity: .3 }), ...temporary({ stability: -.3 }) }), choice('backstage', 'Help backstage', 'You find a quieter way to contribute.', change({ creativity: .3, intelligence: .2 }))] },
    { id: 'child_pet', name: 'A neighbor needs a pet sitter', description: 'A neighbor asks whether you would like to help care for their pet.', minAge: 3, conditions: ['schoolAge'], focusFactors: ['family'], choices: [choice('help', 'Help with the pet', 'The routine teaches patience and brings a new connection.', change({ social: .25, stability: .25 })), choice('decline', 'Keep your own time', 'You put the spare time into an imaginative hobby.', change({ creativity: .25 }))] },
    { id: 'birthday_left_out', name: 'An invitation never comes', description: 'Being left out of a birthday gathering stings.', kind: 'negative', focusFactors: ['social'], toddlerFocusFactors: ['work'], statFactors: [low('social')], ...temporary({ social: -.5, stability: -.4 }) },
    { id: 'child_kindness', name: 'A small act of kindness', description: 'Helping someone who feels left out becomes the start of a friendship.', focusFactors: ['social'], toddlerFocusFactors: ['work'], ...change({ social: .2, stability: .1 }) },
    { id: 'child_argument', name: 'A game turns into an argument', description: 'Everyone has a different idea of what is fair.', minAge: 3, conditions: ['schoolAge'], kind: 'negative', focusFactors: ['social'], statFactors: [low('stability')], choices: [choice('listen', 'Hear everyone out', 'It takes effort to settle down and find common ground.', change({ social: .3, stability: .2 })), choice('leave', 'Leave the game', 'Space helps you calm down, but the others feel distant.', { ...change({ stability: .25 }), ...temporary({ social: -.25 }) })] },
    { id: 'family_outing', name: 'A day to remember', description: 'A simple outing with family becomes a treasured memory.', focusFactors: ['family'], ...change({ stability: .15 }) },
    { id: 'child_art', name: 'Your picture goes on the wall', description: 'Someone proudly displays your artwork, making you want to create more.', statFactors: [high('creativity')], focusFactors: ['self'], toddlerFocusFactors: ['creative'], ...change({ creativity: .2 }) },
  ]),
  ...group('School', { minAge: 5, maxAge: 17, conditions: ['school'], baseChance: .009, kind: 'positive' }, [
    { id: 'good_grades', name: 'An excellent report card', description: 'Your understanding and study time turn into a set of strong grades.', statFactors: [high('intelligence')], focusFactors: ['work'], ...change({ intelligence: .2, stability: .1 }) },
    { id: 'poor_grades', name: 'A difficult report card', description: 'Gaps in your understanding show up in your results.', kind: 'negative', statFactors: [low('intelligence')], neglectFactors: ['work'], ...temporary({ stability: -.6 }) },
    { id: 'science_prize', name: 'A science project stands out', description: 'A carefully explained experiment earns encouraging recognition.', statFactors: [high('intelligence'), high('creativity')], focusFactors: ['work'], ...change({ intelligence: .2, creativity: .15 }) },
    { id: 'reading_award', name: 'A reading milestone', description: 'A teacher notices how much your reading has grown.', statFactors: [high('intelligence')], focusFactors: ['work'], ...change({ intelligence: .2 }) },
    { id: 'school_team', name: 'A place on the school team', description: 'A coach asks you to try out for the team.', statFactors: [high('strength')], choices: [choice('join', 'Join the team', 'Training builds strength, while the busy schedule adds pressure.', { ...change({ strength: .5 }), ...temporary({ stability: -.3 }) }), choice('skip', 'Keep time for studying', 'You spend the extra time on a subject you enjoy.', change({ intelligence: .3 }))] },
    { id: 'test_anxiety', name: 'The exam room feels too quiet', description: 'Pressure makes it harder to show what you have learned.', kind: 'negative', statFactors: [low('stability')], focusFactors: ['work'], ...temporary({ intelligence: -.5, stability: -.5 }) },
    { id: 'group_project', name: 'A group project needs a plan', description: 'Your group has ideas but no shared direction.', focusFactors: ['social'], choices: [choice('lead', 'Bring the group together', 'Organizing everyone gives your social skills a workout.', change({ social: .45 })), choice('research', 'Focus on the research', 'You learn more about the subject while others coordinate.', change({ intelligence: .35 }))] },
    { id: 'school_bullying', name: 'A classmate keeps picking on you', description: 'Repeated unkind comments make school feel harder.', kind: 'negative', statFactors: [low('social')], choices: [choice('support', 'Tell a trusted adult', 'You get support, though the experience still takes time to process.', { ...change({ stability: .25 }), ...temporary({ social: -.2 }) }), choice('friends', 'Ask friends to stand with you', 'Leaning on friends builds connection while you work through the stress.', { ...change({ social: .35 }), ...temporary({ stability: -.2 }) })] },
    { id: 'spelling_final', name: 'A spelling final', description: 'You qualify for a school competition and discover how far practice can take you.', statFactors: [high('intelligence')], focusFactors: ['work'], ...change({ intelligence: .2, social: .1 }) },
    { id: 'school_music', name: 'The music teacher notices', description: 'A musical idea catches a teacher’s ear.', statFactors: [high('creativity')], focusFactors: ['self'], ...change({ creativity: .2 }) },
    { id: 'missed_homework', name: 'An assignment slips away', description: 'You fall behind on work and have to rebuild your confidence.', kind: 'negative', neglectFactors: ['work'], statFactors: [low('intelligence')], ...temporary({ intelligence: -.4, stability: -.3 }) },
    { id: 'study_buddy', name: 'A study partner', description: 'Explaining ideas to each other makes a difficult subject more approachable.', focusFactors: ['social', 'work'], ...change({ intelligence: .2, social: .1 }) },
    { id: 'school_speech', name: 'An unexpected speech', description: 'You are asked to say a few words in front of your class.', statFactors: [high('social')], choices: [choice('speak', 'Give it a try', 'You gain confidence through a nervous moment.', { ...change({ social: .45 }), ...temporary({ stability: -.2 }) }), choice('written', 'Offer a written piece', 'You express your thoughts in a form that suits you.', change({ creativity: .35 }))] },
    { id: 'school_exchange', name: 'A visiting student', description: 'A student from somewhere new shares a different view of everyday life.', focusFactors: ['social'], ...change({ social: .3, intelligence: .2 }) },
    { id: 'school_mistake', name: 'A confident answer goes wrong', description: 'An embarrassing classroom moment shakes you more than expected.', kind: 'negative', statFactors: [low('stability')], ...temporary({ social: -.4, stability: -.3 }) },
    { id: 'teacher_feedback', name: 'Feedback worth hearing', description: 'A teacher offers extra feedback on a piece of work.', focusFactors: ['work'], choices: [choice('revise', 'Try another draft', 'Working through the feedback develops your understanding.', change({ intelligence: .4 })), choice('newidea', 'Start a fresh idea', 'A different approach gets your imagination moving.', change({ creativity: .3 }))] },
  ]),
  ...group('Teen years', { minAge: 13, maxAge: 17, baseChance: .009, kind: 'neutral' }, [
    { id: 'peer_drinking', name: 'Just one drink?', description: 'At a gathering, a friend pressures you to drink with the group.', focusFactors: ['social'], statFactors: [low('stability')], choices: [choice('drink', 'Go along with it', 'You feel included, but the decision has a cost.', change({ social: 1, intelligence: -1, health: -.3 })), choice('decline', 'Say no and stay', 'Holding your boundary feels steady, even if the moment is awkward.', change({ stability: .5, social: -.2 }))] },
    { id: 'skip_class', name: 'A plan to skip class', description: 'Friends suggest spending the afternoon away from school.', focusFactors: ['social'], neglectFactors: ['work'], choices: [choice('skip', 'Join them', 'You bond over the adventure and miss useful lessons.', change({ social: .5, intelligence: -.4 })), choice('attend', 'Stay for class', 'You learn something worthwhile, but miss the shared joke.', change({ intelligence: .35, social: -.15 }))] },
    { id: 'teen_crush', name: 'Someone catches your eye', description: 'A crush makes ordinary conversations feel more significant.', focusFactors: ['social'], statFactors: [high('attractiveness')], choices: [choice('talk', 'Start a conversation', 'Making the effort builds confidence and brings some nerves.', { ...change({ social: .45 }), ...temporary({ stability: -.2 }) }), choice('private', 'Keep it to yourself', 'You channel the feeling into something creative.', change({ creativity: .3 }))] },
    { id: 'teen_rumor', name: 'A rumor spreads', description: 'A careless story makes its way around your social circle.', kind: 'negative', focusFactors: ['social'], statFactors: [low('social')], ...temporary({ social: -.7, stability: -.6 }) },
    { id: 'online_dare', name: 'A dare for the camera', description: 'A group wants you to attempt an uncomfortable stunt for attention.', focusFactors: ['social'], statFactors: [low('stability')], choices: [choice('attempt', 'Attempt the dare', 'The attention comes with a painful lesson.', change({ social: .5, health: -.7, strength: -.3 })), choice('refuse', 'Suggest a safer idea', 'Your alternative wins fewer cheers but leaves you feeling more grounded.', change({ creativity: .3, stability: .3, social: -.1 }))] },
    { id: 'teen_style', name: 'Trying a new style', description: 'You have a chance to experiment with how you present yourself.', focusFactors: ['self'], choices: [choice('bold', 'Try something bold', 'Experimenting sharpens your eye and attracts attention.', change({ attractiveness: .4, creativity: .2 })), choice('comfortable', 'Choose what feels comfortable', 'Feeling like yourself helps you feel settled.', change({ stability: .4 }))] },
    { id: 'teen_club', name: 'A club that fits', description: 'You find a group that shares an interest you thought was unusual.', focusFactors: ['social'], kind: 'positive', ...change({ social: .2, creativity: .15 }) },
    { id: 'teen_body_image', name: 'Comparisons feel louder', description: 'Comparing your appearance with others dents your confidence.', kind: 'negative', statFactors: [low('attractiveness')], focusFactors: ['social'], ...temporary({ stability: -.6, social: -.3 }) },
    { id: 'teen_volunteer', name: 'A weekend volunteering offer', description: 'A local group could use a pair of helping hands.', focusFactors: ['family'], choices: [choice('volunteer', 'Spend the weekend helping', 'Meeting people through shared work broadens your world.', change({ social: .35, strength: .15 })), choice('recharge', 'Keep a quiet weekend', 'Some time to yourself restores your balance.', change({ stability: .3 }))] },
    { id: 'teen_talent', name: 'An unexpected talent', description: 'Trying something unfamiliar reveals an ability you want to develop.', kind: 'positive', focusFactors: ['self'], statFactors: [high('creativity')], ...change({ creativity: .5 }) },
  ]),
  ...group('College', { minAge: 18, conditions: ['college'], baseChance: .012, kind: 'positive' }, [
    { id: 'college_honors', name: 'Academic honors', description: 'Your work earns recognition from the college.', statFactors: [high('intelligence')], focusFactors: ['work'], ...change({ intelligence: .25, stability: .15 }) },
    { id: 'college_research', name: 'A research invitation', description: 'A lecturer invites you to help explore a question beyond the syllabus.', statFactors: [high('intelligence')], focusFactors: ['work'], choices: [choice('research', 'Join the project', 'You learn a great deal, though the extra work is demanding.', { ...change({ intelligence: .5 }), ...temporary({ stability: -.3 }) }), choice('balance', 'Keep your current schedule', 'You protect time for yourself and your friends.', change({ stability: .3, social: .15 }))] },
    { id: 'college_exam_failure', name: 'An exam goes badly', description: 'A difficult assessment exposes gaps in your understanding.', kind: 'negative', statFactors: [low('intelligence')], neglectFactors: ['work'], ...temporary({ intelligence: -.5, stability: -.6 }) },
    { id: 'college_roommate', name: 'A roommate disagreement', description: 'Sharing a space brings different habits into conflict.', kind: 'negative', statFactors: [low('social')], choices: [choice('discuss', 'Talk through the problem', 'An uncomfortable conversation improves your ability to work with others.', change({ social: .35, stability: .15 })), choice('space', 'Spend more time elsewhere', 'The distance brings relief but weakens the connection.', change({ stability: .3, social: -.2 }))] },
    { id: 'college_society', name: 'A society welcomes you', description: 'A campus society makes a large place feel more familiar.', focusFactors: ['social'], ...change({ social: .2, stability: .1 }) },
    { id: 'college_presentation', name: 'A presentation lands well', description: 'You explain a complicated idea in a way that makes people listen.', statFactors: [high('social'), high('intelligence')], focusFactors: ['work'], ...change({ social: .35, intelligence: .25 }) },
    { id: 'college_all_nighter', name: 'The deadline is tomorrow', description: 'An unfinished assignment tempts you to work through the night.', kind: 'neutral', neglectFactors: ['work'], choices: [choice('push', 'Work through the night', 'You learn under pressure but pay for it physically.', change({ intelligence: .4, health: -.5, stability: -.3 })), choice('rest', 'Rest and submit what you have', 'You protect your health while accepting a disappointing result.', change({ health: .2, stability: -.2 }))] },
    { id: 'college_exhibition', name: 'A campus exhibition', description: 'Your creative work finds an audience on campus.', focusFactors: ['self'], statFactors: [high('creativity')], ...change({ creativity: .25, social: .1 }) },
    { id: 'college_homesick', name: 'Missing home', description: 'The distance from familiar people catches up with you.', kind: 'negative', neglectFactors: ['family'], statFactors: [low('stability')], ...temporary({ stability: -.7 }) },
    { id: 'college_peer_support', name: 'Students helping students', description: 'A peer group offers a place to share the things that feel difficult.', focusFactors: ['social'], ...temporary({ stability: .3 }, 2) },
  ]),
  ...group('Adult life', { minAge: 18, baseChance: .008, kind: 'negative' }, [
    { id: 'financial_scam', name: 'A convincing scam', description: 'A convincing false offer catches you off guard and strains your lifestyle.', statFactors: [low('intelligence')], ...temporary({ stability: -.4 }, 2, -1) },
    { id: 'investment_pitch', name: 'A too-good offer', description: 'An acquaintance pitches a chance to upgrade your lifestyle overnight.', focusFactors: ['social'], statFactors: [low('intelligence')], kind: 'neutral', choices: [choice('accept', 'Take the chance', 'The promise falls apart, leaving an expensive lesson.', { ...temporary({ stability: -.4 }, 2, -1), ...change({ intelligence: .2 }) }), choice('check', 'Ask questions and walk away', 'Looking closely teaches you what to watch for.', change({ intelligence: .3 }))] },
    { id: 'identity_mixup', name: 'A costly identity mix-up', description: 'A preventable administrative mix-up consumes time and resources.', statFactors: [low('intelligence')], ...temporary({ stability: -.3 }, 1, -1) },
    { id: 'smart_purchase', name: 'A decision pays off', description: 'Careful comparison helps you secure better everyday living arrangements.', kind: 'positive', statFactors: [high('intelligence')], focusFactors: ['self'], ...temporary({}, 2, 1) },
    { id: 'impulse_purchase', name: 'A purchase you regret', description: 'A sudden urge to buy something leaves less room for the things you need.', statFactors: [low('stability')], ...temporary({ stability: -.3 }, 2, -1) },
    { id: 'rash_move', name: 'An urge to start over', description: 'You feel a sudden urge to abandon your routines and make a dramatic change.', statFactors: [low('stability')], kind: 'neutral', choices: [choice('rush', 'Act on the impulse', 'The change brings novelty and a costly period of upheaval.', { ...change({ creativity: .4 }), ...temporary({ stability: -.6 }, 2, -1) }), choice('pause', 'Talk it through first', 'Sharing the feeling helps you choose your next steps more calmly.', change({ stability: .5, social: .2 }))] },
    { id: 'public_outburst', name: 'A public outburst', description: 'A frustrating moment spills into an argument you later regret.', statFactors: [low('stability')], focusFactors: ['social'], ...temporary({ social: -.8, stability: -.5 }, 2) },
    { id: 'reckless_night', name: 'A night gets out of hand', description: 'An impulsive series of decisions leaves you drained and embarrassed.', statFactors: [low('stability')], focusFactors: ['social'], ...temporary({ health: -.7, social: -.5 }) },
    { id: 'community_project', name: 'A neighborhood project', description: 'Neighbors are organizing something useful and ask for your help.', kind: 'neutral', focusFactors: ['social'], choices: [choice('build', 'Help with the practical work', 'Working together strengthens you and builds local connections.', change({ strength: .3, social: .25 })), choice('design', 'Help with the ideas', 'A thoughtful contribution gives your imagination a purpose.', change({ creativity: .35, intelligence: .15 }))] },
    { id: 'adult_class', name: 'A class catches your eye', description: 'A class offers a chance to learn something outside your usual routine.', kind: 'neutral', focusFactors: ['self'], choices: [choice('technical', 'Choose a practical subject', 'A new set of ideas stretches your thinking.', change({ intelligence: .4 })), choice('creative', 'Choose a creative subject', 'Making things gives you a new outlet.', change({ creativity: .4 }))] },
    { id: 'lost_valuables', name: 'Something valuable goes missing', description: 'Replacing a lost item puts temporary pressure on your everyday comfort.', statFactors: [low('intelligence')], ...temporary({}, 1, -1) },
    { id: 'practical_solution', name: 'A clever everyday solution', description: 'You solve an irritating problem with a simple idea.', kind: 'positive', statFactors: [high('intelligence')], focusFactors: ['self'], ...change({ intelligence: .25, stability: .2 }) },
    { id: 'neighborhood_dispute', name: 'A dispute next door', description: 'A disagreement with a neighbor interrupts your peace.', statFactors: [low('social')], choices: [choice('talk', 'Find a compromise', 'Listening takes effort but develops your people skills.', change({ social: .4 })), choice('distance', 'Keep your distance', 'The immediate pressure eases, while the relationship stays cool.', { ...change({ stability: .25 }), ...temporary({ social: -.2 }) })] },
    { id: 'unexpected_bill', name: 'An unwelcome repair', description: 'Something important breaks and temporarily reduces your comforts.', baseChance: .007, ...temporary({}, 1, -1) },
    { id: 'adult_good_timing', name: 'Good timing', description: 'Being in the right place at the right time brings a useful opportunity.', kind: 'positive', focusFactors: ['social'], ...temporary({ stability: .2 }, 1, 1) },
  ]),
  ...group('Working life', { minAge: 18, conditions: ['employed'], baseChance: .009, kind: 'positive' }, [
    { id: 'career_recognition', name: 'Your contribution is noticed', description: 'A strong piece of work earns recognition and better opportunities.', focusFactors: ['work'], statFactors: [high('intelligence')], ...temporary({ stability: .2 }, 2, 1) },
    { id: 'work_friend', name: 'A colleague becomes a friend', description: 'A conversation turns a familiar coworker into someone you can rely on.', focusFactors: ['social'], statFactors: [high('social')], ...change({ social: .2, stability: .1 }) },
    { id: 'work_error', name: 'An avoidable mistake', description: 'A mistake at work dents your confidence and takes effort to repair.', kind: 'negative', statFactors: [low('intelligence')], neglectFactors: ['work'], ...temporary({ intelligence: -.4, stability: -.5 }) },
    { id: 'work_conflict', name: 'A tense meeting', description: 'A disagreement at work becomes unexpectedly personal.', kind: 'negative', statFactors: [low('social'), low('stability')], choices: [choice('listen', 'Ask for a calmer conversation', 'Working through it improves your ability to handle disagreement.', change({ social: .35, stability: .2 })), choice('defend', 'Push your point harder', 'You make yourself heard but strain the relationship.', change({ social: -.4, stability: -.2 }))] },
    { id: 'overtime_offer', name: 'An extra responsibility', description: 'An opportunity at work could improve your lifestyle but demand more of you.', kind: 'neutral', focusFactors: ['work'], choices: [choice('accept', 'Take it on', 'The extra responsibility supports a better lifestyle and adds pressure.', temporary({ stability: -.6, health: -.2 }, 2, 1)), choice('decline', 'Protect your balance', 'Maintaining your limits helps you feel steadier.', change({ stability: .35 }))] },
    { id: 'work_idea', name: 'An idea saves the day', description: 'A creative approach solves a problem that had everyone stuck.', statFactors: [high('creativity')], focusFactors: ['work'], ...change({ creativity: .2 }), ...temporary({}, 2, 1) },
    { id: 'work_training', name: 'A useful training opportunity', description: 'Practical instruction sharpens a skill you use every day.', focusFactors: ['work'], ...change({ intelligence: .25 }) },
    { id: 'professional_network', name: 'A professional introduction', description: 'Someone introduces you to a person who appreciates your work.', focusFactors: ['social'], statFactors: [high('social')], ...change({ social: .2 }), ...temporary({}, 2, 1) },
    { id: 'work_overlooked', name: 'Passed over', description: 'You struggle to make your contribution understood and miss an opportunity.', kind: 'negative', statFactors: [low('social')], ...temporary({ stability: -.5 }, 1, -1) },
    { id: 'unsafe_lift', name: 'A strain on the job', description: 'Physical work leaves you with a strain that needs recovery time.', kind: 'negative', conditions: ['physicalJob'], statFactors: [low('strength')], focusFactors: ['work'], ...temporary({ strength: -.9, health: -.5 }, 2) },
    { id: 'client_impression', name: 'A strong first impression', description: 'The way you present yourself helps a work conversation start well.', statFactors: [high('attractiveness')], focusFactors: ['work'], ...change({ social: .15 }), ...temporary({}, 1, 1) },
    { id: 'work_boundaries', name: 'Work follows you home', description: 'Your working day keeps spilling into personal time.', kind: 'neutral', focusFactors: ['work'], neglectFactors: ['self'], choices: [choice('boundaries', 'Set a clearer boundary', 'A difficult conversation protects your peace.', change({ stability: .4, social: .15 })), choice('continue', 'Keep pushing this year', 'The effort stretches your skills and your wellbeing.', { ...change({ intelligence: .3 }), ...temporary({ health: -.4, stability: -.5 }) })] },
  ]),
  ...group('Family', { minAge: 18, conditions: ['children'], baseChance: .01, kind: 'positive' }, [
    { id: 'family_tradition', name: 'A tradition takes root', description: 'Time together becomes a small ritual everyone looks forward to.', focusFactors: ['family'], ...change({ stability: .2 }) },
    { id: 'child_confides', name: 'Your child opens up', description: 'Your child trusts you with something important.', conditions: ['olderChild'], focusFactors: ['family'], choices: [choice('listen', 'Make time to listen', 'Listening closely strengthens your ability to connect.', change({ social: .4, stability: .2 })), choice('solve', 'Help work out a plan', 'Thinking through it together brings clarity.', change({ intelligence: .3, social: .15 }))] },
    { id: 'missed_milestone', name: 'A moment you missed', description: 'Being elsewhere for an important family moment leaves you regretful.', kind: 'negative', neglectFactors: ['family'], focusFactors: ['work'], ...temporary({ stability: -.7, social: -.3 }) },
    { id: 'family_argument', name: 'Tension at home', description: 'Unspoken frustrations make home feel less comfortable.', kind: 'negative', neglectFactors: ['family'], statFactors: [low('social')], ...temporary({ stability: -.6 }, 2) },
    { id: 'family_cooking', name: 'An improvised family meal', description: 'Cooking together turns a routine evening into something memorable.', focusFactors: ['family'], ...change({ creativity: .3, stability: .2 }) },
    { id: 'family_adventure', name: 'A family adventure', description: 'A modest outing gives everyone a chance to reconnect.', focusFactors: ['family'], ...change({ stability: .15, social: .1 }) },
    { id: 'parenting_doubt', name: 'Second-guessing yourself', description: 'A challenging phase of family life makes you doubt your judgment.', kind: 'negative', statFactors: [low('stability')], choices: [choice('support', 'Ask someone you trust', 'Advice and reassurance help you regain your footing.', change({ social: .25, stability: .35 })), choice('read', 'Learn more about the problem', 'Understanding the situation helps you respond more thoughtfully.', change({ intelligence: .35, stability: .15 }))] },
    { id: 'child_thanks', name: 'A small thank-you', description: 'Your child finds a way to show that your time matters.', conditions: ['talkingChild'], focusFactors: ['family'], ...change({ stability: .2 }) },
  ]),
  ...group('Social life', { minAge: 6, baseChance: .008, kind: 'positive' }, [
    { id: 'friendship', name: 'A real connection', description: 'A new friendship makes life feel a little lighter.', focusFactors: ['social'], statFactors: [high('social')], ...change({ social: .2, stability: .15 }) },
    { id: 'conflict', name: 'A strained friendship', description: 'A misunderstanding creates distance between you and a friend.', kind: 'negative', focusFactors: ['social'], statFactors: [low('social')], ...temporary({ social: -.6, stability: -.4 }) },
    { id: 'social_invitation', name: 'An invitation outside your comfort zone', description: 'You are invited to spend time with people you barely know.', focusFactors: ['social'], kind: 'neutral', choices: [choice('join', 'Go along', 'Meeting new people stretches your confidence.', { ...change({ social: .4 }), ...temporary({ stability: -.2 }) }), choice('quiet', 'Choose a quiet evening', 'Time to yourself helps you feel settled.', change({ stability: .3 }))] },
    { id: 'friend_reunion', name: 'An old friend returns', description: 'Reconnecting with someone reminds you of a part of yourself you had missed.', minAge: 18, focusFactors: ['social'], ...change({ social: .15, stability: .15 }) },
    { id: 'social_misread', name: 'A joke lands badly', description: 'A social cue passes you by, and a joke hurts someone’s feelings.', kind: 'negative', focusFactors: ['social'], statFactors: [low('social')], ...temporary({ social: -.5, stability: -.3 }) },
    { id: 'trusted_friend', name: 'Someone trusts your advice', description: 'A friend turns to you for a thoughtful perspective.', focusFactors: ['social'], statFactors: [high('intelligence')], ...change({ social: .3, stability: .15 }) },
    { id: 'gossip_choice', name: 'A rumor worth repeating?', description: 'Someone shares a private story and waits for your reaction.', minAge: 13, focusFactors: ['social'], kind: 'neutral', choices: [choice('spread', 'Pass the story along', 'The attention is immediate, but trust takes a hit.', { ...change({ social: .3 }), ...temporary({ social: -.7, stability: -.2 }, 2) }), choice('private', 'Keep it private', 'Resisting the attention leaves you feeling more grounded.', change({ stability: .3 }))] },
    { id: 'welcoming_presence', name: 'People warm to you', description: 'Your presentation and approach help a new group feel at ease.', statFactors: [high('attractiveness')], focusFactors: ['social'], ...change({ social: .2 }) },
    { id: 'social_comparison', name: 'Feeling out of place', description: 'Comparing yourself with a polished group makes it hard to join in.', kind: 'negative', statFactors: [low('attractiveness')], focusFactors: ['social'], ...temporary({ stability: -.4, social: -.3 }) },
    { id: 'friend_repair', name: 'A chance to clear the air', description: 'An old disagreement comes up again, with a chance to handle it differently.', focusFactors: ['social'], kind: 'neutral', choices: [choice('apologize', 'Own your part', 'A sincere conversation makes connection easier.', change({ social: .4, stability: .2 })), choice('space', 'Ask for more time', 'You create room to settle your thoughts, though distance remains.', change({ stability: .3, social: -.15 }))] },
  ]),
  ...group('Health and movement', { minAge: 2, baseChance: .007, kind: 'negative' }, [
    { id: 'injury', name: 'An unexpected injury', description: 'An awkward movement slows you down. Recovery will take some time.', statFactors: [low('health')], jobFactors: { athlete: 5, dance_instructor: 3, firefighter: 2 }, ...temporary({ strength: -1, health: -.7 }, 2) },
    { id: 'illness', name: 'Under the weather', description: 'A lingering illness makes ordinary days harder.', minAge: 0, statFactors: [low('health')], ...temporary({ health: -1 }) },
    { id: 'sports_sprain', name: 'A training sprain', description: 'A sudden turn in training leaves a joint tender.', minAge: 18, conditions: ['sportsJob'], focusFactors: ['work'], statFactors: [low('strength')], jobFactors: { athlete: 3 }, ...temporary({ strength: -1.1, health: -.5 }, 2) },
    { id: 'overtraining', name: 'Too much, too soon', description: 'Pushing through fatigue makes training less productive.', minAge: 18, conditions: ['sportsJob'], focusFactors: ['work'], neglectFactors: ['self'], statFactors: [low('health')], ...temporary({ strength: -.8, health: -.7 }) },
    { id: 'stamina_gain', name: 'Everyday strength', description: 'Regular movement starts to make ordinary tasks feel easier.', kind: 'positive', focusFactors: ['self'], toddlerFocusFactors: ['work'], statFactors: [high('strength')], ...change({ strength: .35, health: .2 }) },
    { id: 'healthy_stretch', name: 'A healthy stretch', description: 'You have the energy to enjoy a steady, active stretch of life.', kind: 'positive', statFactors: [high('health')], focusFactors: ['self'], ...temporary({ health: .3, stability: .2 }, 2) },
    { id: 'minor_strain', name: 'An everyday strain', description: 'A task proves more physically demanding than expected.', statFactors: [low('strength')], ...temporary({ strength: -.5, health: -.3 }) },
    { id: 'health_check', name: 'A useful check-in', description: 'A routine health conversation helps you recognize an unhelpful habit.', minAge: 18, kind: 'positive', focusFactors: ['self'], ...change({ health: .3, intelligence: .15 }) },
    { id: 'sport_triumph', name: 'A personal best', description: 'Practice comes together in a performance you can be proud of.', minAge: 18, conditions: ['sportsJob'], kind: 'positive', statFactors: [high('strength')], focusFactors: ['work'], ...temporary({ strength: .3, stability: .2 }, 2, 1) },
    { id: 'low_energy', name: 'Everything takes more effort', description: 'A low-energy spell makes it harder to keep up with your usual rhythm.', statFactors: [low('health')], ...temporary({ strength: -.5, social: -.3 }) },
  ]),
  ...group('Inner life', { minAge: 5, baseChance: .007, kind: 'positive' }, [
    { id: 'inspiration', name: 'A spark of inspiration', description: 'Time for yourself leads to an interest that lights you up.', focusFactors: ['self'], statFactors: [high('creativity')], ...change({ creativity: .2 }) },
    { id: 'creative_block', name: 'The ideas will not come', description: 'Trying to make something leaves you frustrated and stuck.', kind: 'negative', focusFactors: ['self'], statFactors: [low('creativity')], ...temporary({ creativity: -.5, stability: -.3 }) },
    { id: 'mentor', name: 'Someone believes in you', description: 'A patient mentor notices your potential and helps you find your footing.', focusFactors: ['work'], ...change({ intelligence: .25, creativity: .15 }) },
    { id: 'breakthrough', name: 'A difficult idea clicks', description: 'A challenge you have worked on finally begins to make sense.', minAge: 6, focusFactors: ['work'], statFactors: [high('intelligence')], ...change({ intelligence: .25 }) },
    { id: 'burnout', name: 'Running on empty', description: 'Sustained pressure catches up with you. Recovery needs time and support.', minAge: 13, kind: 'negative', focusFactors: ['work'], neglectFactors: ['self'], statFactors: [low('stability')], ...temporary({ intelligence: -.6, health: -.5, stability: -.6 }, 2) },
    { id: 'crisis', name: 'A difficult emotional year', description: 'Distress disrupts your routines and relationships, making support more valuable.', minAge: 13, kind: 'negative', statFactors: [low('stability')], ...temporary({ social: -.7, stability: -.7 }, 2) },
    { id: 'grounding_habit', name: 'A habit that helps', description: 'A small routine gives you a more reliable sense of balance.', focusFactors: ['self'], ...change({ stability: .2 }) },
    { id: 'creative_share', name: 'Something you made finds an audience', description: 'People connect with something you created in your own time.', minAge: 13, statFactors: [high('creativity')], focusFactors: ['self'], ...change({ creativity: .2, social: .15 }) },
    { id: 'unfiltered_message', name: 'A message sent too quickly', description: 'An emotional message leaves your phone before you have thought it through.', minAge: 13, kind: 'negative', statFactors: [low('stability')], focusFactors: ['social'], ...temporary({ social: -.7, stability: -.3 }) },
    { id: 'quiet_confidence', name: 'More comfortable in yourself', description: 'Time spent understanding yourself makes difficult moments feel more manageable.', statFactors: [high('stability')], focusFactors: ['self'], ...change({ stability: .2, social: .1 }) },
  ]),
  ...group('Later years', { minAge: 60, baseChance: .012, kind: 'positive' }, [
    { id: 'elder_story', name: 'A story worth passing on', description: 'Someone asks about your past and listens more closely than you expected.', focusFactors: ['family'], ...change({ social: .3, stability: .2 }) },
    { id: 'elder_mentor', name: 'Your experience helps someone', description: 'You help a younger person see a problem from a different angle.', statFactors: [high('intelligence')], focusFactors: ['social'], ...change({ social: .2, stability: .15 }) },
    { id: 'elder_stiffness', name: 'A stiff spell', description: 'Movement feels less comfortable for a while.', kind: 'negative', statFactors: [low('strength')], ...temporary({ strength: -.7, health: -.3 }, 2) },
    { id: 'elder_recovery', name: 'Getting your stride back', description: 'Steady care helps you regain confidence in everyday movement.', focusFactors: ['self'], statFactors: [high('health')], ...change({ health: .35, strength: .2 }) },
    { id: 'elder_loneliness', name: 'The house feels quiet', description: 'A stretch without much connection weighs on you.', kind: 'negative', neglectFactors: ['social', 'family'], statFactors: [low('stability')], ...temporary({ stability: -.7, social: -.3 }) },
    { id: 'elder_reunion', name: 'Faces from another chapter', description: 'A reunion brings back shared stories and unexpected laughter.', focusFactors: ['social'], ...change({ stability: .2, social: .15 }) },
    { id: 'elder_hobby', name: 'A new hobby at your own pace', description: 'You find an interest that suits the rhythm of this stage of life.', focusFactors: ['self'], choices: [choice('make', 'Make something with your hands', 'Learning a craft renews your imagination.', change({ creativity: .4 })), choice('learn', 'Explore a subject', 'Fresh ideas keep you curious.', change({ intelligence: .4 }))] },
    { id: 'elder_fall', name: 'A fall at home', description: 'A loss of balance means slowing down while you recover.', kind: 'negative', statFactors: [low('strength'), low('health')], ...temporary({ strength: -.9, health: -.8 }, 2) },
    { id: 'elder_perspective', name: 'A calmer perspective', description: 'Experience helps you put a long-standing worry in perspective.', statFactors: [high('stability')], ...change({ stability: .2 }) },
    { id: 'elder_record', name: 'Keeping a piece of your story', description: 'Your family suggests recording some of your memories.', focusFactors: ['family'], choices: [choice('write', 'Write them down', 'Putting memories into words becomes a creative project.', change({ creativity: .4, intelligence: .15 })), choice('tell', 'Share the stories together', 'An afternoon of conversation brings everyone closer.', change({ social: .35, stability: .25 }))] },
  ]),
  ...group('Good fortune', { minAge: 18, baseChance: .006, kind: 'positive' }, [
    { id: 'windfall', name: 'A little good fortune', description: 'An unexpected benefit gives your everyday lifestyle a welcome boost.', ...temporary({}, 2, 1) },
  ]),
  ...group('Early years', { minAge: 0, maxAge: 1, baseChance: .01, kind: 'positive' }, [
    { id: 'baby_hand_coordination', name: 'Reaching and grasping', description: 'You start picking up small toys accurately.', ...change({ strength: .2, intelligence: .15 }) },
    { id: 'baby_separation_anxiety', name: 'Separation anxiety', description: 'Unfamiliar caregivers leave you unsettled.', kind: 'negative', statFactors: [low('stability')], ...temporary({ stability: -.4, social: -.2 }) },
  ]),
  ...group('Growing up', { minAge: 2, maxAge: 3, baseChance: .008, kind: 'neutral' }, [
    { id: 'toddler_swim_class', name: 'Swimming lessons', description: 'Swimming lessons overlap with screen time.', toddlerFocusFactors: ['work'], choices: [
      choice('swim', 'Take the lessons', 'Practice swimming instead of using electronics.', { ...change({ strength: .4, health: .15 }), ...temporary({}), focusLimits: { toddler: { social: 1 } } }),
      choice('watch', 'Watch and meet others', 'Meet other children without joining the lessons.', change({ social: .2 })),
    ] },
    { id: 'toddler_messy_paint', name: 'A messy paint project', description: 'Choose how to make a picture.', toddlerFocusFactors: ['creative'], choices: [
      choice('experiment', 'Experiment with finger paints', 'Try new textures despite the frustration of spills.', change({ creativity: .4, stability: -.15 })),
      choice('patterns', 'Copy shapes and patterns', 'Practice matching shapes and colors.', change({ intelligence: .25, creativity: .15 })),
    ] },
    { id: 'toddler_new_playmate', name: 'A new playmate', description: 'Another child wants to use your favorite toys.', toddlerFocusFactors: ['work'], choices: [
      choice('share', 'Take turns', 'Practice sharing even when waiting is frustrating.', change({ social: .4, stability: -.15 })),
      choice('separate', 'Play separately', 'Keep your own toys but miss time together.', change({ stability: .25, social: -.15 })),
    ] },
    { id: 'toddler_nursery_days', name: 'Longer nursery days', description: 'More nursery time would mean less time at home.', choices: [
      choice('full_days', 'Try full days', 'Spend more time playing with other children.', { ...change({ social: .4, strength: .2 }), ...temporary({}), focusLimits: { toddler: { family: 1 } } }),
      choice('short_days', 'Keep shorter days', 'Meet other children while keeping time at home.', change({ social: .15, stability: .1 })),
    ] },
    { id: 'toddler_sore_fingers', name: 'Sore fingers', description: 'Sore fingers interrupt drawing and crafts.', kind: 'negative', toddlerFocusFactors: ['creative'], ...temporary({ health: -.2 }), focusLimits: { toddler: { creative: 1 } } },
    { id: 'toddler_puzzle_box', name: 'A tricky puzzle box', description: 'The last pieces will not fit.', toddlerFocusFactors: ['social'], choices: [
      choice('persist', 'Keep trying alone', 'Solve more of the puzzle through frustrating trial and error.', change({ intelligence: .35, stability: -.15 })),
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
      choice('rebuild', 'Rebuild it quickly', 'Repeat the work under pressure.', { ...change({ intelligence: .35 }), ...temporary({ stability: -.3 }) }),
      choice('explain', 'Explain what happened', 'Ask for help and accept an incomplete result.', change({ social: .2, intelligence: -.15, stability: .1 })),
    ] },
    { id: 'school_class_representative', name: 'Class representative', description: 'Your class needs someone to speak at school meetings.', focusFactors: ['social'], choices: [
      choice('stand', 'Stand for the role', 'Practice speaking while meetings reduce family time.', { ...change({ social: .45 }), ...temporary({ stability: -.2 }), focusLimits: { standard: { family: 2 } } }),
      choice('poster', 'Design a campaign poster', 'Help a classmate communicate their ideas.', change({ creativity: .3, social: .1 })),
    ] },
  ]),
  ...group('Teen years', { minAge: 13, maxAge: 16, baseChance: .006, kind: 'neutral' }, [
    { id: 'teen_answer_leak', name: 'Leaked test answers', description: 'A classmate offers you the answers before a test.', focusFactors: ['social'], choices: [
      choice('refuse', 'Refuse the answers', 'Keep your own work, despite pressure from classmates.', change({ stability: .35, social: -.2 })),
      choice('copy', 'Use the answers', 'Fit in with the group while skipping the learning.', change({ social: .25, intelligence: -.4 })),
    ] },
    { id: 'teen_band_disagreement', name: 'Band disagreement', description: 'Your band disagrees about what to perform.', focusFactors: ['self'], statFactors: [high('creativity')], choices: [
      choice('compromise', 'Work on a compromise', 'Combine ideas through stressful rehearsals.', { ...change({ creativity: .35, social: .2 }), ...temporary({ stability: -.3 }) }),
      choice('solo', 'Make music alone', 'Keep creative control with less time around friends.', change({ creativity: .3, stability: .2, social: -.2 })),
    ] },
    { id: 'teen_group_chat', name: 'An overwhelming group chat', description: 'Constant messages interrupt your downtime.', focusFactors: ['social'], kind: 'negative', choices: [
      choice('mute', 'Mute the chat', 'Protect your downtime and step back from the group.', { ...change({ stability: .35 }), ...temporary({}), focusLimits: { standard: { social: 1 } } }),
      choice('reply', 'Keep replying', 'Stay involved while the interruptions continue.', { ...change({ social: .3 }), ...temporary({ stability: -.35 }) }),
    ] },
    { id: 'teen_first_aid', name: 'First-aid course', description: 'A first-aid course would use your free afternoons.', focusFactors: ['self'], choices: [
      choice('train', 'Take the course', 'Learn practical skills during your usual personal time.', { ...change({ intelligence: .35, health: .25 }), ...temporary({}), focusLimits: { standard: { self: 2 } } }),
      choice('decline', 'Keep the afternoons free', 'Protect time to rest.', change({ stability: .2 })),
    ] },
  ]),
  ...group('Everyday life', { minAge: 18, maxAge: 59, baseChance: .007, kind: 'neutral' }, [
    { id: 'college_noisy_housing', name: 'Noisy student housing', description: 'Noise in your building interrupts study and sleep.', conditions: ['college'], kind: 'negative', ...temporary({ intelligence: -.25, stability: -.35 }) },
    { id: 'college_field_study', name: 'Field study offer', description: 'A field study placement would take you away from home.', conditions: ['college'], focusFactors: ['work'], choices: [
      choice('travel', 'Take the placement', 'Learn through fieldwork while spending less time with family.', { ...change({ intelligence: .45, strength: .2 }), ...temporary({}), focusLimits: { standard: { family: 1 } } }),
      choice('local', 'Research locally', 'Study the same topic close to home.', change({ intelligence: .25, creativity: .1 })),
    ] },
    { id: 'work_commute_disrupted', name: 'Commute disruption', description: 'Transport disruption cuts into your working time.', conditions: ['employed'], kind: 'negative', ...temporary({ stability: -.3 }), focusLimits: { standard: { work: 3 } } },
    { id: 'community_kitchen', name: 'Community kitchen', description: 'A community kitchen needs organizers and cooks.', focusFactors: ['social'], choices: [
      choice('organize', 'Organize the shifts', 'Coordinate volunteers while giving up some family time.', { ...change({ social: .4, strength: .2 }), ...temporary({}), focusLimits: { standard: { family: 2 } } }),
      choice('cook', 'Learn to cook there', 'Practice cooking without a regular commitment.', change({ health: .25, intelligence: .15 })),
    ] },
  ]),
  ...group('Later years', { minAge: 60, maxAge: 83, baseChance: .008, kind: 'neutral' }, [
    { id: 'elder_safer_home', name: 'Safer home layout', description: 'Better lighting and clear walkways make moving around easier.', kind: 'positive', ...temporary({ health: .3, strength: .15 }, 2) },
    { id: 'elder_walking_group', name: 'Walking group', description: 'A regular walking group meets during family visiting time.', focusFactors: ['self'], choices: [
      choice('regular', 'Join the regular walks', 'Build a routine with the group.', { ...change({ strength: .3, health: .2 }), ...temporary({}), focusLimits: { standard: { family: 2 } } }),
      choice('occasional', 'Walk when you can', 'Stay active without a fixed schedule.', change({ health: .15, social: .1 })),
    ] },
    { id: 'elder_photo_archive', name: 'Old photo collection', description: 'Old photographs need sorting and identifying.', focusFactors: ['family'], choices: [
      choice('digitize', 'Create a digital archive', 'Learn new tools while spending less time out with friends.', { ...change({ intelligence: .3, creativity: .35 }), ...temporary({}), focusLimits: { standard: { social: 2 } } }),
      choice('gather', 'Invite people to identify them', 'Share the work and the memories.', change({ social: .3, stability: .2 })),
    ] },
    { id: 'elder_heatwave', name: 'A difficult heatwave', description: 'Persistent heat limits outings and disrupts sleep.', kind: 'negative', statFactors: [low('health')], ...temporary({ health: -.4, stability: -.2 }), focusLimits: { standard: { social: 3 } } },
  ]),
];

const SPORTS_JOBS = new Set(['athlete', 'personal_trainer', 'sports_coach', 'yoga_instructor', 'lifeguard', 'dance_instructor', 'outdoor_guide']);
const PHYSICAL_JOBS = new Set(['builder', 'electrician', 'plumber', 'carpenter', 'mechanic', 'welder', 'warehouse_associate', 'firefighter', 'park_ranger', 'athlete', 'personal_trainer', 'lifeguard', 'dance_instructor', 'outdoor_guide', 'housekeeper']);

function eligible(event, state, job) {
  if (state.age < event.minAge || state.age > (event.maxAge ?? Infinity)) return false;
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
  const focus = state.age < 2 ? { work: 0, social: 0, family: 0, self: 0 } : state.focus;
  return EVENTS.map(event => {
    let chance = inactive || !eligible(event, state, job) ? 0 : event.baseChance * PERSONAL_EVENT_RATE_MULTIPLIER;
    const focusFactors = state.age < 5 && event.toddlerFocusFactors || event.focusFactors || [];
    for (const key of focusFactors) chance *= .4 + (focus[key] ?? 0) * .25;
    for (const key of event.neglectFactors || []) chance *= .25 + (5 - focus[key]) * .35;
    for (const [key, direction] of event.statFactors || []) {
      const value = Math.max(0, Math.min(10, key === 'lifestyle' ? state.lifestyle : stats[key]));
      const fraction = direction === 'low' ? (10 - value) / 9 : Math.max(0, (value - 1) / 9);
      chance *= direction === 'low' ? .08 + 3.68 * fraction ** 2 : .12 + 3.52 * fraction ** 2;
    }
    if (job && event.jobFactors?.[job.id]) chance *= event.jobFactors[job.id];
    return { id: event.id, name: event.name, chance: Math.min(.18, chance) };
  });
}
