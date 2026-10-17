import test from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const {summarizeRecordedLiquidity:calc}=createRequire(import.meta.url)('../src/recorded-liquidity.cjs');
const ledger=[{calendarMonth:'2026-06',netRecordedTransfers:1000.10},{calendarMonth:'2026-08',netRecordedTransfers:-500.05}];

test('groups ONLY recorded calendar transfers and explicitly identifies missing months',()=>{
 const result=calc({calendarCashflow:ledger});
 assert.equal(result.basis,'NUR_ERFASSTE_BANKBUCHUNGEN');
 assert.equal(result.totalRecorded,500.05);
 assert.deepEqual(result.months.map(x=>x.calendarMonth),['2026-06','2026-07','2026-08']);
 assert.deepEqual(result.months.map(x=>x.hasRecords),[true,false,true]);
 assert.equal(result.months[1].netRecordedTransfers,0);
 assert.equal(result.months[1].illustrativeBalance,null);
 assert.equal(result.completeLedger,false);
 assert.equal(result.firstNegativeIllustrativeMonth,null);
});
test('optional explicit reserve computes illustration, not inferred bank balance',()=>{
 const original=JSON.stringify(ledger);
 const result=calc({calendarCashflow:ledger,openingReserve:100});
 assert.equal(result.months[0].illustrativeBalance,1100.10);
 assert.equal(result.endIllustrativeReserve,600.05);
 assert.equal(JSON.stringify(ledger),original);
});
test('explicit reserve zero differs from absent reserve; negative example is labelled illustrative',()=>{
 const result=calc({calendarCashflow:[{calendarMonth:'2026-05',netRecordedTransfers:-100.01}],openingReserve:0});
 assert.equal(result.firstNegativeIllustrativeMonth,'2026-05');
 assert.equal(result.endIllustrativeReserve,-100.01);
 assert.equal(calc({calendarCashflow:[{calendarMonth:'2026-05',netRecordedTransfers:-100.01}]}).firstNegativeIllustrativeMonth,null);
});
test('empty calendar ledger makes no claim of completeness or observed monthly zero',()=>{
 const result=calc({openingReserve:50});
 assert.equal(result.months.length,0);
 assert.equal(result.endIllustrativeReserve,50);
 assert.equal(result.completeLedger,false);
});
test('calendar sorting follows months, not user entry order',()=>{
 const result=calc({calendarCashflow:[ledger[1],ledger[0]],openingReserve:0});
 assert.equal(result.months[0].calendarMonth,'2026-06');
});
test('bad months, duplicates, infinite sums and negative starting reserves are rejected',()=>{
 for(const value of ['2026-13','2026-00','2026-6','2026-02-01'])assert.throws(()=>calc({calendarCashflow:[{calendarMonth:value,netRecordedTransfers:0}]}),RangeError);
 assert.throws(()=>calc({calendarCashflow:[ledger[0],ledger[0]]}),RangeError);
 assert.throws(()=>calc({calendarCashflow:[{calendarMonth:'2026-01',netRecordedTransfers:Infinity}]}),RangeError);
 for(const reserve of [-1,Infinity,'100',100000.01,10.005])assert.throws(()=>calc({calendarCashflow:ledger,openingReserve:reserve}),RangeError);
});
test('recorded timeline refuses unsupported spans instead of inventing data',()=>{
 assert.throws(()=>calc({calendarCashflow:[
   {calendarMonth:'2025-01',netRecordedTransfers:0},{calendarMonth:'2034-01',netRecordedTransfers:0}
 ]}),RangeError);
});
