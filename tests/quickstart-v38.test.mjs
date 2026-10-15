import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {JSDOM,VirtualConsole} from 'jsdom';

const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');
function setup(){
 const errors=[],vc=new VirtualConsole();vc.on('jsdomError',e=>errors.push(e.message));
 const dom=new JSDOM(html,{
  url:'https://elternzeit.local/',runScripts:'dangerously',pretendToBeVisual:true,virtualConsole:vc,
  beforeParse(w){w.scrollTo=()=>{};w.alert=()=>{};w.URL.createObjectURL=()=>'';w.URL.revokeObjectURL=()=>{};}
 });
 return {dom,doc:dom.window.document,ui:dom.window.__elternzeitTest,quick:dom.window.__elternzeitV38,errors};
}
function click(doc,id){const x=doc.querySelector('[data-v38-template="'+id+'"]');assert.ok(x,id);x.click();}
function submit(doc,dom,{date='2027-05-28',father='2600',mother='2400',goal='18',expenses=''}={}){
 for(const [name,value]of [['v38Birth',date],['v38NetF',father],['v38NetM',mother],['v38Goal',goal],['v38Expenses',expenses]])
  doc.getElementById(name).value=value;
 doc.getElementById('v38PersonalForm').dispatchEvent(new dom.window.Event('submit',{bubbles:true,cancelable:true}));
}
test('first view offers five templates and a genuinely blank personal form without implicit result',()=>{
 const {dom,doc,quick,errors}=setup();
 assert.ok(quick);
 assert.equal(quick.state().mode,'idle');
 assert.equal(doc.querySelectorAll('[data-v38-template]').length,5);
 assert.equal(doc.getElementById('v38NetF').value,'');
 assert.equal(doc.getElementById('v38NetM').value,'');
 assert.equal(doc.getElementById('v38Birth').value,'');
 assert.match(quick.summary(),/Beispiel auswählen/);
 assert.equal(doc.querySelectorAll('#sectionNav button:not([hidden])').length,6);
 assert.ok(dom.window.document.body.classList.contains('v38-pristine'));
 assert.deepEqual(errors,[]);
 dom.window.close();
});
test('all five presets load an actual existing monthly model and never claim legal validity for 2027',()=>{
 const {dom,doc,quick,ui,errors}=setup();
 for(const id of ['classic','long18','parttime','shared','return']){
  click(doc,id);
  assert.equal(quick.state().selected,id);
  assert.equal(quick.state().mode,'example');
  assert.match(quick.summary(),/Fiktives Beispiel/);
  assert.match(quick.summary(),/2027/);
  assert.match(quick.summary(),/unverbindlich/);
  assert.equal(ui.getState().standardCaseConfirmed,null);
  assert.equal(ui.getState().zve,'');
  assert.equal(ui.evaluate().valid,false);
 }
 assert.deepEqual(errors,[]);
 dom.window.close();
});
test('18-month care preset covers the goal and classic 14-month plan does not',()=>{
 const {dom,doc,quick}=setup();
 click(doc,'long18');
 assert.equal(quick.state().careCovered,true);
 click(doc,'classic');
 assert.equal(quick.state().careCovered,true); // default classic goal is 14 months
 submit(doc,dom,{goal:'18'});
 assert.equal(quick.state().careCovered,false);
 assert.match(quick.summary(),/Betreuungslücke ab LM 15/);
 const match=doc.querySelector('[data-v38-match]');
 assert.equal(match?.dataset.v38Match,'long18');
 match.click();
 assert.equal(quick.state().mode,'personal');
 assert.equal(quick.state().careCovered,true);
 assert.equal(dom.window.__elternzeitTest.getState().goalCare,18);
 dom.window.close();
});
test('Parttime/early return do not silently guarantee 18-month childcare',()=>{
 const {dom,doc,quick}=setup();
 click(doc,'parttime');
 assert.equal(quick.state().careCovered,false);
 assert.match(quick.summary(),/Betreuungslücke/);
 click(doc,'return');
 submit(doc,dom,{goal:'18'});
 assert.equal(quick.state().careCovered,false);
 assert.match(quick.summary(),/zusätzliche Betreuung|Betreuungslücke/);
 dom.window.close();
});
test('unknown household costs are NOT reported as spendable monthly surplus or reserves',()=>{
 const {dom,doc,quick,ui}=setup();
 click(doc,'long18');
 assert.equal(quick.state().costsKnown,false);
 assert.match(quick.summary(),/Einnahmen, kein frei verfügbares Budget/);
 assert.match(quick.summary(),/keine Aussage über verfügbares Restbudget/);
 assert.ok(!doc.getElementById('v38CostBanner').hidden);
 assert.match(doc.getElementById('v38CostBanner').textContent,/Haushaltsausgaben unbekannt/);
 assert.match(doc.getElementById('liveBudget').previousElementSibling.textContent,/Einnahmen vor Haushaltsausgaben/);
 ui.changeValue('expenses',900);
 assert.equal(quick.state().costsKnown,true);
 assert.ok(doc.getElementById('v38CostBanner').hidden);
 assert.match(quick.summary(),/nach eingegebenen Kosten|nach eingegebenen Haushalts-/i);
 ui.changeValue('expenses','');
 assert.equal(quick.state().costsKnown,false);
 dom.window.close();
});
test('personal wizard updates existing V3.7 engine but does not fake a certified Elterngeld-Netto',()=>{
 const {dom,doc,quick,ui,errors}=setup();
 click(doc,'long18');
 submit(doc,dom,{father:'2300.50',mother:'2500.40',expenses:'1950',goal:'18'});
 const s=ui.getState();
 assert.equal(quick.state().mode,'personal');
 assert.equal(s.netFather,2300.5);assert.equal(s.netMother,2500.4);
 assert.equal(s.egNetFather,2300.5);assert.equal(s.egNetMother,2500.4);
 assert.equal(s.expenses,1950);
 assert.equal(s.standardCaseConfirmed,null);
 assert.equal(s.zve,'');
 assert.equal(s.incomeEntryMode,'estimate');
 assert.equal(quick.state().costsKnown,true);
 assert.match(quick.summary(),/Elterngeld-Netto vorläufig/);
 assert.deepEqual(errors,[]);
 dom.window.close();
});
test('optional empty costs differ from explicitly entered zero',()=>{
 const {dom,doc,quick,ui}=setup();
 submit(doc,dom,{expenses:''});
 assert.equal(ui.getState().expenses,'');
 assert.equal(quick.state().costsKnown,false);
 submit(doc,dom,{expenses:'0'});
 assert.equal(ui.getState().expenses,0);
 assert.equal(quick.state().costsKnown,true);
 dom.window.close();
});
test('invalid date and out-of-range income are rejected without partial state update',()=>{
 const {dom,doc,ui}=setup();
 const date=ui.getState().date;
 submit(doc,dom,{date:'2027-02-30'});
 assert.equal(ui.getState().date,date);
 assert.notEqual(doc.getElementById('v38PersonalError').textContent,'');
 submit(doc,dom,{father:'100001'});
 assert.equal(ui.getState().date,date);
 assert.notEqual(doc.getElementById('v38PersonalError').textContent,'');
 dom.window.close();
});
test('a sample cannot overwrite an already consented-to saved personal file',()=>{
 const {dom,doc,quick,ui}=setup();
 ui.s.storageConsent=true;
 const old='{"fileType":"unchanged saved plan","income":999}';
 dom.window.localStorage.setItem('elternzeit-familienplan-v3',old);
 click(doc,'long18');
 assert.equal(ui.getState().storageConsent,false);
 assert.equal(dom.window.localStorage.getItem('elternzeit-familienplan-v3'),old);
 assert.equal(quick.state().mode,'example');
 dom.window.close();
});
test('basic navigation is concise and expert toggle exposes the full 16 tabs',()=>{
 const {dom,doc,quick,ui}=setup();
 assert.equal(doc.querySelectorAll('#sectionNav button').length,16);
 assert.equal(doc.querySelectorAll('#sectionNav button:not([hidden])').length,6);
 doc.getElementById('v38Advanced').click();
 assert.equal(quick.state().expert,true);
 assert.equal(doc.querySelectorAll('#sectionNav button:not([hidden])').length,16);
 ui.showSlide(6);
 assert.match(doc.querySelector('.slide.active')?.dataset.title||'',/Cashflow/);
 doc.getElementById('v38Advanced').click();
 assert.equal(quick.state().expert,false);
 assert.ok(doc.querySelector('#sectionNav [data-slide="6"]:not([hidden])'));
 dom.window.close();
});
test('long goals without template remain explicitly uncovered',()=>{
 const {dom,doc,quick}=setup();
 click(doc,'long18');
 submit(doc,dom,{goal:'36'});
 assert.equal(quick.state().careCovered,false);
 assert.match(quick.summary(),/noch keine fertige Schnellstart-Vorlage/);
 assert.ok(!doc.querySelector('#v38Summary [data-v38-match]'));
 dom.window.close();
});

test('expert income edits turn a displayed demo into a clearly labelled personal draft',()=>{
 const {dom,doc,quick,ui}=setup();
 click(doc,'long18');
 assert.equal(quick.state().mode,'example');
 const input=doc.getElementById('netFather');
 input.value='2450';input.dispatchEvent(new dom.window.Event('input',{bubbles:true}));
 assert.equal(ui.getState().netFather,2450);
 assert.equal(quick.state().mode,'personal');
 assert.match(quick.summary(),/Persönliche Näherung/);
 assert.doesNotMatch(quick.summary(),/Fiktives Beispiel/);
 dom.window.close();
});

test('choosing an existing model outside quickstart updates the visible template heading',()=>{
 const {dom,doc,quick,ui}=setup();
 click(doc,'classic');
 ui.chooseModel('father18');
 assert.equal(ui.getState().model,'father18');
 assert.equal(quick.state().selected,'long18');
 assert.match(quick.summary(),/18 Monate zu Hause/);
 dom.window.close();
});
