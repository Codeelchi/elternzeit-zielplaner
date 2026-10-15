/* V3.8 quickstart: presentation layer over V3.7 financial/legal model.
 * Never confirms legal eligibility, and never creates a second benefit formula.
 */
const QuickStartV38=(()=>{
 const templates=Object.freeze({
  classic:{model:'father12',goal:14,label:'Klassisch: 12 + 2 Monate'},
  long18:{model:'father18',goal:18,label:'18 Monate zu Hause'},
  parttime:{model:'hybridWork',goal:18,label:'ElterngeldPlus & Teilzeit'},
  shared:{model:'mother4father10',goal:14,label:'Gemeinsam aufteilen'},
  return:{model:'quickReturn',goal:14,label:'Früher zurück in den Beruf'},
  long24:{model:'father24',goal:24,label:'24 Monate ElterngeldPlus'}
 });
 const navCore=new Set(['slide-1','slide-2','slide-3','slide-5','slide-10','slide-goal']);
 const node=id=>document.getElementById(id);
 const escValue=text=>String(text).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const eur=value=>Number(value||0).toLocaleString('de-DE',{style:'currency',currency:'EUR',maximumFractionDigits:0});
 let mode='idle',selected='',expert=false;
 const costsKnown=()=>s.expenses!==''&&s.expenses!==null&&s.expenses!==undefined&&Number.isFinite(Number(s.expenses));
 const typeLabel=()=>mode==='example'?'Fiktives Beispiel':mode==='restored'?'Gespeicherter Entwurf':'Persönliche Näherung';
 function navRefresh(){
  document.body.classList.toggle('v38-lite',!expert);
  document.body.classList.toggle('v38-expert',expert);
  document.body.classList.toggle('v38-pristine',mode==='idle');
  const slides=[...document.querySelectorAll('.slide')];
  for(const btn of node('sectionNav')?.querySelectorAll('[data-slide]')||[]){
   const sl=slides[Number(btn.dataset.slide)];
   btn.hidden=!expert&&!navCore.has(sl?.id)&&Number(btn.dataset.slide)!==slideIndex;
  }
  const b=node('v38Advanced');
  if(b){b.textContent=expert?'Fachansichten ausblenden':'Fachansichten einblenden';b.setAttribute('aria-pressed',String(expert));}
 }
 function costRefresh(){
  const known=costsKnown(),strip=node('v38CostBanner');
  if(strip){
   strip.hidden=known||mode==='idle';
   strip.textContent=!known&&mode!=='idle'?'Haushaltsausgaben unbekannt: Es werden modellierte Einnahmen vor persönlichen Ausgaben gezeigt. Engpässe, Überschüsse und Rücklagen können so noch nicht zuverlässig berechnet werden.':'';
  }
  const budgetLabel=node('liveBudget')?.previousElementSibling;
  if(budgetLabel)budgetLabel.textContent=known?'Modelliertes Budget nach eingetragenen Kosten':'Einnahmen vor Haushaltsausgaben';
 }
 function firstCoverageGap(){
  const until=Math.min(36,Math.max(0,Number(s.goalCare)||0));
  const childcareStart=Number(s.childcareStart)||0;
  for(let lm=1;lm<=until;lm++){
   const r=s.schedule?.[lm-1];if(!r)return lm;
   if(offCode(r.f)||offCode(r.m)||r.m==='MS')continue;
   if(s.goalCareMode==='partial'&&childcareStart>0&&lm>=childcareStart){
    if((['R','T','Q','K'].includes(r.f)&&hoursFor(r,'f')<=32)||
       (['R','T','Q','K'].includes(r.m)&&hoursFor(r,'m')<=32))continue;
   }
   return lm;
  }
  return null;
 }
 function effectiveTemplate(){
  return templates[selected]||Object.values(templates).find(x=>x.model===s.model)||null;
 }
 function summary(){
  if(mode==='idle')return '<h3>Beispiel auswählen</h3><p>Startet ohne Eingaben. Danach könnt ihr Einkommen und Betreuungsdauer persönlich anpassen.</p>';
  if(!Array.isArray(current?.rows)||current.rows.length===0)return '<div class="v38-notice">Der Monatsplan konnte nicht berechnet werden.</div>';
  const template=effectiveTemplate();
  const until=Math.min(36,Math.max(1,Number(s.goalCare)||18));
  const rows=current.rows.slice(0,until);
  const known=costsKnown(),values=rows.map(x=>Number(known?x.cashAfter:x.income)||0);
  const min=Math.min(...values),total=values.reduce((a,b)=>a+b,0);
  const gap=firstCoverageGap(),covered=gap===null;
  const legal=current.validation?.status||'NICHT_UNTERSTUETZT';
  const year=Number(String(s.date).slice(0,4));
  const notices=[];
  if(mode==='example')notices.push('Erfundene Einkommensdaten und unverbindliche Beispielannahmen. Dieser Plan wurde nicht aus euren Angaben erstellt und nicht gespeichert.');
  if(mode==='personal')notices.push('Elterngeld-Netto vorläufig gleich Auszahlungsnetto angesetzt. Das ist keine behördliche Berechnung; für einen Antrag muss das pauschalierte Netto gesondert ermittelt werden.');
  if(mode==='restored')notices.push('Gespeicherter Entwurf, noch keine bestätigte amtliche Berechnung. Persönliche Zahlen und Leistungen separat prüfen.');
  if(!known)notices.push('Haushaltsausgaben fehlen: Die angezeigten Beträge sind Einnahmen, kein frei verfügbares Budget. Rücklagen und Engpassmonate sind nicht belastbar.');
  if(!covered)notices.push('Betreuungslücke ab LM '+gap+': Die gewählte Vorlage sichert die Betreuung bis LM '+until+' nicht durchgehend. Es ist weitere Betreuung oder ein anderes Modell nötig.');
  if(year>2026)notices.push('Geburtsjahr '+year+': Diese Modellrechnung ist eine unverbindliche Zukunftsprognose. Die Rechtsregeln für diese Geburtskohorte wurden nicht abschließend bestätigt.');
  if(legal!=='PLAUSIBEL_STANDARD')notices.push('Regelprüfung: '+legal+'. Kein Bewilligungsanspruch und kein positiv rechtlich geprüfter Plan.');
  const match=until<=14?'classic':until<=20?'long18':until<=26?'long24':null;
  const alternative=!covered&&match&&templates[match]?.model!==s.model?
    '<button class="navbtn alt" type="button" data-v38-match="'+match+'">Passende längere Vorlage ansehen</button>':'';
  const missingLong=!covered&&!match?'<p class="v38-caption">Für dieses lange Betreuungsziel gibt es noch keine fertige Schnellstart-Vorlage. Verwendet den Monatskonfigurator oder die Zielsuche; die Betreuung bleibt bis dahin ungeklärt.</p>':'';
  return '<h3>'+escValue(typeLabel()+' · '+(template?.label||'Individueller Plan'))+'</h3>'+
    '<p class="v38-caption">Die Werte beschreiben '+until+' Kindeslebensmonate, keine feststehenden Geldeingangstermine.</p>'+
    '<div class="v38-kpis">'+
      '<div class="v38-kpi"><span>Betreuung bis Zielalter</span><strong>'+(covered?'Rechnerisch ja':'Lücke / offen')+'</strong></div>'+
      '<div class="v38-kpi"><span>'+(known?'Niedrigster Monat nach Annahmen':'Niedrigste Monatseinnahmen')+'</span><strong>'+eur(min)+'</strong></div>'+
      '<div class="v38-kpi"><span>'+(known?'Summe nach eingegebenen Kosten':'Gesamteinnahmen vor Ausgaben')+'</span><strong>'+eur(total)+'</strong></div>'+
      '<div class="v38-kpi"><span>Rechtsstatus</span><strong style="font-size:14px">'+escValue(year>2026?'2027+ · unverbindlich':legal==='PLAUSIBEL_STANDARD'?'Standardregeln plausibel':'Nicht freigegeben')+'</strong></div>'+
    '</div>'+
    '<p class="v38-caption">'+(known?'Ergebnis nach eingegebenen Haushalts- und Kita-Annahmen; weitere Kosten/Steuern/Versicherungen möglich.':'Persönliche Haushaltsausgaben sind unbekannt. Deshalb keine Aussage über verfügbares Restbudget oder notwendige Rücklagen.')+'</p>'+
    notices.map(t=>'<div class="v38-notice">'+escValue(t)+'</div>').join('')+
    '<div class="v38-footer-actions">'+alternative+missingLong+
    '<button class="navbtn alt" type="button" data-v38-goto="slide-4">Lebensmonate ansehen</button>'+
    '<button class="navbtn alt" type="button" data-v38-goto="slide-2">Einkommen genauer eingeben</button>'+
    '<button class="navbtn alt" type="button" data-v38-goto="slide-10">Regelprüfung ansehen</button></div>';
 }
 function refresh(){
  if(!node('v38QuickStart'))return;
  navRefresh();costRefresh();
  const output=node('v38Summary');if(output)output.innerHTML=summary();
  for(const b of node('v38Templates')?.querySelectorAll('[data-v38-template]')||[]){
   b.setAttribute('aria-pressed',String(b.dataset.v38Template===selected));
  }
 }
 function showSummary(){
  node('v38Summary')?.scrollIntoView?.({behavior:'smooth',block:'nearest'});
 }
 function loadTemplate(id){
  const template=templates[id];
  if(!template)throw new RangeError('Unbekannte Schnellstart-Vorlage');
  const personal=mode==='personal'||mode==='restored';
  if(!personal){
   // Explicit demo selection never overwrites a consented personal local copy.
   for(const key of Object.keys(s))delete s[key];
   Object.assign(s,clone(defaults),{storageConsent:false,standardCaseConfirmed:null,zve:'',expenses:'',incomeEntryMode:'estimate'});
   mode='example';node('localSave').checked=false;
   s.goalCare=template.goal;
  }
  selected=id;
  chooseModel(template.model); // Existing financial, timeline and legal engine.
  refresh();showSummary();
 }
 function parseMoney(id,optional=false){
  const raw=node(id)?.value.trim()||'';
  if(optional&&raw==='')return '';
  if(!raw)throw new Error('Bitte das Netto beider Elternteile eingeben.');
  const n=Number(raw);
  if(!Number.isFinite(n)||n<0||n>100000)throw new Error('Bitte einen gültigen Eurobetrag von 0 bis 100.000 eingeben.');
  return n;
 }
 function personalSubmit(evt){
  evt.preventDefault();
  const error=node('v38PersonalError');if(error)error.textContent='';
  try{
   const date=node('v38Birth')?.value;
   TimeAxes.lifeMonths(date,1);
   const n1=parseMoney('v38NetF'),n2=parseMoney('v38NetM'),expenses=parseMoney('v38Expenses',true);
   const goal=Number(node('v38Goal')?.value);
   if(![14,18,24,30,36].includes(goal))throw new Error('Bitte eine Betreuungsdauer auswählen.');
   Object.assign(s,{date,netFather:n1,netMother:n2,egNetFather:n1,egNetMother:n2,
     expenses,goalCare:goal,incomeEntryMode:'estimate',standardCaseConfirmed:null,zve:''});
   mode='personal';
   selected=selected|| (goal<=14?'classic':goal<=20?'long18':'long24');
   chooseModel(templates[selected].model);
   refresh();showSummary();
  }catch(e){if(error)error.textContent=e.message;}
 }
 function mount(){
  if(!node('v38QuickStart'))return;
  if(s.storageConsent){mode='restored';selected=Object.keys(templates).find(id=>templates[id].model===s.model)||'';}
  node('v38Templates').querySelectorAll('button[data-v38-template]').forEach(b=>b.addEventListener('click',()=>loadTemplate(b.dataset.v38Template)));
  node('v38EditOwn')?.addEventListener('click',()=>{const panel=node('v38Personal');panel.open=true;node('v38Birth')?.focus();});
  node('v38Advanced')?.addEventListener('click',()=>{expert=!expert;refresh();});
  node('v38PersonalForm')?.addEventListener('submit',personalSubmit);
  node('v38QuickStart').addEventListener('click',evt=>{
   const match=evt.target.closest?.('[data-v38-match]');
   if(match){loadTemplate(match.dataset.v38Match);return;}
   const goto=evt.target.closest?.('[data-v38-goto]');
   if(!goto)return;
   const index=[...document.querySelectorAll('.slide')].findIndex(sl=>sl.id===goto.dataset.v38Goto);
   if(index>=0)showSlide(index);
  });
  node('btnReset')?.addEventListener('click',()=>{mode='idle';selected='';refresh();});
  // Blank on the first visit: the example numbers aren't a person's data.
  node('v38Birth').value=mode==='restored'?s.date:'';
  node('v38NetF').value=mode==='restored'?String(s.netFather):'';
  node('v38NetM').value=mode==='restored'?String(s.netMother):'';
  node('v38Goal').value=String(s.goalCare||18);
  node('v38Expenses').value=mode==='restored'&&costsKnown()?String(s.expenses):'';
  refresh();
 }
 return {mount,refresh,loadTemplate,submit:personalSubmit,templates,
   state:()=>({mode,selected,expert,costsKnown:costsKnown(),careCovered:mode==='idle'?null:firstCoverageGap()===null}),
   summary:()=>node('v38Summary')?.textContent||''};
})();
const v38OriginalRenderAll=renderAll;
renderAll=function(...args){const r=v38OriginalRenderAll(...args);QuickStartV38.refresh();return r;};
const v38OriginalShowSlide=showSlide;
showSlide=function(...args){const r=v38OriginalShowSlide(...args);QuickStartV38.refresh();return r;};
window.__elternzeitV38=QuickStartV38;