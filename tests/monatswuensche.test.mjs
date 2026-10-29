import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {JSDOM,VirtualConsole} from 'jsdom';

const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');
function setup(){const errors=[],vc=new VirtualConsole();vc.on('jsdomError',e=>errors.push(e.message));
 const dom=new JSDOM(html,{url:'https://elternzeit.local/',runScripts:'dangerously',pretendToBeVisual:true,virtualConsole:vc,beforeParse(w){w.scrollTo=()=>{};w.alert=()=>{};w.confirm=()=>true;}});
 return {dom,doc:dom.window.document,ui:dom.window.__elternzeitTest,errors};}
test('Wunschkalender ist direkt vom Einstieg erreichbar ohne den Plan zu verändern',()=>{
 const {dom,doc,ui,errors}=setup(),before=JSON.stringify(ui.getState());
 const jump=doc.getElementById('v42OpenFromStart');assert.ok(jump);jump.click();
 assert.ok(doc.getElementById('slide-5').classList.contains('active'));
 assert.equal(doc.activeElement.id,'v42WishTitle');assert.equal(JSON.stringify(ui.getState()),before);
 assert.match(doc.getElementById('v42EntryContext').textContent,/Beispiel|Plan/);
 assert.equal(doc.querySelectorAll('#v42WishGrid [data-v42-wish-year]').length,3);
 assert.equal(doc.querySelectorAll('#v42WishGrid [data-v42-wish-month]').length,36);
 assert.deepEqual(errors,[]);dom.window.close();
});
test('Öffentliche Testvorschau fordert im Wunschkalender ausschließlich fiktive Angaben',()=>{
 const preview=html.replace('</head>','<meta name="preview-commit" content="test"></head>');
 const dom=new JSDOM(preview,{url:'https://elternzeit.local/',runScripts:'dangerously',pretendToBeVisual:true,beforeParse(w){w.scrollTo=()=>{};w.alert=()=>{};w.confirm=()=>true;}});
 dom.window.document.getElementById('v42OpenFromStart').click();
 const text=dom.window.document.getElementById('v42EntryContext').textContent;
 assert.match(text,/ausschließlich fiktive Angaben/);assert.doesNotMatch(text,/persönliche Zahlen/);
 dom.window.close();
});
test('Wünsche pro Lebensmonat bleiben getrennt und verändern nicht den aktiven Familienplan',()=>{
 const {dom,doc,ui,errors}=setup(),before=JSON.stringify(ui.getState());
 const month=doc.getElementById('v42WishMonth');assert.equal(month.options.length,36);
 month.value='3';month.dispatchEvent(new dom.window.Event('change',{bubbles:true}));
 const first=doc.getElementById('v42WishFirst');first.value='home';first.dispatchEvent(new dom.window.Event('change',{bubbles:true}));
 const care=doc.getElementById('v42WishCare');care.value='kita';care.dispatchEvent(new dom.window.Event('change',{bubbles:true}));
 month.value='4';month.dispatchEvent(new dom.window.Event('change',{bubbles:true}));assert.equal(first.value,'');
 month.value='3';month.dispatchEvent(new dom.window.Event('change',{bubbles:true}));assert.equal(first.value,'home');assert.equal(care.value,'kita');
 assert.equal(JSON.stringify(ui.getState()),before);assert.match(doc.getElementById('v42WishDate').textContent,/bis/);
 assert.deepEqual(errors,[]);dom.window.close();
});
test('Unvollständige Angaben führen zu keinem behaupteten besten Modell',()=>{
 const {dom,doc}=setup();doc.getElementById('v42FindMatches').click();
 assert.match(doc.getElementById('v42WishResult').textContent,/Wunsch|Angabe/);
 assert.doesNotMatch(doc.getElementById('v42WishResult').textContent,/bestes Modell/i);
 dom.window.close();
});
test('Modellvergleich berücksichtigt Wünsche, erklärt Abweichungen und übernimmt nur nach Bestätigung',()=>{
 const {dom,doc,ui,errors}=setup();
 Object.assign(ui.s,{date:'2026-05-28',standardCaseConfirmed:true,zve:90000,childcareStart:19});
 const month=doc.getElementById('v42WishMonth');month.value='3';month.dispatchEvent(new dom.window.Event('change',{bubbles:true}));
 for(const [id,value] of [['v42WishFirst','home'],['v42WishSecond','full'],['v42WishCare','parents']]){
  const input=doc.getElementById(id);input.value=value;input.dispatchEvent(new dom.window.Event('change',{bubbles:true}));
 }
 const before=JSON.stringify(ui.getState());doc.getElementById('v42FindMatches').click();
 const result=doc.getElementById('v42WishResult');
 assert.match(result.textContent,/3 von 3 Angaben passend/);
 assert.match(result.textContent,/keine vollständige Suche/);
 const button=result.querySelector('button[data-v42-apply-match]');assert.ok(button);
 dom.window.confirm=()=>false;button.click();assert.equal(JSON.stringify(ui.getState()),before);
 ui.changeValue('netFather',2200);assert.equal(result.querySelector('button'),null);assert.match(result.textContent,/erneut vergleichen/);
 doc.getElementById('v42FindMatches').click();dom.window.confirm=()=>true;
 result.querySelector('button[data-v42-apply-match]').click();
 assert.notEqual(ui.getState().model,'custom');assert.match(result.textContent,/erneut vergleichen/);
 assert.deepEqual(errors,[]);dom.window.close();
});
test('Kita-Wünsche verwenden den expliziten Kita-Start statt Elternstatus',()=>{
 const {dom,doc,ui}=setup();Object.assign(ui.s,{date:'2026-05-28',standardCaseConfirmed:true,zve:90000,childcareStart:19});
 const month=doc.getElementById('v42WishMonth');month.value='3';month.dispatchEvent(new dom.window.Event('change',{bubbles:true}));
 const care=doc.getElementById('v42WishCare');care.value='kita';care.dispatchEvent(new dom.window.Event('change',{bubbles:true}));
 doc.getElementById('v42FindMatches').click();assert.match(doc.getElementById('v42WishResult').textContent,/0 von 1 Angaben passend/);
 assert.match(doc.getElementById('v42WishResult').textContent,/LM 3 Betreuung/);
 const prior=JSON.stringify(ui.getState());const start=doc.getElementById('v42WishKitaStart');start.value='3';start.dispatchEvent(new dom.window.Event('change',{bubbles:true}));
 assert.equal(JSON.stringify(ui.getState()),prior);
 doc.getElementById('v42FindMatches').click();assert.match(doc.getElementById('v42WishResult').textContent,/1 von 1 Angaben passend/);
 assert.match(doc.getElementById('v42WishResult').textContent,/nicht in den aktiven Plan übernommen/);dom.window.close();
});
test('Finanzperspektive braucht bekannte Kosten und denselben Kita-Beginn',()=>{
 const {dom,doc,ui}=setup();Object.assign(ui.s,{date:'2026-05-28',standardCaseConfirmed:true,zve:90000,childcareStart:19,expenses:''});
 const wish=doc.getElementById('v42WishFirst');wish.value='home';wish.dispatchEvent(new dom.window.Event('change',{bubbles:true}));
 const goal=doc.getElementById('v42WishObjective');goal.value='total';goal.dispatchEvent(new dom.window.Event('change',{bubbles:true}));
 doc.getElementById('v42FindMatches').click();assert.match(doc.getElementById('v42WishResult').textContent,/Finanzvergleich nicht möglich/);
 ui.changeValue('expenses',1500);doc.getElementById('v42FindMatches').click();
 assert.match(doc.getElementById('v42WishResult').textContent,/Rest nach Kosten/);
 const start=doc.getElementById('v42WishKitaStart');start.value='3';start.dispatchEvent(new dom.window.Event('change',{bubbles:true}));
 doc.getElementById('v42FindMatches').click();assert.match(doc.getElementById('v42WishResult').textContent,/Finanzvergleich nicht möglich/);
 dom.window.close();
});
test('Reset und Import entfernen nur flüchtige Wünsche; XSS wird nicht als HTML gerendert',()=>{
 const {dom,doc,ui}=setup();Object.assign(ui.s,{date:'2026-05-28',standardCaseConfirmed:true,zve:90000,parentNameFather:'<img src=x>'});
 const select=doc.getElementById('v42WishFirst');select.value='home';select.dispatchEvent(new dom.window.Event('change',{bubbles:true}));
 doc.getElementById('v42FindMatches').click();assert.equal(doc.querySelector('#v42WishResult img'),null);
 dom.window.__familienzeitV42.onImported();assert.equal(select.value,'');
 select.value='part';select.dispatchEvent(new dom.window.Event('change',{bubbles:true}));
 dom.window.__familienzeitV42.onReset();assert.equal(select.value,'');dom.window.close();
});
