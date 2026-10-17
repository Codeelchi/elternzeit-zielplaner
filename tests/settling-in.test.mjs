import test from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const {compareSettlingIn:p}=createRequire(import.meta.url)('../src/settling-in.cjs');
const input={birthDate:'2026-05-28',careStartLm:19,delayWeeks:2,settlingWeeks:4,
 targetCareHours:35,firstWeekCareHours:5,plannedWorkHours:28,backupHours:8,
 hourlyBackupCost:12,weeklyNetAtRisk:560,modelMonths:36};
test('2 weeks wait + 4 weeks settling are day-precise, with separate regular-care week',()=>{
 const r=p(input);
 assert.equal(r.startDate,'2027-11-28');
 assert.equal(r.actualCareStartDate,'2027-12-12');
 assert.equal(r.regularCareFrom,'2028-01-09');
 assert.equal(r.weekly.length,7);
 assert.deepEqual(r.weekly.map(x=>x.phase),['delay','delay','settling','settling','settling','settling','regular']);
 assert.equal(r.weekly[0].weeklyKitaHours,0);
 assert.equal(r.weekly[2].weeklyKitaHours,5);
 assert.equal(r.weekly[5].weeklyKitaHours,35);
 assert.equal(r.weekly[6].uncoveredWorkHours,0);
 assert.equal(r.totalExtraCost,420);
 assert.equal(r.changedElterngeld,false);assert.equal(r.changedEmploymentPlan,false);
});
test('explicit financial input is required before reporting illustrative total, never defaults unknown to zero',()=>{
 const r=p({...input,weeklyNetAtRisk:null,hourlyBackupCost:null});
 assert.equal(r.hasCompleteMoneyInputs,false);assert.equal(r.combinedMoneyImpact,null);
 assert.equal(r.weekly[0].hypotheticalNetLoss,null);
 assert.equal(r.weekly[0].hypotheticalBackupCost,null);
});
test('backup and income-risk assumptions cannot change input objects or main plan',()=>{
 const before=JSON.stringify(input),r=p(input);
 assert.equal(JSON.stringify(input),before);
 assert.equal(r.forecastBankReceipts,false);
 assert.ok(r.combinedMoneyImpact<0);
 assert.ok(r.totalHypotheticalIncomeLoss>0);
});
test('zero work hours means no lost income, and explicit zero net risk is valid',()=>{
 const r=p({...input,plannedWorkHours:0,backupHours:0,weeklyNetAtRisk:0,hourlyBackupCost:0});
 assert.equal(r.uncoveredHours,0);assert.equal(r.combinedMoneyImpact,0);
});
test('no childcare start never fabricates an entry date or Euro amount',()=>{
 const r=p({...input,careStartLm:0});
 assert.equal(r.active,false);assert.equal(r.combinedMoneyImpact,null);
});
test('leap boundary, no ramp, and delay-only remain deterministic',()=>{
 const r=p({birthDate:'2026-07-31',careStartLm:19,delayWeeks:1,settlingWeeks:0,
 targetCareHours:25,firstWeekCareHours:0,plannedWorkHours:20,backupHours:0,weeklyNetAtRisk:500});
 assert.equal(r.weekly.length,2);
 assert.equal(r.weekly[0].weeklyKitaHours,0);
 assert.equal(r.weekly[1].weeklyKitaHours,25);
 assert.equal(r.totalHypotheticalIncomeLoss,500);
});
test('negative, overprecise money or infeasible hours are rejected',()=>{
 for(const v of [-1,1.001,Infinity,'300',100000.01])assert.throws(()=>p({...input,weeklyNetAtRisk:v}),RangeError);
 for(const v of [-1,13,2.4,'4'])assert.throws(()=>p({...input,settlingWeeks:v}),RangeError);
 assert.throws(()=>p({...input,firstWeekCareHours:40,targetCareHours:25}),RangeError);
 assert.throws(()=>p({...input,plannedWorkHours:44}),RangeError);
 assert.throws(()=>p({...input,backupHours:20.1}),RangeError);
 assert.throws(()=>p({...input,birthDate:'2027-02-29'}),RangeError);
});
test('weekly money summations stay exact to cents and can show no backup when none is needed',()=>{
 const r=p({...input,delayWeeks:1,settlingWeeks:1,firstWeekCareHours:15,backupHours:0,weeklyNetAtRisk:123.45,hourlyBackupCost:null});
 assert.equal(r.totalExtraCost,0);
 assert.equal(r.hasCompleteMoneyInputs,true);
 assert.equal(r.weekly[0].hypotheticalBackupCost,0);
 assert.ok(Math.abs(r.totalHypotheticalIncomeLoss*100-Math.round(r.totalHypotheticalIncomeLoss*100))<1e-6);
});
