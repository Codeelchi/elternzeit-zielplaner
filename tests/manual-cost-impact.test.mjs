import test from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const {compareManualCostBuffer:compare}=createRequire(import.meta.url)('../src/manual-cost-impact.cjs');
const rows=()=>Array.from({length:3},(_,i)=>({lm:i+1,fi:100,mi:0,fg:0,mg:0,childcare:0,kind:0,maternityBenefits:0}));
const options={wagePercent:0,elterngeldPercent:0,costPercent:0};
test('explicit monthly insurance and optional tax reserve change comparisons, not entitlements',()=>{
 const r=compare({rows:rows(),expenses:100,insurancePerMonth:20.25,taxReservePerMonth:30.05,assumptions:options});
 assert.equal(r.knownExpenses,true);
 assert.equal(r.additionalAllocatedPerMonth,50.3);
 assert.equal(r.results[1].normalReserve,0);
 assert.equal(r.results[1].bufferReserve,150.9);
 assert.equal(r.results[1].additionalReserve,150.9);
 assert.equal(r.results[1].normalLowest,0);
 assert.equal(r.results[1].adjustedLowest,-50.3);
 assert.equal(r.entitlementChanged,false);
 assert.equal(r.legalTaxCalculated,false);
});
test('without real household expense data no positive surplus or new precision is produced',()=>{
 const r=compare({rows:rows(),expenses:'',insurancePerMonth:100});
 assert.equal(r.knownExpenses,false);
 assert.deepEqual(r.results,[]);
});
test('known zero is different from unknown spending',()=>{
 const r=compare({rows:rows(),expenses:0,insurancePerMonth:50,assumptions:options});
 assert.equal(r.knownExpenses,true);
 assert.equal(r.results[1].adjustedLowest,50);
});
test('explicit already-included insurance is protected against double counting',()=>{
 assert.throws(()=>compare({rows:rows(),expenses:100,insuranceAlreadyIncluded:true,insurancePerMonth:15}),/doppelt/);
 assert.equal(compare({rows:rows(),expenses:100,insuranceAlreadyIncluded:true,insurancePerMonth:0}).knownExpenses,true);
});
test('invalid money and fractional-cent data cannot affect budget without warning',()=>{
 for(const extra of [-1,1.005,'22',NaN,Infinity,60000])
  assert.throws(()=>compare({rows:rows(),expenses:100,insurancePerMonth:extra,assumptions:options}),RangeError);
 assert.throws(()=>compare({rows:[],expenses:100}),TypeError);
 assert.throws(()=>compare({rows:rows(),expenses:100,insuranceAlreadyIncluded:'no'}),TypeError);
});
test('does not mutate original row data or recalculate on assumed payment dates',()=>{
 const input=rows(),before=JSON.stringify(input);
 const result=compare({rows:input,expenses:200,taxReservePerMonth:100,assumptions:options});
 assert.equal(JSON.stringify(input),before);
 assert.equal(result.insurancePremiumInferred,false);
});
