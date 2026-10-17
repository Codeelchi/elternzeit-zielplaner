import test from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const {compareExpectedPayments:compare,validatePayments:validate}=createRequire(import.meta.url)('../src/expected-payments.cjs');
const base=[
 {id:'pay1',date:'2026-06-05',direction:'incoming',category:'elterngeld',amount:1000},
 {id:'rent1',date:'2026-06-06',direction:'outgoing',category:'household',amount:800},
 {id:'pay2',date:'2026-07-05',direction:'incoming',category:'wage',amount:1000},
 {id:'rent2',date:'2026-07-06',direction:'outgoing',category:'household',amount:800}
];
test('an assumed payment delay moves incomes only, not outgoing bills or entitlement',()=>{
 const before=JSON.stringify(base),r=compare({payments:base,delayDays:7,openingReserve:0});
 assert.equal(r.regular.requiredBuffer,0);
 assert.equal(r.delayed.requiredBuffer,800);
 assert.equal(r.additionalBuffer,800);
 assert.equal(r.delayed.firstPeakShortfallDate,'2026-06-06');
 assert.equal(r.actualBankLedgerIncluded,false);
 assert.equal(r.legalEntitlementInferred,false);
 assert.equal(r.delayed.events.find(p=>p.id==='rent1').plannedDate,'2026-06-06');
 assert.equal(r.delayed.events.find(p=>p.id==='pay1').plannedDate,'2026-06-12');
 assert.equal(JSON.stringify(base),before);
});
test('daily gaps are found even when the two transfers occur within the same calendar month',()=>{
 const p=[
  {id:'rent',date:'2026-05-01',direction:'outgoing',category:'household',amount:100},
  {id:'pay',date:'2026-05-31',direction:'incoming',category:'wage',amount:100}
 ];
 const r=compare({payments:p,openingReserve:0});
 assert.equal(r.regular.months.length,1);
 assert.equal(r.regular.months[0].plannedNet,0);
 assert.equal(r.regular.requiredBuffer,100);
 assert.equal(r.regular.firstPeakShortfallDate,'2026-05-01');
});
test('payments on the same date use a conservative outgoing-first convention',()=>{
 const p=[
  {id:'pay',date:'2026-05-05',direction:'incoming',category:'wage',amount:200},
  {id:'rent',date:'2026-05-05',direction:'outgoing',category:'household',amount:100}
 ];
 assert.equal(compare({payments:p}).regular.requiredBuffer,100);
});
test('missing opening reserve is not inferred from a model or actual bank',()=>{
 const r=compare({payments:base,delayDays:7});
 assert.equal(r.regular.assumedOpeningReserve,null);
 assert.equal(r.delayed.minimumIllustrativeBalance,null);
 assert.equal(r.delayed.requiredBuffer,800);
});
test('month boundary shift and leap days use UTC calendar date arithmetic',()=>{
 const p=[{id:'one',date:'2028-02-28',direction:'incoming',category:'other',amount:50.01}];
 const r=compare({payments:p,delayDays:2});
 assert.equal(r.delayed.events[0].plannedDate,'2028-03-01');
 assert.equal(r.delayed.months[0].calendarMonth,'2028-03');
});
test('plan with no explicit payment has no claimed actual incoming money',()=>{
 const r=compare({openingReserve:500,delayDays:60});
 assert.equal(r.paymentCount,0);
 assert.equal(r.regular.events.length,0);
 assert.equal(r.delayed.requiredBuffer,0);
 assert.equal(r.regular.netScheduled,0);
});
test('rejects duplicates, unknown categories, bogus dates, negative and overprecise money',()=>{
 const good=base[0];
 for(const val of [-1,0.001,100000.01,Infinity,NaN,'200'])
  assert.throws(()=>validate([{...good,amount:val}]),RangeError);
 for(const date of ['2027-02-29','2026-13-01','2026-6-04','2026-02-30'])
  assert.throws(()=>validate([{...good,date}]),RangeError);
 assert.throws(()=>validate([good,good]),RangeError);
 assert.throws(()=>validate([{...good,category:'unknown'}]),RangeError);
 assert.throws(()=>validate([{...good,direction:'no'}]),RangeError);
 assert.throws(()=>compare({payments:base,delayDays:91}),RangeError);
 for(const bad of [-1,2.001,'100'])assert.throws(()=>compare({payments:base,openingReserve:bad}),RangeError);
});
test('rejects oversized lists and more than 96 months of unsupported planning horizon',()=>{
 assert.throws(()=>validate(Array.from({length:37},(_,i)=>({...base[0],id:'payment-'+i}))),RangeError);
 const p=[{...base[0],date:'2000-01-05'},{...base[1],date:'2099-12-05'}];
 assert.throws(()=>compare({payments:p}),RangeError);
});
