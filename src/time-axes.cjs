'use strict';

/**
 * Pure calendar/time-axis projection for the standard German parental-leave case.
 *
 * Legal parental leave, maternity protection, Elterngeld life months,
 * employment and modeled cashflow are intentionally independent.
 * This module does not calculate Elterngeld entitlement or certify a plan.
 */
const MS_DAY = 86400000;
const PARENT = ['father', 'mother'];
const PARENT_CODE = { father: 'f', mother: 'm' };
const PART_TIME_CODES = new Set(['R', 'T', 'K', 'Q']);
const LEAVE_CODES = new Set(['B', 'R', 'P', 'T', 'Q', 'K', 'U']);
const BASIS_CODES = new Set(['B', 'R']);
const BENEFIT_TYPES = new Set(['none','basis','plus','partnership_bonus','maternity_offset_basis']);
const DATE_SOURCES = {
  reviewedAt:'2026-10-14',
  age:['https://www.gesetze-im-internet.de/bgb/__187.html','https://www.gesetze-im-internet.de/bgb/__188.html'],
  maternity:['https://www.gesetze-im-internet.de/muschg_2018/__3.html','https://www.gesetze-im-internet.de/bgb/__187.html','https://www.gesetze-im-internet.de/bgb/__188.html']
};

function asDate(value, label='Datum') {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new RangeError(label + ': ISO-Datum JJJJ-MM-TT erforderlich.');
  }
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(Date.UTC(year, month-1, day));
  if (year<1900 || year>2100 || date.getUTCFullYear()!==year ||
      date.getUTCMonth()+1!==month || date.getUTCDate()!==day) {
    throw new RangeError(label + ': ungültiger Kalendertag.');
  }
  return date;
}
function iso(d) { return d.toISOString().slice(0,10); }
function addDays(value, count) {
  const d = asDate(value);
  if (!Number.isInteger(count) || Math.abs(count)>5000) throw new RangeError('Ungültige Tagesverschiebung');
  return iso(new Date(d.getTime()+count*MS_DAY));
}
function dayDiff(from,to) { return Math.round((asDate(to).getTime()-asDate(from).getTime())/MS_DAY); }
function formatDateDE(value){const d=asDate(value);return String(d.getUTCDate()).padStart(2,'0')+'.'+String(d.getUTCMonth()+1).padStart(2,'0')+'.'+d.getUTCFullYear();}
function lifeBoundary(birthDate, completedMonths) {
  if (!Number.isInteger(completedMonths) || completedMonths<0 || completedMonths>120) throw new RangeError('Lebensmonatsgrenze ungültig');
  const birth = asDate(birthDate, 'Geburtsdatum');
  const monthStart = new Date(Date.UTC(birth.getUTCFullYear(),birth.getUTCMonth()+completedMonths,1));
  const lastDay = new Date(Date.UTC(monthStart.getUTCFullYear(),monthStart.getUTCMonth()+1,0)).getUTCDate();
  // Age includes the birthday (§187(2)); an absent end day expires at
  // month end (§188(3)), so the following interval starts on the next day.
  monthStart.setUTCDate(birth.getUTCDate()>lastDay ? lastDay+1 : birth.getUTCDate());
  return iso(monthStart);
}
function lifeMonths(birthDate,count=36) {
  asDate(birthDate, 'Geburtsdatum');
  if (!Number.isInteger(count) || count<1 || count>96) throw new RangeError('Anzahl Lebensmonate ungültig');
  const result=[];
  for(let i=0;i<count;i++){
    const startDate=lifeBoundary(birthDate,i);
    const exclusiveEnd=lifeBoundary(birthDate,i+1);
    const days=dayDiff(startDate,exclusiveEnd);
    if (days<=0) throw new RangeError('Nicht aufsteigende Lebensmonatsgrenzen');
    result.push({lm:i+1,startDate,endDate:addDays(exclusiveEnd,-1),exclusiveEnd,days,ageStartMonths:i,ageEndMonths:i+1});
  }
  return result;
}
function maternityTimeline({birthDate,expectedDueDate=birthDate,prenatalDays=42,postnatalDays=56}){
  asDate(birthDate,'Geburtsdatum');
  asDate(expectedDueDate,'Voraussichtlicher Geburtstermin');
  if (!Number.isInteger(prenatalDays)||prenatalDays<0||prenatalDays>126 ||
      !Number.isInteger(postnatalDays)||postnatalDays<0||postnatalDays>126)
    throw new RangeError('Mutterschutz-Tage außerhalb des unterstützten Bereichs');
  const earlyDays=Math.max(0,dayDiff(birthDate,expectedDueDate));
  const actualPostnatalDays=postnatalDays+Math.min(earlyDays,prenatalDays);
  const prenatalStart=addDays(expectedDueDate,-prenatalDays);
  // The birth event day is excluded when counting the eight weeks after
  // delivery (§187(1), §188(2)); it is itself also protected.
  const postEndExclusive=addDays(birthDate,actualPostnatalDays+1);
  return {
    expectedDueDate,birthDate,prenatalDays,postnatalDays,earlyDays,
    postnatalDaysWithEarlyExtension:actualPostnatalDays,
    protectedCalendarDaysIncludingBirth:actualPostnatalDays+1,
    sources:DATE_SOURCES.maternity,reviewedAt:DATE_SOURCES.reviewedAt,
    prenatal:{startDate:prenatalStart,endDate:addDays(birthDate,-1)},
    postnatal:{startDate:birthDate,endDate:addDays(postEndExclusive,-1),exclusiveEnd:postEndExclusive},
    requiresIndividualReview:earlyDays>0 || expectedDueDate!==birthDate || postnatalDays!==56,
    reason:earlyDays>0?'Frühere Geburt verlängert die Schutzfrist; Elterngeld-Monatsrechnung gesondert prüfen.':
      expectedDueDate!==birthDate?'Abweichender Termin: Schutzfristen individuell prüfen.':
      postnatalDays!==56?'Abweichende Schutzfrist muss individuell geprüft werden.':'Standardannahme 56 Tage nach der Geburt'
  };
}
function daysOverlapInclusive(start1,end1,start2,end2) {
  const lo = start1>start2?start1:start2, hi = end1<end2?end1:end2;
  return lo>hi?0:dayDiff(lo,hi)+1;
}
function inferParentalLeave(months,schedule,parent){
  const key=PARENT_CODE[parent];
  const arr=[];
  let begin=null,finish=null;
  function push() {
    if(begin!==null){arr.push({id:parent+'-derived-'+(arr.length+1),startDate:begin,endDate:finish,source:'derived_from_monthly_status'});begin=null;finish=null;}
  }
  for(const m of months){
    const row=schedule[m.lm-1]||{};
    if(LEAVE_CODES.has(row[key])){
      if(begin===null)begin=m.startDate;
      finish=m.endDate;
    } else push();
  }
  push();
  return arr;
}
function verifiedPeriods(source,months,parent){
  if(source==null)return inferParentalLeave(months,[],parent);
  if(!Array.isArray(source))throw new TypeError('Elternzeitabschnitte müssen eine Liste sein: '+parent);
  const from=months[0].startDate;
  const thirdBirthdayEnd=addDays(lifeBoundary(from,36),-1);
  const to=months.at(-1).endDate<thirdBirthdayEnd?months.at(-1).endDate:thirdBirthdayEnd;
  return source.map((raw,i)=>{
    const label=parent+' Elternzeitabschnitt '+(i+1);
    const startDate=raw?.startDate, endDate=raw?.endDate;
    asDate(startDate,label+' Beginn');
    asDate(endDate,label+' Ende');
    if(startDate>endDate)throw new RangeError(label+': Enddatum liegt vor dem Start');
    if(startDate<from||endDate>to)throw new RangeError(label+': nur bis zum 3. Geburtstag im Modell unterstützt');
    return {id:typeof raw.id==='string'&&raw.id.length<100?raw.id:parent+'-manual-'+(i+1),startDate,endDate,source:'user'};
  }).sort((a,b)=>a.startDate.localeCompare(b.startDate)||a.endDate.localeCompare(b.endDate));
}
function resolvePeriods(value,months,schedule,parent){
  return value==null?inferParentalLeave(months,schedule,parent):verifiedPeriods(value,months,parent);
}
function employmentFromCode(code,hours,fullTimeHours=40){
  const weeklyHours=Number(hours);
  if(code==='MS')return {mode:'maternity_status',weeklyHours:0};
  if(PART_TIME_CODES.has(code))return {mode:'part_time',weeklyHours:Number.isFinite(weeklyHours)?weeklyHours:0};
  if(LEAVE_CODES.has(code))return {mode:'no_employment',weeklyHours:0};
  return {mode:'full_time',weeklyHours:fullTimeHours};
}
function benefitFromCode(code){
  if(code==='MS')return {type:'maternity_offset_basis',code};
  if(BASIS_CODES.has(code))return {type:'basis',code};
  if(code==='P'||code==='T')return {type:'plus',code};
  if(code==='K')return {type:'partnership_bonus',code};
  return {type:'none',code};
}
function coverageForMonth(month,periods){
  // Count the UNION of day intervals, not the sum of potentially overlapping claims.
  const relevant=periods.map(p=>({
    from:p.startDate>month.startDate?p.startDate:month.startDate,
    to:p.endDate<month.endDate?p.endDate:month.endDate
  })).filter(p=>p.from<=p.to).sort((a,b)=>a.from.localeCompare(b.from));
  if(!relevant.length)return 0;
  let days=0,first=relevant[0].from,last=relevant[0].to;
  for(const p of relevant.slice(1)){
    if(p.from<=addDays(last,1)){if(p.to>last)last=p.to;}
    else {days+=dayDiff(first,last)+1;first=p.from;last=p.to;}
  }
  return days+dayDiff(first,last)+1;
}
function projectFinancial(row){
  if(!row)return null;
  return {
    modelPeriod:'life_month',actualPaymentDate:null,
    fatherWage:Number(row.fi)||0,motherWageOrMaternityEstimate:Number(row.mi)||0,
    fatherElterngeld:Number(row.fg)||0,motherElterngeld:Number(row.mg)||0,
    kindergeld:Number(row.kind)||0,regionalGrant:Number(row.grant)||0,
    childcareCost:Number(row.childcare)||0,projectedHouseholdIncome:Number(row.income)||0,
    projectedAfterCosts:Number(row.cashAfter)||0
  };
}
/** Sparse independent life-month axes. Omitted months retain legacy status. */
function monthOverrides(value,kind,months,parent){
  if(value==null)return new Map();
  if(!Array.isArray(value))throw new TypeError(kind+' muss eine Liste sein: '+parent);
  const result=new Map();
  for(const row of value){
    if(!row||!Number.isInteger(row.lm)||row.lm<1||row.lm>months||result.has(row.lm))
      throw new RangeError(kind+': Lebensmonat fehlt, doppelt oder außerhalb des Planungshorizonts');
    if(kind==='employment'){
      if(typeof row.weeklyHours!=='number'||!Number.isFinite(row.weeklyHours)||row.weeklyHours<0||row.weeklyHours>80)
        throw new RangeError('Wochenstunden müssen zwischen 0 und 80 liegen');
      result.set(row.lm,{mode:row.weeklyHours===0?'no_employment':'user_hours',weeklyHours:row.weeklyHours,source:'user'});
    }else{
      if(!BENEFIT_TYPES.has(row.type))throw new RangeError('Unbekannter Elterngeldtyp');
      result.set(row.lm,{type:row.type,source:'user'});
    }
  }
  return result;
}
/** Actual recorded transfers are never inferred from a modeled entitlement. */
function validateBankLedger(entries=[]){
  if(!Array.isArray(entries))throw new TypeError('Finanzbuchungen müssen eine Liste sein');
  const ids=new Set();
  return entries.map((entry,i)=>{
    if(!entry||typeof entry!=='object')throw new TypeError('Ungültige Finanzbuchung');
    asDate(entry.paymentDate,'Buchungsdatum');
    if(typeof entry.amount!=='number'||!Number.isFinite(entry.amount))throw new RangeError('Buchungsbetrag muss endlich sein');
    if(entry.parent!=null&&!PARENT.includes(entry.parent))throw new RangeError('Unbekannter Elternteil');
    const id=entry.id==null?'bank-'+(i+1):entry.id;
    if(typeof id!=='string'||!id.length||id.length>100||ids.has(id))throw new RangeError('Buchungs-ID fehlt oder ist doppelt');
    ids.add(id);
    const categories=['wage','elterngeld','maternity','kindergeld','childcare','household','other'];
    if(!categories.includes(entry.category))throw new RangeError('Unbekannte Buchungskategorie');
    return {id,paymentDate:entry.paymentDate,amount:entry.amount,category:entry.category,parent:entry.parent??null,source:'recorded_transfer'};
  }).sort((a,b)=>a.paymentDate.localeCompare(b.paymentDate)||a.id.localeCompare(b.id));
}
function calendarCashflow(ledger){
  const sums=new Map();
  for(const entry of ledger){
    const month=entry.paymentDate.slice(0,7);
    sums.set(month,(sums.get(month)||0)+entry.amount);
  }
  return Array.from(sums,([calendarMonth,netRecordedTransfers])=>({calendarMonth,netRecordedTransfers}));
}
function buildTimeAxes({
  birthDate,expectedDueDate=birthDate,schedule,financialRows=[],leaveOverrides=null,
  employmentOverrides=null,benefitOverrides=null,bankLedger=[],
  weeklyHours={father:28,mother:28},fullTimeHours={father:40,mother:40},
  postnatalDays=56,prenatalDays=42,months=36
}){
  if(!Array.isArray(schedule)||schedule.length<months)throw new RangeError('Monatsstatus unvollständig');
  const life=lifeMonths(birthDate,months);
  const mat=maternityTimeline({birthDate,expectedDueDate,prenatalDays,postnatalDays});
  const notes=[],periods={},employment={},benefits={};
  const recordedTransfers=validateBankLedger(bankLedger);
  for(const parent of PARENT){
    employment[parent]=monthOverrides(employmentOverrides?.[parent],'employment',months,parent);
    benefits[parent]=monthOverrides(benefitOverrides?.[parent],'benefit',months,parent);
    const v=leaveOverrides&&Object.prototype.hasOwnProperty.call(leaveOverrides,parent)?leaveOverrides[parent]:null;
    periods[parent]=resolvePeriods(v,life,schedule,parent);
    if(periods[parent].length>3)notes.push({code:'LEAVE_MANY_SEGMENTS',parent,message:'Mehr als drei Elternzeitabschnitte: zusätzliche Abschnitte brauchen in der Regel Zustimmung des Arbeitgebers.'});
    for(let i=1;i<periods[parent].length;i++){
      if(periods[parent][i].startDate<=periods[parent][i-1].endDate){
        notes.push({code:'LEAVE_OVERLAP',parent,message:'Überlappende Elternzeitabschnitte desselben Elternteils; Tage werden nicht doppelt gezählt.'});
      }
    }
  }
  if(mat.requiresIndividualReview)notes.push({code:'NONSTANDARD_MATERNITY',parent:'mother',message:'Mutterschutz weicht vom Standardfall ab; der bisherige Finanzrechner nutzt vereinfachte 56 Tage. Keine automatische Leistungszusage.'});
  if(mat.postnatal.exclusiveEnd>life[1].exclusiveEnd){
    notes.push({code:'MATERNITY_AFTER_LM2',parent:'mother',message:'Mutterschutz reicht über Lebensmonat 2 hinaus. Der bisherige Finanzrechner unterstellt dennoch pauschal Mutterschutz nur in LM1–2.'});
  }
  if(asDate(birthDate).getUTCDate()>=29){
    notes.push({code:'MONTH_END_EDGE',message:'Geburtstag am Monatsende: Die verkürzten Lebensmonatsgrenzen gesondert mit dem amtlichen Lebensmonatsrechner abgleichen.'});
  }
  for(const p of periods.mother){
    if(daysOverlapInclusive(p.startDate,p.endDate,mat.postnatal.startDate,mat.postnatal.endDate)>0){
      notes.push({code:'LEAVE_MATERNITY_OVERLAP',parent:'mother',message:'Der eingetragene Elternzeitabschnitt überschneidet sich mit der Mutterschutzfrist. Den arbeitsrechtlichen Beginn gesondert prüfen.'});
    }
  }
  const deadlines=PARENT.flatMap(parent=>periods[parent].map(p=>({
    parent,periodId:p.id,startDate:p.startDate,
    sevenWeekNoticeBy:addDays(p.startDate,-49),
    method:'Textform (Standardkohorte ab 01.05.2025)',
    law:'BEEG-16',
    estimatedBirthNotice:parent==='father'&&p.startDate===birthDate,
    note:p.source==='user'?'Individuell eingegebener arbeitsrechtlicher Abschnitt':'Aus Monatsstatus abgeleiteter Abschnitt; keine verbindliche Anmeldung'
  })));
  const timeline=life.map((m,i)=>{
    const raw=schedule[i]||{};
    const parents={};
    for(const parent of PARENT){
      const key=PARENT_CODE[parent];
      const code=raw[key]||'W';
      const fallback=Number(weeklyHours[parent]);
      const hours=raw[key==='f'?'hf':'hm']??fallback;
      parents[parent]={
        legalLeaveDays:coverageForMonth(m,periods[parent]),
        leaveSource:leaveOverrides&&Object.prototype.hasOwnProperty.call(leaveOverrides,parent)&&leaveOverrides[parent]!=null?'user':'derived',
        employment:employment[parent].get(m.lm)||{...employmentFromCode(code,hours,fullTimeHours[parent]),source:'derived'},
        benefit:benefits[parent].get(m.lm)||{...benefitFromCode(code),source:'derived'}
      };
    }
    return {
      lm:m.lm,startDate:m.startDate,endDate:m.endDate,days:m.days,
      ageStartMonths:m.ageStartMonths,ageEndMonths:m.ageEndMonths,
      maternityDays:daysOverlapInclusive(m.startDate,m.endDate,mat.postnatal.startDate,mat.postnatal.endDate),
      parents,financial:projectFinancial(financialRows[i])
    };
  });
  return {
    birthDate,expectedDueDate,months:life,maternity:mat,leavePeriods:periods,
    deadlines,timeline,notices:notes,
    recordedTransfers,calendarCashflow:calendarCashflow(recordedTransfers),dateSources:DATE_SOURCES,
    financialBasis:'estimated_by_child_life_month_not_real_bank_transfer_date'
  };
}
module.exports = {
  addDays,dayDiff,formatDateDE,lifeBoundary,lifeMonths,maternityTimeline,
  daysOverlapInclusive,coverageForMonth,inferParentalLeave,benefitFromCode,employmentFromCode,
  monthOverrides,validateBankLedger,calendarCashflow,buildTimeAxes
};
