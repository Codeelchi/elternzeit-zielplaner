import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import { JSDOM, VirtualConsole } from 'jsdom';

const require=createRequire(import.meta.url);
const t=require('../src/time-axes.cjs');
const plan=()=>Array.from({length:36},(_,i)=>({f:i>=2&&i<14?'B':'W',m:i<2?'MS':'W'}));

test('life months: first month, 2027 May 28 and leap-year Feb',()=>{
 const m=t.lifeMonths('2027-05-28');
 assert.equal(m.length,36);
 assert.deepEqual([m[0].startDate,m[0].endDate,m[1].startDate,m[1].endDate],['2027-05-28','2027-06-27','2027-06-28','2027-07-27']);
 assert.equal(t.lifeMonths('2024-02-29')[0].startDate,'2024-02-29');
 assert.equal(t.lifeMonths('2024-02-29')[0].endDate,'2024-03-28');
});

test('invalid calendar dates are rejected, including Feb 30',()=>{
 for(const date of ['2027-02-30','2027-02-29','2027-00-01','2027-13-01','nonsense']){
  assert.throws(()=>t.lifeMonths(date),RangeError,date);
 }
});

test('maternity and employer leave remain independent from Elterngeld',()=>{
 const schedule=plan();
 const p=t.buildTimeAxes({birthDate:'2027-05-28',schedule,leaveOverrides:{father:[{startDate:'2027-08-15',endDate:'2027-10-14'}],mother:[]}});
 assert.equal(p.timeline[0].maternityDays,31);
 assert.equal(p.timeline[1].maternityDays,26);
 assert.equal(p.timeline[2].parents.father.legalLeaveDays,13);
 assert.equal(p.timeline[2].parents.father.benefit.type,'basis');
 assert.equal(p.timeline[1].parents.mother.legalLeaveDays,0);
 assert.equal(p.deadlines.find(x=>x.parent==='father').sevenWeekNoticeBy,'2027-06-27');
});

test('unpaid leave and part-time without Elterngeld are independent axes',()=>{
 const schedule=plan();schedule[6].f='U';schedule[7].f='Q';schedule[7].hf=24;
 const p=t.buildTimeAxes({birthDate:'2027-05-28',schedule});
 assert.equal(p.timeline[6].parents.father.legalLeaveDays,p.timeline[6].days);
 assert.equal(p.timeline[6].parents.father.benefit.type,'none');
 assert.equal(p.timeline[7].parents.father.employment.weeklyHours,24);
 assert.equal(p.timeline[7].parents.father.benefit.type,'none');
});

test('early birth requires individual maternity review, not benefit certification',()=>{
 const p=t.buildTimeAxes({birthDate:'2027-05-20',expectedDueDate:'2027-05-28',schedule:plan()});
 assert.equal(p.maternity.earlyDays,8);
 assert.equal(p.maternity.postnatalDaysWithEarlyExtension,64);
 assert.ok(p.notices.some(n=>n.code==='NONSTANDARD_MATERNITY'));
});

test('overlapping manually entered leave periods count calendar-day union',()=>{
 const p=t.buildTimeAxes({birthDate:'2027-05-28',schedule:plan(),leaveOverrides:{father:[{startDate:'2027-07-28',endDate:'2027-08-10'},{startDate:'2027-08-05',endDate:'2027-08-27'}],mother:[]}});
 assert.equal(p.timeline[2].parents.father.legalLeaveDays,31);
 assert.ok(p.notices.some(n=>n.code==='LEAVE_OVERLAP'));
});

test('out-of-horizon leave intervals, half-filled UI inputs cannot silently pass',()=>{
 assert.throws(()=>t.buildTimeAxes({birthDate:'2027-05-28',schedule:plan(),leaveOverrides:{father:[{startDate:'2027-03-01',endDate:'2027-07-01'}]}}),RangeError);
 assert.throws(()=>t.buildTimeAxes({birthDate:'2027-05-28',schedule:plan(),leaveOverrides:{father:[{startDate:'2027-10-20'}]}}),RangeError);
});

