'use strict';
const FILTERS=['coverage','overlap','rules','distribution','budget'];
function integer(v,label) {
 if(!Number.isSafeInteger(v)||v<0)throw new RangeError(label+': nur nichtnegative ganze Werte.');
 return v;
}
/**
 * Audit of what the enumerator ACTUALLY checked, not a claim of complete legal
 * or combinatorial space coverage. The filters are first-rejection categories.
 */
function summarizeSearchCoverage({generated,seen,valid,rejected={}}={}) {
 integer(generated,'Erzeugte Varianten');integer(seen,'Eindeutige Varianten');integer(valid,'Passende Varianten');
 if(!rejected||typeof rejected!=='object'||Array.isArray(rejected)||
  Object.keys(rejected).some(k=>!FILTERS.includes(k)))
  throw new TypeError('Unerwartete Filterzählung.');
 const rejectionCounts=Object.fromEntries(FILTERS.map(k=>[k,integer(rejected[k]??0,k)]));
 const excluded=Object.values(rejectionCounts).reduce((a,b)=>a+b,0);
 if(generated<seen||excluded+valid!==seen)throw new RangeError('Suchzähler sind nicht konsistent.');
 const duplicates=generated-seen;
 const percentage=(a,b)=>b===0?0:Math.round(a/b*10000)/100;
 return {model:'NUR_BESCHRÄNKTE_VORLAGENSUCHE',generated,seen,valid,excluded,duplicates,
   uniquePercent:percentage(seen,generated),eligiblePercent:percentage(valid,seen),
   rejected:rejectionCounts,
   completenessKnown:false,globalOptimumClaimAllowed:false,
   caution:'Gezählt werden ausschließlich erzeugte und geprüfte Vorlagen. Keine Aussage darüber, welcher Anteil aller denkbaren gesetzlich zulässigen Pläne abgedeckt ist.'};
}
module.exports={summarizeSearchCoverage,FILTERS};
