'use strict';

const {roundEuro,MAX_EURO}=require('./money.cjs');
const CALENDAR_MONTH=/^(\d{4})-(0[1-9]|1[0-2])$/;
function centMoney(value,label,{signed=false,max=MAX_EURO}={}) {
  if(typeof value!=='number'||!Number.isFinite(value)||Math.abs(value)>max||(!signed&&value<0))
    throw new RangeError(label+': ungültiger Betrag.');
  return Math.round(roundEuro(value)*100);
}
/**
 * Totals ONLY individually recorded transfers, grouped by calendar month.
 * An optional starting reserve is an explicit assumption, never an inferred
 * bank balance. Missing months are "not recorded", not observed zero transfers.
 */
function summarizeRecordedLiquidity({calendarCashflow=[],openingReserve=null}={}) {
  if(!Array.isArray(calendarCashflow)||calendarCashflow.length>96)throw new TypeError('Gebuchte Kalendermonate fehlen oder überschreiten den Planungshorizont.');
  const hasOpening=openingReserve!==null&&openingReserve!==undefined&&openingReserve!=='';
  if(hasOpening&&(typeof openingReserve!=='number'||!Number.isFinite(openingReserve)||
       Math.abs(openingReserve*100-Math.round(openingReserve*100))>1e-6))
    throw new RangeError('Anfangsrücklage: maximal zwei Nachkommastellen zulässig.');
  let balance=hasOpening?centMoney(openingReserve,'Manuell angenommene Anfangsrücklage',{max:100000}):null;
  const grouped=new Map();
  for(const item of calendarCashflow){
    if(!item||typeof item!=='object'||!CALENDAR_MONTH.test(item.calendarMonth))
      throw new RangeError('Ungültiger Kalendermonat in gebuchten Beträgen.');
    if(grouped.has(item.calendarMonth))throw new RangeError('Doppelte Kalendermonate sind nicht erlaubt.');
    grouped.set(item.calendarMonth,centMoney(item.netRecordedTransfers,'Gebuchter Netto-Eingang',{signed:true}));
  }
  const keys=[...grouped.keys()].sort();
  if(!keys.length)return {basis:'NUR_ERFASSTE_BANKBUCHUNGEN',openingReserveKnown:hasOpening,
    months:[],totalRecorded:0,endIllustrativeReserve:hasOpening?balance/100:null,
    firstNegativeIllustrativeMonth:null,completeLedger:false};
  const from=keys[0],to=keys[keys.length-1];
  const date=new Date(from+'-01T00:00:00Z'),end=new Date(to+'-01T00:00:00Z');
  const months=[];
  let sum=0,firstNegative=null;
  while(date.getTime()<=end.getTime()){
    if(months.length>=96)throw new RangeError('Mehr als 96 Kalendermonate nicht unterstützt.');
    const calendarMonth=date.toISOString().slice(0,7),hasRecords=grouped.has(calendarMonth);
    const net=grouped.get(calendarMonth)||0;
    sum+=net;
    if(balance!==null){balance+=net;if(balance<0&&firstNegative===null)firstNegative=calendarMonth;}
    months.push({calendarMonth,hasRecords,netRecordedTransfers:net/100,
      illustrativeBalance:balance===null?null:balance/100});
    date.setUTCMonth(date.getUTCMonth()+1);
  }
  return {basis:'NUR_ERFASSTE_BANKBUCHUNGEN',openingReserveKnown:hasOpening,
    months,totalRecorded:sum/100,endIllustrativeReserve:balance===null?null:balance/100,
    firstNegativeIllustrativeMonth:firstNegative,completeLedger:false};
}
module.exports={summarizeRecordedLiquidity};
