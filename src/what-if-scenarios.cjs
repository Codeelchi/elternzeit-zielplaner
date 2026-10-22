'use strict';

// Strictly hypothetical, read-only comparison of the existing evaluated life months.
// Reuses the project's independent care-delay impact model and family overview.
// Does NOT re-evaluate benefits, infer net salary from hours, or predict bank receipts.
const {projectDelayedCareScenario}=require('./care-impact.cjs');
const {buildFamilyView}=require('./family-overview.cjs');

const PART_TIME=new Set(['R','T','Q','K']);
function moneyCents(value,label,{signed=false,limit=1e9}={}) {
 if(typeof value!=='number'||!Number.isFinite(value)||Math.abs(value)>limit||(!signed&&value<0)||
    Math.abs(value*100-Math.round(value*100))>1e-6)
  throw new RangeError(label+': gültigen Eurobetrag mit maximal zwei Dezimalstellen eingeben.');
 return Math.round(value*100);
}
// Existing evaluated wage rows may contain more than two decimal places (hour
// interpolation). Normalize source projections to cents; require exact cents
// only for NEW user-entered hypothetical assumptions.
function sourceCents(value,label,{signed=false}={}) {
 if(typeof value!=='number'||!Number.isFinite(value)||Math.abs(value)>1e9||(!signed&&value<0))
  throw new RangeError(label+': ungültiger Monatswert.');
 return Math.round(value*100);
}
function optionMoney(value,label) {
 if(value===null)return null;
 return moneyCents(value,label,{signed:true,limit:10000});
}
function optionalHours(value,label) {
 if(value===null)return null;
 if(!Number.isInteger(value)||value<1||value>32)throw new RangeError(label+': 1 bis 32 Wochenstunden erforderlich.');
 return value;
}
function boundedInt(value,label,min,max) {
 if(!Number.isInteger(value)||value<min||value>max)throw new RangeError(label+': Zahl zwischen '+min+' und '+max+' erforderlich.');
 return value;
}
function euros(cents){return Math.round(cents)/100;}
function projectWhatIf({
 rows,horizon,childcareStartLm=0,baseExpenses=null,
 validationStatus='NICHT_UNTERSTUETZT',assumptions={}
}={}) {
 if(!Array.isArray(rows)||rows.length<1||rows.length>36)throw new RangeError('Monatsdaten fehlen oder liegen außerhalb von LM 1–36.');
 boundedInt(horizon,'Vergleichshorizont',1,rows.length);
 boundedInt(childcareStartLm,'Kita-Start',0,36);
 if(!assumptions||typeof assumptions!=='object'||Array.isArray(assumptions))throw new TypeError('Szenarioannahmen müssen ein Objekt sein.');
 const expensesKnown=baseExpenses!==null;
 const oldExpenses=expensesKnown?moneyCents(baseExpenses,'Bisherige Haushaltsausgaben',{limit:100000}):null;
 const delay=boundedInt(assumptions.delayMonths??0,'Kita-Verschiebung',0,6);
 const wageBand=boundedInt(assumptions.wageDownsidePercent??0,'Netto-Risikoband',0,30);
 const changeExpenses=moneyCents(assumptions.expensesDelta??0,'Haushaltskostenänderung',{signed:true,limit:10000});
 if(expensesKnown&&oldExpenses+changeExpenses<0)throw new RangeError('Alternative Haushaltsausgaben dürfen nicht negativ werden.');
 const fatherHours=optionalHours(assumptions.fatherHours??null,'Teilzeitstunden Elternteil 1');
 const motherHours=optionalHours(assumptions.motherHours??null,'Teilzeitstunden Elternteil 2');
 const fatherDelta=optionMoney(assumptions.fatherNetDelta??null,'Nettoänderung Elternteil 1');
 const motherDelta=optionMoney(assumptions.motherNetDelta??null,'Nettoänderung Elternteil 2');
 const lostWage=assumptions.bridgeWageLoss??null;
 const bridgeCost=assumptions.bridgeCareCost??null;
 if(lostWage!==null)moneyCents(lostWage,'Erwerbsnetto-Ausfall',{limit:10000});
 if(bridgeCost!==null)moneyCents(bridgeCost,'Ersatzbetreuung',{limit:10000});
 if(typeof (assumptions.waiveFees??false)!=='boolean')throw new TypeError('Kita-Gebührenausfall muss ausdrücklich an- oder abgewählt sein.');
 if(delay>0&&childcareStartLm===0)throw new RangeError('Ohne geplanten Kita-Start kann die Verschiebung nicht berechnet werden.');
 const original=buildFamilyView({rows,horizon,childcareStartLm,expensesKnown,validationStatus});
 const relevantRows=rows.slice(0,horizon);
 const fMonths=relevantRows.filter(r=>PART_TIME.has(r.f));
 const mMonths=relevantRows.filter(r=>PART_TIME.has(r.m));
 if((fatherHours!==null||fatherDelta!==null)&&!fMonths.length)throw new RangeError('Elternteil 1 hat in diesem Zeitraum keine Teilzeitmonate.');
 if((motherHours!==null||motherDelta!==null)&&!mMonths.length)throw new RangeError('Elternteil 2 hat in diesem Zeitraum keine Teilzeitmonate.');
 const changedFather=fatherHours!==null&&fMonths.some(r=>r.hf!==fatherHours);
 const changedMother=motherHours!==null&&mMonths.some(r=>r.hm!==motherHours);
 const missing=[];
 if(changedFather&&fatherDelta===null)missing.push('Nettoänderung für die neuen Teilzeitstunden von Elternteil 1');
 if(changedMother&&motherDelta===null)missing.push('Nettoänderung für die neuen Teilzeitstunden von Elternteil 2');
 if(delay>0&&lostWage===null)missing.push('Netto-Ausfall je Verzögerungsmonat (auch 0 ist eine Annahme)');
 if(delay>0&&bridgeCost===null)missing.push('Ersatzbetreuungskosten je Verzögerungsmonat (auch 0 ist eine Annahme)');
 const moneyComplete=missing.length===0;
 const careResult=delay>0?projectDelayedCareScenario({
  rows:relevantRows,startLm:childcareStartLm,delayMonths:delay,
  monthlyIncomeReduction:lostWage??0,monthlyExtraCare:bridgeCost??0,
  waiveOriginalFees:assumptions.waiveFees??false,expensesKnown
 }):null;
 const affected=new Map((careResult?.months||[]).map(r=>[r.lm,r]));
 let changeCount=0;
 const altRows=relevantRows.map(row=>{
  const r={...row};
  if(fatherHours!==null&&PART_TIME.has(r.f))r.hf=fatherHours;
  if(motherHours!==null&&PART_TIME.has(r.m))r.hm=motherHours;
  const oldNet=sourceCents(r.income,'Basiseinnahmen');
  const oldWage=sourceCents(r.totalWage,'Basiseinkommen aus Erwerb');
  const oldChildcare=sourceCents(r.childcare,'Kita-Kosten');
  const mat=sourceCents(r.maternityBenefits??0,'Pauschale Mutterschaftsleistung');
  if(mat>oldWage)throw new RangeError('Mutterschaftsleistung über dem Basislohn.');
  const oldDad=sourceCents(r.fi??0,'Erwerbsnetto Elternteil 1');
  const oldMum=sourceCents(r.mi??0,'Erwerbsnetto Elternteil 2');
  if(Math.abs(oldDad+oldMum-oldWage)>1)throw new RangeError('Basislohn-Summen sind widersprüchlich.');
  const fatherLoss=Math.round(oldDad*wageBand/100);
  const motherLoss=Math.round((oldMum-mat)*wageBand/100);
  const downside=fatherLoss+motherLoss;
  const changeF=PART_TIME.has(r.f)?fatherDelta??0:0;
  const changeM=PART_TIME.has(r.m)?motherDelta??0:0;
  if(moneyComplete&&(oldDad-fatherLoss+changeF<0||
     oldMum-mat-motherLoss+changeM<0))
   throw new RangeError('Angenommener Netto-Ausfall würde ein individuelles Erwerbsnetto unter 0 € senken.');
  const delayed=affected.get(r.lm);
  const delayedIncome=delayed?moneyCents(delayed.incomeReduced,'Verzögerter Einkommensausfall'):0;
  const delayedFeeWaiver=delayed?moneyCents(delayed.feesWaived,'Angenommener Beitragsausfall'):0;
  const delayedCare=delayed?moneyCents(delayed.extraCare,'Zusätzliche Ersatzbetreuung'):0;
  // The numerical wage source is unchanged on benefits and maternity components.
  const newWage=oldWage-downside+changeF+changeM-delayedIncome;
  const newIncome=oldNet-downside+changeF+changeM-delayedIncome;
  const newChildcare=oldChildcare-delayedFeeWaiver+delayedCare;
  if(moneyComplete&&(newWage<0||newIncome<0||newChildcare<0))
   throw new RangeError('Angenommener Netto-Ausfall übersteigt die verfügbaren Erwerbseinnahmen oder Kita-Kosten.');
  // Preserve unaffected source rows exactly; the existing planner interpolates
  // some hourly net incomes at subcent precision. Rounding a neutral scenario
  // must never create a spurious difference or fictitious changed life month.
  const incomeShift=-downside+changeF+changeM-delayedIncome;
  const careShift=-delayedFeeWaiver+delayedCare;
  if(incomeShift!==0){r.totalWage=row.totalWage+euros(incomeShift);r.income=row.income+euros(incomeShift);}
  if(careShift!==0)r.childcare=row.childcare+euros(careShift);
  if(expensesKnown){
   const oldRest=sourceCents(row.cashAfter,'Bisheriger Rest',{signed:true});
   if(Math.abs(oldRest-(oldNet-oldChildcare-oldExpenses))>2)
    throw new RangeError('Monatsrest und eingetragene Haushaltsausgaben widersprechen sich.');
   const budgetShift=incomeShift-careShift-changeExpenses;
   if(budgetShift!==0)r.cashAfter=row.cashAfter+euros(budgetShift);
  }
  if(r.hf!==row.hf||r.hm!==row.hm||incomeShift!==0||careShift!==0||changeExpenses!==0)
   changeCount++;
  return r;
 });
 const delayedStart=childcareStartLm?childcareStartLm+delay:0;
 const altCareStart=delayedStart>36?0:delayedStart;
 const alternative=buildFamilyView({
  rows:altRows,horizon,childcareStartLm:altCareStart,
  expensesKnown:moneyComplete&&expensesKnown,validationStatus
 });
 const budgetComparable=moneyComplete&&expensesKnown;
 const notes=[
  'Ausschließlich hypothetische Szenariorechnung. Keine neue Elterngeld-/Elternzeitberechnung, kein bestätigter Kita-Platz und kein Bank-Zahlungsplan.',
  'Mutterschutz-Tagesgrenzen, Arbeitszeit-/Elterngeld-Folgen und Rechtsstand 2027 bleiben fachlich ungeprüft.',
  ...(delay>0?['Eine verspätete Kita-Aufnahme ändert angenommene Beiträge nur, wenn der Gebührenwegfall ausdrücklich aktiviert ist.']:[]),
  ...(changedFather||changedMother||fatherDelta!==null||motherDelta!==null||wageBand>0?
    ['Abweichende Teilzeitstunden, Nettolohn und Risikoband können Leistungsansprüche verändern; Elterngeldbeträge bleiben hier bewusst unverändert.']:[]),
  ...(!expensesKnown?['Haushaltsausgaben fehlen: Kein belastbarer Rest und keine Rücklage bestimmbar.']:[]),
  ...(careResult?.outsideHorizonMonths?['Ein Teil der angenommenen Kita-Verschiebung liegt außerhalb des betrachteten Zeithorizonts.']:[])
 ];
 return {kind:'EXPLICIT_NONBINDING_COUNTERFACTUAL',bankReceiptsPredicted:false,
  benefitsRecalculated:false,legalStatusUnchanged:true,modelUnmodified:true,
  horizon,delayMonths:delay,baselineCareStartLm:childcareStartLm,assumedCareStartLm:delayedStart,
  moneyComplete,budgetComparable,missing,notes,changedMonths:changeCount,
  baseline:original,alternative,monthly:alternative.months.map((m,i)=>({
   lm:m.lm,baselineIncome:original.months[i].income,
   alternativeIncome:moneyComplete?m.income:null,
   baselineAvailable:original.months[i].available,
   alternativeAvailable:budgetComparable?m.available:null,
   baselineCare:original.months[i].care,alternativeCare:m.care,
   firstHours:altRows[i].hf,secondHours:altRows[i].hm
  })),
  deltaTotalIncome:moneyComplete?euros(sourceCents(alternative.totalIncome,'Alternative Einnahmen')-sourceCents(original.totalIncome,'Basiseinnahmen')):null,
  deltaTotalAvailable:budgetComparable?euros(sourceCents(alternative.totalAvailable,'Alternative Restsumme',{signed:true})-sourceCents(original.totalAvailable,'Basis-Restsumme',{signed:true})):null
 };
}
module.exports={projectWhatIf};
