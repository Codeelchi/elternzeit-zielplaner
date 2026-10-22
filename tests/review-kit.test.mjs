import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import {execFileSync} from 'node:child_process';
const require=createRequire(import.meta.url);
const {buildReviewKit,verifyReviewKit,maternityCalendarWitness,hash}=require('../src/review-kit.cjs');
const {getUnderstandingTasks}=require('../src/understanding-guide.cjs');
const read=name=>readFileSync(new URL('../'+name,import.meta.url),'utf8');
const names=['src/understanding-guide.cjs','data/independent-case-requests-2026-10-17.json',
 'data/maternity-delta-evidence-2026-10-17.json','docs/PAKET3C-NUTZER-A11Y-ABNAHME-2026-10-22.md'];
const sourceContents=Object.fromEntries(names.map(key=>[key,read(key)]));
const requests=JSON.parse(sourceContents[names[1]]);
const evidence=JSON.parse(sourceContents[names[2]]);
const inputs=()=>({
 preparedAt:'2026-10-22',commit:'f'.repeat(40),indexHtml:read('index.html'),
 sourceContents:structuredClone(sourceContents),caseRequests:structuredClone(requests),
 maternityEvidence:structuredClone(evidence),comprehensionTasks:structuredClone(getUnderstandingTasks())
});
test('one kit deterministically builds nine zero-claim synthetic sources from real repository inputs',()=>{
 const args=inputs(),unchanged=JSON.stringify(args);
 const kit=buildReviewKit(args),again=buildReviewKit(args);
 assert.deepEqual(kit,again);
 assert.equal(JSON.stringify(args),unchanged);
 assert.equal(kit.manifest.status,'PREPARED_NO_HUMAN_REVIEW');
 assert.equal(kit.manifest.independentlyVerifiedFullFamilies,0);
 assert.equal(kit.manifest.actualScreenreaderReviews,0);
 assert.equal(kit.manifest.humanParticipantsObserved,0);
 assert.equal(kit.manifest.publicReleaseApproved,false);
 assert.equal(kit.manifest.modelOutputsUsedAsExternalExpectedValues,false);
 assert.equal(kit.manifest.sourceCaseCount,10);
 assert.equal(kit.manifest.comprehensionTaskCount,8);
 assert.equal(kit.manifest.sourceHtmlSha256,hash(args.indexHtml));
 assert.equal(verifyReviewKit(kit).materials,9);
 assert.equal(kit.files['07-LEERE-SESSION-VORLAGE.json'].includes('"observationSessions": []'),true);
 assert.equal(kit.files['00-START-HIER.md'].includes('0 von 10'),true);
});
test('independent Gregorian calendar witness preserves July 15 vs July 14 and never approves entitlement',()=>{
 const w=maternityCalendarWitness(evidence);
 assert.deepEqual(w,{
  birthDate:'2026-05-20',afterBirthStart:'2026-05-21',
  eightWeeksEnd:'2026-07-15',
  lifeMonthStart:'2026-06-20',lifeMonthEnd:'2026-07-19',
  daysInLifeMonth:30,modelRemainingDays:4,federalPortalRemainingDays:5,
  disputedDays:1,officialDecision:'PENDING_EXTERNAL_AUTHORITY_AND_LEGAL_REVIEW',releaseApproved:false
 });
 const copy=structuredClone(evidence);
 copy.entitlementDecisionAllowed=true;
 assert.throws(()=>maternityCalendarWitness(copy),/unzulässig|verändert/);
 copy.entitlementDecisionAllowed=false;
 copy.externalAuthorityReply='approved';
 assert.throws(()=>maternityCalendarWitness(copy));
 copy.externalAuthorityReply=null;
 copy.officialFederalExample.uncoveredDays=4;
 assert.throws(()=>maternityCalendarWitness(copy));
});
test('federal portal five-day quote, official 4-day alternative and statutes remain independently attributed',()=>{
 const kit=buildReviewKit(inputs());
 const doc=kit.files['01-MUTTERSCHUTZ-FACHANFRAGE.md'];
 assert.match(doc,/vier oder fünf/);
 assert.match(doc,/15\. Juli 2026/);
 assert.match(doc,/14\. Juli/);
 for(const x of ['familienportal.de','komnet.nrw.de','www.kbs.de','gesetze-im-internet.de'])
  assert.ok(doc.includes(x),x);
 assert.match(doc,/keine Anfrage tatsächlich versendet/);
 assert.match(doc,/Produktfreigabe \*\*NO-GO\*\*/);
});
test('family request summary never fills external expectations or pretends full independent review',()=>{
 const kit=buildReviewKit(inputs());
 assert.match(kit.files['02-ZEHN-FAMILIENFAELLE.md'],/\*\*FEHLT\*\*/);
 assert.equal((kit.files['02-ZEHN-FAMILIENFAELLE.md'].match(/\*\*FEHLT\*\*/g)||[]).length,10);
 const raw=JSON.parse(kit.files['08-SYNTHETISCHE-FALLANFRAGEN.json']);
 assert.equal(raw.cases.length,10);
 assert.ok(raw.cases.every(c=>c.expectedFamilyMonthlyBenefits===null&&c.independentlyVerified===false));
 assert.match(kit.files['06-PROZESS-FREIGABEN.md'],/0\/10/);
});
test('participant questions deliberately omit moderator solutions, code exists only in separate restricted file',()=>{
 const kit=buildReviewKit(inputs());
 const questions=kit.files['03-ACHT-VERSTAENDNISFRAGEN.md'];
 const key=kit.files['05-MODERATOR-ANTWORTSCHLUESSEL.md'];
 for(const task of getUnderstandingTasks()){
  assert.ok(questions.includes('(`'+task.id+'`)'));
  assert.ok(key.includes('Richtige pädagogische Option: `'+task.answer+'`'));
  assert.ok(!questions.includes('Richtige pädagogische Option'));
 }
 assert.match(questions,/keine echte Testperson beobachtet/);
});
test('evidence checker rejects replaced files and fabricated approvals, without permitting missing rows',()=>{
 const input=buildReviewKit(inputs());
 for(const [change,reason] of [
  [k=>{k.files['01-MUTTERSCHUTZ-FACHANFRAGE.md']+='OFFICIAL APPROVAL';},/verändert/],
  [k=>{k.manifest.expertApproval=true;},/Freigaben/],
  [k=>{k.manifest.humanParticipantsObserved=1;},/Freigaben/],
  [k=>{k.manifest.publicReleaseApproved=true;},/Freigaben/],
  [k=>{k.files['07-LEERE-SESSION-VORLAGE.json']='{"observationSessions":[{}]}';},/verändert/],
  [k=>{delete k.files['06-PROZESS-FREIGABEN.md'];},/unvollständig/]
 ]){
  const copy=structuredClone(input);
  change(copy);
  assert.throws(()=>verifyReviewKit(copy),reason);
 }
});
test('prepared manifest binds exactly dated source hashes without leaking unrelated repository content',()=>{
 const kit=buildReviewKit(inputs());
 for(const name of names)
  assert.equal(kit.manifest.sourceFiles[name],hash(sourceContents[name]));
 assert.equal(Object.keys(kit.files).length,9);
 assert.ok(!JSON.stringify(kit.manifest).includes('sk-proj'));
 assert.ok(kit.files['06-PROZESS-FREIGABEN.md'].includes('Rechtsstand 2027'));
});
test('incomplete, modified or pre-approved requests and review questions fail closed',()=>{
 const invalid=[
  a=>{a.caseRequests.cases[0].expectedFamilyMonthlyBenefits=[100];},
  a=>{a.caseRequests.cases[0].parents.father.preEgNetEuro=null;},
  a=>{delete a.caseRequests.cases[0].parents.mother.preEgNetEuro;},
  a=>{a.caseRequests.cases[0].independentlyVerified=true;},
  a=>{a.caseRequests.cases.push(a.caseRequests.cases[0]);},
  a=>{a.comprehensionTasks[1].id=a.comprehensionTasks[0].id;},
  a=>{a.comprehensionTasks[3].answer='';},
  a=>{a.preparedAt='2026-02-30';},
  a=>{a.commit='broken';},
  a=>{a.sourceContents[names[0]]='';},
  a=>{a.maternityEvidence.reviewState='APPROVED';}
 ];
 for(const mutate of invalid){
  const args=inputs();mutate(args);
  assert.throws(()=>buildReviewKit(args),TypeError);
 }
});
test('CLI no-write preflight passes and does not require accessing a browser or an account',()=>{
 const result=execFileSync(process.execPath,['scripts/review-kit-build.mjs','--check'],{
  cwd:new URL('..',import.meta.url),encoding:'utf8'
 });
 assert.match(result,/10 offene Fachfälle, 8 Verständnisaufgaben; 0 Personen, 0 Freigaben/);
});
