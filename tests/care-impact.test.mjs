import test from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const {projectDelayedCareScenario:project}=createRequire(import.meta.url)('../src/care-impact.cjs');
const rows=Array.from({length:6},(_,i)=>({lm:i+1,fi:1100,mi:800,fg:700,kind:250,childcare:i>=2?200:0,cashAfter:1500.25}));
const base={rows,startLm:3,delayMonths:2,expensesKnown:true};

test('only affected life months change, never base model rows or benefit projection',()=>{
 const original=JSON.stringify(rows);
 const result=project({...base,monthlyIncomeReduction:500.50,monthlyExtraCare:110.25});
 assert.deepEqual(result.affectedMonths,[3,4]);
 assert.equal(result.delayedStartLm,5);
 assert.equal(result.totalChange,-1221.5);
 assert.equal(result.months[0].baselineAvailable,1500.25);
 assert.equal(result.months[0].alternativeAvailable,889.50);
 assert.equal(JSON.stringify(rows),original);
 assert.equal(result.bankReceiptsPredicted,false);
});
test('zero delay is truly zero even when hypothetical inputs are nonzero',()=>{
 const result=project({...base,delayMonths:0,monthlyIncomeReduction:2000,monthlyExtraCare:200});
 assert.deepEqual(result.months,[]);
 assert.equal(result.totalChange,0);
});
test('baseline Kita fees do not magically disappear',()=>{
 assert.equal(project({...base,monthlyIncomeReduction:100}).totalChange,-200);
 const result=project({...base,monthlyIncomeReduction:100,waiveOriginalFees:true});
 assert.equal(result.totalWaivedFees,400);
 assert.equal(result.totalChange,200);
});
test('explicit zero and missing expenses do not claim a known available budget',()=>{
 const r=project({...base,expensesKnown:false,monthlyExtraCare:125});
 assert.equal(r.totalChange,-250);
 assert.equal(r.months[0].alternativeAvailable,null);
 assert.equal(r.comparedBaselineTotal,null);
 assert.match(r.warnings.join(' '),/Haushaltsausgaben fehlen/);
});
test('delayed start beyond projection horizon is not clamped to the final month',()=>{
 const r=project({rows,startLm:6,delayMonths:6,expensesKnown:true});
 assert.equal(r.delayedStartLm,12);
 assert.deepEqual(r.affectedMonths,[6]);
 assert.equal(r.outsideHorizonMonths,5);
});
test('cent arithmetic is exact across small manual changes',()=>{
 const r=project({...base,monthlyIncomeReduction:0.1,monthlyExtraCare:0.2});
 assert.equal(r.totalChange,-0.6);
 assert.equal(r.months[0].alternativeAvailable,1499.95);
});
test('reject invalid, non-finite, overprecise and negative manual values',()=>{
 for(const v of [-0.01,0.001,Infinity,NaN,100000.01,'200']) {
  assert.throws(()=>project({...base,monthlyIncomeReduction:v}),RangeError,String(v));
  assert.throws(()=>project({...base,monthlyExtraCare:v}),RangeError,String(v));
 }
});
test('reject malformed projection sequence and type/period mismatches',()=>{
 for(const changes of [{rows:[]},{startLm:0},{delayMonths:-1},{delayMonths:7},
  {rows:[rows[1]]},{waiveOriginalFees:'yes'},{expensesKnown:'false'}]) {
  assert.throws(()=>project({...base,...changes}));
 }
});
