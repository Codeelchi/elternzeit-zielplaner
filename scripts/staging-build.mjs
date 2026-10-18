import {createHash} from 'node:crypto';
import {mkdirSync,readFileSync,writeFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import path from 'node:path';

const root=fileURLToPath(new URL('../',import.meta.url));
const names=['index.html','start.html'];
function sha256(value){return createHash('sha256').update(value).digest('hex');}
function embeddedScripts(html,name){
 if(/<script\b[^>]*\bsrc\s*=/i.test(html))throw new Error(name+': external script refused');
 const blocks=[...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)];
 if(blocks.length!==1)throw new Error(name+': expected exactly one inline script');
 return blocks.map(m=>"'sha256-"+createHash('sha256').update(m[1]).digest('base64')+"'");
}
export function buildStaging(destination=path.join(root,'dist/staging')){
 const pages=Object.fromEntries(names.map(name=>[name,readFileSync(path.join(root,name),'utf8')]));
 const scripts=names.flatMap(name=>embeddedScripts(pages[name],name));
 // Explicit script hashes prevent arbitrary inline JS despite single-file architecture.
 // Existing inline style declarations still require unsafe-inline CSS.
 const csp="default-src 'none'; base-uri 'none'; object-src 'none'; frame-ancestors 'none'; "+
  "script-src "+scripts.join(' ')+"; style-src 'unsafe-inline'; img-src 'self' data:; "+
  "font-src 'none'; connect-src 'none'; worker-src 'none'; form-action 'none'; manifest-src 'none'";
 const source=readFileSync(path.join(root,'deploy/staging/nginx.conf.in'),'utf8');
 if(!source.includes('@@CSP@@'))throw new Error('CSP insertion marker absent');
 mkdirSync(destination,{recursive:true});
 for(const name of names)writeFileSync(path.join(destination,name),pages[name]);
 writeFileSync(path.join(destination,'nginx.conf'),source.replace('@@CSP@@',csp));
 const metadata={buildType:'PRIVATE_STAGING_NOT_RELEASE',schemaVersion:1,
  files:Object.fromEntries(names.map(name=>[name,sha256(pages[name])])),
  inlineScriptsSha256:scripts,csp,publicReleaseApproved:false};
 writeFileSync(path.join(destination,'metadata.json'),JSON.stringify(metadata,null,2)+'\n');
 return metadata;
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const m=buildStaging();console.log('Private staging prepared; file hashes:',JSON.stringify(m.files));
}
