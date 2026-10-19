import {readFileSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import path from 'node:path';

const defaultRoot=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const canonical='docs/STATUS-TECHNISCH-2026-10-19.md';
const tick=String.fromCharCode(96);
const entryDocs=[
 'README.md','docs/ROADMAP.md','docs/HANDOFF.md','docs/ARCHITEKTUR.md',
 'docs/ANLEITUNG.md','docs/BUILDLOG.md','CHANGELOG.md',
 'docs/GITHUB-PAGES-TESTVORSCHAU-2026-10-18.md'
];
const previousClaims=[
 'V3.18 auf main (PR #22/#23), V3.19 technischer Kandidat',
 'V3.19 technischer Kandidat',
 'Interner Funktionsstand V3.19 (18. Oktober 2026',
 'V3.19 – aktueller technischer Ausbau',
 'Entwickler-Handoff – V3.19:',
 'Architektur – interner Entwicklungsstand V3.19',
 'Ausgangspunkt GitHub-main a4afb8a'
];

// Guard for the current documentation snapshot; intentionally offline.
// In-memory overrides exercise negative paths without modifying files.
export function getDocStatusIssues(root=defaultRoot,overrides={}){
 const issues=[];
 const read=file=>Object.hasOwn(overrides,file)?overrides[file]:readFileSync(path.join(root,file),'utf8');
 const safeRead=file=>{
  try{return read(file);}catch{issues.push('Datei fehlt/nicht lesbar: '+file);return null;}
 };
 const status=safeRead(canonical);
 if(status===null)return issues;
 const pkgText=safeRead('package.json'),gatesText=safeRead('data/release-gates.json');
 let pkg,gates;
 try{if(pkgText!==null)pkg=JSON.parse(pkgText);}catch{issues.push('package.json ist ungültig');}
 try{if(gatesText!==null)gates=JSON.parse(gatesText);}catch{issues.push('release-gates.json ist ungültig');}

 if(pkg && !status.includes('**'+pkg.version+'**') && !status.includes(tick+pkg.version+tick)){
  issues.push('Versionsangabe '+pkg.version+' im Statusdokument fehlt');
 }
 if(gates?.publicReleaseApproved===false){
  if(!status.includes('NO-GO'))issues.push('NO-GO-Hinweis fehlt trotz Veröffentlichungssperre');
  if(!status.includes('0/10'))issues.push('Null-Evidenz der externen Referenzfamilien fehlt');
  if(!status.includes('0 echte Sitzungen'))issues.push('Keine Null-Evidenz für reale Nutzertests');
 } else {
  issues.push('Release-Flag verändert: gesonderte Dokumentations- und Betreiberfreigabe erforderlich');
 }
 if(!status.includes('3c837cbf47fe818a94157202a2b5699d7e697212'))
  issues.push('Verifizierter Softwarebasis-Commit nicht dokumentiert');
 if(!status.includes('39162208549'))issues.push('Verifizierter GitHub-CI-Lauf nicht dokumentiert');
 for(const filename of ['index.html','start.html']){
  const original=safeRead(filename);
  if(original===null)continue;
  const digest=createHash('sha256').update(original).digest('hex');
  const declaration=tick+filename+tick+' SHA-256 '+tick+digest+tick;
  if(!status.includes(declaration))issues.push('HTML-Snapshot passt nicht zu dokumentiertem SHA-256: '+filename);
 }
 for(const file of entryDocs){
  const body=safeRead(file);
  if(body===null)continue;
  const required=file==='README.md'?'docs/STATUS-TECHNISCH-2026-10-19.md':'STATUS-TECHNISCH-2026-10-19.md';
  if(!body.slice(0,2500).includes(required))issues.push('Aktueller Statuslink fehlt im Dokumentanfang: '+file);
  for(const banned of previousClaims){
   if(body.slice(0,2500).includes(banned))
    issues.push('Veraltete aktuelle Statusbehauptung im Dokumentanfang: '+file+' / '+banned);
  }
 }
 for(const match of status.matchAll(/\[[^\]]+\]\(([^)\s]+)\)/g)){
  const link=match[1].split('#')[0].split('?')[0];
  if(/^(?:https?:\/\/|mailto:)/i.test(link)||link.startsWith('/'))continue;
  if(link && !existsSync(path.resolve(root,'docs',link)))issues.push('Lokaler Link im Status fehlt: '+link);
 }
 return issues;
}

if(process.argv[1] && path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const issues=getDocStatusIssues();
 if(issues.length){console.error(issues.map(issue=>'[docs:check] '+issue).join('\n'));process.exitCode=1;}
 else console.log('Dokustatus konsistent: aktuelle Einstiege, Offline-Datei-Hashes, Version, P0-Sperre und relative Links geprüft.');
}
