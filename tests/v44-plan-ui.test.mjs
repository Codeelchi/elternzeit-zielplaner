import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {JSDOM,VirtualConsole} from 'jsdom';
const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');

function setup(){
 const errors=[],vc=new VirtualConsole();vc.on('jsdomError',e=>errors.push(e.message));
 const dom=new JSDOM(html,{url:'https://example.invalid/',runScripts:'dangerously',pretendToBeVisual:true,virtualConsole:vc,
  beforeParse(w){w.scrollTo=()=>{};w.confirm=()=>true;w.alert=()=>{};w.print=()=>{w.printCalls=(w.printCalls||0)+1;};
   w.URL.createObjectURL=()=>'';w.URL.revokeObjectURL=()=>{};}});
 return {dom,d:dom.window.document,ui:dom.window.__elternzeitTest,hub:dom.window.__planActionsV44,errors};
}
const press=(obj,selector)=>obj.d.querySelector(selector).click();
const change=(obj,selector,value)=>{
 const el=obj.d.querySelector(selector);el.value=value;el.dispatchEvent(new obj.dom.window.Event('change',{bubbles:true}));return el;
};
const text=(o,sel)=>o.d.querySelector(sel)?.textContent||'';

test('task summary is sourced from the original application guide with source checks',()=>{
 const x=setup();
 assert.ok(x.hub);
 assert.ok(x.d.querySelector('#v44TaskList article'));
 assert.match(text(x,'#v44TaskOverview'),/quellenbasierte Aufgaben/);
 assert.match(text(x,'#v44TaskOverview'),/Quellenstand/);
 assert.match(text(x,'#v44TaskList'),/Quelle \(Stand/);
 assert.equal(x.d.querySelector('#v44TaskHub [data-v44-filter="open"]').getAttribute('aria-pressed'),'true');
 assert.equal(x.hub.state().persisted,false);
 assert.deepEqual(x.errors,[]);
 x.dom.window.close();
});
test('changing a compact task updates exactly the existing session checklist state and retains focus',()=>{
 const x=setup(),ctl=x.d.querySelector('#v44TaskList select[data-v44-task-id]'),id=ctl.dataset.v44TaskId;
 const before=JSON.stringify(x.ui.getState());
 ctl.focus();
 change(x,'#'+ctl.id,'ready');
 assert.equal(x.hub.state().statusOf(id),'ready');
 assert.equal(x.d.querySelector('#v44TaskHub [data-v44-filter="open"]').getAttribute('aria-pressed'),'true');
 assert.equal(x.d.querySelector('#v44TaskList article[data-v44-task="'+id+'"]'),null);
 const original=[...x.d.querySelectorAll('[data-v315-task]')].find(el=>el.dataset.v315Task===id);
 assert.equal(original?.value,'ready');
 assert.ok(x.d.activeElement.matches('#v44TaskList select, #v44TaskHub button[data-v44-filter]'));
 assert.equal(JSON.stringify(x.ui.getState()),before);
 assert.deepEqual(x.errors,[]);
 x.dom.window.close();
});
test('existing full checklist changes are reflected in compact filter and printable report',()=>{
 const x=setup(),select=x.d.querySelector('#applicationChecklist [data-v315-task]'),id=select.dataset.v315Task;
 change(x,'#'+select.id,'done');
 assert.equal(x.hub.state().statusOf(id),'done');
 press(x,'#v44TaskHub [data-v44-filter="done"]');
 assert.equal(x.d.querySelector('#v44TaskHub [data-v44-filter="done"]').getAttribute('aria-pressed'),'true');
 assert.ok(x.d.querySelector('#v44TaskHub [data-v44-task="'+id+'"]'));
 const report=x.hub.preview();
 assert.ok(report.includes('Offene Schritte'));
 assert.ok(report.includes('„Erledigt“ heißt lediglich selbst markiert'));
 assert.equal(x.d.querySelectorAll('#v44ReportPreview [data-v44-page]').length,2);
 assert.deepEqual(x.errors,[]);
 x.dom.window.close();
});
test('report preview keeps unknown expenses unknown, exhibits two fixed pages and source status',()=>{
 const x=setup(),before=JSON.stringify(x.ui.getState());
 press(x,'#v44Preview');
 assert.equal(x.d.querySelector('#v44ReportPreview').hidden,false);
 assert.equal(x.d.querySelector('#v44Preview').getAttribute('aria-expanded'),'true');
 assert.equal(x.d.querySelectorAll('#v44ReportPreview [data-v44-page]').length,2);
 assert.match(text(x,'#v44ReportPreview [data-v44-page="1"]'),/Nicht berechenbar/);
 assert.match(text(x,'#v44ReportPreview'),/keine amtliche/);
 assert.match(text(x,'#v44ReportPreview'),/Quellenstand/);
 assert.equal(JSON.stringify(x.ui.getState()),before);
 press(x,'#v44Preview');
 assert.equal(x.d.querySelector('#v44ReportPreview').hidden,true);
 assert.deepEqual(x.errors,[]);
 x.dom.window.close();
});
test('print button only prepares a report, invokes browser print, and afterprint restores UI',()=>{
 const x=setup(),before=JSON.stringify(x.ui.getState());
 press(x,'#v44Print');
 assert.equal(x.dom.window.printCalls,1);
 assert.equal(x.d.body.classList.contains('v44-print-active'),true);
 assert.equal(x.d.querySelectorAll('#v44PrintSheet [data-v44-page]').length,2);
 assert.equal(x.d.querySelector('#v44PrintSheet').getAttribute('aria-hidden'),'true');
 assert.equal(x.d.querySelector('#v44ReportPreview').hidden,false);
 x.dom.window.dispatchEvent(new x.dom.window.Event('afterprint'));
 assert.equal(x.d.body.classList.contains('v44-print-active'),false);
 assert.equal(x.d.querySelector('#v44PrintSheet').textContent,'');
 assert.equal(JSON.stringify(x.ui.getState()),before);
 assert.deepEqual(x.errors,[]);
 x.dom.window.close();
});
test('known costs and model changes refresh an open report, but do not modify those changes',()=>{
 const x=setup();
 press(x,'#v44Preview');
 assert.match(text(x,'#v44ReportPreview [data-v44-page="1"]'),/Nicht berechenbar/);
 x.ui.changeValue('expenses',2750);
 const state=JSON.stringify(x.ui.getState());
 assert.doesNotMatch(text(x,'#v44ReportPreview [data-v44-page="1"]'),/Haushaltsausgaben unbekannt/);
 assert.match(text(x,'#v44ReportPreview [data-v44-page="1"]'),/2.750,00/);
 assert.equal(JSON.stringify(x.ui.getState()),state);
 x.ui.changeValue('horizon',36);
 assert.match(text(x,'#v44ReportPreview [data-v44-page="1"]'),/Lebensmonate 1–36/);
 assert.equal(x.d.querySelectorAll('#v44ReportPreview [data-v44-page="1"] tbody tr').length,6);
 assert.deepEqual(x.errors,[]);
 x.dom.window.close();
});
test('confirmed reset removes task markers; cancelled reset leaves markers untouched',()=>{
 const x=setup(),ctl=x.d.querySelector('#v44TaskList select[data-v44-task-id]'),id=ctl.dataset.v44TaskId;
 change(x,'#'+ctl.id,'ready');
 x.dom.window.confirm=()=>false;
 press(x,'#btnReset');
 assert.equal(x.hub.state().statusOf(id),'ready');
 x.dom.window.confirm=()=>true;
 press(x,'#btnReset');
 assert.equal(x.hub.state().statusOf(id),'open');
 assert.equal(x.d.querySelector('#v44ReportPreview').hidden,true);
 assert.deepEqual(x.errors,[]);
 x.dom.window.close();
});
test('unknown/invalid date does not fabricate tasks, and PDF button will not print unsupported inputs',()=>{
 const x=setup();
 x.ui.changeValue('date','2026-02-30');
 assert.match(text(x,'#v44TaskOverview'),/Keine verlässlich ableitbare Aufgabenliste/);
 press(x,'#v44Print');
 assert.equal(x.dom.window.printCalls,undefined);
 assert.equal(x.d.body.classList.contains('v44-print-active'),false);
 assert.match(text(x,'#v44ReportFeedback'),/nicht berechenbar/);
 assert.deepEqual(x.errors,[]);
 x.dom.window.close();
});
test('future cohort task summary and report both signal need to check future laws',()=>{
 const x=setup();
 x.ui.changeValue('date','2027-12-15');
 assert.match(text(x,'#v44TaskOverview'),/Geburt nach Quellenstand/);
 const page=x.hub.preview();
 assert.match(page,/Geburtsdatum nach dem Quellenprüfstand/);
 assert.ok(page.includes('Rechtsstand'));
 assert.deepEqual(x.errors,[]);
 x.dom.window.close();
});
