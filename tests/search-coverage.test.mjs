import test from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const {summarizeSearchCoverage:report}=createRequire(import.meta.url)('../src/search-coverage.cjs');
test('sequential search counters distinguish generated, duplicates, unique and first-failure categories',()=>{
 const x=report({generated:10,seen:6,valid:2,rejected:{coverage:2,overlap:1,rules:1,distribution:0,budget:0}});
 assert.equal(x.generated,10);assert.equal(x.duplicates,4);assert.equal(x.excluded,4);
 assert.equal(x.eligiblePercent,33.33);
 assert.equal(x.uniquePercent,60);
 assert.equal(x.completenessKnown,false);assert.equal(x.globalOptimumClaimAllowed,false);
});
test('empty search is not a 100%-complete proof',()=>{
 const x=report({generated:0,seen:0,valid:0});
 assert.equal(x.eligiblePercent,0);assert.equal(x.globalOptimumClaimAllowed,false);
});
test('inconsistent or forged counters cannot present a fake successful search',()=>{
 for(const payload of [
  {generated:1,seen:2,valid:1},
  {generated:2,seen:2,valid:3},
  {generated:2,seen:2,valid:1,rejected:{coverage:2}},
  {generated:0,seen:0,valid:0,rejected:{unvalidated:0}},
  {generated:1.5,seen:1,valid:1},
  {generated:1,seen:1,valid:1,rejected:{budget:-1}}
 ])assert.throws(()=>report(payload));
});
