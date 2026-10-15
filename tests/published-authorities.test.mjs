import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {JSDOM,VirtualConsole} from 'jsdom';
import TimeAxes from '../src/time-axes.cjs';

const fixtures=JSON.parse(readFileSync(new URL('../data/amtliche-beispielrechnungen-2026-10-15.json',import.meta.url),'utf8'));
const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');

function setup() {
 const errors=[],virtualConsole=new VirtualConsole();
 virtualConsole.on('jsdomError',e=>errors.push(e.message));
 const dom=new JSDOM(html,{url:'https://example.local/',runScripts:'dangerously',pretendToBeVisual:true,virtualConsole,
   beforeParse:w=>{w.scrollTo=()=>{};w.alert=()=>{};w.URL.createObjectURL=()=>'';w.URL.revokeObjectURL=()=>{};}});
 return {dom,ui:dom.window.__elternzeitTest,app:dom.window.__elternzeitV3,errors};
}
test('published examples explicitly distinguish official illustrations from real approved notices',()=>{
 assert.match(fixtures.method,/NOT anonymised real application decisions/);
 assert.equal(fixtures.monthly_cases.length,2);
 assert.equal(fixtures.total_cases.length,8);
 assert.ok(fixtures.sources.every(x=>x.independent_of_project));
});
test('published 650-euro and 250-euro low-income monthly awards',()=>{
 const {dom,ui,errors}=setup();
 for(const f of fixtures.monthly_cases){
   const actual=ui[f.variant](f.prebirth_elterngeld_net_eur,f.postbirth_elterngeld_net_eur);
   assert.ok(Math.abs(actual-f.monthly_expected_eur)<=f.tolerance_eur,`${f.id}: ${actual} != ${f.monthly_expected_eur}`);
 }
 assert.deepEqual(errors,[]);
 dom.window.close();
});
test('eight full duration payment totals match the official published examples using real 36-month evaluation',()=>{
 const {dom,ui,app,errors}=setup();
 const st=ui.s;
 Object.assign(st,{date:'2026-05-28',zve:80000,standardCaseConfirmed:true,egNetMother:2000,netMother:2000,ptNetMother:500});
 for(const fixture of fixtures.total_cases){
  Object.assign(st,{
    egNetFather:fixture.prebirth_elterngeld_net_eur,
    netFather:fixture.prebirth_elterngeld_net_eur,
    ptNetFather:fixture.postbirth_elterngeld_net_eur,
    egPtNetFather:fixture.postbirth_elterngeld_net_eur,
    hoursFather:28,
    employmentOverrides:null,benefitOverrides:null,leaveOverrides:null
  });
  const schedule=Array.from({length:36},(_,i)=>({f:'W',m:i<2?'MS':'W'}));
  for(let i=2;i<2+fixture.months;i++)
   schedule[i].f=fixture.postbirth_elterngeld_net_eur===0?
      (fixture.variant==='basis'?'B':'P'):(fixture.variant==='basis'?'R':'T');
  const calc=app.evaluate(schedule);
  assert.equal(calc.valid,true,fixture.id+': '+JSON.stringify(calc.validation.findings));
  const amount=calc.rows.reduce((sum,row)=>sum+row.fg,0);
  assert.ok(Math.abs(amount-fixture.expected_total_eur)<=fixture.tolerance_eur,
    `${fixture.id}: ${amount} != ${fixture.expected_total_eur}`);
 }
 assert.deepEqual(errors,[]);
 dom.window.close();
});
test('two conflicting government calendar references are preserved without overwriting calculations',()=>{
 const ref=fixtures.maternity_conflict;
 assert.equal(ref.sources[0].uncovered_days,5);
 assert.equal(ref.sources[1].uncovered_days,4);
 const protectedTimeline=TimeAxes.maternityTimeline({birthDate:ref.birth_date,expectedDueDate:ref.due_date,postnatalDays:56});
 const months=TimeAxes.lifeMonths(ref.birth_date);
 const covered=TimeAxes.daysOverlapInclusive(months[1].startDate,months[1].endDate,protectedTimeline.postnatal.startDate,protectedTimeline.postnatal.endDate);
 const uncovered=months[1].days-covered;
 assert.equal(uncovered,4);
 assert.equal(protectedTimeline.postnatal.endDate,'2026-07-15');
 assert.equal(uncovered-ref.sources[0].uncovered_days,-1);
 assert.equal(ref.decision,'KEEP_VALIDATION_BLOCKED_PENDING_OFFICIAL_RESOLUTION');
});
