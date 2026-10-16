'use strict';
const time = require('./time-axes.cjs');
const VERIFIED_AT = '2026-10-16';
const source = (label, url) => ({label, url, verifiedAt: VERIFIED_AT});
const SOURCES = {
  months: source('BEEG § 4 Absatz 2 – Lebensmonate', 'https://www.gesetze-im-internet.de/beeg/__4.html'),
  net: source('Familienportal – Elterngeld-Netto', 'https://familienportal.de/familienportal/familienleistungen/elterngeld/faq/wie-wird-das-elterngeld-netto-berechnet--124606'),
  partTime: source('Familienportal – Teilzeitarbeit und Elterngeld', 'https://familienportal.de/familienportal/familienleistungen/elterngeld/arbeitssituation/darf-ich-teilzeit-arbeiten-waehrend-ich-elterngeld-beziehe--124622'),
  tax: source('EStG § 32b Absatz 1 Nummer 1 Buchstabe j – Progressionsvorbehalt', 'https://www.gesetze-im-internet.de/estg/__32b.html'),
  insurance: source('Familienportal – Krankenversicherung während des Elterngeldbezugs', 'https://familienportal.de/familienportal/familienleistungen/elterngeld/faq/wie-bin-ich-krankenversichert-waehrend-ich-elterngeld-bekomme--124738'),
  application: source('BEEG § 7 Absatz 1 – rückwirkender Bezug', 'https://www.gesetze-im-internet.de/beeg/__7.html'),
  leave: source('BEEG § 16 Absatz 1 – Anmeldung der Elternzeit', 'https://www.gesetze-im-internet.de/beeg/__16.html'),
  transition: source('BEEG § 28 – Geburtskohorten und Übergangsrecht', 'https://www.gesetze-im-internet.de/beeg/__28.html'),
  leavePortal: source('Familienportal – Elternzeit anmelden', 'https://familienportal.de/familienportal/familienleistungen/elternzeit/faq/wann-und-wie-muss-ich-elternzeit-beantragen--124810'),
  childcare: source('Familienportal NRW – Tipps für den Kita-Start', 'https://www.familienportal.nrw/de/1-bis-3-jahre/betreuung-bildung/tipps-fuer-den-kita-start')
};
const CARDS = [
  {id:'life-months', category:'zeitplanung', title:'Lebensmonat ist nicht Kalendermonat', priority:100,
    summary:'Elterngeld wird für Lebensmonate des Kindes geplant. Lohn, Miete und Kontoauszüge folgen häufig Kalendermonaten. Diese Zeiträume können auseinanderfallen.',
    action:'Arbeitsbeginn und Leistungsmonate anhand des konkreten Geburtsdatums abstimmen. Der errechnete Leistungsanspruch sagt noch keinen Bankeingang voraus.',
    sources:[SOURCES.months], validFrom:null, scope:'Allgemeine Einordnung; konkrete Datumsgrenzen aus der Zeitachsenengine.'},
  {id:'income-basis', category:'einkommen', title:'Drei verschiedene Nettozahlen auseinanderhalten', priority:95,
    summary:'Das ausgezahlte Gehaltsnetto ist nicht automatisch das Elterngeld-Netto. Die Elterngeldstelle leitet ihr Netto mit pauschalierten Abzügen aus dem berücksichtigungsfähigen Brutto ab. Auch das erwartete Teilzeitnetto ist eine eigene Angabe.',
    action:'Werte aus einer verlässlichen Berechnung oder einem Bescheid übernehmen und ihre Herkunft kennzeichnen. Schätzwerte als Bandbreite vergleichen; dieser Planer ersetzt keine vollständige Lohnabrechnung.',
    sources:[SOURCES.net], validFrom:null, scope:'Erläuterung zur manuellen Eingabe; keine eigenständige Brutto-Netto-Berechnung.'},
  {id:'tax-reserve', category:'budget', title:'Steuerliche Nachwirkungen als Rücklage mitdenken', priority:80,
    summary:'Elterngeld unterliegt dem Progressionsvorbehalt: Es kann den Steuersatz auf das übrige steuerpflichtige Einkommen erhöhen. Eine Nachzahlung hängt von der gesamten steuerlichen Situation ab.',
    action:'Für den Jahresabschluss einen individuell geprüften Steuerpuffer einplanen. Die Szenarien berechnen keine persönliche Einkommensteuer und enthalten keinen automatisch angesetzten Steuerabzug.',
    sources:[SOURCES.tax], validFrom:null, scope:'Allgemeiner Steuerhinweis; keine individuelle Steuerberatung.'},
  {id:'insurance', category:'budget', title:'Krankenversicherung vor der Auszeit klären', priority:75,
    summary:'Beiträge hängen vom Versicherungsstatus und weiteren Einnahmen ab. Pflichtversicherte ohne weitere Einnahmen sind während des Elterngeldbezugs in der Regel beitragsfrei; für freiwillig oder privat Versicherte können weiterhin Beiträge anfallen.',
    action:'Den individuellen Beitrag einschließlich Pflegeversicherung und Zeiträumen ohne Elterngeld bei der Versicherung erfragen. Nicht bereits im Netto enthaltene Kosten einmalig als Haushaltsausgabe eintragen; der Planer berechnet sie nicht automatisch.',
    sources:[SOURCES.insurance], validFrom:null, scope:'Keine Zusage zur Beitragsfreiheit; individuelle Versicherungskonstellation prüfen.'},
  {id:'application-retroactivity', category:'antrag', title:'Elterngeld früh beantragen – Zugang zählt', priority:65,
    summary:'Elterngeld kann nach der Geburt beantragt werden. Rückwirkend werden höchstens die drei Lebensmonate vor dem Lebensmonat des Antragseingangs erfasst. Die Empfehlung, innerhalb der ersten drei Lebensmonate einzureichen, ist keine allgemeine Ausschlussfrist für alle späteren Anspruchsmonate.',
    action:'Früh einreichen und den Eingang dokumentieren. Die datierte Antragscheckliste berechnet die Sicherung des gewünschten ersten Bezugsmonats; sie ersetzt keine Einreichung.',
    sources:[SOURCES.application], validFrom:null, scope:'Ergänzt die bestehende Antragscheckliste; berechnet selbst keine Frist.'},
  {id:'leave-notice', category:'antrag', title:'Elternzeit beim Arbeitgeber ist ein eigener Schritt', priority:60,
    summary:'Elternzeit und Elterngeld werden getrennt erklärt beziehungsweise beantragt. Für Geburten ab 1. Mai 2025 gilt bei der Elternzeitanmeldung Textform, etwa E-Mail. Für frühere Geburten ist das Übergangsrecht zur Schriftform zu beachten.',
    action:'Regulär sieben Wochen vor Elternzeit bis zum dritten Geburtstag, danach 13 Wochen vorher anmelden; vor dem dritten Geburtstag den Zweijahres-Bindungszeitraum mit erklären. Sonderfälle und den Zugang beim Arbeitgeber prüfen. Individuelle Daten stehen in der Antragscheckliste.',
    sources:[SOURCES.leave,SOURCES.transition,SOURCES.leavePortal], validFrom:'2025-05-01', scope:'Textform-Aussage für Geburten ab 01.05.2025; frühere Geburten separat prüfen.'},
  {id:'part-time-estimate', category:'einkommen', title:'Teilzeit verändert Lohn und Elterngeld gemeinsam', priority:90,
    summary:'Weniger Arbeitsstunden bedeuten nicht zwingend denselben prozentualen Rückgang des Nettolohns. Einkommen während des Bezugs beeinflusst auch die Leistung; ElterngeldPlus kann bei Teilzeit besonders interessant sein.',
    action:'Teilzeitnetto bei der Lohnbuchhaltung oder mit einem geeigneten Lohnrechner prüfen. Tatsächliche Stunden und Einnahmen der Elterngeldstelle mitteilen; Änderungen können eine Neuberechnung und Rückzahlung auslösen. Eine pauschale Stundenquote bleibt eine Schätzung.',
    sources:[SOURCES.partTime,SOURCES.net], validFrom:'2021-09-01', scope:'Teilzeithinweis für Geburten ab September 2021; keine Anspruchsgarantie.'},
  {id:'childcare-settling-in', category:'betreuung', title:'Kita-Start und voller Wiedereinstieg sind zwei Termine', priority:85,
    summary:'Die Eingewöhnung baut die Beziehung zwischen Kind, Familie und Betreuungspersonal schrittweise auf. Dauer und Ablauf richten sich nach dem Kind und dem Konzept der Einrichtung; ein fixes Standardintervall wird hier nicht zugesagt.',
    action:'Begleitung und zeitlichen Puffer mit der Einrichtung vereinbaren. Vollzeitige Verfügbarkeit nicht schon am ersten Kita-Tag annehmen; Gebühren, Verpflegung und mögliche Überbrückung separat im Budget prüfen.',
    sources:[SOURCES.childcare], validFrom:null, scope:'Pädagogischer Planungshinweis aus NRW; keine Platzgarantie und keine kommunale Gebührenberechnung.'}
];
function freeze(value) {if(value && typeof value==='object'){Object.values(value).forEach(freeze);Object.freeze(value);}return value;}
const DATA = freeze({version:'3.10.0',verifiedAt:VERIFIED_AT,cards:CARDS});

