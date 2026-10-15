import test from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
const require=createRequire(import.meta.url);
const {validatePlan}=require('../src/rule-validator.cjs');
const catalogue=JSON.parse(readFileSync(new URL('../data/rechtsregeln-de-nrw-2026-10-14.json',import.meta.url)));
const input=()=>({state:{date:'2026-05-28',births:1,zve:95000,standardCaseConfirmed:true,hoursFather:28,hoursMother:28,netFather:3000,netMother:2800,egNetFather:2770,egNetMother:2500,ptNetFather:2000,ptNetMother:1900},schedule:Array.from({length:36},(_,i)=>({f:i>=2&&i<14?'B':'W',m:i<2?'MS':'W'}))});
const validate=(x,c=catalogue)=>validatePlan(x,c);
const has=(r,code)=>r.findings.some(f=>f.code===code);
test('confirmed employee standard allocation 2 maternity + 12 father basis is plausible',()=>{
 const r=validate(input());assert.equal(r.status,'PLAUSIBEL_STANDARD');assert.equal(r.valid,true);assert.deepEqual(r.totals,{father:12,mother:2,joint:14,bonusMonths:0});
});
test('income cap is exclusive and metadata accompanies the affected rule',()=>{
 const x=input();x.state.zve=175000;assert.equal(validate(x).valid,true);
 x.state.zve=175000.01;const r=validate(x),f=r.findings.find(f=>f.code==='INCOME_LIMIT_EXCEEDED');
 assert.equal(r.status,'REGELKONFLIKT');assert.deepEqual(f.parents,['father','mother']);assert.equal(f.source.checkedAt,'2026-10-14');assert.ok(f.source.url.startsWith('https://familienportal.de/'));assert.ok(f.alternatives.length);
});
test('missing household income and explicit standard confirmation fail closed',()=>{
 const x=input();x.state.zve='';delete x.state.standardCaseConfirmed;const r=validate(x);
 assert.equal(r.status,'DATEN_UNVOLLSTAENDIG');assert.equal(r.valid,false);assert.ok(has(r,'INCOME_LIMIT_DATA_MISSING'));assert.ok(has(r,'STANDARD_CASE_UNCONFIRMED'));
});
test('invalid birth dates cannot pass by lexical comparison',()=>{
 for(const date of ['2026-02-29','2026-02-30','',undefined]){const x=input();x.state.date=date;assert.ok(has(validate(x),'BIRTH_DATE_INVALID'));}
});
test('future cohort is unsupported despite catalogue broad 2027 window',()=>{
 const x=input();x.state.date='2027-05-28';assert.equal(validate(x).status,'NICHT_UNTERSTUETZT');assert.ok(has(validate(x),'FUTURE_COHORT_UNVERIFIED'));
});
test('multiple births, self employment and declared exceptions never receive standard validity',()=>{
 for(const extra of [{births:2},{selfEmployed:true},{singleParent:true},{specialCases:['disability']},{prematureBirth:true},{siblingBonus:true}]){
  const x=input();Object.assign(x.state,extra);assert.equal(validate(x).status,'NICHT_UNTERSTUETZT');
 }
});
test('catalogue pending sources and expired effective intervals fail closed',()=>{
 for(const mutate of [r=>r.checked_at=null,r=>r.verification_status='source_listed_review_pending',r=>r.effective_to='2025-12-31',r=>r.url='']){
  const c=structuredClone(catalogue);mutate(c.rules.find(r=>r.id==='BE-BON'));assert.equal(validate(input(),c).status,'NICHT_UNTERSTUETZT');
 }
});
test('malformed catalogue is structured unsupported result rather than exception',()=>{
 assert.equal(validate(input(),{}).status,'NICHT_UNTERSTUETZT');assert.equal(validate(input(),null).status,'NICHT_UNTERSTUETZT');assert.equal(validate(input(),{rules:{}}).status,'NICHT_UNTERSTUETZT');assert.equal(validatePlan().valid,false);
});
test('unknown codes, holes and omitted rows cannot silently become full time',()=>{
 for(const mutate of [x=>x.schedule[4].f='INVALID',x=>delete x.schedule[4],x=>x.schedule=[],x=>delete x.schedule[4].m]){
  const x=input();mutate(x);assert.equal(validate(x).status,'DATEN_UNVOLLSTAENDIG');
 }
});
test('one joint basis month within LM 12 is permitted but two or LM 13 conflict',()=>{
 const x=input();x.schedule[2].f='W';x.schedule[0].f='B';assert.equal(validate(x).valid,true);
 x.schedule[3].f='W';x.schedule[1].f='B';assert.ok(has(validate(x),'CONCURRENT_BASIS'));
 const y=input();y.schedule[12].m='B';assert.ok(has(validate(y),'CONCURRENT_BASIS'));
});
test('regular combined and per parent budgets are independent',()=>{
 const x=input();x.schedule[2].m='B';assert.ok(has(validate(x),'JOINT_BUDGET_EXCEEDED'));
 x.schedule[0].f='B';assert.ok(has(validate(x),'PARENT_BUDGET_EXCEEDED'));
});
test('plus uses half a basis credit and bonus is additional',()=>{
 const x=input();for(let i=2;i<26;i++)x.schedule[i].f='P';for(let i=26;i<30;i++){x.schedule[i].f='K';x.schedule[i].m='K';}
 const r=validate(x);assert.equal(r.valid,true);assert.equal(r.totals.father,12);assert.equal(r.totals.joint,14);assert.equal(r.totals.bonusMonths,4);
});
test('at least two paid life months are required for both parents',()=>{
 const x=input();for(const r of x.schedule)r.f='W';x.schedule[2].f='B';assert.ok(has(validate(x),'MINIMUM_BENEFIT_MONTHS'));
});
test('basis after LM14 and plus after LM32 are distinct conflicts',()=>{
 const x=input();x.schedule[14].f='B';x.schedule[32].m='P';const r=validate(x);assert.ok(has(r,'BASIS_TOO_LATE'));assert.ok(has(r,'PLUS_TOO_LATE'));
});
test('Plus can start LM15 without payment LM14; shared continuity is required thereafter',()=>{
 const x=input();for(const r of x.schedule)r.f='W';x.schedule[2].f='P';x.schedule[14].f='P';x.schedule[15].m='P';assert.equal(validate(x).valid,true);
 x.schedule[15].m='W';x.schedule[16].m='P';const r=validate(x);assert.ok(has(r,'PLUS_CONTINUITY'));assert.deepEqual(r.findings.find(f=>f.code==='PLUS_CONTINUITY').lifeMonths,[16]);
});
test('bonus valid at 24 and 32 hours and 2/3/4 months, fails outside boundaries',()=>{
 for(const count of [2,3,4])for(const hours of [24,32]){
  const x=input();for(let i=14;i<14+count;i++)Object.assign(x.schedule[i],{f:'K',m:'K',hf:hours,hm:hours});assert.equal(validate(x).valid,true);
 }
 for(const hours of [23.99,32.01]){const x=input();for(let i=14;i<16;i++)Object.assign(x.schedule[i],{f:'K',m:'K',hf:hours,hm:28});assert.ok(has(validate(x),'BONUS_HOURS'));}
});
test('bonus single, split, five months and unilateral blocks are rejected',()=>{
 for(const indices of [[14],[14,16],[14,15,16,17,18]]){const x=input();for(const i of indices)Object.assign(x.schedule[i],{f:'K',m:'K'});assert.ok(has(validate(x),'BONUS_BLOCK'));}
 const x=input();x.schedule[14].f=x.schedule[15].f='K';assert.ok(has(validate(x),'BONUS_NOT_SHARED'));
});
test('row-specific work hours override globals and missing hours stay incomplete',()=>{
 const x=input();x.schedule[2].f='R';x.schedule[2].hf=33;assert.ok(has(validate(x),'WORK_HOURS_EXCEEDED'));
 x.schedule[2].hf=32;assert.equal(validate(x).valid,true);
 x.schedule[2].hf='';assert.equal(validate(x).status,'DATEN_UNVOLLSTAENDIG');
});
test('different due date and maternity status mismatch cannot be certified',()=>{
 const x=input();x.state.expectedDueDate='2026-06-02';assert.equal(validate(x).status,'NICHT_UNTERSTUETZT');
 delete x.state.expectedDueDate;x.schedule[0].m='W';assert.ok(has(validate(x),'MATERNITY_STATUS_MISMATCH'));
});
test('validator is pure and deterministic and all conflict findings have official provenance',()=>{
 const x=input();x.schedule[12].m='B';x.schedule[14].f='B';x.schedule[20].m='K';const before=JSON.stringify(x),r=validate(x);
 assert.equal(JSON.stringify(x),before);assert.deepEqual(validate(x),r);
 for(const f of r.findings.filter(f=>f.status==='REGELKONFLIKT')){assert.ok(f.ruleId);assert.ok(f.source.checkedAt);assert.ok(f.source.effectiveFrom);assert.ok(f.source.url);assert.ok(Array.isArray(f.lifeMonths));assert.ok(f.alternatives.length);}
});
test('additional partner credits require income reduction, not simply a fourteen-credit label',()=>{
 const x=input();x.state.netFather=0;x.state.netMother=0;
 assert.ok(has(validate(x),'PARTNER_MONTH_REDUCTION_MISSING'));
 delete x.state.netMother;assert.ok(has(validate(x),'PARTNER_MONTH_INCOME_MISSING'));
});
test('zero and negative income or hours do not masquerade as missing numeric strings',()=>{
 const x=input();x.state.zve=0;assert.equal(validate(x).valid,true);
 x.state.zve=-1;assert.ok(has(validate(x),'INCOME_LIMIT_DATA_MISSING'));
 x.state.zve='not a number';assert.ok(has(validate(x),'INCOME_LIMIT_DATA_MISSING'));
 x.state.zve=100000;x.schedule[2].f='R';x.schedule[2].hf=-1;assert.ok(has(validate(x),'WORK_HOURS_INVALID'));
});
test('explicit denial of standard case is unsupported; unanswered confirmation is missing',()=>{
 const x=input();x.state.standardCaseConfirmed=false;assert.equal(validate(x).status,'NICHT_UNTERSTUETZT');assert.ok(has(validate(x),'STANDARD_CASE_DECLINED'));
 delete x.state.standardCaseConfirmed;assert.equal(validate(x).status,'DATEN_UNVOLLSTAENDIG');
});
test('mandatory wages and Elterngeld-Netto reject missing, NaN, infinity, negative and malformed data',()=>{
 for(const key of ['netFather','netMother','egNetFather','egNetMother'])for(const value of ['',undefined,NaN,Infinity,-1,'   ',false,[]]){
  const x=input();x.state[key]=value;const r=validate(x);assert.equal(r.valid,false,key+': '+String(value));assert.ok(has(r,'FINANCIAL_INPUT_INVALID_'+key));
 }
 const x=input();x.state.egNetFather=0;assert.equal(validate(x).valid,true);
});
test('part-time income is required only for parents using a part-time code',()=>{
 const x=input();delete x.state.ptNetFather;delete x.state.ptNetMother;assert.equal(validate(x).valid,true);
 x.schedule[2].f='R';assert.ok(has(validate(x),'FINANCIAL_INPUT_INVALID_ptNetFather'));
 x.state.ptNetFather=0;assert.equal(validate(x).valid,true);
 x.state.egPtNetFather=-1;assert.ok(has(validate(x),'FINANCIAL_INPUT_INVALID_egPtNetFather'));
});
test('missing catalogue rule retains safely renderable provenance object',()=>{
 const c=structuredClone(catalogue);c.rules=c.rules.filter(r=>r.id!=='BE-MUT');
 const r=validate(input(),c),f=r.findings.find(f=>f.code==='RULE_SOURCE_UNVERIFIED_BE-MUT');
 assert.ok(f.source);assert.equal(f.source.url,null);assert.equal(f.source.checkedAt,null);
});
test('raw maternity omissions are rejected and calendar comparison shares TimeAxes boundaries',()=>{
 const x=input();x.schedule[1].m='W';assert.ok(has(validate(x),'MATERNITY_STATUS_MISMATCH'));
 for(const date of ['2026-01-31','2026-02-28','2026-08-31','2026-12-31']){
  const y=input();y.state.date=date;assert.equal(validate(y).valid,true,date);
 }
});

