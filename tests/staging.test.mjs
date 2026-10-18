import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFileSync,mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {buildStaging} from '../scripts/staging-build.mjs';

test('staging artifacts are identical to offline files and enforce hashed JavaScript only',()=>{
 const out=mkdtempSync(path.join(tmpdir(),'elternzeit-staging-'));
 try{
  const info=buildStaging(out);
  assert.equal(info.publicReleaseApproved,false);
  assert.equal(info.schemaVersion,1);
  assert.match(info.csp,/connect-src 'none'/);
  assert.match(info.csp,/frame-ancestors 'none'/);
  assert.doesNotMatch(info.csp,/script-src 'unsafe-inline'/);
  assert.equal(info.inlineScriptsSha256.length,2);
  const config=readFileSync(path.join(out,'nginx.conf'),'utf8');
  for(const file of ['index.html','start.html']){
   const html=readFileSync(new URL('../'+file,import.meta.url));
   assert.equal(createHash('sha256').update(html).digest('hex'),info.files[file]);
   assert.equal(readFileSync(path.join(out,file),'utf8'),html.toString('utf8'));
  }
  assert.match(config,/access_log off/);
  assert.match(config,/Cache-Control "no-store"/);
  assert.match(config,/add_header Content-Security-Policy/);
  assert.doesNotMatch(config, /@@CSP@@/);
 } finally{rmSync(out,{recursive:true,force:true});}
});
