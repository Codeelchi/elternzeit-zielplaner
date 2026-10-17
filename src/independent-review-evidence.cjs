'use strict';

// Structural QA for an external-review inbox, NOT authentication of reviewers,
// professional authority, mathematical correctness, or eligibility approval.
// This module never calls the application calculation engine to manufacture
// expected values.
const RECEIPT_STATES=Object.freeze(['not_received','submitted_unverified']);
const ISO=/^\d{4}-\d{2}-\d{2}$/;
const SHA=/^[a-f0-9]{64}$/;
const HTTPS=/^https:\/\/[^\s<>"']+$/;
const NULL_FIELDS=['reviewerRole','reviewedAt','sourceUrl','legalEdition',
 'independentDerivation','inputContract','expectedLifeMonths'];
function isMoney(n){return typeof n==='number'&&Number.isFinite(n)&&n>=0&&n<=1e9&&
 Math.abs(n*100-Math.round(n*100))<1e-7;}
function validateReviewEvidence({manifest,requests,requestsSha256}={}){
 if(!requests||!Array.isArray(requests.cases)||requests.cases.length<10||
    typeof requestsSha256!=='string'||!SHA.test(requestsSha256))
  throw new TypeError('Datierte Referenzanfragen samt SHA256 erforderlich.');
 if(!manifest||manifest.schemaVersion!==1||manifest.format!=='external-family-review-v317'||
    !ISO.test(manifest.asOf)||manifest.sourceRequestsSha256!==requestsSha256||
    manifest.publicReleaseApproved!==false||manifest.independentReviewApproved!==false||
    !Array.isArray(manifest.cases)||manifest.cases.length!==requests.cases.length)
  throw new TypeError('Prüfmanifest fehlt, wurde verändert oder behauptet eine unzulässige Freigabe.');
 const originals=new Map();
 for(const request of requests.cases){
  if(!request.id||originals.has(request.id)||!request.scope||
     request.independentlyVerified!==false||request.expectedFamilyMonthlyBenefits!==null)
   throw new TypeError('Referenzanfrage ist unvollständig oder behauptet bereits eine eigene externe Prüfung.');
  originals.set(request.id,request);
 }
 const seen=new Set();let received=0,missing=0;
 for(const entry of manifest.cases){
  if(!entry||typeof entry!=='object'||seen.has(entry.id))throw new TypeError('Doppelter oder fehlender Prüffall.');
  seen.add(entry.id);
  const request=originals.get(entry.id);
  if(!request||entry.scope!==request.scope||!RECEIPT_STATES.includes(entry.receiptStatus)||
     entry.approved!==false||entry.releaseReady!==false||entry.reviewDecision!=='pending'||
     !entry.independentReference||typeof entry.independentReference!=='object'||Array.isArray(entry.independentReference)||
     !entry.comparison||entry.comparison.status!=='not_run'||entry.comparison.programCommit!==null||
     entry.comparison.programResults!==null)
    throw new TypeError('Prüffall ohne gültige Scope-/Freigabegrenze: '+String(entry?.id));
  const ref=entry.independentReference;
  if(entry.receiptStatus==='not_received'){
   for(const key of NULL_FIELDS)if(ref[key]!==null)
    throw new TypeError('Nicht gelieferte Referenz enthält dennoch angebliche Belege: '+entry.id+'/'+key);
   missing++;
  }else{
   if(typeof ref.reviewerRole!=='string'||ref.reviewerRole.trim().length<5||
      !ISO.test(ref.reviewedAt)||typeof ref.legalEdition!=='string'||ref.legalEdition.length<8||
      !HTTPS.test(ref.sourceUrl)||typeof ref.independentDerivation!=='string'||ref.independentDerivation.trim().length<40||
      !ref.inputContract||typeof ref.inputContract!=='object'||Array.isArray(ref.inputContract)||
      !Array.isArray(ref.expectedLifeMonths)||ref.expectedLifeMonths.length<2)
    throw new TypeError('Eingereichte, aber unbestätigte Referenz unvollständig: '+entry.id);
   // Exact per-parent, per-life-month expected values with explicit source
   // tracing; never infer missing months or accept a total as a full case.
   const months=new Set();
   for(const lm of ref.expectedLifeMonths){
    if(!lm||!Number.isInteger(lm.lifeMonth)||lm.lifeMonth<1||lm.lifeMonth>36||
       months.has(lm.lifeMonth)||!isMoney(lm.parent1BenefitEuro)||
       !isMoney(lm.parent2BenefitEuro)||typeof lm.derivationReference!=='string'||
       lm.derivationReference.trim().length<4)
     throw new TypeError('Unvollständiger oder doppelter unabhängiger Lebensmonat: '+entry.id);
    months.add(lm.lifeMonth);
   }
   if([...months].sort((a,b)=>a-b).some((number,index)=>number!==index+1))
    throw new TypeError('Referenzmonate müssen lückenlos bei LM 1 beginnen: '+entry.id);
   // Even a complete-looking submitted reference is NOT authenticated and
   // cannot flip any release gate or count as independently approved.
   received++;
  }
 }
 if(seen.size!==originals.size)throw new TypeError('Nicht alle Referenzfälle haben ein Prüffeld.');
 return Object.freeze({
  total:originals.size,missing,submittedUnverified:received,
  independentlyApproved:0,publicReleaseApproved:false,
  outcome:'STRUCTURE_ONLY_NO_EXTERNAL_PROOF',
  notice:'Automatische Prüfung kontrolliert nur Vollständigkeit und Quellenkennzeichnung, keine echte unabhängige Fachfreigabe.'
 });
}
module.exports={validateReviewEvidence};
