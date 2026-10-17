import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {JSDOM,VirtualConsole} from 'jsdom';
const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');
function setup(){
 const errors=[],virtualConsole=new VirtualConsole();
 virtualConsole.on('jsdomError',e=>errors.push(e.message));
 const dom=new JSDOM(html,{url:'https://elternzeit.local/',runScripts:'dangerously',pretendToBeVisual:true,
  virtualConsole,beforeParse(w){w.scrollTo=()=>{};w.alert=()=>{};w.confirm=()=>true;w.URL.createObjectURL=()=>'';w.URL.revokeObjectURL=()=>{};}});
 const doc=dom.window.document,ui=dom.window.__elternzeitTest;
 assert.ok(ui,'application mounted');
 doc.querySelector('[data-v38-template="classic"]').click();
 return {dom,doc,ui,errors};
}
function change(doc,id,value){
 const node=doc.getElementById(id);assert.ok(node,id);
 node.value=String(value);
 node.dispatchEvent(new doc.defaultView.Event('input',{bubbles:true}));
}
test('financial Kita counterfactual uses explicit manual monthly assumptions only and cannot alter plan',()=>{
 const {dom,doc,ui,errors}=setup();
 ui.changeValue('goalCare',18);ui.changeValue('childcareStart',15);
 ui.changeValue('goalCareMode','partial');ui.changeValue('expenses',1200);
 const baseline=JSON.stringify(ui.getState());
 doc.querySelector('.v312-finance').open=true;
 change(doc,'v312LostWage','300.55');
 change(doc,'v312ExtraCare','50.05');
 const select=doc.getElementById('v311KitaDelay');
 select.value='3';select.dispatchEvent(new dom.window.Event('change',{bubbles:true}));
 const content=doc.getElementById('v312ImpactResult').textContent;
 assert.match(content,/-1\.051,80\s*€/);
 assert.match(content,/kein Zahlungsplan/);
 assert.equal(JSON.stringify(ui.getState()),baseline);
 assert.equal(dom.window.localStorage.length,0);
 assert.deepEqual(errors,[]);dom.window.close();
});
test('the original Kita fees are waived only when user explicitly checks the assumption',()=>{
 const {dom,doc,ui}=setup();
 ui.changeValue('goalCare',18);ui.changeValue('childcareStart',15);ui.changeValue('expenses',0);
 change(doc,'v312LostWage','100');
 const before=doc.getElementById('v312ImpactResult').textContent;
 assert.match(before,/-200,00\s*€/);
 const check=doc.getElementById('v312WaiveFees');assert.equal(check.checked,false);
 check.checked=true;check.dispatchEvent(new dom.window.Event('change',{bubbles:true}));
 const after=doc.getElementById('v312ImpactResult').textContent;
 assert.match(after,/\+400,00\s*€/); // Two months: 300 fee credit - 100 wage loss.
 dom.window.close();
});
test('unknown household expenses never become spendable liquidity in impact scenario',()=>{
 const {dom,doc,ui}=setup();
 ui.changeValue('goalCare',18);ui.changeValue('childcareStart',15);
 change(doc,'v312ExtraCare','75');
 const output=doc.getElementById('v312ImpactResult').textContent;
 assert.match(output,/Haushaltsausgaben fehlen/);
 assert.doesNotMatch(output,/Modellbudget dieser Lebensmonate/);
 dom.window.close();
});
test('bad hypothetical costs show a local error without changing data or losing input focus',()=>{
 const {dom,doc,ui,errors}=setup();
 ui.changeValue('goalCare',18);ui.changeValue('childcareStart',15);
 const original=JSON.stringify(ui.getState());
 const input=doc.getElementById('v312LostWage');
 input.focus();change(doc,'v312LostWage','100.001');
 assert.equal(doc.activeElement,input);
 assert.match(doc.getElementById('v312ImpactResult').textContent,/maximal zwei Nachkommastellen/);
 assert.equal(JSON.stringify(ui.getState()),original);
 assert.deepEqual(errors,[]);dom.window.close();
});
test('switching a fictional plan clears hypothetical inputs without transferring them to personal plan',()=>{
 const {dom,doc,ui}=setup();
 ui.changeValue('goalCare',18);ui.changeValue('childcareStart',15);
 change(doc,'v312LostWage','300');
 doc.querySelector('[data-v38-template="long18"]').click();
 ui.changeValue('childcareStart',15);
 assert.equal(doc.getElementById('v312LostWage').value,'');
 assert.match(doc.getElementById('v312ImpactResult').textContent,/Noch keine eigenen finanziellen Annahmen/);
 dom.window.close();
});
test('the recorded cash timeline fills unknown months as missing records, never expected future payments',()=>{
 const {dom,doc,ui,errors}=setup();
 ui.changeValue('bankLedger',[
  {id:'a',paymentDate:'2026-05-01',amount:100,category:'wage'},
  {id:'b',paymentDate:'2026-07-01',amount:-150,category:'childcare'}
 ]);
 const summary=doc.getElementById('bankSummary').textContent;
 assert.match(summary,/2026-05/);
 assert.match(summary,/2026-06/);
 assert.match(summary,/Keine Buchungen erfasst/);
 assert.match(summary,/2026-07/);
 assert.match(summary,/Ohne ausdrücklich eingegebene Anfangsrücklage/);
 assert.doesNotMatch(summary,/2026-08/);
 assert.deepEqual(errors,[]);dom.window.close();
});
test('the optional recorded opening reserve is display-only and cannot be exported or stored',()=>{
 const {dom,doc,ui}=setup();
 ui.changeValue('bankLedger',[
  {id:'a',paymentDate:'2026-05-01',amount:-120.50,category:'household'}
 ]);
 const before=JSON.stringify(ui.getState());
 change(doc,'recordedOpeningReserve','0');
 assert.match(doc.getElementById('bankSummary').textContent,/Der Rechensaldo ist ab 2026-05 zeitweise negativ/);
 assert.match(doc.getElementById('bankSummary').textContent,/keine Kontostands- oder Liquiditätsprognose/);
 assert.equal(JSON.stringify(ui.getState()),before);
 assert.equal(dom.window.localStorage.length,0);
 dom.window.close();
});
test('invalid opening reserve is not silently rounded or accepted',()=>{
 const {dom,doc,ui}=setup();
 ui.changeValue('bankLedger',[{id:'a',paymentDate:'2026-05-01',amount:10,category:'wage'}]);
 change(doc,'recordedOpeningReserve','-200');
 assert.match(doc.getElementById('bankSummary').textContent,/Anfangsrücklage/);
 dom.window.close();
});


test('confirmed reset clears temporary reserve and the bank ledger without keeping a false cash balance',()=>{
 const {dom,doc,ui,errors}=setup();
 ui.changeValue('bankLedger',[{id:'a',paymentDate:'2026-05-01',amount:-50,category:'household'}]);
 change(doc,'recordedOpeningReserve','200');
 assert.equal(doc.getElementById('recordedOpeningReserve').value,'200');
 doc.getElementById('btnReset').click();
 assert.equal(doc.getElementById('recordedOpeningReserve').value,'');
 assert.equal(ui.getState().bankLedger.length,0);
 assert.match(doc.getElementById('bankSummary').textContent,/Keine tatsächlichen Zahlungseingänge oder Ausgaben erfasst/);
 assert.deepEqual(errors,[]);dom.window.close();
});
