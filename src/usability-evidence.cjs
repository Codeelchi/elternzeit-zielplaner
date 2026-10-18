'use strict';

// Structural receipt check only. No field can certify a genuine human review,
// validate a participant's identity, or unlock product/public release.
const SHA256=/^[a-f0-9]{64}$/;
const DATE=/^\d{4}-\d{2}-\d{2}$/;
const RESULT_CODES=['understood_without_prompt','understood_after_prompt','misunderstood','not_completed'];
const FINDING_CODES=['none','scope','income','time_axis','bank_record','expenses','maternity','search','privacy','accessibility','other'];
function validateUsabilityEvidence({manifest,taskIds,sourceSha256}={}){
 if(!Array.isArray(taskIds)||taskIds.length!==8||new Set(taskIds).size!==taskIds.length||
  taskIds.some(id=>typeof id!=='string'||!/^[a-z0-9-]+$/.test(id))||!SHA256.test(sourceSha256))
  throw new TypeError('Acht eindeutige synthetische Aufgaben und ein SHA256-Fingerprint sind nötig.');
 if(!manifest||manifest.format!=='v317d-synthetic-comprehension-study'||manifest.schemaVersion!==1||
  !DATE.test(manifest.preparedAt)||manifest.tasksSourceSha256!==sourceSha256||
  manifest.publicReleaseApproved!==false||manifest.userReviewApproved!==false||
  !Array.isArray(manifest.sessions)||manifest.sessions.length!==0||
  !Array.isArray(manifest.tasks)||manifest.tasks.length!==8)
  throw new TypeError('Fehlende oder unzulässige Nutzerreview-Vorlage/Freigabe.');
 // Session evidence is deliberately kept OUTSIDE this tracked repository
 // until an independently reviewed data protection/process is established.
 const unique=new Set();
 for(const item of manifest.tasks){
  if(!item||!taskIds.includes(item.id)||unique.has(item.id)||item.status!=='not_conducted'||
   item.answerObserved!==null||item.comprehensionOutcome!==null||
   item.findingCodes!==null||item.facilitatorNotes!==null||
   item.approved!==false||item.participantCount!==0)
   throw new TypeError('Aufgabe behauptet ohne echten Nachweis eine Nutzerbeobachtung: '+String(item?.id));
  unique.add(item.id);
 }
 for(const id of taskIds)if(!unique.has(id))throw new TypeError('Aufgabe fehlt: '+id);
 return {tasksPrepared:8,tasksObserved:0,participantsObserved:0,independentUserReviewApproved:false,
  actualScreenreaderReview:false,publicReleaseApproved:false,
  outcome:'TEMPLATE_ONLY_NOT_A_USER_STUDY',
  possibleObservationCodes:[...RESULT_CODES],
  allowedFindingCodes:[...FINDING_CODES]};
}
module.exports={validateUsabilityEvidence,RESULT_CODES,FINDING_CODES};
