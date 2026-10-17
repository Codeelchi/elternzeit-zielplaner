import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {JSDOM,VirtualConsole} from 'jsdom';
const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');
function setup(){
 const errors=[],vc=new VirtualConsole();vc.on('jsdomError',e=>errors.push(e.message));
 const dom=new JSDOM(html,{url:'https://elternzeit.local',runScripts:'dangerously',pretendToBeVisual:true,
  virtualConsole:vc,beforeParse(w){w.scrollTo=()=>{};w.alert=()=>{};w.confirm=()=>true;
   w.URL.createObjectURL=()=>'';w.URL.revokeObjectURL=()=>{};}});
 const d=dom.window.document,api=dom.window.__elternzeitTest;
 assert.ok(api,'embedded app starts offline without native module imports');
 function fill(id,value,evt='input'){
  const field=d.getElementById(id);assert.ok(field,id);field.value=String(value);
  field.dispatchEvent(new dom.window.Event(evt,{bubbles:true}));
 }
 return {dom,d,api,fill,errors};
}
test('simultaneous vs staggered work decides coverage, never sum of both work hours',()=>{
 const {dom,d,api,fill,errors}=setup();
 api.changeValue('date','2026-05-28');api.changeValue('childcareStart',19);
 const before=JSON.stringify(api.getState());
 fill('v315DelayWeeks','1');fill('v315SettlingWeeks','0');
 fill('v315FirstHours','0');fill('v315TargetHours','0');
 fill('v316AWork','20');fill('v316BWork','20');
 fill('v316AStart','08:00');fill('v316BStart','12:00');
 fill('v316GapParent','A','change');fill('v316ANet','400');fill('v316BNet','600');
 const out=d.getElementById('v316JointResult');
 assert.match(out.textContent,/Rein hypothetischer/);
 assert.match(out.textContent,/0 €/);
 assert.match(out.textContent,/A 0 h und B 0 h Arbeitszeit/);
 fill('v316BStart','08:00');
 assert.match(out.textContent,/A 20 h und B 0 h Arbeitszeit/);
 assert.match(out.textContent,/400 €/);
 assert.equal(JSON.stringify(api.getState()),before);
 assert.equal(dom.window.localStorage.length,0);
 assert.deepEqual(errors,[]);
 dom.window.close();
});
test('changing escort role modifies schedule but never legally recorded plan or bank ledger',()=>{
 const {dom,d,api,fill}=setup();
 api.changeValue('date','2026-05-28');
 const before=JSON.stringify(api.getState());
 fill('v315DelayWeeks','0');fill('v315SettlingWeeks','1');
 fill('v315FirstHours','5');fill('v315TargetHours','20');
 fill('v316AWork','20');fill('v316BWork','20');
 fill('v316ANet','400');fill('v316BNet','600');
 fill('v316BReturn','4');
 fill('v316Escort','A','change');
 const output=d.getElementById('v316JointResult');
 assert.match(output.textContent,/Rein hypothetischer/);
 assert.match(output.textContent,/A 5 h und B 0 h Arbeitszeit/);
 assert.match(output.textContent,/100 €/);
 fill('v316Escort','B','change');
 assert.match(output.textContent,/A 0 h und B 0 h Arbeitszeit/);
 const choices=d.querySelectorAll('#v316JointResult .v316-escort-choices tbody tr');
 assert.equal(choices.length,3);
 assert.equal(JSON.stringify(api.getState()),before);
 dom.window.close();
});
test('weekly weekday table is selectable and keeps keyboard focus after render',()=>{
 const {dom,d,fill,errors}=setup();
 fill('v315CarePreset','late','change');
 const selector=d.getElementById('v316WeekDetail');
 assert.ok(selector.options.length>=7);
 selector.focus();
 fill('v316WeekDetail','2','change');
 assert.equal(d.activeElement?.id,'v316WeekDetail');
 assert.match(d.getElementById('v316JointResult').textContent,/Einzelne Beispielwoche/);
 assert.deepEqual(errors,[]);
 dom.window.close();
});
test('invalid weekly hours show accessible error, can be corrected, and reset remains local',()=>{
 const {dom,d,api,fill,errors}=setup();
 const before=JSON.stringify(api.getState());
 fill('v316AWork','38.1');
 const out=d.getElementById('v316JointResult');
 assert.ok(out.querySelector('[role="alert"]'));
 assert.match(out.textContent,/Viertelstunden/);
 fill('v316AWork','32');
 assert.equal(out.querySelector('[role="alert"]'),null);
 fill('v316ANet','950');
 assert.match(out.textContent,/Rein hypothetischer|Geldbelastung/);
 d.getElementById('v316JointReset').click();
 assert.equal(d.getElementById('v316AWork').value,'28');
 assert.equal(d.getElementById('v316ANet').value,'');
 assert.equal(JSON.stringify(api.getState()),before);
 assert.equal(dom.window.localStorage.length,0);
 assert.deepEqual(errors,[]);
 dom.window.close();
});
test('no childcare start never fabricates a two-parent scenario',()=>{
 const {dom,d,api,errors}=setup();
 api.changeValue('childcareStart',0);
 assert.match(d.getElementById('v316JointResult').textContent,/Zuerst den geplanten Kita-Lebensmonat/);
 assert.deepEqual(errors,[]);
 dom.window.close();
});
test('main Kita assumptions recalculate parent result but do not copy parental wages into family budget',()=>{
 const {dom,d,api,fill}=setup();
 const before=JSON.stringify(api.getState());
 fill('v316AWork','20');fill('v316BWork','20');
 fill('v316ANet','400');fill('v316BNet','600');
 fill('v315DelayWeeks','4');
 assert.match(d.getElementById('v316JointResult').textContent,/Übergangswochen/);
 assert.equal(JSON.stringify(api.getState()),before);
 assert.equal(dom.window.localStorage.length,0);
 dom.window.close();
});

test('global reset clears every two-parent transient assumption and preserves only default plan model',()=>{
 const {dom,d,fill,api,errors}=setup();
 fill('v316AWork','16');
 fill('v316BReturn','11');
 fill('v316ANet','987.65');
 fill('v316Escort','B','change');
 d.getElementById('btnReset').click();
 assert.equal(d.getElementById('v316AWork').value,'28');
 assert.equal(d.getElementById('v316BReturn').value,'0');
 assert.equal(d.getElementById('v316ANet').value,'');
 assert.equal(d.getElementById('v316Escort').value,'A');
 assert.equal('weeklyNetAtRiskA' in api.getState(),false);
 assert.deepEqual(errors,[]);
 dom.window.close();
});
