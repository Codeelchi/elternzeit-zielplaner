import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {JSDOM} from 'jsdom';
const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');
function setup(){
 const dom=new JSDOM(html,{url:'https://elternzeit.local/',runScripts:'dangerously',pretendToBeVisual:true,
  beforeParse(w){w.scrollTo=()=>{};w.alert=()=>{};w.URL.createObjectURL=()=>'';w.URL.revokeObjectURL=()=>{};}});
 return {dom,doc:dom.window.document,h:dom.window.__elternzeitInputHints};
}
const today=new Date(2026,9,29);
test('hints: plausible input yields none; implausible yields German hints',()=>{
 const {dom,h}=setup();
 assert.equal(h.hints({birth:'2027-05-28',netF:'2600',netM:'2400',expenses:'3000'},today).length,0);
 assert.equal(h.hints({netF:'-5'},today).length,1);
 assert.match(h.hints({netF:'25000'},today)[0],/sehr hoch/);
 assert.match(h.hints({netM:'20'},today)[0],/sehr niedrig/);
 assert.match(h.hints({expenses:'-1'},today)[0],/negativ/);
 assert.match(h.hints({netF:'1000',netM:'1000',expenses:'9000'},today)[0],/Dreifachen/);
 assert.match(h.hints({birth:'2015-01-01'},today)[0],/zurück/);
 assert.match(h.hints({birth:'2035-01-01'},today)[0],/Zukunft/);
 assert.equal(h.hints({},today).length,0);
 dom.window.close();
});
test('DOM: status region is live, shows hint on input, never alters or blocks values',()=>{
 const {dom,doc}=setup();
 const box=doc.getElementById('v38InputHints');
 assert.equal(box.getAttribute('role'),'status');
 assert.equal(box.getAttribute('aria-live'),'polite');
 assert.ok(box.hidden);
 const f=doc.getElementById('v38NetF');
 f.value='25000';
 f.dispatchEvent(new dom.window.Event('input',{bubbles:true}));
 assert.ok(!box.hidden);
 assert.match(box.textContent,/Auszahlungsnetto Elternteil 1/);
 assert.equal(f.value,'25000');
 assert.equal(f.getAttribute('aria-invalid'),null);
 f.value='2500';
 f.dispatchEvent(new dom.window.Event('input',{bubbles:true}));
 assert.ok(box.hidden);
 dom.window.close();
});
