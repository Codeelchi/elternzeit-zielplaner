'use strict';

// Offline preparatory package for real human reviewers. This creates blank
// review materials; it cannot receive, certify, or impersonate human findings,
// and MUST NOT turn a release gate green. No planner calculation is used to
// construct independent monetary expected values.
const {createHash}=require('node:crypto');

const SHA256=/^[0-9a-f]{64}$/;
const COMMIT=/^[0-9a-f]{40}$/;
const DATE=/^\d{4}-\d{2}-\d{2}$/;
const PASS_CODES=['understood_without_prompt','understood_after_prompt','misunderstood','not_completed'];

function hash(data){return createHash('sha256').update(data).digest('hex');}
function isValidDate(date){
 if(typeof date!=='string'||!DATE.test(date))return false;
 const ms=Date.parse(date+'T00:00:00Z');
 return Number.isFinite(ms)&&new Date(ms).toISOString().slice(0,10)===date;
}
function addDays(date,number){
 if(!isValidDate(date)||!Number.isInteger(number)||number<0||number>366)
  throw new RangeError('Nur valide ISO-Tage und begrenzte Tagewerte erlaubt.');
 return new Date(Date.parse(date+'T00:00:00Z')+number*86400000).toISOString().slice(0,10);
}
function daysBetween(start,end){
 if(!isValidDate(start)||!isValidDate(end))throw new RangeError('Ungültiger Vergleichstag.');
 return (Date.parse(end+'T00:00:00Z')-Date.parse(start+'T00:00:00Z'))/86400000;
}
function maternityCalendarWitness(evidence){
 if(!evidence||evidence.reviewState!=='UNRESOLVED_OFFICIAL_DISCREPANCY'||
   evidence.entitlementDecisionAllowed!==false||evidence.externalAuthorityReply!==null||
   !isValidDate(evidence.birthDate)||!isValidDate(evidence.expectedBirthDate)||
   evidence.birthDate!==evidence.expectedBirthDate||evidence.lifeMonth!==2||
   evidence.daysAfterBirth!==56||
   !isValidDate(evidence.lifeMonthStart)||!isValidDate(evidence.lifeMonthEnd)||
   evidence.officialFederalExample?.uncoveredDays!==5||
   evidence.independentAdministrativeCalendarExplanation?.uncoveredDays!==4)
  throw new TypeError('Der Mutterschutz-Sachverhalt ist verändert oder unzulässig vorab freigegeben.');
 const endOfPostnatalProtection=addDays(evidence.birthDate,56);
 const uncoveredModel=daysBetween(endOfPostnatalProtection,evidence.lifeMonthEnd);
 const uncoveredPortal=daysBetween(evidence.officialFederalExample.lastMaternityBenefitDate,evidence.lifeMonthEnd);
 if(endOfPostnatalProtection!=='2026-07-15'||
   evidence.lifeMonthStart!=='2026-06-20'||evidence.lifeMonthEnd!=='2026-07-19'||
   uncoveredModel!==4||uncoveredPortal!==5||
   endOfPostnatalProtection!==evidence.independentAdministrativeCalendarExplanation.lastProtectionDate)
  throw new TypeError('Die vier/fünf-Tage-Kalenderbelege sind inkonsistent.');
 return Object.freeze({birthDate:evidence.birthDate,afterBirthStart:addDays(evidence.birthDate,1),
  eightWeeksEnd:endOfPostnatalProtection,lifeMonthStart:evidence.lifeMonthStart,
  lifeMonthEnd:evidence.lifeMonthEnd,daysInLifeMonth:30,
  modelRemainingDays:uncoveredModel,federalPortalRemainingDays:uncoveredPortal,
  disputedDays:uncoveredPortal-uncoveredModel,
  officialDecision:'PENDING_EXTERNAL_AUTHORITY_AND_LEGAL_REVIEW',
  releaseApproved:false});
}

