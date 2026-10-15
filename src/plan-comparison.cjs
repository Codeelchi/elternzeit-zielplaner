'use strict';

const {projectFamilyBudget}=require('./family-budget.cjs');
const FREE=new Set(['B','P','U','MS']);
const CODES=new Set(['W','MS','B','R','P','T','Q','K','U']);
const MONEY_FIELDS=['fi','mi','fg','mg','kind','childcare','maternityBenefits','grant'];

function record(value,label){
  if(!value||typeof value!=='object'||Array.isArray(value))throw new TypeError(`${label}: Objekt erforderlich.`);
  return value;
}
function nonnegative(value,label){
  if(value===undefined||value===null||value==='')return;
  if(!['number','string'].includes(typeof value)||!Number.isFinite(Number(value))||Number(value)<0)throw new RangeError(`${label}: endliche, nichtnegative Zahl erforderlich.`);
}
function financialRow(row){
  record(row,'Monatsdaten');
  // Preserve the budget module's missing/empty-as-zero convention, but do not
  // silently coerce booleans, arrays or objects into financial amounts.
  for(const key of MONEY_FIELDS){
    const value=row[key];
    nonnegative(value,key);
  }
  return row;
}
function freeMonths(rows,schedule,horizon){
  const result={father:0,mother:0};
  for(let i=0;i<horizon;i++){
    for(const [parent,codeKey,hoursKey]of [['father','f','hf'],['mother','m','hm']]){
      const code=rows[i][codeKey]??schedule?.[i]?.[codeKey];
      if(!CODES.has(code))throw new TypeError(`Lebensmonat ${i+1}: Elterncode fehlt oder ist ungültig.`);
      const hours=rows[i][hoursKey]??schedule?.[i]?.[hoursKey];
      if(hours!==undefined&&hours!==null&&hours!==''&&(!['number','string'].includes(typeof hours)||!Number.isFinite(Number(hours))||Number(hours)<0||Number(hours)>168))throw new RangeError(`Lebensmonat ${i+1}: Wochenstunden ungültig.`);
      // Full free months only; part-time months are never converted to hours
      // of care. Positive actual hours take precedence over a benefit code.
      if(FREE.has(code)&&(hours===undefined||hours===null||hours===''||Number(hours)===0))result[parent]++;
    }
  }
  return result;
}
function summary(scenario){
  return {totalAvailable:scenario.totalAvailable,lowestAvailable:scenario.lowestAvailable,bottleneckMonths:[...scenario.bottleneckMonths],requiredReserves:scenario.requiredReserves};
}
function delta(current,reference){
  return {totalAvailable:current.totalAvailable-reference.totalAvailable,lowestAvailable:current.lowestAvailable-reference.lowestAvailable,requiredReserves:current.requiredReserves-reference.requiredReserves,bottleneckCount:current.bottleneckMonths.length-reference.bottleneckMonths.length};
}

/** Compare effective candidate rows using exactly one shared budget model.
 * Accepts {schedule?,calc:{rows},adverse?}. adverse is deliberately not used:
 * all conservative values must come from the same shared scenario assumptions.
 * Rule validity/eligibility is the caller's gate, never certified here.
 */
function comparePlans(candidates,options={}){
  if(!Array.isArray(candidates)||!candidates.length)throw new TypeError('Mindestens ein Plan zum Vergleich erforderlich.');
  record(options,'Vergleichsoptionen');
  const {horizon,expenses=0,minimum=0,assumptions={},confirmedGrants=[]}=options;
  if(!Number.isInteger(horizon)||horizon<1||horizon>96)throw new RangeError('Gemeinsamer Vergleichszeitraum von 1 bis 96 Lebensmonaten erforderlich.');
  record(assumptions,'Szenarioannahmen');
  nonnegative(expenses,'Haushaltsausgaben');nonnegative(minimum,'Mindestbetrag');
  for(const key of ['wagePercent','fatherWagePercent','motherWagePercent','elterngeldPercent','costPercent'])nonnegative(assumptions[key],key);
  if(!Array.isArray(confirmedGrants))throw new TypeError('Bestätigte Zusatzleistungen müssen eine Liste sein.');
  const warnings=new Set();
  let appliedAssumptions;
  const plans=candidates.map((candidate,index)=>{
    record(candidate,'Plan');record(candidate.calc,'Berechnung');
    const rows=candidate.calc.rows;
    if(!Array.isArray(rows)||rows.length<horizon)throw new RangeError(`Plan ${index+1}: Vergleichszeitraum nicht vollständig vorhanden.`);
    if(candidate.schedule!==undefined&&(!Array.isArray(candidate.schedule)||candidate.schedule.length<horizon))throw new RangeError(`Plan ${index+1}: Monatsplan ist unvollständig.`);
    const selected=Array.from({length:horizon},(_,i)=>financialRow(rows[i]));
    const budget=projectFamilyBudget({rows:selected,expenses,minimum,assumptions,confirmedGrants});
    appliedAssumptions=budget.assumptions;
    for(const warning of budget.warnings)warnings.add(warning);
    return {index,id:candidate.id??null,freeMonths:freeMonths(selected,candidate.schedule,horizon),realistic:summary(budget.scenarios.find(s=>s.id==='realistic')),conservative:summary(budget.scenarios.find(s=>s.id==='conservative')),rejectedGrants:budget.rejectedGrants};
  });
  const first=plans[0];
  for(const plan of plans)plan.delta={freeMonths:{father:plan.freeMonths.father-first.freeMonths.father,mother:plan.freeMonths.mother-first.freeMonths.mother},realistic:delta(plan.realistic,first.realistic),conservative:delta(plan.conservative,first.conservative)};
  return {horizon,basis:'MODELLIERTER_LEISTUNGSANSPRUCH',bankReceiptsPredicted:false,assumptions:appliedAssumptions,comparisonNote:plans.length===1?'Bisher liegt nur ein Vorschlag vor. Ändere Betreuungsziel, Teilzeitbeginn oder Mindestbudget, um weitere zulässige Varianten zu vergleichen.':null,warnings:[...warnings,'Volle Monate ohne Erwerbsarbeit einschließlich Mutterschutz messen keine tatsächlichen Betreuungsstunden.','Differenzen beziehen sich auf den ersten Vorschlag; positive Rücklagen- und Engpassdifferenzen bedeuten höheren Finanzbedarf.'],plans};
}
module.exports={comparePlans};
