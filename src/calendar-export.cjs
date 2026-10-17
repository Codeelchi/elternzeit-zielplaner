'use strict';
const DAY=86400000;
function isoDay(date){
 if(typeof date!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(date))return false;
 const t=new Date(date+'T00:00:00.000Z');
 return Number.isFinite(t.valueOf())&&t.toISOString().slice(0,10)===date;
}
function icalEscape(value){
 return String(value??'').replace(/\\/g,'\\\\').replace(/\r\n?|\n/g,'\\n').replace(/;/g,'\\;').replace(/,/g,'\\,');
}
function fold(text){
 const encoder=new TextEncoder(),lines=[];
 let part='';
 for(const char of text){
  if(encoder.encode(part+char).length>75){
   if(!part)throw new RangeError('Ungültiges Kalenderfeld.');
   lines.push(part);
   part=' '+char;
  }else part+=char;
 }
 if(part)lines.push(part);
 return lines.join('\r\n');
}
function calendarTaskExport(tasks,{generatedAt='2026-10-17T00:00:00.000Z'}={}){
 if(!Array.isArray(tasks)||tasks.length>80)throw new RangeError('Zu viele Fristen oder keine Aufgabenliste.');
 const stamp=new Date(generatedAt);
 if(!Number.isFinite(stamp.valueOf()))throw new RangeError('Ungültiges Erstellungsdatum.');
 const time=stamp.toISOString().replace(/[-:]/g,'').replace(/\.\d{3}Z$/,'Z');
 const seen=new Set(),lines=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Elternzeit-Zielplaner//V3 Kalender Export//DE',
  'CALSCALE:GREGORIAN','METHOD:PUBLISH','X-WR-CALNAME:Elternzeit-Fristen prüfen'];
 let included=0;
 for(const task of tasks){
  if(!task||typeof task!=='object'||!task.id||typeof task.id!=='string'||!task.title)throw new TypeError('Ungültige Checklistenaufgabe.');
  if(!task.dueDate)continue;
  if(!isoDay(task.dueDate))throw new RangeError('Ungültiger Fristtag.');
  if(seen.has(task.id))throw new RangeError('Doppelte Aufgabenkennung.');
  seen.add(task.id);
  const start=task.dueDate.replace(/-/g,'');
  const end=new Date(Date.parse(task.dueDate+'T00:00:00.000Z')+DAY).toISOString().slice(0,10).replace(/-/g,'');
  const uid=task.id.replace(/[^A-Za-z0-9_-]/g,'-').slice(0,65)+'-'+start+'@elternzeitplaner.invalid';
  const desc='Nur vorläufige Checklistenorientierung. Frist, Rechtslage und Antragsweg selbst bei der zuständigen Stelle bestätigen. '+
   (task.description||'')+' Quelle: '+(task.source?.url||'');
  const records=['BEGIN:VEVENT','UID:'+uid,'DTSTAMP:'+time,'DTSTART;VALUE=DATE:'+start,
   'DTEND;VALUE=DATE:'+end,'SUMMARY:'+icalEscape('Frist prüfen: '+task.title),
   'DESCRIPTION:'+icalEscape(desc),'STATUS:TENTATIVE','TRANSP:TRANSPARENT','END:VEVENT'];
  for(const r of records)lines.push(fold(r));
  included++;
 }
 lines.push('END:VCALENDAR');
 return {mime:'text/calendar;charset=utf-8',name:'Elternzeit_Fristen_unverbindlich.ics',content:lines.join('\r\n')+'\r\n',included,hasLegalApproval:false};
}
module.exports={calendarTaskExport,icalEscape,fold};
