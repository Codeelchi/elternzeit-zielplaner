import test from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const {compareCareResilience:compare}=require('../src/care-resilience.cjs');
const base={birthDate:'2026-05-28',careStartLm:19,delayWeeks:2,settlingWeeks:4,
 targetCareHours:35,firstWeekCareHours:5,plannedWorkHours:28,workReturnWeeks:0,
 backupHours:8,hourlyBackupCost:12,weeklyNetAtRisk:560,modelMonths:36,
 rows:Array.from({length:36},(_,i)=>({lm:i+1,cashAfter:1000})),expensesKnown:true};
test('same work assumptions, three childcare delay scenarios, reliable differences',()=>{
 const before=structuredClone(base),result=compare(base);
 assert.equal(result.active,true);
 assert.equal(result.variants.length,3);
 assert.deepEqual(result.variants.map(x=>x.actualDelayWeeks),[2,4,6]);
 assert.deepEqual(result.variants.map(x=>x.extraCost),[1620,2612,3604]);
 assert.deepEqual(result.variants.map(x=>x.differenceCost),[0,992,1984]);
 assert.deepEqual(result.variants.map(x=>x.uncoveredTransitionHours),[60,100,140]);
 assert.deepEqual(result.variants.map(x=>x.workReturnDate),['2027-11-28','2027-11-28','2027-11-28']);
 assert.equal(result.comparisonBasis,'SAME_WORK_RETURN_AND_HOURS_VARY_CHILDCARE_DELAY_ONLY');
 assert.equal(result.mutatedPlan,false);
 assert.deepEqual(base,before);
 assert.equal(result.allMoneyKnown,true);
});
test('unknown wage risk remains unknown for every scenario, not a false zero or sensitivity',()=>{
 const result=compare({...base,weeklyNetAtRisk:null});
 assert.equal(result.allMoneyKnown,false);
 assert.ok(result.variants.every(x=>x.extraCost===null&&x.differenceCost===null));
 assert.ok(result.variants.every(x=>x.cheapestMonthlyAvailable===null));
 assert.ok(result.variants.some(x=>x.uncoveredTransitionHours>0));
});
test('known money but missing household costs means no lowest-month budget claim',()=>{
 const result=compare({...base,expensesKnown:false});
 assert.equal(result.allMoneyKnown,true);
 assert.ok(result.variants.every(x=>x.cheapestMonthlyAvailable===null));
 assert.ok(result.variants.every(x=>x.monthsUnknown));
});
test('late work return yields zero transition loss with no fabricated savings',()=>{
 const result=compare({...base,workReturnWeeks:24,backupHours:0,hourlyBackupCost:0});
 assert.ok(result.variants.every(x=>x.extraCost===0&&x.differenceCost===0));
 assert.ok(result.variants.every(x=>x.uncoveredTransitionHours===0));
});
test('near delay upper bound transparently skips infeasible cases, never silently clamps',()=>{
 const result=compare({...base,delayWeeks:11});
 assert.equal(result.variants.length,1);
 assert.equal(result.skipped.length,2);
 assert.equal(result.variants[0].actualDelayWeeks,11);
 assert.equal(result.hasAllVariants,false);
 assert.match(result.warnings.join(' '),/ausgelassen/);
});
test('without planned childcare no cashflow scenario is invented',()=>{
 const result=compare({...base,careStartLm:0});
 assert.equal(result.active,false);
 assert.deepEqual(result.variants,[]);
});
test('outside-horizon amounts remain explicitly separate from modeled monthly minima',()=>{
 const result=compare({...base,careStartLm:36,delayWeeks:2,settlingWeeks:12});
 assert.ok(result.variants.some(x=>x.outsideHorizonDays>0));
 assert.equal(result.beyondModel,true);
 assert.ok(result.variants.every(x=>x.outsideHorizonMoney!==null));
});
test('invalid constraints never allow incoherent or oversized result sets',()=>{
 for(const delayWeeks of [-1,13,1.5,'2',Infinity]){
  assert.throws(()=>compare({...base,delayWeeks}),RangeError);
 }
 assert.throws(()=>compare({...base,rows:base.rows.slice(0,30)}),TypeError);
 assert.throws(()=>compare({...base,firstWeekCareHours:38}),RangeError);
});
test('sensitivity never changes stored plan, entitlements or official bank receipts',()=>{
 const result=compare(base);
 assert.equal(result.modifiedElterngeld,false);
 for(const v of result.variants){
  assert.equal(v.workOrBenefitPlanChanged,false);
  assert.equal(v.bankReceiptsPredicted,false);
 }
});

test('80 bounded cohort scenarios preserve baseline, date ordering and cent-accurate differences',()=>{
 const births=['2026-01-31','2026-02-28','2028-02-29','2026-05-28','2026-09-30'];
 for(const birthDate of births)for(const careStartLm of [1,18,35,36])
  for(const delayWeeks of [0,2,8,11]){
   const params={...base,birthDate,careStartLm,delayWeeks,
    rows:base.rows,settlingWeeks:6};
   const before=structuredClone(params);
   const result=compare(params);
   assert.deepEqual(params,before);
   assert.equal(result.variants.length+result.skipped.length,3);
   assert.equal(result.variants[0].actualDelayWeeks,delayWeeks);
   assert.equal(result.variants[0].differenceCost,0);
   assert.ok(result.variants.every(v=>v.actualDelayWeeks>=delayWeeks&&v.actualDelayWeeks<=12));
   assert.ok(result.variants.every(v=>v.workReturnDate===result.variants[0].workReturnDate));
   assert.ok(result.variants.every(v=>v.recurringWeeklyGapHours===result.variants[0].recurringWeeklyGapHours));
   for(const variant of result.variants){
    assert.equal(Math.round(variant.differenceCost*100),
     Math.round((variant.extraCost-result.variants[0].extraCost)*100));
    assert.ok(variant.outsideHorizonDays>=0);
   }
  }
});
