import test from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const {childcareLawWindow:get,minusMonths}=createRequire(import.meta.url)('../src/kibiz-cohorts.cjs');
test('before and after 1 Aug 2027 use separate promulgated statutory versions',()=>{
 const a=get({birthDate:'2026-05-28',careStartDate:'2027-07-31'});
 const b=get({birthDate:'2026-05-28',careStartDate:'2027-08-01'});
 assert.equal(a.lawVersion,'2026-08-01');assert.equal(a.lawStatus,'EFFECTIVE');
 assert.equal(b.lawVersion,'2027-08-01');assert.equal(b.lawStatus,'PROMULGATED_FUTURE_EFFECTIVE');
 assert.equal(b.noticeDate,'2027-02-01');
 assert.equal(b.noticeLawVersion,'2026-08-01');
 assert.equal(b.feesBooked,0);assert.equal(b.feeWaiverNotCalculated,true);
 assert.equal(b.waiverIndividuallyConfirmed,false);
});
test('candidate contribution waiver year uses 30 September four-year threshold, not month index',()=>{
 const before=get({birthDate:'2023-09-30',careStartDate:'2027-08-01'});
 const after=get({birthDate:'2023-10-01',careStartDate:'2027-08-01'});
 assert.equal(before.indicativeFeeWaiverFrom,'2027-08-01');
 assert.equal(after.indicativeFeeWaiverFrom,'2028-08-01');
 assert.equal(before.indicativeFeeWaiverReachedAtCareStart,true);
 assert.equal(after.indicativeFeeWaiverReachedAtCareStart,false);
});
test('clamps month-end notice properly across leap year',()=>{
 assert.equal(minusMonths('2028-08-31',6),'2028-02-29');
 assert.equal(minusMonths('2027-08-31',6),'2027-02-28');
});
test('Köln local early pre-registration never replaces statutory six-month date',()=>{
 const r=get({birthDate:'2026-05-28',careStartDate:'2028-01-01',city:'Köln'});
 assert.equal(r.noticeDate,'2027-07-01');
 assert.equal(r.localEarlyNoticeDate,'2027-04-01');
 assert.equal(r.feesBooked,0);
});
test('non NRW never gets fictitious deadline or childcare waiver',()=>{
 const r=get({birthDate:'2026-05-28',careStartDate:'2027-09-01',region:'BY'});
 assert.equal(r.supported,false);assert.equal(r.noticeDate,null);
});
test('2025 rates are explicitly not verified as 2027 childcare rate',()=>{
 const r=get({birthDate:'2026-05-28',careStartDate:'2027-09-01'});
 assert.equal(r.historicalMunicipalFeeVerifiedForCareDate,false);
 assert.equal(r.assessedAgainstLocalTariff,false);
});
test('invalid dates and wrong types reject before generating legal-looking deadlines',()=>{
 for(const birthDate of ['2027-02-29','2026-2-01','','../../etc'])assert.throws(()=>get({birthDate,careStartDate:'2027-08-01'}));
 assert.throws(()=>get({birthDate:'2026-05-28',careStartDate:'2027-02-30'}));
 assert.throws(()=>get({birthDate:'2026-05-28',careStartDate:'2027-08-01',region:123}),TypeError);
});
