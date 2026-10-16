import test from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const {projectFamilyBudget}=require('../src/family-budget.cjs');
const {comparePlans}=require('../src/plan-comparison.cjs');
const realistic=options=>projectFamilyBudget(options).scenarios.find(s=>s.id==='realistic');

test('balanced cent bookings do not create phantom shortage or reserve',()=>{
 const b=realistic({rows:[{fi:.3,childcare:.1}],expenses:.2});
 assert.equal(b.months[0].available,0);
 assert.equal(b.requiredReserves,0);
 assert.deepEqual(b.bottleneckMonths,[]);
});

test('96-month totals and prefix reserves use booked cents without drift',()=>{
 const rows=Array.from({length:96},(_,i)=>({lm:i+1,fi:i===0?0:.01}));
 const b=realistic({rows,expenses:.01});
 assert.equal(b.totalIncome,.95);
 assert.equal(b.totalAvailable,-.01);
 assert.equal(b.requiredReserves,.01);
 assert.equal(b.months.at(-1).cumulativeSurplus,-.01);
 assert.deepEqual(b.bottleneckMonths,[1]);
});

test('scenario line items are rounded before budget balances are calculated',()=>{
 const b=projectFamilyBudget({rows:[{fi:1.15,mi:2.25,fg:1.15,childcare:1.15}],expenses:1.15,assumptions:{wagePercent:10,elterngeldPercent:10,costPercent:10}}).scenarios[0];
 const r=b.months[0];
 assert.equal(r.fatherWage,1.04);
 assert.equal(r.motherWage,2.03);
 assert.equal(r.elterngeld,1.04);
 assert.equal(r.childcare,1.27);
 assert.equal(r.householdExpenses,1.27);
 assert.equal(r.income,4.11);
 assert.equal(r.available,1.57);
});

test('raw direct budget API rejects coercible financial objects and booleans',()=>{
 for(const value of [true,false,[],[100],{},'  ',1e10]){
  for(const field of ['fi','mi','fg','mg','kind','childcare','maternityBenefits'])assert.throws(()=>projectFamilyBudget({rows:[{[field]:value}]}),RangeError);
  assert.throws(()=>projectFamilyBudget({rows:[{}],expenses:value}),RangeError);
  assert.throws(()=>projectFamilyBudget({rows:[{}],assumptions:{costPercent:value}}),RangeError);
 }
 assert.equal(realistic({rows:[{fi:'10.25'}]}).totalIncome,10.25);
 assert.equal(realistic({rows:[{fi:null,mi:''}]}).totalIncome,0);
});

test('malformed containers fail explicitly while malformed grant entries stay excluded',()=>{
 assert.throws(()=>projectFamilyBudget({rows:new Array(1)}),TypeError);
 for(const row of [null,undefined,[],true])assert.throws(()=>projectFamilyBudget({rows:[row]}),TypeError);
 for(const assumptions of [null,[],true])assert.throws(()=>projectFamilyBudget({rows:[{}],assumptions}),TypeError);
 for(const confirmedGrants of [null,{},true])assert.throws(()=>projectFamilyBudget({rows:[{}],confirmedGrants}),TypeError);
 const b=projectFamilyBudget({rows:[{}],confirmedGrants:[null,undefined,[],true]});
 assert.equal(b.rejectedGrants.length,4);
 assert.equal(b.scenarios[1].totalIncome,0);
});

test('documented grants are booked individually in cents and remain scenario invariant',()=>{
 const grant={confirmed:true,lm:1,sourceUrl:'https://example.invalid/synthetic',verifiedAt:'2026-10-16',validFrom:'2026-01-01',validUntil:'2026-12-31',entitlementDate:'2026-10-16'};
 const b=projectFamilyBudget({rows:[{}],confirmedGrants:[{...grant,amount:1.005},{...grant,amount:2.005}]});
 assert.deepEqual(b.scenarios.map(s=>s.totalIncome),[3.02,3.02,3.02]);
});

test('direct plan comparison inherits exact balanced-month budget results',()=>{
 const b=comparePlans([{calc:{rows:[{lm:1,f:'U',m:'U',fi:.3,childcare:.1}]}}],{horizon:1,expenses:.2,assumptions:{wagePercent:0,costPercent:0}});
 assert.equal(b.plans[0].realistic.requiredReserves,0);
 assert.equal(b.plans[0].realistic.lowestAvailable,0);
 assert.deepEqual(b.plans[0].realistic.bottleneckMonths,[]);
});


test('two parents’ independently rounded benefit amounts are not combined before rounding',()=>{
 assert.equal(realistic({rows:[{fg:1.005,mg:2.005}]}).months[0].elterngeld,3.02);
});

test('percentage bands multiply decimal amounts exactly before half-cent rounding',()=>{
 const {roundEuroByPercent}=require('../src/money.cjs');
 for(const [input,expected] of [[1.70,1.45],[2.30,1.96],[3.30,2.81],[4.10,3.49]]){
  assert.equal(roundEuroByPercent(input,-15),expected);
  const b=projectFamilyBudget({rows:[{fi:input}],assumptions:{fatherWagePercent:15}});
  assert.equal(b.scenarios[0].months[0].fatherWage,expected);
 }
 assert.equal(roundEuroByPercent(2.55,-15),2.17);
 assert.equal(roundEuroByPercent(1.50,33.3),2);
});

test('percentage helper matches independent integer arithmetic across cents and bands',()=>{
 const {roundEuroByPercent}=require('../src/money.cjs');
 for(const delta of [-100,-15,-5,0,5,15,100]){
  for(let sourceCents=1;sourceCents<=1000;sourceCents++){
   const expected=Math.floor((sourceCents*(100+delta)+50)/100)/100;
   assert.equal(roundEuroByPercent(sourceCents/100,delta),expected,`${sourceCents} cents, delta ${delta}`);
  }
 }
});

test('percentage helper rejects coercion and invalid scenario changes',()=>{
 const {roundEuroByPercent}=require('../src/money.cjs');
 for(const invalid of [undefined,null,true,'15',NaN,Infinity,101,-101])assert.throws(()=>roundEuroByPercent(10,invalid),RangeError);
 for(const invalid of [undefined,null,true,'10',NaN,Infinity,1e10])assert.throws(()=>roundEuroByPercent(invalid,15),RangeError);
});
