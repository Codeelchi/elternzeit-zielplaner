import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,readdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import path from 'node:path';
import {buildPagesPreview} from '../scripts/pages-preview-build.mjs';

test('the public test preview publishes two HTML files only, never private repository files',()=>{
 const {out,info}=buildPagesPreview();
 assert.equal(info.releaseApproved,false);
 assert.equal(info.schemaVersion,1);
 assert.equal(info.kind,'PUBLIC_TEST_PREVIEW_NOT_RELEASE');
 assert.deepEqual(readdirSync(out).sort(),['.nojekyll','index.html','robots.txt','start.html'].sort());
 for(const page of ['index.html','start.html']){
  const html=readFileSync(path.join(out,page),'utf8');
  const source=readFileSync(new URL('../'+page,import.meta.url));
  assert.equal(info.files[page].sourceSha256,createHash('sha256').update(source).digest('hex'));
  assert.match(html,/id="public-preview-notice"/);
  assert.match(html,/KEIN AMTLICHER ELTERNGELDRECHNER/);
  assert.match(html,/GitHub Pages verarbeitet Zugriffs-IP-Adressen/);
  assert.match(html,/name="robots" content="noindex,nofollow,noarchive"/);
  assert.match(html,/Content-Security-Policy/);
  assert.match(html,/script-src 'sha256-[A-Za-z0-9+/=]+'/);
  assert.match(html,/connect-src 'none'/);
  assert.doesNotMatch(html,/<script[^>]+\bsrc=/i);
  assert.doesNotMatch(html,/(?:github\.com\/Codeelchi\/elternzeit-zielplaner\/blob|(?:src|data)\/independent-review)/);
 }
 assert.match(readFileSync(path.join(out,'robots.txt'),'utf8'),/Disallow: \//);
});
