import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import {JSDOM,VirtualConsole} from 'jsdom';
const require=createRequire(import.meta.url);
const {buildApplicationGuide,minusCalendarMonths,allowanceReferenceDay}=require('../src/application-guide.cjs');
const registry=JSON.parse(readFileSync(new URL('../data/rechtsentwicklungen-2027-2026-10-15.json',import.meta.url),'utf8'));
const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');
test('law events 2027 maintain exclusive status with official provenance',()=>{
 assert.equal(registry.events.length,5);
 const e=id=>registry.events.find(x=>x.id===id);
 assert.equal(e('nrw-kibiz-2027').status,'promulgated_future_effective');
 assert.equal(e('nrw-kibiz-2027').effective_from,'2027-08-01');
 assert.equal(e('kindergeld-tax-2027-bill').status,'bill_referred_not_in_force');
 assert.equal(e('kindergeld-tax-2027-bill').amounts.proposed_2027_eur,267);
 assert.equal(e('kindergeld-automatic-2027-rollout').status,'parliament_passed_implementation_conditional');
 assert.equal(e('elterngeld-reform-debate-2027').status,'policy_discussion_no_enacted_parameter');
});
test('KiBiz six-month notice is calculated from planned LM19 Kita entry',()=>{
 const g=buildApplicationGuide({birthDate:'2027-05-28',region:'NRW',city:'Köln',childcareStartLm:19,legalEvents:registry});
 const e=g.tasks.find(x=>x.id==='nrw-childcare-notice');
 assert.ok(e);
 assert.equal(e.careStartDate,'2028-11-28');
 assert.equal(e.dueDate,'2028-05-28');
 assert.equal(e.legal_status,'promulgated_future_effective');
 assert.ok(e.source.url.includes('recht.nrw.de'));
 assert.equal(g.elterngeldEmployeeAllowanceReferenceDay,'2026-01-01');
});
test('KiBiz notice works with February/leap months as calendar months, not 180 days',()=>{
 assert.equal(minusCalendarMonths('2028-08-31',6),'2028-02-29');
 assert.equal(minusCalendarMonths('2027-08-31',6),'2027-02-28');
 assert.equal(minusCalendarMonths('2028-11-28',6),'2028-05-28');
 assert.throws(()=>minusCalendarMonths('2027-02-29',6));
});
test('2026-era Kita start has six-month notice from the effective 2026 KiBiz, not the future version',()=>{
 const g=buildApplicationGuide({birthDate:'2026-01-01',childcareStartLm:14,region:'NRW',legalEvents:registry});
 const task=g.tasks.find(x=>x.id==='nrw-childcare-notice');
 assert.ok(task);
 assert.equal(task.careStartDate,'2027-02-01');
 assert.equal(task.dueDate,'2026-08-01');
 assert.equal(task.legal_status,'effective');
 assert.match(task.source.url,/01082026-/);
 assert.doesNotMatch(task.source.url,/01082027-/);
});
test('non-NRW or no planned childcare never creates a false NRW deadline',()=>{
 for(const opts of [{region:'BY',childcareStartLm:19},{region:'NRW',childcareStartLm:0}]){
  const g=buildApplicationGuide({birthDate:'2027-05-28',legalEvents:registry,...opts});
  assert.equal(g.tasks.some(x=>x.id==='nrw-childcare-notice'),false);
 }
});
test('automatic Kindergeld task explicitly does not promise application-free payout for first births 2027',()=>{
 const g=buildApplicationGuide({birthDate:'2027-05-28',legalEvents:registry});
 const t=g.tasks.find(x=>x.id==='kindergeld-payment-route');
 assert.ok(t);
 assert.equal(t.dueDate,null);
 assert.match(t.description,/Kein automatischer Anspruch/);
 assert.match(t.title,/prüfen/);
});
test('BEEG §2c employee allowance uses January 1 of year before birth',()=>{
 assert.equal(allowanceReferenceDay('2027-05-28'),'2026-01-01');
 assert.equal(allowanceReferenceDay('2028-01-01'),'2027-01-01');
 assert.equal(allowanceReferenceDay('2026-12-31'),'2025-01-01');
});
test('offline website exposes distinct 2027 legal statuses and NRW Kita checklist',()=>{
 const errors=[],virtualConsole=new VirtualConsole();virtualConsole.on('jsdomError',e=>errors.push(e.message));
 const dom=new JSDOM(html,{url:'https://local.invalid/',runScripts:'dangerously',pretendToBeVisual:true,virtualConsole,
 beforeParse:w=>{w.scrollTo=()=>{};w.alert=()=>{};w.URL.createObjectURL=()=>'';w.URL.revokeObjectURL=()=>{}}});
 const doc=dom.window.document;
 assert.match(doc.getElementById('legalEvents').textContent,/Gesetzentwurf – nicht geltend/);
 assert.match(doc.getElementById('legalEvents').textContent,/Verkündet/);
 assert.match(doc.getElementById('applicationChecklist').textContent,/NRW-Kita-Betreuungsbedarf/);
 assert.match(doc.getElementById('applicationChecklist').textContent,/28.05.2028/);
 assert.match(doc.getElementById('applicationChecklist').textContent,/Kindergeld-Auszahlungsweg/);
 assert.deepEqual(errors,[]);
 dom.window.close();
});
test('Elterngeld reform draft stays a secondary-source hint and never feeds calculations',()=>{
 const e=registry.events.find(x=>x.id==='elterngeld-reform-debate-2027');
 const u=e['research_update_2026-10-19'];
 assert.equal(u.verification_status,'secondary_sources_only');
 assert.match(e.calculation_effect,/never used for calculations/);
 assert.equal(u.reported_draft_content.applies_to_births_from,'2027-11-01');
 assert.ok(e.sources.every(s=>s.startsWith('https://')));
 assert.ok(e.sources.includes('https://www.bundesregierung.de/breg-de/aktuelles/regierungspressekonferenz-vom-7-juli-2026-2446104'));
 assert.match(u.status_note,/nur Sekundärberichte/);
 assert.equal(Object.hasOwn(u.reported_draft_content,'income_limit_eur'),false);
 assert.equal(u.reported_draft_content.minimum_eur,330);
 assert.equal(u.reported_draft_content.maximum_eur,1900);
});

test('November 2027 remains unsupported even with reform draft details in the event registry',()=>{
 const {validatePlan}=require('../src/rule-validator.cjs');
 const catalogue=JSON.parse(readFileSync(new URL('../data/rechtsregeln-de-nrw-2026-10-14.json',import.meta.url),'utf8'));
 const state={date:'2027-11-01',births:1,zve:95000,standardCaseConfirmed:true,hoursFather:28,hoursMother:28,
  netFather:3000,netMother:2800,egNetFather:2770,egNetMother:2500,ptNetFather:2000,ptNetMother:1900};
 const schedule=Array.from({length:36},(_,i)=>({f:i>=2&&i<14?'B':'W',m:i<2?'MS':'W'}));
 const result=validatePlan({state,schedule},catalogue);
 assert.equal(result.status,'NICHT_UNTERSTUETZT');
 assert.ok(result.findings.some(f=>f.code==='FUTURE_COHORT_UNVERIFIED'||f.code==='BIRTH_COHORT_UNSUPPORTED'));
 const e=registry.events.find(x=>x.id==='elterngeld-reform-debate-2027');
 assert.equal(e.status,'policy_discussion_no_enacted_parameter');
 assert.equal(e.calculation_effect,'no automatic model changes; draft values are never used for calculations');
});
