'use strict';

const MAX_ROWS=36, MAX_EURO=100000;
const DAY=86400000;
const DIRECTIONS=new Set(['incoming','outgoing']);
const CATEGORIES=new Set(['elterngeld','wage','maternity','kindergeld','childcare','household','other']);
function exactDate(value) {
  if(typeof value!=='string'||!/^20\d{2}-\d{2}-\d{2}$/.test(value))return null;
  const dt=new Date(value+'T00:00:00.000Z');
  return Number.isFinite(dt.valueOf())&&dt.toISOString().slice(0,10)===value?dt:null;
}
function preciseMoney(value,{nullable=false}={}) {
  if(nullable&&(value===null||value===undefined||value===''))return null;
  if(typeof value!=='number'||!Number.isFinite(value)||value<0||value>MAX_EURO||
     Math.abs(value*100-Math.round(value*100))>1e-7)
    throw new RangeError('Betrag muss eine nichtnegative Zahl bis 100.000 € mit höchstens zwei Nachkommastellen sein.');
  return Math.round(value*100);
}
function validatePayments(payments) {
  if(!Array.isArray(payments)||payments.length>MAX_ROWS)throw new RangeError('Höchstens 36 explizite Planungsposten unterstützt.');
  const ids=new Set();
  return payments.map((p,index)=>{
    if(!p||typeof p!=='object'||Array.isArray(p))throw new TypeError('Planposten müssen Objekte sein.');
    const date=exactDate(p.date);
    if(!date)throw new RangeError('Ungültiges Datum im geplanten Zahlungsposten.');
    if(typeof p.id!=='string'||!p.id||p.id.length>80||ids.has(p.id))
      throw new RangeError('Planposten-ID fehlt oder ist doppelt.');
    ids.add(p.id);
    if(!DIRECTIONS.has(p.direction)||!CATEGORIES.has(p.category))
      throw new RangeError('Unbekannte Zahlungsrichtung oder -art.');
    return {id:p.id,date:p.date,direction:p.direction,category:p.category,
      cents:preciseMoney(p.amount),index};
  });
}
function dailyProjection(entries,delayDays,initialCents) {
  const shifted=entries.map(p=>{
    const date=new Date(p.date+'T00:00:00.000Z');
    if(p.direction==='incoming')date.setUTCDate(date.getUTCDate()+delayDays);
    const shiftedDate=date.toISOString().slice(0,10);
    return {id:p.id,originalDate:p.date,date:shiftedDate,direction:p.direction,category:p.category,
      signedCents:p.direction==='incoming'?p.cents:-p.cents,index:p.index};
  }).sort((a,b)=>a.date.localeCompare(b.date)||a.signedCents-b.signedCents||a.index-b.index);
  let running=0,worst=0,deficitDate=null;
  const months=new Map();
  for(const item of shifted) {
    running+=item.signedCents;
    if(running<worst){worst=running;deficitDate=item.date;}
    const key=item.date.slice(0,7);
    months.set(key,(months.get(key)||0)+item.signedCents);
  }
  const first=shifted[0]?.date.slice(0,7),last=shifted.at(-1)?.date.slice(0,7);
  const timeline=[];
  if(first) {
    const dt=new Date(first+'-01T00:00:00.000Z'),end=new Date(last+'-01T00:00:00.000Z');
    for(;dt<=end;dt.setUTCMonth(dt.getUTCMonth()+1)){
      if(timeline.length>=96)throw new RangeError('Planung über mehr als 96 Kalendermonate wird nicht unterstützt.');
      const key=dt.toISOString().slice(0,7);
      timeline.push({calendarMonth:key,plannedNet:(months.get(key)||0)/100,hasEntries:months.has(key)});
    }
  }
  const requiredBuffer=Math.max(0,-worst);
  const worstWithOpening=initialCents===null?null:(initialCents+worst)/100;
  return {events:shifted.map(e=>({id:e.id,originalDate:e.originalDate,plannedDate:e.date,direction:e.direction,category:e.category,amount:Math.abs(e.signedCents)/100})),
    months:timeline,requiredBuffer:requiredBuffer/100,firstPeakShortfallDate:deficitDate,
    assumedOpeningReserve:initialCents===null?null:initialCents/100,
    minimumIllustrativeBalance:worstWithOpening,netScheduled:running/100};
}
/** Daily, not monthly, ordering of manually proposed receipts/expenses. Never mixes actual bank ledger or legal benefits. */
function compareExpectedPayments({payments=[],delayDays=0,openingReserve=null}={}) {
  if(!Number.isInteger(delayDays)||delayDays<0||delayDays>90)throw new RangeError('Verschiebung nur zwischen 0 und 90 Tagen möglich.');
  const entries=validatePayments(payments);
  const initialCents=preciseMoney(openingReserve,{nullable:true});
  const regular=dailyProjection(entries,0,initialCents);
  const delayed=dailyProjection(entries,delayDays,initialCents);
  return {basis:'NUR_MANUELLE_ZAHLUNGSANNAHMEN',actualBankLedgerIncluded:false,legalEntitlementInferred:false,
    delayDays,paymentCount:entries.length,regular,delayed,
    additionalBuffer:Math.round((delayed.requiredBuffer-regular.requiredBuffer)*100)/100,
    warnings:[
      'Alle Termine und Beträge sind manuell eingegebene Annahmen, keine zugesagten oder prognostizierten Bankeingänge.',
      'Ausgaben oder Gehälter, die nicht als eigener Posten eingetragen wurden, fehlen vollständig.',
      'Die rechnerische Anfangsrücklage ist kein abgelesener Kontostand. In der Tagesberechnung werden Ausgaben bei gleichem Datum vorsichtshalber vor Eingängen gebucht.',
      'Mit der Verschiebung ändern sich ausschließlich angenommene Geldeingangstage – nicht der Elterngeldanspruch oder bereits gebuchte Umsätze.'
    ]};
}
module.exports={compareExpectedPayments,validatePayments};
