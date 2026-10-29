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
 const eur=value=>Number(value||0).toLocaleString('de-DE',{style:'currency',currency:'EUR',minimumFractionDigits:2,maximumFractionDigits:2});
 let mode='idle',selected='',expert=false;
 let lastEstimated={father:null,mother:null},wizardCompleted=false,formDirty=false;
 let scenarioDelay=2,goalFormDirty=false,goalWizardUsed=false;
 let scenarioLost='',scenarioExtra='',scenarioFeesWaived=false;
 const costsKnown=()=>s.expenses!==''&&s.expenses!==null&&s.expenses!==undefined&&Number.isFinite(Number(s.expenses));
 const typeLabel=()=>mode==='example'?'Fiktives Beispiel':mode==='restored'?(PUBLIC_TEST_PREVIEW?'Geladener Testentwurf':'Geladener Entwurf'):(PUBLIC_TEST_PREVIEW?'Angepasstes Testbeispiel':'Persönliche Näherung');
 // The six common steps are a real sequential route, not a subsequence of
 // 16 expert-only slide numbers. A detail slide explicitly opened from a
 // checklist remains visible as an extra step until the next navigation.
 function visibleSlideIndices(){
  const slides=[...document.querySelectorAll('.slide')];
  return slides.map((_,i)=>i).filter(i=>expert||navCore.has(slides[i].id)||i===slideIndex);
 }
 function navRefresh(){
  document.body.classList.toggle('v38-lite',!expert);
  document.body.classList.toggle('v38-expert',expert);
  document.body.classList.toggle('v38-pristine',mode==='idle');
  const wishContext=node('v42EntryContext');
  if(wishContext)wishContext.textContent=PUBLIC_TEST_PREVIEW?'Öffentliche Testvorschau: ausschließlich fiktive Angaben verwenden. Eure Wünsche bleiben getrennt vom aktuellen Testplan.':mode==='idle'?'Ihr seht zunächst einen fiktiven Beispielplan. Wünsche bleiben getrennt; persönliche Zahlen könnt ihr im Schnellstart ergänzen.':mode==='example'?'Ihr seht einen fiktiven Beispielplan. Wünsche bleiben getrennt und ändern ihn nicht.':'Der Wunschkalender vergleicht eure Eingaben mit Vorlagen; euer aktueller Plan bleibt zunächst unverändert.';
  const slides=[...document.querySelectorAll('.slide')],indices=visibleSlideIndices();
  for(const btn of node('sectionNav')?.querySelectorAll('[data-slide]')||[]){
   const i=Number(btn.dataset.slide),order=indices.indexOf(i),extra=!expert&&!navCore.has(slides[i]?.id);
   btn.hidden=order<0;
   btn.textContent=order<0?'':String(order+1).padStart(2,'0')+' '+(extra?'Detail: ':'')+String(slides[i]?.dataset.title||'Ansicht');
   if(i===slideIndex)btn.setAttribute('aria-current','step');else btn.removeAttribute('aria-current');
  }
  const position=indices.indexOf(slideIndex);
  if(position>=0&&indices.length){
   node('counter').textContent=(position+1)+' / '+indices.length;
   node('progress').style.width=100*(position+1)/indices.length+'%';
   node('previous').disabled=position===0;
   node('next').disabled=position===indices.length-1;
  }
  for(const b of [node('v38Advanced'),node('v41ModeToggle')]){
   if(b){b.textContent=expert?'Fachansichten ausblenden':'Fachansichten einblenden';b.setAttribute('aria-pressed',String(expert));}
  }
 }
 // The original previous/next listeners navigate raw slide indices. Override
 // just those clicks while the simple path is active; expert mode is unchanged.
 function simpleStep(direction,event){
  if(expert)return;
  const indices=visibleSlideIndices(),position=indices.indexOf(slideIndex);
  if(position<0)return;
  event.preventDefault();event.stopImmediatePropagation();
  const next=indices[position+direction];
  if(next!==undefined)showSlide(next);
 }

 function costRefresh(){
  const known=costsKnown(),strip=node('v38CostBanner');
  if(strip){
   strip.hidden=known||mode==='idle';
   strip.textContent=!known&&mode!=='idle'?(PUBLIC_TEST_PREVIEW?'Fiktive Haushaltsausgaben fehlen. Der Plan zeigt nur Modelleinnahmen und kein geprüftes Budget.':'Haushaltsausgaben unbekannt: Es werden modellierte Einnahmen vor persönlichen Ausgaben gezeigt. Engpässe, Überschüsse und Rücklagen können so noch nicht zuverlässig berechnet werden.') :'';
  }
  const budgetLabel=node('liveBudget')?.previousElementSibling;
  if(budgetLabel)budgetLabel.textContent=known?'Rest nach eingetragenen Haushalts- und Kita-Kosten / LM':'Einnahmen vor Haushalts- und Kita-Kosten / LM';
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
  const simulatedStart=start>0?start+delay:0;
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
 function bridgeResultMarkup(){
  const baseline=bridgeAnalysis(),delayed=bridgeAnalysis(scenarioDelay);
  const formatRanges=rs=>rs.map(([a,b])=>a===b?'LM '+a:'LM '+a+'–'+b).join(', ');
  const newlyOpen=delayed.gaps.filter(lm=>!baseline.gaps.includes(lm));
  const newlyRanges=bridgeAnalysisRanges(newlyOpen);
  const cash=baseline.costsKnown?(baseline.cashDeficits.length?
     'Negativer Rest nach Haushalts- und Kita-Kosten in '+formatRanges(baseline.deficitRanges)+'. Dies ist kein Beleg für einen tatsächlichen Zahlungsengpass.':
     'In den ausgewerteten Lebensmonaten kein negativer Rest nach Haushalts- und Kita-Kosten.') :
     'Ausgaben fehlen: keine belastbare Aussage zu negativen Restbeträgen.';
  const delayText=scenarioDelay===0?'wie geplant':scenarioDelay===1?'einen Lebensmonat':
    scenarioDelay===2?'zwei Lebensmonate':scenarioDelay===3?'drei Lebensmonate':scenarioDelay+' Lebensmonate';
  const summary=delayed.gaps.length?
    'Insgesamt ungeklärt: '+escValue(formatRanges(delayed.gapRanges))+'. ':
    'Gemäß der vereinfachten Monatsbetrachtung keine offenen Betreuungsmonate. ';
  const additional=scenarioDelay===0?'Keine zeitliche Verschiebung gegenüber der ursprünglichen Planung.':
     newlyOpen.length?'Zusätzlich gegenüber dem ursprünglichen Plan: '+escValue(formatRanges(newlyRanges))+'.':
     'Keine zusätzlichen Betreuungslücken gegenüber dem ursprünglichen Plan.';
  const delay=baseline.start>0&&baseline.start<=baseline.until?
    '<p><strong>Wenn die Kita '+delayText+(scenarioDelay===0?' startet':' später beginnt')+
    ' (LM '+delayed.simulatedStart+'):</strong> '+summary+additional+'</p>'+
    '<p>Kita-Beiträge, Arbeitszeiten und Leistungen werden in diesem Vergleich <strong>nicht</strong> neu berechnet.</p>':
    '<p>Für den Vergleich mit einem verspäteten Kita-Start zunächst einen Kita-Lebensmonat und ggf. die Teilzeitbetreuung in den Fachansichten erfassen.</p>';
  return '<p>Bis LM '+baseline.until+': '+(baseline.gaps.length?
      'Rechnerisch nicht abgedeckt: '+escValue(formatRanges(baseline.gapRanges))+'.':
      'Keine ungedeckten Lebensmonate gemäß den vereinfachten Planannahmen.')+'</p>'+
    '<p>'+escValue(cash)+'</p>'+delay+
    '<p class="v38-caption">Eine Kita-Vormerkung ist keine Platzzusage. Die Übersicht prüft vereinfachte Monatsbetreuung, keine tatsächlichen Wochenstunden, Eingewöhnung, Zahlungstermine oder verbindlichen Ansprüche.</p>';
 }
 function bridgeAnalysisRanges(months){
  const result=[];
  for(const lm of months){const last=result[result.length-1];if(last&&lm===last[1]+1)last[1]=lm;else result.push([lm,lm]);}
  return result;
 }
 function careImpactMarkup(){
  const start=Number(s.childcareStart)||0;
  if(!start||start>current?.rows?.length)return '<p class="v38-caption">Ohne geplanten Kita-Start im Vergleichshorizont sind keine Verzögerungsbeträge darstellbar.</p>';
  if(scenarioLost===''&&scenarioExtra===''&&!scenarioFeesWaived)
   return '<p class="v38-caption">'+(PUBLIC_TEST_PREVIEW?'Noch keine synthetischen Finanzannahmen eingegeben.':'Noch keine eigenen finanziellen Annahmen eingegeben.')+' Eine Kita-Verzögerung verändert das Elterngeld-Netto und die Kita-Gebühren nicht automatisch.</p>';
  try {
   const result=CareImpact.projectDelayedCareScenario({
    rows:current.rows,startLm:start,delayMonths:scenarioDelay,
    monthlyIncomeReduction:scenarioLost===''?0:Number(scenarioLost),
    monthlyExtraCare:scenarioExtra===''?0:Number(scenarioExtra),
    waiveOriginalFees:scenarioFeesWaived,expensesKnown:costsKnown()
   });
   const formatDelta=value=>(value>0?'+':'')+eur(value);
   let summary='<p><strong>Veränderung gegenüber dem unveränderten Plan: '+
     formatDelta(result.totalChange)+'</strong> für die betroffenen Lebensmonate'+
     (result.affectedMonths.length?' ('+result.affectedMonths.map(x=>'LM '+x).join(', ')+')':' (keine bei 0 Monaten Verschiebung)')+'.</p>';
   if(result.baselineBudgetKnown){
    summary+='<p>Rest nach Haushalts- und Kita-Kosten dieser Lebensmonate: bisher '+eur(result.comparedBaselineTotal)+
      ' · mit ausdrücklich angenommenen Änderungen '+eur(result.comparedAlternativeTotal)+'.</p>';
   }else summary+='<p>Haushaltsausgaben fehlen: Der Unterschied ist modelliert, ein verfügbares Familienbudget ist nicht bestimmbar.</p>';
   if(result.outsideHorizonMonths)summary+='<p>'+result.outsideHorizonMonths+' Monate der Verschiebung liegen außerhalb des berechneten Zeitraums.</p>';
   return summary+'<p class="v38-caption">Das ist eine hypothetische Differenz auf Basis eurer Eingaben – kein Zahlungsplan, keine Entgelt-/Elterngeld-Neuberechnung und keine Zusage einer Kita-Gebührenerstattung.</p>';
  }catch(e){return '<p class="v38-error" role="alert">'+escValue(e.message)+'</p>';}
 }
 function bridgeMarkup(){
  const start=Number(s.childcareStart)||0,until=Math.min(36,Math.max(1,Number(s.goalCare)||18));
  const choices=Array.from({length:7},(_,n)=>'<option value="'+n+'"'+(scenarioDelay===n?' selected':'')+'>'+n+(n===1?' Lebensmonat':' Lebensmonate')+'</option>').join('');
  const control=start>0&&start<=until?
    '<label class="v311-delay" for="v311KitaDelay">Wenn die Kita später startet …'+
    '<select id="v311KitaDelay" aria-controls="v311BridgeResult">'+choices+'</select></label>':'';
  const finance=control?'<details class="v312-finance"><summary>Finanzielle Folgen abschätzen (optionale Annahmen)</summary>'+
    '<p class="v38-caption">Nur für die durch die Kita-Verschiebung betroffenen Lebensmonate. Tragt ein, welche monatlichen Änderungen ihr in diesem Szenario ausdrücklich annehmt. Ein späterer Kita-Start allein ändert keine Geldbeträge.</p>'+
    '<div class="v312-finance-grid">'+
    '<label for="v312LostWage">Entfallendes Erwerbsnetto / Monat (€)<input id="v312LostWage" type="number" inputmode="decimal" min="0" max="100000" step="0.01" placeholder="Noch nicht angegeben" value="'+escValue(scenarioLost)+'"></label>'+
    '<label for="v312ExtraCare">Zusätzliche Überbrückungsbetreuung / Monat (€)<input id="v312ExtraCare" type="number" inputmode="decimal" min="0" max="100000" step="0.01" placeholder="Noch nicht angegeben" value="'+escValue(scenarioExtra)+'"></label>'+
    '</div><label class="v312-fee-waiver" for="v312WaiveFees"><input type="checkbox" id="v312WaiveFees"'+(scenarioFeesWaived?' checked':'')+'>'+
    'Die bisher geplanten Kita-Gebühren fallen in diesen Monaten laut eigener Annahme weg</label>'+
    '<div id="v312ImpactResult" aria-live="polite">'+careImpactMarkup()+'</div></details>':'';
  return '<section class="v311-bridge" aria-label="Übergang von Elterngeld zu Betreuung und Beruf"><h4>Betreuung und finanzieller Übergang</h4>'+
    control+'<div id="v311BridgeResult" aria-live="polite">'+bridgeResultMarkup()+'</div>'+finance+
    '<button class="navbtn alt" type="button" data-v38-goto="slide-region">Kita-Annahmen bearbeiten</button></section>';
 }
 function syncGoalForm(){
  const values=[
   ['v311Priority',!goalWizardUsed&&!costsKnown()&&['idle','example'].includes(mode)?'balanced':s.goalObjective||'income'],
   ['v311Care',Number(s.goalCare)||18],
   ['v311Minimum',Number(s.goalMinIncome)>0?s.goalMinIncome:''],
   ['v311CareMode',s.goalCareMode||'full'],
   ['v311Part',Number(s.goalPart)===0?'0':'1']
  ];
  for(const [id,value] of values){const field=node(id);if(field)field.value=String(value);}
 }
 function goalInputError(id,message){
  const error=node('v311GoalError');
  if(error)error.textContent=message;
  const input=node(id);
  if(input){input.setAttribute('aria-invalid','true');input.setAttribute('aria-describedby','v311GoalError');input.focus();}
 }
 function clearGoalInputError(){
  const error=node('v311GoalError');if(error)error.textContent='';
  for(const id of ['v311Priority','v311Care','v311Minimum','v311CareMode','v311Part','v311GoalsSubmit']){
   node(id)?.removeAttribute('aria-invalid');node(id)?.removeAttribute('aria-describedby');
  }
 }
 function submitGoalSearch(evt){
  evt.preventDefault();
  clearGoalInputError();
  if(mode==='idle'){goalInputError('v311GoalsSubmit',PUBLIC_TEST_PREVIEW?'Bitte zuerst ein Beispiel auswählen oder fiktive Testwerte eingeben.':'Bitte zuerst ein Beispiel auswählen oder eure eigenen Angaben eingeben.');return;}
  if(formDirty){goalInputError('v311GoalsSubmit',PUBLIC_TEST_PREVIEW?'Im Formular für fiktive Testwerte sind noch Änderungen offen. Bitte diese zuerst berechnen.':'Im Formular für eigene Werte sind noch Änderungen offen. Bitte diese zuerst berechnen.');return;}
  const priority=node('v311Priority')?.value,care=Number(node('v311Care')?.value);
  const raw=node('v311Minimum')?.value.trim()||'';
  const minimum=raw===''?0:Number(raw);
  const careMode=node('v311CareMode')?.value,part=node('v311Part')?.value;
  if(!['income','floor','robust','balanced','father'].includes(priority)){goalInputError('v311Priority','Bitte ein gültiges Planungsziel auswählen.');return;}
  if(![12,14,18,24,30,36].includes(care)){goalInputError('v311Care','Bitte eine gültige Betreuungsdauer wählen.');return;}
  if(raw!==''&&(!Number.isFinite(minimum)||minimum<0||minimum>100000||Math.abs(minimum*100-Math.round(minimum*100))>1e-6)){
   goalInputError('v311Minimum','Bitte einen Mindestbetrag zwischen 0 und 100.000 Euro mit höchstens zwei Nachkommastellen eingeben.');return;
  }
  if(!['full','partial'].includes(careMode)||!['0','1'].includes(part)){goalInputError('v311CareMode','Bitte eine gültige Betreuungsannahme wählen.');return;}
  if(!costsKnown()&&(minimum>0||['income','floor','robust'].includes(priority))){
   goalInputError('v311Minimum','Für Finanzziele müssen zuerst die monatlichen Haushaltsausgaben angegeben sein. Ohne Kosten sind nur zeitbezogene Vergleiche möglich.');return;
  }
  // Map intentions to the existing search. No plan is applied unless the user
  // explicitly accepts one of the proposals in the existing result view.
  Object.assign(s,{goalObjective:priority,goalCare:care,goalMinIncome:minimum,goalCareMode:careMode,goalPart:Number(part)});
  goalFormDirty=false;goalWizardUsed=true;
  if(!formDirty&&node('v38Goal'))node('v38Goal').value=String(care);
  renderAll();persist();
  const index=[...document.querySelectorAll('.slide')].findIndex(sl=>sl.id==='slide-goal');
  if(index>=0){
   showSlide(index);
   const heading=document.querySelector('#slide-goal h2');
   if(heading){heading.tabIndex=-1;heading.focus({preventScroll:true});}
  }
  const button=node('v311GoalsSubmit'),status=node('v311GoalStatus');
  if(button)button.disabled=true;
  if(status)status.textContent='Die vorhandene Vorlagensuche prüft die gewählten Bedingungen. Ergebnisse erscheinen in der Zielsuche.';
  runGoalSearchAsync().then(()=>{
   if(button)button.disabled=false;
   if(status)status.textContent=goalStats?.cancelled?
    'Suche beendet, ohne einen Plan zu übernehmen.':goalStats?.seen===0?
    'Noch keine Varianten prüfbar: erst die Pflichtangaben und Regelhinweise vervollständigen.':
    'Suche abgeschlossen. Bitte die Vorschläge und Warnungen im Abschnitt Zielsuche prüfen; kein Vorschlag wird automatisch übernommen.';
  },error=>{
   if(button)button.disabled=false;
   if(status)status.textContent='Die Suche konnte nicht abgeschlossen werden: '+String(error?.message||'Unbekannter Fehler');
  });
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
 // Presentation-only provenance. None of these labels certifies an official
 // source, and 'entered' never means independently checked.
 function dataQualityMarkup(){
  const entry=mode==='example'?'Fiktive Vorlage':mode==='restored'?'Wiederhergestellt, ungeprüft':
   mode==='personal'?(wizardCompleted?'Selbst eingegeben, weitere Annahmen prüfen':'Teilweise geändert, Herkunft prüfen'):'Noch kein Entwurf';
  const missingEg=s.egNetFather===''||s.egNetFather==null||s.egNetMother===''||s.egNetMother==null;
  const eg=missingEg?'Mindestens ein Wert fehlt':mode==='example'?'Fiktive Beispielwerte':
   s.incomeEntryMode==='official'?'Als übernommen angegeben, nicht verifiziert':
   s.incomeEntryMode==='known'?'Als bekannt angegeben, ungeprüft':
   wizardCompleted&&lastEstimated.father!==null&&lastEstimated.mother!==null?
   'Vereinfachte Schnellstart-Schätzung':'Schätzung / Herkunft nicht geprüft';
  const costs=costsKnown()?(mode==='example'?'Fiktive Kosteneingabe':'Eingegeben, nicht geprüft'):'Nicht angegeben';
  const entries=[['Planbasis',entry],['Elterngeld-Netto',eg],['Haushaltskosten',costs]];
  return '<section class="v41-quality" aria-label="Herkunft und Datenqualität"><h4>Datenqualität</h4>'+
   '<ul>'+entries.map(([name,value])=>'<li><span>'+escValue(name)+'</span><strong>'+escValue(value)+'</strong></li>').join('')+'</ul>'+
   '<p class="v38-caption">„Bekannt“ oder „übernommen“ bedeutet keine amtliche Prüfung. Der Rechner überträgt keine Werte an eine Behörde.</p></section>';
 }
 function summary(){
  if(mode==='idle')return '<h3>Beispiel auswählen</h3><p>'+(PUBLIC_TEST_PREVIEW?'Startet ohne Eingaben. Verändert Einkommen und Betreuungsdauer nur mit frei erfundenen Zahlen.':'Startet ohne Eingaben. Danach könnt ihr Einkommen und Betreuungsdauer persönlich anpassen.')+'</p>';
  if(!Array.isArray(current?.rows)||current.rows.length===0)return '<div class="v38-notice">Der Monatsplan konnte nicht berechnet werden.</div>';
  const template=effectiveTemplate();
  const until=Math.min(36,Math.max(1,Number(s.goalCare)||18));
  const rows=current.rows.slice(0,until);
  const known=costsKnown();
  const grossValues=rows.map(x=>Number(x.income)||0);
  const grossTotal=grossValues.reduce((a,b)=>a+b,0);
  const cashValues=known?rows.map(x=>Number(x.cashAfter)||0):[];
  const minCash=known?Math.min(...cashValues):null;
  const cashTotal=known?cashValues.reduce((a,b)=>a+b,0):null;
  const gap=firstCoverageGap(),covered=gap===null;
  const legal=current.validation?.status||'NICHT_UNTERSTUETZT';
  const year=Number(String(s.date).slice(0,4));
  const notices=[];
  if(mode==='example')notices.push('Erfundene Einkommensdaten und unverbindliche Beispielannahmen. Dieser Plan wurde nicht aus euren Angaben erstellt und nicht gespeichert.');
  if(mode==='personal'&&wizardCompleted)notices.push(
   s.egNetFather===''||s.egNetMother===''?
    'Mindestens ein Elterngeld-Netto ist ausdrücklich unbekannt. Dafür liegt keine geprüfte Leistungsberechnung vor.':
   preservedExpertParents().length?
    'Hinweis: Mindestens ein beibehaltener Elterngeld-Netto-Fachwert hat eine nicht unabhängig geprüfte Herkunft. Er wurde nicht still durch das neue Auszahlungsnetto ersetzt.':
    'Elterngeld-Netto vorläufig gleich Auszahlungsnetto aus der Schnelleingabe geschätzt. Dies ist keine amtliche Berechnung.');
  if(mode==='personal'&&!wizardCompleted)notices.push('Einzelne Angaben wurden geändert. Weitere Werte können aus einer fiktiven Vorlage oder einem geladenen Entwurf stammen; bitte alle Annahmen kontrollieren.');
  if(mode==='restored')notices.push(PUBLIC_TEST_PREVIEW?'Geladener Testentwurf ohne amtliche Fachprüfung. Ausschließlich synthetische Daten verwenden.':'Geladener Entwurf, noch keine bestätigte amtliche Berechnung. Persönliche Zahlen und Leistungen separat prüfen.');
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
  const legalLabel=year>2026?'Rechtsstand '+year+' offen':legal==='PLAUSIBEL_STANDARD'?'Nur Plausibilität':'Nicht fachlich bestätigt';
  const legalHint=year>2026?'Diese Geburtskohorte ist nicht abschließend rechtlich geprüft.':
   legal==='PLAUSIBEL_STANDARD'?'Kein amtlicher Bescheid und keine externe Abnahme.':
   'Regelstatus: '+legal+'. Fachprüfung weiterhin erforderlich.';
  const warning=year>2026?
   '<div class="v41-major-notice"><strong>Rechtsstand für '+year+' offen</strong><p>Dieses '+(mode==='example'?'fiktive Beispiel':'Szenario')+' ist nur eine Zukunftsvorschau. Die angezeigten Beträge sind keine bestätigten Ansprüche. Prüfdetails bleiben unten erhalten.</p></div>':
   legal!=='PLAUSIBEL_STANDARD'?
   '<div class="v41-major-notice"><strong>Keine fachliche Freigabe</strong><p>Der Plan ist nicht als Bewilligungsgrundlage geprüft. Bitte die Regelhinweise vor Entscheidungen ansehen.</p></div>':'';
  return '<h3>'+escValue(typeLabel()+' · '+(template?.label||'Individueller Plan'))+'</h3>'+
    '<p class="v38-caption">Ausgewertet: '+until+' Kindeslebensmonate'+(template?' · Vorlagenmodell: '+template.goal+' Monate':'')+'. Die Werte sind keine feststehenden Geldeingangstermine.</p>'+
    warning+
    '<section class="v41-overview" aria-label="Plan im Überblick"><h4>Plan im Überblick</h4><div class="v38-kpis">'+
    '<div class="v38-kpi" data-v41-metric="duration"><span>Betreuungsziel</span><strong>'+until+' LM</strong><small>Rechnerisches Modell, keine Betreuungszusage</small></div>'+
    '<div class="v38-kpi" data-v41-metric="gap"><span>Erste Betreuungslücke</span><strong>'+(covered?'Keine bis LM '+until:'Ab LM '+gap)+'</strong><small>'+(covered?'Nach den vereinfachten Modellannahmen':'Weitere Betreuung oder Planänderung nötig')+'</small></div>'+
    '<div class="v38-kpi" data-v41-metric="cash"><span>Niedrigster Rest nach Kosten / LM</span><strong>'+(known?eur(minCash):'Nicht berechenbar')+'</strong><small>'+(known?'Nur nach eingegebenen Haushalts- und Kita-Kosten':'Haushaltsausgaben fehlen; kein verfügbares Budget ableitbar')+'</small></div>'+
    '<div class="v38-kpi" data-v41-metric="legal"><span>Prüfstatus</span><strong>'+escValue(legalLabel)+'</strong><small>'+escValue(legalHint)+'</small></div>'+
    '</div></section>'+
    '<p class="v41-totals"><strong>Modellierte Einnahmen vor Haushalts- und Kita-Kosten über '+until+' LM: '+eur(grossTotal)+'</strong>'+
    (known?'<span>Rest nach Haushalts- und Kita-Kosten über '+until+' LM: '+eur(cashTotal)+'. Weitere Kosten und Steuern können fehlen.</span>':
     '<span>Persönliche Haushaltsausgaben sind unbekannt; daher keine Aussage über verfügbares Restbudget, Engpässe oder Rücklagen.</span>')+'</p>'+
    dataQualityMarkup()+
    nextStepsMarkup()+bridgeMarkup()+
    '<details class="v41-review"><summary>Alle Einschränkungen und Hinweise ('+notices.length+')</summary>'+
      notices.map(t=>'<div class="v38-notice">'+escValue(t)+'</div>').join('')+'</details>'+
    '<details class="v39-assumptions"><summary>Welche Zahlen und Annahmen stecken dahinter?</summary>'+
      '<p>Geburtstermin: '+escValue(s.date)+' · Auszahlungsnetto Elternteil 1: '+eur(s.netFather)+' · Elternteil 2: '+eur(s.netMother)+'.</p>'+
      '<p>Verwendetes Elterngeld-Netto (noch nicht automatisch amtlich ermittelt): '+(s.egNetFather===''?'unbekannt':eur(s.egNetFather))+' und '+(s.egNetMother===''?'unbekannt':eur(s.egNetMother))+'. Kindergeldansatz: '+eur(s.kind)+' monatlich.</p>'+
      '<p>Herkunft Elterngeld-Netto: Elternteil 1: '+escValue(explainNettoOrigin('father'))+'; Elternteil 2: '+escValue(explainNettoOrigin('mother'))+'. Diese Herkunftsangabe ist keine externe Fachprüfung.</p>'+
      '<p>Haushaltsausgaben: '+(known?eur(s.expenses)+' pro Monat':'nicht angegeben')+'. Zusätzliche Kosten und Leistungs-/Steuereffekte können fehlen. Monatlicher Leistungsanspruch ist kein Auszahlungstermin.</p></details>'+
    '<div class="v38-footer-actions">'+alternative+align+missingLong+
    '<button class="navbtn alt" type="button" data-v38-goto="slide-4">Lebensmonate ansehen</button>'+
    '<button class="navbtn alt" type="button" data-v38-goto="slide-2">Einkommen genauer eingeben</button>'+
    '<button class="navbtn alt" type="button" data-v38-goto="slide-10">Regelprüfung ansehen</button></div>';
 }

 function refresh(){
  if(!node('v38QuickStart'))return;
  navRefresh();costRefresh();
  if(!goalFormDirty)syncGoalForm();
  const output=node('v38Summary');
  if(output){
   const opened=['.v312-finance','.v41-review','.v39-assumptions'].filter(selector=>!!output.querySelector(selector)?.open);
   output.innerHTML=summary();
   for(const selector of opened){const details=output.querySelector(selector);if(details)details.open=true;}
  }
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
   // A newly chosen fictional example is a clean draft, not the previous
   // personal wizard's unsaved specialist-value decision.
   formDirty=false;clearFieldErrors();clearNettoChoiceError();
   if(node('v38NettoChoice'))node('v38NettoChoice').value='';
   if(node('v38NettoChoiceWrap'))node('v38NettoChoiceWrap').hidden=true;
   if(node('v38Personal'))node('v38Personal').open=false;
   for(const field of ['v38Birth','v38NetF','v38NetM','v38Expenses'])if(node(field))node(field).value='';
  }
  if(personal&&formDirty)markResultOutdated('Die Schnellstartänderungen sind noch nicht übernommen. Die Kennzahlen zeigen weiterhin den zuletzt gültigen Entwurf. Bitte die Netto-Entscheidung abschließen.');
  else clearResultOutdated();
  selected=id;goalFormDirty=false;if(!personal){goalWizardUsed=false;scenarioLost='';scenarioExtra='';scenarioFeesWaived=false;}
  clearGoalInputError();chooseModel(template.model); // Existing financial, timeline and legal engine.
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
   markResultOutdated('Bitte das markierte Schnellstartfeld korrigieren. Die Kennzahlen zeigen weiterhin den letzten gültigen Entwurf.');
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
 function preservedExpertParents(){
  return [['father','egNetFather'],['mother','egNetMother']]
   .filter(([parent,key])=>lastEstimated[parent]===null&&s[key]!==''&&s[key]!==null&&s[key]!==undefined)
   .map(([parent])=>parent);
 }
 function requiresNettoChoice(father,mother){
  if(!['personal','restored'].includes(mode))return false;
  const changed=father!==Number(s.netFather)||mother!==Number(s.netMother);
  return changed&&preservedExpertParents().length>0;
 }
 function clearNettoChoiceError(){
  const choice=node('v38NettoChoice'),error=node('v38NettoChoiceError');
  if(error)error.textContent='';
  choice?.removeAttribute('aria-invalid');
  choice?.setAttribute('aria-describedby','v38NettoChoiceExplanation');
 }
 function refreshNettoChoice(){
  const wrapper=node('v38NettoChoiceWrap'),choice=node('v38NettoChoice');
  if(!wrapper||!choice)return false;
  const father=Number(node('v38NetF')?.value),mother=Number(node('v38NetM')?.value);
  const required=requiresNettoChoice(father,mother);
  wrapper.hidden=!required;
  if(!required){choice.value='';clearNettoChoiceError();}
  return required;
 }
 function explainNettoOrigin(parent){
  const field=parent==='father'?'egNetFather':'egNetMother',value=s[field];
  if(value===''||value===null||value===undefined)return 'fehlt / unbekannt';
  if(mode==='example')return 'erfundener Beispielwert';
  if(lastEstimated[parent]!==null&&lastEstimated[parent]===value)return 'vereinfachte Schätzung aus dem Schnellstart';
  return 'beibehaltener Fach- oder Importwert (Herkunft nicht unabhängig bestätigt)';
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
  const needsChoice=requiresNettoChoice(n1,n2),decision=node('v38NettoChoice')?.value;
  if(needsChoice&&!['keep','estimate','clear'].includes(decision)){
   const choice=node('v38NettoChoice');
   node('v38NettoChoiceWrap').hidden=false;
   node('v38NettoChoiceError').textContent='Bitte entscheiden, ob vorhandene Elterngeld-Netto-Fachwerte beibehalten, als Schätzung ersetzt oder gelöscht werden.';
   choice.setAttribute('aria-invalid','true');
   choice.setAttribute('aria-describedby','v38NettoChoiceExplanation v38NettoChoiceError');
   markResultOutdated('Vor der Neuberechnung fehlt eine Entscheidung über vorhandene Elterngeld-Netto-Fachwerte. Der letzte gültige Plan bleibt unverändert.');
   choice.focus();return;
  }
  const first=mode==='idle',firstOwn=mode==='idle'||mode==='example';
  // All validation happens before the state is changed; repeated submissions
  // modify exactly the five short-form fields and preserve month-level edits.
  if(firstOwn){
   s.egNetFather=n1;s.egNetMother=n2;
   s.incomeEntryMode='estimate';s.standardCaseConfirmed=null;s.zve='';
   lastEstimated={father:n1,mother:n2};
  }else{
   // Wizard-created estimates follow changed wages; expert/import values never do
   // unless their owner explicitly selects estimate or clear.
   const expertParents=preservedExpertParents();
   if(lastEstimated.father!==null&&s.egNetFather===lastEstimated.father){s.egNetFather=n1;lastEstimated.father=n1;}
   if(lastEstimated.mother!==null&&s.egNetMother===lastEstimated.mother){s.egNetMother=n2;lastEstimated.mother=n2;}
   if(needsChoice&&(decision==='estimate'||decision==='clear')){
    for(const parent of expertParents){
     const key=parent==='father'?'egNetFather':'egNetMother';
     s[key]=decision==='estimate'?(parent==='father'?n1:n2):'';
     lastEstimated[parent]=decision==='estimate'?s[key]:null;
    }
    s.incomeEntryMode='estimate';
   }
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
  mode='personal';refresh();clearNettoChoiceError();refreshNettoChoice();clearResultOutdated();showSummary();
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
  if(node('v38Personal')?.open)refreshNettoChoice();
 }
 function onResetConfirmed(){
  mode='idle';selected='';wizardCompleted=false;formDirty=false;goalFormDirty=false;goalWizardUsed=false;scenarioDelay=2;scenarioLost='';scenarioExtra='';scenarioFeesWaived=false;lastEstimated={father:null,mother:null};
  clearFieldErrors();clearResultOutdated('all');clearNettoChoiceError();
  if(node('v38NettoChoice'))node('v38NettoChoice').value='';
  if(node('v38NettoChoiceWrap'))node('v38NettoChoiceWrap').hidden=true;
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
  mode='restored';selected=Object.keys(templates).find(key=>templates[key].model===s.model)||'';
  lastEstimated={father:null,mother:null};wizardCompleted=false;formDirty=false;goalFormDirty=false;goalWizardUsed=true;
  scenarioDelay=2;scenarioLost='';scenarioExtra='';scenarioFeesWaived=false;
  syncPersonalForm();refresh();refreshNettoChoice();
 }
 function mount(){
  if(!node('v38QuickStart'))return;
  let kiChecked=null;
  const kiInput=node('kiInput'),kiApply=node('kiApply'),kiStatus=node('kiStatus');
  kiInput?.addEventListener('input',()=>{kiChecked=null;kiApply.disabled=true;kiStatus.textContent='Vorschlag verändert – bitte erneut prüfen.';});
  node('kiPreview')?.addEventListener('click',()=>{
   kiChecked=null;kiApply.disabled=true;
   try{
    if(kiInput.value.length>10000)throw Error('Vorschlag ist zu lang.');
    const data=JSON.parse(kiInput.value),keys=['format','geburt','netto1','netto2','betreuung','ausgaben'];
    if(!data||typeof data!=='object'||Array.isArray(data)||data.format!=='elternzeit-ki-einstieg-v1'||Object.keys(data).some(k=>!keys.includes(k)))throw Error('Unbekanntes Format oder unbekannte Felder.');
    const fields=[];
    if(data.geburt!=null){if(typeof data.geburt!=='string')throw Error('Geburtstermin ist ungültig.');TimeAxes.lifeMonths(data.geburt,1);fields.push(['v38Birth',data.geburt,'Geburtstermin']);}
    for(const [key,id,label] of [['netto1','v38NetF','Netto Elternteil 1'],['netto2','v38NetM','Netto Elternteil 2'],['ausgaben','v38Expenses','Haushaltsausgaben']]){
     if(data[key]!=null){if(typeof data[key]!=='number'||!Number.isFinite(data[key])||data[key]<0||data[key]>100000)throw Error(label+': gültigen Betrag von 0 bis 100.000 angeben.');fields.push([id,String(data[key]),label]);}
    }
    if(data.betreuung!=null){if(![14,18,24,30,36].includes(data.betreuung))throw Error('Betreuungsdauer ist ungültig.');fields.push(['v38Goal',String(data.betreuung),'Betreuung bis Monate']);}
    if(!fields.length)throw Error('Keine konkreten Angaben enthalten.');
    kiChecked={source:kiInput.value,fields};kiApply.disabled=false;
    kiStatus.textContent='Zur Übernahme vorgeschlagen: '+fields.map(([,value,label])=>label+': '+value).join(' · ')+'. Andere Felder bleiben unverändert.';
   }catch(error){kiStatus.textContent='Vorschlag nicht übernommen: '+(error instanceof SyntaxError?'Bitte gültiges JSON einfügen.':error.message);}
  });
  kiApply?.addEventListener('click',()=>{
   if(!kiChecked||kiChecked.source!==kiInput.value)return;
   node('v38Personal').open=true;
   for(const [id,value] of kiChecked.fields){const field=node(id);field.value=value;field.dispatchEvent(new Event('input',{bubbles:true}));}
   kiChecked=null;kiApply.disabled=true;kiStatus.textContent='Angaben in die Eingabefelder übernommen. Bitte prüfen und selbst berechnen.';
   node('v38Birth')?.focus();
  });
  if(s.storageConsent){mode='restored';selected=Object.keys(templates).find(id=>templates[id].model===s.model)||'';}
  node('v38Templates').querySelectorAll('button[data-v38-template]').forEach(b=>b.addEventListener('click',()=>loadTemplate(b.dataset.v38Template)));
  node('v38PersonalForm')?.querySelectorAll('input,select').forEach(input=>input.addEventListener('input',()=>{
   formDirty=true;
   if(input.id==='v38NettoChoice')clearNettoChoiceError();
   refreshNettoChoice();
   markResultOutdated('Schnellstartwerte wurden verändert, aber noch nicht neu berechnet. Das Ergebnis gehört zum letzten gültigen Entwurf.');
  }));
  node('v315CareJump')?.addEventListener('click',()=>{
   const slides=[...document.querySelectorAll('.slide')];
   const idx=slides.findIndex(x=>x.id==='slide-region');
   if(idx<0)return;
   showSlide(idx);
   const heading=node('slide-region')?.querySelector('h2');
   if(heading){heading.tabIndex=-1;heading.focus({preventScroll:true});}
  });
  node('v42OpenFromStart')?.addEventListener('click',()=>{
   const index=[...document.querySelectorAll('.slide')].findIndex(x=>x.id==='slide-5');
   if(index<0)return;
   showSlide(index);
   const heading=node('v42WishTitle');if(heading){heading.tabIndex=-1;heading.focus({preventScroll:true});heading.scrollIntoView?.({behavior:'smooth',block:'start'});}
  });
  node('v311GoalJump')?.addEventListener('click',()=>{
   node('v311Goals')?.scrollIntoView?.({behavior:'smooth',block:'start'});node('v311Priority')?.focus();
  });
  node('v38EditOwn')?.addEventListener('click',()=>{
   const panel=node('v38Personal');if(!formDirty)syncPersonalForm();
   panel.open=true;refreshNettoChoice();node('v38Birth')?.focus();
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
  for(const [id,delta] of [['next',1],['previous',-1]])
   node(id)?.addEventListener('click',event=>simpleStep(delta,event),true);
  for(const id of ['v38Advanced','v41ModeToggle'])
   node(id)?.addEventListener('click',()=>{expert=!expert;refresh();if(id==='v41ModeToggle')closeMobile();});
  node('v38PersonalForm')?.addEventListener('submit',personalSubmit);
  node('v311GoalsForm')?.querySelectorAll('input,select').forEach(input=>
   input.addEventListener('input',()=>{goalFormDirty=true;clearGoalInputError();}));
  node('v311GoalsForm')?.addEventListener('submit',submitGoalSearch);
  node('v38QuickStart').addEventListener('change',evt=>{
   if(evt.target.id==='v311KitaDelay'){
    const parsed=Number(evt.target.value);
    if(!Number.isInteger(parsed)||parsed<0||parsed>6)return;
    scenarioDelay=parsed;
    const result=node('v311BridgeResult');
    if(result)result.innerHTML=bridgeResultMarkup();
    const finance=node('v312ImpactResult');
    if(finance)finance.innerHTML=careImpactMarkup();
   }
   if(evt.target.id==='v312WaiveFees'){
    scenarioFeesWaived=evt.target.checked;
    const result=node('v312ImpactResult');if(result)result.innerHTML=careImpactMarkup();
   }
  });
  node('v38QuickStart').addEventListener('input',evt=>{
   if(evt.target.id==='v312LostWage'||evt.target.id==='v312ExtraCare'){
    if(evt.target.id==='v312LostWage')scenarioLost=evt.target.value;else scenarioExtra=evt.target.value;
    const result=node('v312ImpactResult');if(result)result.innerHTML=careImpactMarkup();
   }
  });
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
  document.querySelectorAll('[data-field],[data-extra],[data-profile]').forEach(input=>input.addEventListener(input.tagName==='SELECT'?'change':'input',markPersonal));
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
