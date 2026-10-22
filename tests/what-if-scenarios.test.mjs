import test from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const {projectWhatIf}=require('../src/what-if-scenarios.cjs');
const {projectDelayedCareScenario}=require('../src/care-impact.cjs');

function fixtures(){
 const codes=['MS','MS','W','W','W','W'];
 return Array.from({length:6},(_,i)=>{
  const lm=i+1,f=['R','R','W','W','W','W'][i],m=codes[i];
  const fi=f==='R'?500:1400,mi=m==='MS'?1100:1000;
  const wage=fi+mi,kind=250,eg=lm<=2?150:0,care=lm>=3?100:0,expenses=1200;
  return {lm,f,m,hf:f==='R'?28:40,hm:m==='MS'?0:40,
   fi,mi,maternityBenefits:m==='MS'?mi:0,
   totalWage:wage,totalEg:eg,kind,childcare:care,
   income:wage+eg+kind,cashAfter:wage+eg+kind-care-expenses};
 });
}
function scenario(config={}){
 return {rows:fixtures(),horizon:6,childcareStartLm:3,baseExpenses:1200,
  validationStatus:'NICHT_UNTERSTUETZT',assumptions:config};
}
test('neutral what-if is deterministic and does not mutate rows, monthly budget or eligibility',()=>{
 const input=scenario(),before=JSON.stringify(input);
 const a=projectWhatIf(input),b=projectWhatIf(input);
 assert.deepEqual(a,b);
 assert.equal(JSON.stringify(input),before);
 assert.equal(a.moneyComplete,true);
 assert.equal(a.budgetComparable,true);
 assert.equal(a.changedMonths,0);
 assert.equal(a.deltaTotalIncome,0);
 assert.equal(a.deltaTotalAvailable,0);
 assert.equal(a.bankReceiptsPredicted,false);
 assert.equal(a.benefitsRecalculated,false);
 assert.equal(a.legalStatusUnchanged,true);
 assert.equal(a.baseline.validationStatus,'NICHT_UNTERSTUETZT');
 assert.deepEqual(a.monthly.map(x=>x.alternativeIncome),a.monthly.map(x=>x.baselineIncome));
});
test('two months Kita delay only waives fees on explicit choice and reuses the existing care impact',()=>{
 const cfg={delayMonths:2,bridgeWageLoss:0,bridgeCareCost:0,waiveFees:true};
 const result=projectWhatIf(scenario(cfg));
 const original=projectDelayedCareScenario({rows:fixtures(),startLm:3,delayMonths:2,
  monthlyIncomeReduction:0,monthlyExtraCare:0,waiveOriginalFees:true,expensesKnown:true});
 assert.equal(original.totalChange,200);
 assert.equal(result.deltaTotalAvailable,original.totalChange);
 assert.equal(result.deltaTotalIncome,0);
 assert.equal(result.assumedCareStartLm,5);
 assert.equal(result.monthly[2].baselineCare,'planned-kita');
 assert.equal(result.monthly[2].alternativeCare,'not-documented');
 assert.equal(result.monthly[4].alternativeCare,'planned-kita');
 assert.equal(result.baseline.firstUnattributed,null);
 assert.equal(result.alternative.firstUnattributed,3);
 const noWaiver=projectWhatIf(scenario({...cfg,waiveFees:false}));
 assert.equal(noWaiver.deltaTotalAvailable,0);
});
test('bridge lost income and extra care are limited to shifted LM, not all months',()=>{
 const cfg={delayMonths:2,bridgeWageLoss:100,bridgeCareCost:45,waiveFees:false};
 const r=projectWhatIf(scenario(cfg));
 assert.equal(r.deltaTotalIncome,-200);
 assert.equal(r.deltaTotalAvailable,-290);
 assert.equal(r.monthly[1].alternativeAvailable,r.monthly[1].baselineAvailable);
 assert.equal(r.monthly[2].alternativeAvailable,r.monthly[2].baselineAvailable-145);
 assert.equal(r.monthly[3].alternativeAvailable,r.monthly[3].baselineAvailable-145);
 assert.equal(r.monthly[4].alternativeAvailable,r.monthly[4].baselineAvailable);
});
test('missing delay bridge amounts fail closed, including intentionally omitted zero',()=>{
 const r=projectWhatIf(scenario({delayMonths:2,waiveFees:true}));
 assert.equal(r.moneyComplete,false);
 assert.equal(r.budgetComparable,false);
 assert.equal(r.deltaTotalIncome,null);
 assert.equal(r.deltaTotalAvailable,null);
 assert.equal(r.alternative.totalAvailable,null);
 assert.equal(r.monthly[2].alternativeIncome,null);
 assert.equal(r.monthly[2].alternativeAvailable,null);
 assert.equal(r.missing.length,2);
 const almost=projectWhatIf(scenario({delayMonths:2,bridgeWageLoss:0,waiveFees:false}));
 assert.deepEqual(almost.missing.filter(x=>x.includes('Ersatzbetreuungskosten')).length,1);
});
test('hours alone do not recalculate wages or benefits and require explicit net change',()=>{
 const partial=projectWhatIf(scenario({fatherHours:20}));
 assert.equal(partial.moneyComplete,false);
 assert.equal(partial.deltaTotalIncome,null);
 assert.equal(partial.monthly[0].firstHours,20);
 assert.equal(partial.monthly[2].firstHours,40);
 assert.ok(partial.missing.some(x=>x.includes('Elternteil 1')));
 const explicit=projectWhatIf(scenario({fatherHours:20,fatherNetDelta:0}));
 assert.equal(explicit.moneyComplete,true);
 assert.equal(explicit.deltaTotalIncome,0);
 assert.equal(explicit.deltaTotalAvailable,0);
 assert.equal(explicit.alternative.months[0].first.hours,20);
 assert.equal(explicit.alternative.months[2].first.hours,40);
 assert.equal(explicit.alternative.months[0].benefit,scenario().rows[0].totalEg);
});
test('manual part-time net change is signed, bounded and applies only to existing part-time LM',()=>{
 const less=projectWhatIf(scenario({fatherHours:24,fatherNetDelta:-150}));
 assert.equal(less.moneyComplete,true);
 assert.equal(less.deltaTotalIncome,-300);
 assert.equal(less.deltaTotalAvailable,-300);
 assert.equal(less.monthly[0].alternativeIncome,less.monthly[0].baselineIncome-150);
 assert.equal(less.monthly[2].alternativeIncome,less.monthly[2].baselineIncome);
 const more=projectWhatIf(scenario({fatherNetDelta:100.25}));
 assert.equal(more.deltaTotalIncome,200.5);
 assert.equal(more.deltaTotalAvailable,200.5);
});
test('adverse earnings percent excludes maternity and benefit receipts, and expenses only affect rests',()=>{
 const r=projectWhatIf(scenario({wageDownsidePercent:10,expensesDelta:100}));
 assert.equal(r.deltaTotalIncome,-1060);
 assert.equal(r.deltaTotalAvailable,-1660);
 assert.equal(r.monthly[0].alternativeIncome,r.monthly[0].baselineIncome-50);
 assert.equal(r.monthly[0].alternativeAvailable,r.monthly[0].baselineAvailable-150);
 assert.equal(r.monthly[2].alternativeIncome,r.monthly[2].baselineIncome-240);
 assert.equal(r.monthly[0].alternativeIncome-r.monthly[0].baselineIncome,-50);
 assert.equal(r.alternative.months[0].benefit,150);
 assert.equal(r.alternative.months[0].first.hours,28);
});
test('unknown household expenses never show made-up total/minimum/required buffer',()=>{
 const input=scenario({wageDownsidePercent:10,expensesDelta:-50});
 input.baseExpenses=null;
 const r=projectWhatIf(input);
 assert.equal(r.moneyComplete,true);
 assert.equal(r.budgetComparable,false);
 assert.equal(r.baseline.totalAvailable,null);
 assert.equal(r.alternative.totalAvailable,null);
 assert.equal(r.deltaTotalAvailable,null);
 assert.equal(r.monthly[1].baselineAvailable,null);
 assert.equal(r.monthly[1].alternativeAvailable,null);
 assert.ok(Number.isFinite(r.deltaTotalIncome));
});
test('last two months delayed after horizon are disclosed, not silently ignored',()=>{
 const input=scenario({delayMonths:5,bridgeWageLoss:0,bridgeCareCost:0});
 input.childcareStartLm=5;
 const r=projectWhatIf(input);
 assert.equal(r.assumedCareStartLm,10);
 assert.equal(r.monthly.at(-1).alternativeCare,'not-documented');
 assert.ok(r.notes.some(x=>x.includes('außerhalb')));
});
test('invalid combinations fail closed without modifying input or blanket-clamping',()=>{
 const invalid=[
  [{delayMonths:7},/Kita-Verschiebung/],
  [{delayMonths:-1},/Kita-Verschiebung/],
  [{fatherHours:0,fatherNetDelta:0},/Teilzeitstunden/],
  [{fatherHours:33,fatherNetDelta:0},/Teilzeitstunden/],
  [{fatherHours:24.5,fatherNetDelta:0},/Teilzeitstunden/],
  [{motherHours:20,motherNetDelta:0},/keine Teilzeitmonate/],
  [{expensesDelta:-1300},/nicht negativ/],
  [{expensesDelta:10000.001},/Haushaltskostenänderung/],
  [{wageDownsidePercent:31},/Netto-Risikoband/],
  [{fatherNetDelta:-700},/Netto-Ausfall/],
  [{bridgeCareCost:-1,delayMonths:1,bridgeWageLoss:0},/Ersatzbetreuung/],
  [{waiveFees:'true'},/ausdrücklich/],
  [{delayMonths:1,bridgeWageLoss:0,bridgeCareCost:0},/Kita-Start/,'noCare'],
  [{fatherNetDelta:10000.01},/Nettoänderung/]
 ];
 for(const [assumptions,pattern,condition] of invalid){
  const data=scenario(assumptions);
  if(condition==='noCare')data.childcareStartLm=0;
  const original=JSON.stringify(data);
  assert.throws(()=>projectWhatIf(data),pattern,JSON.stringify(assumptions));
  assert.equal(JSON.stringify(data),original);
 }
});
test('first-week-to-last-month boundaries and variable source salary fractions are rounded to cents',()=>{
 const data=scenario({wageDownsidePercent:5,delayMonths:1,bridgeWageLoss:0,bridgeCareCost:12.25});
 data.rows[0].fi=500.123456;data.rows[0].totalWage=1600.123456;data.rows[0].income=2000.123456;
 data.rows[0].cashAfter=800.123456;
 const result=projectWhatIf(data);
 assert.equal(result.moneyComplete,true);
 assert.ok(result.monthly.every(x=>Number.isFinite(x.alternativeIncome)));
 assert.equal(result.assumedCareStartLm,4);
});
