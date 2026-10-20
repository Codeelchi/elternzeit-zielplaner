import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {JSDOM,VirtualConsole} from 'jsdom';

const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');
// Captured from origin/main 71a45ee with synthetic inputs, before the label patch.
// Historical captions remain in the fixture for provenance, not as UI contracts.
const golden=JSON.parse(readFileSync(new URL('./fixtures/financial-metrics-baseline.json',import.meta.url),'utf8'));
const selected=[1,3,12,18,24];
// Normalize cross-realm JSDOM records before strict numeric/structural comparison.
const same=(actual,expected,message)=>assert.deepEqual(JSON.parse(JSON.stringify(actual)),expected,message);
const text=el=>el?.textContent.replace(/\s+/g,' ').trim();
const euro=n=>Math.round(n).toLocaleString('de-DE')+' €';
const omit=(object,...keys)=>Object.fromEntries(Object.entries(object).filter(([k])=>!keys.includes(k)));
const rowSnapshot=r=>({lm:r.lm,income:r.income,cashAfter:r.cashAfter,kind:r.kind,childcare:r.childcare,totalEg:r.totalEg,grant:r.grant});
function setup(){
 const errors=[],virtualConsole=new VirtualConsole();virtualConsole.on('jsdomError',e=>errors.push(e.message));
 const dom=new JSDOM(html,{url:'https://elternzeit.local',runScripts:'dangerously',pretendToBeVisual:true,virtualConsole,beforeParse(w){w.scrollTo=()=>{};w.alert=()=>{};}});
 return {dom,ui:dom.window.__elternzeitTest,app:dom.window.__elternzeitV3,doc:dom.window.document,errors};
}
function setFinancial(ui){
 Object.assign(ui.s,{date:'2026-06-17',standardCaseConfirmed:true,zve:68000,netFather:2400,netMother:2000,egNetFather:2400,egNetMother:2000,kind:259,childcareStart:12,childcareMonthly:350,childcareMeals:40,confirmedGrant:500,grantVerified:true,grantMonth:12,expenses:'',horizon:24});
 ui.changeValue('horizon',24);
}
function financialSnapshot(ui,doc){
 const ev=ui.evaluate();
 const axes=[...doc.querySelectorAll('#axesTable tbody tr')].filter(tr=>selected.includes(Number(tr.children[0]?.textContent.match(/\d+/)?.[0]))).map(tr=>[...tr.children].map(text));
 return {rows:ev.rows.filter(r=>selected.includes(r.lm)).map(rowSnapshot),sums:{income18:ev.sum(18,'income'),income24:ev.sum(24,'income'),cashAfter18:ev.sum(18,'cashAfter'),cashAfter24:ev.sum(24,'cashAfter'),totalEg24:ev.sum(24,'totalEg'),childcare24:ev.sum(24,'childcare'),low18:ev.low(18),low24:ev.low(24)},metrics:Object.fromEntries(['modelTotal','builderIncome','incomeTotal','liveBudget','detailTotal','periodLabel','builderHorizon'].map(id=>[id,text(doc.getElementById(id))])),axes};
}
function expenseSnapshot(ui,doc,expenses){
 ui.changeValue('expenses',expenses);const ev=ui.evaluate();
 return {expenses,rows:ev.rows.filter(r=>selected.includes(r.lm)).map(r=>({lm:r.lm,income:r.income,cashAfter:r.cashAfter})),cashAfter18:ev.sum(18,'cashAfter'),cashAfter24:ev.sum(24,'cashAfter'),liveBudget:text(doc.getElementById('liveBudget')),detailTotal:text(doc.getElementById('detailTotal'))};
}

test('financial labels preserve main numbers, formatted cells and model comparisons from main',()=>{
 const {dom,ui,doc,errors}=setup();try{
  setFinancial(ui);const actual=financialSnapshot(ui,doc);
  same(actual.rows,golden.financial.rows);same(actual.sums,golden.financial.sums);
  same(actual.metrics,omit(golden.financial.metrics,'detailSurplus'));same(actual.axes,golden.financial.axes);
  for(const variant of golden.financial.expenseVariants)same(expenseSnapshot(ui,doc,variant.expenses),omit(variant,'detailSurplus'));
  ui.changeValue('expenses','');
  for(const [id,want]of Object.entries(golden.financial.models)){
   const x=ui.modelPlan(id);same({sumIncome:x.sum(24,'income'),sumCashAfter:x.sum(24,'cashAfter'),low:x.low(24)},want,id);
  }
  for(const id of ['modelTotal','builderIncome','incomeTotal']){
   const card=doc.getElementById(id).closest('.card');assert.match(card.textContent,/Einnahmen vor Haushalts- und Kita-Kosten/);assert.doesNotMatch(card.textContent,/Budget/);
  }
  ui.changeValue('expenses','');assert.match(doc.getElementById('liveBudget').previousElementSibling.textContent,/Einnahmen vor Haushalts- und Kita-Kosten \/ LM/);
  ui.changeValue('expenses',2500);assert.match(doc.getElementById('liveBudget').previousElementSibling.textContent,/Rest nach eingetragenen Haushalts- und Kita-Kosten \/ LM/);
  // This legacy partial comparison subtracts household costs only: label it honestly.
  const r=ui.evaluate().rows[ui.s.month-1];assert.equal(r.childcare,0);assert.equal(r.grant,0);
  assert.match(doc.getElementById('detailSurplus').textContent,/nach Haushaltsausgaben, vor Kita-Kosten/);
  assert.ok(text(doc.getElementById('detailSurplus')).endsWith(euro(r.income-2500)));
  ui.changeValue('horizon',18);
  for(const id of ['modelTotal','builderIncome','incomeTotal'])assert.equal(text(doc.getElementById(id)),euro(golden.financial.sums.income18));
  assert.equal(text(doc.getElementById('modelHorizon')),'18');assert.equal(text(doc.getElementById('compareHorizon')),'18');
  assert.deepEqual(errors,[]);
 }finally{dom.window.close();}
});

test('goal search retains main numeric summaries, ordering and complete schedules while labels change',()=>{
 const {dom,ui,app,doc,errors}=setup();try{
  Object.assign(ui.s,{date:'2026-05-28',standardCaseConfirmed:true,zve:68000,goalCare:12,horizon:18,goalPart:0,goalRoles:'father',goalMinFather:0,expenses:1800});ui.changeValue('horizon',18);
  const results=app.runGoalSearch(),comparison=app.goalComparison();assert.equal(results.length,golden.goal.count);same(app.goalStatistics(),golden.goal.stats);
  same({horizon:comparison.horizon,bankReceiptsPredicted:comparison.bankReceiptsPredicted,freeMonths:comparison.plans.map(p=>p.freeMonths)},golden.goal.comparison);
  same(results.map(p=>({schedule:p.schedule.map(r=>({f:r.f,m:r.m})),fFree:p.calc.fFree,mFree:p.calc.mFree,income:p.calc.sum(18,'income'),cashAfter:p.calc.sum(18,'cashAfter'),low:p.calc.low(18)})),golden.goal.results.map(p=>omit(p,'title')));
  assert.equal(doc.querySelectorAll('#goalResult .goal-quick-metrics').length,results.length);
  for(const card of doc.querySelectorAll('#goalResult .plan-option')){
   assert.match(card.textContent,/Vergleichszeitraum: 18 Lebensmonate/);assert.match(card.textContent,/Haushalts- und Kita-Kosten/);assert.doesNotMatch(card.textContent,/Budget/);
  }
  assert.deepEqual(errors,[]);
 }finally{dom.window.close();}
});