test('offline module and visual new tab initialize without console errors',()=>{
 const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');
 const errors=[],console=new VirtualConsole();console.on('jsdomError',e=>errors.push(e.message));
 const dom=new JSDOM(html,{url:'https://example.local/',runScripts:'dangerously',pretendToBeVisual:true,virtualConsole:console,beforeParse:w=>{w.scrollTo=()=>{};w.alert=()=>{};w.URL.createObjectURL=()=>'';w.URL.revokeObjectURL=()=>{}}});
 const panel=dom.window.document.getElementById('slide-axes');
 assert.ok(panel);
 const tbody=dom.window.document.querySelector('#axesTable tbody');
 assert.equal(tbody.children.length,36);
 assert.ok(dom.window.__elternzeitV3.timeAxes().timeline.length===36);
 assert.deepEqual(errors,[]);
 dom.window.close();
});


test('§187/188 month-end boundaries expire at month end, without gaps',()=>{
 for(const [birth,start] of [['2027-01-29','2027-03-01'],['2027-01-30','2027-03-01'],['2027-01-31','2027-03-01'],['2028-01-31','2028-03-01'],['2027-03-31','2027-05-01']]){
  const m=t.lifeMonths(birth);
  assert.equal(m[1].startDate,start,birth);
  for(let i=1;i<m.length;i++)assert.equal(t.addDays(m[i-1].endDate,1),m[i].startDate);
 }
 assert.equal(t.lifeMonths('2028-01-29')[1].startDate,'2028-02-29');
 assert.equal(t.lifeMonths('2024-02-29')[11].endDate,'2025-02-28');
});

test('postnatal eight weeks exclude the event day in the duration, include it in protection',()=>{
 const m=t.maternityTimeline({birthDate:'2027-05-20'});
 assert.equal(m.postnatal.endDate,'2027-07-15');
 assert.equal(m.postnatal.exclusiveEnd,'2027-07-16');
 assert.equal(m.protectedCalendarDaysIncludingBirth,57);
 assert.equal(t.dayDiff(m.birthDate,m.postnatal.endDate),56);
 // Familienportal example says July14 / 5 days; the statutory difference
 // is recorded in docs, not hidden by rewriting its expected example.
 const p=t.buildTimeAxes({birthDate:'2027-05-20',schedule:plan()});
 assert.equal(p.timeline[1].maternityDays,26);
 assert.equal(p.timeline[1].days-p.timeline[1].maternityDays,4);
});

test('employment, benefit, employer leave and transfers can be edited independently',()=>{
 const p=t.buildTimeAxes({birthDate:'2027-05-28',schedule:plan(),leaveOverrides:{father:[],mother:[]},
  employmentOverrides:{father:[{lm:3,weeklyHours:24}]},benefitOverrides:{father:[{lm:3,type:'plus'}]},
  financialRows:[{fg:700}],bankLedger:[{id:'payment',paymentDate:'2027-09-01',amount:700,category:'elterngeld',parent:'father'},{id:'cost',paymentDate:'2027-09-12',amount:-300,category:'childcare'}]});
 assert.equal(p.timeline[2].parents.father.legalLeaveDays,0);
 assert.equal(p.timeline[2].parents.father.leaveSource,'user');
 assert.equal(p.timeline[2].parents.father.employment.weeklyHours,24);
 assert.equal(p.timeline[2].parents.father.benefit.type,'plus');
 assert.equal(p.timeline[3].parents.father.benefit.type,'basis');
 assert.equal(p.timeline[0].financial.actualPaymentDate,null);
 assert.deepEqual(p.calendarCashflow,[{calendarMonth:'2027-09',netRecordedTransfers:400}]);
 assert.equal(p.recordedTransfers.length,2);
});

test('malformed independent axes and actual ledger are rejected',()=>{
 for(const employmentOverrides of [{father:[{lm:1,weeklyHours:-1}]},{father:[{lm:1,weeklyHours:Infinity}]},{father:[{lm:1,weeklyHours:24},{lm:1,weeklyHours:24}]}]){
  assert.throws(()=>t.buildTimeAxes({birthDate:'2027-05-28',schedule:plan(),employmentOverrides}),RangeError);
 }
 assert.throws(()=>t.buildTimeAxes({birthDate:'2027-05-28',schedule:plan(),benefitOverrides:{mother:[{lm:1,type:'fictional'}]}}),RangeError);
 for(const entry of [{paymentDate:'2027-02-30',amount:700,category:'elterngeld'},{paymentDate:'2027-09-01',amount:NaN,category:'elterngeld'},{paymentDate:'2027-09-01',amount:700,category:'fictional'}])assert.throws(()=>t.validateBankLedger([entry]),RangeError);
 assert.deepEqual(t.buildTimeAxes({birthDate:'2027-05-28',schedule:plan(),financialRows:[{fg:700}]}).recordedTransfers,[]);
});
