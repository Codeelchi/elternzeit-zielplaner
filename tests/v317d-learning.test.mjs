import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {JSDOM,VirtualConsole} from 'jsdom';
const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');
function setup(){
 const errors=[],vc=new VirtualConsole();
 vc.on('jsdomError',e=>errors.push(e.message));
 const dom=new JSDOM(html,{url:'https://elternzeit.local',runScripts:'dangerously',
  pretendToBeVisual:true,virtualConsole:vc,beforeParse(w){w.scrollTo=()=>{};w.alert=()=>{};w.confirm=()=>true;}});
 return {dom,d:dom.window.document,ui:dom.window.__elternzeitTest,errors};
}
function choose(dom,d,value){
 const radio=d.querySelector('[name=v317dAnswer][value="'+value+'"]');
 assert.ok(radio,value);radio.checked=true;
 radio.dispatchEvent(new dom.window.Event('change',{bubbles:true}));
}
test('guide initializes closed with first of eight synthetic tasks; no plan mutation',()=>{
 const {dom,d,ui,errors}=setup();
 assert.equal(d.getElementById('v317dUnderstanding').open,false);
 assert.match(d.getElementById('v317dTask').textContent,/Aufgabe 1 von 8/);
 assert.equal(d.querySelectorAll('[name=v317dAnswer]').length,3);
 assert.equal(d.getElementById('v317dCheck').disabled,true);
 assert.match(d.getElementById('v317dProgress').textContent,/nicht als echte Nutzerstudie/);
 assert.equal(ui.getState().storageConsent,false);
 assert.equal(dom.window.localStorage.length,0);
 assert.deepEqual(errors,[]);
 dom.window.close();
});
test('an incorrect answer gives explanation and never states a legal certificate',()=>{
 const {dom,d,ui,errors}=setup();
 const initial=JSON.stringify(ui.getState());
 choose(dom,d,'approved');d.getElementById('v317dCheck').click();
 assert.equal(d.getElementById('v317dFeedback').hidden,false);
 assert.match(d.getElementById('v317dFeedback').textContent,/andere Einordnung wichtig/);
 assert.match(d.getElementById('v317dFeedback').textContent,/2027/);
 assert.equal(d.getElementById('v317dNext').hidden,false);
 assert.equal(d.getElementById('v317dCheck').hidden,true);
 assert.equal(JSON.stringify(ui.getState()),initial);
 assert.equal(dom.window.localStorage.length,0);
 assert.deepEqual(errors,[]);
 dom.window.close();
});
test('all eight steps are accessible through answer/check/next, then restart',()=>{
 const {dom,d,ui,errors}=setup();
 const initial=JSON.stringify(ui.getState());
 const correct=['forecast','external','no','unknown','unknown','review','limited','safe'];
 for(let i=0;i<8;i++){
  assert.match(d.getElementById('v317dTask').textContent,new RegExp('Aufgabe '+(i+1)+' von 8'));
  choose(dom,d,correct[i]);d.getElementById('v317dCheck').click();
  assert.match(d.getElementById('v317dFeedback').textContent,/Passende Einordnung/);
  assert.equal(d.querySelectorAll('[name=v317dAnswer]:disabled').length,3);
  d.getElementById('v317dNext').click();
 }
 assert.match(d.getElementById('v317dTask').textContent,/Aufgabe 1 von 8/);
 assert.equal(d.getElementById('v317dFeedback').hidden,true);
 assert.equal(JSON.stringify(ui.getState()),initial);
 assert.equal(dom.window.localStorage.length,0);
 assert.deepEqual(errors,[]);
 dom.window.close();
});
test('manual reset clears a partially completed lesson but keeps family model',()=>{
 const {dom,d,ui,errors}=setup();
 const initial=JSON.stringify(ui.getState());
 choose(dom,d,'forecast');d.getElementById('v317dCheck').click();
 d.getElementById('v317dNext').click();choose(dom,d,'external');
 d.getElementById('v317dReset').click();
 assert.match(d.getElementById('v317dTask').textContent,/Aufgabe 1 von 8/);
 assert.equal(d.querySelectorAll('[name=v317dAnswer]:checked').length,0);
 assert.equal(JSON.stringify(ui.getState()),initial);
 assert.deepEqual(errors,[]);
 dom.window.close();
});
test('changing plan fields does not overwrite the lesson, and lesson cannot enter plan state',()=>{
 const {dom,d,ui,errors}=setup();
 choose(dom,d,'forecast');d.getElementById('v317dCheck').click();
 ui.changeValue('date','2026-05-28');
 assert.match(d.getElementById('v317dTask').textContent,/Aufgabe 1 von 8/);
 assert.equal(d.getElementById('v317dFeedback').hidden,false);
 assert.equal('v317dSelection' in ui.getState(),false);
 assert.equal('humanStudyCompleted' in ui.getState(),false);
 assert.deepEqual(errors,[]);
 dom.window.close();
});
