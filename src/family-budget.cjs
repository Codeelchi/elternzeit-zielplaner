'use strict';
/** Life-month entitlement projections; never a prediction of bank receipt dates. */
function amount(value, label, fallback=0) {
  if (value===undefined || value===null || value==='') return fallback;
  const n=Number(value);
  if (!Number.isFinite(n) || n<0) throw new RangeError(`${label}: endliche, nichtnegative Zahl erforderlich.`);
  return n;
}
function calendarDate(value) {
  if(typeof value!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(value))return false;
  const d=new Date(value+'T00:00:00Z');
  return Number.isFinite(d.getTime())&&d.toISOString().slice(0,10)===value;
}
function band(value, fallback, label) {
  const n=amount(value,label,fallback);
  if(n>100)throw new RangeError(`${label}: maximal 100 Prozent.`);
  return n/100;
}
function projectFamilyBudget({rows,expenses=0,minimum=0,assumptions={},confirmedGrants=[]}={}) {
  if(!Array.isArray(rows)||!rows.length)throw new TypeError('Monatsprojektionen erforderlich.');
  const wageBand=band(assumptions.wagePercent,15,'Einkommensband');
  const egBand=band(assumptions.elterngeldPercent,5,'Elterngeldband');
  const costBand=band(assumptions.costPercent,20,'Kostenband');
  const expense=amount(expenses,'Haushaltsausgaben'), target=amount(minimum,'Mindestbetrag');
  const rejectedGrants=[];
  const grants=new Map();
  for(const grant of confirmedGrants) {
    if(grant.confirmed!==true || !grant.sourceUrl || !/^https:\/\//.test(grant.sourceUrl) || ![grant.verifiedAt,grant.validFrom,grant.validUntil,grant.entitlementDate].every(calendarDate) || grant.entitlementDate<grant.validFrom || grant.entitlementDate>grant.validUntil) {
      rejectedGrants.push({id:grant.id||null,reason:'Anspruch und datierte Quelle nicht vollständig bestätigt.'}); continue;
    }
    if(!Number.isInteger(grant.lm)||grant.lm<1)throw new RangeError('Leistungsmonat ungültig.');
    grants.set(grant.lm,(grants.get(grant.lm)||0)+amount(grant.amount,'Zusatzleistung'));
  }
  const ignoredRowGrants=rows.some(r=>Number(r.grant)>0);
  const prepared=rows.map((row,i)=>{
    const lm=row.lm===undefined?i+1:row.lm;
    if(!Number.isInteger(lm)||lm!==i+1)throw new RangeError('Lebensmonate müssen lückenlos ab 1 geordnet sein.');
    const combined=amount(row.fi,'Einkommen Elternteil 1')+amount(row.mi,'Einkommen Elternteil 2');
    // Optional explicit decomposition is a subset of fi+mi, never additional income.
    const maternity=amount(row.maternityBenefits,'Mutterschaftsleistungen');
    if(maternity>combined)throw new RangeError('Mutterschaftsleistungen übersteigen die kombinierte Einkommensprojektion.');
    return {lm,wages:combined-maternity,maternity,elterngeld:amount(row.fg,'Elterngeld 1')+amount(row.mg,'Elterngeld 2'),kindergeld:amount(row.kind,'Kindergeld'),childcare:amount(row.childcare,'Betreuungskosten'),grant:grants.get(lm)||0};
  });
  const scenarios=[['conservative','Vorsichtig',-1],['realistic','Realistisch',0],['favourable','Günstig',1]].map(([id,label,direction])=>{
    let cumulative=0,requiredReserves=0,totalIncome=0;
    const months=prepared.map(r=>{
      const wages=r.wages*(1+direction*wageBand),elterngeld=r.elterngeld*(1+direction*egBand);
      const childcare=r.childcare*(1-direction*costBand),householdExpenses=expense*(1-direction*costBand);
      const income=wages+r.maternity+elterngeld+r.kindergeld+r.grant;
      const available=income-childcare-householdExpenses,shortfall=Math.max(0,target-available);
      cumulative+=available-target;requiredReserves=Math.max(requiredReserves,-cumulative);totalIncome+=income;
      return {lm:r.lm,wages,maternityBenefits:r.maternity,elterngeld,kindergeld:r.kindergeld,confirmedAdditionalBenefits:r.grant,childcare,householdExpenses,income,available,shortfall,cumulativeSurplus:cumulative};
    });
    return {id,label,months,requiredReserves,totalIncome,totalAvailable:months.reduce((n,r)=>n+r.available,0),lowestAvailable:Math.min(...months.map(r=>r.available)),bottleneckMonths:months.filter(r=>r.shortfall>0).map(r=>r.lm)};
  });
  return {basis:'MODELLIERTER_LEISTUNGSANSPRUCH',bankReceiptsPredicted:false,scenarios,assumptions:{wagePercent:wageBand*100,elterngeldPercent:egBand*100,costPercent:costBand*100,expenses:expense,minimum:target},rejectedGrants,warnings:[
    'Nettoeinkommen und Elterngeld sind Schätzungen; Szenariobänder sind Annahmen, keine Wahrscheinlichkeiten.',
    'Leistungsanspruch pro Lebensmonat ist kein tatsächlicher Bank-Zahlungseingang. Verzögerte Auszahlungen erfordern zusätzliche Liquidität.',
    'Progressionsvorbehalt kann Steuernachzahlungen auslösen; individuelle Versicherungsbeiträge sind nicht enthalten.',
    ...(ignoredRowGrants?['Manuelle Zusatzleistungen wurden ohne bestätigte, datierte Anspruchsgrundlage nicht übernommen.']:[]),
    ...(prepared.some(r=>r.maternity===0)?['Ohne explizite Aufteilung können Mutterschaftsleistungen im kombinierten Arbeitseinkommen enthalten sein.']:[])
  ]};
}
module.exports={projectFamilyBudget};
