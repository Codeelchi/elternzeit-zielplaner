import test from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const {makePrintSummary,prepareTasks,plainText,MAX_PRINT_TASKS}=require('../src/v44-plan-report.cjs');
const {buildApplicationGuide}=require('../src/application-guide.cjs');

function rows(n=36){
 return Array.from({length:n},(_,i)=>{
  const lm=i+1, f=lm<=14?'B':lm<=20?'R':'W',
   m=lm<=2?'MS':lm<=7?'B':'W';
  const fi=f==='W'?2500:f==='R'?850:0;
  const mi=m==='W'?1950:m==='MS'?1400:0;
  const income=fi+mi+(f==='B'?1250:0)+(m==='B'?950:0)+250;
  const childcare=lm>=19?340:0;
  return {lm,f,m,hf:f==='R'?24:f==='W'?40:0,
   hm:m==='W'?40:0,fi,mi,totalWage:fi+mi,
   totalEg:(f==='B'?1250:0)+(m==='B'?950:0),kind:250,
   income,childcare,cashAfter:income-3000-childcare};
 });
}
function guide(date='2026-08-11'){
 return buildApplicationGuide({birthDate:date,expectedBirthDate:date,
  region:'NRW',city:'Köln',childcareStartLm:19,
  leavePeriods:{father:[],mother:[]}});
}
function input(o={}){return {rows:rows(),horizon:24,birthDate:'2026-08-11',
 childcareStartLm:19,expenses:3000,validationStatus:'NICHT_UNTERSTUETZT',
 guide:guide(),taskStatuses:{},...o};}