test('calendar memo is bounded and invalidates by date, horizon and rule days without caching finances',()=>{
 const axes=require('../src/time-axes.cjs');let calendarBuilds=0;
 const module={exports:{}};
 runInNewContext(readFileSync(new URL('../src/rule-validator.cjs',import.meta.url),'utf8'),{module,require:id=>{
  assert.equal(id,'./time-axes.cjs');return {...axes,lifeMonths:(...args)=>{calendarBuilds++;return axes.lifeMonths(...args);}};
 }});
 const check=module.exports.validatePlan,x=input();
 assert.equal(check(x,catalogue).valid,true);
 const before=JSON.stringify(x);
 for(let i=0;i<10;i++)assert.equal(check(x,catalogue).valid,true);
 assert.equal(calendarBuilds,1);assert.equal(JSON.stringify(x),before);
 x.state.zve=180000;assert.equal(check(x,catalogue).valid,false);assert.equal(calendarBuilds,1);
 x.state.zve=95000;x.state.date='2026-06-28';assert.equal(check(x,catalogue).valid,true);assert.equal(calendarBuilds,2);
 x.schedule.push({f:'W',m:'W'});assert.equal(check(x,catalogue).valid,true);assert.equal(calendarBuilds,3);
 const c=structuredClone(catalogue);c.standard_parameters.standard_maternity_days_after_birth=58;
 check(x,c);assert.equal(calendarBuilds,4);
 check(input(),catalogue);assert.equal(calendarBuilds,5);
});
function leaveCatalogue(){
 const c=structuredClone(catalogue);
 if(!c.rules.some(r=>r.id==='BEEG-15'))c.rules.push({id:'BEEG-15',source:'§§ 15 und 16 BEEG',url:'https://www.gesetze-im-internet.de/beeg/__15.html',checked_at:'2026-10-14',effective_from:'2021-09-01',effective_to:null,verification_status:'official_source_checked'});
 return c;
}
test('negative or nonnumeric explicit budget costs cannot produce a plausible result',()=>{
 for(const field of ['expenses','childcareMonthly','goalMinIncome']){
  for(const value of [-1,NaN,Infinity,'abc','   ',false,[]]){const x=input();x.state[field]=value;assert.ok(has(validate(x),'BUDGET_INPUT_INVALID_'+field),field);}
  for(const value of [undefined,null,'',0,100]){const x=input();x.state[field]=value;assert.equal(validate(x).valid,true,field);}
 }
});
test('manual leave requires its current official source only when present',()=>{
 const c=structuredClone(catalogue);c.rules=c.rules.filter(r=>r.id!=='BEEG-15');assert.equal(validate(input(),c).valid,true);
 const x=input();x.state.leaveOverrides={father:[],mother:[]};assert.ok(has(validate(x,c),'RULE_SOURCE_UNVERIFIED_BEEG-15'));
 assert.equal(validate(x,leaveCatalogue()).valid,true);
});
test('manual employer leave remains independent from benefits and conflicts with full-time work',()=>{
 const x=input();x.state.leaveOverrides={father:[{startDate:'2027-07-28',endDate:'2027-08-27'}],mother:[]};
 const c=leaveCatalogue();const r=validate(x,c);assert.ok(has(r,'LEAVE_WORK_HOURS_EXCEEDED'));
 assert.deepEqual(r.findings.find(f=>f.code==='LEAVE_WORK_HOURS_EXCEEDED').lifeMonths,[15]);
 x.state.employmentOverrides={father:[{lm:15,weeklyHours:24}]};assert.equal(validate(x,c).valid,true);
 x.state.employmentOverrides.father[0].weeklyHours=33;assert.ok(has(validate(x,c),'LEAVE_WORK_HOURS_EXCEEDED'));
});
test('invalid manual intervals produce structured unsupported findings',()=>{
 for(const leaveOverrides of [[],true,{father:[{startDate:'2026-02-30',endDate:'2026-08-28'}]},{father:[{startDate:'2026-08-28'}]},{father:[{startDate:'2026-08-28',endDate:'2026-08-27'}]}]){
  const x=input();x.state.leaveOverrides=leaveOverrides;assert.ok(has(validate(x,leaveCatalogue()),'LEAVE_INTERVALS_INVALID'));
 }
});
test('overlapping or more than three manually entered leave sections require individual review',()=>{
 const x=input();x.state.leaveOverrides={father:[{startDate:'2026-07-28',endDate:'2026-08-15'},{startDate:'2026-08-01',endDate:'2026-08-27'}],mother:[]};
 const c=leaveCatalogue();assert.ok(has(validate(x,c),'LEAVE_OVERLAP'));assert.equal(validate(x,c).status,'NICHT_UNTERSTUETZT');
 x.state.leaveOverrides.father=[7,8,9,10].map(month=>({startDate:'2026-'+String(month).padStart(2,'0')+'-28',endDate:'2026-'+String(month).padStart(2,'0')+'-28'}));
 assert.ok(has(validate(x,c),'LEAVE_MANY_SEGMENTS'));
});
test('manual leave and explicit budget data are re-evaluated despite calendar memo hit',()=>{
 const x=input(),c=leaveCatalogue();x.state.expenses=1000;x.state.leaveOverrides={father:[],mother:[]};assert.equal(validate(x,c).valid,true);
 x.state.expenses=-1;assert.ok(has(validate(x,c),'BUDGET_INPUT_INVALID_expenses'));
 x.state.expenses=1000;x.state.leaveOverrides.father=[{startDate:'2027-07-28',endDate:'2027-08-27'}];assert.ok(has(validate(x,c),'LEAVE_WORK_HOURS_EXCEEDED'));
});
test('malformed special-case indicators cannot override a positive standard confirmation',()=>{
 for(const field of ['selfEmployed','singleParent','adoption','disability','siblingBonus','prematureBirth']){
  for(const value of [1,0,'true','false','1',{},[]]){
   const x=input();x.state[field]=value;assert.ok(has(validate(x),'SPECIAL_CASE_UNSUPPORTED'),field+': '+JSON.stringify(value));assert.equal(validate(x).status,'NICHT_UNTERSTUETZT');
  }
  for(const value of [undefined,null,false]){const x=input();x.state[field]=value;assert.equal(validate(x).valid,true);}
 }
 for(const value of ['self-employed','true',1,{},['self-employed']]){const x=input();x.state.specialCases=value;assert.ok(has(validate(x),'SPECIAL_CASE_UNSUPPORTED'));}
 for(const value of [undefined,null,false,'',[]]){const x=input();x.state.specialCases=value;assert.equal(validate(x).valid,true);}
});
test('unknown manual-parent keys are not silently discarded',()=>{
 for(const key of ['fater','f','m','guardian','Father','constructor']){
  const x=input();x.state.leaveOverrides={[key]:[{startDate:'2026-08-28',endDate:'2026-09-27'}]};
  assert.ok(has(validate(x,leaveCatalogue()),'LEAVE_INTERVALS_INVALID'),key);assert.equal(validate(x,leaveCatalogue()).valid,false);
 }
});
test('unverified or malformed rule validity cannot certify a standard allocation',()=>{
 for(const mutate of [r=>r.effective_to='invalid',r=>delete r.effective_to,r=>r.effective_to='2020-01-01',r=>r.checked_at='2026-10-16']){
  const c=structuredClone(catalogue);mutate(c.rules.find(r=>r.id==='BE-4'));
  assert.ok(has(validate(input(),c),'RULE_SOURCE_UNVERIFIED_BE-4'));assert.equal(validate(input(),c).status,'NICHT_UNTERSTUETZT');
 }
 for(const window of [{},{from:'invalid',through:'2026-12-31'},{from:'2026-12-31',through:'2025-01-01'}]){
  const c=structuredClone(catalogue);c.applicable_standard_birth_window=window;assert.ok(has(validate(input(),c),'BIRTH_COHORT_UNSUPPORTED'));
 }
});
test('over-budget allocation remains unsupported if its catalogue source has not been verified',()=>{
 const x=input();x.schedule[2].m='B';const c=structuredClone(catalogue);c.rules.find(r=>r.id==='BE-4').verification_status='source_listed_review_pending';
 const r=validate(x,c);assert.equal(r.status,'NICHT_UNTERSTUETZT');assert.equal(r.valid,false);assert.ok(has(r,'JOINT_BUDGET_EXCEEDED'));assert.ok(has(r,'RULE_SOURCE_UNVERIFIED_BE-4'));
});
test('minimum two benefit months applies to mother independently of father',()=>{
 const x=input();x.schedule[1].m='W';const r=validate(x);
 assert.ok(r.findings.some(f=>f.code==='MINIMUM_BENEFIT_MONTHS'&&f.parents.includes('mother')));assert.equal(r.valid,false);
});
test('Q above 32 hours conflicts only when parental leave is inferred or actually entered',()=>{
 const x=input();x.schedule[14].f='Q';x.schedule[14].hf=35;const c=leaveCatalogue();
 const inferred=validate(x,c);assert.equal(inferred.status,'REGELKONFLIKT');
 const f=inferred.findings.find(f=>f.code==='LEAVE_WORK_HOURS_EXCEEDED');assert.equal(f.ruleId,'BEEG-15');assert.deepEqual(f.parents,['father']);assert.deepEqual(f.lifeMonths,[15]);
 x.state.leaveOverrides={mother:[]};assert.ok(has(validate(x,c),'LEAVE_WORK_HOURS_EXCEEDED'));
 x.state.leaveOverrides={father:[],mother:[]};assert.equal(validate(x,c).valid,true);
 x.state.leaveOverrides.father=[{startDate:'2027-07-28',endDate:'2027-08-27'}];assert.ok(has(validate(x,c),'LEAVE_WORK_HOURS_EXCEEDED'));
});
test('BEEG-15 is required for over-limit derived Q but not unrelated ordinary basis cases',()=>{
 const c=structuredClone(catalogue);c.rules=c.rules.filter(r=>r.id!=='BEEG-15');const x=input();assert.equal(validate(x,c).valid,true);
 x.schedule[14].f='Q';x.schedule[14].hf=35;assert.ok(has(validate(x,c),'RULE_SOURCE_UNVERIFIED_BEEG-15'));assert.equal(validate(x,c).status,'NICHT_UNTERSTUETZT');
 x.schedule[14].hf=32;assert.equal(validate(x,c).valid,true);
 x.schedule[14].m='Q';x.schedule[14].hm=35;const r=validate(x,leaveCatalogue());assert.ok(r.findings.some(f=>f.code==='LEAVE_WORK_HOURS_EXCEEDED'&&f.parents.includes('mother')));
});
