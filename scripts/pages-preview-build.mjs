import {createHash} from 'node:crypto';
import {mkdirSync,readFileSync,readdirSync,rmSync,writeFileSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root=fileURLToPath(new URL('../',import.meta.url));
const out=path.join(root,'dist/pages-preview');
const whitelist=['index.html','start.html'];
const warning='ÖFFENTLICHE TESTVORSCHAU – KEIN AMTLICHER ELTERNGELDRECHNER. NUR FIKTIVE DATEN VERWENDEN.';
const banner='<aside id="public-preview-notice" role="note" aria-label="Öffentliche Testvorschau" style="position:sticky;top:0;z-index:10000;padding:13px 16px;background:#513017;color:#fff;font:700 14px/1.6 system-ui,-apple-system,sans-serif;text-align:center;">'+warning+' <span style="font-weight:400">Ohne Fachfreigabe. GitHub Pages verarbeitet Zugriffs-IP-Adressen; lokale Speicherung ist optional und unverschlüsselt.</span></aside>';
function digest(bytes){return createHash('sha256').update(bytes).digest('hex');}
function cspForPage(html,name){
  if(/<script\b[^>]*\bsrc\s*=/i.test(html))throw Error(name+': Externes JavaScript nicht erlaubt');
  const scripts=[...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)];
  if(scripts.length!==1)throw Error(name+': Erwartet genau ein eingebettetes Skript');
  const sha=createHash('sha256').update(scripts[0][1]).digest('base64');
  return "default-src 'none'; base-uri 'none'; object-src 'none'; script-src 'sha256-"+sha+"'; style-src 'unsafe-inline'; img-src 'self' data:; connect-src 'none'; font-src 'none'; media-src 'none'; worker-src 'none'; frame-src 'none'; form-action 'none'";
}

export function buildPagesPreview(){
  rmSync(out,{recursive:true,force:true});
  mkdirSync(out,{recursive:true});
  const info={kind:'PUBLIC_TEST_PREVIEW_NOT_RELEASE',releaseApproved:false,schemaVersion:1,files:{}};
  for(const name of whitelist){
    const html=readFileSync(path.join(root,name),'utf8');
    if((html.match(/<body>/gi)||[]).length!==1||!html.includes('</head>'))throw Error('HTML structure unexpected: '+name);
    const csp=cspForPage(html,name);
    const withMeta=html.replace('</head>','<meta name="robots" content="noindex,nofollow,noarchive">\n<meta http-equiv="Content-Security-Policy" content="'+csp+'">\n</head>');
    const preview=withMeta.replace('<body>','<body>\n'+banner);
    writeFileSync(path.join(out,name),preview);
    info.files[name]={sourceSha256:digest(html),publicPreviewSha256:digest(preview)};
  }
  writeFileSync(path.join(out,'robots.txt'),'User-agent: *\nDisallow: /\n');
  writeFileSync(path.join(out,'.nojekyll'),'');
  const expected=['.nojekyll','index.html','robots.txt','start.html'];
  const current=readdirSync(out).sort();
  if(JSON.stringify(current)!==JSON.stringify(expected.sort()))throw Error('Non-whitelisted public files');
  console.log('Prepared GitHub Pages test preview; exactly two HTML pages, no private repository documents.');
  return {out,info};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))buildPagesPreview();
