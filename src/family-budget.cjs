'use strict';
const {roundEuro,roundEuroByPercent,MAX_EURO}=require('./money.cjs');
/** Life-month entitlement projections; never a prediction of bank receipt dates. */
function amount(value, label, fallback=0) {
  if (value===undefined || value===null || value==='') return fallback;
  const n=Number(value);
  if (!['number','string'].includes(typeof value) || (typeof value==='string'&&!value.trim()) || !Number.isFinite(n) || n<0 || n>MAX_EURO) throw new RangeError(`${label}: endliche, nichtnegative Zahl bis 1 Milliarde Euro erforderlich.`);
  return n;
}
function record(value,label) {
  if(!value||typeof value!=='object'||Array.isArray(value))throw new TypeError(`${label}: Objekt erforderlich.`);
  return value;
}
// Bounded, process-local memo of numeric conversions only: repeated plan
// candidates reuse the same wages/costs. Never retain rows, identities or plans,
// and never skip roundEuro validation for a previously unseen value.
const centsMemo=new Map();
const CENTS_MEMO_LIMIT=4096;
function cents(value) {
  const known=centsMemo.get(value);
  if(known!==undefined)return known;
  const result=Math.round(roundEuro(value)*100);
  if(centsMemo.size>=CENTS_MEMO_LIMIT)centsMemo.clear();
  centsMemo.set(value,result);
  return result;
}
const scaledCentsMemo=new Map();
function scaledCents(value,deltaPercent) {
  if(deltaPercent===0)return cents(value);
  const key=value+'|'+deltaPercent;
  const known=scaledCentsMemo.get(key);
  if(known!==undefined)return known;
  const result=Math.round(roundEuroByPercent(value,deltaPercent)*100);
  if(scaledCentsMemo.size>=CENTS_MEMO_LIMIT)scaledCentsMemo.clear();
  scaledCentsMemo.set(key,result);
  return result;
}
function calendarDate(value) {
  if(typeof value!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(value))return false;
  const d=new Date(value+'T00:00:00Z');
  return Number.isFinite(d.getTime())&&d.toISOString().slice(0,10)===value;
}
function band(value, fallback, label) {
  const n=amount(value,label,fallback);
  if(n>100)throw new RangeError(`${label}: maximal 100 Prozent.`);
  return n;
}
function projectFamilyBudget({rows,expenses=0,minimum=0,assumptions={},confirmedGrants=[]}={}) {
  if(!Array.isArray(rows)||!rows.length)throw new TypeError('Monatsprojektionen erforderlich.');
  record(assumptions,'Szenarioannahmen');
  if(!Array.isArray(confirmedGrants))throw new TypeError('Bestätigte Zusatzleistungen müssen eine Liste sein.');
  for(const row of rows)record(row,'Monatsprojektion');
  const wageBand=band(assumptions.wagePercent,15,'Einkommensband');
  const fatherWageBand=band(assumptions.fatherWagePercent,wageBand,'Einkommensband Vater');
  const motherWageBand=band(assumptions.motherWagePercent,wageBand,'Einkommensband Mutter');
  const egBand=band(assumptions.elterngeldPercent,5,'Elterngeldband');
  const costBand=band(assumptions.costPercent,20,'Kostenband');
  const expense=amount(expenses,'Haushaltsausgaben'), target=amount(minimum,'Mindestbetrag');
  const rejectedGrants=[];
  const grants=new Map();
  for(const grant of confirmedGrants) {
    if(!grant||typeof grant!=='object'||Array.isArray(grant)||grant.confirmed!==true || !grant.sourceUrl || !/^https:\/\//.test(grant.sourceUrl) || ![grant.verifiedAt,grant.validFrom,grant.validUntil,grant.entitlementDate].every(calendarDate) || grant.entitlementDate<grant.validFrom || grant.entitlementDate>grant.validUntil) {
      rejectedGrants.push({id:grant?.id||null,reason:'Anspruch und datierte Quelle nicht vollständig bestätigt.'}); continue;
    }
    if(!Number.isInteger(grant.lm)||grant.lm<1)throw new RangeError('Leistungsmonat ungültig.');
    if(grant.lm>rows.length){
      rejectedGrants.push({id:grant.id||null,reason:'Bestätigte Zusatzleistung liegt außerhalb des berechneten Lebensmonats-Horizonts.'});
      continue;
    }
    grants.set(grant.lm,(grants.get(grant.lm)||0)+cents(amount(grant.amount,'Zusatzleistung')));
  }
  const ignoredRowGrants=rows.some(r=>Number(r.grant)>0);
  const prepared=rows.map((row,i)=>{
    const lm=row.lm===undefined?i+1:row.lm;
    if(!Number.isInteger(lm)||lm!==i+1)throw new RangeError('Lebensmonate müssen lückenlos ab 1 geordnet sein.');
    const fatherWage=amount(row.fi,'Einkommen Elternteil 1');
    const motherIncome=amount(row.mi,'Einkommen Elternteil 2');
    // Maternity is already included in mi; only the remaining wage varies.
    const maternity=amount(row.maternityBenefits,'Mutterschaftsleistungen');
    if(maternity>motherIncome)throw new RangeError('Mutterschaftsleistungen übersteigen die Einkommensprojektion der Mutter.');
    const maternityKnown=row.maternityBenefits!==undefined && row.maternityBenefits!==null && row.maternityBenefits!=='';
    return {lm,fatherWage,motherWage:motherIncome-maternity,maternity,maternityKnown,elterngeldFather:amount(row.fg,'Elterngeld 1'),elterngeldMother:amount(row.mg,'Elterngeld 2'),kindergeld:amount(row.kind,'Kindergeld'),childcare:amount(row.childcare,'Betreuungskosten'),grant:(grants.get(lm)||0)/100};
  });
  const scenarios=[['conservative','Vorsichtig',-1],['realistic','Realistisch',0],['favourable','Günstig',1]].map(([id,label,direction])=>{
    // Scenario components are booked in cents before aggregation. Integer
    // prefix balances avoid phantom deficit months caused by binary floats.
    const targetCents=cents(target);
    let cumulative=0,requiredReserves=0,totalIncome=0,totalAvailable=0;
    const months=prepared.map(r=>{
      const fatherWage=scaledCents(r.fatherWage,direction*fatherWageBand);
      const motherWage=scaledCents(r.motherWage,direction*motherWageBand);
      const wages=fatherWage+motherWage;
      // Each parent's rounded entitlement is a distinct cash component. Scaling
      // the combined total would silently gain/lose a cent at half-cent boundaries.
      const elterngeld=scaledCents(r.elterngeldFather,direction*egBand)+
        scaledCents(r.elterngeldMother,direction*egBand);
      const childcare=scaledCents(r.childcare,-direction*costBand),householdExpenses=scaledCents(expense,-direction*costBand);
      const maternity=cents(r.maternity),kindergeld=cents(r.kindergeld),grant=Math.round(r.grant*100);
      const income=wages+maternity+elterngeld+kindergeld+grant;
      const available=income-childcare-householdExpenses,shortfall=Math.max(0,targetCents-available);
      cumulative+=available-targetCents;requiredReserves=Math.max(requiredReserves,-cumulative);totalIncome+=income;totalAvailable+=available;
      return {lm:r.lm,fatherWage:fatherWage/100,motherWage:motherWage/100,wages:wages/100,maternityBenefits:maternity/100,elterngeld:elterngeld/100,kindergeld:kindergeld/100,confirmedAdditionalBenefits:grant/100,childcare:childcare/100,householdExpenses:householdExpenses/100,income:income/100,available:available/100,shortfall:shortfall/100,cumulativeSurplus:cumulative/100};
    });
    return {id,label,months,requiredReserves:requiredReserves/100,totalIncome:totalIncome/100,totalAvailable:totalAvailable/100,lowestAvailable:Math.min(...months.map(r=>r.available)),bottleneckMonths:months.filter(r=>r.shortfall>0).map(r=>r.lm)};
  });
  return {basis:'MODELLIERTER_LEISTUNGSANSPRUCH',bankReceiptsPredicted:false,scenarios,assumptions:{wagePercent:wageBand,fatherWagePercent:fatherWageBand,motherWagePercent:motherWageBand,elterngeldPercent:egBand,costPercent:costBand,expenses:expense,minimum:target},rejectedGrants,warnings:[
    'Nettoeinkommen und Elterngeld sind Schätzungen; Szenariobänder sind Annahmen, keine Wahrscheinlichkeiten.',
    'Leistungsanspruch pro Lebensmonat ist kein tatsächlicher Bank-Zahlungseingang. Verzögerte Auszahlungen erfordern zusätzliche Liquidität.',
    'Progressionsvorbehalt kann Steuernachzahlungen auslösen; individuelle Versicherungsbeiträge sind nicht enthalten.',
    ...(ignoredRowGrants?['Manuelle Zusatzleistungen wurden ohne bestätigte, datierte Anspruchsgrundlage nicht übernommen.']:[]),
    ...(rejectedGrants.some(r=>r.reason.includes('außerhalb'))?['Bestätigte Zusatzleistungen außerhalb des Planungshorizonts wurden nicht stillschweigend berücksichtigt.']:[]),
    ...(prepared.some(r=>!r.maternityKnown)?['Ohne explizite Aufteilung können Mutterschaftsleistungen im kombinierten Arbeitseinkommen enthalten sein.']:[])
  ]};
}
module.exports={projectFamilyBudget};
