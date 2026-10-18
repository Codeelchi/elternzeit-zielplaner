import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {JSDOM,VirtualConsole} from 'jsdom';

const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');
const KEY='elternzeit-familienplan-v3';
function makeApp({beforeParse,seed}={}){
 const errors=[],vc=new VirtualConsole();
 vc.on('jsdomError',error=>errors.push(error.message));
 const dom=new JSDOM(html,{
  url:'https://elternzeit.local/',runScripts:'dangerously',pretendToBeVisual:true,virtualConsole:vc,
  beforeParse(window){
   window.scrollTo=()=>{};
   window.alert=()=>{};
   window.confirm=()=>true;
   if(seed)window.localStorage.setItem(KEY,seed);
   beforeParse?.(window);
  }
 });
 const d=dom.window.document,ui=dom.window.__elternzeitTest;
 return {dom,d,ui,errors};
}
function fault(window,method){
 Object.defineProperty(window.Storage.prototype,method,{
  configurable:true,
  value(){throw new window.DOMException('Storage disabled by privacy policy','SecurityError');}
 });
}
test('a rejected save immediately removes false consent and keeps a visible, screenreader status',()=>{
 const {dom,d,ui,errors}=makeApp({beforeParse:w=>fault(w,'setItem')});
 const opt=d.getElementById('localSave');
 opt.checked=true;
 opt.dispatchEvent(new dom.window.Event('change',{bubbles:true}));
 assert.equal(ui.getState().storageConsent,false);
 assert.equal(opt.checked,false);
 const message=d.getElementById('privacyStorageStatus');
 assert.equal(message.hidden,false);
 assert.equal(message.getAttribute('role'),'status');
 assert.equal(message.dataset.storageStatus,'error');
 assert.match(message.textContent,/Speichern ist blockiert/i);
 assert.doesNotMatch(message.textContent,/erfolgreich gespeichert|Kopien gelöscht/i);
 assert.deepEqual(errors,[]);
 dom.window.close();
});
test('storage denial never claims deletion, keeps stale old copy explicit and disables opt-in',()=>{
 const previous=JSON.stringify({storedFamily:'sample'});
 const {dom,d,ui,errors}=makeApp({seed:previous});
 assert.equal(dom.window.localStorage.getItem(KEY),previous);
 fault(dom.window,'removeItem');
 const clicked=d.getElementById('deleteLocal').click();
 assert.equal(clicked,undefined);
 assert.equal(ui.getState().storageConsent,false);
 assert.equal(d.getElementById('localSave').checked,false);
 assert.equal(dom.window.localStorage.getItem(KEY),previous);
 const msg=d.getElementById('privacyStorageStatus');
 assert.equal(msg.hidden,false);
 assert.match(msg.textContent,/NICHT bestätigt/);
 assert.match(msg.textContent,/Website-Daten/);
 assert.deepEqual(errors,[]);
 dom.window.close();
});
test('reset always discards in-memory family data even if browser-copy deletion cannot be verified',()=>{
 const previous='older locally stored copy';
 const {dom,d,ui,errors}=makeApp({seed:previous});
 const defaultNet=ui.getState().netFather;
 ui.changeValue('netFather',3199);
 assert.equal(ui.getState().netFather,3199);
 fault(dom.window,'removeItem');
 d.getElementById('btnReset').click();
 assert.equal(ui.getState().netFather,defaultNet);
 assert.equal(ui.getState().storageConsent,false);
 assert.equal(dom.window.localStorage.getItem(KEY),previous);
 assert.match(d.getElementById('privacyStorageStatus').textContent,/NICHT bestätigt/);
 assert.match(d.getElementById('toast').textContent,/NICHT sicher gelöscht/);
 assert.deepEqual(errors,[]);
 dom.window.close();
});
test('corrupt saved family copy is not silently restored or reported as verified',()=>{
 const {dom,d,ui,errors}=makeApp({seed:'{NOT_JSON'});
 assert.equal(ui.getState().storageConsent,false);
 const msg=d.getElementById('privacyStorageStatus');
 assert.equal(msg.hidden,false);
 assert.equal(msg.dataset.storageStatus,'error');
 assert.match(msg.textContent,/nicht sicher gelesen/);
 assert.deepEqual(errors,[]);
 dom.window.close();
});
