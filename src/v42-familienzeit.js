// Paket 2: view-only family timeline and a maximum of three volatile comparisons.
// Financial plan data, stored JSON, localStorage and ledger stay unchanged; selecting a month only updates s.month.
const FamilyTimeCompareV42=(()=>{
 let saved=[],sequence=0;
 const root=()=>document.getElementById('v42FamilyPlanner');
 const el=id=>document.getElementById(id);
 const esc42=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const eur42=value=>Number(value).toLocaleString('de-DE',{style:'currency',currency:'EUR'});
 const costsKnown=()=>s.expenses!==''&&s.expenses!==undefined&&s.expenses!==null&&Number.isFinite(Number(s.expenses));
 const plannedStart=()=>{
  if(s.childcareStart===undefined||s.childcareStart===null||s.childcareStart==='')return 0;
  const raw=Number(s.childcareStart);
  if(!Number.isInteger(raw)||raw<0||raw>36)throw new RangeError('Unzulässiger geplanter Kita-Lebensmonat.');
  return raw;
 };
 function projectedRows(rows){
  return rows.map(r=>({lm:r.lm,f:r.f,m:r.m,hf:r.hf,hm:r.hm,
   totalWage:r.totalWage,totalEg:r.totalEg,kind:r.kind,
   income:r.income,childcare:r.childcare,cashAfter:r.cashAfter}));
 }
 function createProjection(){
  if(!current||!Array.isArray(current.rows))throw new Error('Aktuelle Monatsdaten fehlen.');
  return {date:s.date,rows:projectedRows(current.rows),expensesKnown:costsKnown(),
   childcareStartLm:plannedStart(),validationStatus:current.validation?.status||'NICHT_UNTERSTUETZT'};
 }
 const configuredHorizon=()=>Math.max(1,Math.min(36,Number(s.horizon)||24));
 const view=(projection,horizon)=>FamilyOverview.buildFamilyView({
  rows:projection.rows,horizon,childcareStartLm:projection.childcareStartLm,
  expensesKnown:projection.expensesKnown,validationStatus:projection.validationStatus
 });
 function fingerprint(projection){return JSON.stringify(projection);}
 function careLabel(care){
  return care==='planned-kita'?'Kita angenommen*':care==='parent-at-home'?'Elternteil zu Hause*':'Nicht zugeordnet';
 }
 function cellFor(parent){
  const availability=parent.availability;
  const label=parent.code==='MS'?'Mutterschutz':availability==='at-home'?'Zu Hause':availability==='work-or-part-time'?'Teilzeit':'Arbeit';
  const cls=parent.code==='MS'?'v42-status-ms':availability==='at-home'?'v42-status-home':availability==='work-or-part-time'?'v42-status-part':'v42-status-work';
  return {label,cls};
 }
 function trackMarkup(months,selected){
  const colHeader=months.map(r=>'<th scope="col"><button type="button" data-v42-month="'+r.lm+'" aria-pressed="'+String(r.lm===selected)+'" aria-label="Lebensmonat '+r.lm+' · '+esc42(dateFor(r.lm))+' auswählen" title="Lebensmonat '+r.lm+' auswählen">'+r.lm+'</button></th>').join('');
  const cell=(row,code,label,cls)=>'<td class="'+(row.lm===selected?'v42-selected':'')+'"><span class="v42-cell '+cls+'" title="'+esc42(label)+'">'+esc42(code)+'</span></td>';
  const parentRow=(which,label)=>'<tr><th scope="row" class="v42-rowhead">'+label+'</th>'+
   months.map(r=>{const v=r[which],c=cellFor(v);return cell(r,c.label,v.label,c.cls);}).join('')+'</tr>';
  const careRow='<tr><th scope="row" class="v42-rowhead">Betreuung laut Modell</th>'+
   months.map(r=>cell(r,r.care==='planned-kita'?'Kita*':r.care==='parent-at-home'?'Zuhause*':'Offen',
    careLabel(r.care),r.care==='planned-kita'?'v42-care-kita':r.care==='parent-at-home'?'v42-care-parent':'v42-care-open')).join('')+'</tr>';
  const monetaryRow=(label,key,unknown=false)=>'<tr><th scope="row" class="v42-rowhead">'+label+'</th>'+
   months.map(r=>'<td class="v42-money '+(r.lm===selected?'v42-selected':'')+' '+(unknown&&!Number.isFinite(r[key])?'v42-unknown':'')+'">'+
   (r[key]===null?'Unbekannt':esc42(eur42(r[key])))+'</td>').join('')+'</tr>';
  return '<table class="v42-track"><caption>Modellierte Lebensmonate 1 bis '+months.length+
   ' mit Elternstatus, Betreuungsannahmen und monatlichen Beträgen. Durch die Spaltenüberschriften navigieren.</caption>'+
   '<thead><tr><th scope="col" class="v42-rowhead">Lebensmonat</th>'+colHeader+'</tr></thead><tbody>'+
   parentRow('first','Elternteil 1')+parentRow('second','Elternteil 2')+careRow+
   monetaryRow('Einnahmen vor Kosten', 'income')+
   monetaryRow('Rest nach angegebenen Kosten', 'available',true)+
   '</tbody></table>';
 }
 function detailMarkup(month){
  const unknown=month.available===null;
  return '<h4>LM '+month.lm+' · Kindesalter '+esc42(ageSpan(month.lm))+'</h4>'+
   '<p><strong>Zeitraum:</strong> '+esc42(dateFor(month.lm))+'</p>'+
   '<p><strong>Elternteil 1:</strong> '+esc42(month.first.label)+' ('+month.first.hours+' Wochenstunden im Modell). '+
   '<strong>Elternteil 2:</strong> '+esc42(month.second.label)+' ('+month.second.hours+' Wochenstunden im Modell).</p>'+
   '<p><strong>Betreuung:</strong> '+esc42(careLabel(month.care))+'. Eine Wochenstundenabdeckung oder tatsächliche Platzzusage ist dadurch nicht bestätigt.</p>'+
   '<dl><div><dt>Einnahmen vor Kosten</dt><dd>'+esc42(eur42(month.income))+'</dd></div>'+
    '<div><dt>Modellierte Kita-Kosten</dt><dd>'+esc42(eur42(month.childcare))+'</dd></div>'+
    '<div><dt>Rest nach eingegebenen Kosten</dt><dd>'+(unknown?'Nicht berechenbar':esc42(eur42(month.available)))+'</dd></div></dl>'+
   '<p>'+ (unknown?'Haushaltsausgaben fehlen; weder ein positiver Rest noch ein Rücklagenbedarf lässt sich seriös nennen.':
      'Weitere unbekannte Kosten und tatsächliche Zahlungstermine sind nicht modelliert.')+
     ' Die Leistungsbeträge sind vorläufige Modellwerte, keine amtlich bewilligten Zahlungen.</p>';
 }
 function comparisonMarkup(active,projection,period){
  const items=[{id:0,name:'Aktueller Plan',projection,view:active,active:true},
   ...saved.map(slot=>({id:slot.id,name:slot.name,projection:slot.projection,view:view(slot.projection,period),active:false}))];
  const isDifferent=items.slice(1).some(item=>item.projection.date!==projection.date);
  const rows=items.map(item=>{
   const v=item.view;
   const costs=v.expensesKnown;
   const status=esc42(v.validationStatus);
   const unassigned=v.firstUnattributed===null?'Keine im betrachteten Modell':('LM '+v.firstUnattributed);
   const match=!item.active&&fingerprint(item.projection)===fingerprint(projection);
   return '<tr><th scope="row">'+esc42(item.name)+
    '<small>'+(item.active?'Aktive Berechnung':match?'Identische Modellzahlen zum aktiven Plan':'Gespeicherte Momentaufnahme')+
    ' · Geburtsdatum '+esc42(item.projection.date)+'</small></th>'+
    '<td>'+esc42(eur42(v.totalIncome))+'</td>'+
    '<td class="'+(costs?'':'v42-cannot')+'">'+(costs?esc42(eur42(v.minAvailable)):'Nicht vergleichbar')+'</td>'+
    '<td class="'+(costs?'':'v42-cannot')+'">'+(costs?esc42(eur42(v.totalAvailable)):'Nicht vergleichbar')+'</td>'+
    '<td class="'+(costs?'':'v42-cannot')+'">'+(costs?esc42(eur42(v.requiredBuffer)):'Nicht berechenbar')+'</td>'+
    '<td>'+esc42(unassigned)+'</td>'+
    '<td>'+v.homeMonths.first+' / '+v.homeMonths.second+'</td>'+
    '<td>'+status+'<small>Kein Bewilligungsnachweis</small></td></tr>';
  }).join('');
  return '<p class="v42-compare-note">Gleicher Vergleichszeitraum: LM 1–'+period+
   '. Aktueller Plan plus maximal drei unveränderliche Momentaufnahmen. Alle Einnahmen vor Kosten, keine sicheren Zahlungszeitpunkte.'+
   (isDifferent?' <strong>Achtung: Gespeicherte Varianten verwenden unterschiedliche Geburtsdaten.</strong>':'')+'</p>'+
   (saved.length?'<ul class="v42-saved" aria-label="Gemerkte Varianten">'+saved.map(slot=>
      '<li><span>'+esc42(slot.name)+'</span><button type="button" data-v42-remove="'+slot.id+'" aria-label="'+esc42(slot.name)+' entfernen">Entfernen</button></li>').join('')+'</ul>':'<p>Keine weiteren Varianten gemerkt. Wähle ein Modell, merke es und ändere anschließend den aktiven Plan.</p>')+
   '<div class="v42-compare-scroll" tabindex="0" aria-label="Vergleichstabelle horizontal verschieben"><table>'+
   '<caption>Modellvergleich im selben Lebensmonats-Zeitraum; Tabellenwerte sind keine bestätigten Ansprüche oder Kontoauszüge.</caption>'+
   '<thead><tr><th scope="col">Plan</th><th scope="col">Einnahmen vor Kosten, gesamt</th>'+
   '<th scope="col">Niedrigster Rest je LM</th><th scope="col">Rest gesamt</th>'+
   '<th scope="col">Kumulierte Modellunterdeckung*</th><th scope="col">Betreuung nicht zugeordnet</th>'+
   '<th scope="col">Zuhause LM, Eltern 1 / 2</th><th scope="col">Prüfstatus</th></tr></thead>'+
   '<tbody>'+rows+'</tbody></table></div>'+
   '<p class="v42-compare-note">*Nur bei bekannten Haushaltsausgaben: theoretischer höchster negativer Zwischensaldo einer laufenden Lebensmonats-Summe ab 0 €. Keine Bankliquidität, keine tatsächlichen Auszahlungstermine. „Nicht zugeordnet“ bedeutet keine bestätigte Betreuung im Modell, nicht nachweislich fehlende Betreuung. Eine Kita-Annahme beweist keinen Platz.</p>';
 }
 function refresh(){
  const container=root();if(!container)return;
  const focused=container.contains(document.activeElement)&&document.activeElement?.hasAttribute('data-v42-month')?
    Number(document.activeElement.dataset.v42Month):null;
  try{
   const projection=createProjection(),period=configuredHorizon(),currentView=view(projection,period);
   const month=Math.max(1,Math.min(period,Number(s.month)||1));
   el('v42Timeline').innerHTML=trackMarkup(currentView.months,month);
   el('v42MonthDetail').innerHTML=detailMarkup(currentView.months[month-1]);
   el('v42Comparison').innerHTML=comparisonMarkup(currentView,projection,period);
   el('v42Save').disabled=saved.length>=3;
   el('v42Clear').disabled=saved.length===0;
   if(focused!==null)container.querySelector('[data-v42-month="'+focused+'"]')?.focus({preventScroll:true});
  }catch(error){
   el('v42Timeline').textContent='Die Monatsübersicht kann mit diesen Eingaben nicht sicher angezeigt werden.';
   el('v42MonthDetail').textContent='';
   el('v42Comparison').textContent='';
   el('v42Feedback').textContent='Ansicht nicht berechenbar: '+String(error.message||error).slice(0,150);
   el('v42Save').disabled=true;
  }
 }
 function feedback(message){el('v42Feedback').textContent=message;}
 function save(){
  if(saved.length>=3){feedback('Maximal drei gemerkte Varianten. Bitte zuerst eine entfernen.');return;}
  try{
   const p=createProjection(),key=fingerprint(p);
   if(saved.some(item=>item.key===key)){feedback('Dieser Modellstand ist bereits in der Vergleichsliste. Ändere zuerst den aktiven Plan.');return;}
   const label=String(el('v42VariantName')?.value||'').trim().slice(0,40);
   const id=++sequence;
   saved.push({id,name:label||'Variante '+id,key,projection:JSON.parse(JSON.stringify(p))});
   el('v42VariantName').value='';
   refresh();feedback('Variante gemerkt. Der aktive Plan blieb unverändert; beim Neuladen wird die Liste gelöscht.');
  }catch(e){feedback('Variante konnte nicht übernommen werden: '+String(e.message||e).slice(0,130));}
 }
 function clear(reason){
  saved=[];sequence=0;
  refresh();
  feedback(reason||'Alle gemerkten Varianten wurden verworfen. Der aktive Plan blieb unverändert.');
 }
 function click(event){
  const button=event.target.closest('button');if(!button||!root().contains(button))return;
  if(button.id==='v42Save'){save();return;}
  if(button.id==='v42Clear'){clear();return;}
  if(button.hasAttribute('data-v42-remove')){
   const id=Number(button.dataset.v42Remove);
   saved=saved.filter(slot=>slot.id!==id);refresh();feedback('Gemerkte Variante entfernt. Aktiver Plan unverändert.');return;
  }
  if(button.hasAttribute('data-v42-month')){
   const lm=Number(button.dataset.v42Month);
   if(!Number.isInteger(lm)||lm<1||lm>configuredHorizon())return;
   s.month=lm;
   renderAll(); // Existing month detail, chart and time axes follow this model-only selection.
   root().querySelector('[data-v42-month="'+lm+'"]')?.focus({preventScroll:true});
  }
 }
 function keydown(event){
  const button=event.target.closest('button[data-v42-month]');
  if(!button||!root().contains(button)||!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;
  event.preventDefault();
  const now=Number(button.dataset.v42Month),last=configuredHorizon();
  const target=event.key==='Home'?1:event.key==='End'?last:
   Math.max(1,Math.min(last,now+(event.key==='ArrowRight'?1:-1)));
  root().querySelector('[data-v42-month="'+target+'"]')?.click();
 }
 function mount(){
  const container=root();if(!container)return;
  container.addEventListener('click',click);
  container.addEventListener('keydown',keydown);
 }
 const priorRenderAll=renderAll;
 renderAll=function(...args){const result=priorRenderAll(...args);refresh();return result;};
 return {mount,refresh,save,onReset:()=>clear('Zurückgesetzt: temporäre Varianten wurden gelöscht.'),
  onImported:()=>clear('Importiert: bisherige temporäre Varianten wurden verworfen.'),
  state:()=>({count:saved.length,labels:saved.map(slot=>slot.name),persisted:false})};
})();
window.__familienzeitV42=FamilyTimeCompareV42;
