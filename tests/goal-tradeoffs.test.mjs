import test from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const {rankCandidates,tradeoffFrontier}=createRequire(import.meta.url)('../src/goal-ranking.cjs');
const m=(home,total)=>({metrics:{home,total}});
const item=(id,monthly,father=0,mother=0)=>({
 id,schedule:monthly.map((_,i)=>({f:i<father?'U':'W',m:i<mother?'U':'W',hf:id})),
 calc:{valid:true,rows:monthly.map((money,i)=>({f:i<father?'U':'W',m:i<mother?'U':'W',cashAfter:money}))}
});
test('tradeoff frontier excludes a strictly dominated option in both family time and budget',()=>{
 const pool=[m(2,3000),m(2,4000),m(3,4000),m(4,3500),m(5,3200)];
 const {annotate,frontierCombinations,comparedCandidates}=tradeoffFrontier(pool);
 assert.equal(frontierCombinations,3);
 assert.equal(comparedCandidates,5);
 assert.equal(annotate(pool[0].metrics).isNondominated,false);
 assert.equal(annotate(pool[1].metrics).isNondominated,false);
 assert.equal(annotate(pool[2].metrics).isNondominated,true);
 assert.equal(annotate(pool[3].metrics).isNondominated,true);
 assert.equal(annotate(pool[4].metrics).isNondominated,true);
});
test('identical tradeoff metrics are not incorrectly dominated',()=>{
 const pool=[m(1,1200),m(1,1200)];
 assert.equal(tradeoffFrontier(pool).annotate(pool[0].metrics).isNondominated,true);
});
test('selected plans include traceable frontier metadata without mutating input plans',()=>{
 const arr=[item(1,[2200,2200],0,0),item(2,[2000,1800],1,1),item(3,[1600,1600],2,0)];
 const before=JSON.stringify(arr);
 const chosen=rankCandidates(arr,{horizon:2,limit:3});
 assert.ok(chosen.length>0);
 assert.ok(chosen.every(c=>c.tradeoff.comparedCandidates===arr.length));
 for(const c of chosen) {
  assert.equal(c.tradeoff.scope,'VALIDATED_CANDIDATE_POOL');
  assert.ok(Number.isInteger(c.tradeoff.frontierCombinations));
  assert.deepEqual(c.tradeoff.axes,['totalAvailable','fullParentMonths']);
 }
 assert.equal(JSON.stringify(arr),before);
});
test('frontier rejects missing and unsafe financial comparisons',()=>{
 assert.throws(()=>tradeoffFrontier(null),TypeError);
 assert.throws(()=>tradeoffFrontier([{metrics:{home:2,total:NaN}}]),TypeError);
 assert.throws(()=>tradeoffFrontier([{metrics:{home:2,total:1e20}}]),RangeError);
});
