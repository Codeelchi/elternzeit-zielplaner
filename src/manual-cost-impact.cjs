'use strict';

const {projectFamilyBudget}=require('./family-budget.cjs');
function cents(value,label){
 if(typeof value!=='number'||!Number.isFinite(value)||value<0||value>50000||Math.abs(value*100-Math.round(value*100))>1e-7)
  throw new RangeError(label+': 0 bis 50.000 Euro und maximal zwei Nachkommastellen.');
 return Math.round(value*100);
}
/**
 * Scenario only: explicit extra insurance expenses and voluntarily allocated tax
 * reserve, neither a tax calculation nor a legal insurance premium.
 * Re-evaluates exactly the same family-budget stress model with identical assumptions.
 */
function compareManualCostBuffer({rows,expenses,minimum=0,assumptions={},insurancePerMonth=0,taxReservePerMonth=0,insuranceAlreadyIncluded=false}={}){
 if(!Array.isArray(rows)||!rows.length)throw new TypeError('Lebensmonatsdaten fehlen.');
 if(expenses===''||expenses===null||expenses===undefined)
  return {knownExpenses:false,results:[],disclaimer:'Haushaltsausgaben unbekannt – kein Finanzüberschuss oder Rücklagenbedarf berechenbar.'};
 const expenseCents=cents(expenses,'Haushaltsausgaben');
 const insuranceCents=cents(insurancePerMonth,'Zusätzlicher Versicherungsbeitrag');
 const taxCents=cents(taxReservePerMonth,'Frei gewählter Steuerpuffer');
 if(typeof insuranceAlreadyIncluded!=='boolean')throw new TypeError('Angabe zu bereits enthaltenen Versicherungsbeiträgen muss eindeutig sein.');
 if(insuranceAlreadyIncluded&&insuranceCents>0)throw new RangeError('Versicherungsbeitrag ist bereits in den Haushaltskosten enthalten: nicht doppelt ansetzen.');
 const extraCents=insuranceCents+taxCents;
 if(expenseCents+extraCents>1e9)throw new RangeError('Zusammengefasste Monatskosten zu hoch.');
 const basis=projectFamilyBudget({rows,expenses:expenseCents/100,minimum,assumptions});
 const adjusted=projectFamilyBudget({rows,expenses:(expenseCents+extraCents)/100,minimum,assumptions});
 const results=basis.scenarios.map((scenario,i)=>({
  id:scenario.id,label:scenario.label,
  normalReserve:scenario.requiredReserves,
  bufferReserve:adjusted.scenarios[i].requiredReserves,
  additionalReserve:Math.round((adjusted.scenarios[i].requiredReserves-scenario.requiredReserves)*100)/100,
  normalLowest:scenario.lowestAvailable,
  adjustedLowest:adjusted.scenarios[i].lowestAvailable,
  originalTotal:scenario.totalAvailable,
  adjustedTotal:adjusted.scenarios[i].totalAvailable
 }));
 return {knownExpenses:true,months:rows.length,insurancePerMonth:insuranceCents/100,taxReservePerMonth:taxCents/100,
  additionalAllocatedPerMonth:extraCents/100,results,
  legalTaxCalculated:false,insurancePremiumInferred:false,entitlementChanged:false,
  disclaimer:'Reiner Vergleich ausdrücklich angenommener zusätzlicher Beiträge und freiwilliger Steuerrückstellung. Keine amtliche Steuer-/Versicherungsberechnung. Beide Modellrechnungen verwenden identische Stressannahmen; keine Konto-Zahlungsprognose.'};
}
module.exports={compareManualCostBuffer};
