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
function cents(value,name,{optional=false}={}){
 if(optional&&(value===null||value===undefined||value===''))return null;
 if(typeof value!=='number'||!Number.isFinite(value)||value<0||value>MAX_MONEY||
    Math.abs(value*100-Math.round(value*100))>1e-7)
  throw new RangeError(name+': Eurobetrag ungültig oder mehr als zwei Nachkommastellen.');
 return Math.round(value*100);
}
/** User-authored, WEEK-level hypothetical availability – no employment law or benefit modifications. */
function compareSettlingIn({birthDate,careStartLm,delayWeeks=0,settlingWeeks=4,
 targetCareHours=35,firstWeekCareHours=5,plannedWorkHours=28,backupHours=0,
 hourlyBackupCost=null,weeklyNetAtRisk=null,modelMonths=36}={}){
 const months=time.lifeMonths(birthDate,Math.max(36,modelMonths));
 whole(modelMonths,'Modellhorizont',1,36);
 whole(careStartLm,'Kita-Start-LM',0,36);
 whole(delayWeeks,'Verzögerungswochen',0,12);
 whole(settlingWeeks,'Eingewöhnungswochen',0,12);
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
 const transitionWeeks=delayWeeks+settlingWeeks,weekCount=Math.max(1,transitionWeeks+1);
 const entries=[];let backupTotal=0,lostTotal=0,unknownBackup=false,unknownLost=false,uncoveredHours=0;
 for(let i=0;i<weekCount;i++){
  const inDelay=i<delayWeeks,step=i-delayWeeks;
  const inSettling=!inDelay&&step<settlingWeeks;
  let careHours=inDelay?0:targetCareHours;
  if(inSettling){
   if(settlingWeeks===1)careHours=firstWeekCareHours;
   else careHours=firstWeekCareHours+(targetCareHours-firstWeekCareHours)*step/(settlingWeeks-1);
  }
  careHours=Math.round(careHours*100)/100;
  const shortfall=Math.max(0,plannedWorkHours-careHours);
  const usedBackup=Math.min(shortfall,backupHours);
  const uncovered=Math.round(Math.max(0,shortfall-usedBackup)*100)/100;
  uncoveredHours+=uncovered;
  const backupCost=usedBackup===0?0:(backupCents===null?null:Math.round(backupCents*usedBackup));
  const lostNet=uncovered===0?0:(riskCents===null?null:Math.round(riskCents*uncovered/plannedWorkHours));
  if(backupCost===null)unknownBackup=true;else backupTotal+=backupCost;
  if(lostNet===null)unknownLost=true;else lostTotal+=lostNet;
  entries.push({
   week:i+1,weekStart:time.addDays(startDate,i*7),weekEnd:time.addDays(startDate,i*7+6),
   phase:inDelay?'delay':inSettling?'settling':'regular',
   weeklyKitaHours:careHours,plannedWorkHours,backupHoursUsed:usedBackup,uncoveredWorkHours:uncovered,
   hypotheticalBackupCost:backupCost===null?null:backupCost/100,
   hypotheticalNetLoss:lostNet===null?null:lostNet/100
  });
 }
 const totalExtraCost=unknownBackup?null:backupTotal/100;
 const totalIncomeLoss=unknownLost?null:lostTotal/100;
 const bothKnown=totalExtraCost!==null&&totalIncomeLoss!==null;
 const totalImpact=bothKnown?((backupTotal+lostTotal)===0?0:-(backupTotal+lostTotal)/100):null;
 const lastDay=entries.at(-1).weekEnd;
 const beyond=lastDay>months[modelMonths-1].endDate;
 return {active:true,birthDate,careStartLm,startDate,actualCareStartDate,transitionWeeks,settlingWeeks,delayWeeks,
  regularCareFrom:time.addDays(actualCareStartDate,settlingWeeks*7),
  weeks:entries.length,weekly:entries,uncoveredHours:Math.round(uncoveredHours*100)/100,
  totalExtraCost,totalHypotheticalIncomeLoss:totalIncomeLoss,combinedMoneyImpact:totalImpact,
  hasCompleteMoneyInputs:bothKnown,forecastBankReceipts:false,changedElterngeld:false,changedEmploymentPlan:false,
  computedFromLaw:false,intervalBeyondModel:beyond,
  warnings:[
   'Alle Betreuungsstunden, Verzögerungen und Beträge sind eigene Annahmen. Kein Betreuungsplatz, keine Arbeitszeit und keine Zahlung sind zugesagt.',
   'Arbeitszeitlücken führen nur in diesem Vergleich zu einem proportionalen hypothetischen Nettoeinkommensausfall. Tatsächliche Lohn- oder Elterngeldänderungen können abweichen.',
   'Die manuell eingetragenen Kita-Gebühren im Hauptbudget bleiben unverändert. Ersatzbetreuung hier nur als gesonderte Annahme, mögliche Doppelzählung prüfen.',
   'Die Wochen entsprechen sieben aufeinanderfolgenden Kalendertagen, nicht Lebensmonaten. Bei Unsicherheit über Netto oder Ersatzbetreuung wird kein vollständiger Geldvergleich behauptet.',
   ...(beyond?['Die Annahme reicht über den gewählten Lebensmonatsvergleich hinaus.']:[])
  ]};
}
module.exports={compareSettlingIn};
