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
const postBirthDestinations=[
 ['Offizielle Checkliste nach der Geburt','https://familienportal.de/familienportal/lebenslagen/schwangerschaft-geburt/checklisten/checkliste-nach-der-geburt-197882'],
 ['Kindergeld beantragen: Informationen und häufige Fragen','https://familienportal.de/familienportal/familienleistungen/kindergeld/faq/wie-wird-kindergeld-beantragt-und-ausgezahlt--124954'],
 ['Mutterschaftsleistungen im Überblick','https://familienportal.de/familienportal/familienleistungen/mutterschaftsleistungen/was-sind-mutterschaftsleistungen-mutterschutzlohn-und-mutterschaftsgeld--124744'],
 ['U-, Z- und J1-Zeiträume anzeigen','https://www.kindergesundheit-info.de/themen/frueherkennung-u1-u9-und-j1/terminrechner-u-z-und-j1-untersuchungen/']
];
test('post-birth orientation contains exactly the approved static official links next to the existing step',()=>{
 const dom=new JSDOM(html),doc=dom.window.document;
 try{
  const group=doc.querySelector('#slide-9 .steps .step #postBirthLinks');
  assert.ok(group);
  assert.equal(group.parentElement.querySelector('strong').textContent,'Nach der Geburt');
  assert.equal(group.previousElementSibling.tagName,'P');
  assert.match(group.previousElementSibling.textContent,/Geburtsdaten und Lebensmonate/);
  assert.equal(group.getAttribute('aria-label'),'Offizielle Orientierung nach der Geburt');
  assert.equal(group.querySelectorAll('input,select,textarea,button,form,script,iframe,img').length,0);
  const links=[...group.querySelectorAll('a')];
  assert.equal(links.length,4);
  links.forEach((link,i)=>{
   assert.equal(link.firstChild.textContent,postBirthDestinations[i][0]);
   assert.equal(link.getAttribute('href'),postBirthDestinations[i][1]);
   const url=new URL(link.href);
   assert.equal(url.protocol,'https:');assert.equal(url.search,'');assert.equal(url.hash,'');
   assert.equal(url.username,'');assert.equal(url.password,'');
   assert.equal(link.target,'_blank');assert.equal(link.getAttribute('rel'),'noopener noreferrer');
   assert.equal(link.querySelector('span').textContent,'öffnet in neuem Tab');
  });
  for(const element of [group,...group.querySelectorAll('*')]){
   for(const attr of element.attributes)assert.doesNotMatch(attr.name,/^on/i);
  }
 }finally{dom.window.close();}
});
test('post-birth links remain value-free after input changes and activation never changes state or storage',()=>{
 const t=setup(),w=t.dom.window;
 try{
  t.ui.changeValue('date','2026-02-14');
  t.ui.changeValue('childcareStart',18);
  const original=JSON.stringify(t.ui.getState()),budget=JSON.stringify(t.app.budgetScenarios()),status=t.ui.evaluate().validation.status;
  const storageBefore=[JSON.stringify(w.localStorage),JSON.stringify(w.sessionStorage)];
  const mutations=[];
  for(const method of ['setItem','removeItem','clear']){
   const originalMethod=w.Storage.prototype[method];
   w.Storage.prototype[method]=function(...args){mutations.push(method);return originalMethod.apply(this,args);};
  }
  const links=[...t.doc.querySelectorAll('#postBirthLinks a')];
  links.forEach((link,i)=>{
   assert.equal(link.getAttribute('href'),postBirthDestinations[i][1]);
   link.addEventListener('click',event=>event.preventDefault(),{once:true});
   link.click();
  });
  assert.equal(JSON.stringify(t.ui.getState()),original);
  assert.equal(JSON.stringify(t.app.budgetScenarios()),budget);
  assert.equal(t.ui.evaluate().validation.status,status);
  assert.deepEqual([JSON.stringify(w.localStorage),JSON.stringify(w.sessionStorage)],storageBefore);
  assert.deepEqual(mutations,[]);assert.deepEqual(t.errors,[]);
 }finally{t.dom.window.close();}
});
test('hero guidance follows the two entry actions without replacing existing warnings or adding focus targets',()=>{
 const t=setup();
 try{
  const actions=t.doc.querySelector('.v38-entry-actions'),guidance=actions.nextElementSibling;
  const text='Vorlagen könnt ihr ohne eigene Eingaben ansehen. Für einen eigenen Modellfall prüft zuerst die Grundangaben und verwendet ausschließlich frei erfundene Testwerte.';
  assert.equal(guidance.id,'v38EntryGuidance');assert.equal(guidance.tagName,'P');
  assert.equal(guidance.textContent,text);
  assert.equal(t.doc.querySelectorAll('#v38EntryGuidance').length,1);
  assert.equal(guidance.querySelectorAll('a,button,input,select,textarea,[tabindex]').length,0);
  assert.equal(guidance.hasAttribute('tabindex'),false);
  assert.deepEqual([...actions.querySelectorAll('a,button')].map(e=>e.id),['v38ExampleJump','v38EditOwn']);
  assert.match(t.doc.querySelector('.v38-intro>p').textContent,/Beispiele sind vollständig fiktiv/);
  assert.match(t.doc.querySelector('#v38QuickStart>.v38-caption').textContent,/Alle Vorlagen sind unverbindlich/);
  assert.match(t.doc.querySelector('#v38QuickStart>.v38-caption').textContent,/Für Geburten 2027 bleibt der Rechtsstand ungeprüft/);
  t.ui.changeValue('date','2026-05-28');
  assert.match(t.doc.querySelector('#v317Scope').textContent,/Bitte zuerst die grundlegenden Angaben prüfen/);
  assert.ok(html.includes('Startet ohne Eingaben. Verändert Einkommen und Betreuungsdauer nur mit frei erfundenen Zahlen.'));
  assert.ok(readFileSync(new URL('../src/v38-quickstart.html',import.meta.url),'utf8').includes('<p id="v38EntryGuidance">'+text+'</p>'));
  assert.deepEqual(t.errors,[]);
 }finally{t.dom.window.close();}
});
