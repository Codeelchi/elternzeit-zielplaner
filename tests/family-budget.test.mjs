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
