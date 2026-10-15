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

test('import preserves independent employment, benefits and actual bank entries',()=>{
 const {dom,ui}=setup();const original={...ui.getState(),date:'2026-05-28',zve:95000,standardCaseConfirmed:true,
 employmentOverrides:{father:[{lm:3,weeklyHours:24}]},benefitOverrides:{father:[{lm:3,type:'plus'}]},
 bankLedger:[{id:'actual-payment',paymentDate:'2026-09-01',amount:700,category:'elterngeld'}],riskFatherPercent:0,riskMotherPercent:30};
 const imported=ui.sanitizeImport(original);
 for(const key of ['employmentOverrides','benefitOverrides','bankLedger'])assert.deepEqual(JSON.parse(JSON.stringify(imported[key])),original[key]);
 assert.equal(imported.riskFatherPercent,0);assert.equal(imported.riskMotherPercent,30);
 assert.equal(imported.storageConsent,false);dom.window.close();
});

test('malformed special-case declarations cannot become a confirmed standard through import',()=>{
 const {dom,ui}=setup();
 for(const flag of [1,'true','self-employed',{}])assert.equal(ui.sanitizeImport({...ui.getState(),standardCaseConfirmed:true,specialCases:flag}).standardCaseConfirmed,false);
 assert.throws(()=>ui.sanitizeImport({...ui.getState(),leaveOverrides:{fater:[]}}));
 assert.throws(()=>ui.sanitizeImport({...ui.getState(),schedule:ui.getState().schedule.map((r,i)=>i===20?null:r)}));
 dom.window.close();
});

test('35-hour ordinary part-time work without benefit or employer leave is allowed',()=>{
 const {dom,ui}=setup();for(const [key,value]of Object.entries({date:'2026-05-28',zve:95000,standardCaseConfirmed:true,
 leaveOverrides:{father:[],mother:[]},employmentOverrides:{father:[{lm:3,weeklyHours:35}]},benefitOverrides:{father:[{lm:3,type:'none'}]}}))ui.changeValue(key,value);
 const calculated=ui.evaluate();assert.equal(calculated.valid,true,calculated.errors.join('; '));assert.equal(calculated.rows[2].f,'Q');assert.equal(calculated.rows[2].hf,35);
 dom.window.close();
});

test('personal income risk bands consistently affect stress results without varying maternity benefits',()=>{
 const {dom,ui,app}=setup();ui.changeValue('riskFatherPercent',0);ui.changeValue('riskMotherPercent',30);
 const scenarios=app.riskScenarios(),low=scenarios[0].calc.rows,base=scenarios[1].calc.rows;
 assert.equal(low[0].fi,base[0].fi);assert.equal(low[0].maternityBenefits,base[0].maternityBenefits);
 assert.ok(Math.abs(low[2].mi-base[2].mi*.7)<.001);
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