/** Pure, local guidance selection. No storage, requests, deadlines or budget mutations. */
function selectPlanningKnowledge({birthDate=null,region='NRW',city='Köln',partTime=false,childcareStartLm=0,incomeEntryMode='estimate',insuranceStatus='unknown',limit=6}={}) {
  if(birthDate!==null)time.lifeMonths(birthDate,1);
  if(typeof region!=='string'||typeof city!=='string')throw new TypeError('Region und Ort müssen Text sein.');
  if(typeof partTime!=='boolean')throw new TypeError('Teilzeit muss wahr oder falsch sein.');
  if(!Number.isInteger(childcareStartLm)||childcareStartLm<0||childcareStartLm>96)throw new RangeError('Kita-Lebensmonat muss zwischen 0 und 96 liegen.');
  if(!['estimate','known','official'].includes(incomeEntryMode))throw new RangeError('Unbekannte Herkunft der Einkommensangabe.');
  if(!['unknown','statutory','voluntary','private'].includes(insuranceStatus))throw new RangeError('Unbekannter Versicherungsstatus.');
  if(!Number.isInteger(limit)||limit<1||limit>12)throw new RangeError('Anzahl Hinweise muss zwischen 1 und 12 liegen.');
  const futureBirthRequiresRecheck=birthDate!==null && birthDate>VERIFIED_AT;
  const eligible=DATA.cards.filter(c=>c.id!=='part-time-estimate'||partTime).filter(c=>c.id!=='childcare-settling-in'||childcareStartLm>0);
  const ordered=eligible.map((c,index)=>({c,index,score:c.priority+(c.id==='insurance'&&['private','voluntary'].includes(insuranceStatus)?20:0)})).sort((a,b)=>b.score-a.score||a.index-b.index);
  const cards=ordered.slice(0,limit).map(({c})=>{
    const {priority,...card}=JSON.parse(JSON.stringify(c));
    card.validity={validFrom:card.validFrom,verifiedThrough:VERIFIED_AT,futureBirthRequiresRecheck,scope:card.scope};
    delete card.validFrom; delete card.scope;
    if(card.id==='life-months'&&birthDate){const m=time.lifeMonths(birthDate,1)[0];card.example={label:'Erster Lebensmonat in deiner Planung',startDate:m.startDate,endDate:m.endDate};}
    if(card.id==='income-basis')card.context={incomeEntryMode};
    if(card.id==='leave-notice')card.context={form:birthDate===null?'Geburtsdatum fehlt':birthDate>='2025-05-01'?'Textform':'Frühere Geburtskohorte: Schriftform/Übergangsrecht prüfen'};
    return card;
  });
  return {version:DATA.version,verifiedAt:VERIFIED_AT,coverage:{region,city,futureBirthRequiresRecheck,notAnEligibilityCheck:true},cards,totalEligible:eligible.length,omittedCount:eligible.length-cards.length,budgetEffects:[],warnings:[
    'Orientierung für die Planung; keine Rechts-, Steuer- oder Versicherungsberatung und keine Anspruchsprüfung.',
    ...(birthDate===null?['Ohne Geburtsdatum sind Kohorte und konkrete Lebensmonatsdaten nicht geprüft.']:[]),
    ...(futureBirthRequiresRecheck?['Geburt nach dem Quellenprüfdatum: Rechtslage und Verfahren vor Nutzung erneut amtlich prüfen; keine pauschale Bestätigung für 2027.']:[])
  ]};
}
module.exports={DATA,SOURCES,selectPlanningKnowledge};
