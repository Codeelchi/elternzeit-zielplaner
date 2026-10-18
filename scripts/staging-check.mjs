import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {buildStaging} from './staging-build.mjs';

const root=fileURLToPath(new URL('../',import.meta.url));
const dir=path.join(root,'dist/staging');
const metadata=buildStaging(dir);
const config=readFileSync(path.join(dir,'nginx.conf'),'utf8');
const compose=readFileSync(path.join(root,'deploy/staging/compose.yaml'),'utf8');
if(!config.includes('Content-Security-Policy "'+metadata.csp+'"')||
 metadata.csp.includes("script-src 'unsafe-inline'")||
 !metadata.csp.includes("connect-src 'none'")||
 !config.includes('access_log off')||
 !config.includes('Cache-Control "no-store"')||
 !compose.includes('"127.0.0.1:8768:8080"')||
 !compose.includes('read_only: true')||
 !compose.includes('no-new-privileges:true'))throw Error('Unsafe private staging configuration');
for(const [name,hash]of Object.entries(metadata.files)){
 const page=readFileSync(path.join(dir,name));
 if(createHash('sha256').update(page).digest('hex')!==hash)throw Error(name+' digest mismatch');
}
console.log('Private staging build: file integrity, CSP hashes, deny-network, loopback bind and restrictive container configuration PASS.');
console.log('WARNING: Docker/nginx execution, HTTPS proxy, operator details and external approval still require real verification.');
