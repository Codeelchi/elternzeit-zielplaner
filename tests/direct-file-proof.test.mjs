import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const {validateDirectFileProof,digest,FILES}=require('../src/direct-file-proof.cjs');

const read=path=>readFileSync(new URL('../'+path,import.meta.url));
const proof=JSON.parse(read('qa/direct-file-proof-current.json').toString('utf8'));
const appVersion=JSON.parse(read('package.json').toString('utf8')).version;
const files=Object.fromEntries(FILES.map(f=>[f,read(f)]));
const check=(data=proof,overrides=files,version=appVersion)=>
 validateDirectFileProof({proof:data,contents:overrides,appVersion:version});

test('actual source-pinned 2026-10-24 proof validates only four automated direct file cases',()=>{
 const report=check();
 assert.deepEqual(report,{
  status:'VALID_SOURCE_PINNED_AUTOMATED_PROOF_ONLY',
  indexSha256:digest(read('index.html')),startSha256:digest(read('start.html')),
  cases:4,independentApproval:false,publicReleaseApproved:false
 });
 assert.match(proof.generatedAt,/^\d{4}-\d{2}-\d{2}T/);
 assert.ok(Number.isFinite(Date.parse(proof.generatedAt)));
 assert.equal(proof.constraints.pageNetworkAttempts,0);
 assert.equal(proof.constraints.a4PagesGenerated,2);
 assert.equal(proof.humanScreenreaderReviews,0);
 assert.equal(proof.publicReleaseApproved,false);
});
test('file:// receipt cannot survive edits to either HTML, test implementation, proof script, validator or lock',()=>{
 for(const file of FILES){
  const changed={...files,[file]:Buffer.concat([read(file),Buffer.from('\nmutated')])};
  assert.throws(()=>check(proof,changed),new RegExp('Browserbeleg nicht mehr quellgleich'));
 }
 assert.throws(()=>check(proof,Object.fromEntries(Object.entries(files).filter(([key])=>key!=='start.html'))),/quellgleich/);
 assert.throws(()=>check(proof,files,'4.0.0'),/Metadaten/);
});
test('fabricated legal, human or product approval never counts as technical evidence',()=>{
 for(const [key,forgery] of [
  ['publicReleaseApproved',true],
  ['humanScreenreaderReviews',1],
  ['independentLegalReviews',1],
  ['independentPrivacyReviews',1],
  ['technicalPass',false],
  ['status','INDEPENDENT_REVIEW_APPROVED']
 ]){
  const altered=structuredClone(proof);altered[key]=forgery;
  assert.throws(()=>check(altered),/Metadaten/);
 }
});
test('partial browser suite, skipped cases, zero duration and unsupported test names fail closed',()=>{
 for(const [key,value] of [
  ['total',3],['passed',3],['failed',1],['skipped',1],['flaky',1],
  ['durationMs',0],['titles',['fake','fake','fake','fake']]
 ]){
  const altered=structuredClone(proof);altered.tests[key]=value;
  assert.throws(()=>check(altered),/vollständiger erfolgreicher/);
 }
});
test('network attempt, wrong protocol, missing A4 or manual fake cannot pass current proof check',()=>{
 for(const [key,value] of [
  ['pageProtocol','https:'],['blockHttpAndWebSocket',false],
  ['browserOfflineMode',false],['automatedAxeScans',0],
  ['pageNetworkAttempts',1],['a4PagesGenerated',1],
  ['manualATReviewCompleted',true],['externalAuthorityApproved',true]
 ]){
  const altered=structuredClone(proof);altered.constraints[key]=value;
  assert.throws(()=>check(altered),/Netzwerk-/);
 }
});
test('source-key substitution and invalid timestamps cannot masquerade as the current receipt',()=>{
 const altered=structuredClone(proof);
 delete altered.sourceSha256['index.html'];
 altered.sourceSha256['irrelevant.html']='a'.repeat(64);
 assert.throws(()=>check(altered),/quellgleich/);
 const wrongDate=structuredClone(proof);
 wrongDate.generatedAt='2026-10-24';
 assert.throws(()=>check(wrongDate),/Metadaten/);
});
test('the source-bound check command does not need Chromium, mutate files, or lift public release gate',()=>{
 const result=spawnSync(process.execPath,['scripts/direct-file-proof.mjs','--check'],{
  cwd:new URL('../',import.meta.url),encoding:'utf8',timeout:12000
 });
 assert.equal(result.status,0,result.stderr);
 assert.match(result.stdout,/4 automatisierte Fälle/);
 assert.match(result.stdout,/Keine unabhängige Freigabe/);
 const gates=JSON.parse(read('data/release-gates.json').toString('utf8'));
 assert.equal(gates.publicReleaseApproved,false);
 assert.equal(gates.directFileBrowserReview,'approved');
 assert.ok(gates.directFileEvidence.includes(proof.sourceSha256['index.html']));
 assert.ok(gates.directFileEvidence.includes(proof.sourceSha256['start.html']));
});

test('CI executes every browser test, archives large traces only after failures, and keeps required success gates',()=>{
 const ci=read('.github/workflows/ci.yml').toString('utf8');
 assert.match(ci,/Desktop, mobile, accessibility and local-first browser gates\s*\n\s*run: npm run test:e2e/);
 const upload=ci.split('Archive browser failure evidence')[1]?.split('Summarize browser evidence')[0];
 assert.ok(upload,'Optional browser failure artifact step must remain explicit.');
 assert.match(upload,/if: failure\(\)/);
 assert.match(upload,/continue-on-error: true/);
 assert.doesNotMatch(upload,/if: always\(\)/);
 assert.match(ci,/test "\$NODE_RESULT" = success/);
 assert.match(ci,/test "\$BROWSER_RESULT" = success/);
 assert.match(ci,/test "\$STAGING_RESULT" = success/);
 assert.match(ci,/qa\/direct-file-proof-current\.json/);
});
