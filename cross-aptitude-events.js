// Rare fictional experiences can change a different natural aptitude by one.
// Each ordered pair has both an encouraging and a discouraging experience.
export const APTITUDE_EVENT_STATS = ['health', 'stability', 'attractiveness', 'intelligence', 'strength', 'social', 'creativity'];
// Source stats shape participation, selection or response, not unrelated external incidents.
// Keep these encounters suitable from age five through adulthood unless gated below.
const experiences = {
  health: {
    stability: [
      ['You help your walking group reach shelter', 'Staying well enough to keep going during a storm lets you help a ranger guide tired walkers to shelter; the supervised experience teaches you lasting ways to handle pressure.'],
      ['Repeated illness interrupts your recovery', 'Repeated bouts of illness interrupt your recovery and keep you returning for treatment; uncertainty about your health leaves you more fearful of later setbacks.'],
    ],
    attractiveness: [
      ['A place in the outdoor portrait project', 'Your energy on a community walk helps you keep up with a photographer’s outdoor portrait sessions; regular coaching in posture and presentation changes how you carry yourself.'],
      ['A skin infection leaves its mark', 'An infection develops while you are already unwell, leaving lasting marks and a more demanding skin-care routine.'],
    ],
    intelligence: [
      ['A naturalist takes you along', 'Keeping up on a long nature walk earns you an invitation to help a naturalist identify specimens and test explanations.'],
      ['Illness interrupts your tutoring', 'Repeated illness leaves you too unwell to attend tutoring sessions; missed explanations build into gaps that make unfamiliar lessons harder to grasp.'],
    ],
    strength: [
      ['A circus instructor offers lessons', 'Your energy catches a visiting circus instructor’s attention, and a course of balance and tumbling lessons changes how you move.'],
      ['Illness interrupts rehabilitation', 'Recurring illness keeps you from completing supervised rehabilitation sessions; the interrupted recovery leaves you with lasting difficulty controlling your movements.'],
    ],
    social: [
      ['The walking club saves you a place', 'Staying well lets you attend the walking club regularly; its organizer begins pairing you with newcomers each week and coaches you in drawing them into conversation.'],
      ['Your group replaces you', 'Repeated sick days lead a club organizer to give your place to someone else; being shut out makes approaching new groups harder.'],
    ],
    creativity: [
      ['An artist joins the expedition', 'Good health lets you keep up with an outdoor expedition and its daily sketching sessions; a visiting artist teaches you to turn unfamiliar plants and landscapes into invented scenes.'],
      ['Your workshop place is withdrawn', 'An art workshop gives away your place after repeated illness absences, cutting off the encouragement that kept you experimenting.'],
    ],
  },
  stability: {
    health: [
      ['A nurse asks you to help', 'Your calm manner at a community health session leads a nurse to invite you back as a helper, teaching you habits you keep using.'],
      ['Stress disrupts your sleep during repairs', 'While repairs put your household in temporary rooms, you struggle to settle your worries at night; prolonged distress and broken sleep leave your health more vulnerable afterward.'],
    ],
    attractiveness: [
      ['A costume designer needs a model', 'You stay patient through a chaotic costume fitting, and the designer offers regular help with clothes, posture, and presentation.'],
      ['A grooming appointment becomes overwhelming', 'Distress during a grooming appointment makes it hard to stay still or explain that you need a pause; an accidental scalp injury leaves lasting marks and makes future grooming harder.'],
    ],
    intelligence: [
      ['A puzzle maker becomes your mentor', 'A puzzle maker notices your patience at a community fair and invites you to test new puzzles, teaching you how to break problems apart.'],
      ['Anxiety drives you from a course', 'After a difficult lesson, anxiety makes it hard to return to the course or ask for help; missed sessions and repeated avoidance leave unfamiliar problems harder to approach.'],
    ],
    strength: [
      ['A climbing coach takes an interest', 'You keep calm after a difficult attempt at an indoor climbing session, and a coach offers patient lessons in balance and body control.'],
      ['Nerves interrupt your training', 'Repeatedly overwhelmed during a supervised training course, you withdraw before learning the movements; avoiding further practice leaves coordination harder to rebuild.'],
    ],
    social: [
      ['Asked to help settle a dispute', 'A community organizer sees you stay calm during an argument and invites you to help resolve future disputes, teaching you how to listen.'],
      ['A shared worry leaves you guarded', 'After someone shares a private worry you told them, prolonged distress makes it hard to risk another conversation; withdrawing from others leaves you less practiced at building trust.'],
    ],
    creativity: [
      ['The mural artist hands you a brush', 'When rain ruins part of a community mural, your calm response impresses the artist, who invites you to help invent a replacement.'],
      ['Criticism drives you from a workshop', 'A harsh comment during a workshop overwhelms you; you leave and repeatedly avoid unfinished work afterward, making unfamiliar creative ideas harder to explore.'],
    ],
  },
  attractiveness: {
    health: [
      ['A portrait project includes a health coach', 'A community portrait project chooses you for your photogenic appearance and pairs you with a health coach whose practical support improves your lasting self-care.'],
      ['A seller exploits your insecurity', 'After hearing cruel remarks about your appearance, you trust a seller’s supposed beauty remedy; it makes you ill and leaves lingering health problems.'],
    ],
    stability: [
      ['A photographer stands up for you', 'A photographer chooses your distinctive looks for an exhibition and firmly stops onlookers commenting on them, giving you a lasting example of setting boundaries.'],
      ['Your appearance becomes a cruel joke', 'Someone targets your appearance in a photograph and circulates cruel captions; repeated ridicule leaves you less able to shrug off later setbacks.'],
    ],
    intelligence: [
      ['Behind the scenes at a photo studio', 'Chosen for a community portrait because of your distinctive looks, you befriend the photographer, who invites you back to learn the experiments behind lighting and lenses.'],
      ['A tutor judges you by your looks', 'A tutor repeatedly dismisses your questions with comments about your appearance, wearing down your confidence in asking and learning.'],
    ],
    strength: [
      ['A dance director spots you', 'Your striking appearance catches a community dance director’s attention during an audition; they offer lessons that give you a new feel for balance and movement.'],
      ['A trainer makes you the target', 'A trainer repeatedly mocks your appearance during group exercises; you withdraw from the sessions and struggle to regain your coordination.'],
    ],
    social: [
      ['The festival host recruits you', 'Your striking appearance catches a festival host’s eye; an invitation to work beside them at the welcome desk leads to coaching in putting strangers at ease.'],
      ['Turned away from the group photograph', 'A group organizer excludes you from its publicity photograph because of your looks, leaving you wary and withdrawn around new people.'],
    ],
    creativity: [
      ['A portrait artist invites you back', 'An artist chooses your distinctive features for a portrait, then invites you to experiment with costumes and backdrops, opening a new way to express ideas.'],
      ['A costume contest turns cruel', 'A costume judge ignores your design and ridicules your appearance; the public dismissal makes it harder to take creative risks.'],
    ],
  },
  intelligence: {
    health: [
      ['A nurse answers all your questions', 'Your questions at a health fair prompt a nurse to invite you to a series of practical sessions, where you learn how to care for yourself through setbacks.'],
      ['A misleading health demonstration', 'A visiting seller’s confusing demonstration convinces you to try an unsafe remedy, causing an illness that leaves your health more fragile.'],
    ],
    stability: [
      ['You uncover a rigged competition', 'You spot a flaw in a competition’s scoring; an organizer investigates and corrects it, teaching you that confusing setbacks can be challenged.'],
      ['A competition’s rules prove confusing', 'You struggle to understand a competition’s new rules and repeatedly make mistakes despite explanations; correction in front of the group leaves unfamiliar situations harder to face calmly.'],
    ],
    attractiveness: [
      ['A costume conservator shares their methods', 'Your questions about an old costume impress its conservator, who teaches you how fabric, fit, and careful grooming change presentation.'],
      ['Skin-care instructions are misunderstood', 'You misunderstand the instructions for a skin treatment and use it incorrectly; the resulting irritation leaves lasting marks and makes future care more difficult.'],
    ],
    strength: [
      ['A coach shows you the slow-motion footage', 'Your questions about a sports demonstration lead a coach to review slow-motion footage with you, revealing movement techniques you can finally use.'],
      ['A drill’s sequence proves confusing', 'You struggle to understand the sequence of an unfamiliar drill and begin the wrong movement before the instructor can stop you; the injury leaves lasting trouble with coordination.'],
    ],
    social: [
      ['Asked to explain the exhibit', 'A museum volunteer hears you explain an exhibit and invites you to help visitors, coaching you on questions, listening, and conversation.'],
      ['A joke is used to humiliate you', 'A group deliberately gives you misleading instructions, then laughs when you take them seriously; joining conversations becomes harder afterward.'],
    ],
    creativity: [
      ['An inventor opens the workshop', 'You solve a problem at an invention fair, and its organizer invites you into a workshop where discarded parts become experimental machines.'],
      ['A construction kit defeats your plans', 'You struggle to understand a construction kit’s plans and to learn from repeated failed assemblies; frustration with the project makes you reluctant to try unfamiliar designs.'],
    ],
  },
  strength: {
    health: [
      ['A swimming instructor offers a place', 'Your strength at an open swim session catches an instructor’s attention, earning you a place in a course that builds lasting healthy habits.'],
      ['A trip leader pushes too far', 'A trip leader ignores your difficulty keeping up and refuses extra breaks; exhaustion turns into a prolonged illness with lasting effects.'],
    ],
    stability: [
      ['Trusted with the rescue rope', 'At a supervised rescue demonstration, your strength earns you a role holding the safety rope, and the instructor helps you learn to handle pressure.'],
      ['Left behind on the group walk', 'A walk leader leaves you behind when you cannot keep pace; the frightening wait makes later setbacks harder to face calmly.'],
    ],
    attractiveness: [
      ['A movement director offers coaching', 'A movement director notices your strength at a community performance and offers individual coaching in posture and how you carry yourself.'],
      ['A heavy display collapses', 'An organizer asks you to steady a display that is too heavy for you; it falls, leaving a facial scar and lingering difficulty with posture.'],
    ],
    intelligence: [
      ['A craftsperson offers an apprenticeship', 'A craftsperson notices how steadily you lift and hold heavy materials and invites you to supervised sessions exploring measurements, mechanisms, and repairs.'],
      ['Shut out of the practical workshop', 'A workshop leader mistakes your difficulty handling tools for lack of interest and bars you from experiments, cutting off a way of learning that mattered to you.'],
    ],
    social: [
      ['The recess captain picks you first', 'Your strong throws impress the other kids at recess, and a team captain invites you to help welcome new players, showing you how to bring others into the game.'],
      ['A team captain keeps shutting you out', 'A team captain repeatedly refuses to pick you at recess because you struggle to keep up; the exclusion makes joining conversations harder.'],
    ],
    creativity: [
      ['A sculptor invites you into the studio', 'Your strength helps you handle large clay forms at a community session; a sculptor invites you to experiment with unfamiliar materials in supervised studio sessions.'],
      ['A sculpture is too heavy to finish', 'You struggle to hold and join the heavy sections of a sculpture, and repeated collapses damage your work; abandoning the project makes new experiments harder to attempt.'],
    ],
  },
  social: {
    health: [
      ['A retired nurse becomes a regular visitor', 'A conversation with a retired nurse turns into regular visits, with practical encouragement that changes how you look after your health.'],
      ['Symptoms are difficult to explain', 'At a clinic, you struggle to explain how your symptoms have changed or ask when the advice is unclear; delayed follow-up lets an illness leave a lasting health setback.'],
    ],
    stability: [
      ['Invited to help welcome newcomers', 'A community organizer notices how easily you include strangers and invites you to help run a welcome group, where a mentor teaches you to handle conflict.'],
      ['A misunderstanding becomes an argument', 'You struggle to explain a private concern, and the conversation becomes a public argument; difficulty repairing the misunderstanding leaves later conflicts harder to handle.'],
    ],
    attractiveness: [
      ['A costume maker becomes a friend', 'Chatting at a community show leads to regular visits with a costume maker, who helps you find clothes, grooming, and posture that suit you.'],
      ['A styling request is misunderstood', 'At a styling appointment, you struggle to explain what irritates your skin or object when the plan is unclear; an unsuitable treatment leaves lasting marks and makes self-care harder.'],
    ],
    intelligence: [
      ['A chess player takes you under their wing', 'A friendly conversation at the library leads a skilled chess player to invite you back for regular lessons in planning and problem-solving.'],
      ['A study circle falls out', 'You struggle to negotiate disagreements in your study circle or ask clearly for the help you need; leaving the group cuts off support and makes learning with others harder.'],
    ],
    strength: [
      ['A dancer offers to teach you', 'You strike up a conversation after a community performance, and a dancer offers regular lessons in rhythm, balance, and coordination.'],
      ['A practice warning goes unheard', 'During paired practice, you struggle to make it clear that you are not ready for the next movement; the pair moves out of step, causing an injury that makes coordination harder afterward.'],
    ],
    creativity: [
      ['A storyteller invites you backstage', 'Your conversation with a visiting storyteller earns an invitation backstage, followed by regular sessions inventing characters and scenes together.'],
      ['Your collaborator takes all the credit', 'Unable to make your role heard, you watch a collaborator claim your shared project as their own; the betrayal makes it harder to offer new ideas.'],
    ],
  },
  creativity: {
    health: [
      ['Your poster brings a nurse to visit', 'A nurse notices your imaginative health-fair poster and invites you to help make future displays, teaching you practical self-care along the way.'],
      ['An improvised project uses unsafe materials', 'Unable to find a workable design with the supplies provided, you try an unsuitable substitute without changing your plan; a serious skin reaction leaves your health more fragile.'],
    ],
    stability: [
      ['A puppeteer offers a place in the troupe', 'A puppeteer spots your homemade character and invites you to help with a show, teaching you ways to express and work through difficult feelings.'],
      ['A new workshop style leaves you stuck', 'A workshop asks you to express a difficult experience in an unfamiliar style; struggling to find another way to develop your work, you leave without that outlet and find later setbacks harder to manage.'],
    ],
    attractiveness: [
      ['A designer wants to develop your costume', 'Your handmade costume catches a designer’s attention, and working together teaches you new ways to use fit, color, and presentation.'],
      ['A costume design is hard to adapt', 'You struggle to adapt a costume design to softer materials and keep a rigid piece that rubs your face during rehearsals; the repeated injury leaves a lasting mark and makes skin care harder.'],
    ],
    intelligence: [
      ['A museum engineer wants your idea', 'Your improvised model catches a museum engineer’s eye, leading to regular supervised sessions testing designs and explaining why they work.'],
      ['A prototype keeps failing', 'At an invention workshop, you struggle to imagine alternatives to a failed prototype and repeat the same unsuccessful approach; the experience makes unfamiliar problems harder to tackle.'],
    ],
    strength: [
      ['A coach tries the game you invented', 'A coach adopts your homemade obstacle game for a community session and invites you to help refine it, teaching you new movement skills along the way.'],
      ['A routine proves difficult to adapt', 'During a performance workshop, you struggle to invent a simpler version of a demanding movement and keep attempting one that does not fit the space; an injury leaves coordination harder afterward.'],
    ],
    social: [
      ['Your puppet show draws a crowd', 'A community organizer sees people gather around your puppet show and invites you to host more sessions, helping you learn to read and involve an audience.'],
      ['Your project partner moves on', 'When a shared design is rejected, you struggle to suggest another approach and the project stalls; your partner moves on, leaving you less confident about future collaboration.'],
    ],
  },
};

export const APTITUDE_EVENTS = APTITUDE_EVENT_STATS.flatMap(source =>
  APTITUDE_EVENT_STATS.filter(target => target !== source).flatMap(target => [1, -1].map(direction => ({
    id: `aptitude_${source}_${target}_${direction > 0 ? 'gain' : 'loss'}`,
    name: experiences[source][target][direction > 0 ? 0 : 1][0],
    description: experiences[source][target][direction > 0 ? 0 : 1][1],
    category: 'Rare turning points', minAge: 5,
    ...(source === 'strength' && target === 'social' ? { maxAge: 17 } : {}),
    baseChance: .00015, rare: true, kind: direction > 0 ? 'positive' : 'negative',
    statFactors: [[source, direction > 0 ? 'high' : 'low']],
    aptitudeChanges: { [target]: direction }, statChanges: { [target]: direction * .3 },
    modifiers: {}, years: 0,
  }))),
);
