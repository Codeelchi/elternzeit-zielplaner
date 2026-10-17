'use strict';
const {compareSettlingIn}=require('./settling-in.cjs');
const time=require('./time-axes.cjs');

const DAYS=['Mo','Di','Mi','Do','Fr'];
const OFFICIAL_PART_TIME_SOURCE='https://familienportal.de/familienportal/familienleistungen/elternzeit/faq/kann-ich-waehrend-der-elternzeit-teilzeit-arbeiten--124794';
const OFFICIAL_BONUS_SOURCE='https://familienportal.de/familienportal/familienleistungen/elterngeld/faq/was-ist-der-partnerschaftsbonus--155198';

function quarterHours(value,label,max){
 if(typeof value!=='number'||!Number.isFinite(value)||value<0||value>max||
    !Number.isInteger(Math.round(value*4))||Math.abs(value*4-Math.round(value*4))>1e-8)
  throw new RangeError(label+': nur Viertelstunden zwischen 0 und '+max+' zugelassen.');
 return Math.round(value*4);
}
function euros(value,label,optional=false){
 if(optional&&(value===null||value===undefined||value===''))return null;
 if(typeof value!=='number'||!Number.isFinite(value)||value<0||value>100000||
   Math.abs(value*100-Math.round(value*100))>1e-7)
  throw new RangeError(label+': Eurobetrag zwischen 0 und 100.000 mit zwei Nachkommastellen erforderlich.');
 return Math.round(value*100);
}
function whole(value,label,max){
 if(!Number.isInteger(value)||value<0||value>max)throw new RangeError(label+': ganze Wochen von 0 bis '+max+' erforderlich.');
 return value;
}
function parseClock(value,label){
 if(typeof value!=='string'||!/^([01]\d|2[0-3]):(00|15|30|45)$/.test(value))
  throw new RangeError(label+': gültige Uhrzeit HH:00/15/30/45 erforderlich.');
 const [hour,minute]=value.split(':').map(Number);
 return hour*4+minute/15;
}
function spreadSlots(weeklyQuarterHours){
 const normal=Math.floor(weeklyQuarterHours/5),rest=weeklyQuarterHours%5;
 return DAYS.map((_,i)=>normal+(i<rest?1:0));
}
function escortForDay(choice,day){
 return choice==='alternating'?(day%2===0?'A':'B'):choice;
}
function validateParent(parent,label){
 if(!parent||typeof parent!=='object'||Array.isArray(parent))throw new TypeError(label+': Arbeitsannahmen fehlen.');
 const weekly=quarterHours(parent.weeklyWorkHours,label+' Wochenarbeitsstunden',40);
 const start=parseClock(parent.workStart,label+' Arbeitsbeginn');
 const returnWeek=whole(parent.returnWeek,label+' Wiedereinstieg',24);
 const risk=euros(parent.weeklyNetAtRisk,label+' Wochen-Nettoausfall',true);
 const byDay=spreadSlots(weekly);
 if(byDay.some(duration=>start+duration>96))throw new RangeError(label+': Arbeitsende würde hinter Mitternacht liegen.');
 return {weekly,returnWeek,risk,start,byDay};
}
function scenarioOrNull(opts){
 const {birthDate,careStartLm,delayWeeks,settlingWeeks,targetCareHours,firstWeekCareHours,modelMonths}=opts;
 return compareSettlingIn({birthDate,careStartLm,delayWeeks,settlingWeeks,targetCareHours,firstWeekCareHours,
  plannedWorkHours:0,backupHours:0,workReturnWeeks:0,modelMonths});
}
function planJointCare({
 birthDate,careStartLm,delayWeeks=0,settlingWeeks=4,targetCareHours=35,
 firstWeekCareHours=5,firstWeekEscortHours=5,
 careDayStart='08:00',escortParent='A',gapParent='alternating',
 backupHours=0,backupHourlyCost=null,parentA,parentB,modelMonths=36
}={}){
 const a=validateParent(parentA,'Elternteil A');
 const b=validateParent(parentB,'Elternteil B');
 const careStart=parseClock(careDayStart,'Kita-Tagesbeginn');
 const escortQuarter=quarterHours(firstWeekEscortHours,'Eingewöhnungsbegleitung pro Woche',45);
 const backupQuarter=quarterHours(backupHours,'Flexible Ersatzbetreuung pro Woche',40);
 const backupRate=euros(backupHourlyCost,'Ersatzbetreuung pro Stunde',true);
 if(!['A','B','alternating'].includes(escortParent)||
    !['A','B','alternating'].includes(gapParent))throw new RangeError('Betreuungsaufteilung nur A, B oder wechselnd.');
 const scenario=scenarioOrNull({birthDate,careStartLm,delayWeeks,settlingWeeks,
   targetCareHours,firstWeekCareHours,modelMonths});
 if(!scenario.active)return {active:false,weeks:[],totalCost:null,reason:scenario.warning,changedPlan:false};
 const careQuarter=quarterHours(targetCareHours,'Kita-Wochenstunden',45);
 if(spreadSlots(careQuarter).some(slots=>careStart+slots>96))
  throw new RangeError('Kita-Betreuungsende liegt hinter Mitternacht.');
 const resultWeeks=[];
 let sumReleaseA=0,sumReleaseB=0,sumGap=0,sumBackup=0,sumAccompanyA=0,sumAccompanyB=0;
 let sumMoney=0,allCostsKnown=true;
 const idxs=new Set(Array.from({length:scenario.transitionWeeks},(_,i)=>i));
 idxs.add(Math.max(scenario.transitionWeeks,a.returnWeek));
 idxs.add(Math.max(scenario.transitionWeeks,b.returnWeek));
 const ordered=[...idxs].sort((x,y)=>x-y);
 for(const idx of ordered){
  const transition=idx<scenario.transitionWeeks;
  const inDelay=idx<delayWeeks;
  const settling=idx>=delayWeeks&&idx<delayWeeks+settlingWeeks;
  let careWeekly=careQuarter;
  if(inDelay)careWeekly=0;
  else if(settling){
   if(settlingWeeks===1)careWeekly=quarterHours(firstWeekCareHours,'Kita-Erstwoche',45);
   else{
    const first=quarterHours(firstWeekCareHours,'Kita-Erstwoche',45);
    careWeekly=Math.round(first+(careQuarter-first)*(idx-delayWeeks)/(settlingWeeks-1));
   }
  }
  let escortWeek=0;
  if(settling){
   escortWeek=settlingWeeks===1?escortQuarter:
    Math.round(escortQuarter*(settlingWeeks-1-(idx-delayWeeks))/(settlingWeeks-1));
   escortWeek=Math.min(careWeekly,escortWeek);
  }
  const careDays=spreadSlots(careWeekly),escortDays=spreadSlots(escortWeek);
  let releaseA=0,releaseB=0,escortA=0,escortB=0,simultaneous=0,backupUsed=0,coverageConflict=0;
  const dayDetails=[];
  for(let d=0;d<5;d++){
   const workA=idx>=a.returnWeek?new Set(Array.from({length:a.byDay[d]},(_,j)=>a.start+j)):new Set();
   const workB=idx>=b.returnWeek?new Set(Array.from({length:b.byDay[d]},(_,j)=>b.start+j)):new Set();
   const daycareEnd=careStart+careDays[d];
   if(daycareEnd>96)throw new RangeError('Kita-Betreuungsende würde hinter Mitternacht liegen.');
   const escortPerson=escortForDay(escortParent,d),gapPerson=escortForDay(gapParent,d);
   const escortSlots=Math.min(careDays[d],escortDays[d]);
   let dailyOverlapping=0,dailyConflict=0,dailyEscortA=0,dailyEscortB=0,dailyBackup=0;
   for(let slot=0;slot<96;slot++){
    const isKita=slot>=careStart&&slot<daycareEnd;
    const acomp=isKita&&slot<careStart+escortSlots;
    if(acomp){
     if(escortPerson==='A'){escortA++;dailyEscortA++;if(workA.has(slot))releaseA++;}
     else{escortB++;dailyEscortB++;if(workB.has(slot))releaseB++;}
    }
    if(workA.has(slot)&&workB.has(slot)&&!isKita){
     simultaneous++;dailyOverlapping++;
     if(backupUsed<backupQuarter){
      backupUsed++;dailyBackup++;
     }else{
      coverageConflict++;dailyConflict++;
      if(gapPerson==='A')releaseA++;else releaseB++;
     }
    }
   }
   dayDetails.push({
    day:DAYS[d],parentAWorkHours:workA.size/4,parentBWorkHours:workB.size/4,
    daycareHours:careDays[d]/4,accompanimentHours:escortSlots/4,
    escortParent:escortSlots>0?escortPerson:null,
    escortHoursA:dailyEscortA/4,escortHoursB:dailyEscortB/4,
    overlappingWorkWithoutKitaHours:dailyOverlapping/4,assignedUncoveredHours:dailyConflict/4,
    flexibleBackupHoursUsed:dailyBackup/4
   });
  }
  const amount=(quarters,risk,weekly)=>quarters===0?0:
   risk===null?null:Math.round(risk*quarters/weekly);
  const costA=amount(releaseA,a.risk,a.weekly);
  const costB=amount(releaseB,b.risk,b.weekly);
  const costBackup=backupUsed===0?0:backupRate===null?null:
    Math.round(backupRate*backupUsed/4);
  const allKnown=[costA,costB,costBackup].every(x=>x!==null);
  const total=allKnown?costA+costB+costBackup:null;
  if(transition){
   sumReleaseA+=releaseA;sumReleaseB+=releaseB;sumGap+=coverageConflict;
   sumBackup+=backupUsed;sumAccompanyA+=escortA;sumAccompanyB+=escortB;
   if(total===null)allCostsKnown=false;
   else sumMoney+=total;
  }
  resultWeeks.push({
   week:idx+1,weekStart:time.addDays(scenario.startDate,idx*7),
   type:inDelay?'delay':settling?'settling':'regular_preview',
   countsTowardTransition:transition,previewOnly:!transition,
   daycareWeeklyHours:careWeekly/4,
   parentAWeeklyWorkHours:idx>=a.returnWeek?a.weekly/4:0,
   parentBWeeklyWorkHours:idx>=b.returnWeek?b.weekly/4:0,
   accompanimentHoursA:escortA/4,accompanimentHoursB:escortB/4,
   simultaneousWorkWithoutKitaHours:simultaneous/4,
   flexibleBackupUsedHours:backupUsed/4,remainingCoverageConflictHours:coverageConflict/4,
   assumedWorkReleaseA:releaseA/4,assumedWorkReleaseB:releaseB/4,
   hypotheticalNetLossA:costA===null?null:costA/100,
   hypotheticalNetLossB:costB===null?null:costB/100,
   hypotheticalBackupCost:costBackup===null?null:costBackup/100,
   hypotheticalCombinedCost:total===null?null:total/100,
   days:dayDetails
  });
 }
 const warnings=[
  'Typische Montag-bis-Freitag-Woche mit in Viertelstunden gleichmäßig verteilten Wochenarbeitszeiten und Kita-Zeiten; keine Aussage zu realen Schichtplänen, Wochenenden, Urlaub, Pendelzeiten oder Krankheit.',
  'Die Eltern sind außerhalb ihrer angegebenen Arbeitszeiten als frei verfügbar angenommen. Die Darstellung prüft keine arbeitsvertragliche Vereinbarung, keine Arbeitgeberfreigabe und keine örtliche Zusage zur Kinderbetreuung.',
  'Wenn beide Eltern gleichzeitig arbeiten und die Kita geschlossen ist, wird flexible Ersatzbetreuung zuerst angenommen; sonst muss der gewählte Elternteil hypothetisch Arbeitszeit freimachen. Dies ist kein gewährter Urlaub, kein bezahlter Freistellungsanspruch und keine Behauptung tatsächlicher Kinderbetreuung.',
  'Bei der Eingewöhnung wird die begleitende Person für die angegebenen Stunden als nicht für zeitgleiche Erwerbsarbeit verfügbar gerechnet. Teilzeit-Netto wird nur als manuelle, proportional verteilte Annahme behandelt.',
  'Die hypothetischen Beträge beider Eltern dürfen NICHT zu den separat angezeigten Ein-Eltern-Eingewöhnungskosten addiert werden – beide beschreiben alternative Modelle derselben Übergangszeit.',
  'Partnerbonus erfordert nach Bundesfamilienportal weitere Voraussetzungen und eine Prüfung des Durchschnitts pro Lebensmonat; diese Wochenansicht bescheinigt keinerlei Berechtigung.',
  ...((a.weekly>128||b.weekly>128)?['Wenn die modellierte Arbeit während Elternzeit oder Elterngeldbezug stattfindet, sind laut Bundesfamilienportal im Regelfall maximal 32 Wochenstunden im Lebensmonatsdurchschnitt erlaubt. Hier kann auch die Zeit NACH der Elternzeit modelliert werden; daher keine automatische rechtliche Einstufung.']:[]),
  ...((settlingWeeks>0&&escortQuarter>quarterHours(firstWeekCareHours,'Kita-Erstwoche',45))?['Angegebene Begleitungszeit ist größer als die mögliche Kita-Betreuungszeit der ersten Eingewöhnungswoche. Der Plan zeigt maximal die tatsächlich modellierten Kita-Stunden als Begleitung.']:[]),
  'Kein Elterngeld-/Partnerschaftsbonus-, Steuer-, Gehalts-, Kinderkrankengeld- oder Bankbuchungsmodell wird verändert.',
  ...(ordered.some(i=>time.addDays(scenario.startDate,i*7)>time.lifeMonths(birthDate,modelMonths).at(-1).endDate)?
   ['Eine Wochenvorschau liegt außerhalb des 36-Lebensmonatsfensters; dafür wird kein Monatsbudget berechnet.']:[])
 ];
 return {
  active:true,birthDate,careStartLm,careStartDate:scenario.startDate,
  actualCareStartDate:scenario.actualCareStartDate,regularCareFrom:scenario.regularCareFrom,
  weeks:resultWeeks,transitionWeeks:scenario.transitionWeeks,
  returnDateA:time.addDays(scenario.startDate,a.returnWeek*7),
  returnDateB:time.addDays(scenario.startDate,b.returnWeek*7),
  transitionReleaseA:sumReleaseA/4,transitionReleaseB:sumReleaseB/4,
  transitionEscortHoursA:sumAccompanyA/4,transitionEscortHoursB:sumAccompanyB/4,
  transitionCoverageConflictHours:sumGap/4,transitionFlexibleBackupHours:sumBackup/4,
  totalHypotheticalCost:allCostsKnown?sumMoney/100:null,
  moneyKnown:allCostsKnown,changedPlan:false,modifiedElterngeld:false,
  changedRecordedBankReceipts:false,
  weekdaysOnly:true,slotMinutes:15,comparisonOnly:true,
  officialSources:[OFFICIAL_PART_TIME_SOURCE,OFFICIAL_BONUS_SOURCE],warnings
 };
}
function compareEscortChoices(options={}){
 const scenarios=[
  {mode:'A',label:'Elternteil A begleitet'},
  {mode:'B',label:'Elternteil B begleitet'},
  {mode:'alternating',label:'Abwechselnd nach Wochentag'}
 ].map(choice=>{
  const result=planJointCare({...options,escortParent:choice.mode});
  return {mode:choice.mode,label:choice.label,active:result.active,
   escortA:result.transitionEscortHoursA??0,
   escortB:result.transitionEscortHoursB??0,
   workReleaseA:result.transitionReleaseA??0,
   workReleaseB:result.transitionReleaseB??0,
   hypotheticalCost:result.totalHypotheticalCost,
   moneyKnown:result.moneyKnown===true,
   changedPlan:false};
 });
 return {scenarios,optimizationClaim:false,approvalsVerified:false,
  warning:'Es wird nur der begleitende Elternteil gewechselt; Erwerbszeiten, Kita, Ersatzbetreuung und Geldannahmen bleiben unverändert. Kein rechtlicher Freistellungs- oder finanzieller Optimierungsnachweis.'};
}
module.exports={planJointCare,compareEscortChoices,OFFICIAL_PART_TIME_SOURCE,OFFICIAL_BONUS_SOURCE};
