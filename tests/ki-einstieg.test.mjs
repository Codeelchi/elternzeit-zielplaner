import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {JSDOM} from 'jsdom';

const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');
function setup(){
 const dom=new JSDOM(html,{url:'https://elternzeit.local/',runScripts:'dangerously',pretendToBeVisual:true,beforeParse(w){w.scrollTo=()=>{};w.alert=()=>{};}});
 return {dom,doc:dom.window.document};
}
test('KI-Vorschlag wird vor Übernahme geprüft und verändert keinen Plan',()=>{
 const {dom,doc}=setup(), original=dom.window.__elternzeitTest.getState().date;
 doc.getElementById('kiInput').value=JSON.stringify({format:'elternzeit-ki-einstieg-v1',geburt:'2026-05-20',netto1:0,netto2:2500,betreuung:18,ausgaben:null});
 doc.getElementById('kiPreview').click();
 assert.match(doc.getElementById('kiStatus').textContent,/0/);
 assert.equal(doc.getElementById('v38Birth').value,'');
 doc.getElementById('kiApply').click();
 assert.equal(doc.getElementById('v38Birth').value,'2026-05-20');
 assert.equal(doc.getElementById('v38NetF').value,'0');
 assert.equal(doc.getElementById('v38Expenses').value,'');
 assert.equal(dom.window.__elternzeitTest.getState().date,original);
 dom.window.close();
});
test('Ungültige und nach Prüfung veränderte Vorschläge werden nicht übernommen',()=>{
 const {dom,doc}=setup(); const input=doc.getElementById('kiInput');
 input.value='{"format":"elternzeit-ki-einstieg-v1","netto1":-1}';
 doc.getElementById('kiPreview').click();
 assert.equal(doc.getElementById('kiApply').disabled,true);
 input.value='{"format":"elternzeit-ki-einstieg-v1","netto1":100}';
 doc.getElementById('kiPreview').click();
 input.value='{"format":"elternzeit-ki-einstieg-v1","netto1":200}';
 input.dispatchEvent(new dom.window.Event('input',{bubbles:true}));
 doc.getElementById('kiApply').click();
 assert.equal(doc.getElementById('v38NetF').value,'');
 dom.window.close();
});
test('Unbekannte Werte lassen Entwürfe bestehen und zusätzliche Felder werden abgewiesen',()=>{
 const {dom,doc}=setup(), input=doc.getElementById('kiInput');
 doc.getElementById('v38NetM').value='1234';
 input.value=JSON.stringify({format:'elternzeit-ki-einstieg-v1',netto1:0,netto2:null});
 doc.getElementById('kiPreview').click();doc.getElementById('kiApply').click();
 assert.equal(doc.getElementById('v38NetM').value,'1234');
 assert.equal(doc.getElementById('localSave').checked,false);
 input.value=JSON.stringify({format:'elternzeit-ki-einstieg-v1',netto1:1,standardCaseConfirmed:true});
 doc.getElementById('kiPreview').click();
 assert.equal(doc.getElementById('kiApply').disabled,true);
 assert.match(doc.getElementById('kiStatus').textContent,/unbekannte Felder/);
 dom.window.close();
});
test('Eingaben ordnen beide Elternteile verständlich und konsistent zu',()=>{
 const {dom,doc}=setup();
 const label=id=>doc.querySelector('label[for="'+id+'"]')?.textContent;
 for(const id of ['monthHoursFather','monthWageFather','monthEgNetFather','axisHoursFather','axisBenefitFather'])assert.match(label(id),/Elternteil 1/);
 for(const id of ['monthHoursMother','monthWageMother','monthEgNetMother','axisHoursMother','axisBenefitMother'])assert.match(label(id),/Elternteil 2/);
 assert.match(doc.querySelector('#builderLeaveM').previousElementSibling.textContent,/Elternteil 2/);
 assert.match(doc.querySelector('#v38PersonalForm').textContent,/gebärende.*Elternteil/s);
 dom.window.close();
});
test('Manipulierte KI-Eingaben scheitern geschlossen und bewahren den Formularentwurf',()=>{
 const {dom,doc}=setup(),input=doc.getElementById('kiInput');
 doc.getElementById('v38NetF').value='1234';
 const invalid=[
  '{"format":"elternzeit-ki-einstieg-v1","geburt":"2026-02-30"}',
  '{"format":"elternzeit-ki-einstieg-v1","netto1":"<img src=x onerror=alert(1)>"}',
  '{"format":"elternzeit-ki-einstieg-v1","betreuung":17}',
  '{"format":"elternzeit-ki-einstieg-v1","ausgaben":100001}',
  '{"format":"elternzeit-ki-einstieg-v1","__proto__":{"netto1":5}}',
  '{"format":"elternzeit-ki-einstieg-v1","netto1":null}',
 ];
 for(const value of invalid){
  input.value=value;doc.getElementById('kiPreview').click();
  assert.equal(doc.getElementById('kiApply').disabled,true,value);
  assert.match(doc.getElementById('kiStatus').textContent,/nicht übernommen/);
  assert.equal(doc.getElementById('v38NetF').value,'1234');
 }
 assert.equal(doc.querySelector('#kiStatus img'),null);
 dom.window.close();
});
