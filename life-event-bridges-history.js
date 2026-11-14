// Frozen render-only story recognition; never used by future event rolls.
﻿// Pair-specific bridges explain why this opportunity or barrier affects this
// particular other ability. Caregivers handle arrangements for young children.
const bridges = {
  intelligence: {
    strength: ['A movement instructor builds demonstrations around familiar patterns, making a physical sequence easier to practice.', 'The movement class relies on complicated verbal sequences instead of demonstrations, so physical practice falls away.'],
    attractiveness: ['A helper turns a clear understanding of a daily care sequence into a routine that can actually be maintained.', 'The daily-care plan is confusing and unexplained, so the practical steps are repeatedly missed.'],
    social: ['A facilitator uses familiar puzzle patterns to start cooperative turn-taking games.', 'The group explains its game rules too quickly, making shared play and conversation difficult to follow.'],
    creativity: ['Understanding how a simple object works becomes the starting point for making new versions of it.', 'The making sessions move past unexplained instructions, leaving no workable starting point for experimentation.'],
    health: ['A support worker builds on a clearly understood sequence to make a regular meals-and-rest plan manageable.', 'A complicated schedule for meals and rest is handed over without clear explanations or practical follow-up.'],
    stability: ['A support worker uses familiar patterns and explanations to make reassurance predictable throughout a difficult stretch.', 'Unexplained changes in the support schedule make a trusted source of reassurance increasingly difficult to reach.'],
    lifestyle: ['A facilitator helps complete an equipment-loan application after the practical requirements are quickly understood.', 'Unexplained application rules repeatedly block access to loaned equipment, adding replacement costs.'],
    relationship: ['A shared puzzle project offers a comfortable reason to spend regular time together.', 'Repeated misunderstandings about complicated shared arrangements go unresolved and visits fall through.'],
  },
  strength: {
    intelligence: ['Managing the hands-on materials makes it possible to join a practical problem-solving group.', 'Heavy or hard-to-handle learning materials are never adapted, preventing participation in hands-on lessons.'],
    attractiveness: ['Better physical access to a daily-care space makes a consistent care routine manageable.', 'An inaccessible washing and dressing space makes keeping up personal care difficult without help.'],
    social: ['Being able to join the movement games opens a place in a regular cooperative group.', 'The social group meets beyond physically demanding steps, without an accessible meeting option.'],
    creativity: ['Handling the tools and materials opens a place in supervised making sessions.', 'The art equipment is physically hard to manage, and the group offers no lighter or adapted tools.'],
    health: ['An achievable active routine becomes easier to maintain with suitable equipment and guidance.', 'The physical demands of getting to practical support are too high, and no assistance is arranged.'],
    stability: ['Access to regular supported outings makes a trusted helper available throughout a difficult stretch.', 'Physically inaccessible meeting places repeatedly cut off contact with a trusted source of support.'],
    lifestyle: ['A group lends useful equipment after a successful practical trial, saving the household rental and travel costs.', 'Inaccessible shared equipment has to be replaced with privately arranged alternatives at household expense.'],
    relationship: ['A manageable shared outing becomes a regular way to spend time together.', 'Physical access problems repeatedly interrupt visits, and the unresolved arrangements strain the bond.'],
  },
  attractiveness: {
    intelligence: ['An advocate arranges an inclusive learning place after appearance-based judgments have overshadowed the person\'s interests.', 'Appearance-based favoritism repeatedly blocks a learning place, even though appearance says nothing about the ability to learn.'],
    strength: ['An advocate finds a movement group that welcomes different appearances and provides practical participation support.', 'An appearance-conscious group repeatedly turns away a participant instead of making exercise welcoming.'],
    social: ['An advocate arranges a welcoming small group after appearance-based exclusion has disrupted visits.', 'Repeated appearance-based exclusion cuts off ordinary opportunities to exchange ideas and take turns.'],
    creativity: ['An advocate finds a creative group that values experimentation instead of judging participants\' looks.', 'Appearance-based casting and display decisions repeatedly shut someone out of creative practice.'],
    health: ['After appearance-based exclusion has interrupted activities, a worker helps restore practical access to meals, rest and exercise support.', 'Appearance-based exclusion repeatedly disrupts access to the practical support that makes meals and rest reliable.'],
    stability: ['A consistent advocate listens and intervenes after repeated appearance-based humiliation, providing dependable support through the distress.', 'Repeated appearance-based rejection removes a trusted place of belonging throughout an already difficult stretch.'],
    lifestyle: ['An advocate secures transport and equipment support so unfair appearance judgments no longer make participation more expensive.', 'Appearance-based exclusion from shared facilities forces the household to pay for alternatives.'],
    relationship: ['A relative responds to repeated appearance judgments with dependable contact and a welcoming place to visit.', 'Repeated hurtful appearance comments go unaddressed during shared visits, gradually straining the bond.'],
  },
  social: {
    intelligence: ['A connection made through shared conversation leads to patient, regular explanations of unfamiliar ideas.', 'Unclear conversations about meeting arrangements repeatedly prevent attendance at learning sessions.'],
    strength: ['A friendly connection brings an invitation to a regular, supported movement group.', 'Misunderstood arrangements repeatedly interrupt attendance at a movement group.'],
    attractiveness: ['A comfortable exchange makes it easier to ask for practical help with a consistent personal-care routine.', 'Unclear requests for practical care support go unanswered, and the daily routine repeatedly slips.'],
    creativity: ['A connection with a maker leads to regular opportunities to try unfamiliar materials together.', 'Misunderstandings about shared materials and meeting times repeatedly interrupt creative sessions.'],
    health: ['A friendly connection makes dependable practical help with meals and rest easier to arrange.', 'Misunderstandings about promised practical help repeatedly leave meals and rest disrupted.'],
    stability: ['An easy exchange becomes a regular supportive connection throughout a difficult stretch.', 'Misunderstandings repeatedly prevent contact with a trusted helper throughout a difficult stretch.'],
    lifestyle: ['A friendly connection leads to a shared transport arrangement and a household equipment loan.', 'Misunderstood sharing arrangements repeatedly require the household to pay for replacement transport and equipment.'],
    relationship: ['Comfortable exchanges make it easier to arrange regular time together and listen to each other.', 'Unclarified messages repeatedly lead to missed visits and unresolved disappointment.'],
  },
  creativity: {
    intelligence: ['An inventive idea becomes a practical experiment that needs observation, comparison and repeated problem-solving.', 'Open-ended learning tasks offer no example to start from, preventing useful problem-solving practice.'],
    strength: ['An invented movement game becomes a regular, supported way to exercise.', 'An exercise group expects participants to invent their own routines without offering a usable example.'],
    attractiveness: ['A helper turns an inventive approach into a practical, repeatable daily-care routine.', 'Personal-care advice assumes someone can improvise around missing supplies, without demonstrating a workable routine.'],
    social: ['An invented story or game becomes something to share and develop with other people.', 'Shared games expect improvised roles, without helping anyone who needs a starting point to join in.'],
    health: ['A helper turns an enjoyable new game or meal idea into a manageable wellbeing routine.', 'Practical support expects an improvised routine without giving a usable starting plan for meals and rest.'],
    stability: ['A creative way to express difficult experiences helps a trusted supporter offer consistent, understandable reassurance.', 'A support group insists on open-ended creative expression and fails to offer another way to ask for reassurance.'],
    lifestyle: ['An inventive reuse project earns access to a shared equipment library, reducing household replacement costs.', 'A repair program expects participants to improvise replacements without providing a usable example or loan equipment.'],
    relationship: ['Making up a shared story or project gives regular time together a welcoming purpose.', 'Shared projects depend on improvised contributions, and repeated frustration goes unaddressed between visits.'],
  },
  health: {
    intelligence: ['Being well enough to attend regularly makes a sequence of learning sessions possible.', 'Recurring illness interrupts learning sessions, and no materials or visits are offered during absences.'],
    strength: ['Sustained physical wellbeing makes a gradual movement routine manageable.', 'Recurring illness interrupts movement sessions for months, without an adapted way to keep active.'],
    attractiveness: ['Feeling physically well makes a consistent daily-care routine easier to maintain.', 'Recurring illness repeatedly interrupts personal care, without practical help to maintain it.'],
    social: ['Being well enough to attend regularly allows a familiar group to build repeated exchanges.', 'Recurring illness interrupts group visits, and no remote or home-based contact is arranged.'],
    creativity: ['Sustained physical wellbeing makes regular creative practice possible.', 'Recurring illness interrupts creative sessions, and no suitable materials are provided during absences.'],
    stability: ['Reliable attendance lets a trusted helper offer consistent support throughout a difficult stretch.', 'Recurring illness breaks contact with a trusted support network for months, with no visits arranged in its place.'],
    lifestyle: ['Reliable attendance allows the household to use shared equipment and transport instead of paying for alternatives.', 'Recurring illness brings repeated travel and equipment costs that shared arrangements do not cover.'],
    relationship: ['Being well enough to keep regular visits makes dependable time together possible.', 'Recurring illness interrupts visits for months, and alternative ways to keep in touch are not arranged.'],
  },
  stability: {
    intelligence: ['Being able to settle into unfamiliar surroundings makes patient, regular learning sessions possible.', 'Sustained distress interrupts learning sessions, without a calmer or more predictable alternative.'],
    strength: ['Being able to settle into the group makes a gradual movement routine comfortable to attend.', 'Sustained distress interrupts movement sessions, without a quieter or more predictable alternative.'],
    attractiveness: ['A manageable response to changes makes a consistent personal-care routine easier to maintain.', 'Sustained distress repeatedly disrupts personal care, without practical support to simplify the routine.'],
    social: ['Being able to cope with an unfamiliar setting makes regular group exchanges comfortable to join.', 'Sustained distress interrupts group exchanges, and no calmer way to participate is offered.'],
    creativity: ['Being able to settle into an unfamiliar activity makes regular experimentation possible.', 'Sustained distress interrupts creative practice, and the group offers no quieter way to participate.'],
    health: ['Coping with changes makes a practical meals-and-rest plan easier to maintain.', 'Sustained distress disrupts meals and rest, without practical support to simplify arrangements.'],
    lifestyle: ['Managing the unfamiliar arrangements makes shared transport and equipment access reliable.', 'Sustained distress interrupts shared transport and equipment arrangements, requiring paid alternatives.'],
    relationship: ['Coping with changes makes shared visits predictable enough to become a regular source of connection.', 'Sustained distress repeatedly disrupts shared visits, without help arranging a calmer way to meet.'],
  },
  lifestyle: {
    intelligence: ['Affordable transport and materials make regular learning sessions accessible.', 'Transport fares and material charges repeatedly block access to learning sessions.'],
    strength: ['Affordable transport and suitable equipment make a regular movement group accessible.', 'Transport and equipment costs repeatedly block access to suitable movement sessions.'],
    attractiveness: ['Reliable access to supplies and practical help makes consistent personal care possible.', 'The household repeatedly runs short of basic care supplies and cannot arrange practical help.'],
    social: ['Affordable travel and a suitable meeting space make regular shared visits possible.', 'Transport charges and a lack of accessible meeting space repeatedly prevent shared visits.'],
    creativity: ['Reliable access to materials and workspace makes regular experimentation possible.', 'Material costs and the lack of a suitable workspace repeatedly interrupt creative practice.'],
    health: ['Reliable access to food, rest space and practical help makes a healthier routine possible.', 'The household cannot consistently secure meals, quiet rest space or practical help.'],
    stability: ['Reliable transport and an accessible place to meet keep a trusted supporter available through a difficult stretch.', 'Transport and space costs cut off contact with a trusted supporter for months during a difficult stretch.'],
    relationship: ['Affordable travel and somewhere comfortable to meet make regular shared time possible.', 'Travel charges and a lack of space repeatedly interrupt shared time, leaving unresolved disappointment.'],
  },
  relationship: {
    intelligence: ['Trust makes it comfortable to ask each other for patient explanations during a shared learning project.', 'Unresolved friction makes asking each other for explanations difficult, and shared learning sessions fall through.'],
    strength: ['Trust makes a shared movement routine easier to arrange and keep attending.', 'Unresolved friction repeatedly breaks shared arrangements for movement sessions.'],
    attractiveness: ['Trust makes asking for practical help with daily care comfortable and dependable.', 'Unresolved friction makes practical care arrangements unreliable and difficult to discuss.'],
    social: ['Trust makes a shared group a comfortable place to practice talking and listening with others.', 'Unresolved friction repeatedly disrupts shared group visits and chances to exchange ideas.'],
    creativity: ['Trust makes a shared making project a comfortable place to try unfamiliar ideas.', 'Unresolved friction repeatedly disrupts shared making sessions and access to materials.'],
    health: ['Trust makes practical help with meals and rest easier to ask for and arrange.', 'Unresolved friction repeatedly disrupts promised practical help with meals and rest.'],
    stability: ['Trust makes dependable reassurance available throughout a difficult stretch.', 'Unresolved friction removes a once-dependable source of reassurance for months during a difficult stretch.'],
    lifestyle: ['Trust makes sharing transport and useful household equipment workable.', 'Unresolved friction breaks shared transport and equipment arrangements, forcing paid alternatives.'],
  },
};
const youngBridges = {
  intelligence: {
    strength: ['A helper uses familiar sounds and patterns to encourage reaching and movement during play.', 'The movement session changes its cues too quickly, without giving the child time to recognize a familiar pattern.'],
    attractiveness: ['A caregiver makes the daily-care sequence predictable with familiar sounds and patterns.', 'A rushed care session gives the child no time to recognize what comes next, and practical help with daily care falls away.'],
    health: ['A caregiver uses familiar cues to make feeding, rest and active play predictable.', 'Rushed, unfamiliar cues repeatedly unsettle feeding and rest, and no helper adapts the routine.'],
    lifestyle: ['Engaging pattern-based play makes regular group visits workable, and the caregiver is offered equipment to use at home.', 'A group will not adapt its rushed activities, leaving the caregiver to arrange costly alternatives and supplies.'],
  },
  creativity: {
    health: ['A caregiver develops playful variations that make a reliable active-play and rest routine engaging.', 'The group expects imaginative play without helping the child start, and practical routine support is lost with the sessions.'],
    attractiveness: ['A caregiver turns familiar sounds and playful cues into a manageable routine for gentle daily care.', 'A helper relies on improvised distraction without providing familiar playful cues, and practical daily-care support falls away.'],
    stability: ['A caregiver uses familiar sensory play and stories to make a trusted helper\'s reassurance understandable.', 'A support group insists on unfamiliar make-believe activities and offers no simpler way for the child to settle with a trusted helper.'],
    lifestyle: ['An engaging play session leads to the caregiver being offered take-home materials and an equipment loan.', 'A group offers no starting help for unfamiliar play, leaving the caregiver to arrange costly replacement sessions and materials.'],
  },
  social: {
    intelligence: ['Enjoying back-and-forth play lets a helper introduce shared picture and pattern games.', 'A helper rushes back-and-forth exchanges instead of waiting for a response, repeatedly cutting short picture and pattern games.'],
    health: ['Comfortable exchanges with a familiar helper make practical feeding and rest support easier to accept.', 'A helper rushes unfamiliar exchanges and offers no time to settle, repeatedly disrupting feeding and rest support.'],
    attractiveness: ['Comfortable exchanges with a familiar helper make gentle daily care easier to accept.', 'A helper rushes unfamiliar exchanges instead of helping the child settle, and practical daily-care support falls away.'],
    lifestyle: ['Comfortable group play makes shared visits workable, and the caregiver receives a household equipment loan.', 'The group offers no help settling into shared play, leaving the caregiver to pay for alternative visits and equipment.'],
  },
  stability: {
    lifestyle: ['Settling comfortably into a regular group makes shared transport and a household equipment loan workable for the caregiver.', 'The group offers no quieter way to settle, leaving the caregiver to pay for alternative visits and equipment.'],
  },
  relationship: {
    intelligence: ['Feeling secure with a familiar adult makes shared picture games and patient demonstrations easier to join.', 'Difficulty settling with the familiar adult repeatedly interrupts shared picture games and patient demonstrations.'],
    social: ['Feeling secure with a familiar adult makes supported exchanges with other people easier to join.', 'Difficulty settling with the familiar adult repeatedly interrupts supported exchanges with other people.'],
  },
};
export function causalBridge(source, target, positive, young = false) {
  if (young && youngBridges[source]?.[target]) return youngBridges[source][target][positive ? 0 : 1];
  return bridges[source][target][positive ? 0 : 1];
}