test('source-grounded tasks only use existing guide dates, titles, sources, and self-markers',()=>{
 const g=guide(),status={};
 assert.ok(g.tasks.length>=3);
 status[g.tasks[0].id]='done';status[g.tasks[1].id]='ready';
 const snapshot=JSON.stringify(g);
 const result=prepareTasks(g,status);
 assert.equal(JSON.stringify(g),snapshot);
 assert.equal(result.tasks.length,g.tasks.length);
 assert.deepEqual(result.tasks.map(x=>x.dueDate),g.tasks.map(x=>x.dueDate??null));
 assert.deepEqual(result.tasks.map(x=>x.title),g.tasks.map(x=>x.title));
 assert.equal(result.counts.done,1);assert.equal(result.counts.ready,1);
 assert.equal(result.counts.open,g.tasks.length-2);
 assert.ok(result.tasks.every(t=>t.source.url.startsWith('https://')));
 assert.ok(result.tasks.every(t=>t.note.includes('persönlich prüfen')));
 assert.ok(result.tasks.some(t=>t.group==='Betreuung und Kita'));
});
test('36 life months, 24 monthly comparison, 6-month bins, family statuses and unchanged inputs',()=>{
 const data=input(),before=JSON.stringify(data);
 const p=makePrintSummary(data);
 assert.equal(JSON.stringify(data),before);
 assert.equal(p.type,'Eigener ungeprüfter Entwurf');
 assert.equal(p.bins.length,4);
 assert.deepEqual(p.bins.map(b=>[b.from,b.to]),[[1,6],[7,12],[13,18],[19,24]]);
 assert.equal(p.family.horizon,24);
 assert.equal(p.family.months.length,24);
 assert.equal(p.bins.reduce((a,x)=>a+x.income,0),p.family.totalIncome);
 assert.equal(p.bins.reduce((a,x)=>a+x.rest,0),p.family.totalAvailable);
 assert.equal(p.family.childcareStartLm,19);
 assert.ok(p.family.homeMonths.first>0&&p.family.homeMonths.second>0);
 assert.ok(p.warnings.some(x=>x.includes('keine amtliche')));
 assert.equal(p.validationStatus,'NICHT_UNTERSTUETZT');
});
test('36 LM print uses exactly six periods and never mixes 24/36 summary totals',()=>{
 const p=makePrintSummary(input({horizon:36}));
 assert.equal(p.bins.length,6);
 assert.deepEqual(p.bins.map(b=>[b.from,b.to]),[[1,6],[7,12],[13,18],[19,24],[25,30],[31,36]]);
 assert.equal(p.bins.reduce((a,x)=>a+x.income,0),p.family.totalIncome);
 assert.equal(p.family.horizon,36);
});
test('missing household expenses show unknown rest and reserve, never zero',()=>{
 const p=makePrintSummary(input({expenses:null}));
 assert.equal(p.expensesKnown,false);
 assert.equal(p.family.totalAvailable,null);
 assert.equal(p.family.requiredBuffer,null);
 assert.equal(p.bins.every(x=>x.rest===null),true);
 assert.equal(p.family.totalIncome,rows().slice(0,24).reduce((a,x)=>a+x.income,0));
});
test('explicit zero expense and zero available remain valid numeric zero, distinct from missing',()=>{
 const data=input({expenses:0,rows:rows().map(r=>({...r,cashAfter:r.income-r.childcare}))});
 const p=makePrintSummary(data);
 assert.equal(p.expensesKnown,true);
 assert.equal(p.expenses,0);
 assert.equal(typeof p.family.totalAvailable,'number');
 assert.equal(p.family.requiredBuffer,0);
});
test('print overview never adds invented deadlines or tasks to a missing guide',()=>{
 const p=makePrintSummary(input({guide:null}));
 assert.equal(p.taskView,null);
 assert.equal(p.printableTasks.length,0);
 assert.ok(p.taskError.includes('nicht verfügbar'));
 assert.equal(p.family.months.length,24);
});
test('wrong guide birth date fails the task section closed, without corrupting finance summary',()=>{
 const p=makePrintSummary(input({guide:guide('2026-07-01')}));
 assert.equal(p.taskView,null);
 assert.ok(p.taskError.includes('Abweichendes Geburtsdatum'));
 assert.equal(typeof p.family.totalIncome,'number');
});
test('printed actions exclude self-done, cap to six and retain original order and source labels',()=>{
 const g=guide(),extended={...g,tasks:Array.from({length:12},(_,i)=>({
  id:'extra-task-'+i,title:'Beleg '+i,dueDate:'2026-12-01',source:g.tasks[0].source,documents:[]
 }))};
 const statuses={'extra-task-1':'done','extra-task-3':'ready'};
 const p=makePrintSummary(input({guide:extended,taskStatuses:statuses}));
 assert.equal(p.taskView.counts.total,12);
 assert.equal(p.printableTasks.length,MAX_PRINT_TASKS);
 assert.equal(p.printableTasks.some(x=>x.id==='extra-task-1'),false);
 assert.equal(p.printableTasks.find(x=>x.id==='extra-task-3').status,'ready');
 assert.equal(p.restTaskCount,5);
 assert.ok(p.printableTasks.every(t=>t.source.label));
});
test('2027 birthday inherits recheck warning, not a fabricated approval',()=>{
 const date='2027-09-15';
 const p=makePrintSummary(input({birthDate:date,guide:guide(date),example:true}));
 assert.equal(p.type,'Fiktives Testbeispiel');
 assert.equal(p.taskView.needsRecheck,true);
 assert.equal(p.validationStatus,'NICHT_UNTERSTUETZT');
 assert.ok(p.warnings.some(x=>x.includes('2027')));
});
test('tampered task links, invalid source dates and unsupported status are rejected',()=>{
 const g=guide();
 const badHref={...g,tasks:[{...g.tasks[0],source:{label:'X',url:'javascript:alert(1)'}}]};
 assert.throws(()=>prepareTasks(badHref),/HTTPS-Quelle/);
 assert.throws(()=>prepareTasks({...g,tasks:[g.tasks[0],g.tasks[0]]}),/doppelte Aufgabenkennung/);
 assert.throws(()=>prepareTasks(g,{[g.tasks[0].id]:'officially-approved'}),/Aufgabenstatus/);
 assert.throws(()=>prepareTasks({...g,tasks:[{...g.tasks[0],dueDate:'2026-02-30'}]}),/kein gültiges Datum/);
 assert.throws(()=>makePrintSummary(input({birthDate:'2026-02-30'})),/kein gültiges Datum/);
 assert.throws(()=>makePrintSummary(input({horizon:37})),/Vergleichszeitraum/);
 assert.throws(()=>makePrintSummary(input({expenses:-1})),/Haushaltsausgaben/);
});

test('plainText: kompakter Klartext mit Hinweis, Lebensmonaten, Betreuung und Aufgaben',()=>{
 const g=guide();
 const t=plainText(makePrintSummary(input({taskStatuses:{[g.tasks[0].id]:'done'}})));
 assert.match(t,/^PLANUNGSSTAND, KEINE AMTLICHE BEWILLIGUNG/);
 assert.match(t,/LM 1–6:/);assert.match(t,/ab LM 19/);
 assert.match(t,/selbst erledigt \(nicht amtlich bestätigt\)/);
 assert.match(t,/Planungsstand, keine amtliche Bewilligung\./);
 assert.doesNotMatch(t,/https?:/);
 const unknown=plainText(makePrintSummary(input({expenses:null,guide:null})));
 assert.match(unknown,/unbekannt/);assert.match(unknown,/nicht berechenbar/);
 assert.throws(()=>plainText(null),TypeError);
});
