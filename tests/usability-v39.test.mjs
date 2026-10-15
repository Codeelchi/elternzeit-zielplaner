import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {JSDOM,VirtualConsole} from 'jsdom';
const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');
function setup({confirmResult=true}={}){
 const errors=[],vc=new VirtualConsole();vc.on('jsdomError',e=>errors.push(e.message));
 const dom=new JSDOM(html,{url:'https://elternzeit.local/',runScripts:'dangerously',pretendToBeVisual:true,virtualConsole:vc,
  beforeParse(w){w.scrollTo=()=>{};w.alert=()=>{};w.confirm=()=>confirmResult;w.URL.createObjectURL=()=>'';w.URL.revokeObjectURL=()=>{};}});
 return {dom,doc:dom.window.document,ui:dom.window.__elternzeitTest,app:dom.window.__elternzeitV3,quick:dom.window.__elternzeitV38,errors};
}
function template(t,id){t.doc.querySelector('[data-v38-template="'+id+'"]').click();}
function wizard(t,{date='2027-05-28',father='2350',mother='2600',goal='18',expenses='1550'}={}){
 for(const [id,val] of [['v38Birth',date],['v38NetF',father],['v38NetM',mother],['v38Goal',goal],['v38Expenses',expenses]])
  t.doc.getElementById(id).value=val;
 t.doc.getElementById('v38PersonalForm').dispatchEvent(new t.dom.window.Event('submit',{bubbles:true,cancelable:true}));
}
test('repeat wizard editing expenses preserves manual Elterngeld-Netto, taxable income, approval evidence and own months',()=>{
 const t=setup();template(t,'long18');wizard(t);
 t.ui.s.egNetFather=1725;t.ui.s.zve=91000;t.ui.s.standardCaseConfirmed=true;
 const editor=t.doc.getElementById('fatherStatus');editor.value='U';editor.dispatchEvent(new t.dom.window.Event('change',{bubbles:true}));
 const old=JSON.stringify(t.ui.getState().schedule);
 wizard(t,{expenses:'1675'});
 assert.equal(t.ui.getState().egNetFather,1725);
 assert.equal(t.ui.getState().zve,91000);
 assert.equal(t.ui.getState().standardCaseConfirmed,true);
 assert.equal(JSON.stringify(t.ui.getState().schedule),old);
 assert.equal(t.ui.getState().model,'custom');assert.equal(t.ui.getState().expenses,1675);
 assert.match(t.quick.summary(),/Individueller Plan/);
 assert.deepEqual(t.errors,[]);t.dom.window.close();
});
test('wizard only recalculates its own estimates, never values manually edited in specialist inputs',()=>{
 const t=setup();template(t,'long18');wizard(t,{father:'2200',mother:'2400'});
 wizard(t,{father:'2250',mother:'2500'});
 assert.equal(t.ui.getState().egNetFather,2250);assert.equal(t.ui.getState().egNetMother,2500);
 const input=t.doc.getElementById('egNetFather');input.value='1760';
 input.dispatchEvent(new t.dom.window.Event('input',{bubbles:true}));
 wizard(t,{father:'2300',mother:'2450'});
 assert.equal(t.ui.getState().egNetFather,1760);
 assert.equal(t.ui.getState().egNetMother,2450);
 assert.equal(t.ui.getState().incomeEntryMode,'estimate');
 assert.deepEqual(t.errors,[]);t.dom.window.close();
});
test('cancel reset leaves model data and quickstart UI unchanged',()=>{
 const t=setup({confirmResult:false});template(t,'long18');wizard(t);
 const before=JSON.stringify(t.ui.getState());
 const uiState=t.quick.state();
 t.doc.getElementById('btnReset').click();
 assert.equal(JSON.stringify(t.ui.getState()),before);
 assert.deepEqual(t.quick.state(),uiState);
 assert.match(t.quick.summary(),/Persönliche Näherung/);
 assert.deepEqual(t.errors,[]);t.dom.window.close();
});
test('confirmed reset removes own values and clears short wizard and quickstart state',()=>{
 const t=setup({confirmResult:true});template(t,'long18');wizard(t);
 t.doc.getElementById('btnReset').click();
 assert.equal(t.quick.state().mode,'idle');assert.equal(t.doc.getElementById('v38Birth').value,'');
 assert.equal(t.doc.getElementById('v38NetF').value,'');
 assert.equal(t.doc.getElementById('v38Expenses').value,'');
 assert.match(t.quick.summary(),/Beispiel auswählen/);
 assert.deepEqual(t.errors,[]);t.dom.window.close();
});
test('switching to an 18-month preset with an existing 14-month goal explains the mismatch',()=>{
 const t=setup();template(t,'classic');wizard(t,{goal:'14'});
 template(t,'long18');
 assert.equal(t.ui.getState().goalCare,14);
 assert.match(t.quick.summary(),/Vorlagenzeitraum: 18 Lebensmonate/);
 assert.match(t.quick.summary(),/14 Lebensmonate/);
 const sync=t.doc.querySelector('[data-v39-sync-goal="long18"]');
 assert.ok(sync);sync.click();
 assert.equal(t.ui.getState().goalCare,18);
 assert.equal(t.doc.getElementById('v38Goal').value,'18');
 assert.match(t.quick.summary(),/Ausgewertet: 18/);
 assert.deepEqual(t.errors,[]);t.dom.window.close();
});
test('changing an individual schedule to a preset requires express confirmation',()=>{
 const t=setup({confirmResult:false});template(t,'long18');wizard(t);
 const editor=t.doc.getElementById('fatherStatus');editor.value='U';editor.dispatchEvent(new t.dom.window.Event('change',{bubbles:true}));
 const before=JSON.stringify(t.ui.getState().schedule);
 template(t,'classic');
 assert.equal(t.ui.getState().model,'custom');
 assert.equal(JSON.stringify(t.ui.getState().schedule),before);
 assert.deepEqual(t.errors,[]);t.dom.window.close();
});
test('missing expenses hide reserve totals, financial stress labels and charts everywhere in robustness screen',()=>{
 const t=setup();template(t,'long18');
 const doc=t.doc;
 assert.equal(t.ui.getState().expenses,'');
 assert.match(doc.getElementById('reserveReport').textContent,/nicht berechenbar/);
 assert.doesNotMatch(doc.getElementById('riskCards').textContent,/Verfügbar über/);
 assert.equal(doc.getElementById('riskBar').children.length,0);
 assert.match(doc.getElementById('riskCards').textContent,/Haushaltsausgaben fehlen/);
 t.ui.changeValue('riskPercent',20);
 assert.match(doc.getElementById('riskValue').textContent,/20 %/);
 t.ui.changeValue('expenses',0);
 assert.match(doc.getElementById('reserveReport').textContent,/Erforderliche Anfangsrücklage/);
 assert.match(doc.getElementById('riskCards').textContent,/Verfügbar über/);
 assert.deepEqual(t.errors,[]);t.dom.window.close();
});
test('header uses income before costs and actual cash-after value once costs are entered',()=>{
 const t=setup();template(t,'long18');
 const r=t.ui.evaluate().rows[t.ui.getState().month-1];
 assert.equal(t.doc.getElementById('liveBudget').textContent.replace(/\D/g,''),String(Math.round(r.income)));
 t.ui.changeValue('expenses',1000);
 const z=t.ui.evaluate().rows[t.ui.getState().month-1];
 assert.equal(t.doc.getElementById('liveBudget').textContent.replace(/\D/g,''),String(Math.round(z.cashAfter)));
 assert.match(t.doc.getElementById('liveBudget').previousElementSibling.textContent,/nach eingetragenen Kosten/);
 t.dom.window.close();
});
test('keyboard paging does not hijack a focused quickstart card, while expert arrows still work',()=>{
 const t=setup(),w=t.dom.window;
 const card=t.doc.querySelector('[data-v38-template="long18"]');card.focus();
 let evt=new w.KeyboardEvent('keydown',{key:'PageDown',bubbles:true,cancelable:true});
 t.doc.dispatchEvent(evt);
 assert.equal(t.doc.querySelector('.slide.active').id,'slide-1');assert.equal(evt.defaultPrevented,false);
 t.doc.getElementById('v38Advanced').click();
 const next=t.doc.getElementById('next');next.focus();
 evt=new w.KeyboardEvent('keydown',{key:'ArrowRight',bubbles:true,cancelable:true});
 t.doc.dispatchEvent(evt);
 assert.equal(t.doc.querySelector('.slide.active').id,'slide-2');
 t.dom.window.close();
});
test('missing personal input highlights and focuses exactly the field with the error',()=>{
 const t=setup();template(t,'long18');
 wizard(t,{father:''});
 assert.equal(t.doc.activeElement.id,'v38NetF');
 assert.equal(t.doc.getElementById('v38NetF').getAttribute('aria-invalid'),'true');
 assert.equal(t.doc.getElementById('v38NetF').getAttribute('aria-describedby'),'v38PersonalError');
 assert.match(t.doc.getElementById('v38PersonalError').textContent,/Netto/);
 assert.deepEqual(t.errors,[]);t.dom.window.close();
});
test('mobile options/privacy toggles and download naming work without losing focusable controls',()=>{
 const t=setup();const menu=t.doc.getElementById('v39MobileMenu'),privacy=t.doc.getElementById('v39PrivacyToggle');
 assert.ok(menu);assert.equal(menu.getAttribute('aria-expanded'),'false');
 menu.click();assert.equal(menu.getAttribute('aria-expanded'),'true');
 assert.equal(t.doc.getElementById('topActions').classList.contains('v39-open'),true);
 t.doc.dispatchEvent(new t.dom.window.KeyboardEvent('keydown',{key:'Escape',bubbles:true}));
 assert.equal(menu.getAttribute('aria-expanded'),'false');
 privacy.click();assert.equal(privacy.getAttribute('aria-expanded'),'true');
 assert.equal(t.doc.querySelector('.privacy-strip').classList.contains('v39-open'),true);
 assert.match(t.doc.getElementById('btnJson').textContent,/herunterladen/);
 assert.match(t.doc.getElementById('localSave').closest('label').textContent,/Automatisch/);
 assert.deepEqual(t.errors,[]);t.dom.window.close();
});
test('partially edited example says some values still originate from fictional assumptions',()=>{
 const t=setup();template(t,'long18');
 const input=t.doc.getElementById('netFather');input.value='2350';input.dispatchEvent(new t.dom.window.Event('input',{bubbles:true}));
 assert.match(t.quick.summary(),/Teilweise angepasstes Beispiel/);
 assert.match(t.quick.summary(),/fiktiven Vorlage/);
 assert.match(t.quick.summary(),/Welche Zahlen und Annahmen/);
 assert.deepEqual(t.errors,[]);t.dom.window.close();
});

