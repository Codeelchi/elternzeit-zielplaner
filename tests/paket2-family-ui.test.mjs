import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {JSDOM,VirtualConsole} from 'jsdom';

const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');
function setup(){
 const errors=[],console=new VirtualConsole();console.on('jsdomError',err=>errors.push(err.message));
 const dom=new JSDOM(html,{url:'https://elternzeit.local/',runScripts:'dangerously',pretendToBeVisual:true,virtualConsole:console,
 beforeParse(w){w.scrollTo=()=>{};w.alert=()=>{};w.confirm=()=>true;w.URL.createObjectURL=()=>'';w.URL.revokeObjectURL=()=>{};}});
 return {dom,doc:dom.window.document,ui:dom.window.__elternzeitTest,v42:dom.window.__familienzeitV42,errors};
}
const text=(d,sel)=>d.querySelector(sel)?.textContent||'';

test('month card controls navigate the shared timeline within its boundaries without changing the plan',()=>{
 const t=setup(),d=t.doc;
 const before=JSON.parse(JSON.stringify(t.ui.getState()));
 assert.match(text(d,'#v42MonthPosition'),/3.*24/);
 d.getElementById('v42NextMonth').click();
 assert.equal(t.ui.getState().month,4);
 assert.match(text(d,'#v42MonthDetail h4'),/LM 4/);
 const after=JSON.parse(JSON.stringify(t.ui.getState()));
 delete before.month;delete after.month;
 assert.deepEqual(after,before);
 d.querySelector('[data-v42-month="1"]').click();
 assert.equal(d.getElementById('v42PreviousMonth').disabled,true);
 d.querySelector('[data-v42-month="24"]').click();
 assert.equal(d.getElementById('v42NextMonth').disabled,true);
 assert.deepEqual(t.errors,[]);t.dom.window.close();
});
test('comparison cards present the same assumptions and metrics for current and saved plans',()=>{
 const t=setup(),d=t.doc;
 d.getElementById('v42VariantName').value='Familienzeit';d.getElementById('v42Save').click();
 const cards=d.querySelectorAll('.v42-compare-card');
 assert.equal(cards.length,2);
 assert.match(cards[0].textContent,/Aktueller Plan/);
 assert.match(cards[1].textContent,/Familienzeit/);
 for(const card of cards){assert.match(card.textContent,/Einnahmen vor Kosten/);assert.match(card.textContent,/Nicht vergleichbar/);assert.match(card.textContent,/Kein Bewilligungsnachweis/);}
 assert.match(d.querySelector('.v42-compare-note').textContent,/LM 1–24/);
 t.dom.window.close();
});
test('timeline uses the real evaluated income, status and missing cost semantics for the selected LM',()=>{
 const t=setup(),d=t.doc,rows=t.ui.evaluate().rows;
 assert.equal(d.querySelectorAll('#v42Timeline button[data-v42-month]').length,24);
 assert.equal(d.querySelectorAll('#v42Timeline tbody tr').length,5);
 assert.equal(d.querySelector('#v42MonthDetail h4').textContent.startsWith('LM 3'),true);
 assert.match(text(d,'#v42MonthDetail'),/Nicht berechenbar/);
 assert.equal(rows[2].lm,3);
 assert.match(text(d,'#v42MonthDetail'),/Basiselterngeld ohne Arbeit/);
 assert.match(text(d,'#v42Timeline'),/Nicht zugeordnet|Offen/);
 assert.equal(t.v42.state().count,0);
 assert.deepEqual(t.errors,[]);
 t.dom.window.close();
});
test('keyboard month selection updates existing planner without resetting focus or writing comparisons',()=>{
 const t=setup(),d=t.doc;
 const b=d.querySelector('[data-v42-month="3"]');b.focus();
 b.dispatchEvent(new t.dom.window.KeyboardEvent('keydown',{key:'ArrowRight',bubbles:true,cancelable:true}));
 assert.equal(t.ui.getState().month,4);
 assert.equal(d.querySelector('[data-v42-month="4"]').getAttribute('aria-pressed'),'true');
 assert.equal(d.activeElement.dataset.v42Month,'4');
 assert.match(text(d,'#v42MonthDetail h4'),/LM 4/);
 d.querySelector('[data-v42-month="4"]').dispatchEvent(new t.dom.window.KeyboardEvent('keydown',{key:'Home',bubbles:true}));
 assert.equal(t.ui.getState().month,1);
 d.querySelector('[data-v42-month="1"]').dispatchEvent(new t.dom.window.KeyboardEvent('keydown',{key:'End',bubbles:true}));
 assert.equal(t.ui.getState().month,24);
 assert.equal(t.v42.state().count,0);
 assert.deepEqual(t.errors,[]);
 t.dom.window.close();
});
test('up to three read-only snapshots retain the previous figures; no active state mutation on saving',()=>{
 const t=setup(),d=t.doc;
 const first=JSON.stringify(t.ui.getState());
 const activeFirst=d.querySelector('#v42Comparison tbody tr').textContent;
 d.getElementById('v42VariantName').value='Basis-Plan';
 d.getElementById('v42Save').click();
 assert.equal(JSON.stringify(t.ui.getState()),first);
 assert.deepEqual(Array.from(t.v42.state().labels),['Basis-Plan']);
 assert.equal(t.v42.state().persisted,false);
 assert.equal(d.querySelectorAll('#v42Comparison tbody tr').length,2);
 assert.match(text(d,'#v42Comparison'),/Nicht vergleichbar/);
 assert.equal(d.querySelector('#v42Comparison tbody tr').textContent,activeFirst);
 t.ui.chooseModel('father18');
 assert.equal(t.v42.state().count,1);
 assert.notEqual(d.querySelectorAll('#v42Comparison tbody tr')[0].textContent,d.querySelectorAll('#v42Comparison tbody tr')[1].textContent);
 d.getElementById('v42Save').click();
 t.ui.chooseModel('father24');d.getElementById('v42Save').click();
 assert.equal(t.v42.state().count,3);
 assert.equal(d.getElementById('v42Save').disabled,true);
 assert.equal(d.querySelectorAll('#v42Comparison tbody tr').length,4);
 d.querySelector('[data-v42-remove="1"]').click();
 assert.equal(t.v42.state().count,2);
 assert.equal(d.getElementById('v42Save').disabled,false);
 d.getElementById('v42Clear').click();
 assert.equal(t.v42.state().count,0);
 assert.equal(d.getElementById('v42Clear').disabled,true);
 assert.deepEqual(t.errors,[]);
 t.dom.window.close();
});
test('duplicate snapshots are blocked, state changes do not modify saved rows, and costs are not silently zero',()=>{
 const t=setup(),d=t.doc;
 d.getElementById('v42Save').click();d.getElementById('v42Save').click();
 assert.equal(t.v42.state().count,1);
 assert.match(text(d,'#v42Feedback'),/bereits/);
 t.ui.changeValue('expenses',0);
 assert.match(text(d,'#v42Comparison tbody tr:nth-child(1)'),/€|0,00/);
 assert.match(text(d,'#v42Comparison tbody tr:nth-child(2)'),/Nicht vergleichbar/);
 assert.equal(t.v42.state().count,1);
 assert.equal(t.ui.getState().expenses,0);
 assert.deepEqual(t.errors,[]);
 t.dom.window.close();
});
test('confirmed reset and successful import lifecycle discard volatile snapshots, but canceled reset does not',()=>{
 const t=setup(),d=t.doc;
 d.getElementById('v42Save').click();
 t.dom.window.confirm=()=>false;
 d.getElementById('btnReset').click();
 assert.equal(t.v42.state().count,1);
 t.dom.window.confirm=()=>true;
 d.getElementById('btnReset').click();
 assert.equal(t.v42.state().count,0);
 d.getElementById('v42Save').click();
 t.v42.onImported();
 assert.equal(t.v42.state().count,0);
 assert.match(text(d,'#v42Feedback'),/Importiert/);
 assert.deepEqual(t.errors,[]);
 t.dom.window.close();
});
test('comparison horizon is always the active shared timeframe and reveals unsupported 2027 status',()=>{
 const t=setup(),d=t.doc;
 d.getElementById('v42Save').click();
 t.ui.changeValue('horizon',18);
 assert.match(text(d,'#v42Comparison'),/LM 1–18/);
 assert.equal(d.querySelectorAll('#v42Timeline button[data-v42-month]').length,18);
 assert.equal(d.querySelectorAll('#v42Comparison tbody tr').length,2);
 assert.match(text(d,'#v42Comparison'),/Kein Bewilligungsnachweis/);
 assert.deepEqual(t.errors,[]);
 t.dom.window.close();
});

test('timeline filter, summary and keyboard helpers stay view-only',()=>{
 const t=setup(),d=t.doc;
 assert.equal(t.v42.nextMonthForKey(5,'Home',24),1);
 assert.equal(t.v42.nextMonthForKey(5,'End',24),24);
 assert.equal(t.v42.nextMonthForKey(1,'ArrowLeft',24),1);
 assert.equal(t.v42.nextMonthForKey(24,'ArrowRight',24),24);
 const before=JSON.stringify(t.ui.getState());
 d.querySelector('[data-v42-filter="income"]').click();
 assert.equal(d.querySelector('[data-v42-filter="income"]').getAttribute('aria-pressed'),'true');
 assert.equal(d.querySelector('[data-v42-filter="all"]').getAttribute('aria-pressed'),'false');
 assert.equal(d.getElementById('v42Timeline').dataset.filter,'income');
 assert.equal(d.querySelectorAll('#v42Timeline tbody tr').length,5);
 assert.match(text(d,'#v42FilterSummary'),/Einnahmen vor Kosten/);
 assert.equal(JSON.stringify(t.ui.getState()),before);
 assert.deepEqual(t.errors,[]);t.dom.window.close();
});
