'use strict';

// Synthetic educational scenarios. Never derives answers from a real family
// profile, never changes benefits, and never counts a tutorial as a user study.
const TASKS=[
 {
  id:'cohort-2027',topic:'Geltungsbereich',
  scenario:'Eine Familie plant mit Geburt im Mai 2027. Der geprüfte Standard-Regelkatalog reicht bisher nur bis zum 31. Dezember 2026.',
  question:'Was bedeutet eine Zahl aus dem Planer für 2027?',
  choices:[
   {id:'approved',label:'Sie ist bereits rechtlich geprüft und verbindlich.'},
   {id:'forecast',label:'Sie ist nur eine unverbindliche Vorschau; die anwendbaren Regeln müssen geprüft werden.'},
   {id:'zero',label:'Für 2027 wird automatisch kein Elterngeld ausgezahlt.'}
  ],
  answer:'forecast',
  explanation:'Die Geburtskohorte 2027 ist in diesem Stand nicht fachlich bestätigt. Die Vorschau sagt weder einen Anspruch noch einen Nullanspruch aus.'
 },
 {
  id:'net-types',topic:'Einkommensbegriffe',
  scenario:'Auf der Gehaltsabrechnung stehen 2.600 € Auszahlungsnetto. Für die Planung wird zusätzlich nach dem Elterngeld-Netto gefragt.',
  question:'Was darf man daraus schließen?',
  choices:[
   {id:'same',label:'Beide Netto-Werte sind zwingend identisch.'},
   {id:'external',label:'Das Elterngeld-Netto wird gesondert ermittelt und ist hier nicht automatisch aus Brutto berechnet.'},
   {id:'payment',label:'2.600 € ist bereits der bewilligte Elterngeldbetrag.'}
  ],
  answer:'external',
  explanation:'Gehalts-Auszahlungsnetto, elterngeldrechtlicher Bemessungswert und bewilligter Elterngeldbetrag sind unterschiedliche Begriffe. Eine externe Angabe wird vom Planer nicht authentifiziert.'
 },
 {
  id:'life-calendar',topic:'Zeitachsen',
  scenario:'Der Planer zeigt 1.200 € modellierten Elterngeldanspruch für einen Lebensmonat des Kindes.',
  question:'Ist damit ein Geldeingang im gleichen Kalendermonat sicher?',
  choices:[
   {id:'yes',label:'Ja, weil Lebens- und Kalendermonat immer gleich lang sind.'},
   {id:'no',label:'Nein. Der Lebensmonat beschreibt den Bezugszeitraum, nicht den tatsächlichen Überweisungstag.'},
   {id:'tomorrow',label:'Ja, spätestens am zweiten Tag des Lebensmonats.'}
  ],
  answer:'no',
  explanation:'Ein modellierter Anspruch ist kein Kontoeingang. Kalenderzeitpunkte müssen ausdrücklich geplant, tatsächliche Buchungen separat erfasst werden.'
 },
 {
  id:'expected-recorded',topic:'Zahlung und Bank',
  scenario:'Für den 6. des Monats sind 1.200 € als erwartete Zahlung eingetragen. In den tatsächlichen Buchungen steht nichts.',
  question:'Was zeigt der Bankbereich?',
  choices:[
   {id:'booked',label:'Eine bestätigte Zahlung von 1.200 €.'},
   {id:'overdue',label:'Eine verbindlich festgestellte Zahlungsverzögerung.'},
   {id:'unknown',label:'Keine erfasste tatsächliche Buchung; die erwartete Zahlung bleibt nur eine Annahme.'}
  ],
  answer:'unknown',
  explanation:'Erwartete Zahlungen und tatsächlich erfasste Buchungen dürfen nicht doppelt gezählt oder als identisch bezeichnet werden.'
 },
 {
  id:'unknown-expenses',topic:'Haushaltsbudget',
  scenario:'Im Modell sind 4.200 € Familieneinkommen eingetragen, aber die Haushaltsausgaben fehlen.',
  question:'Wie viel bleibt nach Kosten zuverlässig übrig?',
  choices:[
   {id:'all',label:'4.200 €, denn nicht eingegebene Kosten sind null.'},
   {id:'unknown',label:'Das ist ohne Ausgabenannahme nicht bestimmbar.'},
   {id:'half',label:'Genau 2.100 €, denn das Modell rechnet automatisch mit der Hälfte.'}
  ],
  answer:'unknown',
  explanation:'Unbekannt ist nicht gleich null. Ein Monatsrest nach Kosten darf ohne angegebene Kosten nicht als verfügbarer Betrag erscheinen.'
 },
 {
  id:'maternity-dispute',topic:'Offene Fachfrage',
  scenario:'Beim Beispiel zur nachgeburtlichen Mutterschutzanrechnung kommt die Portalreferenz auf fünf, die dokumentierte Frist-Herleitung auf vier Resttage.',
  question:'Was ist für eure Entscheidung die verlässliche Aussage?',
  choices:[
   {id:'portal',label:'Das Portalbeispiel beweist allein die Freigabe aller Ergebnisse.'},
   {id:'code',label:'Die Programmherleitung beweist allein, dass das Portal falsch ist.'},
   {id:'review',label:'Der Widerspruch ist ungeklärt und muss unabhängig fachlich geprüft werden.'}
  ],
  answer:'review',
  explanation:'Schutzfrist, Mutterschaftsleistung und Elterngeldanrechnung sind getrennt zu prüfen. Die App hat dafür keine unabhängige Abnahme.'
 },
 {
  id:'limited-search',topic:'Zielsuche',
  scenario:'Der Zielplaner vergleicht viele Kandidaten und zeigt die bestbewertete gefundene Variante.',
  question:'Was ist damit nachgewiesen?',
  choices:[
   {id:'global',label:'Dass keine andere zulässige Kombination besser sein kann.'},
   {id:'limited',label:'Dass diese Variante unter den tatsächlich untersuchten Kandidaten gut abschneidet.'},
   {id:'approved',label:'Dass eine Behörde die Aufteilung genehmigt hat.'}
  ],
  answer:'limited',
  explanation:'Die Suchabdeckung ist begrenzt. Ein mathematisch globales Optimum oder ein amtlicher Anspruch wird nicht zugesagt.'
 },
 {
  id:'local-and-export',topic:'Speichern und Datenschutz',
  scenario:'Ein Familienplan wird auf einem gemeinsam genutzten Gerät gespeichert. Ein JSON wird zusätzlich heruntergeladen; neue Kita-Wochenannahmen wurden nur im Sitzungsbereich eingetragen.',
  question:'Welche Aussage ist richtig?',
  choices:[
   {id:'encrypted',label:'Alle gespeicherten Werte sind automatisch verschlüsselt und sämtliche Wochenannahmen werden exportiert.'},
   {id:'safe',label:'Lokaler Speicher ist optional und unverschlüsselt; Downloads können sensible Daten enthalten, flüchtige Wochenannahmen fehlen im Hauptplanexport.'},
   {id:'deleted',label:'Beim Löschen des Browserplans verschwinden automatisch sämtliche Downloads.'}
  ],
  answer:'safe',
  explanation:'Auf gemeinsam genutzten Geräten sollten eigene Finanzdaten nicht unnötig persistent gespeichert werden. Downloads müssen getrennt gelöscht werden.'
 }
];
const IDS=new Set(TASKS.map(t=>t.id));
if(IDS.size!==TASKS.length||TASKS.length!==8)throw new Error('Verständnisaufgaben müssen acht eindeutige IDs besitzen.');
for(const item of TASKS){
 if(item.choices.length!==3||new Set(item.choices.map(c=>c.id)).size!==3||
   !item.choices.some(c=>c.id===item.answer))throw new Error('Ungültige synthetische Aufgabe: '+item.id);
}
function getUnderstandingTasks(){
 return TASKS.map(t=>({...t,choices:t.choices.map(c=>({...c}))}));
}
function assessUnderstandingAnswer(taskId,choiceId){
 const item=TASKS.find(t=>t.id===taskId);
 if(!item||typeof choiceId!=='string'||!item.choices.some(c=>c.id===choiceId))
  throw new RangeError('Unbekannte Verständnisaufgabe oder Antwort.');
 return {taskId,selected:choiceId,understandingMatch:choiceId===item.answer,
  suggestedAnswer:item.answer,explanation:item.explanation,
  humanStudyCompleted:false,officialAnswerCertified:false};
}
module.exports={getUnderstandingTasks,assessUnderstandingAnswer};
