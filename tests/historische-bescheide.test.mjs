import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import {JSDOM,VirtualConsole} from 'jsdom';
const require=createRequire(import.meta.url);
const {inspectCase,inspectCatalogue}=require('../src/historical-evidence.cjs');
const catalogue=JSON.parse(readFileSync(new URL('../data/historische-gerichtsbescheide-2026-10-15.json',import.meta.url),'utf8'));
const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');
function app(){
 const errors=[],vc=new VirtualConsole();vc.on('jsdomError',e=>errors.push(e.message));
 const dom=new JSDOM(html,{url:'https://local.invalid/',runScripts:'dangerously',pretendToBeVisual:true,virtualConsole:vc,
 beforeParse:w=>{w.scrollTo=()=>{};w.alert=()=>{};w.URL.createObjectURL=()=>'';w.URL.revokeObjectURL=()=>{}}});
 return {dom,ui:dom.window.__elternzeitTest,errors};
}
test('four genuinely documented court cases have source, birth cohort and legal stage',()=>{
 assert.equal(catalogue.cases.length,4);
 const result=inspectCatalogue(catalogue,{targetBirthYear:2027});
 assert.equal(result.documentary_pass,true);
 assert.equal(result.complete_current_law_replays,0);
 for(const c of result.cases){assert.ok(c.documentary_checks.length);assert.equal(c.supported_replay,false);assert.ok(c.missing_inputs.length);assert.match(c.source_url,/^https:/);}
});
test('Berlin original administration vs nonfinal judicial trial preserves separately published amounts and total delta',()=>{
 const record=catalogue.cases.find(x=>x.id==='SG-BERLIN-S2EG5-24'),r=inspectCase(record);
 assert.equal(r.documentary_pass,true);
 const o=Object.fromEntries(record.observations.map(x=>[x.id,x]));
 assert.equal(o.original_basis.eur_per_month,1348.92);
 assert.equal(o.trial_basis.eur_per_month,1782.06);
 assert.equal(o.trial_plus.eur_per_month,891.03);
 assert.equal(o.trial_plus.stage,'administrative_trial_recalculation_not_final_award');
 assert.equal(r.documentary_checks.find(x=>x.id==='trial_additional_total').actual,1082.85);
 assert.equal(record.case_status,'first_instance_appealed');
 assert.equal(record.appeal_docket,'L 4 EG 1/25');
});
test('tampered published Plus amounts are detected instead of being silently accepted as a golden calculation',()=>{
 const changed=structuredClone(catalogue.cases[0]);
 changed.observations.find(x=>x.id==='original_plus').eur_per_month=700;
 assert.equal(inspectCase(changed).documentary_pass,false);
});
test('Baden-Wuerttemberg final notice stays distinct from initial decision and conflicting textual number',()=>{
 const caseBW=catalogue.cases.find(x=>x.id==='LSG-BW-L11EG1334-21');
 const r=inspectCase(caseBW);
 assert.equal(r.documentary_pass,true);
 assert.equal(caseBW.recalculation_postbirth_average_eur,1826.05);
 assert.equal(caseBW.observations.find(x=>x.id==='recalculated_later').eur_per_month,688.57);
 assert.ok(caseBW.inconsistency_note.includes('688.72'));
 assert.equal(caseBW.published_disputed_repayment_eur,1985.28);
});
test('BSG and Bavarian historic earnings cannot be re-labelled current-law complete benchmarks',()=>{
 const bsg=catalogue.cases.find(x=>x.id==='BSG-B10EG1-20R');
 assert.deepEqual(bsg.observations.map(x=>x.eur_per_month),[0,74.08,574.27]);
 const by=catalogue.cases.find(x=>x.id==='LSG-BY-L9EG36-18');
 assert.equal(by.observations.find(x=>x.id==='baseline_gross').eur_per_month,2576.17);
 assert.equal(by.observations.find(x=>x.id==='baseline_net').eur_per_month,1858.10);
 assert.equal(inspectCase(by).supported_replay,false);
});
test('variable commissions cause fail-closed validation in the live calculator',()=>{
 const {dom,ui,errors}=app();
 Object.assign(ui.s,{date:'2026-05-28',standardCaseConfirmed:true,zve:95000,incomeProfileFather:'recurring_commissions'});
 const result=ui.evaluate();
 assert.equal(result.valid,false);
 assert.equal(result.validation.status,'NICHT_UNTERSTUETZT');
 assert.ok(result.validation.findings.some(x=>x.code==='PREBIRTH_INCOME_COMPOSITION_UNSUPPORTED'&&x.ruleId==='BE-2C'));
 assert.deepEqual(errors,[]);
 dom.window.close();
});
test('future forecast is disabled for recurring commissions despite confirmed standard checkbox',()=>{
 const {dom,ui}=app();
 Object.assign(ui.s,{date:'2027-05-28',standardCaseConfirmed:true,zve:95000,incomeProfileMother:'recurring_commissions'});
 const result=ui.evaluate();
 assert.equal(result.validation.provisionalPlanningEligible,false);
 assert.equal(result.forecastPlanningReady,false);
 dom.window.close();
});
test('import preserves selected income types; unexpected types cannot enter silently',()=>{
 const {dom,ui}=app();
 const file=ui.getState();
 file.incomeProfileFather='one_off_payments';
 assert.equal(ui.sanitizeImport(file).incomeProfileFather,'one_off_payments');
 file.incomeProfileFather='unsupported-unrecognized';
 assert.throws(()=>ui.sanitizeImport(file),/Unbekannte Einkommensart/);
 dom.window.close();
});
test('a missing or contradictory income profile is not silently valid',()=>{
 const {dom,ui}=app();
 Object.assign(ui.s,{date:'2026-05-28',standardCaseConfirmed:true,zve:95000,incomeProfileFather:'unknown'});
 assert.equal(ui.evaluate().validation.status,'DATEN_UNVOLLSTAENDIG');
 ui.s.incomeProfileFather='salary_only';
 ui.s.incomeProfileMother='salary_only';
 assert.equal(ui.evaluate().validation.status,'PLAUSIBEL_STANDARD');
 dom.window.close();
});

test('visible income-composition selector preserves text type and blocks an unsupported commission scenario',()=>{
 const {dom,ui,errors}=app();
 Object.assign(ui.s,{date:'2026-05-28',standardCaseConfirmed:true,zve:95000});
 const selector=dom.window.document.getElementById('incomeProfileFather');
 selector.value='recurring_commissions';
 selector.dispatchEvent(new dom.window.Event('input',{bubbles:true}));
 assert.equal(ui.getState().incomeProfileFather,'recurring_commissions');
 assert.equal(ui.evaluate().validation.status,'NICHT_UNTERSTUETZT');
 assert.equal(selector.value,'recurring_commissions');
 assert.deepEqual(errors,[]);dom.window.close();
});
