import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const {assessReleaseReadiness}=require('../src/release-readiness.cjs');
const {validateReviewEvidence}=require('../src/independent-review-evidence.cjs');
const {validateUsabilityEvidence}=require('../src/usability-evidence.cjs');
const {getUnderstandingTasks}=require('../src/understanding-guide.cjs');
const root=new URL('../',import.meta.url);
function load(rel){return JSON.parse(readFileSync(new URL(rel,root),'utf8'));}
function sha(buf){return createHash('sha256').update(buf).digest('hex');}
function bytes(rel){return readFileSync(new URL(rel,root));}

const gates=load('data/release-gates.json');
const references=load('qa/reference-deltas-current.json');
const packageVersion=load('package.json').version;
const maternityReview=load('data/maternity-delta-evidence-2026-10-17.json');
const files={indexSha256:sha(bytes('index.html')),startSha256:sha(bytes('start.html'))};
const evidenceErrors=[];
let independentReview=null,usabilityReview=null;
try{
 const input=bytes('data/independent-case-requests-2026-10-17.json');
 independentReview=validateReviewEvidence({
  manifest:load('data/independent-review-evidence-v317.json'),
  requests:JSON.parse(input.toString('utf8')),requestsSha256:sha(input)
 });
}catch(e){evidenceErrors.push('Familien-Evidenz nicht prüfbar: '+e.message);}
try{
 const input=bytes('src/understanding-guide.cjs');
 usabilityReview=validateUsabilityEvidence({
  manifest:load('data/usability-review-v317d.json'),
  taskIds:getUnderstandingTasks().map(t=>t.id),sourceSha256:sha(input)
 });
}catch(e){evidenceErrors.push('Nutzer-Evidenz nicht prüfbar: '+e.message);}
// There is currently no approved cryptographic/operator verification channel.
// Supplying or modifying JSON flags must not substitute an actual independent
// review and the operator's explicit final public-rollout authorization.
const decision=assessReleaseReadiness({
 gates,references,packageVersion,files,independentReview,usabilityReview,
 maternityReview,operatorEvidence:null
});
const failures=[...evidenceErrors,...decision.failures];
if(failures.length){
 process.stderr.write('Öffentlicher Release gesperrt:\n'+failures.map(x=>'- '+x).join('\n')+'\n');
 process.exitCode=1;
}else{
 // This branch is intentionally unreachable with current unverified evidence.
 process.stdout.write('Formale Gateprüfung bestanden. Externe Signaturen und Deploy-Freigabe separat prüfen.\n');
}
