import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createRequire} from 'node:module';
const {auditOfficialSources:audit,officialURL}=createRequire(import.meta.url)('../src/source-audit.cjs');
const sources=JSON.parse(readFileSync(new URL('../data/official-source-review-2026-10-17.json',import.meta.url),'utf8'));
test('new official register preserves legal conflict and 2027 proposal without promoting either into finance calculations',()=>{
 const r=audit(sources);
 assert.ok(r.count>=10);
 assert.equal(r.independentlyApprovedForCalculation,0);
 assert.ok(r.findings.some(x=>x.type==='CONFLICT'&&x.id==='maternity-conflict'));
 assert.ok(r.findings.some(x=>x.type==='PROPOSAL'&&x.id==='tax-2027-draft'));
 assert.ok(r.items.every(x=>!x.calculationApproved));
});
test('forged hostnames and non-HTTPS links cannot masquerade as official evidence',()=>{
 for(const url of ['http://www.stadt-koeln.de','https://www.stadt-koeln.de.evil.example','https://evil.example','file:///etc/passwd','https://admin:pass@www.stadt-koeln.de'])assert.equal(officialURL(url),false,url);
});
test('stale source check is flagged, not silently upgraded',()=>{
 const data=structuredClone(sources);
 data.items[0].nextReview='2026-10-17';
 const r=audit(data);
 assert.ok(r.findings.some(x=>x.id===data.items[0].id&&x.type==='REVIEW_DUE'));
});
test('future source checks, duplicate IDs, false approval and unrecognized state are rejected',()=>{
 for(const modify of [
  data=>{data.items[0].checkedAt='2027-01-01';},
  data=>{data.items[1].id=data.items[0].id;},
  data=>{data.items[1].independentApproval=true;},
  data=>{data.items[1].status='enacted_unverified';}
 ]){
  const data=structuredClone(sources);modify(data);
  assert.throws(()=>audit(data));
 }
});


test('the NRW 2027 version is promulgated but not active at the 2026 evidence date',()=>{
 const result=audit(sources),future=result.items.find(x=>x.id==='nrw-kibiz-2027');
 assert.equal(future.status,'promulgated_future_effective');
 assert.equal(future.effectiveOnReview,false);
 assert.ok(result.findings.some(x=>x.id===future.id&&x.type==='PROMULGATED_FUTURE'));
 assert.equal(future.calculationApproved,false);
});
test('date/status inversion cannot mark future KiBiz as already effective',()=>{
 const data=structuredClone(sources);
 data.items.find(x=>x.id==='nrw-kibiz-2027').status='effective';
 assert.throws(()=>audit(data),/Noch nicht wirksame/);
});
