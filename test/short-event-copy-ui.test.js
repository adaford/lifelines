import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { afterEach, test } from 'node:test';
import { parseHTML } from 'linkedom';
import { createGame, advanceYear, resolveEventChoice, validateSave, EVENTS } from '../engine.js';
import { defaultFocus } from '../focus-rules.js';
import { eventDescriptionAtAge } from '../life-events.js';
import { annotateNarrative } from '../narrative.js';

const SAVE_KEY='lifelines.save.v1';
const html=await readFile(new URL('../index.html',import.meta.url),'utf8');
const originalGlobals=new Map(['document','window','localStorage','setTimeout'].map(key=>[key,Object.getOwnPropertyDescriptor(globalThis,key)]));
const nativeSetTimeout=globalThis.setTimeout;
const timers=new Set();
let importId=0;

// Portable examples captured before descriptions were shortened. These are
// independent of the compatibility lookup used by the renderer.
const oldPersonalStory='At a preschool play session, your readiness to engage in back-and-forth play helps a facilitator find a welcoming place. Enjoying back-and-forth play lets a helper introduce shared picture and pattern games. A caregiver handles the arrangements and takes part throughout. Regular sorting games and picture stories give you practice solving small problems.';
const oldParentStory="At a community program, {name}'s ease in conversation helps make a connection with a facilitator. A connection made through shared conversation leads to patient, regular explanations of unfamiliar ideas. A practical course gives {name} regular practice comparing information and solving unfamiliar problems.";
const personalEvent=()=>EVENTS.find(event=>event.id==='life_personal_social_intelligence_support');
const parentEvent=()=>EVENTS.find(event=>event.id==='life_parent_social_intelligence_support');

function completedBoundaryYear() {
  const state=createGame({seed:78123});
  state.age=4;
  state.focus=defaultFocus(state);
  state.parents[0].age=39;
  state.parents[0].name='Ada St. Clair <b>';
  assert.equal(advanceYear(state,{mortalityRandom:()=>1,growthRandom:()=>0,parentCareerRandom:()=>1}).ok,true);
  while(state.pendingEvents.length) {
    const pending=state.pendingEvents[0],event=EVENTS.find(event=>event.id===pending.eventId);
    assert.equal(resolveEventChoice(state,event.choices[0].id,event.id,pending.subjectId).ok,true);
  }
  state.yearSummary.dismissed=false;
  assert.equal(state.age,5);
  assert.equal(state.parents[0].age,40);
  return state;
}

function record(state,entries) {
  state.yearSummary.events=structuredClone(entries);
  state.history=entries.map((entry,index)=>({id:`short-copy-${index}`,age:state.age,generation:state.generation,...entry}));
  assert.equal(validateSave(state),true);
  return state;
}

function effectLines(element) {
  return element.innerHTML.split('<br>').map(line=>parseHTML(`<div>${line}</div>`).document.querySelector('div').textContent);
}

test('old generated personal and family stories keep their captured stage while becoming concise after birthdays and reload',async()=>{
  const state=completedBoundaryYear(),parent=state.parents[0];
  const personal=personalEvent(),family=parentEvent();
  const familyStory=oldParentStory.replaceAll('{name}',parent.name);
  record(state,[
    {title:personal.name,kind:'positive',description:oldPersonalStory,text:`${oldPersonalStory} Your intelligence 5 → 5.2. -1 focus point. Temporary effects: 1 year.`,cause:'High social contributed to this event.'},
    {title:`${parent.name}: ${family.name}`,kind:'positive',description:familyStory,text:`${familyStory} ${parent.name}: Intelligence 5 → 5.3.`,cause:`${parent.name}'s high social contributed to this event.`},
  ]);
  const expectedPersonal=eventDescriptionAtAge(personal,4);
  const expectedFamily=eventDescriptionAtAge(family,39).replaceAll('{name}',parent.name);
  assert.notEqual(expectedPersonal,eventDescriptionAtAge(personal,5),'the fixture crosses a personal story stage');
  assert.notEqual(expectedFamily,eventDescriptionAtAge(family,40).replaceAll('{name}',parent.name),'the fixture crosses a family story stage');
  assert.ok(expectedPersonal.length<oldPersonalStory.length);
  assert.ok(expectedFamily.length<familyStory.length);
  for(let reload=0;reload<2;reload++) {
    const ui=await mount(state),writes=ui.writes();
    const reviews=ui.all('.year-review-events li');
    const personalReview=reviews.find(row=>row.querySelector('strong').textContent===personal.name);
    const familyReview=reviews.find(row=>row.querySelector('strong').textContent.includes(parent.name));
    assert.equal(personalReview.querySelector('.year-event-description').textContent,expectedPersonal);
    assert.equal(familyReview.querySelector('.year-event-description').textContent,annotateNarrative(expectedFamily,state));
    assert.ok((expectedPersonal.match(/[.!?](?=\s|$)/g)||[]).length<=2);
    assert.ok((eventDescriptionAtAge(family,39).match(/[.!?](?=\s|$)/g)||[]).length<=2);
    assert.deepEqual(effectLines(personalReview.querySelector('.year-event-results')),['Your intelligence 5.0 → 5.2.','-1 focus point.','Temporary effects: 1 year.']);
    assert.equal(familyReview.querySelector('.year-event-results .gain').textContent,'Intelligence 5.0 → 5.3');
    assert.ok(personalReview.querySelector('.event-cause'),'a copy-only revision retains the captured cause');
    assert.ok(familyReview.querySelector('.event-cause'));
    assert.equal(familyReview.querySelector('.year-event-description b'),null,'names remain escaped');
    for(const journal of ui.all('.journal-entry')) {
      assert.doesNotMatch(journal.querySelector('.journal-content > p').textContent,/At a preschool|At a community program|caregiver handles|practical course/);
    }
    assert.deepEqual(ui.saved(),state,'shortening known descriptions never rewrites saved stories, outcomes, ratings or RNG');
    assert.equal(ui.writes(),writes);
  }
});

