// Rare fictional experiences can change a different natural aptitude by one.
// Each ordered pair has both an encouraging and a discouraging experience.
export const APTITUDE_EVENT_STATS = ['health', 'stability', 'attractiveness', 'intelligence', 'strength', 'social', 'creativity'];
// Titles describe something that happened; the source stat only shapes its odds.
// Keep these encounters suitable from age five through adulthood unless gated below.
const experiences = {
  health: {
    stability: [
      ['A storm on the trail', 'A sudden storm strands your walking group; a ranger guides you to shelter and teaches you how to stay calm under pressure.'],
      ['Another cancelled hospital visit', 'An understaffed clinic repeatedly cancels your follow-up visits during an illness, leaving you frightened of facing another setback.'],
    ],
    attractiveness: [
      ['A place in the outdoor portrait project', 'A photographer recruits you during a community walk and spends several sessions helping you with posture and presentation.'],
      ['A skin infection leaves its mark', 'An infection develops while you are already unwell, leaving lasting marks and a more demanding skin-care routine.'],
    ],
    intelligence: [
      ['A naturalist takes you along', 'Keeping up on a long nature walk earns you an invitation to help a naturalist identify specimens and test explanations.'],
      ['The visiting tutor stops coming', 'During a long illness, the service sending your visiting tutor closes; months without help leave gaps that make new lessons harder.'],
    ],
    strength: [
      ['A circus instructor offers lessons', 'Your energy catches a visiting circus instructor’s attention, and a course of balance and tumbling lessons changes how you move.'],
      ['Rehabilitation is cut short', 'After an illness, your rehabilitation group loses its venue; the interrupted recovery leaves movement harder than before.'],
    ],
    social: [
      ['The walking club saves you a place', 'After meeting you on a community walk, the organizer pairs you with newcomers each week and helps you draw them into conversation.'],
      ['Your group replaces you', 'Repeated sick days lead a club organizer to give your place to someone else; being shut out makes approaching new groups harder.'],
    ],
    creativity: [
      ['An artist joins the expedition', 'On an outdoor trip, a visiting artist lends you a sketchbook and teaches you to turn unfamiliar plants and landscapes into invented scenes.'],
      ['Your workshop place is withdrawn', 'An art workshop gives away your place after repeated illness absences, cutting off the encouragement that kept you experimenting.'],
    ],
  },
  stability: {
    health: [
      ['A nurse asks you to help', 'Your calm manner at a community health session leads a nurse to invite you back as a helper, teaching you habits you keep using.'],
      ['Emergency repairs force you out', 'Emergency repairs force your household into noisy temporary rooms; prolonged stress and broken sleep take a lasting toll on your health.'],
    ],
    attractiveness: [
      ['A costume designer needs a model', 'You stay patient through a chaotic costume fitting, and the designer offers regular help with clothes, posture, and presentation.'],
      ['A rushed haircut goes wrong', 'An impatient hairdresser rushes you while you are already distressed, leaving a scalp injury and an enduring fear of grooming appointments.'],
    ],
    intelligence: [
      ['A puzzle maker becomes your mentor', 'A puzzle maker notices your patience at a community fair and invites you to test new puzzles, teaching you how to break problems apart.'],
      ['An instructor singles you out', 'An instructor repeatedly calls on you when you are visibly anxious, then mocks wrong answers; the experience makes it harder to concentrate and learn.'],
    ],
    strength: [
      ['A climbing coach takes an interest', 'You keep calm after a difficult attempt at an indoor climbing session, and a coach offers patient lessons in balance and body control.'],
      ['The coach keeps shouting', 'A coach responds to your nerves by shouting through every practice; you leave the course tense and less confident controlling your movements.'],
    ],
    social: [
      ['Asked to help settle a dispute', 'A community organizer sees you stay calm during an argument and invites you to help resolve future disputes, teaching you how to listen.'],
      ['A private worry is shared around', 'Someone you confided in shares your worries with a group chat, making it much harder to trust people and speak openly.'],
    ],
    creativity: [
      ['The mural artist hands you a brush', 'When rain ruins part of a community mural, your calm response impresses the artist, who invites you to help invent a replacement.'],
      ['Your work is torn up', 'A workshop leader tears up your unfinished drawing in front of everyone; already overwhelmed, you become afraid to try unfamiliar ideas.'],
    ],
  },
  attractiveness: {
    health: [
      ['A portrait project includes a health coach', 'A community portrait project selects you as a model and pairs you with a health coach whose practical support improves your lasting self-care.'],
      ['A seller exploits your insecurity', 'After hearing cruel remarks about your appearance, you trust a seller’s supposed beauty remedy; it makes you ill and leaves lingering health problems.'],
    ],
    stability: [
      ['A photographer stands up for you', 'A photographer chooses you for an exhibition and firmly stops onlookers commenting on your looks, giving you a lasting example of setting boundaries.'],
      ['Your photograph becomes a cruel joke', 'Someone circulates an unflattering photograph with cruel captions; the repeated ridicule leaves you less able to shrug off later setbacks.'],
    ],
    intelligence: [
      ['Behind the scenes at a photo studio', 'Chosen for a community portrait, you befriend the photographer, who invites you back to learn the experiments behind lighting and lenses.'],
      ['A tutor judges you by your looks', 'A tutor repeatedly dismisses your questions with comments about your appearance, wearing down your confidence in asking and learning.'],
    ],
    strength: [
      ['A dance director spots you', 'A community dance director notices your presence during an audition and offers lessons that give you a new feel for balance and movement.'],
      ['A trainer makes you the target', 'A trainer repeatedly mocks your appearance during group exercises; you withdraw from the sessions and struggle to regain your coordination.'],
    ],
    social: [
      ['The festival host recruits you', 'Your presence catches a festival host’s eye; working beside them at the welcome desk teaches you how to put strangers at ease.'],
      ['Turned away from the group photograph', 'A group organizer excludes you from its publicity photograph because of your looks, leaving you wary and withdrawn around new people.'],
    ],
    creativity: [
      ['A portrait artist invites you back', 'An artist selects you for a portrait, then invites you to experiment with costumes and backdrops, opening a new way to express ideas.'],
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
      ['Blamed for rules nobody explained', 'An organizer changes a competition’s rules without explaining them, then publicly blames you for breaking them; uncertainty becomes harder to handle.'],
    ],
    attractiveness: [
      ['A costume conservator shares their methods', 'Your questions about an old costume impress its conservator, who teaches you how fabric, fit, and careful grooming change presentation.'],
      ['An unlabelled bottle at the salon', 'A salon hands you a skin product with confusing instructions; using it incorrectly causes lasting irritation and makes future care more difficult.'],
    ],
    strength: [
      ['A coach shows you the slow-motion footage', 'Your questions about a sports demonstration lead a coach to review slow-motion footage with you, revealing movement techniques you can finally use.'],
      ['A dangerous drill is badly explained', 'An instructor gives muddled directions for an unfamiliar drill and fails to correct you; the resulting injury leaves lasting trouble with movement.'],
    ],
    social: [
      ['Asked to explain the exhibit', 'A museum volunteer hears you explain an exhibit and invites you to help visitors, coaching you on questions, listening, and conversation.'],
      ['A joke is used to humiliate you', 'A group deliberately gives you misleading instructions, then laughs when you take them seriously; joining conversations becomes harder afterward.'],
    ],
    creativity: [
      ['An inventor opens the workshop', 'You solve a problem at an invention fair, and its organizer invites you into a workshop where discarded parts become experimental machines.'],
      ['A construction kit is missing its plans', 'A prize construction kit arrives with missing plans and no promised help; months of baffling failures leave you reluctant to invent anything new.'],
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
      ['A craftsperson offers an apprenticeship', 'A craftsperson notices how confidently you handle materials and invites you to regular supervised sessions exploring measurements, mechanisms, and repairs.'],
      ['Shut out of the practical workshop', 'A workshop leader mistakes your difficulty handling tools for lack of interest and bars you from experiments, cutting off a way of learning that mattered to you.'],
    ],
    social: [
      ['The recess captain picks you first', 'After you impress the other kids at recess, a team captain invites you to help welcome new players, showing you how to bring others into the game.'],
      ['A team captain keeps shutting you out', 'A team captain repeatedly refuses to pick you at recess because you struggle to keep up; the exclusion makes joining conversations harder.'],
    ],
    creativity: [
      ['A sculptor invites you into the studio', 'Your confident handling of clay impresses a visiting sculptor, who invites you to experiment with unfamiliar materials in supervised studio sessions.'],
      ['Your unfinished sculpture is thrown away', 'Your sculpture takes longer because the materials are difficult to handle; a cleanup crew mistakes it for scrap and destroys it, discouraging further experiments.'],
    ],
  },
  social: {
    health: [
      ['A retired nurse becomes a regular visitor', 'A conversation with a retired nurse turns into regular visits, with practical encouragement that changes how you look after your health.'],
      ['Your request for help is brushed aside', 'At a crowded clinic, staff repeatedly brush aside your hesitant attempts to explain symptoms; delayed treatment leaves a lasting health setback.'],
    ],
    stability: [
      ['Invited to help welcome newcomers', 'A community organizer notices how easily you include strangers and invites you to help run a welcome group, where a mentor teaches you to handle conflict.'],
      ['A confidence is deliberately twisted', 'Someone twists your awkwardly worded confidence into a public accusation, leaving you less able to trust your footing during later conflicts.'],
    ],
    attractiveness: [
      ['A costume maker becomes a friend', 'Chatting at a community show leads to regular visits with a costume maker, who helps you find clothes, grooming, and posture that suit you.'],
      ['A stylist ignores what you ask for', 'A stylist dismisses your hesitant objections and uses a harsh treatment, leaving a lasting skin reaction and making self-care more difficult.'],
    ],
    intelligence: [
      ['A chess player takes you under their wing', 'A friendly conversation at the library leads a skilled chess player to invite you back for regular lessons in planning and problem-solving.'],
      ['Your study circle breaks apart', 'Arguments break up your study circle before you can ask for the help you need; the lost support leaves gaps and makes learning aloud harder.'],
    ],
    strength: [
      ['A dancer offers to teach you', 'You strike up a conversation after a community performance, and a dancer offers regular lessons in rhythm, balance, and coordination.'],
      ['A practice partner ignores your warning', 'Your practice partner talks over your warning that you are not ready, rushing a movement that injures you and leaves coordination harder afterward.'],
    ],
    creativity: [
      ['A storyteller invites you backstage', 'Your conversation with a visiting storyteller earns an invitation backstage, followed by regular sessions inventing characters and scenes together.'],
      ['Your collaborator takes all the credit', 'Unable to make your role heard, you watch a collaborator claim your shared project as their own; the betrayal makes it harder to offer new ideas.'],
    ],
  },
  creativity: {
    health: [
      ['Your poster brings a nurse to visit', 'A nurse notices your imaginative health-fair poster and invites you to help make future displays, teaching you practical self-care along the way.'],
      ['A craft kit contains unsafe materials', 'You rely on a kit’s instructions while struggling with a project, but its poorly labelled materials cause a serious reaction and lasting health trouble.'],
    ],
    stability: [
      ['A puppeteer offers a place in the troupe', 'A puppeteer spots your homemade character and invites you to help with a show, teaching you ways to express and work through difficult feelings.'],
      ['A burst pipe destroys your sketchbooks', 'A burst pipe ruins the sketchbooks you used to work through difficult feelings; struggling to find another outlet, you become less resilient to setbacks.'],
    ],
    attractiveness: [
      ['A designer wants to develop your costume', 'Your handmade costume catches a designer’s attention, and working together teaches you new ways to use fit, color, and presentation.'],
      ['Unsafe face paint at the workshop', 'After dismissing your design attempts, a workshop leader hands you unsuitable face paint; the skin reaction leaves lasting marks and a difficult care routine.'],
    ],
    intelligence: [
      ['A museum engineer wants your idea', 'Your improvised model catches a museum engineer’s eye, leading to regular supervised sessions testing designs and explaining why they work.'],
      ['Your experiment is sabotaged', 'Someone secretly changes your project at an invention fair; unable to explain its repeated failures, you lose confidence in how you approach unfamiliar problems.'],
    ],
    strength: [
      ['A coach tries the game you invented', 'A coach adopts your homemade obstacle game for a community session and invites you to help refine it, teaching you new movement skills along the way.'],
      ['A loose mat ruins the performance', 'While attempting choreography you struggled to adapt, you slip on an unsecured mat; the injury leaves you with lasting trouble coordinating your movements.'],
    ],
    social: [
      ['Your puppet show draws a crowd', 'A community organizer sees people gather around your puppet show and invites you to host more sessions, helping you learn to read and involve an audience.'],
      ['Your project partner stops answering', 'After weeks of struggling to explain your ideas, your project partner quietly replaces you and stops replying; the rejection makes future collaboration harder.'],
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
