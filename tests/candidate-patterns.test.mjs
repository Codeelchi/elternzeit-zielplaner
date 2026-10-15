import test from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {readFileSync} from 'node:fs';
const require=createRequire(import.meta.url);
const {mirrorCarePlan}=require('../src/candidate-patterns.cjs');
const {validatePlan}=require('../src/rule-validator.cjs');
const catalogue=JSON.parse(readFileSync(new URL('../data/rechtsregeln-de-nrw-2026-10-14.json',import.meta.url)));
const state={date:'2026-05-28',births:1,zve:95000,standardCaseConfirmed:true,hoursFather:28,hoursMother:28,netFather:3000,netMother:2800,egNetFather:2770,egNetMother:2500,ptNetFather:2000,ptNetMother:1900};
const plan=()=>Array.from({length:36},(_,i)=>({f:i>=2&&i<12?'B':'W',m:i<2?'MS':i>=12&&i<14?'B':'W'}));

test('standard 36-month template mirrors into a separately validated long maternal care plan',()=>{
 const original=plan();
 const result=mirrorCarePlan(original);
 assert.equal(result.length,36);
 assert.equal(validatePlan({state,schedule:original},catalogue).status,'PLAUSIBEL_STANDARD');
 const checked=validatePlan({state,schedule:result},catalogue);
 assert.equal(checked.status,'PLAUSIBEL_STANDARD',JSON.stringify(checked.findings));
 assert.deepEqual(checked.totals,{father:2,mother:12,joint:14,bonusMonths:0});
 assert.deepEqual(result.slice(2,12).map(row=>row.m),Array(10).fill('B'));
 assert.deepEqual(result.slice(12,14).map(row=>row.f),['B','B']);
 assert.ok(result.every(row=>row.f!=='MS'));
});

test('mirroring does not certify quota violations created by retained maternity months',()=>{
 const original=Array.from({length:36},(_,i)=>({f:i>=2&&i<14?'B':'W',m:i<2?'MS':'W'}));
 assert.equal(validatePlan({state,schedule:original},catalogue).valid,true);
 const checked=validatePlan({state,schedule:mirrorCarePlan(original)},catalogue);
 assert.equal(checked.status,'REGELKONFLIKT');
 assert.equal(checked.totals.mother,14);
});

test('all actual maternal protection rows stay maternal, including a third life month',()=>{
 const original=[{f:'B',m:'MS',hf:0,hm:28},{f:'P',m:'MS'},{f:'U',m:'MS'},{f:'T',m:'W',hf:24,hm:40}];
 const result=mirrorCarePlan(original);
 assert.deepEqual(result.slice(0,3),[{f:'W',m:'MS',hf:0,hm:28},{f:'W',m:'MS'},{f:'W',m:'MS'}]);
 assert.deepEqual(result[3],{f:'W',m:'T',hf:40,hm:24});
});

test('part-time, bonus, unpaid leave and exact optional hour overrides swap independently',()=>{
 const original=[{f:'R',m:'Q',hf:0},{f:'K',m:'K',hf:24,hm:32},{f:'U',m:'P',hm:0},{f:'T',m:'W'}];
 const result=mirrorCarePlan(original);
 assert.deepEqual(result,[{f:'Q',m:'R',hm:0},{f:'K',m:'K',hf:32,hm:24},{f:'P',m:'U',hf:0},{f:'W',m:'T'}]);
 assert.deepEqual(mirrorCarePlan(result),original);
});

test('frozen source rows remain unchanged and every result row is independent',()=>{
 const original=plan().map(row=>Object.freeze(row));
 Object.freeze(original);
 const before=JSON.stringify(original);
 const result=mirrorCarePlan(original);
 assert.equal(JSON.stringify(original),before);
 assert.notEqual(result,original);
 result.forEach((row,index)=>assert.notEqual(row,original[index]));
 result[3].m='U';
 assert.equal(original[3].f,'B');
});

test('empty arrays and malformed inputs have explicit behavior',()=>{
 assert.deepEqual(mirrorCarePlan([]),[]);
 for(const invalid of [null,{},'plan',[null],[{f:'invalid',m:'W'}]])assert.throws(()=>mirrorCarePlan(invalid),TypeError);
 assert.throws(()=>mirrorCarePlan([{f:'MS',m:'W'}]),RangeError);
});
