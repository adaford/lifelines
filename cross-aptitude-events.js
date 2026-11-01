// Rare fictional experiences can change a different natural aptitude by one.
// Each ordered pair has both an encouraging and a discouraging experience.
export const APTITUDE_EVENT_STATS = ['health', 'stability', 'attractiveness', 'intelligence', 'strength', 'social', 'creativity'];
const labels = { health: 'Health', stability: 'Mental stability', attractiveness: 'Attractiveness', intelligence: 'Intelligence', strength: 'Strength', social: 'Social', creativity: 'Creativity' };
const experiences = {
  health: {
    stability: ['Feeling well lets you face a difficult day calmly; that steadiness starts to stick.', 'Repeated illness makes uncertainty harder to face; worry becomes harder to shake.'],
    attractiveness: ['Feeling well helps you discover posture and grooming habits that suit you.', 'Recurring illness disrupts your self-care until looking after your appearance feels harder.'],
    intelligence: ['Good health lets you stay curious through a challenging project; learning begins to come more easily.', 'Missed learning time during repeated illness makes new ideas harder to take in.'],
    strength: ['Your good health carries you through a movement challenge and coordination starts to click.', 'Repeated illness interrupts movement so often that rebuilding coordination feels harder.'],
    social: ['Your energy draws you into a new group; understanding other people starts to come naturally.', 'Illness repeatedly keeps you away from people until conversation feels less natural.'],
    creativity: ['Feeling well gives you room to experiment, and unfamiliar creative ideas start to flow.', 'Repeated illness leaves little room to experiment; new ideas become harder to find.'],
  },
  stability: {
    health: ['Your calm response to a setback helps healthy routines become second nature.', 'Persistent distress unsettles your routines until recovering from strain feels harder.'],
    attractiveness: ['Feeling settled lets you find a personal style that is easier to maintain.', 'Feeling overwhelmed disrupts self-care until presenting yourself feels harder.'],
    intelligence: ['Staying calm through a difficult puzzle reveals a way of learning that suits you.', 'Persistent worry keeps breaking your concentration until learning feels harder.'],
    strength: ['Your patience with an unfamiliar movement lets physical coordination click.', 'Distress repeatedly interrupts movement practice until coordination feels harder.'],
    social: ['Your calm presence helps someone open up; reading people starts to come more naturally.', 'Repeated tense exchanges make listening and connecting feel less natural.'],
    creativity: ['Feeling grounded lets you take creative risks, revealing a new ease with ideas.', 'Persistent distress crowds out experimentation until imagining alternatives feels harder.'],
  },
  attractiveness: {
    health: ['Confidence in your appearance helps a lasting self-care routine fall into place.', 'Unkind comparisons about appearance disrupt self-care until healthy routines feel harder.'],
    stability: ['A welcome response to your appearance helps you find a steadier sense of confidence.', 'Repeated unkind comments about appearance make setbacks harder to shake off.'],
    intelligence: ['Confidence in presenting yourself helps you ask questions and discover how you learn best.', 'Worry over how you appear repeatedly distracts you until concentrating feels harder.'],
    strength: ['Confidence in your appearance draws you into a movement group where coordination clicks.', 'Feeling uncomfortable being watched keeps interrupting movement practice until coordination feels harder.'],
    social: ['A warm first impression opens a conversation; connecting with people starts to feel natural.', 'Repeated awkward first impressions make reading social situations feel harder.'],
    creativity: ['Your eye for personal presentation leads to a creative experiment that changes how you imagine things.', 'Discouragement about your presentation makes creative expression feel less natural.'],
  },
  intelligence: {
    health: ['Understanding a pattern in your daily habits helps recovery and self-care become more natural.', 'Repeatedly misunderstanding self-care advice makes healthy routines harder to establish.'],
    stability: ['Understanding a confusing situation gives you a calmer way to respond to setbacks.', 'Repeatedly struggling to understand a situation makes uncertainty harder to handle.'],
    attractiveness: ['Spotting what works in your grooming routine makes looking after your appearance easier.', 'Misunderstanding a grooming routine leaves self-care habits harder to maintain.'],
    strength: ['Understanding a movement technique suddenly makes physical coordination easier.', 'Repeatedly misunderstanding movement instructions makes coordination harder to develop.'],
    social: ['Explaining a difficult idea brings people together, and conversation begins to flow more naturally.', 'Repeated misunderstandings leave conversations strained and harder to follow.'],
    creativity: ['An idea you understand deeply unlocks an easier way to imagine new possibilities.', 'Repeated confusion about how things work makes inventing alternatives feel harder.'],
  },
  strength: {
    health: ['Your strength helps you establish a movement habit that makes caring for your health easier.', 'Struggling with everyday movement disrupts healthy routines until recovery feels harder.'],
    stability: ['Completing a difficult physical challenge gives you a steadier way to face setbacks.', 'Repeated frustration with physical tasks makes setbacks harder to shake off.'],
    attractiveness: ['Confident movement helps you discover posture and presentation that suit you.', 'Difficulty moving comfortably disrupts posture and makes presentation harder to maintain.'],
    intelligence: ['Building something with your hands reveals an easier way to understand how things work.', 'Physical difficulty repeatedly interrupts practical learning until new ideas feel harder to grasp.'],
    social: ['Your strength impresses the other kids at recess; joining their conversations starts to feel natural.', 'Struggling to keep up with recess games leaves joining conversations feeling harder.'],
    creativity: ['Your physical confidence lets you experiment with making things, and new ideas start to flow.', 'Repeated difficulty handling materials makes creative experimentation feel less natural.'],
  },
  social: {
    health: ['A conversation helps you build a supportive routine; caring for your health starts to come more naturally.', 'Difficulty asking for support disrupts self-care until healthy routines feel harder.'],
    stability: ['Your ability to talk things through reveals a steadier way to handle difficult feelings.', 'Repeated misunderstandings leave you unsettled and make setbacks harder to shake off.'],
    attractiveness: ['A thoughtful exchange about personal style helps self-presentation come more naturally.', 'Difficulty explaining what suits you leaves grooming and presentation feeling harder.'],
    intelligence: ['Talking through an unfamiliar idea with others reveals a way of learning that clicks.', 'Difficulty asking questions leaves misunderstandings unresolved until learning feels harder.'],
    strength: ['You connect with a patient practice partner, and unfamiliar movements finally click.', 'Difficulty communicating during group practice makes physical coordination harder to develop.'],
    creativity: ['An easy exchange of ideas opens a new way of imagining things.', 'Repeatedly struggling to share ideas makes creative experimentation feel less natural.'],
  },
  creativity: {
    health: ['An inventive change to your routine makes caring for your health come more naturally.', 'Struggling to adapt a self-care routine makes healthy habits harder to maintain.'],
    stability: ['An imaginative way of expressing a difficult feeling helps you recover your balance more easily.', 'Difficulty finding an outlet for feelings makes setbacks harder to process.'],
    attractiveness: ['An imaginative style experiment helps you discover an easier approach to your appearance.', 'Repeatedly struggling to find a style that suits you makes self-presentation feel harder.'],
    intelligence: ['Inventing a new way to explore a problem reveals an easier way to learn.', 'Difficulty imagining alternative approaches makes unfamiliar problems harder to understand.'],
    strength: ['Inventing a movement game helps physical coordination click.', 'Difficulty adapting a movement exercise makes coordination harder to develop.'],
    social: ['Something you create starts an easy conversation, and reading people begins to feel natural.', 'Difficulty expressing an idea leaves conversations strained and harder to follow.'],
  },
};

export const APTITUDE_EVENTS = APTITUDE_EVENT_STATS.flatMap(source =>
  APTITUDE_EVENT_STATS.filter(target => target !== source).flatMap(target => [1, -1].map(direction => ({
    id: `aptitude_${source}_${target}_${direction > 0 ? 'gain' : 'loss'}`,
    name: `${labels[source]} opens ${labels[target].toLowerCase()} ${direction > 0 ? 'possibilities' : 'challenges'}`,
    description: experiences[source][target][direction > 0 ? 0 : 1],
    category: 'Rare turning points', minAge: 5,
    ...(source === 'strength' && target === 'social' ? { maxAge: 17 } : {}),
    baseChance: .00015, rare: true, kind: direction > 0 ? 'positive' : 'negative',
    statFactors: [[source, direction > 0 ? 'high' : 'low']],
    aptitudeChanges: { [target]: direction }, statChanges: { [target]: direction * .3 },
    modifiers: {}, years: 0,
  }))),
);
