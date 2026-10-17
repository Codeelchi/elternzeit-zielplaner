import test from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const {precedingMonths,benefitNavigator:nav}=createRequire(import.meta.url)('../src/benefits-navigator.cjs');
test('KiZ documentation window is 6 preceding whole calendar months, not 6 arbitrary life months',()=>{
 assert.deepEqual(precedingMonths('2027-02-28'),['2026-08','2026-09','2026-10','2026-11','2026-12','2027-01']);
 assert.deepEqual(precedingMonths('2028-03-01'),['2027-09','2027-10','2027-11','2027-12','2028-01','2028-02']);
});
test('no application date never guesses historical income or grants',()=>{
 const r=nav();
 assert.equal(r.date,null);
 assert.deepEqual(r.cards[0].months,[]);
 assert.equal(r.autoAddedMonthlyBenefit,0);
 assert.equal(r.legalEntitlementInferred,false);
});
test('repeat KiZ application does not claim a specific automatic income window',()=>{
 const r=nav({applicationDate:'2027-04-03',alreadyReceivesKiZ:true,hasBudgetGap:true});
 assert.match(r.cards[0].warning,/Folgeanträgen/);
 assert.deepEqual(r.cards[0].months,[]);
 assert.equal(r.indication,'BUDGET_LUECKE');
 assert.equal(r.autoAddedMonthlyBenefit,0);
 assert.ok(r.cards.every(c=>c.url.startsWith('https://')));
});
test('invalid dates and input types refused',()=>{
 assert.throws(()=>nav({applicationDate:'2027-02-30'}),RangeError);
 assert.throws(()=>precedingMonths('2026-10-01',13),RangeError);
 assert.throws(()=>nav({hasBudgetGap:'no'}),TypeError);
});
