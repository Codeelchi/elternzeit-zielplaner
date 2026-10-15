import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {JSDOM,VirtualConsole} from 'jsdom';
const data=JSON.parse(readFileSync(new URL('../data/amtliche-beispielrechnungen-2026-10-15.json',import.meta.url),'utf8')).lbank_official_multi_income_case;
const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');
function setup(){const errors=[],virtualConsole=new VirtualConsole();virtualConsole.on('jsdomError',e=>errors.push(e.message));
 const dom=new JSDOM(html,{url:'https://local.test/',runScripts:'dangerously',pretendToBeVisual:true,virtualConsole,
 beforeParse:w=>{w.scrollTo=()=>{};w.alert=()=>{};w.URL.createObjectURL=()=>'';w.URL.revokeObjectURL=()=>{};}});
 return {dom,ui:dom.window.__elternzeitTest,app:dom.window.__elternzeitV3,errors};}
test('official L-Bank example calculates separate income averages for both parents',()=>{
 for(const who of ['mother','father']){
   const f=data[who];
   assert.equal(f.postbirth_plus_nets.reduce((s,v)=>s+v,0)/f.postbirth_plus_nets.length,f.postbirth_average);
 }
});
test('real 36-month model reproduces official Baden-Wuerttemberg Plus/bonus amounts with explicit monthly EG-net and wages',()=>{
 const {dom,ui,app,errors}=setup();
 Object.assign(ui.s,{date:'2026-05-28',standardCaseConfirmed:true,zve:80000,netFather:3000,netMother:2800,egNetFather:3000,egNetMother:2800,
 ptNetFather:1700,ptNetMother:1400,hoursFather:28,hoursMother:25,egPtNetFather:'',egPtNetMother:'',employmentOverrides:null,benefitOverrides:null,leaveOverrides:null});
 const plan=Array.from({length:36},(_,i)=>({f:'W',m:i<2?'MS':'W'}));
 plan[0].f='B';
 for(const i of [2,3,11,12]){if(i<=3)plan[i-1].f='T';else plan[i-1].f='B';}
 for(let lm=3;lm<=8;lm++)plan[lm-1].m='B';
 for(let lm=9;lm<=12;lm++)plan[lm-1].m='T';
 for(let lm=13;lm<=16;lm++){plan[lm-1].m='K';plan[lm-1].f='K';}
 const mN=data.mother.postbirth_plus_nets,mH=data.mother.postbirth_plus_hours;
 for(let lm=9;lm<=16;lm++){Object.assign(plan[lm-1],{hm:mH[lm-9],wm:mN[lm-9],em:mN[lm-9]});}
 const fL=[2,3,13,14,15,16],fN=data.father.postbirth_plus_nets,fH=data.father.postbirth_plus_hours;
 for(let i=0;i<fL.length;i++)Object.assign(plan[fL[i]-1],{hf:fH[i],wf:fN[i],ef:fN[i]});
 const result=app.evaluate(plan);
 assert.equal(result.valid,true,JSON.stringify(result.validation.findings));
 for(const lm of [3,4,5,6,7,8])assert.ok(Math.abs(result.rows[lm-1].mg-data.mother.basis_expected)<0.01,'mother basis LM'+lm);
 for(const lm of [9,10,11,12,13,14,15,16])assert.ok(Math.abs(result.rows[lm-1].mg-data.mother.plus_expected)<0.01,'mother plus LM'+lm);
 for(const lm of [1,11,12])assert.ok(Math.abs(result.rows[lm-1].fg-data.father.basis_expected)<0.01,'father basis LM'+lm);
 for(const lm of fL)assert.ok(Math.abs(result.rows[lm-1].fg-data.father.plus_expected)<0.01,'father plus LM'+lm);
 assert.equal(result.rows[8].mi,1200);
 assert.equal(result.rows[12].mi,1780);
 assert.equal(result.rows[1].fi,1500);
 assert.equal(result.rows[12].fi,2200);
 const persisted=ui.sanitizeImport({...ui.getState(),schedule:plan});
 assert.equal(persisted.schedule[8].em,1200);
 assert.equal(persisted.schedule[12].ef,2200);
 assert.deepEqual(errors,[]);
 dom.window.close();
});
test('malformed and incompatible monthly net inputs are not considered legally valid',()=>{
 const {dom,ui,app}=setup();Object.assign(ui.s,{date:'2026-05-28',standardCaseConfirmed:true,zve:80000});
 const schedule=ui.getState().schedule;
 for(const bad of [-1,NaN,Infinity,'250']) {
   schedule[2].ef=bad;
   const r=app.evaluate(schedule);
   assert.equal(r.valid,false,String(bad));
   assert.ok(r.validation.findings.some(f=>f.code==='MONTHLY_NET_INVALID_ef'));
   assert.throws(()=>ui.sanitizeImport({...ui.getState(),schedule}));
 }
 delete schedule[2].ef;
 schedule[2].f='B';schedule[2].wf=100;
 const r=app.evaluate(schedule);
 assert.ok(r.validation.findings.some(f=>f.code==='MONTHLY_WAGE_WITHOUT_WORK'));
 dom.window.close();
});

test('editable monthly values update only their own life month and can be cleared',()=>{
 const {dom,ui}=setup();
 Object.assign(ui.s,{date:'2026-05-28',standardCaseConfirmed:true,zve:80000,month:3});
 ui.s.schedule[2].f='T';
 ui.changeValue('hoursFather',28);
 const f=dom.window.document.getElementById('monthWageFather');
 const e=dom.window.document.getElementById('monthEgNetFather');
 f.value='1567.30';f.dispatchEvent(new dom.window.Event('change',{bubbles:true}));
 e.value='1511.80';e.dispatchEvent(new dom.window.Event('change',{bubbles:true}));
 assert.equal(ui.getState().schedule[2].wf,1567.3);
 assert.equal(ui.getState().schedule[2].ef,1511.8);
 assert.equal(ui.getState().schedule[3].wf,undefined);
 assert.equal(ui.getState().schedule[3].ef,undefined);
 e.value='';e.dispatchEvent(new dom.window.Event('change',{bubbles:true}));
 assert.equal(ui.getState().schedule[2].ef,undefined);
 assert.equal(ui.getState().schedule[2].wf,1567.3);
 dom.window.close();
});
