import test from 'node:test';
import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import { parseHTML } from 'linkedom';
import * as current from '../engine.js';

const copy = value => structuredClone(value);
const noDeaths = { mortalityRandom: () => 1 };
const calm = { mortalityRandom: () => 1, growthRandom: () => 0, eventRandom: () => 1, parentCareerRandom: () => 1, fameRandom: () => 1 };
const baselineUrl = new URL('../.git/dating-genetics-baseline/engine.js', import.meta.url);
let baseline;
try {
  await access(baselineUrl);
  baseline = await import(baselineUrl.href);
} catch (error) {
  // A broken or incomplete baseline is a failure, not a reason to skip.
  if (error.code !== 'ENOENT') throw error;
}

function resolveChoices(runtime, state) {
  while (state.pendingEvents.length) {
    const pending=state.pendingEvents[0];
    const event=runtime.EVENTS.find(event=>event.id===pending.eventId);
    assert.equal(runtime.resolveEventChoice(state,event.choices[0].id,event.id,pending.subjectId).ok,true);
  }
}

function capture(runtime, fixtures, label, state) {
  const saved=copy(state);
  if(saved.yearSummary) runtime.dismissYearSummary(saved);
  assert.equal(runtime.validateSave(saved),true,`${label}: source runtime accepts its saved result`);
  fixtures.push({label,state:saved});
}

function acceptedBranch(runtime, state, decision, predicate) {
  for (const person of state.encounters) {
    if(decision==='casual' && !runtime.pregnancyChance(state,person,{casual:true})) continue;
    for(let rng=0;rng<5000;rng++) {
      const branch=copy(state); branch.rng=rng;
      const result=runtime.respondToEncounter(branch,person.id,decision);
      if(result.ok && result.accepted && predicate(branch)) return branch;
    }
  }
  return null;
}

function representativeSaves(runtime) {
  const fixtures=[];
  let encountered=null, pendingCaptured=false;
  for(const seed of [121,908,1447]) {
    const state=runtime.createGame({seed,firstName:'Saved',surname:'Compatibility'});
    capture(runtime,fixtures,`birth-${seed}`,state);
    while(state.age<27) {
      if(state.pendingEvents.length) {
        if(!pendingCaptured) { capture(runtime,fixtures,'pending-choice',state); pendingCaptured=true; }
        resolveChoices(runtime,state);
      }
      if(runtime.needsEducationChoice(state)) {
        assert.equal(runtime.chooseEducation(state,'work').ok,true);
        assert.equal(runtime.takeJob(state,'retail').ok,true);
      }
      assert.equal(runtime.advanceYear(state,noDeaths).ok,true);
      if([1,4,12,17,18,25,27].includes(state.age)) capture(runtime,fixtures,`age-${state.age}-${seed}`,state);
      if(state.pendingEvents.length && !pendingCaptured) { capture(runtime,fixtures,'pending-choice',state); pendingCaptured=true; }
      resolveChoices(runtime,state);
      if(state.age>=18 && state.encounters.length && !encountered) encountered=copy(state);
    }
  }
  assert.ok(pendingCaptured,'representative lives include an unresolved decision');
  assert.ok(encountered,'representative lives include actual saved encounters');
  capture(runtime,fixtures,'encounters',encountered);
  const partnered=acceptedBranch(runtime,encountered,'relationship',state=>!!state.partner);
  assert.ok(partnered,'the old public action creates a saved partner');
  capture(runtime,fixtures,'partner',partnered);
  const pregnancy=acceptedBranch(runtime,encountered,'casual',state=>!!state.pregnancy);
  assert.ok(pregnancy,'the old public action captures pregnancy and its co-parent copy');
  capture(runtime,fixtures,'pregnancy',pregnancy);
  const offspring=copy(pregnancy);
  if(runtime.needsEducationChoice(offspring)) assert.equal(runtime.chooseEducation(offspring,'work').ok,true);
  assert.equal(runtime.advanceYear(offspring,calm).ok,true);
  assert.ok(offspring.children.some(child=>!child.adopted && child.age===0));
  capture(runtime,fixtures,'biological-offspring',offspring);
  const adopted=copy(partnered);
  assert.equal(runtime.haveChild(adopted).ok,true);
  capture(runtime,fixtures,'adopted-offspring',adopted);
  return fixtures;
}

