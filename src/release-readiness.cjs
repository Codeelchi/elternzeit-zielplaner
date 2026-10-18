'use strict';

// Pure, fail-closed policy over independently constructed evidence receipts.
// This is NOT an identity/credential verification or a legal release.
// The present V3.17 manifests are templates and must NEVER unlock publication.
const REQUIRED_GATE_FIELDS=[
 'independentCalculationReview','legalReview','privacyReview',
 'directFileBrowserReview','userTesting'
];
const HEX=/^[a-f0-9]{64}$/;
function assessReleaseReadiness({
 gates,references,packageVersion,files,independentReview,usabilityReview,
 maternityReview,operatorEvidence
}={}){
 const failures=[];
 function block(message){failures.push(message);}
 if(!gates||typeof gates!=='object'||!references||typeof references!=='object')
  return Object.freeze({allowed:false,failures:Object.freeze(['Release-Metadaten fehlen.'])});
 for(const field of REQUIRED_GATE_FIELDS)
  if(gates[field]!=='approved')block(field+': '+String(gates[field]??'missing'));
 if(gates.publicReleaseApproved!==true)block('publicReleaseApproved: false');
 if(references.publicReleaseGatePassed!==true)block('Amtlicher Referenzabgleich: nicht bestanden');
 if(typeof packageVersion!=='string'||gates.version!==packageVersion||
    references.version!==packageVersion)block('Versionsstände abweichend');
 // Old recorded file:// evidence cannot carry over to modified HTML.
 if(!files||!HEX.test(files.indexSha256)||!HEX.test(files.startSha256)||
    typeof gates.directFileEvidence!=='string'||
    !gates.directFileEvidence.includes(files.indexSha256)||
    !gates.directFileEvidence.includes(files.startSha256))
  block('Direkte Browser-Freigabe: HTML-SHA256-Nachweis ist veraltet oder fehlt');
 // Treat 10 synthetic prepared cases as INDEPENDENT only after the underlying
 // evidence validator actually supports and confirms true third-party reviews.
 if(!independentReview||independentReview.independentlyApproved!==10||
    independentReview.publicReleaseApproved!==true||
    independentReview.outcome==='STRUCTURE_ONLY_NO_EXTERNAL_PROOF')
  block('10/10 vollständige unabhängige Familienberechnungen nicht nachgewiesen');
 if(!usabilityReview||usabilityReview.independentUserReviewApproved!==true||
    usabilityReview.actualScreenreaderReview!==true||
    !Number.isInteger(usabilityReview.tasksObserved)||usabilityReview.tasksObserved<8||
    !Number.isInteger(usabilityReview.participantsObserved)||usabilityReview.participantsObserved<1||
    usabilityReview.publicReleaseApproved!==true)
  block('Echte moderierte Nutzer- und manuelle Screenreader-Prüfung nicht nachgewiesen');
 if(!maternityReview||maternityReview.entitlementDecisionAllowed!==true||
    maternityReview.reviewState==='UNRESOLVED_OFFICIAL_DISCREPANCY'||
    typeof maternityReview.externalAuthorityReply!=='object'||
    maternityReview.externalAuthorityReply===null)
  block('Mutterschutz/Mutterschaftsgeld: externer 4/5-Tage-Fachentscheid fehlt');
 // No operator evidence is present at present. A future verified release
 // attestation process MUST be implemented by the responsible operator before
 // release, not inferred from a JSON flag in the repository.
 if(!operatorEvidence||operatorEvidence.externallyVerified!==true||
    operatorEvidence.publicRolloutAuthorized!==true||
    operatorEvidence.verifiedProcess!=='independent_operator_approval')
  block('Nachweisbarer Betreiberentscheid und externe Rechts-/Datenschutzfreigaben fehlen');
 return Object.freeze({allowed:failures.length===0,failures:Object.freeze(failures)});
}
module.exports={assessReleaseReadiness,REQUIRED_GATE_FIELDS};
