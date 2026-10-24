import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const {validateSourceResearch2027}=require('../src/2027-source-status.cjs');
const raw=path=>JSON.parse(readFileSync(new URL('../'+path,import.meta.url),'utf8'));
const dossier=raw('data/rechtsstand-2027-quellenstatus-20261024.json');
const catalogue=raw('data/rechtsregeln-de-nrw-2026-10-14.json');
const gates=raw('data/release-gates.json');
const make=(data=dossier,rules=catalogue,releaseGates=gates)=>
 validateSourceResearch2027(data,{currentRules:rules,releaseGates});
test('official future § 2f reference and unapproved 2027 cohort are separate source classes',()=>{
 const result=make();
 assert.deepEqual(result,{
  dossierDate:'2026-10-24',promulgatedUpcomingChanges:1,
  draftedUnconfirmedReforms:1,externalLegalApprovals:0,modelChangesAllowed:false,
  standard2027CohortApproved:false,publicReleaseApproved:false
 });
 const future=dossier.evidence.find(x=>x.id==='beeg-2f-2027-crossreference');
 assert.equal(future.effectiveFrom,'2027-01-01');
 assert.equal(future.change.before,'SGB III § 344 Absatz 4');
 assert.equal(future.change.after,'SGB III § 344 Absatz 3');
 assert.equal(future.amountChangeApproved,false);
 assert.ok(future.sources.some(x=>x.includes('rvrecht.deutsche-rentenversicherung.de')));
 assert.equal(catalogue.applicable_standard_birth_window.through,'2026-12-31');
 assert.equal(catalogue.planning_forecast_window.status,'unverified_forecast_only');
});
test('a changed published future provision, date or effective status must invalidate the dossier',()=>{
 for(const edit of [
  x=>{x.effectiveFrom='2026-10-24';},
  x=>{x.change.after='SGB III § 344 Absatz 4';},
  x=>{x.change.before='SGB III § 344 Absatz 3';},
  x=>{x.amountChangeApproved=true;},
  x=>{x.enactedAt='2026-10-24';}
 ]){
  const d=structuredClone(dossier);edit(d.evidence[0]);
  assert.throws(()=>make(d),/Gesetzlicher 2027er BEEG-Verweis/);
 }
});
test('a proposed reform never becomes model parameters simply by altering JSON',()=>{
 for(const edit of [
  x=>{x.legalEffectiveFrom='2027-11-01';},
  x=>{x.parametersMayBeUsedInModel=true;},
  x=>{x.proposalReported.maximumMonthlyEuro=1950;},
  x=>{x.proposalReported.basisMonthsTogether=14;},
  x=>{x.statusAsOf='2027-01-01';}
 ]){
  const d=structuredClone(dossier);edit(d.evidence[2]);
  assert.throws(()=>make(d),/Entwurfswerte/);
 }
 const d=structuredClone(dossier);
 d.evidence[2].category='promulgated_future_effective';
 assert.throws(()=>make(d),/Quellenstatus/);
});
test('current 175000 Euro zvE threshold remains strictly >; not a free 2027 signoff',()=>{
 const current=dossier.evidence.find(x=>x.id==='beeg-175000-current-2026');
 assert.equal(current.observedLimitEuro,175000);
 assert.equal(current.comparison,'strictly_greater_than');
 for(const edit of [x=>{x.observedLimitEuro=200000;},x=>{x.comparison='greater_than_or_equal';}]){
  const d=structuredClone(dossier);edit(d.evidence[1]);
  assert.throws(()=>make(d),/Aktueller § 1 BEEG/);
 }
});
test('duplicate source IDs, missing HTTPS evidence or extra undeclared item fail closed',()=>{
 const bad=structuredClone(dossier);
 bad.evidence[0].sources[0]='http://not-official.example';
 assert.throws(()=>make(bad),/Quellenstatus/);
 const duplicate=structuredClone(dossier);
 duplicate.evidence[1].id=duplicate.evidence[0].id;
 assert.throws(()=>make(duplicate),/Quellenstatus/);
 const extra=structuredClone(dossier);
 extra.evidence.push(structuredClone(dossier.evidence[0]));
 assert.throws(()=>make(extra),/Fach-/);
});
test('2027 continues to fail safe when any old registry or operator gate is relaxed',()=>{
 const d=structuredClone(dossier);d.publicReleaseApproved=true;
 assert.throws(()=>make(d),/Fach-/);
 const relaxed=structuredClone(catalogue);
 relaxed.applicable_standard_birth_window.through='2027-12-31';
 assert.throws(()=>make(dossier,relaxed),/2027-Kohorte/);
 const futureVerified=structuredClone(catalogue);
 futureVerified.planning_forecast_window.status='verified_as_of_2027';
 assert.throws(()=>make(dossier,futureVerified),/2027-Kohorte/);
 const release=structuredClone(gates);release.legalReview='approved';
 assert.throws(()=>make(dossier,catalogue,release),/2027-Kohorte/);
});
test('static source research cannot silently replace runtime benefit parameters or model rules',()=>{
 assert.equal(catalogue.standard_parameters.basis_min_eur,300);
 assert.equal(catalogue.standard_parameters.basis_max_eur,1800);
 assert.equal(catalogue.standard_parameters.joint_max_basis_equivalents,14);
 assert.equal(catalogue.regional_tariff.future_2027_verified,false);
 assert.equal(gates.publicReleaseApproved,false);
 assert.equal(gates.independentCalculationReview,'pending');
 assert.equal(gates.userTesting,'pending');
 assert.equal(gates.legalReview,'pending');
});
