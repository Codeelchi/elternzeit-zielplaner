import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {JSDOM,VirtualConsole} from 'jsdom';
// Exercise current source without rewriting the shared offline artifact.
let html=readFileSync(new URL('../index.html',import.meta.url),'utf8');
for(const [start,end,file]of [
 ['<!-- V38_MARKUP_START -->','<!-- V38_MARKUP_END -->','v38-quickstart.html'],
 ['/* V38_RUNTIME_START */','/* V38_RUNTIME_END */','v38-quickstart.js']]){
 const i=html.indexOf(start),j=html.indexOf(end);
 html=html.slice(0,i)+start+'\n'+readFileSync(new URL('../src/'+file,import.meta.url),'utf8')+'\n'+html.slice(j);
}
function setup(){
 const errors=[],vc=new VirtualConsole();vc.on('jsdomError',e=>errors.push(e.message));
 const dom=new JSDOM(html,{url:'https://elternzeit.local/',runScripts:'dangerously',pretendToBeVisual:true,virtualConsole:vc,
  beforeParse(w){w.scrollTo=()=>{};w.alert=()=>{};w.confirm=()=>true;w.URL.createObjectURL=()=>'';w.URL.revokeObjectURL=()=>{};}});
 return {dom,doc:dom.window.document,ui:dom.window.__elternzeitTest,quick:dom.window.__elternzeitV38,errors};
}
function start(t){t.doc.querySelector('[data-v38-template="long18"]').click();}
function step(t,key){return t.quick.nextSteps().find(x=>x.key===key);}

test('next steps reveal unknown income limit, family confirmation, estimates and missing costs without certification',()=>{
 const t=setup();start(t);
 for(const key of ['standard','income-limit','netto','budget','rules'])assert.ok(step(t,key),key);
 assert.match(t.doc.querySelector('.v310-next').textContent,/keine Freigabe oder Antragsprüfung/);
 assert.equal(t.ui.getState().zve,'');assert.equal(t.ui.getState().standardCaseConfirmed,null);
 assert.equal(t.ui.getState().expenses,'');assert.deepEqual(t.errors,[]);t.dom.window.close();
});
test('action navigates to currently hidden regional view and focuses taxable income without changing household data',()=>{
 const t=setup();start(t);const before=JSON.stringify(t.ui.getState());
 t.doc.querySelector('[data-v310-focus="zve"]').click();
 assert.equal(t.doc.querySelector('.slide.active').id,'slide-region');
 assert.equal(t.doc.activeElement.id,'zve');
 assert.equal(JSON.stringify(t.ui.getState()),before);
 assert.deepEqual(t.errors,[]);t.dom.window.close();
});
test('explicit zero expenses resolves missing-budget step while clearing them restores the task',()=>{
 const t=setup();start(t);assert.ok(step(t,'budget'));
 t.ui.changeValue('expenses',0);assert.equal(step(t,'budget'),undefined);
 t.ui.changeValue('expenses','');assert.ok(step(t,'budget'));
 assert.equal(t.ui.getState().expenses,'');assert.deepEqual(t.errors,[]);t.dom.window.close();
});
test('financial task remains when a supposedly known Elterngeld-Netto is empty',()=>{
 const t=setup();start(t);t.ui.s.incomeEntryMode='known';
 t.ui.changeValue('egNetFather','');
 assert.ok(step(t,'netto'));assert.equal(t.ui.getState().egNetFather,'');
 assert.deepEqual(t.errors,[]);t.dom.window.close();
});
test('care task names actual first coverage gap and links to plan instead of silently replacing it',()=>{
 const t=setup();t.doc.querySelector('[data-v38-template="classic"]').click();
 t.ui.s.goalCare=18;t.quick.refresh();
 assert.match(step(t,'care').label,/Lebensmonat 15/);
 const before=JSON.stringify(t.ui.getState().schedule);
 t.doc.querySelector('[data-v38-goto="slide-4"]').click();
 assert.equal(t.doc.querySelector('.slide.active').id,'slide-4');
 assert.equal(JSON.stringify(t.ui.getState().schedule),before);
 assert.deepEqual(t.errors,[]);t.dom.window.close();
});
test('income help distinguishes separate net concepts and links out without exporting data',()=>{
 const t=setup(),help=t.doc.querySelector('.v310-netto-help');
 assert.match(help.textContent,/amtlich pauschalierte Rechengröße/);
 assert.match(help.textContent,/leeres Feld bedeutet unbekannt/);
 const link=help.querySelector('a');
 assert.equal(link.href,'https://familienportal.de/familienportal/rechner-antraege/elterngeldrechner');
 assert.equal(link.rel,'noopener noreferrer');assert.ok(!link.href.includes('?'));
 assert.equal(t.doc.querySelector('.v310-next'),null);
 assert.deepEqual(t.errors,[]);t.dom.window.close();
});
