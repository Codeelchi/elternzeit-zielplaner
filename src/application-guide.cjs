'use strict';
const time=require('./time-axes.cjs');
const CHECKED='2026-10-14';
const SOURCES={
  application:{url:'https://www.gesetze-im-internet.de/beeg/__7.html',verifiedAt:CHECKED,label:'BEEG § 7 – Antragstellung'},
  transition:{url:'https://www.gesetze-im-internet.de/beeg/__28.html',verifiedAt:CHECKED,label:'BEEG § 28 – Übergangsregelung'},
  leave:{url:'https://www.gesetze-im-internet.de/beeg/__16.html',verifiedAt:CHECKED,label:'BEEG § 16 – Elternzeit'},
  cologne:{url:'https://www.stadt-koeln.de/service/produkt/elterngeld',verifiedAt:CHECKED,label:'Stadt Köln – Elterngeld und Unterlagen'},
  nrw:{url:'https://familienportal.nrw/elterngeld',verifiedAt:CHECKED,label:'NRW – Elterngeldantrag'}
};
const REGIONS={NRW:{label:'Nordrhein-Westfalen',applicationUrl:SOURCES.nrw.url,cities:{'köln':{label:'Köln',authority:'Elterngeldstelle der Stadt Köln',authorityUrl:'https://www.stadt-koeln.de/service/adressen/elterngeldstelle',source:SOURCES.cologne}}}};
function subtractDays(date,n){return new Date(Date.parse(date+'T00:00:00Z')-n*86400000).toISOString().slice(0,10);}
function minusCalendarMonths(iso,months){
  time.lifeMonths(iso,1);
  if(!Number.isInteger(months)||months<0||months>36)throw new RangeError('Kalendermonate ungültig');
  const [y,m,day]=iso.split('-').map(Number),target=new Date(Date.UTC(y,m-1-months,1));
  const max=new Date(Date.UTC(target.getUTCFullYear(),target.getUTCMonth()+1,0)).getUTCDate();
  target.setUTCDate(Math.min(day,max));return target.toISOString().slice(0,10);
}
function allowanceReferenceDay(birthDate){time.lifeMonths(birthDate,1);return String(Number(birthDate.slice(0,4))-1)+'-01-01';}
function legislationEvent(registry,id){return registry?.events?.find(e=>e.id===id)||null;}