function verifyReads({label,state}) {
  const original=JSON.stringify(state);
  assert.equal(current.validateSave(state),true,`${label}: current validation`);
  assert.equal(JSON.stringify(state),original,`${label}: validation is pure`);
  const loaded=current.migrateSave(JSON.parse(original));
  assert.ok(loaded,`${label}: current load succeeds`);
  assert.equal(JSON.stringify(loaded),original,`${label}: all old fields and their absence survive loading`);
  for(let pass=0;pass<3;pass++) {
    const potential=current.datingPotential(loaded);
    assert.ok(Number.isFinite(potential) && potential>=0 && potential<=10);
    current.meetingChances(loaded);
    current.annualForecast(loaded);
    current.eventOdds(loaded);
    current.offeredJobs(loaded);
    current.offeredColleges(loaded);
    for(const person of loaded.encounters) {
      current.relationshipOdds(loaded,person);
      current.oneNightChance(loaded,person);
    }
    assert.equal(JSON.stringify(loaded),original,`${label}: preview pass ${pass+1} preserves ratings, RNG, history, encounters and pending records`);
  }
  assert.equal(Object.hasOwn(loaded,'datingPotential'),false);
  assert.equal(JSON.stringify(state),original,`${label}: original remains unchanged`);
}

let importId=0;
async function verifyMenus({label,state}) {
  const original=JSON.stringify(state), storage=new Map([['lifelines.save.v1',original]]);
  const globals=new Map(['document','window','localStorage','setTimeout'].map(key=>[key,Object.getOwnPropertyDescriptor(globalThis,key)]));
  const timers=[];
  const nativeTimeout=globalThis.setTimeout;
  const {document,window}=parseHTML(await readFile(new URL('../index.html',import.meta.url),'utf8'));
  let writes=0;
  Object.assign(globalThis,{document,window,
    localStorage:{getItem:key=>storage.get(key) ?? null,setItem:(key,value)=>{writes++;storage.set(key,value);},removeItem:key=>storage.delete(key)},
    setTimeout:(...args)=>{const timer=nativeTimeout(...args);timer.unref();timers.push(timer);return timer;},
  });
  const click=selector=>{
    const element=document.querySelector(selector);
    assert.ok(element,`${label}: ${selector}`);
    element.dispatchEvent(new window.Event('click',{bubbles:true,cancelable:true}));
  };
  try {
    await import(`../app.js?dating-save-audit=${++importId}`);
    const initialWrites=writes;
    assert.equal(storage.get('lifelines.save.v1'),original,`${label}: startup resaves identical JSON`);
    for(const tab of ['year','career','family','year']) click(`.nav-list [data-tab="${tab}"]`);
    if(state.age>=18) {
      click('.dating-potential [data-topic="dating-potential"]');
      assert.match(document.querySelector('.help-popup').textContent,/weighted average/);
      click('.help-popup [data-action="close"]');
    }
    click('[data-action="menu"]');
    click('.menu-list [data-action="help"]');
    click('.modal [data-action="close"]');
    assert.equal(writes,initialWrites,`${label}: viewing tabs/help never adds a save write`);
    assert.equal(storage.get('lifelines.save.v1'),original,`${label}: saved JSON is identical after menus`);
    assert.equal(JSON.stringify(state),original,`${label}: menu input is unchanged`);
  } finally {
    timers.forEach(clearTimeout);
    for(const [key,descriptor] of globals) {
      if(descriptor) Object.defineProperty(globalThis,key,descriptor);
      else delete globalThis[key];
    }
  }
}

test('portable dating and genetics save records survive load, previews and menus exactly',async t=>{
  const fixtures=representativeSaves(current);
  for(const fixture of fixtures) verifyReads(fixture);
  for(const label of ['birth-121','age-12-121','age-18-121','encounters','partner','pregnancy','biological-offspring','adopted-offspring','pending-choice']) {
    await verifyMenus(fixtures.find(fixture=>fixture.label===label));
  }
  t.diagnostic(`${fixtures.length} portable saves; nine menu paths; repeated reads preserve every saved field.`);
});

test('independent pre-change runtime saves retain all ratings, family genetics, encounters and RNG',{skip:baseline?false:'Optional .git/dating-genetics-baseline is absent'},async t=>{
  const fixtures=representativeSaves(baseline);
  for(const fixture of fixtures) verifyReads(fixture);
  for(const fixture of fixtures) await verifyMenus(fixture);
  t.diagnostic(`${fixtures.length} genuine pre-change runtime saves; every save survives current menus and three rounds of pure reads byte-for-byte.`);
});
