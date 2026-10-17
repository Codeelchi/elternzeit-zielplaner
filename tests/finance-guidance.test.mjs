import test from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const {buildFinanceGuidance:guide}=createRequire(import.meta.url)('../src/finance-guidance.cjs');
for(const type of ['unknown','mandatory','voluntary','private','family'])test('insurance class '+type+' is informational and never silently sets a monetary charge',()=>{
 const r=guide({insuranceMode:type,hasHouseholdExpenses:true,insuranceIncluded:'yes'});
 assert.equal(r.cards.length,2);
 assert.equal(r.cards[0].amountMode,'NOT_ESTIMATED');
 assert.equal(r.noAutomaticCostAdjustment,true);
 assert.ok(r.cards.every(c=>c.source.url.startsWith('https://familienportal.de/')));
});
test('voluntary or private insurance warns about contributions, but not fake premiums',()=>{
 assert.match(guide({insuranceMode:'voluntary'}).cards[0].message,/Mindestbeitrag/);
 assert.match(guide({insuranceMode:'private'}).cards[0].message,/Arbeitgeberzuschuss/);
});
test('tax progression remains explanatory, not a tax calculation',()=>{
 const r=guide({insuranceMode:'mandatory'});
 assert.match(r.cards[1].message,/Progressionsvorbehalt/);
 assert.equal(r.cards[1].amountMode,'NOT_ESTIMATED');
});
test('expense inclusion is explicitly distinguished from unknown',()=>{
 assert.match(guide({hasHouseholdExpenses:true,insuranceIncluded:'no'}).warnings.join(' '),/NICHT/);
 assert.match(guide({hasHouseholdExpenses:true,insuranceIncluded:'unknown'}).warnings.join(' '),/Unbekannt/);
 assert.equal(guide({hasHouseholdExpenses:true,insuranceIncluded:'yes',insuranceMode:'mandatory'}).warnings.length,0);
});
test('invalid insurance and cost states are refused',()=>{
 assert.throws(()=>guide({insuranceMode:'xyz'}),RangeError);
 assert.throws(()=>guide({hasHouseholdExpenses:'yes'}),TypeError);
 assert.throws(()=>guide({insuranceIncluded:'maybe'}),RangeError);
});