test('reopened personal form synchronizes current specialist wages without erasing an unsubmitted draft',()=>{
 const t=setup();template(t,'long18');wizard(t);
 const own=t.doc.getElementById('netFather');
 own.value='2750';own.dispatchEvent(new t.dom.window.Event('input',{bubbles:true}));
 t.doc.getElementById('v38EditOwn').click();
 // Opening the short form reads the latest advanced values if no local draft is pending.
 assert.equal(t.doc.getElementById('v38NetF').value,'2750');
 const form=t.doc.getElementById('v38NetF');
 form.value='2900';form.dispatchEvent(new t.dom.window.Event('input',{bubbles:true}));
 own.value='2800';own.dispatchEvent(new t.dom.window.Event('input',{bubbles:true}));
 // User's in-progress unsubmitted form entry takes precedence over auto-sync.
 assert.equal(form.value,'2900');
 wizard(t,{father:'2900'});
 assert.equal(t.ui.getState().netFather,2900);
 assert.deepEqual(t.errors,[]);t.dom.window.close();
});

test('financial candidate UI never claims estimated 0-euro reserve before expenses are known',()=>{
 const t=setup();Object.assign(t.ui.s,{date:'2026-05-28',zve:90000,standardCaseConfirmed:true,
   goalCare:10,horizon:12,goalMinFather:0,goalPart:0,goalRoles:'father',expenses:''});
 const results=t.app.runGoalSearch();
 assert.ok(results.length>0);
 const text=t.doc.getElementById('goalResult').textContent;
 assert.match(text,/Kein belastbarer Budgetvergleich/);
 assert.match(text,/nur Zeitaufteilung/);
 assert.doesNotMatch(text,/Erforderliche Anfangsrücklage\s*0/);
 assert.doesNotMatch(text,/Verfügbar über/);
 assert.deepEqual(t.errors,[]);t.dom.window.close();
});
