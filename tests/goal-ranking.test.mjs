import test from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const {rankCandidates,scheduleFingerprint,SEARCH_LIMITATIONS}=createRequire(import.meta.url)('../src/goal-ranking.cjs');
function candidate(id,cash,father=0,mother=0,adverse) {
 const schedule=cash.map((_,i)=>({f:i<father?'U':'W',m:i<mother?'U':'W',hf:id}));
 const calc={valid:true,rows:schedule.map((row,i)=>({...row,cashAfter:cash[i]}))};
 return {id,schedule,calc,...(adverse?{adverse:{valid:true,rows:schedule.map((row,i)=>({...row,cashAfter:adverse[i]}))}}:{})};
}
test('objective winner followed by meaningful balance and robust profiles',()=>{
 const rich=candidate(1,[4000,500],2,0,[3000,100]);
 const balanced=candidate(2,[1600,1600],1,1,[1300,1300]);
 const stable=candidate(3,[1500,1500],2,1,[1400,1400]);
 const selected=rankCandidates([stable,balanced,rich],{horizon:2});
 assert.deepEqual(selected.map(x=>x.id),[1,2,3]);
 assert.deepEqual(selected.map(x=>x.profile),['finance','balanced','robust']);
 assert.match(selected[2].explanation,/vorsichtigen Szenario/);
 assert.equal(selected[2].rankingMetrics.adverseFloor,1400);
});
test('lexicographic goals cannot be overridden by a large secondary budget',()=>{
 const rich=candidate(1,[1e9,1e9],0,0);
 const home=candidate(2,[500,500],1,0);
 assert.equal(rankCandidates([rich,home],{horizon:2,objective:'father',limit:1})[0].id,2);
 const highTotal=candidate(3,[100,1e9]);
 assert.equal(rankCandidates([highTotal,home],{horizon:2,objective:'floor',limit:1})[0].id,2);
});
test('robust objective maximizes adverse minimum before adverse total',()=>{
 const total=candidate(1,[4000,4000],0,0,[100,8000]);
 const floor=candidate(2,[2000,2000],0,0,[1200,1200]);
 assert.equal(rankCandidates([total,floor],{horizon:2,objective:'robust',limit:1})[0].id,2);
});
test('fingerprints preserve explicit zero hours and both parent hours',()=>{
 const absent=[{f:'Q',m:'Q'}];
 const zero=[{f:'Q',m:'Q',hf:0}];
 const motherZero=[{f:'Q',m:'Q',hm:0}];
 assert.notEqual(scheduleFingerprint(absent),scheduleFingerprint(zero));
 assert.notEqual(scheduleFingerprint(zero),scheduleFingerprint(motherZero));
});
test('deduplicates actual schedules and does not mutate candidates or list',()=>{
 const first=candidate(1,[100,200]);
 const second={...first,id:2,schedule:first.schedule.map(x=>({...x}))};
 const before=JSON.stringify([first,second]);
 const selected=rankCandidates([first,second],{horizon:2});
 assert.equal(selected.length,1);
 assert.equal(JSON.stringify([first,second]),before);
 assert.notEqual(selected[0],first);
});
test('compares the requested horizon rather than global home counts or money',()=>{
 const a=candidate(1,[1000,0],0,0);
 const b=candidate(2,[900,1e6],2,0);
 a.calc.fFree=100;
 assert.equal(rankCandidates([a,b],{horizon:1,limit:1})[0].id,1);
 assert.equal(rankCandidates([a,b],{horizon:1,objective:'father',limit:1})[0].id,2);
});
test('rejects incomplete, invalid or nonfinite evaluations without manufacturing results',()=>{
 const bad=candidate(1,[100,NaN]);
 const invalid=candidate(2,[100,200]);invalid.calc.valid=false;
 const incomplete=candidate(3,[100]);
 const adverseBad=candidate(4,[100,200],0,0,[100,Infinity]);
 assert.deepEqual(rankCandidates([null,bad,invalid,incomplete,adverseBad],{horizon:2}),[]);
 assert.deepEqual(rankCandidates([]),[]);
 assert.deepEqual(rankCandidates([candidate(1,[100,200])],{horizon:2,limit:0}),[]);
});
test('missing adverse scenario is explicitly disclosed and search limits forbid optimality claims',()=>{
 const result=rankCandidates([candidate(1,[100,200])],{horizon:2,objective:'robust'});
 assert.match(result[0].explanation,/keine Aussage zur Robustheit/);
 assert.ok(SEARCH_LIMITATIONS.some(text=>text.includes('globalen Optima')));
});
test('deterministic tie handling and invalid options',()=>{
 const a=candidate(1,[100,200]),b=candidate(2,[100,200]);
 assert.deepEqual(rankCandidates([b,a],{horizon:2}).map(x=>x.id),rankCandidates([a,b],{horizon:2}).map(x=>x.id));
 assert.throws(()=>rankCandidates([],{horizon:0}),RangeError);
 assert.throws(()=>rankCandidates([],{limit:21}),RangeError);
 assert.throws(()=>rankCandidates(null),TypeError);
});

test('compact fingerprints distinguish override positions and retain month sequence',()=>{
 const schedule=Array.from({length:36},()=>({f:'W',m:'W'}));
 const baseline=scheduleFingerprint(schedule);
 const first=schedule.map(row=>({...row}));first[0].hf=0;
 const last=schedule.map(row=>({...row}));last[35].hf=0;
 assert.notEqual(scheduleFingerprint(first),scheduleFingerprint(last));
 assert.notEqual(scheduleFingerprint(first),baseline);
 const changed=schedule.map(row=>({...row}));changed[0]={f:'B',m:'P'};
 const reverse=schedule.map(row=>({...row}));reverse[0]={f:'P',m:'B'};
 assert.notEqual(scheduleFingerprint(changed),scheduleFingerprint(reverse));
 const legacy=JSON.stringify(schedule.map(row=>[row.f,row.m,null,null]));
 assert.ok(baseline.length < legacy.length / 4);
});
