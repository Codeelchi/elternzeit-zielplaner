import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {JSDOM,VirtualConsole} from 'jsdom';
const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');
function setup(){
 const errors=[],vc=new VirtualConsole();vc.on('jsdomError',e=>errors.push(e.message));
 const dom=new JSDOM(html,{url:'https://elternzeit.local',runScripts:'dangerously',pretendToBeVisual:true,
  virtualConsole:vc,beforeParse(w){w.scrollTo=()=>{};w.alert=()=>{};w.confirm=()=>true;}});
 return {dom,document:dom.window.document,ui:dom.window.__elternzeitTest,errors};
}
test('initial view never treats prefilled future example as an approved standard case',()=>{
 const {dom,document:d,ui,errors}=setup();
 assert.equal(d.getElementById('v317Scope').dataset.scopeCode,'OUTSIDE_SCOPE');
 assert.match(d.getElementById('v317ScopeReview').textContent,/Öffentliche Freigabe ausstehend/);
 assert.match(d.getElementById('v317ScopeMoney').textContent,/Schätzwerte/);
 assert.match(d.getElementById('v317ScopeBirth').textContent,/2026-12-31/);
 assert.equal(ui.getState().storageConsent,false);
 assert.deepEqual(errors,[]);
 dom.window.close();
});
test('valid cohort with missing standard confirmation stays incomplete until explicit affirmation',()=>{
 const {dom,document:d,ui,errors}=setup();
 ui.changeValue('date','2026-05-28');
 assert.equal(d.getElementById('v317Scope').dataset.scopeCode,'INPUTS_INCOMPLETE');
 ui.changeValue('standardCaseConfirmed',true);
 ui.changeValue('zve',95000);
 assert.equal(d.getElementById('v317Scope').dataset.scopeCode,'PLAUSIBLE_MODEL');
 assert.match(d.getElementById('v317ScopeStatus').textContent,/keine Freigabe/);
 assert.match(d.getElementById('v317ScopeResultStatus').textContent,/keine Freigabe/);
 assert.deepEqual(errors,[]);
 dom.window.close();
});
test('2027 remains a conditional forecast, and unsupported income returns out of scope',()=>{
 const {dom,document:d,ui,errors}=setup();
 ui.changeValue('standardCaseConfirmed',true);
 ui.changeValue('zve',95000);
 assert.equal(d.getElementById('v317Scope').dataset.scopeCode,'FORECAST_ONLY');
 assert.match(d.getElementById('v317ScopeStatus').textContent,/Zukunftsprognose/);
 ui.changeValue('date','2026-05-28');
 ui.changeValue('incomeProfileFather','mixed_or_self_employed');
 assert.equal(d.getElementById('v317Scope').dataset.scopeCode,'OUTSIDE_SCOPE');
 assert.deepEqual(errors,[]);
 dom.window.close();
});
test('known versus reported external income and unknown versus zero expenses are transparent',()=>{
 const {dom,document:d,ui,errors}=setup();
 ui.changeValue('date','2026-05-28');ui.changeValue('standardCaseConfirmed',true);ui.changeValue('zve',95000);
 ui.changeValue('incomeEntryMode','official');
 assert.match(d.getElementById('v317ScopeMoney').textContent,/nicht überprüft/);
 assert.match(d.getElementById('v317ScopeMoney').textContent,/Haushaltsausgaben unbekannt/);
 ui.changeValue('expenses',0);
 assert.match(d.getElementById('v317ScopeMoney').textContent,/Haushaltsausgaben sind eingegeben/);
 assert.equal(dom.window.localStorage.length,0);
 assert.deepEqual(errors,[]);
 dom.window.close();
});
test('scope description remains read-only, navigation to original checks works without extra storage',()=>{
 const {dom,document:d,ui,errors}=setup();
 const original=JSON.stringify(ui.getState());
 const buttons=d.querySelectorAll('#v317Scope [data-goto]');
 assert.equal(buttons.length,2);
 buttons[0].click();
 assert.ok(d.getElementById('slide-2').classList.contains('active'));
 buttons[1].click();
 assert.ok(d.getElementById('slide-10').classList.contains('active'));
 assert.equal(JSON.stringify(ui.getState()),original);
 assert.equal(dom.window.localStorage.length,0);
 assert.deepEqual(errors,[]);
 dom.window.close();
});
test('scope text uses safe text nodes even if a finding message contains markup',()=>{
 const {dom,document:d,ui,errors}=setup();
 // An altered user-visible parent name must never be reparsed by the scope card.
 ui.changeValue('parentNameFather','<img src=x onerror=alert(1)>');
 assert.equal(d.querySelectorAll('#v317Scope img').length,0);
 assert.equal(d.querySelectorAll('#slide-10 .v317-scope img').length,0);
 assert.deepEqual(errors,[]);
 dom.window.close();
});

test('collapsible scope keeps the quickstart approachable and stays open on input changes',()=>{
 const {dom,document:d,ui,errors}=setup();
 const details=d.getElementById('v317Scope');
 assert.equal(details.open,false);
 details.open=true;
 ui.changeValue('date','2026-05-28');
 assert.equal(details.open,true);
 assert.match(details.textContent,/Bitte zuerst die grundlegenden Angaben prüfen/);
 assert.deepEqual(errors,[]);
 dom.window.close();
});
