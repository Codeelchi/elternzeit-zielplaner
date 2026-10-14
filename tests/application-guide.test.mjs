import test from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const {buildApplicationGuide}=createRequire(import.meta.url)('../src/application-guide.cjs');
test('Cologne authority and NRW route with dated official sources',()=>{
 const g=buildApplicationGuide({birthDate:'2027-05-28'});
 assert.equal(g.authority.name,'Elterngeldstelle der Stadt Köln');
 assert.equal(g.applicationUrl,'https://familienportal.nrw/elterngeld');
 assert.equal(g.legalCoverage.futureBirthRequiresRecheck,true);
 assert.deepEqual(g.regionalBenefitsIncluded,[]);
 assert.ok(g.tasks.every(t=>t.source.verifiedAt==='2026-10-14'));
});
test('seven-week birth notice uses estimated birth; later sections independent',()=>{
 const g=buildApplicationGuide({birthDate:'2026-06-01',expectedBirthDate:'2026-06-08',leavePeriods:{father:[{startDate:'2026-06-01',endDate:'2026-08-01'},{startDate:'2027-01-01',endDate:'2027-02-01'}]}});
 assert.equal(g.tasks.find(t=>t.id==='leave-father-0').dueDate,'2026-04-20');
 assert.equal(g.tasks.find(t=>t.id==='leave-father-1').dueDate,'2026-11-13');
});
test('later parental leave uses thirteen weeks',()=>{
 const g=buildApplicationGuide({birthDate:'2026-06-01',leavePeriods:{mother:[{startDate:'2029-06-01',endDate:'2029-07-01'}]}});
 assert.equal(g.tasks.find(t=>t.id==='leave-mother-0').dueDate,'2029-03-02');
});
test('LM1 remains retroactively attainable through end LM4, not only LM3',()=>{
 const task=buildApplicationGuide({birthDate:'2027-05-28'}).tasks.find(t=>t.id==='elterngeld');
 assert.equal(task.dueDate,'2027-09-27');assert.equal(task.recommendedDate,'2027-05-28');
 const later=buildApplicationGuide({birthDate:'2027-05-28',firstBenefitMonth:5}).tasks.find(t=>t.id==='elterngeld');
 assert.equal(later.dueDate,'2028-01-27');
});
test('unknown region never invents local authority',()=>{
 const g=buildApplicationGuide({birthDate:'2026-05-01',region:'BY',city:'München'});
 assert.equal(g.authority,null);assert.equal(g.applicationUrl,null);
 assert.ok(g.warnings.some(w=>w.includes('örtliche')));
});
test('invalid or inverted dates and impossible benefit month rejected',()=>{
 assert.throws(()=>buildApplicationGuide({birthDate:'2027-02-29'}),RangeError);
 assert.throws(()=>buildApplicationGuide({birthDate:'2027-01-01',firstBenefitMonth:33}),RangeError);
 assert.throws(()=>buildApplicationGuide({birthDate:'2027-01-01',leavePeriods:{mother:[{startDate:'2027-03-01',endDate:'2027-02-01'}]}}),RangeError);
});
