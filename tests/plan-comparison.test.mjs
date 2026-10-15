import test from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const {comparePlans}=createRequire(import.meta.url)('../src/plan-comparison.cjs');
const zeroBands={wagePercent:0,elterngeldPercent:0,costPercent:0};
const candidate=(values,codes=[])=>({calc:{rows:values.map((fi,i)=>({lm:i+1,fi,mi:0,maternityBenefits:0,f:codes[i]?.[0]??'W',m:codes[i]?.[1]??'U'}))}});

test('comparison delegates prefix reserves and bottleneck months to the budget model',()=>{
  const result=comparePlans([candidate([50,200,0])],{horizon:3,expenses:100,assumptions:zeroBands});
  assert.deepEqual(result.plans[0].realistic,{totalAvailable:-50,lowestAvailable:-100,bottleneckMonths:[1,3],requiredReserves:50});
  assert.deepEqual(result.plans[0].conservative,result.plans[0].realistic);
  assert.equal(result.bankReceiptsPredicted,false);
  assert.match(result.comparisonNote,/nur ein Vorschlag/);
});

test('shared minimum is respected and deltas are relative to first displayed plan',()=>{
  const result=comparePlans([candidate([50,200,0],[['U','W'],['U','W'],['W','W']]),candidate([150,150,150],[['W','U'],['W','U'],['W','U']])],{horizon:3,expenses:100,minimum:25,assumptions:zeroBands});
  assert.equal(result.plans[0].realistic.requiredReserves,125);
  assert.deepEqual(result.plans[0].delta.realistic,{totalAvailable:0,lowestAvailable:0,requiredReserves:0,bottleneckCount:0});
  assert.deepEqual(result.plans[1].delta.realistic,{totalAvailable:200,lowestAvailable:150,requiredReserves:-125,bottleneckCount:-2});
  assert.deepEqual(result.plans[1].delta.freeMonths,{father:-2,mother:3});
  assert.equal(result.comparisonNote,null);
});

test('all candidates use identical horizon, assumptions and costs',()=>{
  const first=candidate([100,100,999999]),second=candidate([100,100]);
  first.adverse={rows:[{fi:999999}]};
  const result=comparePlans([first,second],{horizon:2,expenses:40,minimum:50,assumptions:{wagePercent:20,costPercent:25,elterngeldPercent:0}});
  assert.deepEqual(result.plans[0].realistic,result.plans[1].realistic);
  assert.deepEqual(result.plans[0].conservative,{totalAvailable:60,lowestAvailable:30,bottleneckMonths:[1,2],requiredReserves:40});
  assert.equal(result.plans[0].realistic.totalAvailable,120);
  assert.throws(()=>comparePlans([first,second],{horizon:3}),/nicht vollständig/);
});

test('effective employment and explicit zero override original template codes',()=>{
  const item=candidate([0,0,0],[['B','MS'],['P','U'],['Q','R']]);
  item.calc.rows[1].hf=12;
  item.calc.rows[1].hm=0;
  item.schedule=[{f:'W',m:'W'},{f:'U',m:'W'},{f:'U',m:'U'}];
  const result=comparePlans([item],{horizon:3});
  assert.deepEqual(result.plans[0].freeMonths,{father:1,mother:2});
  assert.ok(result.warnings.some(w=>w.includes('keine tatsächlichen Betreuungsstunden')));
});

test('schedule fallback supports calc rows without codes and never mutates input',()=>{
  const item={schedule:[{f:'U',m:'MS'}],calc:{rows:[{fi:0,mi:100,maternityBenefits:100}]}};
  const before=JSON.stringify(item);
  const result=comparePlans([item],{horizon:1,assumptions:{wagePercent:100}});
  assert.deepEqual(result.plans[0].freeMonths,{father:1,mother:1});
  assert.equal(result.plans[0].conservative.totalAvailable,100);
  assert.equal(JSON.stringify(item),before);
});

test('null and empty financial inputs follow common zero/default conventions',()=>{
  const item=candidate([null,'']);
  const result=comparePlans([item],{horizon:2,expenses:'',minimum:null,assumptions:{wagePercent:0,fatherWagePercent:null,motherWagePercent:''}});
  assert.equal(result.plans[0].realistic.totalAvailable,0);
  assert.equal(result.plans[0].conservative.requiredReserves,0);
  assert.equal(result.assumptions.motherWagePercent,0);
});

test('malformed and incomplete comparisons fail explicitly instead of displaying partial results',()=>{
  for(const input of [null,[],{},[null],[{calc:null}]])assert.throws(()=>comparePlans(input,{horizon:1}));
  for(const horizon of [undefined,null,0,1.5,97])assert.throws(()=>comparePlans([candidate([0])],{horizon}),RangeError);
  const sparse={calc:{rows:Array(1)},schedule:[{f:'W',m:'W'}]};
  assert.throws(()=>comparePlans([sparse],{horizon:1}),TypeError);
  for(const value of [false,{},[],Infinity,-1])assert.throws(()=>comparePlans([candidate([value])],{horizon:1}),RangeError);
  assert.throws(()=>comparePlans([candidate([0],[['bad','W']])],{horizon:1}),TypeError);
  const hours=candidate([0]);hours.calc.rows[0].hm=-1;
  assert.throws(()=>comparePlans([hours],{horizon:1}),RangeError);
  assert.throws(()=>comparePlans([candidate([0])],{horizon:1,assumptions:null}),TypeError);
  assert.throws(()=>comparePlans([candidate([0])],{horizon:1,expenses:false}),RangeError);
  assert.throws(()=>comparePlans([candidate([0])],{horizon:1,assumptions:{wagePercent:false}}),RangeError);
});

test('fractional reserve is preserved so display can round upward without hiding a shortage',()=>{
  const result=comparePlans([candidate([99.99])],{horizon:1,expenses:100,assumptions:zeroBands});
  assert.ok(result.plans[0].realistic.requiredReserves>0);
  assert.equal(Math.ceil(result.plans[0].realistic.requiredReserves),1);
});

test('unverified grants stay excluded and bank ledger cannot inflate comparison',()=>{
  const item=candidate([0]);item.calc.rows[0].grant=1000;item.bankLedger=[{amount:5000}];
  const result=comparePlans([item],{horizon:1,confirmedGrants:[{id:'unverified',amount:1000,lm:1}]});
  assert.equal(result.plans[0].realistic.totalAvailable,0);
  assert.equal(result.plans[0].rejectedGrants.length,1);
  assert.ok(result.warnings.some(w=>w.includes('Manuelle Zusatzleistungen')));
});
