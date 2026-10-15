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
 assert.equal(p.timeline[1].maternityDays,25);
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
