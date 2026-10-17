'use strict';

const {roundEuro,MAX_EURO}=require('./money.cjs');

/**
 * A counterfactual for explicitly supplied changes during a delayed Kita start.
 * Does NOT adjust employment/Elterngeld entitlements, actual transfers, or the
 * base plan. The counterfactual changes only cash-after-assumed-costs per LM.
 */
function cents(value,label) {
  if(typeof value!=='number'||!Number.isFinite(value)||value<0||value>Math.min(MAX_EURO,100000)||
     Math.abs(value*100-Math.round(value*100))>1e-6) {
    throw new RangeError(label+': Betrag zwischen 0 und 100.000 Euro mit maximal zwei Nachkommastellen erforderlich.');
  }
  return Math.round(value*100);
}
function month(value,label,min,max) {
  if(!Number.isInteger(value)||value<min||value>max)throw new RangeError(label+': ungültiger Lebensmonat.');
  return value;
}
function recordCents(value,label) {
  if(typeof value!=='number'||!Number.isFinite(value)||value<0||value>MAX_EURO)
    throw new RangeError(label+': ungültiger Monatswert.');
  return Math.round(roundEuro(value)*100);
}
function projectDelayedCareScenario({
  rows,startLm,delayMonths=0,monthlyIncomeReduction=0,monthlyExtraCare=0,
  waiveOriginalFees=false,expensesKnown=false
}={}) {
  if(!Array.isArray(rows)||!rows.length||rows.length>96)throw new TypeError('Lebensmonate der Basisprojektion fehlen oder sind zu lang.');
  const start=month(startLm,'Kita-Start',1,96),delay=month(delayMonths,'Verschiebung',0,6);
  if(typeof waiveOriginalFees!=='boolean'||typeof expensesKnown!=='boolean')throw new TypeError('Szenario-Schalter müssen eindeutig sein.');
  const lost=cents(monthlyIncomeReduction,'Entfallendes Erwerbsnetto');
  const extra=cents(monthlyExtraCare,'Zusätzliche Überbrückungsbetreuung');
  const end=start+delay-1,affected=[];
  let totalDelta=0,totalBase=0,totalChanged=0,totalFeesWaived=0;
  for(let i=0;i<rows.length;i++) {
    const r=rows[i];
    if(!r||r.lm!==i+1)throw new RangeError('Lebensmonate der Modellrechnung müssen lückenlos ab 1 geordnet sein.');
    if(r.lm<start||r.lm>end)continue;
    const fees=waiveOriginalFees?recordCents(r.childcare,'Bisherige Kita-Gebühren'):0;
    const base=expensesKnown?Math.round(roundEuro(r.cashAfter)*100):null;
    if(expensesKnown&&(!Number.isFinite(r.cashAfter)))throw new RangeError('Ungültiges Modellbudget.');
    const delta=-lost-extra+fees;
    totalDelta+=delta;totalFeesWaived+=fees;
    if(base!==null){totalBase+=base;totalChanged+=base+delta;}
    affected.push({lm:r.lm,incomeReduced:lost/100,extraCare:extra/100,feesWaived:fees/100,
      deltaAvailable:delta/100,baselineAvailable:base===null?null:base/100,
      alternativeAvailable:base===null?null:(base+delta)/100});
  }
  return {model:'EXPLICIT_HYPOTHETICAL_CHANGE',bankReceiptsPredicted:false,
    startLm:start,delayedStartLm:start+delay,delayMonths:delay,months:affected,
    affectedMonths:affected.map(x=>x.lm),
    outsideHorizonMonths:Math.max(0,delay-affected.length),
    baselineBudgetKnown:expensesKnown,
    totalChange:totalDelta/100,totalWaivedFees:totalFeesWaived/100,
    comparedBaselineTotal:expensesKnown?totalBase/100:null,
    comparedAlternativeTotal:expensesKnown?totalChanged/100:null,
    warnings:[
      'Das Szenario verrechnet ausschließlich manuell angenommene Änderungen und verändert keine Elternzeit-/Elterngeld-Regelrechnung.',
      'Ausgefallene Kita-Beiträge werden nur bei ausdrücklicher Auswahl verrechnet. Gebühren trotz verschobenem Start können weiterhin anfallen.',
      'Anpassungen der Arbeitszeiten können Elterngeld-Ansprüche verändern; solche Folgewirkungen sind nicht berechnet.',
      'Ein Lebensmonatsbudget ist keine Bankbuchung oder sichere Zahlungszusage.',
      ...(expensesKnown?[]:['Haushaltsausgaben fehlen: nur Kostendifferenz, kein belastbares verbleibendes Familienbudget.']),
      ...(Math.max(0,delay-affected.length)?['Ein Teil der Verzögerung liegt außerhalb der vorhandenen Modellmonate.']:[])
    ]
  };
}

module.exports={projectDelayedCareScenario};
