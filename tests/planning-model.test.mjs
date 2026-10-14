import test from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const {materializePlan}=createRequire(import.meta.url)('../src/planning-model.cjs');
const plan=()=>Array.from({length:36},(_,i)=>({f:i===2?'B':'W',m:i<2?'MS':'W'}));
const state=()=>({date:'2027-05-28',hoursFather:28,hoursMother:28});
test('independent employment and benefit axes produce canonical finance status',()=>{
 const s={...state(),employmentOverrides:{father:[{lm:3,weeklyHours:24},{lm:4,weeklyHours:0},{lm:5,weeklyHours:40}]},benefitOverrides:{father:[{lm:3,type:'plus'},{lm:4,type:'basis'},{lm:5,type:'none'}]}};
 const out=materializePlan({state:s,schedule:plan()});
 assert.deepEqual(out.schedule.slice(2,5).map(r=>[r.f,r.hf]),[['T',24],['B',0],['W',40]]);
 assert.equal(out.axes.timeline[2].parents.father.benefit.type,'plus');
});
test('leave edits never alter wages or entitlement statuses',()=>{
 const raw=plan();const first=materializePlan({state:state(),schedule:raw});
 const edited=materializePlan({state:{...state(),leaveOverrides:{father:[],mother:[{startDate:'2027-10-01',endDate:'2027-10-20'}]}},schedule:raw});
 assert.deepEqual(edited.schedule,first.schedule);
 assert.deepEqual(raw,plan());
});
test('basis, plus, bonus, unpaid and independent work map separately',()=>{
 const s={...state(),employmentOverrides:{father:[{lm:3,weeklyHours:20},{lm:4,weeklyHours:0},{lm:5,weeklyHours:26},{lm:6,weeklyHours:0},{lm:7,weeklyHours:30}]},benefitOverrides:{father:[{lm:3,type:'basis'},{lm:4,type:'plus'},{lm:5,type:'partnership_bonus'},{lm:6,type:'none'},{lm:7,type:'none'}]}};
 assert.deepEqual(materializePlan({state:s,schedule:plan()}).schedule.slice(2,7).map(r=>r.f),['R','P','K','U','Q']);
});
test('maternity is automatically applied to touched life months',()=>{
 const raw=plan();raw[0].m='W';raw[1].m='P';
 const out=materializePlan({state:state(),schedule:raw});
 assert.deepEqual(out.schedule.slice(0,2).map(r=>[r.m,r.hm]),[['MS',0],['MS',0]]);
 assert.equal(out.requiresIndividualReview,false);
 assert.equal(out.axes.timeline[0].parents.mother.employment.weeklyHours,0);
 assert.equal(out.axes.timeline[1].parents.mother.benefit.type,'maternity_offset_basis');
 const early=materializePlan({state:{...state(),expectedDueDate:'2027-06-25'},schedule:plan()});
 assert.equal(early.schedule[2].m,'MS');assert.equal(early.requiresIndividualReview,true);
});
test('malformed statuses, overrides and hours fail instead of being coerced',()=>{
 for(const hours of [-1,41,Infinity,NaN,'24'])assert.throws(()=>materializePlan({state:{...state(),hoursFather:hours},schedule:plan()}),RangeError);
 for(const employmentOverrides of [{father:[{lm:3,weeklyHours:41}]},{father:[{lm:3,weeklyHours:'24'}]},[],{unknown:[]}])assert.throws(()=>materializePlan({state:{...state(),employmentOverrides},schedule:plan()}));
 for(const benefitOverrides of [{father:[{lm:3,type:'unknown'}]},{father:[{lm:3,type:'basis'},{lm:3,type:'plus'}]},[]])assert.throws(()=>materializePlan({state:{...state(),benefitOverrides},schedule:plan()}));
 const raw=plan();raw[3].f='unknown';assert.throws(()=>materializePlan({state:state(),schedule:raw}),RangeError);
});
test('explicit work or Plus during maternity is rejected',()=>{
 assert.throws(()=>materializePlan({state:{...state(),employmentOverrides:{mother:[{lm:1,weeklyHours:20}]}},schedule:plan()}),RangeError);
 assert.throws(()=>materializePlan({state:{...state(),benefitOverrides:{mother:[{lm:1,type:'plus'}]}},schedule:plan()}),RangeError);
});
