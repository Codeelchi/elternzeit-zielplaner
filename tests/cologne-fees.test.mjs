import test from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const {estimateCologneFee:estimate,TABLE}=createRequire(import.meta.url)('../src/cologne-fees.cjs');
function input(overrides={}){return {lifeMonth:19,annualIncome:95000,hours:35,meals:90,careDate:'2026-10-01',...overrides};}
test('published Cologne 2025 under-two, age-two and age-three fee examples match city tables',()=>{
 assert.equal(estimate(input()).ratePerMonth,478.86);
 assert.equal(estimate(input()).illustrativeTotal,568.86);
 assert.equal(estimate(input({lifeMonth:25})).ratePerMonth,368.35);
 assert.equal(estimate(input({lifeMonth:37})).ratePerMonth,197.95);
 assert.equal(estimate(input({lifeMonth:37,hours:45,annualIncome:170000,meals:0})).illustrativeTotal,479.91);
 assert.equal(estimate(input({annualIncome:24542,meals:0})).ratePerMonth,0);
 assert.equal(estimate(input({annualIncome:24542.01,meals:0})).ratePerMonth,133.36);
});
test('all three age groups and hour bands have ten finite nonnegative rates',()=>{
 for(const age of Object.values(TABLE))for(const fees of Object.values(age)) {
  assert.equal(fees.length,10);assert.ok(fees.every(v=>Number.isFinite(v)&&v>=0));
 }
});
test('future 2027/2028 is never silently presented as a certified municipal contribution',()=>{
 const x=estimate(input({careDate:'2027-09-01'}));
 assert.equal(x.snapshotStatus,'FUTURE_NOT_VERIFIED');
 assert.equal(x.usedInFamilyBudget,false);
 assert.equal(x.includesSiblingDiscount,false);
 assert.equal(x.includesContributionWaiver,false);
});
test('reference 2025 snapshot does not falsely apply to earlier care dates',()=>{
 assert.equal(estimate(input({careDate:'2025-06-01'})).snapshotStatus,'BEFORE_REFERENCE_EFFECTIVE');
});
test('invalid income, hours, dates and life months rejected',()=>{
 for(const annualIncome of [-1,Infinity,NaN,'95000'])assert.throws(()=>estimate(input({annualIncome})),RangeError);
 for(const hours of [20,30,50,'35'])assert.throws(()=>estimate(input({hours})),RangeError);
 for(const lifeMonth of [0,97,1.1])assert.throws(()=>estimate(input({lifeMonth})),RangeError);
 for(const careDate of ['2027-02-29','2025-13-01',''])assert.throws(()=>estimate(input({careDate})),RangeError);
});