function buildApplicationGuide({birthDate,expectedBirthDate=birthDate,region='NRW',city='Köln',leavePeriods={},firstBenefitMonth=1,childcareStartLm=0,legalEvents=null}={}){
  const months=time.lifeMonths(birthDate,96);time.lifeMonths(expectedBirthDate,1);
  if(!Number.isInteger(firstBenefitMonth)||firstBenefitMonth<1||firstBenefitMonth>32)throw new RangeError('Erster Elterngeld-Lebensmonat ungültig.');
  const regional=REGIONS[region],local=regional?.cities[String(city).toLowerCase()];
  const tasks=[];
  for(const parent of ['father','mother'])for(const [index,p] of (leavePeriods[parent]||[]).entries()){
    time.lifeMonths(p.startDate,1);time.lifeMonths(p.endDate,1);
    if(p.endDate<p.startDate)throw new RangeError('Elternzeitende vor Beginn.');
    const thirdBirthday=months[36].startDate;
    if(p.endDate>months[95].endDate)throw new RangeError('Elternzeit außerhalb des unterstützten Achtjahreszeitraums.');
    // Notice for leave from birth is based on the expected birth date.
    const noticeStart=p.startDate===birthDate?expectedBirthDate:p.startDate;
    const weeks=p.startDate<thirdBirthday?7:13;
    tasks.push({id:`leave-${parent}-${index}`,parent,dueDate:subtractDays(noticeStart,weeks*7),title:`Elternzeitabschnitt ${index+1} beim Arbeitgeber anmelden`,description:`Mindestens ${weeks} Wochen vorher. Für Geburten ab 1. Mai 2025 Textform; frühere Geburten erfordern die Übergangsregel zur Schriftform. Vor dem dritten Geburtstag die Planung für den Bindungszeitraum von zwei Jahren erklären. Zugang bestätigen lassen.`,documents:['Beginn und Ende jedes Abschnitts','Planung des Zweijahres-Bindungszeitraums'],source:SOURCES.leave,additionalSources:[SOURCES.transition]});
  }
  // Filing during LM(first+3) still includes LM(first), per BEEG §7; this is not a general application cutoff.
  tasks.push({id:'elterngeld',dueDate:months[firstBenefitMonth+2].endDate,recommendedDate:months[firstBenefitMonth-1].startDate,title:'Elterngeldantrag bei der zuständigen Elterngeldstelle einreichen',description:`Früh nach der Geburt einreichen. Zur rückwirkenden Sicherung ab LM ${firstBenefitMonth} muss der Antrag spätestens bis Ende LM ${firstBenefitMonth+3} eingehen. Später bleiben jüngere Anspruchsmonate möglich. Zugang und Vollständigkeit bestätigen lassen.`,documents:['Geburtsurkunde – Ausfertigung zur Beantragung von Elterngeld','Gehaltsabrechnungen beider beantragenden Eltern für den maßgeblichen Bemessungszeitraum','Nachweis Krankenkasse über Mutterschaftsgeld und Arbeitgeberzuschuss','Teilzeitvereinbarung und erwartetes Einkommen während des Bezugs','Angaben zum zu versteuernden Einkommen im Kalenderjahr vor der Geburt','Unterschriften beziehungsweise bestätigtes zulässiges digitales Verfahren'],source:SOURCES.application});
  if(!Number.isInteger(childcareStartLm)||childcareStartLm<0||childcareStartLm>96)throw new RangeError('Kita-Lebensmonat muss zwischen 0 und 96 liegen');
  const kibiz=legislationEvent(legalEvents,'nrw-kibiz-2027');
  if(region==='NRW'&&childcareStartLm>0&&kibiz&&kibiz.status==='promulgated_future_effective'){
    const startDate=months[childcareStartLm-1].startDate;
    if(startDate>=kibiz.effective_from)tasks.push({
      id:'nrw-childcare-notice',dueDate:minusCalendarMonths(startDate,6),careStartDate:startDate,
      title:'NRW-Kita-Betreuungsbedarf beim Jugendamt anzeigen',
      description:'Nach § 5 KiBiz grundsätzlich spätestens sechs Kalendermonate vor dem geplanten Betreuungsbeginn in Textform den Bedarf, den gewünschten Umfang und die Betreuungsart anzeigen. Bei kurzfristigem Bedarf unverzüglich melden; örtliche Fristen/Verfahren prüfen. Die Bedarfsanzeige garantiert keinen Kita-Platz.',
      documents:['Gewünschter Betreuungsbeginn und Umfang','Betreuungsart (Kita/Tagespflege)','Eingangsbestätigung des Jugendamts'],
      source:{label:'KiBiz NRW § 5, Fassung ab 01.08.2027',url:kibiz.sources[0],verifiedAt:kibiz.observed_at},
      notice_type:'statutory_six_calendar_months',legal_status:kibiz.status
    });
  }
  const autoKind=legislationEvent(legalEvents,'kindergeld-automatic-2027-rollout');
  if(autoKind&&autoKind.status==='parliament_passed_implementation_conditional'&&birthDate>='2027-01-01')tasks.push({
    id:'kindergeld-payment-route',dueDate:null,
    title:'Kindergeld-Auszahlungsweg und Antragspflicht individuell prüfen',
    description:'2027 wird die antragslose Zahlung schrittweise eingeführt: zuerst weitere Kinder, erst gegen Jahresende voraussichtlich auch erste Kinder. Kein automatischer Anspruch auf antragslose Auszahlung allein wegen des Geburtsdatums. Bei unbekannten Daten/IBAN oder fehlendem Verfahren Familienkasse kontaktieren beziehungsweise Antrag stellen.',
    documents:['Steuer-ID des Kindes','Bankverbindung für Kindergeld','Nachweis bzw. Familienkassenmitteilung zur Zuständigkeit'],
    source:{label:'Bundesregierung – Kindergeld ohne Antrag',url:autoKind.sources[0],verifiedAt:autoKind.observed_at},
    legal_status:autoKind.status
  });
  if(local)tasks.push({id:'local-documents',dueDate:null,title:'Kölner Unterlagen und aktuellen Übermittlungsweg prüfen',description:'NRW-Onlineantrag und BundID nutzen oder Papierverfahren prüfen. Die Stadt beschreibt eine unterschriebene Unterschriftsseite und spezielle Geburtsurkunde im Original; aktuelle Anforderungen vor Versand bestätigen.',documents:['Aktuelle NRW-Antragsformulare','Unterschriftsseite und örtlich geforderte Nachweise'],source:local.source});
  return {birthDate,expectedBirthDate,region,city,elterngeldEmployeeAllowanceReferenceDay:allowanceReferenceDay(birthDate),verifiedAt:CHECKED,legalCoverage:{validFrom:'2025-05-01',verifiedThrough:CHECKED,futureBirthRequiresRecheck:birthDate>CHECKED},authority:local?{name:local.authority,url:local.authorityUrl}:null,applicationUrl:regional?.applicationUrl||null,tasks:tasks.sort((a,b)=>(a.dueDate||'9999').localeCompare(b.dueDate||'9999')),regionalBenefitsIncluded:[],warnings:[
    'Checkliste für den Standardfall; keine Rechtsberatung und kein behördlicher Antrag.',
    ...(birthDate>CHECKED?['Geburt nach dem Prüfdatum: Regeln und Formulare vor Anmeldung und Antrag erneut amtlich prüfen.']:[]),
    ...(!local?['Zuständige örtliche Elterngeldstelle eigenständig bestätigen; regionale Vertiefung derzeit nur Köln.']:[]),
    'Kommunale Seite enthält historische Beispiele; deren Beträge und veraltete Nachweisjahre werden nicht in Berechnungen übernommen.',
    'Keine regionale Zusatzleistung ohne bestätigten individuellen Anspruch in der Haushaltsrechnung.'
  ]};
}
module.exports={buildApplicationGuide,minusCalendarMonths,allowanceReferenceDay,REGIONS,SOURCES};
