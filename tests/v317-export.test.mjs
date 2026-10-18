import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {JSDOM,VirtualConsole} from 'jsdom';
const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');
function setup(){
 const errors=[],vc=new VirtualConsole();vc.on('jsdomError',e=>errors.push(e.message));
 const dom=new JSDOM(html,{runScripts:'dangerously',pretendToBeVisual:true,url:'https://elternzeit.local',
  virtualConsole:vc,beforeParse(w){w.scrollTo=()=>{};w.alert=()=>{};w.confirm=()=>true;}});
 return {dom,d:dom.window.document,ui:dom.window.__elternzeitTest,errors};
}
test('export preview follows validator, shows sources and refuses legal release',()=>{
 const {dom,d,ui,errors}=setup();
 assert.match(d.getElementById('v317ExportStatus').textContent,/OUTSIDE_SCOPE/);
 assert.match(d.getElementById('v317ExportLimits').textContent,/Mutterschutz/);
 const note=d.getElementById('v317ExportNotice');note.open=true;
 ui.changeValue('date','2026-05-28');ui.changeValue('standardCaseConfirmed',true);ui.changeValue('zve',95000);
 assert.match(d.getElementById('v317ExportStatus').textContent,/PLAUSIBLE_MODEL.*Keine amtlich/);
 assert.match(d.getElementById('v317ExportScope').textContent,/2025-04-01 bis 2026-12-31/);
 assert.equal(note.open,true);
 assert.deepEqual(errors,[]);
 dom.window.close();
});
test('export notice never claims an externally reported benefit amount has been checked',()=>{
 const {dom,d,ui,errors}=setup();
 ui.changeValue('incomeEntryMode','official');
 const text=d.getElementById('v317ExportScope').textContent;
 assert.match(text,/Herkunft, Bescheid und Zeiträume nicht überprüft/);
 assert.match(d.getElementById('v317ExportStatus').textContent,/Keine amtlich/);
 assert.equal(dom.window.localStorage.length,0);
 assert.deepEqual(errors,[]);
 dom.window.close();
});
test('status notice content remains plain text for hostile parent names',()=>{
 const {dom,d,ui,errors}=setup();
 ui.changeValue('parentNameFather','<img src=x onerror=alert(1)>');
 assert.equal(d.getElementById('v317ExportNotice').querySelectorAll('img').length,0);
 assert.deepEqual(errors,[]);
 dom.window.close();
});