function buildReviewKit({preparedAt,commit,indexHtml,sourceContents,caseRequests,
 comprehensionTasks,maternityEvidence}={}){
 if(!isValidDate(preparedAt)||!COMMIT.test(commit)||
   typeof indexHtml!=='string'||indexHtml.length<10000||
   !sourceContents||typeof sourceContents!=='object'||
   !Array.isArray(caseRequests?.cases)||caseRequests.cases.length!==10||
   !Array.isArray(comprehensionTasks)||comprehensionTasks.length!==8)
  throw new TypeError('Verifizierbarer Quellstand mit genau zehn Fachfällen und acht Testaufgaben nötig.');
 const evidenceKeys=['src/understanding-guide.cjs','data/independent-case-requests-2026-10-17.json',
  'data/maternity-delta-evidence-2026-10-17.json','docs/PAKET3C-NUTZER-A11Y-ABNAHME-2026-10-22.md'];
 for(const key of evidenceKeys){
  if(typeof sourceContents[key]!=='string'||!sourceContents[key].trim())
   throw new TypeError('Paketquelle fehlt: '+key);
 }
 if(!comprehensionTasks.every(x=>x&&typeof x.id==='string'&&x.scenario&&x.question&&x.answer&&
     Array.isArray(x.choices)&&x.choices.length>=2)||
   new Set(comprehensionTasks.map(t=>t.id)).size!==8)
  throw new TypeError('Die acht pädagogischen Fragen sind nicht eindeutig.');
 if(!caseRequests.cases.every(x=>x&&typeof x.id==='string'&&x.title&&
   x.expectedFamilyMonthlyBenefits===null&&x.expectedSourceUrl===null&&
   x.independentReviewer===null&&x.independentlyVerified===false&&
   x.status==='awaiting_full_external_case'&&
   [x.parents?.father?.preEgNetEuro,x.parents?.mother?.preEgNetEuro].every(v=>
    typeof v==='number'&&Number.isFinite(v)&&v>=0&&v<=1e9))||
   new Set(caseRequests.cases.map(x=>x.id)).size!==10)
  throw new TypeError('Unabhängige Musterfälle dürfen keine Modell-Erwartungswerte oder Freigaben enthalten.');
 const witness=maternityCalendarWitness(maternityEvidence);
 const escapeMd=v=>String(v).replace(/[|\r\n]+/g,' ').replace(/</g,'&lt;').replace(/>/g,'&gt;');
 const formatMoney=n=>n.toLocaleString('de-DE',{style:'currency',currency:'EUR'});
 const SOURCE_URLS={
  federalExample:'https://familienportal.de/familienportal/familienleistungen/elterngeld/faq/kann-ich-elterngeld-und-mutterschaftsleistungen-bekommen--124776',
  NRW:'https://www.komnet.nrw.de/_sitetools/dialog/4244',
  KBS:'https://www.kbs.de/SiteGlobals/Forms/Rechner/rechner_pwa/Mutterschutzfristen/Mutterschutzfristen_node.html',
  muschg:'https://www.gesetze-im-internet.de/muschg_2018/__3.html',
  sgbv:'https://www.gesetze-im-internet.de/sgb_5/__24i.html'
 };
 const documents={};
 documents['00-START-HIER.md']=[
 '# Externer Prüfkoffer – **Vorlage, keine Abnahme**',
 '',
 '**Erstellt:** '+preparedAt+' · **Git-Commit:** `'+commit+'` · **HTML-SHA-256:** `'+hash(indexHtml)+'`',
 '',
 'Dieser Prüfkoffer enthält **ausschließlich synthetische Testaufgaben und vorbereitete Prüfaufträge**, keine echten Nutzerbeobachtungen, Behördenbescheide oder fachlichen Referenzbeträge.',
 '',
 '## Vorgesehene Reihenfolge',
 '',
 '1. Die Externen überprüfen die Quellenlage der Mutterschutz-4/5-Tage-Frage anhand von `01-MUTTERSCHUTZ-FACHANFRAGE.md`.',
 '2. Unabhängige Fachstellen liefern vollständige Fälle für `02-ZEHN-FAMILIENFAELLE.md`; sie dürfen die erwarteten Beträge **nicht aus dem Programm berechnen**.',
 '3. Moderation führt `03-ACHT-VERSTAENDNISFRAGEN.md` und die separate `04-PAKET3C-MANUELLE-ABNAHME.md` mit echten Personen unter einem abgestimmten Datenschutzverfahren durch.',
 '4. Der `05-MODERATOR-ANTWORTSCHLUESSEL.md` bleibt **während der Beobachtung verborgen**; er hilft erst bei der fachlichen Auswertung.',
 '5. Datenschutz, Bedienbarkeit, amtliche Quellen, Finanzfälle und verantwortlicher Betreiber werden **jeweils separat** geprüft; eine gemeinsame formale Freigabe ist nicht Teil dieses Pakets.',
 '',
 '**Status:** 0 von 10 externen Familienfällen unabhängig nachgewiesen · 0 moderierte Teilnehmende · 0 manuelle Screenreader-Freigaben · 0 Freigabeentscheidungen.',
 '',
 'Die Datenträger dürfen **keine identifizierenden Protokolle** enthalten. Notizen, Einwilligungen oder Rohdaten ausschließlich in einem zuvor genehmigten separaten Prozess aufbewahren.',
 '',
 '## Schutzmaßnahmen',
 '',
 '- Keine Produkt-, Rechts-, Datenschutz- oder Betreiberfreigabe durch dieses Skript.',
 '- Keine Änderungen an Geldformeln, Elterngeldanspruch, Speicherung oder öffentlichem Deployment.',
 '- Quellenbelege, Code-Hash und Fragebögen sind im Manifest mit SHA-256 nachprüfbar.',
 '- Eine formal vollständig aussehende Rückmeldung gilt bis zur menschlichen Echtheits-/Fachprüfung nur als **eingereicht, unbestätigt**.',
 ''
 ].join('\n');
 documents['01-MUTTERSCHUTZ-FACHANFRAGE.md']=[
 '# Konkrete Fachanfrage: vier oder fünf Elterngeld-Resttage?',
 '',
 '**Bitte an eine zuständige Elterngeldstelle/gesetzliche Krankenkasse sowie juristische Fachperson getrennt zur Prüfung geben. Hiermit wird keine Anfrage tatsächlich versendet.**',
 '',
 '## Vollständig synthetischer Sachverhalt',
 '',
 '- Geburt und errechneter Entbindungstermin: **20. Mai 2026** (identisch, kein Frühgeburts-/Mehrlings-/Behinderungssonderfall).',
 '- Normale nachgeburtliche Schutzfrist: **acht Wochen**.',
 '- Zweiter Lebensmonat: **20. Juni bis 19. Juli 2026**, 30 Kalendertage.',
 '- `§ 187 Abs. 1 BGB` / `§ 188 Abs. 2 BGB` und die NRW-KomNet-Kalenderbegründung rechnen ab **21. Mai** 56 Tage nach Geburt und ergeben als letzten Schutzfristtag den **15. Juli 2026**: vom **16. bis 19. Juli = vier Tage**.',
 '- Das Familienportal nennt für dasselbe Geburtsdatum als Ende der Mutterschaftsleistungen den **14. Juli** und erhält für **15. bis 19. Juli = fünf Tage**.',
 '- `§ 24i Abs. 3 SGB V` bezieht die Mutterschaftsgeldzahlung auf die Schutzfrist und zusätzlich den Entbindungstag. Beschäftigungsverbot, Mutterschaftsgeld und taggenaue BEEG-Anrechnung daher getrennt prüfen.',
 '',
 '## Originalquellen, live erneut recherchiert am '+preparedAt,
 '',
 '- [Bundesfamilienportal: tageweise Elterngeld-Anrechnung]('+SOURCE_URLS.federalExample+') – fünf Tage.',
 '- [NRW KomNet 4244: Fristberechnung nach §§ 187/188 BGB]('+SOURCE_URLS.NRW+') – Ereignistag wird nicht als Beginn gezählt.',
 '- [KBS-Mutterschutzrechner: Erläuterungen zum Geburtstag]('+SOURCE_URLS.KBS+') – Entbindungstag außerhalb der nachgeburtlichen Achtwochenfrist, aber Zuschuss für Geburtstag.',
 '- [§ 3 MuSchG]('+SOURCE_URLS.muschg+'), [§ 24i Abs. 3 SGB V]('+SOURCE_URLS.sgbv+').',
 '',
 '## Genau zu beantwortende Fachfragen',
 '',
 '1. **Welcher letzte Tag** der Schutzfrist und welcher letzte Tag der **Mutterschaftsgeld-/Arbeitgeberzuschussleistung** gilt im synthetischen Standardfall?',
 '2. Werden Mutterschaftsleistungen für **15. Juli 2026** gezahlt/angerechnet? Auf welche Norm oder Verwaltungsrichtlinie stützt sich die Entscheidung?',
 '3. Wie viele Tage des zweiten **BEEG-Lebensmonats** (20.06.–19.07.) sind tatsächlich anteilig Basiselterngeld zu berücksichtigen: **4 oder 5**? Bitte die Tagesgrenzen klar offenlegen.',
 '4. Welcher Rechenweg gilt für Einkommen/Mutterschaftsgeld von gesetzlichen und privaten Versicherungen, und wo wäre eine **Ausnahme** zu kennzeichnen?',
 '5. Ist das veröffentlichte Beispiel des Familienportals **verkürzt oder korrigierungsbedürftig**, oder übersehen die alternativen Auslegungen eine anspruchsrelevante Sonderregel?',
 '',
 '**Gewünschter Nachweis:** schriftliche, datierte Quellen-/Bescheidbegründung (ohne personenbezogene Daten) einer identifizierbaren zuständigen Fachstelle oder unabhängigen anerkannten Fachperson; Geltungsbereich und Normenstand nennen.',
 '',
 '**Bis dahin:** `UNRESOLVED_OFFICIAL_DISCREPANCY`; kein automatisches Umstellen von vier auf fünf oder umgekehrt; Produktfreigabe **NO-GO**.',
 ''
 ].join('\n');
 documents['02-ZEHN-FAMILIENFAELLE.md']=[
 '# Zehn unabhängig zu prüfende vollständige Familienfälle',
 '',
 'Die folgenden zehn **Anfragen** sind bislang **nicht** vollständig gegen amtliche Ergebnisse bestätigt. Verwendete Betragspunkte sind lediglich **synthetische Eingabevorgaben**, keine behördlich bestätigten Ergebnisse.',
 '',
 '| ID | Szenario | Elternteil 1 (synthetisches EG-Netto) | Elternteil 2 (synthetisches EG-Netto) | Externe Monats-Ergebnisse |',
 '|---|---|---:|---:|---|',
 ...caseRequests.cases.map(c=>'| `'+escapeMd(c.id)+'` | '+escapeMd(c.title)+
  ' | '+formatMoney(c.parents.father.preEgNetEuro)+' | '+formatMoney(c.parents.mother.preEgNetEuro)+
  ' | **FEHLT** |'),
 '',
 '## Was unabhängige Reviewer angeben müssen',
 '',
 '- Anwendbare **Geburtskohorte**, Geburtsdatum und ET, Eltern- und Versicherungs-/Beschäftigungsstatus.',
 '- Elterngeldrechtliches **Netto vor und nach Geburt je Elternteil** einschließlich exakt erklärter Bemessungsregeln; nicht mit dem realen Gehaltsauszahlungsnetto gleichsetzen.',
 '- Für jeden relevanten Lebensmonat: **Bezugsart, tatsächliche Wochenarbeitsstunden, Elternzeit, Mutterschaftsleistungen, Zwischenergebnisse und Beträge je Elternteil**, einschließlich Nullmonaten.',
 '- Gesamtbeträge, Abrundung/Tagesteile, Überschneidungsregeln, Geschwister-/Partnerschaftsbonus und datierte Sonderfallregeln.',
 '- **Unabhängig vom Programm** ermittelte Sollwerte samt amtlichem Bescheid, publiziertem Vollfall oder überprüfbarer Berechnungsherleitung. Nicht nur Formelauszüge oder Ein-Monats-Teilbeispiele.',
 '- Externe Stelle/Qualifikation und datierter Quellenstand. Ohne Identitäts-/Quellenkontrolle ist ein erhaltener Datensatz nur **eingereicht, nicht freigegeben**.',
 '',
 'Für spezielle Fälle können die bisherigen Schemadaten **unvollständig** sein. Reviewer dürfen keine fehlenden Eltern-/Versicherungsangaben erfinden; zuerst einen vollständigen synthetischen Eingabevertrag dokumentieren.',
 '',
 'Die technische Inbox bleibt `data/independent-review-evidence-v317.json` mit `submitted_unverified`-Status; kein automatischer Freigabewechsel.',
 ''
 ].join('\n');
 documents['03-ACHT-VERSTAENDNISFRAGEN.md']=[
 '# Acht synthetische Verständnisaufgaben – für Moderation **ohne Lösungen**',
 '',
 '**Hinweis:** Die Antworten sind bewusst aus diesem Teilnehmerbogen ausgelassen. Nicht als Prüfungsunterricht vorlesen; selbstständige Benutzung beobachten.',
 '',
 ...comprehensionTasks.flatMap((t,i)=>[
  '## '+(i+1)+'. '+escapeMd(t.topic)+' (`'+escapeMd(t.id)+'`)',
  '',escapeMd(t.scenario),'',escapeMd(t.question),'',
  ...t.choices.map((c,j)=>String.fromCharCode(65+j)+'. '+escapeMd(c.label)),
  '',
  '**Beobachtung (noch nicht ausgefüllt):** keine echte Testperson beobachtet.',
  ''
 ])
 ].join('\n');
 documents['04-PAKET3C-MANUELLE-ABNAHME.md']=[
 '# Paket 3C – echte Bedien- und Accessibility-Prüfung ausstehend',
 '',
 'Der nachfolgende Prüfauftrag wurde aus dem Repository-Stand '+commit+' abgeleitet. **Das ist kein Testbericht.**',
 '',
 sourceContents['docs/PAKET3C-NUTZER-A11Y-ABNAHME-2026-10-22.md'],
 ''
 ].join('\n');
 documents['05-MODERATOR-ANTWORTSCHLUESSEL.md']=[
 '# Nur für unabhängige Auswertung – **nicht an Teilnehmende vorab geben**',
 '',
 'Diese Antworten sind pädagogische Sollhypothesen, keine amtlichen Rechtsprüfungen und **keine echten Nutzertestergebnisse**.',
 '',
 ...comprehensionTasks.flatMap((t,i)=>[
  '## '+(i+1)+'. '+escapeMd(t.id),
  'Richtige pädagogische Option: `'+escapeMd(t.answer)+'`',
  'Begründung aus dem bisherigen Material: '+escapeMd(t.explanation),
  ''
 ]),
 'Die tatsächlichen beobachteten Aussagen müssen mit Einwilligung, Datenschutz- und Ethikfreigabe **separat** dokumentiert werden.',
 ''
 ].join('\n');
 documents['06-PROZESS-FREIGABEN.md']=[
 '# Abnahmen, die dieses Paket **nicht** erteilt',
 '',
 '| Tor | Status | Benötigte externe Handlung |',
 '|---|---|---|',
 '| Mutterschutz: 4/5 Tage | **OFFEN** | Datierte fachliche Beantwortung der expliziten Fünf-Fragen-Anfrage |',
 '| Unabhängige vollständige Familienfälle | **0/10** | Zehn vollständig nachvollziehbare, nicht aus der App stammende Berechnungen |',
 '| Verständlichkeit | **0 Beobachtungen** | Moderierte Testfälle mit synthetischen Datensätzen, verständliche Ergebnissprache |',
 '| Manuelle Barrierefreiheit | **0 Reviews** | NVDA+Firefox, VoiceOver+Safari, Fokus/Tabellen/Druck, echte Reviewer |',
 '| Rechtsstand 2027 | **OFFEN** | Aktuelle Fassungen inkl. Geltungs- und Übergangsregeln; kohortenspezifische Fachprüfung |',
 '| Datenschutz / Verantwortlicher | **OFFEN** | Operative Verarbeitung, Impressum, Rollen, Einwilligungen und Freigabe des konkreten Deployments |',
 '| Verantwortlicher Betreiber | **OFFEN** | Identifizierbarer schriftlicher Go/No-Go-Entscheid am genauen Commit/HTML-Hash |',
 '',
 'Diese Tabelle ist ein Aufgabenregister und darf **nicht** als positive Begutachtung oder Zertifikat dargestellt werden.',
 'Raw-Feedback aus echten Studien wird hier **nicht** gespeichert, es sei denn, Verantwortliche haben vorher einen eigenen Datenschutzprozess festgelegt.',
 ''
 ].join('\n');
 const observedTemplate={
  format:'external-review-sessions-template-v1',sourceCommit:commit,sourceHtmlSha256:hash(indexHtml),
  observationSessions:[],independentExpertReports:[],manualScreenreaderReports:[],
  privacyApproval:null,legalApproval:null,operatorDecision:null,
  publicReleaseApproved:false,reviewCompleted:false,note:'Vorlage. Keine realen Beobachtungen oder Freigaben.'
 };
 documents['07-LEERE-SESSION-VORLAGE.json']=JSON.stringify(observedTemplate,null,2)+'\n';
 documents['08-SYNTHETISCHE-FALLANFRAGEN.json']=JSON.stringify(caseRequests,null,2)+'\n';
 const files=Object.fromEntries(Object.entries(documents).map(([name,data])=>[name,data]));
 const sourceHashes=Object.fromEntries(evidenceKeys.map(key=>[key,hash(sourceContents[key])]));
 const manifest={
  format:'external-review-kit-v1',version:1,preparedAt,sourceCommit:commit,sourceHtmlSha256:hash(indexHtml),
  sourceFiles:sourceHashes,
  status:'PREPARED_NO_HUMAN_REVIEW',independentlyVerifiedFullFamilies:0,
  humanParticipantsObserved:0,actualScreenreaderReviews:0,
  expertApproval:false,legalApproval:false,privacyApproval:false,operatorApproval:false,
  publicReleaseApproved:false,modelOutputsUsedAsExternalExpectedValues:false,
  sourceCaseCount:10,comprehensionTaskCount:8,
  maternityCalendarWitness:witness,
  files:Object.fromEntries(Object.entries(files).map(([name,data])=>[name,{sha256:hash(data),bytes:Buffer.byteLength(data)}]))
 };
 return {manifest,files};
}
function verifyReviewKit({manifest,files}={}){
 if(!manifest||manifest.format!=='external-review-kit-v1'||manifest.version!==1||
   !COMMIT.test(manifest.sourceCommit)||!SHA256.test(manifest.sourceHtmlSha256)||
   !isValidDate(manifest.preparedAt)||manifest.status!=='PREPARED_NO_HUMAN_REVIEW'||
   manifest.independentlyVerifiedFullFamilies!==0||manifest.humanParticipantsObserved!==0||
   manifest.actualScreenreaderReviews!==0||manifest.expertApproval!==false||
   manifest.legalApproval!==false||manifest.privacyApproval!==false||
   manifest.operatorApproval!==false||manifest.publicReleaseApproved!==false||
   manifest.modelOutputsUsedAsExternalExpectedValues!==false||
   manifest.sourceCaseCount!==10||manifest.comprehensionTaskCount!==8||
   manifest.maternityCalendarWitness?.releaseApproved!==false||
   !files||Object.keys(files).length!==9||
   !manifest.files||Object.keys(manifest.files).length!==9)
  throw new TypeError('Review-Paket unvollständig oder täuscht externe Nachweise/Freigaben vor.');
 for(const [key,meta] of Object.entries(manifest.files)){
  if(!/^(0[0-8])-[A-Z0-9-]+\.(?:md|json)$/.test(key)||
   typeof files[key]!=='string'||!SHA256.test(meta.sha256)||
   Buffer.byteLength(files[key])!==meta.bytes||hash(files[key])!==meta.sha256)
   throw new TypeError('Reviewmaterial verändert oder fehlend: '+key);
 }
 const sessionTemplate=JSON.parse(files['07-LEERE-SESSION-VORLAGE.json']);
 if(sessionTemplate.observationSessions.length!==0||
  sessionTemplate.independentExpertReports.length!==0||
  sessionTemplate.manualScreenreaderReports.length!==0||
  sessionTemplate.reviewCompleted!==false||sessionTemplate.publicReleaseApproved!==false)
  throw new TypeError('Aus der Vorlage wurden ohne Nachweis angebliche Reviews.');
 return {
  status:'PREPARED_ONLY_NOT_REVIEWED',materials:Object.keys(files).length,
  independentlyVerifiedFullFamilies:0,participantsObserved:0,
  publicReleaseApproved:false
 };
}
module.exports={buildReviewKit,verifyReviewKit,maternityCalendarWitness,hash};