test('unknown saved descriptions and custom prose keep names, decimal punctuation and consequence lines',async()=>{
  const state=completedBoundaryYear();
  const custom='Dr. Vale arrived at 5.25. A <care> note was kept. This custom account has a third sentence.';
  record(state,[{title:personalEvent().name,kind:'positive',description:custom,text:'A custom decision. Your health 5.25 → 5.55. +1 focus point. Temporary effects: 2 years.'}]);
  for(let reload=0;reload<2;reload++) {
    const ui=await mount(state),writes=ui.writes();
    assert.equal(ui.query('.year-event-description').textContent,custom);
    assert.equal(ui.query('.year-event-description').querySelector('care'),null);
    for(const selector of ['.year-event-results','.journal-content > p']) {
      assert.deepEqual(effectLines(ui.query(selector)),['A custom decision. Your health 5.3 → 5.5.','+1 focus point.','Temporary effects: 2 years.']);
    }
    assert.deepEqual(ui.saved(),state);
    assert.equal(ui.writes(),writes);
  }
});

test('concise pending stories leave all numeric choice and active-effect lines intact',async()=>{
  const state=createGame({seed:78123});
  state.age=3;
  state.conditions=[];
  for(const key of Object.keys(state.aptitudes)) state.aptitudes[key]=0;
  for(const key of Object.keys(state.stats)) state.stats[key]=5;
  state.focus={work:1,social:2,family:2,self:2,creative:2};
  state.effects=[{id:'short-copy-effect',name:'Saved <support>',description:'A saved story. Another sentence. This third sentence is not an effect line.',years:2,kind:'negative',modifiers:{health:-.4,intelligence:.5},focusPoints:-1,focusLimits:{toddler:{self:2}}}];
  state.pendingEvents=[{eventId:'art_workshop',age:3}];
  state.lastYearEvents=['art_workshop'];
  assert.equal(validateSave(state),true);
  for(let reload=0;reload<2;reload++) {
    const ui=await mount(state),writes=ui.writes();
    const story=ui.query('.event-decision > .section-description');
    assert.ok((story.textContent.match(/[.!?](?=\s|$)/g)||[]).length<=2);
    for(const option of ui.all('.event-option')) {
      assert.ok((option.querySelector('strong + span').textContent.match(/[.!?](?=\s|$)/g)||[]).length<=2);
    }
    const join=ui.query('[data-choice="join"] .event-consequences');
    const lines=effectLines(join);
    assert.equal(lines.length,4);
    assert.match(lines[0],/^Creativity 5\.0 → 5\.\d$/);
    assert.match(lines[1],/^Intelligence 5\.5 → 5\.\d$/);
    assert.deepEqual(lines.slice(2),['-2 Play focus capacity','1 year']);
    assert.equal(join.querySelectorAll('.stat-change.gain').length,2);
    assert.deepEqual(effectLines(ui.query('.effect-meta')),['-.4 Health','+.5 Intelligence','-1 focus point',"'Rest' focus max 2",'2 years remaining']);
    assert.equal(ui.query('.effect-title').textContent.trim(),'Saved <support>');
    assert.equal(ui.query('.effect-title').querySelector('support'),null);
    assert.deepEqual(ui.saved(),state);
    assert.equal(ui.writes(),writes);
  }
});

test('toddler controls end with Arts & crafts, Family time and Rest without reordering saved focus',async()=>{
  const state=createGame({seed:78123});
  state.age=3;state.conditions=[];
  for(const key of Object.keys(state.aptitudes)) state.aptitudes[key]=0;
  state.focus={work:1,social:0,family:3,self:2,creative:4};
  assert.equal(validateSave(state),true);
  const original=JSON.stringify(state);
  for(let reload=0;reload<2;reload++) {
    const ui=await mount(state),writes=ui.writes();
    assert.deepEqual(ui.all('.focus-row').map(row=>row.dataset.focusKey),['work','social','creative','family','self']);
    assert.deepEqual(ui.all('.focus-row output').map(node=>Number(node.textContent)),[1,0,4,3,2]);
    assert.equal(ui.raw(),original);
    assert.equal(ui.writes(),writes);
  }
});

async function mount(initial) {
  for(const timer of timers) clearTimeout(timer);
  timers.clear();
  const {document,window}=parseHTML(html),storage=new Map([[SAVE_KEY,JSON.stringify(initial)]]);
  let writes=0;
  Object.assign(globalThis,{document,window,localStorage:{getItem:key=>storage.get(key)??null,setItem:(key,value)=>{writes++;storage.set(key,String(value));},removeItem:key=>storage.delete(key)},setTimeout:(...args)=>{const timer=nativeSetTimeout(...args);timer.unref();timers.add(timer);return timer;}});
  await import(`../app.js?short-event-ui=${++importId}`);
  const query=selector=>{const node=document.querySelector(selector);assert.ok(node,`Expected ${selector}`);return node;};
  return {query,all:selector=>[...document.querySelectorAll(selector)],saved:()=>JSON.parse(storage.get(SAVE_KEY)),raw:()=>storage.get(SAVE_KEY),writes:()=>writes};
}

afterEach(()=>{
  for(const timer of timers) clearTimeout(timer);
  timers.clear();
  for(const [key,descriptor] of originalGlobals) {
    if(descriptor) Object.defineProperty(globalThis,key,descriptor);
    else delete globalThis[key];
  }
});
