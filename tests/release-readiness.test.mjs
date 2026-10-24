import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const {assessReleaseReadiness,REQUIRED_GATE_FIELDS}=require('../src/release-readiness.cjs');
const {validateReviewEvidence}=require('../src/independent-review-evidence.cjs');
const {validateUsabilityEvidence}=require('../src/usability-evidence.cjs');
const {getUnderstandingTasks}=require('../src/understanding-guide.cjs');
const {validateDirectFileProof,FILES}=require('../src/direct-file-proof.cjs');
const root=new URL('../',import.meta.url);
function raw(path){return readFileSync(new URL(path,root));}
function json(path){return JSON.parse(raw(path).toString('utf8'));}
function sha(buf){return createHash('sha256').update(buf).digest('hex');}
const gates=json('data/release-gates.json');
const references=json('qa/reference-deltas-current.json');
const maternityReview=json('data/maternity-delta-evidence-2026-10-17.json');
const sourceRequests=raw('data/independent-case-requests-2026-10-17.json');
const independentReview=validateReviewEvidence({
 manifest:json('data/independent-review-evidence-v317.json'),
 requests:JSON.parse(sourceRequests.toString('utf8')),
 requestsSha256:sha(sourceRequests)
});
const usabilityReview=validateUsabilityEvidence({
 manifest:json('data/usability-review-v317d.json'),
 taskIds:getUnderstandingTasks().map(x=>x.id),
 sourceSha256:sha(raw('src/understanding-guide.cjs'))
});
const files={indexSha256:sha(raw('index.html')),startSha256:sha(raw('start.html'))};
const packageVersion=json('package.json').version;
const directFileProof=validateDirectFileProof({
 proof:json('qa/direct-file-proof-current.json'),
 contents:Object.fromEntries(FILES.map(file=>[file,raw(file)])),
 appVersion:packageVersion
});
function evaluate(overrides={}){
 return assessReleaseReadiness({
  gates,references,packageVersion,files,independentReview,usabilityReview,
  maternityReview,operatorEvidence:null,directFileProof,...overrides
 });
}
test('real release evidence is fail-closed and lists each unreviewed P0',()=>{
 assert.deepEqual(REQUIRED_GATE_FIELDS,[
  'independentCalculationReview','legalReview','privacyReview',
  'directFileBrowserReview','userTesting'
 ]);
 const result=evaluate();
 assert.equal(result.allowed,false);
 const issues=result.failures.join('\n');
 for(const expected of [
  'independentCalculationReview','legalReview','privacyReview','userTesting',
  '10/10','Nutzer- und manuelle Screenreader','4/5-Tage',
  'Betreiberentscheid'
 ])assert.match(issues,new RegExp(expected));
 assert.doesNotMatch(issues,/Direkte Browser-Freigabe/);
 assert.equal(independentReview.independentlyApproved,0);
 assert.equal(usabilityReview.participantsObserved,0);
});
test('forged status flags and a forged reference gate do not unlock the public release',()=>{
 const falseGreenGates={...gates,publicReleaseApproved:true};
 for(const name of REQUIRED_GATE_FIELDS)falseGreenGates[name]='approved';
 const fakeReference={...references,publicReleaseGatePassed:true};
 const result=evaluate({gates:falseGreenGates,references:fakeReference});
 assert.equal(result.allowed,false);
 assert.ok(result.failures.some(x=>x.includes('10/10')));
 assert.ok(result.failures.some(x=>x.includes('Betreiberentscheid')));
 assert.ok(result.failures.some(x=>x.includes('Mutterschutz')));
});
test('even fake numeric review counters cannot replace an operator attestation or current HTML evidence',()=>{
 const fakeFamily={...independentReview,independentlyApproved:10,publicReleaseApproved:true,outcome:'REVIEWED'};
 const fakeUsers={...usabilityReview,independentUserReviewApproved:true,
  actualScreenreaderReview:true,tasksObserved:8,participantsObserved:3,publicReleaseApproved:true};
 const fakeMaternity={...maternityReview,reviewState:'REVIEWED',entitlementDecisionAllowed:true,externalAuthorityReply:{id:'fictional'}};
 const flags={...gates,publicReleaseApproved:true};
 for(const name of REQUIRED_GATE_FIELDS)flags[name]='approved';
 const result=evaluate({
  gates:flags,references:{...references,publicReleaseGatePassed:true},
  independentReview:fakeFamily,usabilityReview:fakeUsers,maternityReview:fakeMaternity,
  directFileProof:{...directFileProof,indexSha256:'f'.repeat(64)}
 });
 assert.equal(result.allowed,false);
 assert.ok(result.failures.some(x=>x.includes('Betreiberentscheid')));
 assert.ok(result.failures.some(x=>x.includes('Browser-Freigabe')));
});
test('version mismatch, missing inputs and obsolete browser evidence cannot look green',()=>{
 const wrong=evaluate({packageVersion:'999.0.0'});
 assert.equal(wrong.allowed,false);
 assert.ok(wrong.failures.some(x=>x.includes('Versionsstände')));
 const empty=assessReleaseReadiness();
 assert.deepEqual(empty,{allowed:false,failures:['Release-Metadaten fehlen.']});
 assert.equal(gates.directFileBrowserReview,'approved');
 assert.ok(gates.directFileEvidence.includes(files.indexSha256));
 assert.ok(gates.directFileEvidence.includes(files.startSha256));
 const missingProof=evaluate({directFileProof:null});
 assert.ok(missingProof.failures.some(x=>x.includes('Browser-Freigabe')));
 const historical=evaluate({gates:{...gates,directFileEvidence:'Historic, stale hashes'}});
 assert.ok(historical.failures.some(x=>x.includes('Browser-Freigabe')));
 assert.ok(!evaluate().allowed);
});
test('the actual release-check command remains blocked without operator and independent evidence',()=>{
 const result=spawnSync(process.execPath,['scripts/release-check.mjs'],{
  cwd:new URL('../',import.meta.url),encoding:'utf8',timeout:10000
 });
 assert.equal(result.status,1,result.stderr);
 assert.match(result.stderr,/Öffentlicher Release gesperrt/);
 assert.match(result.stderr,/10\/10 vollständige unabhängige/);
 assert.doesNotMatch(result.stderr,/Browser-Freigabe/);
 assert.match(result.stderr,/Betreiberentscheid/);
});
