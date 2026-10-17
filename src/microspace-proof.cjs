'use strict';

const {validatePlan}=require('./rule-validator.cjs');
const {rankCandidates,scheduleFingerprint}=require('./goal-ranking.cjs');

/**
 * Exhaustively enumerates ONLY the explicitly documented miniature space:
 * two parents, LM3 and LM4, four codes W/B/P/U each.
 * It proves complete enumeration of this 256-element engineering fixture,
 * not completeness of 36-month family-planning schedules or legal coverage.
 */
const OPTIONS=Object.freeze(['W','B','P','U']);
const PERIODS=Object.freeze([3,4]);
function simpleSyntheticRows(schedule) {
 const cash={W:2600,B:1100,P:550,U:0,MS:0};
 return schedule.map((row,i)=>({...row,cashAfter:cash[row.f]+cash[row.m]+(i<2?2500:0)}));
}
function microspaceProof(catalogue,baseState) {
 if(!catalogue||!baseState||baseState.date!=='2026-05-28'||baseState.standardCaseConfirmed!==true)
  throw new TypeError('Geprüfter synthetischer Standardfall 28.05.2026 erforderlich.');
 const accepted=[],excluded={},seen=new Set();
 const totalCombinations=OPTIONS.length**(PERIODS.length*2);
 for(let index=0;index<totalCombinations;index++){
  let combination=index;
  const schedule=Array.from({length:36},(_,i)=>({f:'W',m:i<2?'MS':'W'}));
  for(const lm of PERIODS)for(const who of ['f','m']){
   const next=combination%OPTIONS.length;combination=Math.floor(combination/OPTIONS.length);
   schedule[lm-1][who]=OPTIONS[next];
  }
  const fingerprint=scheduleFingerprint(schedule);
  if(seen.has(fingerprint))throw new Error('Verschiedene Entscheidungen haben denselben Fingerprint.');
  seen.add(fingerprint);
  const result=validatePlan({state:baseState,schedule},catalogue);
  if(result.status==='PLAUSIBEL_STANDARD'){
   accepted.push({id:index,schedule,calc:{valid:true,rows:simpleSyntheticRows(schedule)}});
  } else excluded[result.status]=(excluded[result.status]||0)+1;
 }
 const selected=rankCandidates(accepted,{horizon:4,objective:'finance',limit:1});
 const oracle=accepted.map(c=>({id:c.id,total:c.calc.rows.slice(0,4).reduce((v,r)=>v+r.cashAfter,0),
    floor:Math.min(...c.calc.rows.slice(0,4).map(r=>r.cashAfter))}))
   .sort((a,b)=>b.total-a.total||b.floor-a.floor||a.id-b.id);
 const top=selected[0];
 if(top&&(top.calc.rows.slice(0,4).reduce((v,r)=>v+r.cashAfter,0)!==oracle[0].total))
  throw new Error('Rangfolge widerspricht dem unabhängig berechneten Maximum dieses Mikrosuchraums.');
 return {scope:'SYNTHETIC_LM3_LM4_ONLY',codes:OPTIONS,lifeMonths:PERIODS,
  enumerated:totalCombinations,unique:seen.size,accepted:accepted.length,excluded,
  selectedId:top?.id??null,oracleMaxTotal:oracle[0]?.total??null,
  globalCompleteness:false,unrepresentedMonths:32,realElterngeldAmountChecked:false};
}
module.exports={microspaceProof,OPTIONS,PERIODS};
