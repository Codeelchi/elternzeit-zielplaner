import test from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const {planJointCare:plan}=require('../src/parent-coordination.cjs');
const parentA={weeklyWorkHours:20,workStart:'08:00',returnWeek:0,weeklyNetAtRisk:400};
const parentB={weeklyWorkHours:20,workStart:'08:00',returnWeek:0,weeklyNetAtRisk:600};
const base={birthDate:'2026-05-28',careStartLm:19,delayWeeks:1,settlingWeeks:0,
 targetCareHours:0,firstWeekCareHours:0,firstWeekEscortHours:0,
 parentA,parentB,careDayStart:'08:00',escortParent:'A',gapParent:'A',
 backupHours:0,backupHourlyCost:0,modelMonths:36};

test('simultaneous hours with no Kita require exactly one hypothetical caregiver work release',()=>{
 const r=plan(base),week=r.weeks[0];
 assert.equal(r.active,true);assert.equal(r.transitionWeeks,1);
 assert.equal(week.simultaneousWorkWithoutKitaHours,20);
 assert.equal(week.remainingCoverageConflictHours,20);
 assert.equal(week.assumedWorkReleaseA,20);
 assert.equal(week.assumedWorkReleaseB,0);
 assert.equal(week.hypotheticalNetLossA,400);
 assert.equal(week.hypotheticalNetLossB,0);
 assert.equal(r.totalHypotheticalCost,400);
 assert.equal(r.weeks[1].previewOnly,true);
 assert.equal(r.changedPlan,false);
});
test('staggered shifts avoid false childcare conflict even when total work hours add to 40',()=>{
 const r=plan({...base,parentB:{...parentB,workStart:'12:00'}});
 assert.equal(r.weeks[0].parentAWeeklyWorkHours,20);
 assert.equal(r.weeks[0].parentBWeeklyWorkHours,20);
 assert.equal(r.weeks[0].remainingCoverageConflictHours,0);
 assert.equal(r.totalHypotheticalCost,0);
});
test('one parent not yet back at work is assumed available, never credited fictitious wages',()=>{
 const r=plan({...base,parentB:{...parentB,returnWeek:3}});
 assert.equal(r.weeks[0].remainingCoverageConflictHours,0);
 assert.equal(r.weeks[0].assumedWorkReleaseA,0);
 assert.equal(r.weeks[0].assumedWorkReleaseB,0);
 assert.equal(r.weeks.find(w=>w.week===4)?.previewOnly,true);
 assert.equal(r.totalHypotheticalCost,0);
});
test('accompaniment in daycare can conflict with chosen parent work despite nominal Kita hours',()=>{
 const input={...base,delayWeeks:0,settlingWeeks:1,targetCareHours:20,firstWeekCareHours:5,
  firstWeekEscortHours:5,parentB:{...parentB,returnWeek:4}};
 const withA=plan({...input,escortParent:'A'});
 const withB=plan({...input,escortParent:'B'});
 assert.equal(withA.weeks[0].accompanimentHoursA,5);
 assert.equal(withA.weeks[0].assumedWorkReleaseA,5);
 assert.equal(withA.weeks[0].hypotheticalNetLossA,100);
 assert.equal(withB.weeks[0].accompanimentHoursB,5);
 assert.equal(withB.weeks[0].assumedWorkReleaseB,0);
 assert.equal(withA.totalHypotheticalCost,100);
 assert.equal(withB.totalHypotheticalCost,0);
});
test('alternating weekday accompaniment splits escort time 3 to 2 without overlapping duplicate charges',()=>{
 const r=plan({...base,delayWeeks:0,settlingWeeks:1,targetCareHours:20,firstWeekCareHours:5,
  firstWeekEscortHours:5,escortParent:'alternating',backupHours:15,backupHourlyCost:0});
 assert.equal(r.weeks[0].accompanimentHoursA,3);
 assert.equal(r.weeks[0].accompanimentHoursB,2);
 assert.equal(r.weeks[0].assumedWorkReleaseA,3);
 assert.equal(r.weeks[0].assumedWorkReleaseB,2);
 assert.equal(r.weeks[0].hypotheticalNetLossA,60);
 assert.equal(r.weeks[0].hypotheticalNetLossB,60);
 assert.equal(r.weeks[0].flexibleBackupUsedHours,15);
 assert.equal(r.totalHypotheticalCost,120);
 assert.deepEqual(r.weeks[0].days.map(d=>d.escortParent),['A','B','A','B','A']);
});
test('free-floating backup covers capped quarter-hours first, the rest are assigned to exactly one parent',()=>{
 const r=plan({...base,backupHours:8,backupHourlyCost:10});
 assert.equal(r.transitionFlexibleBackupHours,8);
 assert.equal(r.transitionCoverageConflictHours,12);
 assert.equal(r.transitionReleaseA,12);
 assert.equal(r.transitionReleaseB,0);
 assert.equal(r.weeks[0].hypotheticalBackupCost,80);
 assert.equal(r.weeks[0].hypotheticalNetLossA,240);
 assert.equal(r.totalHypotheticalCost,320);
});
test('flexible backup missing hourly price is unknown when used, not treated as zero',()=>{
 const r=plan({...base,backupHours:8,backupHourlyCost:null});
 assert.equal(r.totalHypotheticalCost,null);
 assert.equal(r.moneyKnown,false);
 assert.equal(r.weeks[0].hypotheticalBackupCost,null);
});
test('missing net at risk is unknown only if the assigned parent must leave work',()=>{
 const r=plan({...base,parentA:{...parentA,weeklyNetAtRisk:null}});
 assert.equal(r.totalHypotheticalCost,null);
 assert.equal(r.weeks[0].hypotheticalNetLossA,null);
 assert.equal(r.weeks[0].hypotheticalNetLossB,0);
 const r2=plan({...base,parentA:{...parentA,weeklyNetAtRisk:null},
  parentB:{...parentB,returnWeek:24}});
 assert.equal(r2.totalHypotheticalCost,0);
});
test('regular preview never inflates one-off transition financial total',()=>{
 const r=plan({...base,delayWeeks:0,settlingWeeks:0});
 assert.equal(r.transitionWeeks,0);
 assert.equal(r.totalHypotheticalCost,0);
 assert.ok(r.weeks.every(w=>w.previewOnly));
 assert.equal(r.weeks[0].remainingCoverageConflictHours,20);
 assert.equal(r.transitionReleaseA,0);
});
test('parent A/B sequential work returns appear as sparse previews, not 24 empty rows',()=>{
 const r=plan({...base,delayWeeks:0,settlingWeeks:0,
  parentA:{...parentA,returnWeek:4},parentB:{...parentB,returnWeek:24}});
 assert.deepEqual(r.weeks.map(w=>w.week),[5,25]);
 assert.equal(r.weeks[0].remainingCoverageConflictHours,0);
 assert.equal(r.weeks[1].remainingCoverageConflictHours,20);
 assert.equal(r.totalHypotheticalCost,0);
});
test('incorrect time slots, hours, parent, and impossible midnight ranges are rejected',()=>{
 for(const start of ['8:00','08:10','24:00','21:61','no']){
  assert.throws(()=>plan({...base,parentA:{...parentA,workStart:start}}),RangeError);
 }
 assert.throws(()=>plan({...base,parentA:{...parentA,weeklyWorkHours:20.1}}),RangeError);
 assert.throws(()=>plan({...base,parentA:{...parentA,returnWeek:25}}),RangeError);
 assert.throws(()=>plan({...base,parentA:{...parentA,workStart:'23:30'}}),RangeError);
 assert.throws(()=>plan({...base,careDayStart:'23:45',targetCareHours:35}),RangeError);
 assert.throws(()=>plan({...base,escortParent:'both'}),RangeError);
 assert.throws(()=>plan({...base,gapParent:'shared'}),RangeError);
 assert.throws(()=>plan({...base,backupHourlyCost:-5}),RangeError);
 assert.throws(()=>plan({...base,parentB:null}),TypeError);
});
test('realistic model range, source links, explicit no-entitlement and lack of mutation',()=>{
 const input={...base,delayWeeks:2,settlingWeeks:4,firstWeekEscortHours:5,
  firstWeekCareHours:5,targetCareHours:35,parentA:{...parentA,weeklyWorkHours:28},
  parentB:{...parentB,weeklyWorkHours:30},careDayStart:'08:00'};
 const before=structuredClone(input);
 const r=plan(input);
 assert.deepEqual(input,before);
 assert.equal(r.modifiedElterngeld,false);
 assert.equal(r.changedRecordedBankReceipts,false);
 assert.equal(r.changedPlan,false);
 assert.ok(r.warnings.join(' ').includes('Partnerbonus'));
 assert.ok(r.officialSources.every(x=>x.startsWith('https://familienportal.de/')));
 assert.ok(r.weeks[0].days.length===5);
});
test('80 birth and transition cohorts maintain quarter-hour invariants',()=>{
 const births=['2026-01-31','2026-02-28','2028-02-29','2026-05-28','2026-09-30'];
 for(const birthDate of births)for(const careStartLm of [1,18,35,36])
 for(const delayWeeks of [0,2,8,12]){
  const r=plan({...base,birthDate,careStartLm,delayWeeks,settlingWeeks:4,
   firstWeekCareHours:5,targetCareHours:35,firstWeekEscortHours:4.25,
   parentA:{...parentA,weeklyWorkHours:28.25},
   parentB:{...parentB,weeklyWorkHours:29.75},
   backupHours:6.25,backupHourlyCost:13.25});
  assert.ok(r.weeks.length<=27);
  assert.equal(r.transitionWeeks,delayWeeks+4);
  assert.ok(Number.isInteger(r.transitionReleaseA*4));
  assert.ok(Number.isInteger(r.transitionReleaseB*4));
  assert.ok(Number.isInteger(r.transitionCoverageConflictHours*4));
  assert.ok(r.weeks.every(w=>Number.isInteger(w.remainingCoverageConflictHours*4)));
  assert.ok(r.weeks.every(w=>w.days.reduce((sum,d)=>sum+d.assignedUncoveredHours,0)===w.remainingCoverageConflictHours));
 }
});

