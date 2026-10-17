import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {JSDOM,VirtualConsole} from 'jsdom';
const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');
function setup() {
 const errors=[],vc=new VirtualConsole();vc.on('jsdomError',error=>errors.push(error.message));
 const dom=new JSDOM(html,{url:'https://elternzeit.local/',runScripts:'dangerously',pretendToBeVisual:true,virtualConsole:vc,
  beforeParse(w){w.scrollTo=()=>{};w.alert=()=>{};w.confirm=()=>true;w.URL.createObjectURL=()=>'';w.URL.revokeObjectURL=()=>{};}});
 const doc=dom.window.document,ui=dom.window.__elternzeitTest;
 assert.ok(ui,'offline HTML booted');
 doc.querySelector('[data-v38-template="classic"]').click();
 const change=(id,value,type='input')=>{
  const el=doc.getElementById(id);assert.ok(el,id);el.value=String(value);
  el.dispatchEvent(new dom.window.Event(type,{bubbles:true}));
 };
 const add=(date,amount,direction,category)=>{
  change('v313PaymentDate',date);change('v313PaymentAmount',amount);
  change('v313PaymentDirection',direction,'change');change('v313PaymentCategory',category,'change');
  doc.getElementById('v313PaymentAdd').click();
 };
 return {dom,doc,ui,change,add,errors};
}
test('separately assumed payment calendar changes liquidity when a receipt is delayed, without editing family model',()=>{
 const {dom,doc,ui,change,add,errors}=setup();
 const original=JSON.stringify(ui.getState());
 add('2026-06-05','1000','incoming','elterngeld');
 add('2026-06-06','800','outgoing','household');
 const report=doc.getElementById('v313PaymentResults');
 assert.match(report.textContent,/0,00\s*€/);
 change('v313Delay','7','change');
 assert.match(report.textContent,/800,00\s*€/);
 assert.match(report.textContent,/2026-06-12/);
 assert.match(report.textContent,/keiner dieser Annahmen|keine dieser Annahmen/i);
 assert.equal(JSON.stringify(ui.getState()),original);
 assert.equal(dom.window.localStorage.length,0);
 assert.equal(dom.window.__elternzeitV3.expectedPayments().length,2);
 assert.deepEqual(errors,[]);dom.window.close();
});
test('unknown or invalid assumptions cannot silently add money to the plan',()=>{
 const {dom,doc,ui,change,add}=setup();
 const before=JSON.stringify(ui.getState());
 add('2026-02-30','500','incoming','wage');
 assert.match(doc.getElementById('v313PaymentError').textContent,/Datum/);
 assert.equal(dom.window.__elternzeitV3.expectedPayments().length,0);
 add('2026-06-05','100.005','incoming','wage');
 assert.match(doc.getElementById('v313PaymentError').textContent,/Nachkommastellen/);
 assert.equal(dom.window.__elternzeitV3.expectedPayments().length,0);
 assert.equal(JSON.stringify(ui.getState()),before);
 dom.window.close();
});
test('assumed daily payments are excluded from the recorded ledger and reset clears them',()=>{
 const {dom,doc,ui,change,add}=setup();
 add('2026-06-05',1000,'incoming','kindergeld');
 change('v313Opening','250');
 assert.match(doc.getElementById('bankSummary').textContent,/Keine tatsächlichen Zahlungseingänge/);
 assert.equal(ui.getState().bankLedger.length,0);
 doc.getElementById('btnReset').click();
 assert.equal(dom.window.__elternzeitV3.expectedPayments().length,0);
 assert.equal(doc.getElementById('v313Opening').value,'');
 assert.match(doc.getElementById('v313PaymentResults').textContent,/Noch keine eigenen Zahlungserwartungen/);
 dom.window.close();
});
test('cancel or remove a hypothetical assumption without mutating the underlying plan',()=>{
 const {dom,doc,ui,add}=setup();
 const before=JSON.stringify(ui.getState());
 add('2026-06-05',100,'incoming','other');
 const btn=doc.querySelector('[data-v313-remove]');assert.ok(btn);
 btn.click();
 assert.equal(dom.window.__elternzeitV3.expectedPayments().length,0);
 assert.equal(JSON.stringify(ui.getState()),before);
 dom.window.close();
});
test('insurance and tax source messages distinguish mandatory, voluntary and private coverage',()=>{
 const {dom,doc,change,ui,errors}=setup();
 ui.changeValue('expenses',1200);
 const before=JSON.stringify(ui.getState());
 change('v313InsuranceType','private','change');
 assert.match(doc.getElementById('v313FinanceResults').textContent,/Arbeitgeberzuschuss/);
 assert.match(doc.getElementById('v313FinanceResults').textContent,/Progressionsvorbehalt/);
 change('v313InsuranceIncluded','no','change');
 assert.match(doc.getElementById('v313FinanceResults').textContent,/NICHT in euren Haushaltskosten/);
 assert.equal(JSON.stringify(ui.getState()),before);
 assert.deepEqual(errors,[]);dom.window.close();
});
test('2025 Cologne fee table is a visible historic comparison, NOT an automatically budgeted contribution',()=>{
 const {dom,doc,ui}=setup();
 ui.changeValue('date','2026-05-28');
 ui.changeValue('childcareStart',19);
 ui.changeValue('childcareMode','manual');
 const before=ui.evaluate().rows[18].childcare;
 ui.changeValue('childcareMode','cologne2025');
 const pane=doc.getElementById('v313ColognePreview');
 assert.equal(pane.hidden,false);
 assert.match(pane.textContent,/Historische Tarif-Orientierung/);
 assert.match(pane.textContent,/2027\/2028/);
 assert.match(pane.textContent,/NICHT ins Budget übernommen/);
 assert.equal(ui.evaluate().rows[18].childcare,before);
 assert.ok(pane.querySelector('a[href*="stadt-koeln.de"]'));
 dom.window.close();
});
test('other regions never claim Cologne price validity',()=>{
 const {dom,doc,ui}=setup();
 ui.changeValue('childcareMode','cologne2025');
 ui.changeValue('region','BY');
 assert.equal(doc.getElementById('v313ColognePreview').hidden,true);
 assert.match(doc.getElementById('regionResults').textContent,/KiZ-Lotse/);
 assert.match(doc.getElementById('regionResults').textContent,/Wohngeld-Plus/);
 dom.window.close();
});
