import test from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
const require=createRequire(import.meta.url);
const {validateReviewEvidence}=require('../src/independent-review-evidence.cjs');
const source=readFileSync(new URL('../data/independent-case-requests-2026-10-17.json',import.meta.url));
const requests=JSON.parse(source);
const sha=createHash('sha256').update(source).digest('hex');
const manifest=JSON.parse(readFileSync(new URL('../data/independent-review-evidence-v317.json',import.meta.url),'utf8'));
const evalManifest=(copy=structuredClone(manifest),sourceRequests=requests,hash=sha)=>
 validateReviewEvidence({manifest:copy,requests:sourceRequests,requestsSha256:hash});
function sampleEvidence(id='basis12'){
 const copy=structuredClone(manifest),item=copy.cases.find(c=>c.id===id);
 item.receiptStatus='submitted_unverified';
 item.independentReference={
  reviewerRole:'Unabhängige Prüfstelle für Familienleistungen',
  reviewedAt:'2026-10-17',
  sourceUrl:'https://example.org/testreferenz-nur-fuer-einen-test',
  legalEdition:'BEEG-Musterfassung 2026',
  independentDerivation:'Dies ist ein bewusst fiktiver formaler Testnachweis, kein echter Fachbeleg. Die Berechnung wurde für den Strukturtest manuell konstruiert.',
  inputContract:{employment:'synthetic_employee_case'},
  expectedLifeMonths:[
   {lifeMonth:1,parent1BenefitEuro:0,parent2BenefitEuro:1500.50,derivationReference:'fiktiv-1'},
   {lifeMonth:2,parent1BenefitEuro:400,parent2BenefitEuro:900.50,derivationReference:'fiktiv-2'}
  ]
 };
 return copy;
}
test('manifest pins the original source file, covers 10 unique cases, and approves ZERO',()=>{
 const result=evalManifest();
 assert.deepEqual(result,{
  total:10,missing:10,submittedUnverified:0,independentlyApproved:0,
  publicReleaseApproved:false,outcome:'STRUCTURE_ONLY_NO_EXTERNAL_PROOF',
  notice:'Automatische Prüfung kontrolliert nur Vollständigkeit und Quellenkennzeichnung, keine echte unabhängige Fachfreigabe.'
 });
 assert.equal(requests.cases.find(c=>c.id==='maternity-conflict').scope,'unresolved_conflict');
});
test('unreviewed submitted-looking evidence remains structurally submitted, never approved',()=>{
 const report=evalManifest(sampleEvidence());
 assert.equal(report.submittedUnverified,1);
 assert.equal(report.missing,9);
 assert.equal(report.independentlyApproved,0);
 assert.equal(report.publicReleaseApproved,false);
});
test('metadata flips cannot create an approval, independent status, or review decision',()=>{
 for(const [key,val] of [['publicReleaseApproved',true],['independentReviewApproved',true]]){
  const copy=structuredClone(manifest);copy[key]=val;
  assert.throws(()=>evalManifest(copy),TypeError);
 }
 for(const [key,value] of [['approved',true],['releaseReady',true],['reviewDecision','approved']]){
  const copy=structuredClone(manifest);copy.cases[0][key]=value;
  assert.throws(()=>evalManifest(copy),TypeError);
 }
 const changed=structuredClone(requests);changed.cases[0].title='Modified case';
 assert.throws(()=>evalManifest(undefined,changed,'f'.repeat(64)),TypeError);
});
test('pending rows may not contain secret silently populated expected amounts or reviewer claims',()=>{
 for(const key of ['sourceUrl','expectedLifeMonths','reviewerRole','independentDerivation']){
  const copy=structuredClone(manifest);copy.cases[0].independentReference[key]='pretend';
  assert.throws(()=>evalManifest(copy),TypeError);
 }
});
test('each synthetic request must have exactly one matching case and scope',()=>{
 const duplicate=structuredClone(manifest);duplicate.cases[1].id=duplicate.cases[0].id;
 assert.throws(()=>evalManifest(duplicate),TypeError);
 const alteredScope=structuredClone(manifest);alteredScope.cases[0].scope='unverified';
 assert.throws(()=>evalManifest(alteredScope),TypeError);
 const dropped=structuredClone(manifest);dropped.cases.pop();
 assert.throws(()=>evalManifest(dropped),TypeError);
});
test('incomplete or untraceable submissions fail closed',()=>{
 const scenarios=[
  r=>{r.independentReference.sourceUrl='http://example.org/not-secure';},
  r=>{r.independentReference.sourceUrl=null;},
  r=>{r.independentReference.legalEdition='';},
  r=>{r.independentReference.reviewerRole=null;},
  r=>{r.independentReference.expectedLifeMonths=[r.independentReference.expectedLifeMonths[0]];},
  r=>{r.independentReference.expectedLifeMonths[0].parent1BenefitEuro=0.001;},
  r=>{r.independentReference.expectedLifeMonths[1].lifeMonth=1;},
  r=>{r.independentReference.expectedLifeMonths[1].lifeMonth=4;},
  r=>{r.comparison.status='passed';},
  r=>{r.comparison.programCommit='abc';}
 ];
 for(const change of scenarios){
  const copy=sampleEvidence();change(copy.cases[0]);
  assert.throws(()=>evalManifest(copy),TypeError);
 }
});
