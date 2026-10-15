'use strict';

/** Pure fail-closed validation of the explicitly confirmed employee standard case.
 * No monetary entitlement calculation, legal certification or network access.
 * Codes match the existing UI; schedule rows carry optional hf/hm overrides.
 */
const TimeAxes = require('./time-axes.cjs');
const VALIDATION_STATUS = Object.freeze({
  PLAUSIBEL_STANDARD: 'PLAUSIBEL_STANDARD', REGELKONFLIKT: 'REGELKONFLIKT',
  NICHT_UNTERSTUETZT: 'NICHT_UNTERSTUETZT', DATEN_UNVOLLSTAENDIG: 'DATEN_UNVOLLSTAENDIG'
});
const CODES = new Set(['W','MS','B','R','P','T','Q','K','U']);
const BASIS = new Set(['B','R','MS']);
const PLUS = new Set(['P','T','K']);
const PAID = new Set([...BASIS,...PLUS]);
function numeric(value) { return (typeof value==='number'||(typeof value==='string'&&value.trim()!==''))&&Number.isFinite(Number(value)); }
function isoDate(value) {
  if(typeof value!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(value))return false;
  const d=new Date(value+'T00:00:00Z');
  return Number.isFinite(d.getTime())&&d.toISOString().slice(0,10)===value;
}
// One bounded memo entry contains only derived calendar month numbers, never
// household finances, findings, schedules or validation results. The immutable
// value is private, so callers cannot mutate a subsequent validation's calendar.
let protectedMonthMemo=null;
function protectedMonthsFor(birthDate,scheduleLength,standardDays){
  const key=birthDate+'|'+scheduleLength+'|'+standardDays;
  if(protectedMonthMemo?.key===key)return protectedMonthMemo.months;
  const months=TimeAxes.lifeMonths(birthDate,scheduleLength);
  const maternity=TimeAxes.maternityTimeline({birthDate,postnatalDays:standardDays});
  const protectedMonths=Object.freeze(months.filter(m=>TimeAxes.daysOverlapInclusive(m.startDate,m.endDate,maternity.postnatal.startDate,maternity.postnatal.endDate)>0).map(m=>m.lm));
  protectedMonthMemo={key,months:protectedMonths};
  return protectedMonths;
}
function validatePlan(input={},catalogue={}) {
  catalogue=catalogue&&typeof catalogue==='object'?catalogue:{};
  const state=input?.state||{},schedule=input?.schedule, rules=Array.isArray(catalogue.rules)?catalogue.rules:[],p=catalogue.standard_parameters||{};
  const findings=[];
  const sourceFor=id=>{
    const r=rules.find(x=>x&&x.id===id);
    return r?{title:r.source,url:r.url,checkedAt:r.checked_at,effectiveFrom:r.effective_from,effectiveTo:r.effective_to,verificationStatus:r.verification_status}:{title:'Ungeprüfte Quelle',url:null,checkedAt:null,effectiveFrom:null,effectiveTo:null,verificationStatus:'source_missing'};
  };
  function add(code,status,ruleId,parents,lifeMonths,message,alternatives) {
    findings.push({code,status,ruleId,parents,lifeMonths,message,alternatives,source:sourceFor(ruleId)});
  }
  const missing=(code,message,ruleId='BE-4',parents=[],months=[])=>add(code,'DATEN_UNVOLLSTAENDIG',ruleId,parents,months,message,['Fehlende Angaben vervollständigen und erneut prüfen.']);
  const unsupported=(code,message,ruleId='BE-4')=>add(code,'NICHT_UNTERSTUETZT',ruleId,[],[],message,['Individuelle Prüfung durch die zuständige Elterngeldstelle.']);
  const conflict=(code,ruleId,parents,months,message,alternatives)=>add(code,'REGELKONFLIKT',ruleId,parents,months,message,alternatives);
  const manualLeavePresent=state.leaveOverrides!==undefined&&state.leaveOverrides!==null;
  const requiredRules=['BE-4','BE-2025','BE-PAR','BE-PLUS','BE-MUT','BE-BON','BE-32'];
  const derivedLeaveHoursQuery=!manualLeavePresent&&Array.isArray(schedule)&&schedule.some(row=>[['f','Father'],['m','Mother']].some(([key,ext])=>{
    const hours=row?.['h'+key]??state['hours'+ext];
    return row?.[key]==='Q'&&numeric(hours)&&Number(hours)>p.max_weekly_work_hours;
  }));
  if(manualLeavePresent||derivedLeaveHoursQuery)requiredRules.push('BEEG-15');
  for(const id of requiredRules){
    const r=rules.find(x=>x&&x.id===id);
    if(!r||r.verification_status!=='official_source_checked'||!isoDate(r.checked_at)||!isoDate(r.effective_from)||(r.effective_to!==null&&!isoDate(r.effective_to))||(isoDate(r.effective_to)&&r.effective_to<r.effective_from)||(isoDate(catalogue.verified_as_of)&&r.checked_at>catalogue.verified_as_of)||!r.url||!r.source||r.planned)
      unsupported('RULE_SOURCE_UNVERIFIED_'+id,'Die benötigte Regel '+id+' besitzt keine vollständig bestätigte amtliche Quelle.',id);
    else if(isoDate(state.date)&&(state.date<r.effective_from||(r.effective_to&&state.date>r.effective_to)))
      unsupported('RULE_OUTSIDE_VALIDITY_'+id,'Geburtsdatum liegt außerhalb der dokumentierten Regelgültigkeit '+id+'.',id);
  }
  const requiredParameters=['income_limit_zve_eur','joint_max_basis_equivalents','per_parent_max_basis_equivalents','basis_last_life_month','plus_last_life_month','plus_continuity_from_life_month','concurrent_basis_latest_life_month','concurrent_basis_max_months','bonus_min_months','bonus_max_months','bonus_min_hours','bonus_max_hours','max_weekly_work_hours','standard_maternity_days_after_birth'];
  if(requiredParameters.some(k=>!Number.isFinite(p[k])||p[k]<=0))unsupported('RULE_PARAMETERS_MISSING','Der versionierte Regelkatalog enthält nicht alle benötigten Grenzwerte.');
  if(!isoDate(state.date))missing('BIRTH_DATE_INVALID','Ein gültiges Geburtsdatum ist erforderlich.');
  else {
    const w=catalogue.applicable_standard_birth_window;
    if(!w||!isoDate(w.from)||!isoDate(w.through)||w.from>w.through||state.date<w.from||state.date>w.through)unsupported('BIRTH_COHORT_UNSUPPORTED','Das Geburtsdatum liegt außerhalb der unterstützten Standardkohorte.');
    if(!isoDate(catalogue.verified_as_of)||state.date.slice(0,4)>catalogue.verified_as_of.slice(0,4))unsupported('FUTURE_COHORT_UNVERIFIED','Das Geburtsjahr liegt nach dem Quellenprüfjahr; zukünftiges Recht ist nicht bestätigt.');
  }
  if(!numeric(state.births))missing('CHILD_COUNT_MISSING','Die Anzahl der Kinder dieser Geburt fehlt.');
  else if(Number(state.births)!==1)unsupported('MULTIPLE_BIRTH_UNSUPPORTED','Mehrlingsgeburten sind fachlich nicht validiert.');
  if(state.standardCaseConfirmed===false)unsupported('STANDARD_CASE_DECLINED','Der angegebene Haushalt entspricht nicht dem unterstützten Standardfall.');
  else if(state.standardCaseConfirmed!==true)missing('STANDARD_CASE_UNCONFIRMED','Bitte den Standardfall ausdrücklich bestätigen: zwei abhängig beschäftigte Eltern in Deutschland, gemeinsamer Haushalt und eigene Betreuung, reguläre Einzelgeburt ohne Sonderfälle.');
  // Only explicit false/absent boolean flags can negate a special case.
  // Imported numbers, strings and objects must never erase contradictory data
  // merely because an independent standard-case confirmation is true.
  const specialFlags=['selfEmployed','singleParent','adoption','disability','siblingBonus','prematureBirth'];
  const specialFlagPresent=specialFlags.some(key=>state[key]!==undefined&&state[key]!==null&&state[key]!==false);
  const specialCasesPresent=state.specialCases!==undefined&&state.specialCases!==null&&state.specialCases!==false&&state.specialCases!==''&&!(Array.isArray(state.specialCases)&&state.specialCases.length===0);
  if(specialFlagPresent||specialCasesPresent)
    unsupported('SPECIAL_CASE_UNSUPPORTED','Ein Sonderfall oder eine nicht eindeutig verneinte Sonderfallangabe ist im Standardmodell nicht fachlich validiert.');
  if(state.expectedDueDate&&(!isoDate(state.expectedDueDate)||state.expectedDueDate!==state.date))unsupported('MATERNITY_NONSTANDARD','Abweichender errechneter Termin erfordert eine individuelle Prüfung der Mutterschaftsleistungen.','BE-MUT');
  if(state.postnatalDays!==undefined&&Number(state.postnatalDays)!==p.standard_maternity_days_after_birth)unsupported('MATERNITY_DURATION_NONSTANDARD','Die abweichende Mutterschutzfrist ist im Finanzmodell nicht validiert.','BE-MUT');
  if(!numeric(state.zve)||Number(state.zve)<0)missing('INCOME_LIMIT_DATA_MISSING','Das gemeinsame zu versteuernde Vorjahreseinkommen muss als nichtnegative Zahl vorliegen.','BE-2025');
  else if(Number(state.zve)>p.income_limit_zve_eur)conflict('INCOME_LIMIT_EXCEEDED','BE-2025',['father','mother'],[],'Das gemeinsame zu versteuernde Vorjahreseinkommen überschreitet die Anspruchsgrenze.',['Ohne Elterngeld planen; die Elterngeldstelle prüft das maßgebliche Einkommen.']);
  for(const [parent,ext] of [['father','Father'],['mother','Mother']]){
    for(const prefix of ['net','egNet']){
      if(!numeric(state[prefix+ext])||Number(state[prefix+ext])<0)
        missing('FINANCIAL_INPUT_INVALID_'+prefix+ext,'Das '+(prefix==='egNet'?'Elterngeld-Netto':'Auszahlungs-Netto')+' vor der Geburt muss als nichtnegative Zahl vorliegen.','BE-4',[parent]);
    }
    const key=parent==='father'?'f':'m';
    if(Array.isArray(schedule)&&schedule.some(row=>['R','T','Q','K'].includes(row?.[key]))){
      if(!numeric(state['ptNet'+ext])||Number(state['ptNet'+ext])<0)
        missing('FINANCIAL_INPUT_INVALID_ptNet'+ext,'Das geschätzte Teilzeit-Auszahlungs-Netto muss als nichtnegative Zahl vorliegen.','BE-4',[parent]);
      if(state['egPtNet'+ext]!==undefined&&state['egPtNet'+ext]!==''&&(!numeric(state['egPtNet'+ext])||Number(state['egPtNet'+ext])<0))
        missing('FINANCIAL_INPUT_INVALID_egPtNet'+ext,'Das eingetragene Teilzeit-Elterngeld-Netto muss eine nichtnegative Zahl sein.','BE-4',[parent]);
    }
  }
  for(const field of ['expenses','childcareMonthly','goalMinIncome']){
    if(state[field]!==undefined&&state[field]!==null&&state[field]!==''&&(!numeric(state[field])||Number(state[field])<0))
      missing('BUDGET_INPUT_INVALID_'+field,'Der eingetragene Wert für '+({expenses:'Haushaltsausgaben',childcareMonthly:'Betreuungskosten',goalMinIncome:'Mindesteinkommen'}[field])+' muss eine nichtnegative Zahl sein.');
  }
  const totals={father:0,mother:0,joint:0,bonusMonths:0};
  const normalized=[];
  if(!Array.isArray(schedule)||schedule.length<14||schedule.length>96)missing('SCHEDULE_INCOMPLETE','Eine vollständige Planung von mindestens 14 und höchstens 96 Lebensmonaten ist erforderlich.');
  else for(let i=0;i<schedule.length;i++){
    const row=schedule[i],lm=i+1;
    if(!row||typeof row!=='object'){missing('SCHEDULE_ROW_MISSING','Die Planung für Lebensmonat '+lm+' fehlt.','BE-4',[],[lm]);continue;}
    const out={lm};
    for(const [key,parent] of [['f','father'],['m','mother']]){
      const code=row[key];out[key]=code;
      if(!CODES.has(code)){missing('SCHEDULE_CODE_INVALID','Unbekannter oder fehlender Monatsstatus.','BE-4',[parent],[lm]);continue;}
      if(code==='MS'&&parent!=='mother')unsupported('MATERNITY_PARENT_UNSUPPORTED','Mutterschaftsleistungen für diesen Elternteil sind im Standardmodell nicht unterstützt.','BE-MUT');
      const hours=row['h'+key]??state['hours'+(key==='f'?'Father':'Mother')];
      out['h'+key]=hours;
      if(['R','T','Q','K'].includes(code)){
        if(!numeric(hours)||Number(hours)<0||Number(hours)>80)missing('WORK_HOURS_INVALID','Gültiger Lebensmonatsdurchschnitt der Wochenstunden fehlt.','BE-32',[parent],[lm]);
        else if(PAID.has(code)&&Number(hours)>p.max_weekly_work_hours)conflict('WORK_HOURS_EXCEEDED','BE-32',[parent],[lm],'Erwerbstätigkeit während Elterngeldbezug überschreitet die Stundenobergrenze.',['Arbeitszeit im Lebensmonatsdurchschnitt auf höchstens '+p.max_weekly_work_hours+' Stunden reduzieren.']);
        else if(code==='Q'&&!manualLeavePresent&&Number(hours)>p.max_weekly_work_hours)conflict('LEAVE_WORK_HOURS_EXCEEDED','BEEG-15',[parent],[lm],'Die Erwerbsarbeit während der aus dem Monatsstatus abgeleiteten Elternzeit überschreitet die zulässige Wochenstundengrenze.',['Erwerbsarbeitszeit auf höchstens 32 Wochenstunden im Monatsdurchschnitt reduzieren oder Elternzeit unabhängig ausdrücklich ohne diesen Abschnitt eintragen.']);
      }
      const eq=BASIS.has(code)?1:(code==='P'||code==='T')?0.5:0;
      totals[parent]+=eq;
      if(lm>p.basis_last_life_month&&BASIS.has(code))conflict('BASIS_TOO_LATE','BE-4',[parent],[lm],'Basiselterngeld liegt nach dem letzten unterstützten Lebensmonat.',['Innerhalb des Kontingents ElterngeldPlus statt Basiselterngeld prüfen.']);
      if(lm>p.plus_last_life_month&&PLUS.has(code))conflict('PLUS_TOO_LATE','BE-PLUS',[parent],[lm],'Plus oder Bonus liegt nach dem letzten unterstützten Lebensmonat.',['Bezug spätestens bis Lebensmonat '+p.plus_last_life_month+' planen.']);
    }
    normalized.push(out);
  }
  // Use the identical life-month boundaries and protection interval as the
  // financial/time-axis engine. Eight weeks AFTER birth include the birth day
  // as a protected additional calendar day; no private date arithmetic here.
  if(isoDate(state.date)&&normalized.length&&Number.isInteger(p.standard_maternity_days_after_birth)){
    try {
      const protectedMonths=protectedMonthsFor(state.date,normalized.length,p.standard_maternity_days_after_birth);
      if(protectedMonths.some(lm=>lm>2))unsupported('MATERNITY_LM3_UNSUPPORTED','Die tatsächliche Schutzfrist berührt LM 3; die Standard-Finanzrechnung muss individuell geprüft werden.','BE-MUT');
      for(const row of normalized)if((protectedMonths.includes(row.lm)&&row.m!=='MS')||(!protectedMonths.includes(row.lm)&&row.m==='MS'))
        conflict('MATERNITY_STATUS_MISMATCH','BE-MUT',['mother'],[row.lm],'Der Monatsstatus widerspricht der bestätigten Standard-Mutterschaftsleistung.',['Mutterschaftsleistung in tatsächlich berührten Lebensmonaten eintragen oder Sonderfall individuell prüfen.']);
    } catch {
      missing('MATERNITY_CALENDAR_INVALID','Die Schutzfrist konnte für das Geburtsdatum nicht berechnet werden.','BE-MUT',['mother']);
    }
  }
  // Employer leave is independent from benefit selection. Re-evaluate manual
  // intervals and employment for every candidate; do not memoize family data.
  if(manualLeavePresent){
    if(typeof state.leaveOverrides!=='object'||Array.isArray(state.leaveOverrides)||Object.keys(state.leaveOverrides).some(key=>!['father','mother'].includes(key)))
      unsupported('LEAVE_INTERVALS_INVALID','Manuelle Elternzeitabschnitte müssen getrennte Listen je Elternteil enthalten.','BEEG-15');
    else if(isoDate(state.date)&&Array.isArray(schedule)&&schedule.length>=14&&schedule.length<=96){
      try {
        const axes=TimeAxes.buildTimeAxes({birthDate:state.date,schedule,months:schedule.length,
          leaveOverrides:state.leaveOverrides,employmentOverrides:state.employmentOverrides??null,
          weeklyHours:{father:state.hoursFather,mother:state.hoursMother}});
        const manualParents=['father','mother'].filter(parent=>Object.prototype.hasOwnProperty.call(state.leaveOverrides,parent)&&state.leaveOverrides[parent]!=null);
        for(const note of axes.notices){
          if(manualParents.includes(note.parent)&&['LEAVE_MANY_SEGMENTS','LEAVE_OVERLAP','LEAVE_MATERNITY_OVERLAP'].includes(note.code))
            add(note.code,'NICHT_UNTERSTUETZT','BEEG-15',[note.parent],[],note.message,['Elternzeitabschnitte korrigieren oder erforderliche Arbeitgeberzustimmung und individuelle Prüfung einholen.']);
        }
        for(const parent of ['father','mother']){
          const affected=axes.timeline.filter(month=>month.parents[parent].legalLeaveDays>0&&month.parents[parent].employment.weeklyHours>p.max_weekly_work_hours).map(month=>month.lm);
          if(affected.length)conflict('LEAVE_WORK_HOURS_EXCEEDED','BEEG-15',[parent],affected,'Die Erwerbsarbeit während der eingetragenen Elternzeit überschreitet die zulässige Wochenstundengrenze.',['Erwerbsarbeitsachse auf höchstens 32 Wochenstunden im Monatsdurchschnitt abstimmen oder arbeitsrechtlichen Elternzeitabschnitt ändern.']);
        }
      } catch {
        unsupported('LEAVE_INTERVALS_INVALID','Manuelle Elternzeitabschnitte oder zugehörige Erwerbsarbeitsangaben sind ungültig oder liegen außerhalb des unterstützten Zeitraums.','BEEG-15');
      }
    }
  }
  totals.joint=totals.father+totals.mother;
  const paidMonths=parent=>normalized.filter(r=>PAID.has(r[parent==='father'?'f':'m'])).map(r=>r.lm);
  for(const parent of ['father','mother']){
    const months=paidMonths(parent);
    if(months.length===1)conflict('MINIMUM_BENEFIT_MONTHS','BE-4',[parent],months,'Ein Elternteil muss Elterngeld mindestens für zwei Lebensmonate beziehen.',['Mindestens einen weiteren Bezugsmonat innerhalb des Kontingents einplanen oder Bezug entfernen.']);
    if(totals[parent]>p.per_parent_max_basis_equivalents)conflict('PARENT_BUDGET_EXCEEDED','BE-4',[parent],months,'Das reguläre Basis-Äquivalent-Kontingent dieses Elternteils wird überschritten.',['Bezug kürzen; zulässige Bonusmonate sind zusätzlich zum regulären Kontingent möglich.']);
  }
  if(totals.joint>p.joint_max_basis_equivalents)conflict('JOINT_BUDGET_EXCEEDED','BE-4',['father','mother'],normalized.filter(r=>BASIS.has(r.f)||BASIS.has(r.m)||PLUS.has(r.f)||PLUS.has(r.m)).map(r=>r.lm),'Das gemeinsame reguläre Kontingent wird überschritten.',['Regulären Bezug reduzieren; ein Basis-Monat entspricht zwei Plus-Monaten.']);
  // Partnermonate require at least two months of reduced earned income for one parent.
  if(totals.joint>12&&totals.joint<=p.joint_max_basis_equivalents){
    let reduced=false,unknown=false;
    for(const [key,ext] of [['f','Father'],['m','Mother']]){
      let count=0;
      for(const row of normalized){
        if(['B','P','MS'].includes(row[key])){
          if(!numeric(state['net'+ext]))unknown=true;
          else if(Number(state['net'+ext])>0)count++;
        }
        else if(['R','T','K'].includes(row[key])){
          if(!numeric(state['net'+ext])||!numeric(state['ptNet'+ext])||!numeric(row['h'+key]))unknown=true;
          else if(Number(state['ptNet'+ext])*Number(row['h'+key])/28<Number(state['net'+ext]))count++;
        }
      }
      if(count>=2)reduced=true;
    }
    if(!reduced){if(unknown)missing('PARTNER_MONTH_INCOME_MISSING','Die Einkommensminderung für zwei zusätzliche Partnermonate ist nicht prüfbar.');
      else conflict('PARTNER_MONTH_REDUCTION_MISSING','BE-4',['father','mother'],[],'Zwei zusätzliche Partnermonate erfordern Einkommensminderung in mindestens zwei Lebensmonaten eines Elternteils.',['Ohne belegte Einkommensminderung höchstens zwölf reguläre Basis-Äquivalente planen.']);}
  }
  const concurrent=normalized.filter(r=>BASIS.has(r.f)&&BASIS.has(r.m));
  if(concurrent.length>p.concurrent_basis_max_months||concurrent.some(r=>r.lm>p.concurrent_basis_latest_life_month))
    conflict('CONCURRENT_BASIS','BE-PAR',['father','mother'],concurrent.map(r=>r.lm),'Gleichzeitiges Basiselterngeld einschließlich Mutterschaftsanrechnung ist nur in einem der ersten zwölf Lebensmonate zulässig.',['Einen Bezug in Plus umwandeln oder Basisbezug zeitlich verschieben.']);
  const bonus=normalized.filter(r=>r.f==='K'||r.m==='K');totals.bonusMonths=bonus.length;
  if(bonus.length){
    if(bonus.length<p.bonus_min_months||bonus.length>p.bonus_max_months||bonus.some((r,i)=>i&&r.lm!==bonus[i-1].lm+1))
      conflict('BONUS_BLOCK','BE-BON',['father','mother'],bonus.map(r=>r.lm),'Bonus erfordert zwei bis vier zusammenhängende gemeinsame Lebensmonate.',['Einen gemeinsamen ununterbrochenen Block von zwei bis vier Monaten planen.']);
    for(const r of bonus){
      if(r.f!=='K'||r.m!=='K')conflict('BONUS_NOT_SHARED','BE-BON',['father','mother'],[r.lm],'Bonus ist im Standardfall nur für beide Eltern gleichzeitig vorgesehen.',['Beide Eltern im selben Bonusblock einplanen oder reguläres Plus prüfen.']);
      for(const [key,parent] of [['f','father'],['m','mother']])if(numeric(r['h'+key])&&(Number(r['h'+key])<p.bonus_min_hours||Number(r['h'+key])>p.bonus_max_hours))
        conflict('BONUS_HOURS','BE-BON',[parent],[r.lm],'Bonus benötigt 24 bis 32 Wochenstunden im Lebensmonatsdurchschnitt.',['Arbeitszeit im Bonusmonat auf 24 bis 32 Stunden abstimmen.']);
    }
  }
  const lastPlus=normalized.reduce((v,r)=>PLUS.has(r.f)||PLUS.has(r.m)?r.lm:v,0);
  const gaps=normalized.filter(r=>r.lm>=p.plus_continuity_from_life_month&&r.lm<=lastPlus&&!PLUS.has(r.f)&&!PLUS.has(r.m));
  if(gaps.length)conflict('PLUS_CONTINUITY','BE-PLUS',['father','mother'],gaps.map(r=>r.lm),'Ab LM 15 muss bis zum letzten Plus-/Bonusbezug mindestens ein Elternteil ohne gemeinsamen Unterbrechungsmonat beziehen.',['Ab LM 15 lückenlosen Plus-/Bonusbezug eines Elternteils sicherstellen oder späteren Bezug entfernen.']);
  const precedence=['NICHT_UNTERSTUETZT','DATEN_UNVOLLSTAENDIG','REGELKONFLIKT'];
  const status=precedence.find(s=>findings.some(f=>f.status===s))||'PLAUSIBEL_STANDARD';
  return {status,valid:status==='PLAUSIBEL_STANDARD',findings,totals,checkedAt:catalogue.verified_as_of||null,catalogueVersion:catalogue.version||null,
    disclaimer:'Plausibilitätsprüfung des bestätigten Standardfalls, keine Rechtsberatung oder verbindliche Leistungsberechnung.'};
}
module.exports={VALIDATION_STATUS,validatePlan};
