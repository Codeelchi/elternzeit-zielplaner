// Paket 2C: explicit hypothetical inputs, no persistence or changes to the active plan.
const WhatIfV43=(()=>{
 const root=()=>document.getElementById('v43WhatIf');
 const el=id=>document.getElementById(id);
 const esc43=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const euro43=value=>Number(value).toLocaleString('de-DE',{style:'currency',currency:'EUR',minimumFractionDigits:2,maximumFractionDigits:2});
 const isKnown=()=>s.expenses!==''&&s.expenses!==null&&s.expenses!==undefined&&Number.isFinite(Number(s.expenses));
 const selectedCareStart=()=>{
  const v=Number(s.childcareStart)||0;
  return Number.isInteger(v)&&v>=0&&v<=36?v:0;
 };
 const num=(id,optional=false)=>{
  const input=el(id);
  if(!input)return optional?null:0;
  const raw=input.value.trim();
  if(raw===''){
   if(optional)return null;
   throw new RangeError('Bitte im Feld „'+input.closest('label')?.textContent?.trim().slice(0,85)+'“ einen Wert eintragen (auch 0 ist möglich).');
  }
  if(!input.validity.valid||input.validity.badInput)throw new RangeError('Eingabebereich im Feld „'+input.closest('label')?.textContent?.trim().slice(0,85)+'“ beachten.');
  const value=Number(raw);
  if(!Number.isFinite(value))throw new RangeError('Nur endliche Zahlen als Szenarioannahmen eingeben.');
  return value;
 };
 const hour=(id)=>num(id,true);
 const assumptions=()=>({
  delayMonths:num('v43Delay'),
  bridgeWageLoss:num('v43BridgeWage',true),
  bridgeCareCost:num('v43BridgeCare',true),
  waiveFees:el('v43WaiveFees').checked,
  fatherHours:hour('v43FatherHours'),
  motherHours:hour('v43MotherHours'),
  fatherNetDelta:num('v43FatherNet',true),
  motherNetDelta:num('v43MotherNet',true),
  expensesDelta:num('v43ExpensesDelta'),
  wageDownsidePercent:num('v43WageRisk')
 });
 const status=(message)=>{if(el('v43Status'))el('v43Status').textContent=message;};
 function context(){
  if(!current?.rows)return null;
  const horizon=Math.max(1,Math.min(36,Number(s.horizon)||24));
  return {rows:current.rows,horizon,childcareStartLm:selectedCareStart(),baseExpenses:isKnown()?Number(s.expenses):null,
   validationStatus:current.validation?.status||'NICHT_UNTERSTUETZT'};
 }
 function controlAvailability(){
  const projection=context();if(!projection)return;
  const parttime=new Set(['R','T','Q','K']);
  const rows=projection.rows.slice(0,projection.horizon);
  const hasFather=rows.some(r=>parttime.has(r.f));
  const hasMother=rows.some(r=>parttime.has(r.m));
  for(const id of ['v43FatherHours','v43FatherNet'])el(id).disabled=!hasFather;
  for(const id of ['v43MotherHours','v43MotherNet'])el(id).disabled=!hasMother;
  const hasCare=projection.childcareStartLm>0;
  el('v43Delay').disabled=!hasCare;
  const shift=Number(el('v43Delay').value)>0;
  for(const id of ['v43BridgeWage','v43BridgeCare','v43WaiveFees'])
   el(id).disabled=!hasCare||!shift;
  el('v43CareHelp').textContent=hasCare?
   'Der aktive Plan nimmt einen Kita-Start ab LM '+projection.childcareStartLm+' an. Eine Verschiebung ist keine Platzzusage oder automatische Erstattung von Beiträgen.':
   'Im aktiven Plan ist noch kein Kita-Start eingetragen. Bitte erst in den Fachangaben den geplanten Kita-Lebensmonat festlegen; die Verschiebung ist bis dahin nicht anwendbar.';
  el('v43WageRiskValue').textContent=el('v43WageRisk').value+' %';
 }
 const careLabel=care=>care==='planned-kita'?'Kita angenommen*':care==='parent-at-home'?'Elternteil zu Hause*':'Nicht zugeordnet';
 const careStart=value=>value>0?'LM '+value:'Nicht angenommen';
 const uncovered=value=>value===null?'Keine im Modell':'LM '+value;
 const unknown='Nicht berechenbar';
 function card(title,report,result,isAlternative){
  const incomplete=isAlternative&&!result.moneyComplete;
  const unavailable=isAlternative&&!result.budgetComparable;
  const money=value=>value===null||value===undefined?unknown:euro43(value);
  const row=(label,value)=>'<div><dt>'+esc43(label)+'</dt><dd>'+esc43(value)+'</dd></div>';
  const careValue=isAlternative?report.childcareStartLm||result.assumedCareStartLm:result.baselineCareStartLm;
  return '<article class="v43-panel'+(isAlternative?' v43-alt':'')+'"><h5>'+esc43(title)+'</h5>'+
   '<p>'+(isAlternative?'Ausdrücklich angenommene Alternative, ohne rechtliche Neuberechnung.':'Unveränderte aktuell berechnete Werte.')+'</p>'+
   '<dl>'+
   row('Kita-Start im Modell',careStart(careValue))+
   row('Erste nicht zugeordnete Betreuung',uncovered(report.firstUnattributed))+
   row('Einnahmen vor Kosten / Zeitraum',incomplete?unknown:money(report.totalIncome))+
   row('Niedrigster Rest nach bekannten Kosten',unavailable?unknown:money(report.lowestAvailable??report.minAvailable))+
   row('Gesamtrest nach bekannten Kosten',unavailable?unknown:money(report.totalAvailable))+
   row('Theoretische kumulierte Unterdeckung*',unavailable?unknown:money(report.requiredBuffer))+
   row('Prüfstatus des Ausgangsplans',report.validationStatus+' – keine Bewilligung')+
   '</dl></article>';
 }
 function details(result){
  const rows=result.monthly;
  const fmt=value=>value===null||value===undefined?unknown:euro43(value);
  const contents=rows.map(m=>'<tr><th scope="row">LM '+m.lm+'</th>'+
   '<td>'+esc43(careLabel(m.baselineCare))+'</td><td>'+esc43(careLabel(m.alternativeCare))+'</td>'+
   '<td>'+esc43(fmt(m.baselineIncome))+'</td><td class="'+(m.alternativeIncome===null?'v43-unknown':'')+'">'+esc43(fmt(m.alternativeIncome))+'</td>'+
   '<td>'+esc43(fmt(m.baselineAvailable))+'</td><td class="'+(m.alternativeAvailable===null?'v43-unknown':'')+'">'+esc43(fmt(m.alternativeAvailable))+'</td>'+
   '<td>'+esc43(m.firstHours)+' / '+esc43(m.secondHours)+'</td></tr>').join('');
  return '<details id="v43Detail"><summary>Monatlichen Vergleich für LM 1–'+result.horizon+' anzeigen</summary>'+
   '<div class="v43-table-wrap" tabindex="0" aria-label="Monatlichen Szenariovergleich horizontal verschieben"><table>'+
   '<caption>Ausgangsplan und hypothetische Alternative nach Lebensmonaten; Geldbeträge sind keine Auszahlungstermine.</caption>'+
   '<thead><tr><th scope="col">LM</th><th scope="col">Betreuung bisher</th><th scope="col">Betreuung hypothetisch</th>'+
   '<th scope="col">Einnahmen bisher</th><th scope="col">Einnahmen hypothetisch</th>'+
   '<th scope="col">Rest bisher</th><th scope="col">Rest hypothetisch</th><th scope="col">Stunden Eltern 1 / 2, hypothetisch</th></tr></thead>'+
   '<tbody>'+contents+'</tbody></table></div></details>';
 }
 function resultMarkup(result){
  const ok=result.moneyComplete;
  const note=(result.missing.length?
   '<div class="v43-issue" role="note"><strong>Für einen vollständigen finanziellen Vergleich fehlen diese ausdrücklich einzugebenden Annahmen:</strong><ul>'+
   result.missing.map(item=>'<li>'+esc43(item)+'</li>').join('')+'</ul><p>Die Betreuungsannahmen bleiben sichtbar, unvollständige Alternativeinnahmen und Restbeträge werden aber nicht als 0 Euro dargestellt.</p></div>':'');
  const delta=result.deltaTotalAvailable===null?'Gesamtbudget nicht vergleichbar':
   (result.deltaTotalAvailable>0?'+':'')+euro43(result.deltaTotalAvailable)+' Gesamtrest-Differenz';
  const inc=result.deltaTotalIncome===null?'Einnahmendifferenz nicht berechenbar':
   (result.deltaTotalIncome>0?'+':'')+euro43(result.deltaTotalIncome)+' Einnahmendifferenz vor Kosten';
  return '<h4>Unveränderter Plan und hypothetische Alternative</h4>'+
   '<p>Zeitraum LM 1–'+result.horizon+'. Kita: '+esc43(careStart(result.baselineCareStartLm))+
   ' → angenommen '+esc43(careStart(result.assumedCareStartLm))+
   '. Finanzwirkungen der geänderten Teilzeitstunden werden nur bei ausdrücklichen Nettoannahmen ausgewiesen.</p>'+
   note+
   '<div class="v43-grid">'+card('Ausgangsplan',result.baseline,result,false)+
   card('Was-wäre-wenn-Variante',result.alternative,result,true)+'</div>'+
   '<div class="v43-delta"><strong>'+esc43(delta)+'</strong>'+
   '<p>'+esc43(inc)+'. '+
   (ok?'Manuell angenommene Veränderung in '+result.changedMonths+' Lebensmonaten.':'Keine vollständige monetäre Alternative.')+
   ' Weder Anspruchsbeträge noch Zahlungstermine wurden neu berechnet.</p></div>'+
   details(result)+
   '<aside class="v43-notes"><strong>Unverbindliche Grenzen dieser Szenariorechnung</strong><ul>'+
   result.notes.map(message=>'<li>'+esc43(message)+'</li>').join('')+
   '</ul><p>*Unterdeckung: nur rechnerische laufende Monatsrestsummen, keine Bankkontostände oder Auszahlungstermine.</p></aside>';
 }
 function refresh(){
  if(!root())return;
  const wasOpen=!!el('v43Detail')?.open;
  controlAvailability();
  try{
   const result=WhatIfScenarios.projectWhatIf({...context(),assumptions:assumptions()});
   el('v43Result').innerHTML=resultMarkup(result);
   if(el('v43Detail'))el('v43Detail').open=wasOpen;
   status(result.missing.length?'Hypothetische Betreuung sichtbar; '+result.missing.length+' monetäre Annahmen fehlen.':
    result.budgetComparable?'Szenario nur als rechnerische Variante aktualisiert. Aktiver Plan unverändert.':
    'Szenario aktualisiert. Ohne vollständige Kostenangaben ist kein verfügbarer Rest berechenbar.');
  }catch(error){
   el('v43Result').innerHTML='<div class="v43-issue" role="alert"><strong>Szenario nicht berechenbar.</strong><p>'+esc43(String(error?.message||error).slice(0,220))+'</p>'+
   '<p>Bitte die gekennzeichneten Eingabebereiche prüfen. Der aktive Plan wurde nicht verändert.</p></div>';
   status('Szenario ungültig; der aktive Plan bleibt unverändert.');
  }
 }
 function reset(message){
  const ids=['v43BridgeWage','v43BridgeCare','v43FatherHours','v43FatherNet','v43MotherHours','v43MotherNet'];
  for(const id of ids)el(id).value='';
  el('v43Delay').value='0';el('v43WaiveFees').checked=false;
  el('v43ExpensesDelta').value='0';el('v43WageRisk').value='0';
  refresh();
  if(message)status(message);
 }
 function mount(){
  if(!root())return;
  root().addEventListener('input',event=>{
   if(event.target.matches('input,select'))refresh();
  });
  root().addEventListener('change',event=>{
   if(event.target.matches('input,select'))refresh();
  });
  el('v43Reset').addEventListener('click',()=>reset('Nur die hypothetischen Annahmen zurückgesetzt; der Familienplan ist unverändert.'));
 }
 const oldRender=renderAll;
 renderAll=function(...args){const outcome=oldRender(...args);refresh();return outcome;};
 return {mount,refresh,reset,onReset:()=>reset('Plan zurückgesetzt – nur die hypothetischen Annahmen verworfen.'),
  onImported:()=>reset('Plan importiert – hypothetische Annahmen verworfen.'),
  state:()=>({assumptions:assumptions(),persisted:false,appliedToPlan:false})};
})();
window.__whatIfV43=WhatIfV43;
