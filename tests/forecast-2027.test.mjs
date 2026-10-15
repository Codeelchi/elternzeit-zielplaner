import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {JSDOM,VirtualConsole} from 'jsdom';
import {validatePlan} from '../src/rule-validator.cjs';
import {rankCandidates} from '../src/goal-ranking.cjs';

const catalogue=JSON.parse(readFileSync(new URL('../data/rechtsregeln-de-nrw-2026-10-14.json',import.meta.url),'utf8'));
const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');
function setup() {
  const errors=[],virtualConsole=new VirtualConsole();
  virtualConsole.on('jsdomError',e=>errors.push(e.message));
  const dom=new JSDOM(html,{url:'https://example.local/',runScripts:'dangerously',pretendToBeVisual:true,virtualConsole,
    beforeParse:w=>{w.scrollTo=()=>{};w.alert=()=>{};w.URL.createObjectURL=()=>'';w.URL.revokeObjectURL=()=>{}}});
  return {dom,ui:dom.window.__elternzeitTest,app:dom.window.__elternzeitV3,errors};
}
test('2027 is a separate unverified forecast window, never a legal standard cohort',()=>{
 assert.equal(catalogue.applicable_standard_birth_window.through,'2026-12-31');
 assert.equal(catalogue.planning_forecast_window.from,'2027-01-01');
 assert.equal(catalogue.planning_forecast_window.through,'2027-12-31');
 assert.equal(catalogue.planning_forecast_window.status,'unverified_forecast_only');
 assert.equal(catalogue.planning_forecast_window.child_benefit_2027_status,'proposed_not_in_force');
});
test('2027: financial baseline remains an unverifiable legal estimate, but separate forecast criteria can pass',()=>{
 const {dom,ui,app}=setup();
 Object.assign(ui.s,{date:'2027-05-28',standardCaseConfirmed:true,zve:80000});
 const model=ui.modelPlan('father12');
 assert.equal(model.validation.status,'NICHT_UNTERSTUETZT');
 assert.equal(model.valid,false);
 assert.equal(model.validation.provisionalPlanningEligible,true,JSON.stringify(model.validation.findings));
 assert.equal(app.evaluate(ui.s.schedule).forecastPlanningReady,true);
 dom.window.close();
});
test('missing income proof and unsupported self-employment never enable forecast',()=>{
 const {dom,ui,app}=setup();
 Object.assign(ui.s,{date:'2027-05-28',standardCaseConfirmed:true,zve:''});
 assert.equal(app.evaluate(ui.s.schedule).forecastPlanningReady,false);
 Object.assign(ui.s,{zve:80000,selfEmployed:true});
 assert.equal(app.evaluate(ui.s.schedule).forecastPlanningReady,false);
 Object.assign(ui.s,{selfEmployed:false,date:'2028-01-01'});
 assert.equal(app.evaluate(ui.s.schedule).forecastPlanningReady,false);
 dom.window.close();
});
test('forecast preview must never suppress an actual benefit rule conflict',()=>{
 const {dom,ui,app}=setup();
 Object.assign(ui.s,{date:'2027-05-28',standardCaseConfirmed:true,zve:80000});
 const bad=Array.from({length:36},(_,i)=>({f:'W',m:i<2?'MS':'W'}));
 bad[14].f='B';
 const result=app.evaluate(bad);
 assert.equal(result.validation.provisionalPlanningEligible,false);
 assert.equal(result.forecastPlanningReady,false);
 dom.window.close();
});
test('candidate ranking rejects invalid forecast data unless explicitly permitted',()=>{
 const rows=Array.from({length:36},(_,i)=>({lm:i+1,f:'W',m:'W',cashAfter:2300}));
 const item={schedule:Array.from({length:36},()=>({f:'W',m:'W'})),calc:{valid:false,forecastPlanningReady:true,rows}};
 assert.equal(rankCandidates([item],{horizon:18}).length,0);
 assert.equal(rankCandidates([item],{horizon:18,allowProvisional:true}).length,1);
 const forbidden={...item,calc:{...item.calc,forecastPlanningReady:false}};
 assert.equal(rankCandidates([forbidden],{horizon:18,allowProvisional:true}).length,0);
});
test('2027 goal search produces transparent prospective candidates rather than legally validated plans',()=>{
 const {dom,ui,app,errors}=setup();
 Object.assign(ui.s,{date:'2027-05-28',standardCaseConfirmed:true,zve:80000,goalCare:14,goalMinFather:0,goalRoles:'father',goalOverlap:14,goalPart:0,goalMinIncome:0});
 const candidates=app.runGoalSearch();
 assert.ok(candidates.length>=1,'2027 preview should find at least one non-certified pattern');
 assert.ok(candidates.every(c=>!c.calc.valid&&c.calc.forecastPlanningReady));
 assert.match(dom.window.document.getElementById('goalResult').textContent,/UNVERBINDLICHE PROGNOSE FÜR 2027/);
 assert.ok(app.goalResults().every(c=>c.valid===false&&c.forecastPreview===true));
 assert.deepEqual(errors,[]);
 dom.window.close();
});
