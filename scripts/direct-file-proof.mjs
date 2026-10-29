import {readFileSync,writeFileSync,mkdirSync,renameSync} from 'node:fs';
import {resolve,join} from 'node:path';
import {spawnSync} from 'node:child_process';
import {createRequire} from 'node:module';

const require=createRequire(import.meta.url);
const {validateDirectFileProof,digest,FILES}=require('../src/direct-file-proof.cjs');
const root=resolve(import.meta.dirname,'..');
const target=join(root,'qa/direct-file-proof-current.json');
const mode=process.argv[2];
if(!['--write','--check'].includes(mode)||process.argv.length!==3){
 console.error('Verwendung: node scripts/direct-file-proof.mjs --write|--check');
 process.exit(2);
}
const contents=Object.fromEntries(FILES.map(path=>[path,readFileSync(join(root,path))]));
const appVersion=JSON.parse(readFileSync(join(root,'package.json'),'utf8')).version;
if(mode==='--check'){
 const proof=JSON.parse(readFileSync(target,'utf8'));
 const outcome=validateDirectFileProof({proof,contents,appVersion});
 console.log('Direktdatei-Chromium-Nachweis: '+outcome.cases+' automatisierte Fälle, HTML-Quellenhashes aktuell. Keine unabhängige Freigabe.');
 process.exit(0);
}
// Invoke the JavaScript CLI through Node: .bin/playwright is a shell shim and
// cannot be spawned directly by Windows without a shell.
const runner=join(root,'node_modules/@playwright/test/cli.js');
const run=spawnSync(process.execPath,[runner,'test','--config=playwright.direct-file.config.mjs',
 '--reporter=json'],{
  cwd:root,encoding:'utf8',timeout:210000,maxBuffer:10*1024*1024,
  env:{...process.env,PLAYWRIGHT_PORT:'18932'}
});
if(run.error||run.status!==0){
 console.error('Echter Chromium-Datei-Browserlauf fehlgeschlagen. Keine Evidenzdatei geschrieben.');
 console.error((run.stderr||run.stdout||String(run.error)).slice(-2600));
 process.exit(1);
}
let report;
try{report=JSON.parse(run.stdout);}
catch{
 console.error('Playwright lieferte kein valides JSON-Protokoll; kein Nachweis geschrieben.');
 process.exit(1);
}
const cases=[];
function collect(suites){
 for(const suite of suites||[]){
  for(const spec of suite.specs||[])cases.push(spec);
  collect(suite.suites);
 }
}
collect(report.suites);
if(cases.length!==4||report.stats?.expected!==4||
 report.stats?.unexpected!==0||report.stats?.flaky!==0||
 report.stats?.skipped!==0||cases.some(spec=>!spec.ok||
  spec.tests?.length!==1||spec.tests[0].status!=='expected'||
  spec.tests[0].results?.at(-1)?.status!=='passed')){
 console.error('Der direkte Chromium-Testbericht ist nicht vollständig grün; kein Beleg geschrieben.');
 process.exit(1);
}
const sourceSha256=Object.fromEntries(FILES.map(key=>[key,digest(contents[key])]));
const proof={
 format:'direct-file-offline-technical-proof-v1',
 status:'AUTOMATED_ONLY_NOT_INDEPENDENT',
 generatedAt:new Date().toISOString(),
 appVersion,
 sourceSha256,
 technicalPass:true,
 tests:{
  total:4,passed:4,failed:0,skipped:0,flaky:0,
  titles:cases.map(x=>x.title),
  durationMs:Math.round(report.stats?.duration||0)
 },
 constraints:{
  pageProtocol:'file:',
  blockHttpAndWebSocket:true,
  browserOfflineMode:true,
  automatedAxeScans:2,
  pageNetworkAttempts:0,
  a4PagesGenerated:2,
  manualATReviewCompleted:false,
  externalAuthorityApproved:false
 },
 humanScreenreaderReviews:0,independentLegalReviews:0,independentPrivacyReviews:0,
 publicReleaseApproved:false,
 note:'Self-reported from executable automated Chromium tests; HTML and test-source hashes only. No external reviewer identity, signatures, full-screenreader review, legal approval or public release.'
};
validateDirectFileProof({proof,contents,appVersion});
mkdirSync(join(root,'qa'),{recursive:true});
const tmp=target+'.tmp';
writeFileSync(tmp,JSON.stringify(proof,null,2)+'\n',{mode:0o600});
renameSync(tmp,target);
console.log('Automatischer direkter file://-Chromium-Durchlauf: '+cases.length+' / '+cases.length+' bestanden; 2 A4-Seiten; HTTP(S)/WebSocket-Zugriffe verhindert.');
console.log('HTML-SHA256 '+sourceSha256['index.html']+'; Portal-SHA256 '+sourceSha256['start.html']);
console.log('Nachweis nach qa/direct-file-proof-current.json geschrieben; menschliche Review-/Releasefreigabe weiterhin NEIN.');
