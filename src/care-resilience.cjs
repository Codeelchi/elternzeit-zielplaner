'use strict';
const {compareSettlingIn,transitionLifeMonthBridge}=require('./settling-in.cjs');

/**
 * A deliberately bounded what-if view, NOT an optimiser or a benefit forecast.
 * The three scenarios hold every assumption fixed except extra childcare delay.
 * The user can still edit the source scenario independently.
 */
function compareCareResilience({birthDate,careStartLm,delayWeeks=0,settlingWeeks=4,
 targetCareHours=35,firstWeekCareHours=5,plannedWorkHours=28,
 workReturnWeeks=0,backupHours=0,hourlyBackupCost=null,weeklyNetAtRisk=null,
 modelMonths=36,rows,expensesKnown=false}={}){
 if(!Array.isArray(rows)||rows.length!==modelMonths)throw new TypeError('Vergleich benötigt denselben vollständigen Lebensmonatshorizont.');
 const sameInputs={birthDate,careStartLm,settlingWeeks,targetCareHours,firstWeekCareHours,
  plannedWorkHours,workReturnWeeks,backupHours,hourlyBackupCost,weeklyNetAtRisk,modelMonths};
 const variants=[];
 const skips=[];
 for(const [id,additionalWeeks,label]of [['current',0,'Eigene Annahme'],['plus2',2,'Kita 2 Wochen später'],['plus4',4,'Kita 4 Wochen später']]){
  if(!Number.isInteger(delayWeeks)||delayWeeks<0||delayWeeks>12){
   throw new RangeError('Geplante Kita-Verschiebung muss 0 bis 12 ganze Wochen betragen.');
  }
  const actualDelay=delayWeeks+additionalWeeks;
  if(actualDelay>12){skips.push({id,additionalWeeks,reason:'Maximal 12 Wochen Verzögerung im derzeitigen Modell.'});continue;}
  const scenario=compareSettlingIn({...sameInputs,delayWeeks:actualDelay});
  if(!scenario.active){
   return {active:false,variants:[],skipped:[],reason:scenario.warning,mutatedPlan:false};
  }
  const bridge=transitionLifeMonthBridge({birthDate,scenario,rows,expensesKnown});
  const extraCost=scenario.combinedMoneyImpact===null?null:
   -scenario.combinedMoneyImpact;
  const first=variants[0]??null;
  const baseCost=first?.extraCost;
  const differenceCost=extraCost===null?null:
   first===null?0:baseCost===null?null:Math.round((extraCost-baseCost)*100)/100;
  const hasOutside=bridge.outsideHorizonDays>0;
  const variant={id,label,additionalWeeks,actualDelayWeeks:actualDelay,
   childcareStartDate:scenario.actualCareStartDate,
   regularCareDate:scenario.regularCareFrom,workReturnDate:scenario.workReturnDate,
   transitionWeeks:scenario.transitionWeeks,uncoveredTransitionHours:scenario.uncoveredHours,
   extraCost,differenceCost,
   additionalUncoveredHours:first?Math.round((scenario.uncoveredHours-first.uncoveredTransitionHours)*100)/100:0,
   recurringWeeklyGapHours:scenario.regularWeeklyUncoveredHours,
   budgetMonthsWithTransition:bridge.months.map(m=>m.lm),
   cheapestMonthlyAvailable:expensesKnown&&bridge.months.length>0&&
    bridge.months.every(m=>m.alternativeAfterCosts!==null)?
    Math.min(...bridge.months.map(m=>m.alternativeAfterCosts)):null,
   monthsUnknown:bridge.months.some(m=>m.alternativeAfterCosts===null),
   outsideHorizonDays:bridge.outsideHorizonDays,
   outsideHorizonMoney:bridge.outsideHorizonMoney,
   entirelyWithinHorizon:!hasOutside,
   workOrBenefitPlanChanged:false,bankReceiptsPredicted:false};
  variants.push(variant);
 }
 return {active:true,baseDelayWeeks:delayWeeks,variants,skipped:skips,
  hasAllVariants:variants.length===3,
  allMoneyKnown:variants.every(v=>v.extraCost!==null),
  beyondModel:variants.some(v=>v.outsideHorizonDays>0),
  maxAdditionalDelayWeeks:12-delayWeeks,
  mutatedPlan:false,modifiedElterngeld:false,
  comparisonBasis:'SAME_WORK_RETURN_AND_HOURS_VARY_CHILDCARE_DELAY_ONLY',
  warnings:[
   'Verglichen wird ausschließlich ein späterer Kita-Beginn bei sonst gleichen, ausdrücklich selbst angenommenen Wochenstunden, Einkommen und Rückkehrdatum.',
   'Die Varianten sind keine Wahrscheinlichkeiten, keine optimierten Empfehlungen und keine Vorhersagen über die tatsächliche Platzvergabe.',
   'Dauerhafte Betreuungslücken, Änderungen der Arbeitsaufnahme, Elterngeld-/Steuerfolgen sowie tatsächliche Bankeingänge bleiben getrennt zu prüfen.',
   'Unbekannte Versicherungs-, Steuer-, Lohn- oder Betreuungskosten werden nicht geschätzt oder still auf null gesetzt.',
   ...(variants.some(v=>v.recurringWeeklyGapHours>0)?
    ['Es gibt nach den eigenen Wochenstundenannahmen zusätzlich eine nicht bezifferte DAUERHAFTE Betreuungslücke.']:[]),
   ...(skips.length?['Weitere Verzögerungsvarianten wurden aufgrund des auf zwölf Wochen begrenzten Modellraums ausgelassen.']:[]),
   ...(variants.some(v=>v.outsideHorizonDays>0)?
    ['Ein Teil der Übergangszeiten liegt außerhalb der berechneten Lebensmonate; Geldbeträge müssen dann getrennt eingeordnet werden.']:[])
  ]};
}
module.exports={compareCareResilience};
