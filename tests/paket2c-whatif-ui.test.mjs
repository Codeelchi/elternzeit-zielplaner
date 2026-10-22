import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {JSDOM,VirtualConsole} from 'jsdom';

const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');
function setup(){
 const errors=[],console=new VirtualConsole();console.on('jsdomError',e=>errors.push(e.message));
 const dom=new JSDOM(html,{url:'https://example.invalid/',runScripts:'dangerously',pretendToBeVisual:true,virtualConsole:console,
  beforeParse(w){w.scrollTo=()=>{};w.confirm=()=>true;w.alert=()=>{};w.URL.createObjectURL=()=>'';w.URL.revokeObjectURL=()=>{};}});
 const d=dom.window.document;
 const inp=(id,value)=>{const field=d.getElementById(id);field.value=String(value);field.dispatchEvent(new dom.window.Event('input',{bubbles:true}));return field;};
 return {dom,d,inp,ui:dom.window.__elternzeitTest, whatif:dom.window.__whatIfV43,variant:dom.window.__familienzeitV42,errors};
}
const text=(d,selector)=>d.querySelector(selector)?.textContent||'';
test('new module mounts after the old dashboards, starts neutral, and does not mutate active plan',()=>{
 const t=setup(),before=JSON.stringify(t.ui.getState());
 assert.ok(t.whatif);
 assert.equal(t.d.querySelectorAll('#v43Result .v43-panel').length,2);
 assert.match(text(t.d,'#v43Result'),/keine Bewilligung/i);
 assert.equal(t.whatif.state().appliedToPlan,false);
 assert.equal(t.whatif.state().persisted,false);
 assert.equal(t.d.getElementById('v43Delay').disabled,false);
 assert.equal(t.d.getElementById('v43FatherHours').disabled,true);
 assert.equal(JSON.stringify(t.ui.getState()),before);
 assert.deepEqual(t.errors,[]);
 t.dom.window.close();
});
test('neutral scenario keeps original interpolated life-month values and reports zero affected months',()=>{
 const t=setup();
 t.ui.changeValue('expenses',2100);
 assert.match(text(t.d,'#v43Result .v43-delta'),/0,00/);
 assert.match(text(t.d,'#v43Result .v43-delta'),/in 0 Lebensmonaten/);
 assert.equal(t.d.querySelectorAll('#v43Result .v43-panel').length,2);
 assert.deepEqual(t.errors,[]);
 t.dom.window.close();
});
test('Kita shift 0..6: explicit zero values unlock income delta, but not unknown household remainder',()=>{
 const t=setup(),before=JSON.stringify(t.ui.getState());
 t.inp('v43Delay',2);
 assert.match(text(t.d,'#v43Result'),/Netto-Ausfall je Verzögerungsmonat/);
 assert.match(text(t.d,'#v43Result'),/Ersatzbetreuungskosten/);
 assert.match(text(t.d,'#v43Result'),/Nicht berechenbar/);
 t.inp('v43BridgeWage',0);t.inp('v43BridgeCare',0);
 assert.doesNotMatch(text(t.d,'#v43Result'),/Für einen vollständigen finanziellen Vergleich fehlen/);
 assert.match(text(t.d,'#v43Result'),/LM 19 → angenommen LM 21/);
 assert.match(text(t.d,'#v43Result'),/Gesamtbudget nicht vergleichbar/);
 assert.equal(JSON.stringify(t.ui.getState()),before);
 assert.equal(t.variant.state().count,0);
 assert.deepEqual(t.errors,[]);
 t.dom.window.close();
});
test('explicit expenses allow money comparison, and input changes remain a hypothesis only',()=>{
 const t=setup();t.ui.changeValue('expenses',2100);
 const afterKnown=JSON.stringify(t.ui.getState());
 t.inp('v43Delay',3);t.inp('v43BridgeWage',100);t.inp('v43BridgeCare',50);
 t.d.getElementById('v43WaiveFees').click();
 assert.match(text(t.d,'#v43Result'),/Gesamtrest-Differenz/);
 assert.match(text(t.d,'#v43Result'),/LM 19 → angenommen LM 22/);
 assert.equal(JSON.stringify(t.ui.getState()),afterKnown);
 assert.equal(t.ui.getState().childcareStart,19);
 assert.equal(t.ui.getState().storageConsent,false);
 assert.ok(t.d.querySelector('#v43Detail'));
 t.d.querySelector('#v43Detail').open=true;
 t.inp('v43ExpensesDelta',20);
 assert.equal(t.d.querySelector('#v43Detail').open,true);
 assert.deepEqual(t.errors,[]);
 t.dom.window.close();
});
test('part-time hours are only illustrative until signed manual net change is provided',()=>{
 const t=setup();t.ui.chooseModel('hybridWork');
 assert.equal(t.d.getElementById('v43FatherHours').disabled,false);
 const active=JSON.stringify(t.ui.getState());
 t.inp('v43FatherHours',20);
 assert.match(text(t.d,'#v43Result'),/Nettoänderung für die neuen Teilzeitstunden von Elternteil 1/);
 assert.match(text(t.d,'#v43Result'),/Nicht berechenbar/);
 t.inp('v43FatherNet',-120);
 assert.doesNotMatch(text(t.d,'#v43Result'),/Für einen vollständigen finanziellen Vergleich fehlen/);
 assert.equal(JSON.stringify(t.ui.getState()),active);
 assert.match(text(t.d,'#v43Result'),/Elterngeldbeträge? .* unverändert/i);
 assert.deepEqual(t.errors,[]);
 t.dom.window.close();
});
test('invalid expenses/unsupported hours show an error rather than an alleged financial result',()=>{
 const t=setup();t.ui.changeValue('expenses',500);const active=JSON.stringify(t.ui.getState());
 t.inp('v43ExpensesDelta',-900);
 assert.match(text(t.d,'#v43Result'),/Szenario nicht berechenbar/);
 assert.match(text(t.d,'#v43Result'),/dürfen nicht negativ werden/);
 t.inp('v43ExpensesDelta',0);
 t.inp('v43FatherHours',28); // Disabled because no part-time in this example, but injected draft still must fail closed.
 assert.match(text(t.d,'#v43Result'),/keine Teilzeitmonate/);
 assert.equal(JSON.stringify(t.ui.getState()),active);
 assert.deepEqual(t.errors,[]);
 t.dom.window.close();
});
test('scenario-only reset does not alter active plan or previously remembered variant',()=>{
 const t=setup();t.d.getElementById('v42Save').click();assert.equal(t.variant.state().count,1);
 t.ui.changeValue('expenses',1500);
 const before=JSON.stringify(t.ui.getState());
 t.inp('v43Delay',1);t.inp('v43BridgeWage',0);t.inp('v43BridgeCare',0);
 t.inp('v43WageRisk',15);t.inp('v43ExpensesDelta',100);
 t.d.getElementById('v43Reset').click();
 assert.equal(t.whatif.state().assumptions.delayMonths,0);
 assert.equal(t.whatif.state().assumptions.wageDownsidePercent,0);
 assert.equal(t.whatif.state().assumptions.expensesDelta,0);
 assert.equal(t.whatif.state().assumptions.bridgeWageLoss,null);
 assert.equal(t.variant.state().count,1);
 assert.equal(JSON.stringify(t.ui.getState()),before);
 assert.deepEqual(t.errors,[]);
 t.dom.window.close();
});
test('cancelled full reset keeps assumptions; confirmed reset and successful import clear them',()=>{
 const t=setup();
 t.inp('v43WageRisk',10);
 t.dom.window.confirm=()=>false;t.d.getElementById('btnReset').click();
 assert.equal(t.whatif.state().assumptions.wageDownsidePercent,10);
 t.dom.window.confirm=()=>true;t.d.getElementById('btnReset').click();
 assert.equal(t.whatif.state().assumptions.wageDownsidePercent,0);
 t.inp('v43WageRisk',15);
 t.whatif.onImported();
 assert.equal(t.whatif.state().assumptions.wageDownsidePercent,0);
 assert.match(text(t.d,'#v43Status'),/Plan importiert/);
 assert.deepEqual(t.errors,[]);
 t.dom.window.close();
});
test('future years retain the original non-certifying validation status through all hypotheses',()=>{
 const t=setup();t.inp('v43WageRisk',30);
 const textOut=text(t.d,'#v43Result');
 assert.match(textOut,/keine Bewilligung/i);
 assert.match(textOut,/Rechtsstand 2027.*ungeprüft/i);
 assert.doesNotMatch(textOut,/amtlich geprüft|garantiertes Optimum/i);
 assert.deepEqual(t.errors,[]);
 t.dom.window.close();
});
