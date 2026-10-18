import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
const origin=process.env.STAGING_BASE_URL ?? 'http://127.0.0.1:8768';
if(!/^http:\/\/(?:127\.0\.0\.1|localhost):\d+$/.test(origin))throw new Error('Smoke test only permits a local staging origin');
const manifest=JSON.parse(readFileSync(new URL('../dist/staging/metadata.json',import.meta.url),'utf8'));
async function request(path,options={}){
 const response=await fetch(origin+path,{redirect:'manual',...options});
 const body=await response.arrayBuffer();
 return {response,body:Buffer.from(body)};
}
for(const file of ['index.html','start.html']){
 const {response,body}=await request('/'+file);
 assert.equal(response.status,200,file+' status');
 assert.match(response.headers.get('content-type')??'',/text\/html/);
 assert.equal(response.headers.get('content-security-policy'),manifest.csp,file+' CSP');
 assert.equal(response.headers.get('cache-control'),'no-store');
 assert.equal(response.headers.get('referrer-policy'),'no-referrer');
 assert.equal(response.headers.get('x-content-type-options'),'nosniff');
 assert.equal(response.headers.get('x-frame-options'),'DENY');
 assert.equal(createHash('sha256').update(body).digest('hex'),manifest.files[file],file+' bytes');
}
const root=await request('/');
assert.equal(root.response.status,302);
assert.equal(root.response.headers.get('location'),'/start.html');
assert.equal((await request('/healthz')).response.status,200);
assert.equal((await request('/missing.txt')).response.status,404);
assert.equal((await request('/index.html',{method:'POST'})).response.status,403);
console.log('Live private Nginx smoke PASS: file SHA256, CSP headers, deny-cache, loopback HTTP, route/POST boundaries.');
console.log('This is not an independent security/legal review or public release clearance.');
