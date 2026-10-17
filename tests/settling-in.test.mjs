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

test('zero transition weeks never charge the regular week, even if regular childcare is too short',()=>{
 const r=p({...input,delayWeeks:0,settlingWeeks:0,targetCareHours:25,
  firstWeekCareHours:0,backupHours:0});
 assert.equal(r.transitionWeeks,0);
 assert.equal(r.combinedMoneyImpact,0);
 assert.equal(r.uncoveredHours,0);
 assert.equal(r.totalHypotheticalIncomeLoss,0);
 assert.equal(r.regularWeeklyUncoveredHours,3);
 assert.equal(r.weekly.length,1);
 assert.equal(r.weekly[0].previewOnly,true);
 assert.equal(r.weekly[0].uncoveredWorkHours,3);
 assert.match(r.warnings.join(' '),/wiederkehrende Lücke/);
});

test('work return after settling period has no artificial earnings loss before actual work starts',()=>{
 const r=p({...input,delayWeeks:2,settlingWeeks:4,workReturnWeeks:7,backupHours:0});
 assert.equal(r.transitionWeeks,6);
 assert.equal(r.uncoveredHours,0);
 assert.equal(r.combinedMoneyImpact,0);
 assert.equal(r.weekly.length,7);
 assert.deepEqual(r.weekly.map(w=>w.weeklyPlannedWorkHours),[0,0,0,0,0,0,28]);
 assert.equal(r.weekly.at(-1).week,8);
 assert.ok(r.weekly.slice(6).every(w=>w.previewOnly));
});

test('invalid return offset is refused as nonlegal assumption input',()=>{
 for(const workReturnWeeks of [-1,25,2.5,Infinity,'3'])
  assert.throws(()=>p({...input,workReturnWeeks}),RangeError);
});

const {transitionLifeMonthBridge:bridge}=createRequire(import.meta.url)('../src/settling-in.cjs');
const rows=Array.from({length:36},(_,i)=>({lm:i+1,cashAfter:100}));

test('week crossing life month distributes CENTS exactly, without altering the baseline',()=>{
 const r=p({...input,delayWeeks:5,settlingWeeks:0,backupHours:0,
  plannedWorkHours:28,weeklyNetAtRisk:0.07,targetCareHours:35});
 const baseline=structuredClone(rows);
 const report=bridge({birthDate:input.birthDate,scenario:r,rows,expensesKnown:true});
 assert.deepEqual(rows,baseline);
 assert.equal(r.totalHypotheticalIncomeLoss,0.35);
 assert.deepEqual(report.months.map(m=>m.lm),[19,20]);
 assert.deepEqual(report.months.map(m=>m.hypotheticalNetLoss),[0.30,0.05]);
 assert.deepEqual(report.months.map(m=>m.alternativeAfterCosts),[99.70,99.95]);
 assert.equal(report.knownImpactInHorizon,-0.35);
 assert.equal(report.outsideHorizonDays,0);
 assert.equal(report.changedPlan,false);
 assert.equal(report.bankReceiptsPredicted,false);
});

test('unknown income yields unknown month impact, not a fictional zero balance',()=>{
 const r=p({...input,delayWeeks:1,settlingWeeks:0,backupHours:0,weeklyNetAtRisk:null});
 const report=bridge({birthDate:input.birthDate,scenario:r,rows,expensesKnown:false});
 assert.equal(report.knownImpactInHorizon,null);
 assert.equal(report.months[0].hypotheticalNetLoss,null);
 assert.equal(report.months[0].totalHypotheticalExtra,null);
 assert.equal(report.months[0].baselineAfterCosts,null);
 assert.equal(report.months[0].alternativeAfterCosts,null);
});

test('an out-of-horizon transition never silently drops outside-month cost',()=>{
 const r=p({...input,careStartLm:36,delayWeeks:6,settlingWeeks:0,backupHours:0,
  plannedWorkHours:28,weeklyNetAtRisk:70});
 const report=bridge({birthDate:input.birthDate,scenario:r,rows,expensesKnown:true});
 assert.ok(report.outsideHorizonDays>0);
 assert.ok(report.outsideHorizonMoney>0);
 assert.equal(
  Math.round((report.outsideHorizonMoney-report.knownImpactInHorizon)*100),
  Math.round(-r.combinedMoneyImpact*100)
 );
 assert.match(report.warnings.join(' '),/jenseits LM 36/);
});

