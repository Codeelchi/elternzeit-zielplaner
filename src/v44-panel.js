// Paket 3: same ApplicationGuide + session-only checklist statuses, A4 print opt-in.
// Nothing in this component updates the underlying financial/legal plan or storage.
const PlanActionsV44=(()=>{
 let filter='open';
 let activeReport=null;
 const byId=id=>document.getElementById(id);
 const root=()=>byId('v44TaskHub');
 const esc44=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const eur44=value=>Number(value).toLocaleString('de-DE',{style:'currency',currency:'EUR'});
 const date44=value=>value?TimeAxes.formatDateDE(value):'Kein verbindlicher Tag angegeben';
 const taskStatus={open:'Noch offen',ready:'Unterlagen vorbereitet',done:'Selbst als erledigt markiert – nicht amtlich bestätigt'};
 const currentGuide=()=>applicationGuideForState();
 function currentTaskStatuses(guide){
  const out=Object.create(null);
  for(const t of guide.tasks)out[t.id]=v315TaskStates.get(v315TaskStatusKey(t))||'open';
  return out;
 }
 function taskProjection(){
  const guide=currentGuide();
  const data=PlanReportV44.prepareTasks(guide,currentTaskStatuses(guide));
  return {guide,data};
 }
 function taskMarkup(group,items){
  return '<section class="v44-task-group" aria-label="'+esc44(group)+'">'+
   '<h4>'+esc44(group)+'</h4>'+
   items.map(t=>{
    const idx=t.ordinal,opts=Object.entries(taskStatus).map(([key,label])=>
     '<option value="'+key+'"'+(t.status===key?' selected':'')+'>'+esc44(label)+'</option>').join('');
    return '<article data-v44-task="'+esc44(t.id)+'"><h4>'+esc44(t.title)+'</h4>'+
     '<p class="v44-task-meta"><strong>'+esc44(date44(t.dueDate))+'</strong> · '+esc44(t.group)+
     (t.legalStatus?' · Individuelle rechtliche Anwendbarkeit prüfen':'')+'</p>'+
     '<p class="v44-task-source">Quelle (Stand '+esc44(t.source.verifiedAt)+'): '+
     '<a href="'+esc44(t.source.url)+'" target="_blank" rel="noopener noreferrer">'+esc44(t.source.label)+'</a></p>'+
     (t.documents.length?'<p class="v44-task-meta">Unterlagen: '+esc44(t.documents.slice(0,2).join(' · '))+
      (t.documents.length>2?' …':'')+'</p>':'')+
     '<label for="v44Task'+idx+'">Mein Bearbeitungsstand – nur in dieser Sitzung'+
      '<select id="v44Task'+idx+'" data-v44-task-id="'+esc44(t.id)+'">'+opts+
     '</select></label></article>';
   }).join('')+'</section>';
 }
 function refreshTasks(){
  if(!root())return;
  const focused=document.activeElement?.dataset?.v44TaskId??null;
  for(const button of root().querySelectorAll('[data-v44-filter]'))
   button.setAttribute('aria-pressed',String(button.dataset.v44Filter===filter));
  try {
   const {data}=taskProjection();
   byId('v44TaskOverview').textContent=data.counts.open+' offen · '+data.counts.ready+
    ' vorbereitet · '+data.counts.done+' selbst erledigt · '+data.counts.total+
    ' quellenbasierte Aufgaben. Quellenstand '+date44(data.verifiedAt)+'.'+
    (data.needsRecheck?' Geburt nach Quellenstand: Rechtslage und lokale Verfahren erneut prüfen.':'');
   const visible=data.tasks.filter(t=>filter==='all'||t.status===filter);
   const groups=['Vor der Geburt','Nach der Geburt / laufende Anträge','Betreuung und Kita'];
   byId('v44TaskList').innerHTML=visible.length?
    groups.map(group=>{const groupTasks=visible.filter(t=>t.group===group);return groupTasks.length?taskMarkup(group,groupTasks):'';}).join(''):
    '<p class="v44-empty">Keine Aufgaben mit diesem persönlichen Bearbeitungsstand. In „Alle“ sind sämtliche quellenbasierten Aufgaben sichtbar.</p>';
   if(focused!==null){
    const preferred=[...root().querySelectorAll('[data-v44-task-id]')].find(control=>control.dataset.v44TaskId===focused);
    const fallback=root().querySelector('select[data-v44-task-id]')||
      root().querySelector('[data-v44-filter][aria-pressed="true"]');
    (preferred||fallback)?.focus({preventScroll:true});
   }
  } catch(error){
   byId('v44TaskOverview').textContent='Keine verlässlich ableitbare Aufgabenliste für diesen Entwurf.';
   byId('v44TaskList').textContent='Bitte Geburtsdatum, Rechtsstand, Region und Elternzeitabschnitte in der vollständigen Checkliste prüfen.';
  }
 }
 function expenses(){
  if(s.expenses===''||s.expenses===null||s.expenses===undefined)return null;
  const n=Number(s.expenses);
  return Number.isFinite(n)?n:null;
 }
 function projection(){
  let guide=null,statuses={};
  try{guide=currentGuide();statuses=currentTaskStatuses(guide);}catch{}
  return PlanReportV44.makePrintSummary({
   rows:current.rows,horizon:Math.max(1,Math.min(36,Number(s.horizon)||24)),
   birthDate:s.date,modelLabel:'Aktueller Lebensmonatsplan',
   childcareStartLm:Number(s.childcareStart)||0,
   expenses:expenses(),validationStatus:current.validation?.status||'NICHT_UNTERSTUETZT',
   guide,taskStatuses:statuses,example:PUBLIC_TEST_PREVIEW
  });
 }
 function numberOrUnknown(value){return value===null||value===undefined?'Nicht berechenbar':eur44(value);}
 function tableRows(report){
  return report.bins.map(b=>'<tr><th scope="row">LM '+b.from+'–'+b.to+'</th>'+
   '<td>'+esc44(eur44(b.income))+'</td>'+
   '<td>'+esc44(numberOrUnknown(b.rest))+'</td>'+
   '<td>'+b.firstHome+' / '+b.secondHome+'</td></tr>').join('');
 }
 function firstPage(r){
  const numberOrDash=x=>x===null?'Nicht zugeordnet im Modell':'LM '+x;
  return '<article class="v44-report-screen-page" data-v44-page="1">'+
   '<span class="v44-headline">Lokaler Familienplan · Modellübersicht</span>'+
   '<h2>Familienzeit und Budget im Überblick</h2>'+
   '<p class="v44-doc-meta"><strong>'+esc44(r.type)+'</strong> · Geburtsdatum '+esc44(date44(r.birthDate))+
   ' · Lebensmonate 1–'+r.horizon+' · Modell: '+esc44(r.modelLabel)+
   ' · Prüfstatus: '+esc44(r.validationStatus)+' (keine Bewilligung)</p>'+
   '<div class="v44-print-tile-grid">'+
    '<div class="v44-print-tile"><small>Einnahmen VOR Haushalts- und Kita-Kosten / Zeitraum</small><strong>'+esc44(eur44(r.family.totalIncome))+'</strong></div>'+
    '<div class="v44-print-tile"><small>Rest NACH eingegebenen Kosten / Zeitraum</small><strong>'+esc44(numberOrUnknown(r.family.totalAvailable))+'</strong></div>'+
    '<div class="v44-print-tile"><small>Vollständige Zuhause-Monate im Modell, Elternteil 1 / 2</small><strong>'+r.family.homeMonths.first+' / '+r.family.homeMonths.second+' LM</strong></div>'+
    '<div class="v44-print-tile"><small>Erste Betreuung ohne ausdrückliche Zuordnung</small><strong>'+
     esc44(r.family.firstUnattributed===null?'Keine im Modell':'LM '+r.family.firstUnattributed)+'</strong></div>'+
   '</div>'+
   '<p>Geplanter Kita-Start: <strong>'+esc44(r.family.childcareStartLm>0?'ab LM '+r.family.childcareStartLm:'Nicht angegeben')+'</strong>. '+
   (r.expensesKnown?'Angegebene Haushaltsausgaben je LM: <strong>'+esc44(eur44(r.expenses))+'</strong>.':
    '<strong>Haushaltsausgaben unbekannt – weder Gesamtrest noch Rücklagenbedarf zuverlässig berechenbar.</strong>')+'</p>'+
   '<h3>Zusammenfassung nach sechs Lebensmonaten</h3>'+
   '<div class="v44-table-wrap" tabindex="0" role="region" aria-label="Sechsmonats-Budgetübersicht horizontal verschieben"><table><caption>Bereits modellierte Einnahmen und optionaler Rest in Blöcken von sechs Lebensmonaten. Keine Bankauszahlungsdaten.</caption>'+
    '<thead><tr><th scope="col">Zeitraum</th><th scope="col">Einnahmen vor Kosten</th><th scope="col">Rest nach Kosten</th>'+
     '<th scope="col">Volle Zuhause-LM 1 / 2</th></tr></thead>'+
    '<tbody>'+tableRows(r)+'</tbody></table></div>'+
   '<h3>Was diese Zusammenfassung nicht belegt</h3>'+
   '<ul class="v44-warning-list">'+r.warnings.slice(0,4).map(w=>'<li>'+esc44(w)+'</li>').join('')+'</ul>'+
   '<p class="v44-footnote">Nur lokal erzeugt und bewusst ausdruckbar. Die modellierte Kita-Zuordnung bestätigt keine Wochenstunden oder Platzvergabe.</p></article>';
 }
 function secondPage(r){
  const guides=r.taskView;
  const sourceState=guides?'Quellenstand '+date44(guides.verifiedAt)+
    ' · '+(guides.authority||'Örtliche Zuständigkeit vorab klären'):'Keine validierte Aufgabenquelle für den Entwurf.';
  const tasks=r.printableTasks.length?r.printableTasks.map(t=>
   '<div class="v44-print-task"><strong>'+esc44(t.title)+'</strong>'+
    '<p>Termin: <strong>'+esc44(date44(t.dueDate))+'</strong> · '+esc44(taskStatus[t.status])+'</p>'+
    '<p>Quelle: <a href="'+esc44(t.source.url)+'" target="_blank" rel="noopener noreferrer">'+esc44(t.source.label)+'</a> ('+esc44(t.source.verifiedAt)+')</p>'+
    '</div>').join(''):'<p>Keine als offen oder vorbereitet markierten Aufgaben aus der aktuellen Quellen-Checkliste.</p>';
  return '<article class="v44-report-screen-page" data-v44-page="2">'+
   '<span class="v44-headline">Lokale Familienplanung · Aufgaben und Quellen</span>'+
   '<h2>Offene Schritte und Nachweise</h2>'+
   '<p class="v44-doc-meta">'+esc44(r.type)+' · '+esc44(sourceState)+'</p>'+
   '<p>Bearbeitungsstände gelten nur für diese Sitzung. „Erledigt“ heißt lediglich selbst markiert, nicht behördlich bestätigt.</p>'+
   (r.taskError?'<p class="v44-footnote"><strong>'+esc44(r.taskError)+'</strong></p>':'')+
   (guides?.needsRecheck?'<p class="v44-footnote"><strong>Warnung:</strong> Geburtsdatum nach dem Quellenprüfstand. Rechtsstand, Termine und örtliche Verfahren vor Abgabe erneut offiziell kontrollieren.</p>':'')+
   '<h3>Die nächsten maximal sechs nicht selbst erledigten Schritte</h3>'+tasks+
   (r.restTaskCount?'<p><strong>Weitere '+r.restTaskCount+' Aufgaben</strong> in der vollständigen lokalen Checkliste. Vor dem Handeln dort alle Quellen und Unterlagen prüfen.</p>':'')+
   '<h3>Offene fachliche Fragen und Verantwortung</h3>'+
   '<ul class="v44-warning-list"><li>4/5-Mutterschutztage und individueller Elterngeld-Netto-Anspruch wurden hier nicht geprüft.</li>'+
   '<li>2027-Regelungsstände und individuelle Elternzeit-/Betreuungsbedingungen amtlich gegenprüfen.</li>'+
   '<li>Es liegen keine unabhängigen Freigaben für produktive Rechts-/Finanzberatung vor.</li></ul>'+
   '<p class="v44-footnote">Quelle: bestehende Antragscheckliste des Rechners; keine automatisch gestellte Eingabe oder verschickter Antrag. Bei Nachfragen an die Fachstelle die tatsächlichen individuellen Dokumente separat bereithalten.</p></article>';
 }
 function reportHtml(r){return firstPage(r)+secondPage(r);}
 function preview(){
  try{
   const report=projection();activeReport=report;
   const html=reportHtml(report);
   byId('v44ReportPreview').innerHTML=html;
   byId('v44ReportPreview').hidden=false;
   byId('v44Preview').setAttribute('aria-expanded','true');
   byId('v44ReportFeedback').textContent='Bericht mit zwei Abschnitten aus dem aktuellen Plan erstellt. Prüfe die Angaben vor dem Drucken.';
   return html;
  }catch(error){
   byId('v44ReportFeedback').textContent='Bericht nicht berechenbar: '+String(error?.message||error).slice(0,160)+'. Vorhandener Plan bleibt unverändert.';
   return null;
  }
 }
 function printReport(){
  const html=preview();if(html===null)return;
  byId('v44PrintSheet').innerHTML=html;
  document.body.classList.add('v44-print-active');
  byId('v44ReportFeedback').textContent='Druckansicht aktiviert. Im Browserdialog den gewünschten Drucker oder „Als PDF speichern“ auswählen. Die zwei Seiten enthalten private Modellangaben.';
  try{window.print();}catch(e){document.body.classList.remove('v44-print-active');byId('v44ReportFeedback').textContent='Browser-Druck nicht verfügbar; der Bericht bleibt als Textvorschau sichtbar.';}
 }
 function afterprint(){
  document.body.classList.remove('v44-print-active');
  byId('v44PrintSheet').textContent='';
 }
 function mount(){
  if(!root())return;
  root().addEventListener('click',event=>{
   const button=event.target.closest('button[data-v44-filter]');
   if(!button)return;
   const next=button.dataset.v44Filter;
   if(!['all','open','ready','done'].includes(next))return;
   filter=next;refreshTasks();
  });
  root().addEventListener('change',event=>{
   const control=event.target.closest('select[data-v44-task-id]');if(!control)return;
   const status=control.value;
   if(!['open','ready','done'].includes(status))return;
   let guide;
   try{guide=currentGuide();}catch{return;}
   const match=guide.tasks.find(t=>t.id===control.dataset.v44TaskId);
   if(!match)return;
   v315TaskStates.set(v315TaskStatusKey(match),status);
   renderApplicationGuide();
   byId('v44TaskFeedback').textContent='Eigener Bearbeitungsstand aktualisiert. Keine Behörde wurde informiert und keine Daten gespeichert.';
  });
  const resultsIndex=[...document.querySelectorAll('.slide')].findIndex(slide=>slide.id==='slide-10');
  const actionsIndex=[...document.querySelectorAll('.slide')].findIndex(slide=>slide.id==='slide-9');
  byId('v44OpenActions').addEventListener('click',()=>{if(actionsIndex>=0)showSlide(actionsIndex);});
  byId('v44BackResults').addEventListener('click',()=>{if(resultsIndex>=0)showSlide(resultsIndex);});
  byId('v44Preview').addEventListener('click',()=>{
   if(!byId('v44ReportPreview').hidden){
    byId('v44ReportPreview').hidden=true;
    byId('v44Preview').setAttribute('aria-expanded','false');
    byId('v44ReportFeedback').textContent='Vorschau geschlossen.';
   }else preview();
  });
  byId('v44Print').addEventListener('click',printReport);
  window.addEventListener('afterprint',afterprint);
 }
 // Original checklist and compact cards share the exact same in-memory status map.
 // The existing checklist handler calls renderApplicationGuide after each edit.
 const oldGuide=renderApplicationGuide;
 renderApplicationGuide=function(...args){
  const result=oldGuide(...args);refreshTasks();
  if(byId('v44ReportPreview')&&!byId('v44ReportPreview').hidden)preview();
  return result;
 };
 return {mount,refreshTasks,preview,printReport,afterprint,
  state:()=>({filter,printed:document.body.classList.contains('v44-print-active'),persisted:false,
   statusOf:id=>{try{const guide=currentGuide();const task=guide.tasks.find(t=>t.id===id);return task?v315TaskStates.get(v315TaskStatusKey(task))||'open':null;}catch{return null;}}})};
})();
window.__planActionsV44=PlanActionsV44;
