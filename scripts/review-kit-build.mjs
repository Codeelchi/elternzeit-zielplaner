import {readFileSync,mkdirSync,writeFileSync,existsSync} from 'node:fs';
import {createRequire} from 'node:module';
import {resolve,join} from 'node:path';
import {execFileSync} from 'node:child_process';
const require=createRequire(import.meta.url);
const {buildReviewKit,verifyReviewKit}=require('../src/review-kit.cjs');
const {getUnderstandingTasks}=require('../src/understanding-guide.cjs');

const root=resolve(import.meta.dirname,'..');
const outputRoot=join(root,'.local-review');
const args=process.argv.slice(2);
const mode=args.includes('--verify')?'verify':args.includes('--write')?'write':
 args.includes('--check')?'check':null;
if(!mode||args.filter(a=>['--verify','--write','--check'].includes(a)).length!==1){
 console.error('Nutzung: node scripts/review-kit-build.mjs --check | --write [kit-name] | --verify [kit-name]');
 process.exit(2);
}
const names=args.filter(a=>!a.startsWith('--'));
if(names.length>1)throw new Error('Nur ein Paketname erlaubt.');
const name=names[0]||'paket3c-20261022';
if(!/^[a-z0-9][a-z0-9-]{1,45}$/.test(name)||name.includes('..'))
 throw new TypeError('Nur ein begrenzter lokaler Paketname ohne Pfadangaben ist erlaubt.');
const target=join(outputRoot,name);
function read(key){return readFileSync(join(root,key),'utf8');}
if(mode==='verify'){
 const manifest=JSON.parse(readFileSync(join(target,'manifest.json'),'utf8'));
 const files=Object.fromEntries(Object.keys(manifest.files).map(name=>[name,readFileSync(join(target,name),'utf8')]));
 const outcome=verifyReviewKit({manifest,files});
 console.log('Prüfmaterial:',outcome.materials,'Dateien integritätsgeprüft; echte Fach-/Nutzerfreigabe: NEIN.');
 process.exit(0);
}
const sourceFiles=['src/understanding-guide.cjs','data/independent-case-requests-2026-10-17.json',
 'data/maternity-delta-evidence-2026-10-17.json','docs/PAKET3C-NUTZER-A11Y-ABNAHME-2026-10-22.md'];
const sourceContents=Object.fromEntries(sourceFiles.map(name=>[name,read(name)]));
const commit=execFileSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8'}).trim();
const preparedAt='2026-10-22'; // Source review reference date. Not a claim of test execution.
const bundle=buildReviewKit({preparedAt,commit,
 indexHtml:read('index.html'),sourceContents,
 caseRequests:JSON.parse(sourceContents['data/independent-case-requests-2026-10-17.json']),
 maternityEvidence:JSON.parse(sourceContents['data/maternity-delta-evidence-2026-10-17.json']),
 comprehensionTasks:getUnderstandingTasks()});
const outcome=verifyReviewKit(bundle);
if(mode==='check'){
 console.log('Review-Kit Vorprüfung PASS:',outcome.materials,'Vorlagen, 10 offene Fachfälle, 8 Verständnisaufgaben; 0 Personen, 0 Freigaben.');
 process.exit(0);
}
if(existsSync(target))
 throw new Error('Paket existiert bereits; nicht überschrieben. Einen neuen Paketnamen angeben oder bestehendes Material außerhalb der App verwalten: '+target);
mkdirSync(target,{recursive:true,mode:0o700});
for(const [filename,contents] of Object.entries(bundle.files))
 writeFileSync(join(target,filename),contents,{mode:0o600,flag:'wx'});
writeFileSync(join(target,'manifest.json'),JSON.stringify(bundle.manifest,null,2)+'\n',{mode:0o600,flag:'wx'});
console.log('Synthetischer, ungeprüfter Review-Koffer erzeugt in '+target+'; personenbezogene Protokolle NICHT enthalten.');
console.log('Quell-Commit '+commit+' / Index SHA-256 '+bundle.manifest.sourceHtmlSha256);
console.log('Abnahmen: weiterhin 0; produktive Freigabe: NEIN.');
