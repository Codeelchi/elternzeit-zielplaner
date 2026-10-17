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
 let lastEstimated={father:null,mother:null},wizardCompleted=false,formDirty=false;
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
 // V3.11: deterministic continuity check of existing monthly output, not a new legal calculation.
 function bridgeAnalysis(delay=0){
  const until=Math.min(36,Math.max(1,Number(s.goalCare)||18));
  const start=Number(s.childcareStart)||0;
  const simulatedStart=start>0?Math.min(36,start+delay):0;
  const fullFree=r=>!!r&&(offCode(r.f)||offCode(r.m)||r.m==='MS');
  const partAvailable=r=>!!r&&(['R','T','Q','K'].includes(r.f)&&hoursFor(r,'f')<=32||
                                         ['R','T','Q','K'].includes(r.m)&&hoursFor(r,'m')<=32);
  const gaps=[],cashDeficits=[];
  const known=costsKnown();
  for(let lm=1;lm<=until;lm++){
   const r=s.schedule?.[lm-1],row=current?.rows?.[lm-1];
   const covered=fullFree(r)||(s.goalCareMode==='partial'&&simulatedStart>0&&lm>=simulatedStart&&partAvailable(r));
   if(!covered)gaps.push(lm);
   if(known&&row&&Number.isFinite(Number(row.cashAfter))&&Number(row.cashAfter)<0)
    cashDeficits.push({lm,amount:Number(row.cashAfter)});
  }
  const ranges=months=>{
   const result=[];for(const lm of months){const last=result[result.length-1];if(last&&lm===last[1]+1)last[1]=lm;else result.push([lm,lm]);}
   return result;
  };
  return {until,start,simulatedStart,gaps,gapRanges:ranges(gaps),cashDeficits,deficitRanges:ranges(cashDeficits.map(x=>x.lm)),costsKnown:known};
 }
 function bridgeMarkup(){
  const baseline=bridgeAnalysis(),delayed=bridgeAnalysis(2);
  const formatRanges=rs=>rs.map(([a,b])=>a===b?'LM '+a:'LM '+a+'–'+b).join(', ');
  const cash=baseline.costsKnown?(baseline.cashDeficits.length?
     'Negatives Modellbudget in '+formatRanges(baseline.deficitRanges)+'. Dies ist kein Beleg für einen tatsächlichen Zahlungsengpass.':
     'In den ausgewerteten Lebensmonaten kein negatives Modellbudget nach eingegebenen Kosten.') :
     'Ausgaben fehlen: keine belastbare Aussage zu negativen Monatsbudgets.';
  const delay=baseline.start>0&&baseline.start<=baseline.until?
    '<p><strong>Wenn die Kita zwei Lebensmonate später beginnt (LM '+delayed.simulatedStart+'):</strong> '+
    (delayed.gaps.length?escValue(formatRanges(delayed.gapRanges))+' mit rechnerisch ungeklärter Betreuung.':'Nach dieser vereinfachten Stundenannahme keine weitere Betreuungslücke.')+
    ' Kita-Beiträge, Arbeitszeiten und Leistungen werden in diesem Vergleich <strong>nicht</strong> neu berechnet.</p>':
    '<p>Für den Vergleich mit einem verspäteten Kita-Start zunächst einen Kita-Lebensmonat und ggf. die Teilzeitbetreuung in den Fachansichten erfassen.</p>';
  return '<section class="v310-next" aria-label="Übergang von Elterngeld zu Betreuung und Beruf"><h4>Betreuung und finanzieller Übergang</h4>'+
    '<p>Bis LM '+baseline.until+': '+(baseline.gaps.length?'Rechnerisch nicht abgedeckt: '+escValue(formatRanges(baseline.gapRanges))+'.':'Keine ungedeckten Lebensmonate gemäß den vereinfachten Planannahmen.')+'</p>'+
    '<p>'+escValue(cash)+'</p>'+delay+
    '<p class="v38-caption">Eine Kita-Vormerkung ist keine Platzzusage. Die Übersicht prüft vereinfachte Monatsbetreuung, keine tatsächlichen Wochenstunden, Eingewöhnung, Zahlungstermine oder verbindlichen Ansprüche.</p>'+
    '<button class="navbtn alt" type="button" data-v38-goto="slide-region">Kita-Annahmen bearbeiten</button></section>';
 }
 function effectiveTemplate(){
  return templates[selected]||Object.values(templates).find(x=>x.model===s.model)||null;
 }
 // Checklist reflects the central validator, never a second legal decision.
 function nextSteps(){
  const findings=Array.isArray(current?.validation?.findings)?current.validation.findings:[];
  const steps=[];
  const add=(key,label,slide,focus)=>steps.push({key,label,slide,focus});
  if(findings.some(x=>x.code==='STANDARD_CASE_UNCONFIRMED'||x.code==='STANDARD_CASE_DECLINED'))
   add('standard','Passt eure Familie zum unterstützten Standardfall?','slide-2','standardCaseConfirmed');
  if(findings.some(x=>x.code==='INCOME_LIMIT_DATA_MISSING'||x.code==='INCOME_LIMIT_EXCEEDED'))
   add('income-limit','Zu versteuerndes Vorjahreseinkommen klären (nicht Auszahlungsnetto).','slide-region','zve');
  if(findings.some(x=>x.code.startsWith('FINANCIAL_INPUT_INVALID_'))||s.incomeEntryMode==='estimate')
   add('netto','Elterngeld-Netto und Teilzeitannahmen prüfen – Auszahlungsnetto ist nur eine Näherung.','slide-2','egNetFather');
  if(!costsKnown())add('budget','Haushaltsausgaben ergänzen, bevor ihr Rücklagen und Engpässe vergleicht.','slide-2','expenses');
  const gap=firstCoverageGap();
  if(gap!==null)add('care','Betreuung ab Lebensmonat '+gap+' organisieren oder Monatsplan ändern.','slide-4','');
  // Other findings remain available, including unsupported birth cohorts.
  if(findings.some(x=>!['STANDARD_CASE_UNCONFIRMED','STANDARD_CASE_DECLINED','INCOME_LIMIT_DATA_MISSING','INCOME_LIMIT_EXCEEDED'].includes(x.code)&&!x.code.startsWith('FINANCIAL_INPUT_INVALID_')))
   add('rules','Weitere Regelhinweise und betroffene Lebensmonate ansehen.','slide-10','');
  return steps;
 }
 function nextStepsMarkup(){
  const steps=nextSteps();
  return '<section class="v310-next" aria-label="Nächste Schritte für euren Entwurf"><h4>Nächste Schritte</h4>'+
   '<p class="v38-caption">'+(steps.length?steps.length+' offene Prüfpunkte. Ihr könnt sie in beliebiger Reihenfolge bearbeiten.':'Keine offenen Punkte in dieser Kurzprüfung. Schätzungen, Quellenstand und vollständige Regelprüfung trotzdem beachten.')+' Dies ist keine Freigabe oder Antragsprüfung.</p>'+
   (steps.length?'<ul>'+steps.map(x=>'<li><button type="button" data-v38-goto="'+x.slide+'"'+(x.focus?' data-v310-focus="'+x.focus+'"':'')+'><span>'+escValue(x.label)+'</span><span aria-hidden="true"> →</span></button></li>').join('')+'</ul>':'')+'</section>';
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
  if(mode==='personal'&&wizardCompleted)notices.push('Elterngeld-Netto vorläufig gleich Auszahlungsnetto aus der Schnelleingabe geschätzt. Manuell geänderte Fachwerte werden nicht automatisch ersetzt.');
  if(mode==='personal'&&!wizardCompleted)notices.push('Teilweise angepasstes Beispiel: Nicht selbst eingegebene Werte stammen weiterhin aus einer fiktiven Vorlage. Bitte alle weiteren Annahmen kontrollieren.');
  if(mode==='restored')notices.push('Gespeicherter Entwurf, noch keine bestätigte amtliche Berechnung. Persönliche Zahlen und Leistungen separat prüfen.');
  if(!known)notices.push('Haushaltsausgaben fehlen: Die angezeigten Beträge sind Einnahmen, kein frei verfügbares Budget. Rücklagen und Engpassmonate sind nicht belastbar.');
  if(!covered)notices.push('Betreuungslücke ab LM '+gap+': Die gewählte Vorlage sichert die Betreuung bis LM '+until+' nicht durchgehend. Es ist weitere Betreuung oder ein anderes Modell nötig.');
  if(year>2026)notices.push('Geburtsjahr '+year+': Diese Modellrechnung ist eine unverbindliche Zukunftsprognose. Die Rechtsregeln für diese Geburtskohorte wurden nicht abschließend bestätigt.');
  if(legal!=='PLAUSIBEL_STANDARD')notices.push('Regelprüfung: '+legal+'. Kein Bewilligungsanspruch und kein positiv rechtlich geprüfter Plan.');
  if(template&&Number(template.goal)!==until)
   notices.push('Vorlagenzeitraum: '+template.goal+' Lebensmonate. Ihr berechnet derzeit '+until+' Lebensmonate. Die Vorlage wurde nicht automatisch an euer Ziel angepasst.');
  const match=until<=14?'classic':until<=20?'long18':until<=26?'long24':null;
  const alternative=!covered&&match&&templates[match]?.model!==s.model?
    '<button class="navbtn alt" type="button" data-v38-match="'+match+'">Passende längere Vorlage ansehen</button>':'';
  const align=template&&template.goal!==until?
    '<button class="navbtn alt" type="button" data-v39-sync-goal="'+escValue(selected)+'">Ziel auf '+template.goal+' Monate setzen</button>':'';
  const missingLong=!covered&&!match?'<p class="v38-caption">Für dieses lange Betreuungsziel gibt es noch keine fertige Schnellstart-Vorlage. Verwendet den Monatskonfigurator oder die Zielsuche; die Betreuung bleibt bis dahin ungeklärt.</p>':'';
  return '<h3>'+escValue(typeLabel()+' · '+(template?.label||'Individueller Plan'))+'</h3>'+
    '<p class="v38-caption">Ausgewertet: '+until+' Kindeslebensmonate'+(template?' · Vorlagenmodell: '+template.goal+' Monate':'')+'. Die Werte sind keine feststehenden Geldeingangstermine.</p>'+
    '<div class="v38-kpis">'+
      '<div class="v38-kpi"><span>Betreuung bis Zielalter</span><strong>'+(covered?'Rechnerisch ja':'Lücke / offen')+'</strong></div>'+
      '<div class="v38-kpi"><span>'+(known?'Niedrigster Monat nach Annahmen':'Niedrigste Monatseinnahmen')+'</span><strong>'+eur(min)+'</strong></div>'+
      '<div class="v38-kpi"><span>'+(known?'Summe nach eingegebenen Kosten':'Gesamteinnahmen vor Ausgaben')+'</span><strong>'+eur(total)+'</strong></div>'+
      '<div class="v38-kpi"><span>Rechtsstatus</span><strong style="font-size:14px">'+escValue(year>2026?'2027+ · unverbindlich':legal==='PLAUSIBEL_STANDARD'?'Standardregeln plausibel':'Nicht freigegeben')+'</strong></div>'+
    '</div>'+
    '<p class="v38-caption">'+(known?'Ergebnis nach eingegebenen Haushalts- und Kita-Annahmen; weitere Kosten/Steuern/Versicherungen möglich.':'Persönliche Haushaltsausgaben sind unbekannt. Deshalb keine Aussage über verfügbares Restbudget oder notwendige Rücklagen.')+'</p>'+
    notices.map(t=>'<div class="v38-notice">'+escValue(t)+'</div>').join('')+
    nextStepsMarkup()+bridgeMarkup()+
    '<details class="v39-assumptions"><summary>Welche Zahlen und Annahmen stecken dahinter?</summary>'+
      '<p>Geburtstermin: '+escValue(s.date)+' · Auszahlungsnetto Elternteil 1: '+eur(s.netFather)+' · Elternteil 2: '+eur(s.netMother)+'.</p>'+
      '<p>Verwendetes Elterngeld-Netto (noch nicht automatisch amtlich ermittelt): '+eur(s.egNetFather)+' und '+eur(s.egNetMother)+'. Kindergeldansatz: '+eur(s.kind)+' monatlich.</p>'+
      '<p>Haushaltsausgaben: '+(known?eur(s.expenses)+' pro Monat':'nicht angegeben')+'. Zusätzliche Kosten und Leistungs-/Steuereffekte können fehlen. Monatlicher Leistungsanspruch ist kein Auszahlungstermin.</p></details>'+
    '<div class="v38-footer-actions">'+alternative+align+missingLong+
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
  if(personal&&s.model==='custom'&&!confirm('Diese Vorlage ersetzt eure individuelle Monatsaufteilung. Wirklich übernehmen?'))return;
  if(!personal){
   // Explicit demo selection never overwrites a consented personal local copy.
   for(const key of Object.keys(s))delete s[key];
   Object.assign(s,clone(defaults),{storageConsent:false,standardCaseConfirmed:null,zve:'',expenses:'',incomeEntryMode:'estimate'});
   mode='example';node('localSave').checked=false;
   s.goalCare=template.goal;lastEstimated={father:null,mother:null};wizardCompleted=false;
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
 function invalidField(id,message){
  const input=node(id),error=node('v38PersonalError');
  if(error)error.textContent=message;
  if(input){
   input.setAttribute('aria-invalid','true');
   input.setAttribute('aria-describedby','v38PersonalError');
   input.focus();
  }
 }
 function clearFieldErrors(){
  if(node('v38PersonalError'))node('v38PersonalError').textContent='';
  for(const id of ['v38Birth','v38NetF','v38NetM','v38Goal','v38Expenses'])
   {const input=node(id);input?.removeAttribute('aria-invalid');input?.removeAttribute('aria-describedby');}
 }
 function personalSubmit(evt){
  evt.preventDefault();
  clearFieldErrors();
  let date,n1,n2,expenses,goal;
  try{date=node('v38Birth')?.value;TimeAxes.lifeMonths(date,1);}
  catch(e){invalidField('v38Birth','Bitte einen gültigen Geburtstermin eintragen.');return;}
  for(const [id,field]of [['v38NetF','n1'],['v38NetM','n2'],['v38Expenses','expenses']]){
   try{
    const amount=parseMoney(id,id==='v38Expenses');
    if(field==='n1')n1=amount;else if(field==='n2')n2=amount;else expenses=amount;
   }catch(e){invalidField(id,e.message);return;}
  }
  goal=Number(node('v38Goal')?.value);
  if(![14,18,24,30,36].includes(goal)){invalidField('v38Goal','Bitte eine Betreuungsdauer auswählen.');return;}
  const first=mode==='idle',firstOwn=mode==='idle'||mode==='example';
  // All validation happens before the state is changed; repeated submissions
  // modify exactly the five short-form fields and preserve month-level edits.
  if(firstOwn){
   s.egNetFather=n1;s.egNetMother=n2;
   s.incomeEntryMode='estimate';s.standardCaseConfirmed=null;s.zve='';
   lastEstimated={father:n1,mother:n2};
  }else{
   // Only values known to originate from this wizard may be auto-refreshed.
   if(lastEstimated.father!==null&&s.egNetFather===lastEstimated.father){s.egNetFather=n1;lastEstimated.father=n1;}
   if(lastEstimated.mother!==null&&s.egNetMother===lastEstimated.mother){s.egNetMother=n2;lastEstimated.mother=n2;}
  }
  Object.assign(s,{date,netFather:n1,netMother:n2,expenses,goalCare:goal});
  wizardCompleted=true;formDirty=false;
  if(first){
   selected=goal<=14?'classic':goal<=20?'long18':'long24';
   // Initial creation explicitly chooses a starting template.
   chooseModel(templates[selected].model);
  }else{
   // A repeat edit is NOT consent to replace a chosen or custom schedule.
   renderAll();persist();
  }
  mode='personal';refresh();showSummary();
 }
 function syncPersonalForm(){
  if(!['personal','restored'].includes(mode))return;
  for(const [id,v]of [['v38Birth',s.date],['v38NetF',s.netFather],['v38NetM',s.netMother],['v38Goal',s.goalCare],['v38Expenses',costsKnown()?s.expenses:'']])
   node(id).value=String(v);
 }
 function markPersonal(){
  if(s.model==='custom')selected='';
  if(mode!=='personal'){mode='personal';wizardCompleted=false;}
  if(!formDirty&&node('v38Personal')?.open)syncPersonalForm();
  refresh();
 }
 function onResetConfirmed(){
  mode='idle';selected='';wizardCompleted=false;formDirty=false;lastEstimated={father:null,mother:null};
  clearFieldErrors();
  for(const id of ['v38Birth','v38NetF','v38NetM','v38Expenses'])node(id).value='';
  node('v38Goal').value='18';
  refresh();
 }
 function onModelChanged(id){
  selected=Object.keys(templates).find(key=>templates[key].model===id)||'';
  if(mode==='idle')mode='example';
  refresh();
 }
 function onImported(){
  mode='personal';selected=Object.keys(templates).find(key=>templates[key].model===s.model)||'';
  lastEstimated={father:null,mother:null};wizardCompleted=false;formDirty=false;syncPersonalForm();refresh();
 }
 function mount(){
  if(!node('v38QuickStart'))return;
  if(s.storageConsent){mode='restored';selected=Object.keys(templates).find(id=>templates[id].model===s.model)||'';}
  node('v38Templates').querySelectorAll('button[data-v38-template]').forEach(b=>b.addEventListener('click',()=>loadTemplate(b.dataset.v38Template)));
  node('v38PersonalForm')?.querySelectorAll('input,select').forEach(input=>input.addEventListener('input',()=>{formDirty=true;}));
  node('v38EditOwn')?.addEventListener('click',()=>{
   const panel=node('v38Personal');if(!formDirty)syncPersonalForm();
   panel.open=true;node('v38Birth')?.focus();
  });
  const mobileMenu=node('v39MobileMenu'),mobileActions=node('topActions');
  const closeMobile=()=>{mobileActions?.classList.remove('v39-open');mobileMenu?.setAttribute('aria-expanded','false');};
  mobileMenu?.addEventListener('click',()=>{
   const open=mobileActions.classList.toggle('v39-open');mobileMenu.setAttribute('aria-expanded',String(open));
  });
  document.addEventListener('keydown',evt=>{if(evt.key==='Escape')closeMobile();});
  document.addEventListener('click',evt=>{if(!evt.target.closest?.('#topActions,#v39MobileMenu'))closeMobile();});
  const privacy=node('v39PrivacyToggle');
  privacy?.addEventListener('click',()=>{
   const el=document.querySelector('.privacy-strip'),open=el.classList.toggle('v39-open');
   privacy.setAttribute('aria-expanded',String(open));
  });
  node('v38Advanced')?.addEventListener('click',()=>{expert=!expert;refresh();});
  node('v38PersonalForm')?.addEventListener('submit',personalSubmit);
  node('v38QuickStart').addEventListener('click',evt=>{
   const match=evt.target.closest?.('[data-v38-match]');
   if(match){loadTemplate(match.dataset.v38Match);return;}
   const sync=evt.target.closest?.('[data-v39-sync-goal]');
   if(sync&&templates[sync.dataset.v39SyncGoal]){
    s.goalCare=templates[sync.dataset.v39SyncGoal].goal;
    node('v38Goal').value=String(s.goalCare);
    renderAll();persist();showSummary();return;
   }
   const goto=evt.target.closest?.('[data-v38-goto]');
   if(!goto)return;
   const index=[...document.querySelectorAll('.slide')].findIndex(sl=>sl.id===goto.dataset.v38Goto);
   if(index>=0){
    showSlide(index);
    const target=node(goto.dataset.v310Focus);
    if(target){target.focus();target.scrollIntoView?.({behavior:'smooth',block:'center'});}
   }
  });
  // Edits in the existing expert UI must not remain labelled as untouched demo data.
  document.querySelectorAll('[data-field],[data-extra],[data-profile]').forEach(input=>input.addEventListener('input',markPersonal));
  node('standardCaseConfirmed')?.addEventListener('change',markPersonal);
  for(const [id,parent] of [['egNetFather','father'],['egNetMother','mother']])
   node(id)?.addEventListener('input',()=>{lastEstimated[parent]=null;});
  // Reset callback runs only after the central confirm() returned true.
  // Blank on the first visit: the example numbers aren't a person's data.
  node('v38Birth').value=mode==='restored'?s.date:'';
  node('v38NetF').value=mode==='restored'?String(s.netFather):'';
  node('v38NetM').value=mode==='restored'?String(s.netMother):'';
  node('v38Goal').value=String(s.goalCare||18);
  node('v38Expenses').value=mode==='restored'&&costsKnown()?String(s.expenses):'';
  refresh();
 }
 return {mount,refresh,loadTemplate,submit:personalSubmit,templates,markPersonal,onModelChanged,onImported,onResetConfirmed,
   nextSteps:()=>nextSteps(),
   state:()=>({mode,selected,expert,costsKnown:costsKnown(),careCovered:mode==='idle'?null:firstCoverageGap()===null}),
   summary:()=>node('v38Summary')?.textContent||''};
})();
const v38OriginalRenderAll=renderAll;
renderAll=function(...args){
 const r=v38OriginalRenderAll(...args);
 if(s.model==='custom'&&(QuickStartV38.state().mode==='example'||QuickStartV38.state().selected))QuickStartV38.markPersonal();
 QuickStartV38.refresh();return r;
};
const v38OriginalShowSlide=showSlide;
showSlide=function(...args){const r=v38OriginalShowSlide(...args);QuickStartV38.refresh();return r;};
const v38OriginalChooseModel=chooseModel;
chooseModel=function(...args){const r=v38OriginalChooseModel(...args);QuickStartV38.onModelChanged(args[0]);return r;};
window.__elternzeitV38=QuickStartV38;