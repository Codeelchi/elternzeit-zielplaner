import test from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
const require=createRequire(import.meta.url);
const {getUnderstandingTasks}=require('../src/understanding-guide.cjs');
const {validateUsabilityEvidence}=require('../src/usability-evidence.cjs');
const source=readFileSync(new URL('../src/understanding-guide.cjs',import.meta.url));
const ids=getUnderstandingTasks().map(t=>t.id);
const hash=createHash('sha256').update(source).digest('hex');
const template=JSON.parse(readFileSync(new URL('../data/usability-review-v317d.json',import.meta.url),'utf8'));
function check(input=structuredClone(template),otherIds=ids,otherHash=hash){
 return validateUsabilityEvidence({manifest:input,taskIds:otherIds,sourceSha256:otherHash});
}
test('prepared task manifest reports ZERO human observations, no approvals and no screenreader review',()=>{
 const result=check();
 assert.equal(result.tasksPrepared,8);
 assert.equal(result.tasksObserved,0);
 assert.equal(result.participantsObserved,0);
 assert.equal(result.independentUserReviewApproved,false);
 assert.equal(result.actualScreenreaderReview,false);
 assert.equal(result.publicReleaseApproved,false);
 assert.equal(result.outcome,'TEMPLATE_ONLY_NOT_A_USER_STUDY');
});
test('claiming success, a user study or completed task without evidence fails closed',()=>{
 for(const key of ['publicReleaseApproved','userReviewApproved']){
  const copy=structuredClone(template);copy[key]=true;
  assert.throws(()=>check(copy),TypeError);
 }
 for(const [key,value] of [
  ['status','observed'],['participantCount',1],['answerObserved','forecast'],
  ['comprehensionOutcome','understood_without_prompt'],['findingCodes',[]],
  ['facilitatorNotes','done'],['approved',true]
 ]){
  const copy=structuredClone(template);copy.tasks[0][key]=value;
  assert.throws(()=>check(copy),TypeError);
 }
 const withSession=structuredClone(template);withSession.sessions.push({date:'2026-10-18'});
 assert.throws(()=>check(withSession),TypeError);
});
test('task duplication, deletion, changed IDs and stale SHA fail',()=>{
 const dup=structuredClone(template);dup.tasks[1].id=dup.tasks[0].id;
 assert.throws(()=>check(dup),TypeError);
 const missing=structuredClone(template);missing.tasks.pop();
 assert.throws(()=>check(missing),TypeError);
 const wrong=structuredClone(template);wrong.tasks[0].id='unrelated';
 assert.throws(()=>check(wrong),TypeError);
 const stale=structuredClone(template);stale.tasksSourceSha256='a'.repeat(64);
 assert.throws(()=>check(stale),TypeError);
 assert.throws(()=>check(undefined,ids,'x'.repeat(64)),TypeError);
});
test('automated checker rejects a fabricated eighth task or unbound registry',()=>{
 assert.throws(()=>check(undefined,[...ids.slice(0,7),'cohort-2027']),TypeError);
 assert.throws(()=>check(undefined,ids.slice(0,7)),TypeError);
});
