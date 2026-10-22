'use strict';

// Presentation-only, privacy-preserving print/task projection using the already
// evaluated monthly model and the existing source-dated application guide.
// No entitlement, due-date, calendar, banking, or official-decision rules here.
const {buildFamilyView}=require('./family-overview.cjs');

const TASK_STATES=new Set(['open','ready','done']);
const MAX_PRINT_TASKS=6;
function date(value,label) {
 if(typeof value!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(value))
  throw new RangeError(label+': Datum YYYY-MM-DD erforderlich.');
 const parsed=new Date(value+'T00:00:00Z');
 if(!Number.isFinite(parsed.getTime())||parsed.toISOString().slice(0,10)!==value)
  throw new RangeError(label+': kein gültiges Datum.');
 return value;
}
function finiteAmount(value,label){
 if(typeof value!=='number'||!Number.isFinite(value)||value<0||value>1e9)
  throw new RangeError(label+': gültiger Betrag erforderlich.');
 return value;
}
function taskGroup(task,birthDate){
 if(/^nrw-childcare-/.test(task.id))return 'Betreuung und Kita';
 if(/^leave-/.test(task.id)&&task.dueDate&&task.dueDate<birthDate)return 'Vor der Geburt';
 return 'Nach der Geburt / laufende Anträge';
}
function prepareTasks(guide,taskStatuses={}) {
 if(!guide||!Array.isArray(guide.tasks)||guide.tasks.length>80)throw new TypeError('Amtlich hergeleitete Checklistenaufgaben fehlen.');
 date(guide.birthDate,'Geburtsdatum der Checkliste');
 date(guide.verifiedAt,'Prüfstand der Checkliste');
 if(!taskStatuses||typeof taskStatuses!=='object'||Array.isArray(taskStatuses))
  throw new TypeError('Aufgabenstatus muss ein Objekt sein.');
 const seen=new Set();
 const tasks=guide.tasks.map((task,i)=>{
  if(!task||typeof task.id!=='string'||!/^[a-z0-9-]{2,90}$/.test(task.id)||seen.has(task.id))
   throw new RangeError('Ungültige oder doppelte Aufgabenkennung.');
  seen.add(task.id);
  if(typeof task.title!=='string'||!task.title.trim()||task.title.length>180)throw new RangeError('Aufgabentitel fehlt oder ist zu lang.');
  if(!task.source||typeof task.source.label!=='string'||typeof task.source.url!=='string'||
     !/^https:\/\/[^\s/]+(?:\/[^\s]*)?$/.test(task.source.url))
   throw new RangeError('Aufgabe ohne nachprüfbare HTTPS-Quelle.');
  if(task.dueDate!==null&&task.dueDate!==undefined)date(task.dueDate,'Aufgabendatum');
  const status=taskStatuses[task.id]??'open';
  if(!TASK_STATES.has(status))throw new RangeError('Ungültiger Aufgabenstatus.');
  return {
   id:task.id,title:task.title,dueDate:task.dueDate??null,status,
   source:{label:task.source.label,url:task.source.url,verifiedAt:task.source.verifiedAt??guide.verifiedAt},
   documents:Array.isArray(task.documents)?task.documents.filter(x=>typeof x==='string').slice(0,5):[],
   group:taskGroup(task,guide.birthDate),
   legalStatus:task.legal_status??null,ordinal:i,
   note:'Eigene Planungshilfe; Termin und rechtliche Anwendbarkeit persönlich prüfen'
  };
 });
 // Existing guide is already dated/sorted. Group and display without inventing
 // "today"/overdue judgments or any obligation not stated in that guide.
 return {
  birthDate:guide.birthDate,verifiedAt:guide.verifiedAt,
  needsRecheck:!!guide.legalCoverage?.futureBirthRequiresRecheck,
  authority:guide.authority?.name||null,warnings:[...(guide.warnings||[])],
  counts:{total:tasks.length,open:tasks.filter(t=>t.status==='open').length,
   ready:tasks.filter(t=>t.status==='ready').length,done:tasks.filter(t=>t.status==='done').length},
  tasks
 };
}
function makePrintSummary({
 rows,horizon,birthDate,modelLabel='Ungeprüfter Modellplan',
 childcareStartLm=0,expenses=null,validationStatus='NICHT_UNTERSTUETZT',
 guide=null,taskStatuses={},example=false
}={}){
 date(birthDate,'Geburtsdatum');
 if(typeof modelLabel!=='string'||modelLabel.length>120)throw new RangeError('Ungültige Modellbezeichnung.');
 if(typeof example!=='boolean')throw new TypeError('Beispielstatus ungültig.');
 const known=expenses!==null;
 if(known)finiteAmount(expenses,'Haushaltsausgaben');
 const family=buildFamilyView({rows,horizon,childcareStartLm,expensesKnown:known,validationStatus});
 let taskView=null,taskError=null;
 if(guide!==null){
  try {
   if(guide.birthDate!==birthDate)throw new RangeError('Abweichendes Geburtsdatum der Checkliste.');
   taskView=prepareTasks(guide,taskStatuses);
  } catch(error){taskError='Quellen-Checkliste für diesen Entwurf nicht belastbar: '+error.message;}
 }else taskError='Quellen-Checkliste für diese Eingaben nicht verfügbar. Termine nicht ableitbar.';
 const bins=[];
 for(let from=1;from<=horizon;from+=6){
  const entries=family.months.slice(from-1,Math.min(from+5,horizon));
  const income=entries.reduce((a,x)=>a+x.income,0);
  const rest=known?entries.reduce((a,x)=>a+x.available,0):null;
  bins.push({from,to:entries.at(-1).lm,income,rest,
   firstHome:entries.filter(x=>x.first.availability==='at-home').length,
   secondHome:entries.filter(x=>x.second.availability==='at-home').length,
   careFirstMissing:entries.find(x=>x.care==='not-documented')?.lm??null});
 }
 const priorityTasks=taskView?.tasks.filter(t=>t.status!=='done')||[];
 const printableTasks=priorityTasks.slice(0,MAX_PRINT_TASKS);
 const restTaskCount=priorityTasks.length-printableTasks.length;
 return {
  type:example?'Fiktives Testbeispiel':'Eigener ungeprüfter Entwurf',birthDate,modelLabel,
  horizon,expensesKnown:known,expenses,validationStatus,
  family,bins,taskView,taskError,printableTasks,restTaskCount,
  checklistVerifiedAt:taskView?.verifiedAt??null,
  warnings:[
   'Dieser Ausdruck ist eine unverbindliche lokale Modellübersicht; keine amtliche Berechnung, kein Bewilligungsbescheid und kein Zahlungsnachweis.',
   'Einnahmen sind geschätzte Lebensmonatsbeträge VOR Haushalts- und Kita-Kosten; Restsummen nur bei ausdrücklich angegebenen Haushaltsausgaben.',
   'Die Kita-Zuordnung ist eine Annahme, keine Platzzusage. Vollständige Betreuungsstunden, rechtliche Elternzeittage und Zahlungstermine werden hier nicht bestätigt.',
   'Für 2027, Sonderfälle und offene Mutterschutz-Teilmonatsfragen sind aktuelle Fachquellen und eine unabhängige Prüfung erforderlich.',
   'Datierte Aufgaben basieren ausschließlich auf der vorhandenen Quellen-Checkliste. Selbst erledigt bedeutet nicht behördlich bestätigt.'
  ]
 };
}
module.exports={prepareTasks,makePrintSummary,MAX_PRINT_TASKS};
