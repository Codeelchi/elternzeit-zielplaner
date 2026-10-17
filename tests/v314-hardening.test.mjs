import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {JSDOM,VirtualConsole} from 'jsdom';
const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');
function setup(){
 const errors=[],vc=new VirtualConsole();vc.on('jsdomError',e=>errors.push(e.message));
 const dom=new JSDOM(html,{url:'https://elternzeit.local/',runScripts:'dangerously',pretendToBeVisual:true,virtualConsole:vc,
  beforeParse(w){w.scrollTo=()=>{};w.alert=()=>{};w.confirm=()=>true;w.URL.createObjectURL=()=>'';w.URL.revokeObjectURL=()=>{};}});
 const doc=dom.window.document,ui=dom.window.__elternzeitTest;
 assert.ok(ui,'booted');
 doc.querySelector('[data-v38-template="classic"]').click();
 const change=(id,value,type='input')=>{
  const element=doc.getElementById(id);assert.ok(element,id);
  element.value=String(value);element.dispatchEvent(new dom.window.Event(type,{bubbles:true}));
 };
 return {dom,doc,ui,change,errors};
}
test('explicit premium and tax allocation compare reserves without changing financial or legal plan',()=>{
 const {dom,doc,ui,change,errors}=setup();
 ui.changeValue('expenses',1200);
 change('v313InsuranceIncluded','no','change');
 const before=JSON.stringify(ui.getState());
 change('v314InsuranceExtra','175.25');
 change('v314TaxExtra','90.50');
 const output=doc.getElementById('v314CostResult').textContent;
 assert.match(output,/Zusätzlich selbst angesetzt/);
 assert.match(output,/Rücklage/);
 assert.match(output,/Steuer- oder Beitragsberechnung/);
 assert.equal(JSON.stringify(ui.getState()),before);
 assert.equal(dom.window.localStorage.length,0);
 assert.deepEqual(errors,[]);dom.window.close();
});
test('already counted costs cannot enter comparison twice and changing selection updates warning',()=>{
 const {dom,doc,ui,change}=setup();
 ui.changeValue('expenses',1200);
 change('v314InsuranceExtra','120');
 change('v313InsuranceIncluded','yes','change');
 assert.match(doc.getElementById('v314CostResult').textContent,/doppelt ansetzen/);
 change('v313InsuranceIncluded','no','change');
 assert.doesNotMatch(doc.getElementById('v314CostResult').textContent,/doppelt ansetzen/);
 dom.window.close();
});
test('unknown expenses and fractional-cent inputs cannot manufacture a reserve',()=>{
 const {dom,doc,ui,change}=setup();
 change('v314TaxExtra','120');
 assert.match(doc.getElementById('v314CostResult').textContent,/Haushaltsausgaben sind unbekannt/);
 ui.changeValue('expenses',1000);
 change('v314TaxExtra','0.001');
 assert.match(doc.getElementById('v314CostResult').textContent,/maximal zwei Nachkommastellen/);
 dom.window.close();
});
test('reset clears session-only tax/insurance extras but never loses a saved separate plan',()=>{
 const {dom,doc,ui,change,errors}=setup();
 change('v314InsuranceExtra','225');
 change('v314TaxExtra','95');
 doc.getElementById('btnReset').click();
 assert.equal(doc.getElementById('v314InsuranceExtra').value,'');
 assert.equal(doc.getElementById('v314TaxExtra').value,'');
 assert.match(doc.getElementById('v314CostResult').textContent,/Noch keine zusätzlichen Beiträge/);
 assert.equal(ui.getState().storageConsent,false);
 assert.deepEqual(errors,[]);dom.window.close();
});
test('Cologne 2025 snapshot age groups are explanatory and not the actual financial forecast',()=>{
 const {dom,doc,ui}=setup();
 ui.changeValue('date','2027-05-28');
 ui.changeValue('childcareStart',19);
 ui.changeValue('childcareMode','cologne2025');
 const pane=doc.getElementById('v313ColognePreview');
 assert.equal(pane.hidden,false);
 assert.match(pane.textContent,/2027\/2028/);
 assert.match(pane.textContent,/NICHT ins Budget übernommen/);
 assert.equal(ui.evaluate().rows[18].childcare,300);
 dom.window.close();
});
