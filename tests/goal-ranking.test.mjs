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

test('calendar shifts with identical care and budget effects do not manufacture alternatives',()=>{
 const first=candidate(1,[1000,1000,1000],1,0);
 const shifted=candidate(2,[1000,1000,1000],1,0);
 shifted.schedule=[{f:'W',m:'W'},{f:'U',m:'W'},{f:'W',m:'W'}];
 shifted.calc.rows=shifted.schedule.map(row=>({...row,cashAfter:1000}));
 const selected=rankCandidates([shifted,first],{horizon:3});
 assert.equal(selected.length,1);
 assert.equal(selected[0].diversity.kind,'primary');
 assert.deepEqual(selected[0].diversity.comparedWith,[]);
});

test('minor monetary variations and hours-only fingerprints do not fill three cards',()=>{
 const high=candidate(1,[1050,1050]);
 const low=candidate(2,[1000,1000]);
 const middle=candidate(3,[1020,1020]);
 const selected=rankCandidates([low,middle,high],{horizon:2});
 assert.deepEqual(selected.map(x=>x.id),[1]);
 assert.equal(selected[0].diversity.thresholds.totalEuro,200);
});

test('financial threshold boundary is inclusive and exposes signed differences',()=>{
 const high=candidate(1,[1100,1100]);
 const near=candidate(2,[1000.01,1000.01]);
 const boundary=candidate(3,[1000,1000]);
 const selected=rankCandidates([near,boundary,high],{horizon:2});
 assert.deepEqual(selected.map(x=>x.id),[1,3]);
 assert.equal(selected[1].diversity.kind,'alternative');
 const differences=selected[1].diversity.comparedWith[0].differences;
 assert.equal(differences.find(x=>x.code==='floor').delta,-100);
 assert.equal(differences.find(x=>x.code==='total').threshold,200);
});

test('alternative must differ materially from every previous card, not just the winner',()=>{
 const winner=candidate(1,[2000,2000]);
 const alternate=candidate(2,[1500,1500],1,1);
 const almostSame=candidate(3,[1510,1510],1,1);
 const distinct=candidate(4,[1200,1200],2,0);
 const selected=rankCandidates([winner,alternate,almostSame,distinct],{horizon:2});
 assert.equal(selected.length,3);
 assert.equal(selected[0].id,1);
 assert.ok(!(selected.some(x=>x.id===2)&&selected.some(x=>x.id===3)));
 assert.equal(selected[2].diversity.comparedWith.length,2);
 assert.ok(selected[2].diversity.comparedWith.every(x=>x.differences.length>0));
});

test('different simultaneous care and part-time patterns are structural alternatives',()=>{
 const together=candidate(1,[1000,1000],1,1);
 const apart=candidate(2,[1000,1000],1,1);
 apart.calc.rows[1].m='U';apart.calc.rows[0].m='W';
 apart.schedule=apart.calc.rows.map(({cashAfter,...row})=>row);
 const selected=rankCandidates([together,apart],{horizon:2});
 assert.equal(selected.length,2);
 assert.ok(selected[1].diversity.comparedWith[0].differences.some(x=>x.code==='sharedHome'));
 const partTime=candidate(3,[1000,1000]);
 partTime.calc.rows[0].f='Q';partTime.schedule[0].f='Q';
 assert.equal(rankCandidates([candidate(4,[1000,1000]),partTime],{horizon:2}).length,2);
});

test('shifted cashflow qualifies only when initial reserve or another threshold changes',()=>{
 const earlyLoss=candidate(1,[-600,600]);
 const lateLoss=candidate(2,[600,-600]);
 const selected=rankCandidates([earlyLoss,lateLoss],{horizon:2});
 assert.equal(selected.length,2);
 assert.equal(selected[0].rankingMetrics.total,selected[1].rankingMetrics.total);
 assert.equal(selected[0].rankingMetrics.floor,selected[1].rankingMetrics.floor);
 assert.ok(selected[1].diversity.comparedWith[0].differences.some(x=>x.code==='reserve'&&Math.abs(x.delta)===600));
});

test('missing stress estimates cannot create an alleged robustness difference',()=>{
 const a=candidate(1,[1000,1000],0,0,[800,800]);
 const b=candidate(2,[1000,1000]);
 assert.equal(rankCandidates([a,b],{horizon:2}).length,1);
});

test('reserve diversity uses the selected minimum and recognizes timing gaps',()=>{
 const earlyGap=candidate(1,[100,100,1900,1900]),lateGap=candidate(2,[1900,1900,100,100]);
 const selected=rankCandidates([earlyGap,lateGap],{horizon:4,minimum:1000});
 assert.equal(selected.length,2);assert.ok(selected[1].diversity.comparedWith[0].differences.some(d=>d.code==='reserve'&&Math.abs(d.delta)===1800));
 assert.throws(()=>rankCandidates([earlyGap],{horizon:4,minimum:NaN}),/Mindestbetrag/);
});


test('financially distinct proposals with identical full-home month counts receive different, traceable headings',()=>{
 const rich=candidate(201,[2800,2400],1,1,[1300,900]);
 const middle=candidate(202,[2200,2200],1,1,[1600,1600]);
 const resilient=candidate(203,[2000,2000],1,1,[1700,1700]);
 const selected=rankCandidates([resilient,rich,middle],{horizon:2,limit:3});
 assert.equal(selected.length,3);
 assert.deepEqual(selected.map(x=>x.profile),['finance','balanced','robust']);
 assert.ok(selected.every(x=>x.rankingMetrics.father===1&&x.rankingMetrics.mother===1));
 assert.equal(new Set(selected.map(x=>x.title)).size,3);
 assert.match(selected[0].title,/Gesamtbudget im Fokus/);
 assert.match(selected[0].title,/5.200/);
 assert.match(selected[1].title,/Zeitaufteilung im Fokus/);
 assert.match(selected[1].title,/1\/1 volle Monate/);
 assert.match(selected[2].title,/Vorsichtiges Szenario/);
 assert.match(selected[2].title,/1.700/);
 assert.ok(selected[1].diversity.comparedWith[0].differences.some(d=>d.code==='total'));
});

test('robust proposal without adverse measurements does not invent a stress-tested claim',()=>{
 const selected=rankCandidates([candidate(204,[700,900])],{horizon:2,objective:'robust'});
 assert.match(selected[0].title,/ohne Stresstest/);
 assert.doesNotMatch(selected[0].title,/Vorsichtiges Szenario/);
 assert.equal(selected[0].score,700); // The fallback headline and exported score use the same measured floor.
});