test('escort choices preserve all non-escort assumptions and never label one legal optimum',()=>{
 const {compareEscortChoices}=require('../src/parent-coordination.cjs');
 const data={...base,delayWeeks:0,settlingWeeks:1,targetCareHours:20,firstWeekCareHours:5,
  firstWeekEscortHours:5,backupHours:15,backupHourlyCost:0};
 const before=structuredClone(data),result=compareEscortChoices(data);
 assert.deepEqual(data,before);
 assert.equal(result.scenarios.length,3);
 assert.deepEqual(result.scenarios.map(s=>s.mode),['A','B','alternating']);
 assert.deepEqual(result.scenarios.map(s=>s.hypotheticalCost),[100,150,120]);
 assert.equal(result.optimizationClaim,false);
 assert.ok(result.scenarios.every(s=>s.changedPlan===false));
});

test('hours over 32 and escort estimates exceeding available Kita hours remain visible cautions',()=>{
 const r=plan({...base,delayWeeks:0,settlingWeeks:1,targetCareHours:35,firstWeekCareHours:5,
  firstWeekEscortHours:10,parentA:{...parentA,weeklyWorkHours:36}});
 assert.match(r.warnings.join(' '),/maximal 32 Wochenstunden/);
 assert.match(r.warnings.join(' '),/Begleitungszeit ist größer/);
 assert.equal(r.transitionEscortHoursA,5);
});