test('no transition has no life-month overlay and no invented financial shortage',()=>{
 const r=p({...input,delayWeeks:0,settlingWeeks:0,targetCareHours:25,firstWeekCareHours:0,backupHours:0});
 const report=bridge({birthDate:input.birthDate,scenario:r,rows,expensesKnown:true});
 assert.deepEqual(report.months,[]);
 assert.equal(report.knownImpactInHorizon,0);
 assert.equal(report.outsideHorizonMoney,0);
 assert.equal(r.regularWeeklyUncoveredHours,3);
});

test('life-month overlay refuses mismatched parents, invalid rows, malformed assumed weeks',()=>{
 const scenario=p(input);
 assert.throws(()=>bridge({birthDate:'2026-05-29',scenario,rows}),TypeError);
 assert.throws(()=>bridge({birthDate:input.birthDate,scenario,rows:[{lm:2,cashAfter:100}]}),RangeError);
 assert.throws(()=>bridge({birthDate:input.birthDate,scenario,rows,expensesKnown:'yes'}),TypeError);
 const injected=structuredClone(scenario);injected.weekly[0].weekEnd='2027-11-27';
 assert.throws(()=>bridge({birthDate:input.birthDate,scenario:injected,rows}),RangeError);
});

test('every legally accepted hourly price remains representable in month bridge',()=>{
 const scenario=p({...input,delayWeeks:1,settlingWeeks:0,backupHours:40,
  plannedWorkHours:40,targetCareHours:35,hourlyBackupCost:100000,weeklyNetAtRisk:0});
 assert.equal(scenario.totalExtraCost,4000000);
 const out=bridge({birthDate:input.birthDate,scenario,rows,expensesKnown:true});
 assert.equal(out.months[0].totalHypotheticalExtra,4000000);
 assert.equal(out.knownImpactInHorizon,-4000000);
});
test('a work restart outside modeled months is explicitly flagged without extrapolating income',()=>{
 const r=p({...input,careStartLm:36,delayWeeks:0,settlingWeeks:0,workReturnWeeks:24});
 assert.equal(r.returnBeyondModel,true);
 assert.match(r.warnings.join(' '),/Arbeitsbeginn liegt außerhalb/);
 assert.equal(r.combinedMoneyImpact,0);
});

test('long gap between childcare and work return stays a concise weekly preview',()=>{
 const r=p({...input,delayWeeks:0,settlingWeeks:0,workReturnWeeks:24});
 assert.equal(r.weekly.length,1);
 assert.equal(r.weekly[0].week,25);
 assert.equal(r.weekly[0].weekStart,r.workReturnDate);
 assert.ok(r.weekly[0].previewOnly);
 assert.equal(r.combinedMoneyImpact,0);
 assert.match(r.warnings.join(' '),/Vorschau springt/);
});

test('daily allocation conserves cents and days across sampled birth cohorts, including Feb 29',()=>{
 const births=['2026-01-31','2026-02-28','2028-02-29','2026-05-28','2026-09-30'];
 const cases=[{delayWeeks:0,settlingWeeks:0},{delayWeeks:1,settlingWeeks:0},
  {delayWeeks:2,settlingWeeks:4},{delayWeeks:12,settlingWeeks:12}];
 for(const birthDate of births)for(const careStartLm of [1,18,35,36])for(const scenario of cases){
  const result=p({birthDate,careStartLm,...scenario,plannedWorkHours:28,
   targetCareHours:35,firstWeekCareHours:5,backupHours:6.25,
   hourlyBackupCost:15.25,weeklyNetAtRisk:600.17});
  const report=bridge({birthDate,scenario:result,rows,expensesKnown:true});
  const insideDays=report.months.reduce((sum,m)=>sum+m.transitionDays,0);
  assert.equal(insideDays+report.outsideHorizonDays,result.transitionWeeks*7,
   birthDate+' LM '+careStartLm);
  const insideCents=report.months.reduce((sum,m)=>
   sum+Math.round(m.totalHypotheticalExtra*100),0);
  const outsideCents=Math.round(report.outsideHorizonMoney*100);
  const expected=Math.max(0,Math.round(-result.combinedMoneyImpact*100));
  assert.equal(insideCents+outsideCents,expected,
   birthDate+' LM '+careStartLm+' '+scenario.delayWeeks+' + '+scenario.settlingWeeks);
 }
});
