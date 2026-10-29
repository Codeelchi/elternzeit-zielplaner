import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {mkdirSync,readFileSync,readdirSync,rmSync,writeFileSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root=fileURLToPath(new URL('../',import.meta.url));
const out=path.join(root,'dist/pages-preview');
const whitelist=['index.html','start.html'];
const bannerText='ÖFFENTLICHE TESTVORSCHAU – KEIN AMTLICHER ELTERNGELDRECHNER. NUR FIKTIVE DATEN VERWENDEN.';
const fakeDataOnly='Ausschließlich erfundene Testwerte verwenden. Keine echten Gehaltsabrechnungen, Bescheide, Namen oder Finanzdaten eingeben, importieren oder exportieren.';
const banner='<aside id="public-preview-notice" role="note" aria-label="Öffentliche Testvorschau" style="position:sticky;top:0;z-index:10000;padding:13px 16px;background:#513017;color:#fff;font:700 14px/1.6 system-ui,-apple-system,sans-serif;text-align:center;">'+bannerText+' <span style="font-weight:400">Ohne Fachfreigabe. GitHub Pages verarbeitet Zugriffs-IP-Adressen; lokale Speicherung ist optional und unverschlüsselt.</span></aside>';

function digest(bytes){return createHash('sha256').update(bytes).digest('hex');}
function escapeHtml(text){return String(text).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function gitCommit(){
 const gitSha=execFileSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8'}).trim();
 if(!/^[a-f0-9]{40}$/.test(gitSha))throw new Error('Git commit cannot be independently determined');
 const ciSha=process.env.GITHUB_SHA;
 if(ciSha && ciSha!==gitSha)throw new Error('Git checkout differs from GITHUB_SHA; refuse misleading build provenance');
 return gitSha;
}
function replaceOnce(source,needle,replacement,label){
 const first=source.indexOf(needle);
 if(first<0||first!==source.lastIndexOf(needle))throw new Error('Missing or ambiguous preview anchor: '+label);
 return source.slice(0,first)+replacement+source.slice(first+needle.length);
}
function cspForPage(html,name){
 if(/<script\b[^>]*\bsrc\s*=/i.test(html))throw Error(name+': Externes JavaScript nicht erlaubt');
 const scripts=[...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)];
 if(scripts.length!==1)throw Error(name+': Erwartet genau ein eingebettetes Skript');
 const sha=createHash('sha256').update(scripts[0][1]).digest('base64');
 return "default-src 'none'; base-uri 'none'; object-src 'none'; script-src 'sha256-"+sha+"'; style-src 'unsafe-inline'; img-src 'self' data:; connect-src 'none'; font-src 'none'; media-src 'none'; worker-src 'none'; frame-src 'none'; form-action 'none'";
}
function contextNotice(name){
 return '<p role="note" class="note warn public-preview-only" data-preview-context="'+name+'" style="margin:12px 0;line-height:1.65">'+fakeDataOnly+' Alle angezeigten Geldbeträge sind unverbindliche Beispiel-/Modellwerte; besonders für 2027 und Sonderfälle liegt keine geprüfte Anspruchsberechnung vor.</p>';
}
function enrichPlanner(html,packageVersion,ruleDate){
 html=replaceOnce(html,
  '<summary>Eigene Werte eingeben – nur fünf Angaben</summary>',
  '<summary>Fiktive Testwerte eingeben – nur fünf Angaben</summary>',
  'fast-form-heading');
 html=replaceOnce(html,'<form id="v38PersonalForm" novalidate>',
  '<form id="v38PersonalForm" novalidate>\n'+contextNotice('quickstart-form'),
  'quickstart form');
 html=replaceOnce(html,'>Mit eigenen Zahlen planen</button>','>Mit fiktiven Zahlen testen</button>','own values button');
 html=replaceOnce(html,'Gehaltsabrechnungen und gegebenenfalls Bescheid bereithalten.',
  'Für diesen öffentlichen Test nur synthetische Angaben verwenden; keine persönlichen Abrechnungen oder Bescheide bereithalten oder eingeben.',
  'source forms prompt');
 html=replaceOnce(html,'<strong>Weiter planen mit echten Zahlen.</strong><small>Nutze deine aktuellen Gehaltsabrechnungen und den amtlichen Elterngeldrechner.</small>',
  '<strong>Mit fiktiven Zahlen weiter testen.</strong><small>Hier keine echten Finanzdaten verwenden; der amtliche Elterngeldrechner ist eine separate externe Seite.</small>',
  'review call to action');
 html=replaceOnce(html,'V3.15-/V3.16-Wochen- und Eingewöhnungsvarianten bleiben temporär und werden nicht exportiert.',
  'Historische Funktionsbezeichnungen V3.15/V3.16: Wochen- und Eingewöhnungsvarianten bleiben temporär und werden nicht exportiert. Diese Modulnamen sind nicht der aktuelle veröffentlichte Code- oder Regelstand.',
  'historic module note');
 html=replaceOnce(html,'<span class="eyebrow">Schnellstart · Version 3.10</span>',
  '<span class="eyebrow">Schnellstart · Paketversion '+escapeHtml(packageVersion)+' · Testvorschau</span>',
  'quickstart version wording');
 html=replaceOnce(html,'<span class="eyebrow">Elternzeitplaner · Version 3.10 · Rechtskatalog 15.10.2026</span>',
  '<span class="eyebrow">Elternzeitplaner · Paketversion '+escapeHtml(packageVersion)+' · Rechtskatalog '+escapeHtml(ruleDate)+'</span>',
  'planer version wording');
 for(const [section,id] of [
  ['Grundlagen','slide-2'],['Zeitachsen','slide-axes'],['Cashflow','slide-5'],['Monatsdetail','slide-6'],
  ['Naechste Schritte','slide-9'],['Plan prüfen','slide-10']
 ]){
  const tag='<section class="slide" data-title="'+section+'" id="'+id+'">';
  html=replaceOnce(html,tag,tag+'\n'+contextNotice(id),'section '+id);
 }
 html=replaceOnce(html,
  'FAMILIENFINANZEN <small>/ lokal & privat</small>',
  'FAMILIENFINANZEN <small>/ lokale Berechnung · öffentliche Testseite</small>',
  'public hosting instead of locally private');
 html=replaceOnce(html,
  'Lokal und privat · kein Konto.',
  'Lokal berechnet · öffentlich gehostete Testseite · kein Konto.',
  'privacy summary distinguishes hosting and calculation');
 html=replaceOnce(html,
  'Finanzielle Vergleiche benötigen echte Ausgaben; Vorlagenzahlen sind fiktiv.',
  'Finanzielle Vergleiche benötigen belastbare Annahmen; in diesem Test nur fiktive Ausgaben verwenden.',
  'financial search tutorial');
 html=replaceOnce(html,'<h3>Tatsächliche Zahlungseingänge</h3>',
  '<h3>Fiktive Zahlungseingänge (Testmodus)</h3>',
  'recorded payments heading');
 html=replaceOnce(html,'Optional selbst erfasste Bankbuchungen. Sie ändern weder den berechneten Anspruch noch die vorgeschlagenen Pläne.',
  'Für diesen Test ausschließlich erfundene Buchungen eintragen. Sie ändern weder den berechneten Anspruch noch die vorgeschlagenen Pläne.',
  'recorded payments warning');
 html=replaceOnce(html,'id="bankAdd" style="margin-top:12px">Buchung erfassen</button>',
  'id="bankAdd" style="margin-top:12px">Testbuchung erfassen</button>',
  'recorded payments action');
 for(const [original,synthetic,label] of [
  ['Gebt persönliche Finanz- oder Familiendaten nur weiter, wenn ihr das beim gewählten Dienst möchtet; zum Ausprobieren genügen fiktive Werte.',
   'Für diese öffentliche Testvorschau und den KI-Assistenten ausschließlich frei erfundene Daten verwenden.', 'ai privacy test data'],
  ['Hilf mir, Angaben für den Elternzeit-Zielplaner zu sammeln.',
   'Hilf mir, ausschließlich fiktive Testangaben für den Elternzeit-Zielplaner zu sammeln. Frage niemals nach echten persönlichen Daten.', 'ai prompt test data'],
  ['Die Beispiele sind vollständig fiktiv; eigene Angaben sind erst im zweiten Schritt nötig.',
   'Alle Beispiele sind erfunden. Verwendet auch beim Anpassen ausschließlich neue, frei erfundene Testwerte.','preview intro'],
  ['Wählt zuerst ein Beispiel oder gebt eigene Zahlen ein.',
   'Wählt zuerst ein Beispiel oder gebt ausschließlich frei erfundene Zahlen ein.','goal intro'],
  ['Vorlage mit meinen Angaben berechnen',
   'Vorlage mit fiktiven Testwerten berechnen','quickstart submit'],
  ['Unsere Netto-Werte sind bekannt',
   'Weitere synthetische Netto-Werte simulieren','income choice known'],
  ['Werte aus einer amtlichen Berechnung oder einem Bescheid übernehmen',
   'Nur erfundene Werte nach Art einer amtlichen Berechnung testen (keine Bescheide)','income choice official'],
  ['Bitte ersetzt sie durch eure eigenen Werte oder kennzeichnet sie bewusst als Schätzung.',
   'Die vorbelegten Zahlen sind erfunden. Ersetzt sie ausschließlich durch andere erfundene Testwerte.','income explanation'],
  ['Name oder Bezeichnung Elternteil 1',
   'Fiktive Bezeichnung Elternteil 1 (keine echten Namen)','fake first parent'],
  ['Name oder Bezeichnung Elternteil 2',
   'Fiktive Bezeichnung Elternteil 2 (keine echten Namen)','fake second parent'],
  ['Namen sind optional und bleiben lokal.',
   'Keine echten Namen eingeben. Eingaben werden nur in diesem Browser berechnet.','name context'],
  ['Im Rechner werden eure Angaben daraus ein vergleichbares Modell.',
   'Der Rechner zeigt ausschließlich Modellannahmen; keine individuelle Anspruchsprüfung.','case study context'],
  ['Geburtsdatum aus eigener Planung übernehmen',
   'Fiktives Geburtsdatum verwenden','birth context']
 ]){
  // Explicit text-only substitutions may be absent in future source versions;
  // fail closed for actual present anchors, never silently ship mixed copy.
  if(html.includes(original))html=replaceOnce(html,original,synthetic,label);
  else if(!['case study context','birth context'].includes(label))throw Error('Review-preview text anchor missing: '+label);
 }
 return html;
}
function enrichStart(html){
 for(const [oldText,newText,label] of [
  ['Sammelt eure verlässlichen Einkommensangaben und laufenden Kosten.',
   'Erfindet für diesen öffentlichen Test plausible Einkommen und Kosten; keine echten Unterlagen verwenden.','planning card'],
  ['Welche Angaben sollte ich für die Planung bereithalten?',
   'Welche fiktiven Angaben benötigt die Testvorschau?','FAQ question'],
  ['Hilfreich sind der voraussichtliche Geburtstermin, Arbeitszeiten, verlässliche Einkommensangaben und regelmäßige Haushalts- und Betreuungskosten.',
   'Für diesen öffentlichen Test reichen erfundene Geburtstermine, Arbeitszeiten sowie fiktive Einkommens-, Haushalts- und Betreuungskosten.','FAQ answer'],
  ['Im Rechner werden eure Angaben daraus ein vergleichbares Modell.',
   'Der Rechner zeigt daraus nur ein unverbindliches Testmodell.','plan illustration'],
  ['Euren Familienplan vergleichen →',
   'Fiktive Szenarien vergleichen →','planning link'],
  ['Keine Datenübertragung im Rechner',
   'Keine Eingabeübertragung · GitHub Pages protokolliert Abrufe','reassurance']
 ])html=replaceOnce(html,oldText,newText,'start: '+label);
 return html;
}
export function buildPagesPreview(){
 const commitSha=gitCommit();
 const pkg=JSON.parse(readFileSync(path.join(root,'package.json'),'utf8'));
 const sourceHtml=readFileSync(path.join(root,'index.html'),'utf8');
 const foundRule=sourceHtml.match(/Rechtskatalog (\d{2}\.\d{2}\.\d{4})/);
 if(!foundRule)throw new Error('Published legal source date cannot be determined');
 const ruleDate=foundRule[1];
 if(!/^[0-9]+\.[0-9]+\.[0-9]+$/.test(pkg.version))throw new Error('Package version invalid');
 const runId=process.env.GITHUB_RUN_ID;
 if(runId&&!/^[0-9]+$/.test(runId))throw new Error('Untrusted GitHub workflow run ID');
 const sourceLink='https://github.com/Codeelchi/elternzeit-zielplaner/commit/'+commitSha;
 const runLink=runId?' · <a href="https://github.com/Codeelchi/elternzeit-zielplaner/actions/runs/'+runId+'" target="_blank" rel="noopener noreferrer">Deployment-Lauf '+escapeHtml(runId)+'</a>':' · Lokaler Testbuild ohne GitHub-Deployment';
 const provenance='<div id="public-preview-build-info" role="note" aria-label="Version und Veröffentlichungsnachweis" style="padding:7px 14px;background:#eef4f1;color:#224039;font:12px/1.6 system-ui,-apple-system,sans-serif;overflow-wrap:anywhere;">'+
  '<strong>Test-Build · Paket '+escapeHtml(pkg.version)+' · Rechtsquellenstand '+escapeHtml(ruleDate)+'</strong> · Code-Commit <a href="'+sourceLink+'" target="_blank" rel="noopener noreferrer"><code>'+commitSha+'</code></a>'+runLink+'. '+
  'V3.15/V3.16 bezeichnen historische Funktionsbereiche, nicht den gesamten Build. <strong>Keine Fach- oder Produktfreigabe.</strong></div>';
 rmSync(out,{recursive:true,force:true});
 mkdirSync(out,{recursive:true});
 const info={kind:'PUBLIC_TEST_PREVIEW_NOT_RELEASE',releaseApproved:false,schemaVersion:1,commitSha,packageVersion:pkg.version,ruleDate,workflowRunId:runId||null,files:{}};
 for(const name of whitelist){
  const html=readFileSync(path.join(root,name),'utf8');
  if((html.match(/<body>/gi)||[]).length!==1||!html.includes('</head>'))throw Error('HTML structure unexpected: '+name);
  const enriched=name==='index.html'?enrichPlanner(html,pkg.version,ruleDate):enrichStart(html);
  const csp=cspForPage(enriched,name);
  const withMeta=replaceOnce(enriched,'</head>',
   '<meta name="robots" content="noindex,nofollow,noarchive">\n'+
   '<meta name="preview-commit" content="'+commitSha+'">\n'+
   '<meta http-equiv="Content-Security-Policy" content="'+csp+'">\n</head>',
   'html head '+name);
  const preview=replaceOnce(withMeta,'<body>','<body>\n'+banner+'\n'+provenance,'body '+name);
  writeFileSync(path.join(out,name),preview);
  info.files[name]={sourceSha256:digest(html),publicPreviewSha256:digest(preview)};
 }
 writeFileSync(path.join(out,'robots.txt'),'User-agent: *\nDisallow: /\n');
 writeFileSync(path.join(out,'.nojekyll'),'');
 const expected=['.nojekyll','index.html','robots.txt','start.html'];
 if(JSON.stringify(readdirSync(out).sort())!==JSON.stringify(expected.sort()))throw Error('Non-whitelisted public files');
 console.log('Prepared source-bound GitHub Pages TEST preview; only two HTML pages, no private repository documents.');
 return {out,info};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))buildPagesPreview();
