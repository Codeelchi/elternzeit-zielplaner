'use strict';
const time=require('./time-axes.cjs');
const MAX_MONEY=100000;
function whole(value,name,min,max){
 if(!Number.isInteger(value)||value<min||value>max)throw new RangeError(name+' muss zwischen '+min+' und '+max+' liegen.');
 return value;
}
function hours(value,name,max=45) {
 if(typeof value!=='number'||!Number.isFinite(value)||value<0||value>max||Math.abs(value*4-Math.round(value*4))>1e-8)
  throw new RangeError(name+': Wert zwischen 0 und '+max+' Stunden in Viertelstunden.');
 return value;
}
function cents(value,name,{optional=false,max=MAX_MONEY}={}){
 if(optional&&(value===null||value===undefined||value===''))return null;
 if(typeof value!=='number'||!Number.isFinite(value)||value<0||value>max||
    Math.abs(value*100-Math.round(value*100))>1e-7)
  throw new RangeError(name+': Eurobetrag ungültig oder mehr als zwei Nachkommastellen.');
 return Math.round(value*100);
}
/** User-authored, WEEK-level hypothetical availability – no employment law or benefit modifications. */
function compareSettlingIn({birthDate,careStartLm,delayWeeks=0,settlingWeeks=4,
 targetCareHours=35,firstWeekCareHours=5,plannedWorkHours=28,backupHours=0,
 workReturnWeeks=0,hourlyBackupCost=null,weeklyNetAtRisk=null,modelMonths=36}={}){
 const months=time.lifeMonths(birthDate,Math.max(36,modelMonths));
 whole(modelMonths,'Modellhorizont',1,36);
 whole(careStartLm,'Kita-Start-LM',0,36);
 whole(delayWeeks,'Verzögerungswochen',0,12);
 whole(settlingWeeks,'Eingewöhnungswochen',0,12);
 whole(workReturnWeeks,'Arbeitsbeginn in Wochen nach Kitaplan',0,24);
 hours(targetCareHours,'Spätere Wochenbetreuung',45);
 hours(firstWeekCareHours,'Erste Eingewöhnungswoche',45);
 hours(plannedWorkHours,'Geplante Arbeitsstunden',40);
 hours(backupHours,'Alternative Betreuungsstunden',40);
 if(firstWeekCareHours>targetCareHours)throw new RangeError('Erste Eingewöhnungswoche darf nicht mehr Betreuungsstunden als das Ziel enthalten.');
 const backupCents=cents(hourlyBackupCost,'Stundensatz für Ersatzbetreuung',{optional:true});
 const riskCents=cents(weeklyNetAtRisk,'Netto pro Woche bei vollständigem Erwerbsausfall',{optional:true});
 if(careStartLm===0)return {active:false,weekly:[],startDate:null,actualCareStartDate:null,totalExtraCost:null,
  totalHypotheticalIncomeLoss:null,combinedMoneyImpact:null,hasCompleteMoneyInputs:false,
  changedElterngeld:false,changedEmploymentPlan:false,warning:'Ohne geplanten Kita-Start kann keine Eingewöhnung simuliert werden.'};
 const startDate=months[careStartLm-1].startDate,actualCareStartDate=time.addDays(startDate,delayWeeks*7);
 const transitionWeeks=delayWeeks+settlingWeeks;
 // Show every TRANSITION week and one preview at/after work return.
 // Do not flood the interface with 24 regular waiting weeks when work starts later.
 // Preview weeks are NEVER counted as transition cost or care deficits.
 const weekIndices=Array.from({length:transitionWeeks},(_,i)=>i);
 weekIndices.push(Math.max(transitionWeeks,workReturnWeeks));
 const entries=[];let backupTotal=0,lostTotal=0,unknownBackup=false,unknownLost=false,uncoveredHours=0;
 for(const i of weekIndices){
  const inDelay=i<delayWeeks,step=i-delayWeeks;
  const inSettling=!inDelay&&step<settlingWeeks;
  let careHours=inDelay?0:targetCareHours;
  if(inSettling){
   if(settlingWeeks===1)careHours=firstWeekCareHours;
   else careHours=firstWeekCareHours+(targetCareHours-firstWeekCareHours)*step/(settlingWeeks-1);
  }
  careHours=Math.round(careHours*100)/100;
  const weekWorkHours=i>=workReturnWeeks?plannedWorkHours:0;
  const shortfall=Math.max(0,weekWorkHours-careHours);
  const usedBackup=Math.min(shortfall,backupHours);
  const uncovered=Math.round(Math.max(0,shortfall-usedBackup)*100)/100;
  const countsTowardTransition=i<transitionWeeks;
  if(countsTowardTransition)uncoveredHours+=uncovered;
  const backupCost=usedBackup===0?0:(backupCents===null?null:Math.round(backupCents*usedBackup));
  const lostNet=uncovered===0?0:(riskCents===null?null:Math.round(riskCents*uncovered/plannedWorkHours));
  if(countsTowardTransition){
   if(backupCost===null)unknownBackup=true;else backupTotal+=backupCost;
   if(lostNet===null)unknownLost=true;else lostTotal+=lostNet;
  }
  entries.push({
   week:i+1,weekStart:time.addDays(startDate,i*7),weekEnd:time.addDays(startDate,i*7+6),
   phase:inDelay?'delay':inSettling?'settling':'regular',
   countsTowardTransition,previewOnly:!countsTowardTransition,
   weeklyKitaHours:careHours,weeklyPlannedWorkHours:weekWorkHours,
   plannedWorkHours,backupHoursUsed:usedBackup,uncoveredWorkHours:uncovered,
   hypotheticalBackupCost:backupCost===null?null:backupCost/100,
   hypotheticalNetLoss:lostNet===null?null:lostNet/100
  });
 }
 const totalExtraCost=unknownBackup?null:backupTotal/100;
 const totalIncomeLoss=unknownLost?null:lostTotal/100;
 const bothKnown=totalExtraCost!==null&&totalIncomeLoss!==null;
 const totalImpact=bothKnown?((backupTotal+lostTotal)===0?0:-(backupTotal+lostTotal)/100):null;
 const transitionEnd=transitionWeeks?time.addDays(startDate,transitionWeeks*7-1):null;
 const beyond=transitionEnd!==null&&transitionEnd>months[modelMonths-1].endDate;
 const returnBeyond=time.addDays(startDate,workReturnWeeks*7)>months[modelMonths-1].endDate;
 const regularGap=Math.max(0,plannedWorkHours-targetCareHours-backupHours);
 return {active:true,birthDate,careStartLm,startDate,actualCareStartDate,transitionWeeks,settlingWeeks,delayWeeks,
  workReturnWeeks,workReturnDate:time.addDays(startDate,workReturnWeeks*7),
  regularCareFrom:time.addDays(actualCareStartDate,settlingWeeks*7),
  weeks:entries.length,weekly:entries,transitionEnd,
  uncoveredHours:Math.round(uncoveredHours*100)/100,
  regularWeeklyUncoveredHours:Math.round(regularGap*100)/100,
  totalExtraCost,totalHypotheticalIncomeLoss:totalIncomeLoss,combinedMoneyImpact:totalImpact,
  hasCompleteMoneyInputs:bothKnown,forecastBankReceipts:false,changedElterngeld:false,changedEmploymentPlan:false,
  computedFromLaw:false,intervalBeyondModel:beyond,returnBeyondModel:returnBeyond,
  warnings:[
   'Alle Betreuungsstunden, Verzögerungen und Beträge sind eigene Annahmen. Kein Betreuungsplatz, keine Arbeitszeit und keine Zahlung sind zugesagt.',
   'Arbeitszeitlücken führen nur in diesem Vergleich zu einem proportionalen hypothetischen Nettoeinkommensausfall. Tatsächliche Lohn- oder Elterngeldänderungen können abweichen.',
   'Die manuell eingetragenen Kita-Gebühren im Hauptbudget bleiben unverändert. Ersatzbetreuung hier nur als gesonderte Annahme, mögliche Doppelzählung prüfen.',
   'Nur die Verschiebungs- und Eingewöhnungswochen zählen zur einmaligen Übergangssumme. Reguläre Wochen danach dienen nur der Vorschau.',
   'Die Wochen entsprechen sieben aufeinanderfolgenden Kalendertagen, nicht Lebensmonaten. Bei Unsicherheit über Netto oder Ersatzbetreuung wird kein vollständiger Geldvergleich behauptet.',
   ...(regularGap>0?['Auch bei vollem Kita-Umfang bleiben nach dem Arbeitsbeginn pro Woche '+regularGap.toLocaleString('de-DE')+' Arbeitsstunden ohne Betreuung; diese wiederkehrende Lücke ist NICHT in der Übergangssumme enthalten.']:[]),
   ...(beyond?['Ein Teil der Übergangswochen liegt außerhalb des gewählten Lebensmonatsvergleichs.']:[]),
   ...(returnBeyond?['Der angenommene Arbeitsbeginn liegt außerhalb des verfügbaren Monatsbudgets und ist dort nicht finanziell modelliert.']:[]),
   ...(workReturnWeeks>transitionWeeks?['Die Vorschau springt direkt zur ersten Arbeitswoche nach dem Ende der Eingewöhnung; reguläre Zwischenwochen ohne Arbeitsbeginn werden nicht einzeln gezeigt.']:[])
  ]};
}
/**
 * Break the hypothetical WEEK total into legal LIFE MONTHS, preserving cents
 * exactly. Allocation is uniformly by calendar day; not a payment prediction.
 * Weeks tagged previewOnly NEVER enter this overlay.
 */
