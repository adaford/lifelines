import test from 'node:test';
import assert from 'node:assert/strict';
import { desirability, meetingChances, prospectQuality, relationshipOdds, oneNightChance, proposalChance, pregnancyChance, gestatingActor, attractivenessAgeChange, createProspects } from '../relationships.js';

const core = ['intelligence', 'strength', 'attractiveness', 'social', 'creativity'];
const traits = [...core, 'health', 'stability'];
const actor = (value = 5) => ({ id: 'player', age: 30, stats: Object.fromEntries(traits.map(key=>[key,value])), lifestyle: value, focus: {social:3}, gender:'male', canGestate:false, attractedTo:['female'], appearancePeakAge:30, children:[], partner:null, pregnancy:null });
const partner = (value = 5) => ({ ...actor(value), id:'partner', gender:'female', canGestate:true, relationship:5, yearsTogether:0, married:false, lastProposalAge:-1, alive:true });
function seededHelpers(seed) {
  let rng=seed, nextId=0;
  const random=()=>{
    rng=(rng+0x6D2B79F5)>>>0;
    let value=Math.imul(rng ^ rng>>>15,rng|1);
    value^=value+Math.imul(value ^ value>>>7,value|61);
    return ((value ^ value>>>14)>>>0)/4294967296;
  };
  const integer=(low,high)=>low+Math.floor(random()*(high-low+1));
  return {random,integer,uid:prefix=>`${prefix}-${++nextId}`,personName:()=>`Riley Reed ${++nextId}`};
}

test('meeting frequency runs from a rare single opportunity to at most five',()=>{
  const low=actor(1), high=actor(10);
  assert.equal(desirability(low),1);
  assert.equal(meetingChances(low).slots,1);
  assert.ok(Math.abs(meetingChances(low).expected-.22)<1e-10);
  assert.equal(meetingChances(high).slots,5);
  assert.ok(Math.abs(meetingChances(high).expected-4.6)<1e-10);
  for(const key of ['attractiveness','social']) {
    const changed=actor(1);changed.stats[key]=10;
    assert.ok(meetingChances(changed).expected>meetingChances(low).expected);
  }
  const lifestyle=actor(1);lifestyle.lifestyle=10;
  assert.ok(meetingChances(lifestyle).expected>meetingChances(low).expected);
  const focused=actor(5);focused.focus.social=5;
  assert.ok(meetingChances(focused).expected>meetingChances(actor(5)).expected);
});

test('underage, partnered, and finished lives do not create encounters',()=>{
  for(const state of [{...actor(),age:17},{...actor(),partner:partner()},{...actor(),ended:true},{...actor(),needsSuccession:true},{...actor(),age:85}]) {
    assert.equal(meetingChances(state).expected,0);
    assert.deepEqual(createProspects(state,seededHelpers(4)),[]);
  }
});

test('higher profile quality increases rejection risk and higher appeal helps',()=>{
  assert.ok(prospectQuality(partner(10))>prospectQuality(partner(1)));
  assert.ok(relationshipOdds(actor(5),partner(1))>relationshipOdds(actor(5),partner(10)));
  assert.ok(relationshipOdds(actor(10),partner(5))>relationshipOdds(actor(1),partner(5)));
  assert.ok(oneNightChance(actor(5),partner(5))>relationshipOdds(actor(5),partner(5)));
  assert.equal(relationshipOdds(actor(5),{...partner(),age:17}),0);
  assert.equal(oneNightChance({...actor(),age:17},partner()),0);
});

test('shared years strongly improve marriage chances and attempts are annual',()=>{
  const state=actor();state.partner=partner();
  const initial=proposalChance(state);
  state.partner.yearsTogether=6;
  assert.ok(proposalChance(state)-initial>.4);
  const weaker=proposalChance(state);state.partner.relationship=9;
  assert.ok(proposalChance(state)>weaker);
  state.partner.lastProposalAge=state.age;
  assert.equal(proposalChance(state),0);
  state.age++;assert.ok(proposalChance(state)>0);
  state.partner.married=true;assert.equal(proposalChance(state),0);
});

test('pregnancy is rare when dating, much more common in marriage, and actor-generic',()=>{
  const state=actor();state.partner=partner(10);
  assert.equal(pregnancyChance(state),.02);
  assert.equal(pregnancyChance(state,state.partner,{casual:true}),.01);
  state.partner.married=true;assert.equal(pregnancyChance(state),.25);
  assert.equal(gestatingActor(state),state.partner);
  const futurePlayer={...actor(10),gender:'female',canGestate:true,attractedTo:['male']};
  futurePlayer.partner={...partner(10),gender:'male',canGestate:false,married:true};
  assert.equal(gestatingActor(futurePlayer),futurePlayer);
  assert.equal(pregnancyChance(futurePlayer),.25);
  for(const change of [s=>s.pregnancy={},s=>s.children=Array(6).fill({}),s=>s.partner.age=46,s=>s.partner.age=17,s=>s.canGestate=true,s=>s.age=84]) {
    const blocked=structuredClone(state);change(blocked);assert.equal(pregnancyChance(blocked),0);
  }
});

test('prospect generation is deterministic, bounded, adult-only, and supports future preferences',()=>{
  const state=actor(10);state.age=18;
  const first=createProspects(state,seededHelpers(990));
  assert.deepEqual(createProspects(state,seededHelpers(990)),first);
  assert.ok(first.length>0 && first.length<=5);
  for(const person of first) {
    assert.ok(person.age>=18 && person.age<=23);
    assert.deepEqual(Object.keys(person.stats),traits);
    assert.ok(Object.values(person.stats).every(value=>value>=1 && value<=10));
    assert.deepEqual(Object.keys(person.aptitudes),core);
    assert.ok(Object.values(person.aptitudes).every(value=>Number.isInteger(value) && value>=-3 && value<=3));
    assert.ok(person.appearancePeakAge>=27 && person.appearancePeakAge<=33);
    assert.equal(person.gender,'female');assert.equal(person.canGestate,true);
  }
  const future={...state,gender:'female',canGestate:true,attractedTo:['male']};
  assert.ok(createProspects(future,seededHelpers(991)).every(person=>person.gender==='male' && !person.canGestate));
  const older=createProspects({...state,age:70},seededHelpers(990));
  for(let index=0;index<first.length;index++) assert.ok(older[index].stats.attractiveness<first[index].stats.attractiveness);
});

test('higher appeal produces stronger profiles on average without removing variation',()=>{
  const low=[],high=[];
  for(let seed=0;seed<1500;seed++) {
    low.push(...createProspects(actor(1),seededHelpers(seed)).map(prospectQuality));
    high.push(...createProspects(actor(10),seededHelpers(seed)).map(prospectQuality));
  }
  const mean=values=>values.reduce((a,b)=>a+b,0)/values.length;
  assert.ok(low.length>100);
  assert.ok(high.length/1500>4 && high.length/1500<=5);
  assert.ok(mean(high)-mean(low)>3);
});

test('appearance ages turn gradually downward after each individual peak',()=>{
  assert.equal(attractivenessAgeChange({...actor(),age:26,appearancePeakAge:27}),0);
  assert.ok(attractivenessAgeChange({...actor(),age:27,appearancePeakAge:27})<0);
  assert.ok(attractivenessAgeChange({...actor(),age:50})<attractivenessAgeChange({...actor(),age:30}));
  assert.ok(attractivenessAgeChange({...actor(),age:84})>-.15);
});
