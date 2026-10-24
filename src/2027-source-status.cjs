'use strict';

// Research-only classification of source events. Never a rule catalogue,
// benefit calculation, or approval channel. Intended to prevent draft figures
// from being mislabelled as law in future engineering work.
const HTTPS=/^https:\/\/[^\s<>"']+$/;
const ID=/^[a-z0-9-]{5,95}$/;
const STATUSES=new Map([
 ['beeg-2f-2027-crossreference','promulgated_future_effective'],
 ['beeg-175000-current-2026','current_law_not_2027_signoff'],
 ['elterngeld-2027-reform-discussion','policy_proposal_not_enacted']
]);
function validateSourceResearch2027(data,{currentRules,releaseGates}={}){
 if(!data||data.schemaVersion!==1||data.checkedAt!=='2026-10-24'||
    data.coverage!=='research_only_not_model_rules'||
    data.standardBirths2027LegallyVerified!==false||
    data.automaticBenefitAmountUpdatesAllowed!==false||
    data.fullLegalReviewApproved!==false||
    data.publicReleaseApproved!==false||
    !Array.isArray(data.evidence)||data.evidence.length!==3)
  throw new TypeError('2027-Quellendossier darf keine Fach- oder Produktfreigabe behaupten.');
 const found=new Set();
 for(const entry of data.evidence){
  if(!entry||!ID.test(entry.id)||found.has(entry.id)||
     STATUSES.get(entry.id)!==entry.category||
     !Array.isArray(entry.sources)||entry.sources.length<2||
     entry.sources.some(url=>typeof url!=='string'||!HTTPS.test(url))||
     !entry.title||typeof entry.note!=='string'||entry.note.length<40)
   throw new TypeError('Nicht belegter oder doppelt geführter 2027er Quellenstatus.');
  found.add(entry.id);
 }
 for(const id of STATUSES.keys())if(!found.has(id))throw new TypeError('Relevanter 2027er Quellenstatus fehlt: '+id);
 const enacted=data.evidence.find(x=>x.id==='beeg-2f-2027-crossreference');
 if(enacted.effectiveFrom!=='2027-01-01'||enacted.enactedAt!=='2025-12-22'||
    enacted.promulgatedAt!=='2025-12-23'||
    enacted.gazette!=='BGBl. 2025 I Nr. 355, Art. 18'||
    enacted.provision!=='BEEG § 2f Absatz 2 Satz 3'||
    enacted.change?.before!=='SGB III § 344 Absatz 4'||
    enacted.change?.after!=='SGB III § 344 Absatz 3'||
    enacted.change?.kind!=='renumbered_cross_reference'||
    enacted.amountChangeApproved!==false)
  throw new TypeError('Gesetzlicher 2027er BEEG-Verweis ist nicht valide begrenzt.');
 const current=data.evidence.find(x=>x.id==='beeg-175000-current-2026');
 if(current.effectiveFrom!=='2025-04-01'||current.observedLimitEuro!==175000||
    current.comparison!=='strictly_greater_than')
  throw new TypeError('Aktueller § 1 BEEG-Grenzwert wurde unzulässig geändert.');
 const discussed=data.evidence.find(x=>x.id==='elterngeld-2027-reform-discussion');
 if(discussed.legalEffectiveFrom!==null||
    discussed.parametersMayBeUsedInModel!==false||
    discussed.statusAsOf!==data.checkedAt||
    discussed.proposalReported?.basisMonthsTogether!==12||
    discussed.proposalReported?.reservedMonthsPerParent!==3||
    discussed.proposalReported?.minimumMonthlyEuro!==330||
    discussed.proposalReported?.maximumMonthlyEuro!==1900)
  throw new TypeError('Entwurfswerte dürfen nicht als Gesetz oder Modellparameter gelten.');
 if(!currentRules||currentRules.applicable_standard_birth_window?.through!=='2026-12-31'||
    currentRules.planning_forecast_window?.from!=='2027-01-01'||
    currentRules.planning_forecast_window?.status!=='unverified_forecast_only'||
    currentRules.regional_tariff?.future_2027_verified!==false||
    !releaseGates||releaseGates.publicReleaseApproved!==false||
    releaseGates.legalReview!=='pending')
  throw new TypeError('2027-Kohorte oder Release-Gates wurden möglicherweise unzulässig freigegeben.');
 return Object.freeze({
  dossierDate:data.checkedAt,
  promulgatedUpcomingChanges:1,
  draftedUnconfirmedReforms:1,
  externalLegalApprovals:0,
  modelChangesAllowed:false,
  standard2027CohortApproved:false,
  publicReleaseApproved:false
 });
}
module.exports={validateSourceResearch2027};
