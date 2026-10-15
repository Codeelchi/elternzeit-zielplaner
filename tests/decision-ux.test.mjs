import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {JSDOM,VirtualConsole} from 'jsdom';
const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');
function setup(){
 const errors=[],virtualConsole=new VirtualConsole();virtualConsole.on('jsdomError',e=>errors.push(e.message));
 const dom=new JSDOM(html,{url:'https://elternzeit.local',runScripts:'dangerously',pretendToBeVisual:true,virtualConsole,beforeParse(w){w.scrollTo=()=>{};w.alert=()=>{};}});
 return {dom,ui:dom.window.__elternzeitTest,app:dom.window.__elternzeitV3,doc:dom.window.document,errors};
}
test('neutral financial entry separates example, known and externally obtained values',()=>{
 const {dom,ui,doc,errors}=setup();assert.match(doc.querySelector('#incomeGuide').textContent,/Beispiel/);
 assert.doesNotMatch(doc.querySelector('#slide-1').textContent,/IV\s*\/\s*IV|Brutto je Person/);
 assert.doesNotMatch(doc.querySelector('#slide-2').textContent,/Beide verdienen|deine Frau|deiner Frau/);
 ui.changeValue('incomeEntryMode','official');assert.match(doc.querySelector('#incomeGuide').textContent,/nicht in das Feld Elterngeld-Netto/);
 assert.match(doc.querySelector('#incomeOnboarding').textContent,/Keine automatische Verbindung/);
 ui.changeValue('netFather',2100);ui.changeValue('netMother',1800);ui.changeValue('goalCare',24);ui.changeValue('goalMinIncome',900);
 assert.match(doc.querySelector('#heroGross').textContent,/3.900/);assert.match(doc.querySelector('#heroCare').textContent,/24/);assert.match(doc.querySelector('#heroMinimum').textContent,/900/);
 assert.deepEqual(errors,[]);dom.window.close();
});
test('parent display names use text nodes and preserve the maternity role',()=>{
 const {dom,ui,app,doc,errors}=setup();const before=app.timeAxes().maternity;
 ui.changeValue('parentNameFather','Mutter');ui.changeValue('parentNameMother','<img src=x>');
 assert.equal(doc.querySelector('label[for="netFather"]').textContent,'Auszahlungs-Netto Mutter');
 assert.equal(doc.querySelector('label[for="netMother"]').textContent,'Auszahlungs-Netto <img src=x>');
 assert.equal(doc.querySelectorAll('#slide-2 img').length,0);
 assert.deepEqual(app.timeAxes().maternity,before);assert.deepEqual(errors,[]);dom.window.close();
});
test('profile import roundtrip is additive, bounded and does not authenticate a source',()=>{
 const {dom,ui}=setup();const source=ui.getState();source.parentNameFather='Alex';source.parentNameMother='Sam';source.incomeEntryMode='official';
 const data=ui.sanitizeImport(source);assert.equal(data.parentNameFather,'Alex');assert.equal(data.parentNameMother,'Sam');assert.equal(data.incomeEntryMode,'official');assert.equal(data.storageConsent,false);
 assert.throws(()=>ui.sanitizeImport({...source,parentNameFather:'A'.repeat(41)}),/Elternbezeichnung/);
 assert.throws(()=>ui.sanitizeImport({...source,parentNameMother:'A\nB'}),/Elternbezeichnung/);
 assert.throws(()=>ui.sanitizeImport({...source,incomeEntryMode:'certified'}),/Einkommenseinstieg/);dom.window.close();
});
test('cent rounding applies to Plus months before summing, with explicit unresolved maternity notice',()=>{
 const {dom,ui,app,doc}=setup();Object.assign(ui.s,{date:'2026-05-20',egNetFather:650,standardCaseConfirmed:true,zve:90000});
 assert.equal(ui.basis(650,0),549.25);assert.equal(ui.plus(650,0),274.63);
 const plan=Array.from({length:36},(_,i)=>({f:i>=2&&i<26?'P':'W',m:i<2?'MS':'W'}));const calc=app.evaluate(plan);
 assert.equal(calc.sum(36,'fg'),6591.12);assert.equal(calc.rows[2].fg,274.63);
 ui.changeValue('date','2026-05-20');ui.changeValue('month',2);assert.match(doc.querySelector('#detailInsight').textContent,/Teilmonatsanrechnung.*ungeklärt/);dom.window.close();
});
test('async search can cancel before publication and preserves the current plan',async()=>{
 const {dom,ui,app,doc,errors}=setup();Object.assign(ui.s,{date:'2026-05-28',standardCaseConfirmed:true,zve:90000});const before=JSON.stringify(ui.s.schedule);
 const pending=app.runGoalSearchAsync();assert.equal(app.goalSearchState().running,true);assert.equal(doc.querySelector('#cancelGoalSearch').hidden,false);
 assert.equal(app.cancelGoalSearch(),true);assert.equal((await pending).length,0);assert.equal(app.goalSearchState().running,false);assert.equal(JSON.stringify(ui.s.schedule),before);assert.equal(app.goalResults().length,0);assert.match(doc.querySelector('#goalResult').textContent,/abgebrochen/);
 const restarted=app.runGoalSearchAsync();ui.changeValue('goalMinIncome',3000);await restarted;assert.equal(app.goalSearchState().running,false);assert.match(doc.querySelector('#goalResult').textContent,/Eingaben geändert/);assert.deepEqual(errors,[]);dom.window.close();
});
test('completed search reports all first-rejection filters and freezes consistent comparison assumptions',()=>{
 const {dom,ui,app,doc,errors}=setup();Object.assign(ui.s,{date:'2026-05-28',standardCaseConfirmed:true,zve:90000,goalCare:12,horizon:18,goalPart:0,goalRoles:'father',goalMinFather:0});
 const results=app.runGoalSearch();assert.ok(results.length>0);const stats=app.goalStatistics();assert.equal(Object.values(stats.rejected).reduce((a,n)=>a+n,0)+stats.valid,stats.seen);assert.ok(stats.generated>=stats.seen);
 const comparison=app.goalComparison();assert.equal(comparison.horizon,18);assert.equal(comparison.plans.length,results.length);comparison.plans.forEach((p,i)=>{assert.equal(p.freeMonths.father,results[i].calc.fFree);assert.equal(p.freeMonths.mother,results[i].calc.mFree);});assert.equal(comparison.bankReceiptsPredicted,false);
 assert.match(doc.querySelector('#goalResult').textContent,/Anfangsrücklage/);assert.match(doc.querySelector('#goalResult').textContent,/Engpass-Lebensmonate/);assert.match(doc.querySelector('#goalResult').textContent,/Vorsichtig/);
 const headings=[...doc.querySelectorAll('#goalResult .plan-option h3')].map(h=>h.textContent);
 assert.equal(headings.length,results.length);assert.equal(new Set(headings).size,headings.length);
 assert.ok(results.every((p,i)=>headings[i].includes(p.title)));
 const serialized=app.goalResults();assert.equal(serialized.length,results.length);
 assert.deepEqual(serialized.map(p=>p.title),results.map(p=>p.title));
 assert.ok(headings.every(text=>/Fokus|Szenario|Stresstest/.test(text)));
 const before=JSON.stringify(comparison);ui.changeValue('riskFatherPercent',35);assert.equal(JSON.stringify(app.goalComparison()),before);assert.match(doc.querySelector('#goalResult').textContent,/veraltet/);assert.ok([...doc.querySelectorAll('[data-accept]')].every(b=>b.disabled));assert.deepEqual(errors,[]);dom.window.close();
});

test('clearing a required net input stays unknown while explicit zero remains deliberate',()=>{
 const {dom,ui,app,doc,errors}=setup();Object.assign(ui.s,{date:'2026-05-28',standardCaseConfirmed:true,zve:90000});
 const input=doc.querySelector('#egNetFather');input.value='';input.dispatchEvent(new dom.window.Event('input',{bubbles:true}));
 assert.equal(ui.getState().egNetFather,'');assert.equal(input.value,'');assert.equal(ui.evaluate().validation.status,'DATEN_UNVOLLSTAENDIG');assert.equal(app.runGoalSearch().length,0);
 input.value='0';input.dispatchEvent(new dom.window.Event('input',{bubbles:true}));assert.equal(ui.getState().egNetFather,0);assert.notEqual(ui.evaluate().validation.status,'DATEN_UNVOLLSTAENDIG');assert.deepEqual(errors,[]);dom.window.close();
});
