import test from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const {projectFamilyBudget}=createRequire(import.meta.url)('../src/family-budget.cjs');
const row=(lm,fi=1000)=>({lm,fi,mi:0,fg:200,mg:0,kind:250,childcare:100});
test('three independent scenario bands vary wages, EG and costs separately',()=>{
 const b=projectFamilyBudget({rows:[row(1)],expenses:500,assumptions:{wagePercent:10,elterngeldPercent:20,costPercent:30}});
 assert.equal(b.scenarios[0].months[0].income,1310);
 assert.equal(b.scenarios[0].months[0].available,530);
 assert.equal(b.scenarios[1].months[0].available,850);
 assert.equal(b.scenarios[2].months[0].available,1170);
 assert.equal(b.bankReceiptsPredicted,false);
});
test('reserve uses maximum prefix shortage, not sum of all deficit months',()=>{
 const rows=[{lm:1,fi:50},{lm:2,fi:200},{lm:3,fi:0}];
 const b=projectFamilyBudget({rows,expenses:100,assumptions:{wagePercent:0,costPercent:0}}).scenarios[1];
 assert.equal(b.requiredReserves,50);assert.deepEqual(b.bottleneckMonths,[1,3]);
});
test('minimum buffer contributes to required reserves',()=>{
 assert.equal(projectFamilyBudget({rows:[{fi:150}],expenses:100,minimum:100}).scenarios[1].requiredReserves,50);
});
test('unverified row grants and incomplete or expired regional grants excluded',()=>{
 const b=projectFamilyBudget({rows:[{fi:0,grant:200}],confirmedGrants:[{id:'x',confirmed:true,amount:300,lm:1},{id:'expired',confirmed:true,amount:300,lm:1,sourceUrl:'https://example.invalid',verifiedAt:'2026-10-14',validFrom:'2025-01-01',validUntil:'2025-12-31',entitlementDate:'2026-01-01'}]});
 assert.equal(b.scenarios[1].totalIncome,0);assert.equal(b.rejectedGrants.length,2);assert.ok(b.warnings.some(w=>w.includes('Manuelle')));
});
test('dated individual confirmed grant included once and fixed across bands',()=>{
 const b=projectFamilyBudget({rows:[{fi:0}],confirmedGrants:[{confirmed:true,amount:300,lm:1,sourceUrl:'https://example.invalid',verifiedAt:'2026-10-14',validFrom:'2026-01-01',validUntil:'2026-12-31',entitlementDate:'2026-02-01'}]});
 assert.deepEqual(b.scenarios.map(s=>s.totalIncome),[300,300,300]);
});
test('explicit maternity decomposition avoids double counting',()=>{
 const b=projectFamilyBudget({rows:[{fi:0,mi:2000,maternityBenefits:2000}],assumptions:{wagePercent:50}});
 assert.deepEqual(b.scenarios.map(s=>s.totalIncome),[2000,2000,2000]);
 assert.throws(()=>projectFamilyBudget({rows:[{mi:100,maternityBenefits:200}]}),RangeError);
});
test('bad amounts, bands and discontinuous months rejected',()=>{
 for(const rows of [[{fi:-1}],[{fi:Infinity}],[{lm:2,fi:1}]])assert.throws(()=>projectFamilyBudget({rows}),RangeError);
 assert.throws(()=>projectFamilyBudget({rows:[]}),TypeError);
 assert.throws(()=>projectFamilyBudget({rows:[row(1)],assumptions:{costPercent:101}}),RangeError);
});
test('parent-specific uncertainty affects only that parent and keeps maternity fixed',()=>{
 const b=projectFamilyBudget({rows:[{fi:1000,mi:2000,maternityBenefits:1500,fg:200,mg:0}],assumptions:{fatherWagePercent:10,motherWagePercent:40,elterngeldPercent:0}});
 assert.deepEqual(b.scenarios.map(s=>s.months[0].fatherWage),[900,1000,1100]);
 assert.deepEqual(b.scenarios.map(s=>s.months[0].motherWage),[300,500,700]);
 assert.deepEqual(b.scenarios.map(s=>s.months[0].maternityBenefits),[1500,1500,1500]);
 assert.deepEqual(b.scenarios.map(s=>s.totalIncome),[2900,3200,3500]);
 for(const s of b.scenarios){
  const r=s.months[0];
  assert.equal(r.wages,r.fatherWage+r.motherWage);
  assert.equal(r.income,r.wages+r.maternityBenefits+r.elterngeld+r.kindergeld+r.confirmedAdditionalBenefits);
 }
});
test('each missing parent band falls back independently to shared wagePercent',()=>{
 const options={rows:[{fi:1000,mi:1000}],assumptions:{wagePercent:20,fatherWagePercent:0}};
 const b=projectFamilyBudget(options);
 assert.equal(b.scenarios[0].months[0].fatherWage,1000);
 assert.equal(b.scenarios[0].months[0].motherWage,800);
 assert.equal(b.assumptions.fatherWagePercent,0);
 assert.equal(b.assumptions.motherWagePercent,20);
 const legacy=projectFamilyBudget({rows:options.rows,assumptions:{wagePercent:20}});
 assert.deepEqual(legacy.scenarios.map(s=>s.months[0].wages),[1600,2000,2400]);
 const reverse=projectFamilyBudget({rows:options.rows,assumptions:{wagePercent:20,motherWagePercent:0}});
 assert.equal(reverse.scenarios[0].months[0].fatherWage,800);
 assert.equal(reverse.scenarios[0].months[0].motherWage,1000);
});
test('maternity cannot consume father income to conceal an invalid decomposition',()=>{
 assert.throws(()=>projectFamilyBudget({rows:[{fi:1000,mi:100,maternityBenefits:200}]}),RangeError);
 const b=projectFamilyBudget({rows:[{fi:1000,mi:2000,maternityBenefits:2000}],assumptions:{fatherWagePercent:100,motherWagePercent:100}});
 assert.deepEqual(b.scenarios.map(s=>s.months[0].motherWage),[0,0,0]);
 assert.deepEqual(b.scenarios.map(s=>s.totalIncome),[2000,3000,4000]);
});
test('explicit zero maternity is a known decomposition; absent maternity warns',()=>{
 const withZero=projectFamilyBudget({rows:[{fi:1000,mi:1000,maternityBenefits:0}]});
 assert.ok(!withZero.warnings.some(w=>w.includes('Ohne explizite')));
 assert.ok(projectFamilyBudget({rows:[{fi:1000,mi:1000}]}).warnings.some(w=>w.includes('Ohne explizite')));
});
test('parent bands validate both boundaries and optional empty fallback',()=>{
 for(const key of ['fatherWagePercent','motherWagePercent']){
  for(const value of [-1,101,Infinity,'invalid'])assert.throws(()=>projectFamilyBudget({rows:[row(1)],assumptions:{[key]:value}}),RangeError);
  for(const value of [null,undefined,''])assert.equal(projectFamilyBudget({rows:[row(1)],assumptions:{wagePercent:25,[key]:value}}).assumptions[key],25);
 }
});


test('verified grants beyond selected horizon are visibly rejected rather than silently dropped',()=>{
 const grant={id:'future',confirmed:true,amount:55,lm:5,sourceUrl:'https://example.invalid',verifiedAt:'2026-10-17',validFrom:'2026-01-01',validUntil:'2026-12-31',entitlementDate:'2026-05-01'};
 const b=projectFamilyBudget({rows:[{fi:300}],confirmedGrants:[grant]});
 assert.equal(b.scenarios[1].totalIncome,300);
 assert.equal(b.rejectedGrants.length,1);
 assert.equal(b.rejectedGrants[0].id,'future');
 assert.match(b.warnings.join(' '),/außerhalb des Planungshorizonts/);
});

test('parent Elterngeld scenario roundings are separated before aggregation',()=>{
 const b=projectFamilyBudget({rows:[{fi:0,fg:0.05,mg:0.05}],assumptions:{wagePercent:0,elterngeldPercent:10,costPercent:0}});
 assert.deepEqual(b.scenarios.map(x=>x.totalIncome),[0.10,0.10,0.12]);
});
