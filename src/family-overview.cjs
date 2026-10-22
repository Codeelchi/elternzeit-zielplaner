'use strict';

// Presentation-only projection of the EXISTING evaluated life-month rows.
// No entitlement, weekday care, real cash receipts or other business rules here.
const FULL_HOME=new Set(['B','P','U','MS']);
const PART_TIME=new Set(['R','T','Q','K']);
const LABELS=Object.freeze({
 W:'Erwerbsarbeit',MS:'Mutterschutz (pauschal)',B:'Basiselterngeld ohne Arbeit',
 R:'Basiselterngeld mit Teilzeit',P:'ElterngeldPlus ohne Arbeit',
 T:'ElterngeldPlus mit Teilzeit',Q:'Teilzeit ohne Elterngeld',
 K:'Partnerschaftsbonus mit Teilzeit',U:'Elternzeit ohne Elterngeld'
});
const MAX_MONTHS=36;
function decimal(value,label) {
 if(typeof value!=='number'||!Number.isFinite(value)||Math.abs(value)>1e9)
  throw new RangeError(label+': endlicher, begrenzter Monatswert erforderlich.');
 return value;
}
function integer(value,label,min,max) {
 if(!Number.isInteger(value)||value<min||value>max)throw new RangeError(label+': ungültiger Lebensmonat.');
 return value;
}
function parentStatus(code,hours) {
 if(!Object.hasOwn(LABELS,code))throw new RangeError('Nicht unterstützter Monatscode.');
 if(typeof hours!=='number'||!Number.isFinite(hours)||hours<0||hours>168)throw new RangeError('Ungültige Wochenstunden.');
 const availability=FULL_HOME.has(code)&&hours===0?'at-home':PART_TIME.has(code)||hours>0?'work-or-part-time':'working';
 return {code,label:LABELS[code],hours,availability};
}
/**
 * care: only explicit assumptions can count as documented in this model.
 * 'open' is a missing model attribution, NOT proof of an uncovered real care hour.
 */
function buildFamilyView({rows,horizon,childcareStartLm=0,expensesKnown=false,validationStatus='NICHT_UNTERSTUETZT'}={}) {
 if(!Array.isArray(rows)||rows.length<1||rows.length>MAX_MONTHS)throw new RangeError('Lebensmonatsdaten fehlen oder sind unvollständig.');
 integer(horizon,'Vergleichszeitraum',1,rows.length);
 if(childcareStartLm!==0)integer(childcareStartLm,'Geplanter Kita-Start',1,MAX_MONTHS);
 if(typeof expensesKnown!=='boolean')throw new TypeError('Kostenbekanntheit muss eindeutig sein.');
 if(typeof validationStatus!=='string'||validationStatus.length>80)throw new TypeError('Ungültiger Prüfstatus.');
 const months=rows.slice(0,horizon).map((r,i)=>{
  if(!r||r.lm!==i+1)throw new RangeError('Lebensmonate müssen lückenlos ab 1 vorliegen.');
  const first=parentStatus(r.f,r.hf),second=parentStatus(r.m,r.hm);
  const income=decimal(r.income,'Einnahmen'),wage=decimal(r.totalWage,'Arbeitsnetto'),
    benefit=decimal(r.totalEg,'Elterngeld'),childcare=decimal(r.childcare,'Kita-Kosten'),
    kind=decimal(r.kind,'Kindergeld');
  const available=expensesKnown?decimal(r.cashAfter,'Rest nach Kosten'):null;
  const care=childcareStartLm>0&&r.lm>=childcareStartLm?'planned-kita':
   first.availability==='at-home'||second.availability==='at-home'?'parent-at-home':'not-documented';
  return {lm:r.lm,first,second,care,income,wage,benefit,childcare,kind,available};
 });
 const totalIncome=months.reduce((a,r)=>a+r.income,0);
 const firstUnattributed=months.find(x=>x.care==='not-documented')?.lm??null;
 const homeMonths={first:months.filter(x=>x.first.availability==='at-home').length,
  second:months.filter(x=>x.second.availability==='at-home').length};
 let minAvailable=null,totalAvailable=null,requiredBuffer=null;
 if(expensesKnown){
  minAvailable=Math.min(...months.map(x=>x.available));
  totalAvailable=months.reduce((a,r)=>a+r.available,0);
  let running=0,minRunning=0;
  for(const m of months){running+=m.available;minRunning=Math.min(minRunning,running);}
  // Model-only cumulative monthly deficit, not a timing-aware bank liquidity reserve.
  requiredBuffer=Math.max(0,-minRunning);
 }
 return {horizon,months,expensesKnown,validationStatus,firstUnattributed,homeMonths,
  totalIncome,minAvailable,totalAvailable,requiredBuffer,childcareStartLm};
}
module.exports={buildFamilyView,LABELS};
