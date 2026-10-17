'use strict';
const HOSTS=new Set(['www.gesetze-im-internet.de','www.stadt-koeln.de','familienportal.de','www.komnet.nrw.de','www.arbeitsagentur.de','www.bmwsb.bund.de','www.deutsche-rentenversicherung.de','www.bundesfinanzministerium.de']);
const STATUSES=new Set(['effective','proposed_not_in_force','unresolved_conflict','unverified']);
const SCOPES=new Set(['informational','historical_reference_only','independent_case_required']);
function dateOK(s){return typeof s==='string'&&/^\d{4}-\d\d-\d\d$/.test(s)&&!Number.isNaN(Date.parse(s))&&new Date(s+'T00:00:00Z').toISOString().slice(0,10)===s;}
function officialURL(u){
 try{const url=new URL(u);return url.protocol==='https:'&&!url.username&&!url.password&&!url.port&&HOSTS.has(url.hostname);}
 catch{return false;}
}
function auditOfficialSources(catalog,{asOf=catalog?.asOf}={}) {
 if(!catalog||!Array.isArray(catalog.items)||!dateOK(asOf))throw new TypeError('Datierter Quellenkatalog erforderlich.');
 const ids=new Set(),findings=[],items=[];
 for(const src of catalog.items){
  if(!src||typeof src!=='object'||Array.isArray(src)||typeof src.id!=='string'||!src.id||ids.has(src.id))
   throw new TypeError('Doppelte oder ungültige Quellenkennung.');
  ids.add(src.id);
  if(!STATUSES.has(src.status)||!SCOPES.has(src.scope)||!dateOK(src.checkedAt)||!dateOK(src.nextReview)||
    src.checkedAt>asOf||src.nextReview<src.checkedAt||!officialURL(src.source)||(typeof src.title!=='string'||!src.title.trim())||
    (src.effectiveFrom!==null&&!dateOK(src.effectiveFrom))||
    (src.alternativeSource&&!officialURL(src.alternativeSource)))
   throw new TypeError('Quellenstatus, Datum oder URL ist ungültig: '+src.id);
  if(src.independentApproval!==false)throw new TypeError('Externe Genehmigung darf ohne Reviewer-/Abnahmevorgang nicht aus diesem Datensatz stammen: '+src.id);
  const due=src.nextReview<=asOf;
  const effective=src.status==='effective'&&(!src.effectiveFrom||src.effectiveFrom<=asOf);
  const calculationApproved=false; // independent reviews are tracked by separate release gates
  if(due)findings.push({id:src.id,type:'REVIEW_DUE',message:'Nachprüfung erforderlich.'});
  if(src.status==='unresolved_conflict')findings.push({id:src.id,type:'CONFLICT',message:'Ungeklärter Widerspruch: keine Fachfreigabe.'});
  if(src.status==='proposed_not_in_force')findings.push({id:src.id,type:'PROPOSAL',message:'Gesetzentwurf ist kein geltender Berechnungsparameter.'});
  items.push({id:src.id,status:src.status,scope:src.scope,effectiveOnReview:effective,dueForReview:due,calculationApproved,checkedAt:src.checkedAt,source:src.source});
 }
 return {asOf,count:items.length,items,findings,independentlyApprovedForCalculation:0,publicLegalReleaseAllowed:false};
}
module.exports={auditOfficialSources,officialURL};
