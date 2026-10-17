'use strict';

// This is a DATED 2025 tariff snapshot, NOT a live bill and never a benefit.
// Source: Stadt Koeln, contribution rates effective 2025-08-01, checked 2026-10-17.
const SOURCE='https://www.stadt-koeln.de/service/produkte/00405/index.html';
const CHECKED='2026-10-17',EFFECTIVE_FROM='2025-08-01';
const LIMITS=Object.freeze([24542,36813,49084,61355,78000,100000,120000,140000,160000,Infinity]);
const TABLE=Object.freeze({
 under2:{
  25:[0,120.02,190.73,268.64,331.51,430.96,517.15,594.72,620.58,672.30],
  35:[0,133.36,211.92,298.49,368.35,478.86,574.63,660.82,689.56,747.02],
  45:[0,148.18,235.47,331.65,409.29,532.06,638.48,734.25,766.18,830.02]},
 age2:{
  25:[0,120.02,181.65,244.22,276.26,331.51,397.81,457.48,477.37,517.15],
  35:[0,133.36,201.83,271.35,306.96,368.35,442.02,508.32,530.42,574.63],
  45:[0,148.18,224.26,301.50,341.07,409.28,491.14,564.81,589.37,638.48]},
 age3:{
  25:[0,31.52,70.73,112.85,148.46,178.15,213.78,245.85,256.54,277.91],
  35:[0,35.03,78.59,125.39,164.96,197.95,237.54,273.17,285.05,308.80],
  45:[0,42.00,123.67,193.94,256.36,307.63,369.16,424.53,442.99,479.91]}
});
function checkedNumber(v,label,max=1e8){
 if(typeof v!=='number'||!Number.isFinite(v)||v<0||v>max)throw new RangeError(label+' ist ungültig.');
 return v;
}
function estimateCologneFee({lifeMonth,annualIncome,hours,meals=0,careDate}={}){
 if(!Number.isInteger(lifeMonth)||lifeMonth<1||lifeMonth>96)throw new RangeError('Lebensmonat 1 bis 96 erforderlich.');
 checkedNumber(annualIncome,'Kommunales Jahreseinkommen');
 checkedNumber(meals,'Essensgeld',10000);
 if(![25,35,45].includes(hours))throw new RangeError('Betreuungsstunden: nur 25, 35 oder 45 möglich.');
 if(typeof careDate!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(careDate)||
  Number.isNaN(Date.parse(careDate))||new Date(careDate+'T00:00:00Z').toISOString().slice(0,10)!==careDate)
  throw new RangeError('Gültiges Betreuungsdatum erforderlich.');
 const group=lifeMonth<=24?'under2':lifeMonth<=36?'age2':'age3';
 const idx=LIMITS.findIndex(limit=>annualIncome<=limit);
 const monthly=TABLE[group][hours][idx];
 const cents=value=>Math.round(value*100);
 const amount=(cents(monthly)+cents(meals))/100;
 return {ratePerMonth:monthly,mealsPerMonth:meals,illustrativeTotal:amount,
  group,incomeBand:idx,hours,source:SOURCE,checkedAt:CHECKED,effectiveFrom:EFFECTIVE_FROM,
  snapshotStatus:careDate>CHECKED?'FUTURE_NOT_VERIFIED':careDate<EFFECTIVE_FROM?'BEFORE_REFERENCE_EFFECTIVE':'DATED_PUBLISHED_REFERENCE',
  includesSiblingDiscount:false,includesContributionWaiver:false,usedInFamilyBudget:false};
}
module.exports={estimateCologneFee,TABLE,LIMITS,SOURCE,CHECKED,EFFECTIVE_FROM};
