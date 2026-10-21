import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {JSDOM,VirtualConsole} from 'jsdom';
const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');
function setup(){
 const errors=[],vc=new VirtualConsole();vc.on('jsdomError',e=>errors.push(e.message));
 const dom=new JSDOM(html,{url:'https://elternzeit.local/',runScripts:'dangerously',virtualConsole:vc,beforeParse(w){w.scrollTo=()=>{};w.alert=()=>{};}});
 return {dom,doc:dom.window.document,ui:dom.window.__elternzeitTest,app:dom.window.__elternzeitV3,errors};
}
test('contextual information uses real life-month dates and never changes financial or legal decisions',()=>{
 const t=setup();t.ui.changeValue('date','2026-01-31');
 const original=JSON.stringify(t.ui.getState()),budget=JSON.stringify(t.app.budgetScenarios()),status=t.ui.evaluate().validation.status;
 const info=t.app.planningKnowledge();
 assert.equal(t.doc.querySelectorAll('#planningKnowledgeCards details').length,info.cards.length);
 assert.match(t.doc.querySelector('[data-knowledge-id="life-months"]').textContent,/31\.01\.2026 bis 28\.02\.2026/);
 t.doc.querySelector('#planningKnowledge').open=true;
 for(const disclosure of t.doc.querySelectorAll('#planningKnowledgeCards details'))disclosure.open=true;
 assert.equal(JSON.stringify(t.ui.getState()),original);
 assert.equal(JSON.stringify(t.app.budgetScenarios()),budget);
 assert.equal(t.ui.evaluate().validation.status,status);
 assert.deepEqual(t.errors,[]);t.dom.window.close();
});
test('information preserves open disclosures, shows contextual care and has safe official links',()=>{
 const t=setup();const card=t.doc.querySelector('[data-knowledge-id="life-months"]');card.open=true;
 t.ui.changeValue('childcareStart',20);
 assert.equal(t.doc.querySelector('[data-knowledge-id="life-months"]').open,true);
 assert.ok(t.doc.querySelector('[data-knowledge-id="childcare-settling-in"]'));
 t.ui.changeValue('childcareStart',0);
 assert.equal(t.doc.querySelector('[data-knowledge-id="childcare-settling-in"]'),null);
 for(const a of t.doc.querySelectorAll('#planningKnowledgeCards a')){
  const url=new URL(a.href);assert.equal(url.protocol,'https:');assert.equal(url.search,'');
  assert.equal(a.getAttribute('rel'),'noopener noreferrer');
 }
 assert.equal(t.doc.querySelector('a[href="start.html"]').textContent,'Familienstart & Beratung (neuer Tab)');
 for(const link of t.doc.querySelectorAll('a[href^="start.html"]')){assert.equal(link.target,'_blank');assert.equal(link.rel,'noopener noreferrer');}
 t.ui.changeValue('date','2027-05-28');
 assert.match(t.doc.querySelector('#planningKnowledgeCoverage').textContent,/keine pauschale Bestätigung für 2027/);
 assert.notEqual(t.ui.evaluate().validation.status,'PLAUSIBEL_STANDARD');
 assert.deepEqual(t.errors,[]);t.dom.window.close();
});
