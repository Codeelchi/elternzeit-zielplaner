import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import TimeAxes from '../src/time-axes.cjs';

// The 7/31 numbers are published independently in BEEG-RL 07/2026, section
// 3.1.2. This is a calendar/proration regression, NOT an independently
// verified full-family benefit decision or a resolution of the 4/5-day dispute.
const evidence=JSON.parse(readFileSync(new URL('../data/amtliche-richtlinien-teilmonate-2026-10-18.json',import.meta.url),'utf8'));
test('the official July 2026 BEEG guidelines example remains a partial-month reference, not an external family approval',()=>{
 assert.match(evidence.sourceUrl,/bmbfsfj\.bund\.de\/resource\/blob\/.*richtlinien-zum-beeg-data\.pdf/);
 assert.match(evidence.sourcePublication,/07\/2026/);
 assert.match(evidence.section,/3\.1\.2/);
 assert.equal(evidence.evidenceClass,'official_published_example_partial_month_only');
 assert.equal(evidence.example.childLifeMonthDays,31);
 assert.equal(evidence.example.maternityBenefitDays,7);
 assert.equal(evidence.example.matchingBenefitFraction,'7/31');
 assert.equal(evidence.independentlyVerifiedFullFamily,false);
 assert.equal(evidence.publicReleaseApproved,false);
});
test('time-axis overlap matches the independently published 7-of-31-day proration shape',()=>{
 const month=TimeAxes.lifeMonths('2026-05-01',1)[0];
 assert.equal(month.startDate,'2026-05-01');
 assert.equal(month.endDate,'2026-05-31');
 assert.equal(month.days,31);
 const covered=TimeAxes.daysOverlapInclusive(month.startDate,month.endDate,'2026-05-01','2026-05-07');
 assert.equal(covered,7);
 assert.equal(month.days-covered,24);
 assert.equal(covered/month.days,7/31);
});
test('a public 5/30 example and the 4/30 protection derivation remain separate, contested evidence',()=>{
 const item=evidence.contestedExample;
 const months=TimeAxes.lifeMonths(item.birthDate,2);
 const protection=TimeAxes.maternityTimeline({birthDate:item.birthDate,expectedDueDate:item.birthDate,postnatalDays:56});
 assert.equal(months[1].startDate,item.lifeMonthStart);
 assert.equal(months[1].endDate,item.lifeMonthEnd);
 assert.equal(months[1].days,30);
 assert.equal(protection.postnatal.endDate,'2026-07-15');
 const coverage=TimeAxes.daysOverlapInclusive(months[1].startDate,months[1].endDate,protection.postnatal.startDate,protection.postnatal.endDate);
 assert.equal(months[1].days-coverage,4);
 assert.equal(item.federalPortal.remainingDays,5);
 assert.equal(item.timeAxisImplementation.remainingDays,4);
 assert.equal(item.status,'UNRESOLVED_EXTERNAL_EXPERT_REVIEW_REQUIRED');
 assert.equal(item.financialDecisionAllowed,false);
});