function transitionLifeMonthBridge({birthDate,scenario,rows,expensesKnown=false}={}){
 if(!scenario||scenario.active!==true||scenario.birthDate!==birthDate||
    !Array.isArray(scenario.weekly)||typeof expensesKnown!=='boolean')
  throw new TypeError('Passendes und aktives Übergangsszenario, Lebensmonate und eindeutiger Ausgabenstatus erforderlich.');
 if(!Array.isArray(rows)||!rows.length||rows.length>36)throw new TypeError('Geordnete Monatsbudgets (maximal 36 Lebensmonate) erforderlich.');
 const months=time.lifeMonths(birthDate,rows.length);
 for(let i=0;i<rows.length;i++){
  if(!rows[i]||rows[i].lm!==i+1||typeof rows[i]!=='object')throw new RangeError('Monatsbudgets lückenlos ab LM 1 erforderlich.');
  if(expensesKnown&&(!Number.isFinite(rows[i].cashAfter)||
     Math.abs(rows[i].cashAfter)>1000000000))throw new RangeError('Modellbudget fehlt oder ist ungültig.');
 }
 const ledger=new Map();let outsideDays=0,outsideMoney=0,outsideUnknown=false;
 const moneyUnits=['hypotheticalBackupCost','hypotheticalNetLoss'];
 function splitUnits(units,segments){
  const result=segments.map(x=>Math.floor(units*x.days/7));
  let remainder=units-result.reduce((a,b)=>a+b,0);
  const ranks=segments.map((x,i)=>({i,remainder:units*x.days/7-result[i]}))
   .sort((a,b)=>b.remainder-a.remainder||a.i-b.i);
  for(let k=0;k<remainder;k++)result[ranks[k].i]++;
  return result;
 }
 for(const week of scenario.weekly){
  if(!week.countsTowardTransition)continue;
  if(time.dayDiff(week.weekStart,week.weekEnd)!==6)throw new RangeError('Eingewöhnungswoche muss sieben Kalendertage haben.');
  const segments=[];
  for(let i=0;i<months.length;i++){
   const m=months[i],lo=m.startDate>week.weekStart?m.startDate:week.weekStart;
   const hi=m.endDate<week.weekEnd?m.endDate:week.weekEnd;
   if(lo<=hi)segments.push({lm:m.lm,days:time.dayDiff(lo,hi)+1});
  }
  const included=segments.reduce((sum,x)=>sum+x.days,0);
  if(included>7)throw new RangeError('Überlappende Lebensmonate.');
  if(included<7)segments.push({lm:null,days:7-included});
  const hoursUnits=Math.round(week.uncoveredWorkHours*100);
  if(!Number.isFinite(hoursUnits)||hoursUnits<0||hoursUnits>5000)throw new RangeError('Ungültige Wochenstunden.');
  const splitHours=splitUnits(hoursUnits,segments);
  const byMoney=moneyUnits.map(key=>{
   const value=week[key];
   if(value===null)return null;
   return splitUnits(cents(value,key,{max:4000000}),segments);
  });
  segments.forEach((segment,i)=>{
   if(segment.lm===null){
    outsideDays+=segment.days;
    for(const values of byMoney)if(values===null)outsideUnknown=true;else outsideMoney+=values[i];
    return;
   }
   const record=ledger.get(segment.lm)||{
    lm:segment.lm,startDate:months[segment.lm-1].startDate,endDate:months[segment.lm-1].endDate,
    transitionDays:0,uncoveredHoursCents:0,additionalCareCents:0,lostNetCents:0,
    careUnknown:false,netUnknown:false
   };
   record.transitionDays+=segment.days;record.uncoveredHoursCents+=splitHours[i];
   if(byMoney[0]===null)record.careUnknown=true;else record.additionalCareCents+=byMoney[0][i];
   if(byMoney[1]===null)record.netUnknown=true;else record.lostNetCents+=byMoney[1][i];
   ledger.set(segment.lm,record);
  });
 }
 const output=[...ledger.values()].sort((a,b)=>a.lm-b.lm).map(record=>{
  const known=!record.careUnknown&&!record.netUnknown;
  const baseline=expensesKnown?Math.round(rows[record.lm-1].cashAfter*100):null;
  const extra=known?record.additionalCareCents+record.lostNetCents:null;
  return {
   lm:record.lm,startDate:record.startDate,endDate:record.endDate,transitionDays:record.transitionDays,
   uncoveredHours:record.uncoveredHoursCents/100,
   additionalCare:record.careUnknown?null:record.additionalCareCents/100,
   hypotheticalNetLoss:record.netUnknown?null:record.lostNetCents/100,
   totalHypotheticalExtra:extra===null?null:extra/100,
   baselineAfterCosts:baseline===null?null:baseline/100,
   alternativeAfterCosts:baseline===null||extra===null?null:(baseline-extra)/100,
   baseBudgetModified:false,grantAssumed:false
  };
 });
 const modeledCents=output.every(m=>m.totalHypotheticalExtra!==null)?
   output.reduce((sum,m)=>sum+Math.round(m.totalHypotheticalExtra*100),0):null;
 return {
  model:'EXPLICIT_WEEK_TO_LIFE_MONTH_ALLOCATION',
  months:output,outsideHorizonDays:outsideDays,
  outsideHorizonMoney:outsideUnknown?null:outsideMoney/100,
  knownImpactInHorizon:modeledCents===null?null:modeledCents===0?0:-modeledCents/100,
  expensesKnown,changedPlan:false,bankReceiptsPredicted:false,
  rounding:'CENT_PRESERVING_LARGEST_REMAINDER_BY_CALENDAR_DAYS',
  warnings:[
   'Sieben Kalendertage werden gleichmäßig auf Lebensmonate verteilt; Arbeitstage und Ausgaben fallen real nicht gleichmäßig an.',
   'Nur einmalige Übergangswochen werden auf Lebensmonate verteilt. Die Regelwoche und eventuelle dauerhafte Betreuungslücken sind ausdrücklich ausgeschlossen.',
   'Die Beträge werden NICHT in das Elterngeld, echte Bankbuchungen oder das gespeicherte Modellbudget übernommen.',
   ...(outsideDays?['Übergangsaufwand jenseits LM '+rows.length+' ist nicht als verfügbares Monatsbudget ausgewiesen.']:[]),
   ...(!expensesKnown?['Ausgaben unbekannt: kein seriöser Vergleich verfügbarer Monatsbudgets.']:[])
  ]
 };
}
module.exports={compareSettlingIn,transitionLifeMonthBridge};
