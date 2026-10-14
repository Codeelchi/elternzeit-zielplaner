import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {JSDOM,VirtualConsole} from 'jsdom';
const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');
function setup(){
 const errors=[],console=new VirtualConsole();console.on('jsdomError',e=>errors.push(e.message));
 const dom=new JSDOM(html,{url:'https://elternzeit.local',runScripts:'dangerously',pretendToBeVisual:true,virtualConsole:console,beforeParse(w){w.scrollTo=()=>{};w.alert=()=>{};}});
 return {dom,ui:dom.window.__elternzeitTest,app:dom.window.__elternzeitV3,errors};
}
test('unconfirmed future default cannot be called plausible or searched as an accepted standard',()=>{
 const {dom,ui,app,errors}=setup();
 assert.equal(ui.evaluate().valid,false);
 assert.match(dom.window.document.querySelector('#globalPlanStatus').textContent,/Schätzungen.*NICHT_UNTERSTUETZT/);
 assert.equal(ui.evaluate().validation.status,'NICHT_UNTERSTUETZT');
 assert.equal(app.runGoalSearch().length,0);
 assert.match(dom.window.document.querySelector('#goalResult').textContent,/Keine passenden Vorschläge/);
 assert.equal(dom.window.localStorage.length,0);
 assert.deepEqual(errors,[]);dom.window.close();
});
test('import rejects malformed numbers, calendar days, hours and unknown statuses',()=>{
 const {dom,ui}=setup();const base=ui.getState();
 for(const patch of [{netFather:'Infinity'},{date:'2026-02-30'},{netMother:-1},{schedule:base.schedule.map((r,i)=>i? r:{f:'UNKNOWN',m:'MS'})}])assert.throws(()=>ui.sanitizeImport({...base,...patch}));
 const out=ui.sanitizeImport({...base,zve:'95000'});assert.equal(out.zve,95000);
 dom.window.close();
});
test('import cannot silently enable saving, erase a declared special case or confirm a grant',()=>{
 const {dom,ui}=setup();const out=ui.sanitizeImport({...ui.getState(),storageConsent:true,standardCaseConfirmed:true,selfEmployed:true,grantVerified:true});
 assert.equal(out.storageConsent,false);assert.equal(out.standardCaseConfirmed,false);assert.equal(out.grantVerified,false);
 dom.window.close();
});
test('unsupported manual additional benefit is not added to monthly household income',()=>{
 const {dom,ui}=setup();const baseline=ui.evaluate().rows[0].income;
 ui.changeValue('confirmedGrant',1000);ui.changeValue('grantVerified',true);
 assert.equal(ui.evaluate().rows[0].income,baseline);assert.equal(ui.evaluate().rows[0].grant,0);
 dom.window.close();
});
test('zero child benefit remains zero and an unverified historical local tariff is excluded',()=>{
 const {dom,ui,app}=setup();ui.changeValue('kind',0);assert.equal(app.monthKind(1),0);
 ui.changeValue('kind',267);assert.equal(app.monthKind(24),267);
 ui.changeValue('childcareMode','cologne2025');ui.changeValue('childcareMonthly',321);
 assert.equal(app.childcareEstimate(19),321);dom.window.close();
});
test('deleting local plans removes every supported legacy key without a subsequent implicit save',()=>{
 const {dom,ui}=setup();for(const n of [1,2,3])dom.window.localStorage.setItem('elternzeit-familienplan-v'+n,'private');
 ui.deleteLocalData();ui.changeValue('netFather',2500);
 assert.equal(dom.window.localStorage.length,0);assert.equal(ui.getState().netFather,2500);dom.window.close();
});
