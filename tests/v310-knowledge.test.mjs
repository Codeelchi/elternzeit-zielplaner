import test from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const {DATA,SOURCES,selectPlanningKnowledge}=createRequire(import.meta.url)('../src/planning-knowledge.cjs');

test('standard guidance explains distinct periods and income without inventing money',()=>{
 const result=selectPlanningKnowledge({birthDate:'2026-10-16'});
 assert.equal(result.cards.length,6);assert.equal(result.totalEligible,6);assert.equal(result.omittedCount,0);
 assert.deepEqual(result.cards.map(c=>c.id),['life-months','income-basis','tax-reserve','insurance','application-retroactivity','leave-notice']);
 assert.deepEqual(result.budgetEffects,[]);assert.equal(result.coverage.notAnEligibilityCheck,true);
 assert.match(result.cards.find(c=>c.id==='life-months').action,/Bankeingang/);
 assert.match(result.cards.find(c=>c.id==='income-basis').summary,/nicht automatisch/);
});
test('part-time and childcare advice is selected only when relevant and its truncation is explicit',()=>{
 const active=selectPlanningKnowledge({partTime:true,childcareStartLm:13});
 assert.ok(active.cards.some(c=>c.id==='part-time-estimate'));
 assert.ok(active.cards.some(c=>c.id==='childcare-settling-in'));
 assert.equal(active.totalEligible,8);assert.equal(active.omittedCount,2);
 const all=selectPlanningKnowledge({partTime:true,childcareStartLm:13,limit:12});
 assert.equal(all.cards.length,8);assert.equal(all.omittedCount,0);
 assert.equal(selectPlanningKnowledge().cards.some(c=>c.id==='childcare-settling-in'),false);
 assert.match(all.cards.find(c=>c.id==='childcare-settling-in').summary,/fixes Standardintervall.*nicht/);
});
test('concrete LM example delegates month-end and leap-year handling to the shared calendar',()=>{
 for(const [birthDate,endDate] of [['2026-10-16','2026-11-15'],['2028-01-31','2028-02-29'],['2027-01-31','2027-02-28'],['2028-02-29','2028-03-28']]){
  const example=selectPlanningKnowledge({birthDate}).cards[0].example;
  assert.equal(example.startDate,birthDate);assert.equal(example.endDate,endDate);
 }
});
test('future and unknown births retain explicit limitations rather than certifying 2027',()=>{
 const future=selectPlanningKnowledge({birthDate:'2027-05-28',limit:12});
 assert.equal(future.coverage.futureBirthRequiresRecheck,true);
 assert.ok(future.cards.every(c=>c.validity.futureBirthRequiresRecheck));
 assert.ok(future.warnings.some(w=>w.includes('keine pauschale Bestätigung für 2027')));
 assert.ok(selectPlanningKnowledge().warnings.some(w=>w.includes('Ohne Geburtsdatum')));
 assert.equal(selectPlanningKnowledge({birthDate:'2026-10-16'}).coverage.futureBirthRequiresRecheck,false);
});
test('notice form retains the May 2025 birth-cohort distinction',()=>{
 const get=birthDate=>selectPlanningKnowledge({birthDate,limit:12}).cards.find(c=>c.id==='leave-notice');
 assert.match(get('2025-04-30').context.form,/Schriftform/);
 assert.equal(get('2025-05-01').context.form,'Textform');
 assert.equal(get('2026-10-16').validity.validFrom,'2025-05-01');
 assert.ok(get('2025-05-01').sources.some(s=>s.url.endsWith('/__28.html')));
});
test('voluntary and private insurance raise the relevant cost warning without changing budgets',()=>{
 for(const insuranceStatus of ['voluntary','private']){
  const result=selectPlanningKnowledge({insuranceStatus,partTime:true,childcareStartLm:13});
  assert.ok(result.cards.findIndex(c=>c.id==='insurance')<result.cards.findIndex(c=>c.id==='part-time-estimate'));
  assert.deepEqual(result.budgetEffects,[]);
  assert.match(result.cards.find(c=>c.id==='insurance').action,/Nicht bereits im Netto/);
 }
});
test('all guidance has dated official sources with scoped validity and no outbound user data',()=>{
 assert.equal(Object.keys(SOURCES).length,10);
 for(const card of selectPlanningKnowledge({partTime:true,childcareStartLm:1,limit:12}).cards){
  assert.ok(card.validity.scope.length>10);assert.equal(card.validity.verifiedThrough,'2026-10-16');
  assert.ok(card.sources.length>0);
  for(const source of card.sources){
   const url=new URL(source.url);
   assert.equal(url.protocol,'https:');assert.equal(url.search,'');assert.equal(url.hash,'');
   assert.ok(['www.gesetze-im-internet.de','familienportal.de','www.familienportal.nrw'].includes(url.hostname));
   assert.equal(source.verifiedAt,'2026-10-16');
  }
 }
});
test('selectors cannot mutate the frozen knowledge registry or leak previous profile state',()=>{
 assert.ok(Object.isFrozen(DATA));assert.ok(Object.isFrozen(DATA.cards[0].sources[0]));
 const first=selectPlanningKnowledge({incomeEntryMode:'official'});first.cards[0].title='changed';first.cards[0].sources[0].url='https://example.org';
 const next=selectPlanningKnowledge();assert.notEqual(next.cards[0].title,'changed');assert.notEqual(next.cards[0].sources[0].url,'https://example.org');
 assert.equal(next.cards.find(c=>c.id==='income-basis').context.incomeEntryMode,'estimate');
});
test('bad dates and incompatible profile values fail explicitly rather than showing misleading advice',()=>{
 for(const input of [{birthDate:'2027-02-29'},{birthDate:''},{partTime:'yes'},{childcareStartLm:-1},{childcareStartLm:97},{childcareStartLm:1.5},{incomeEntryMode:'gross'},{insuranceStatus:'free'},{limit:0},{limit:13},{region:null}]){
  assert.throws(()=>selectPlanningKnowledge(input));
 }
});
