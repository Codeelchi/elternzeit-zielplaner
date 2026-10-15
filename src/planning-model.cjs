'use strict';

// Canonical bridge between independent axes and the existing financial model.
// All date rules come from TimeAxes; this module defines no legal entitlement.
const CalendarAxes = typeof require === 'function' ? require('./time-axes.cjs') : TimeAxes;
const VALID_CODES = new Set(['B','R','P','T','K','Q','U','W','MS']);
const PARENTS = [{name:'father',key:'f',hoursKey:'hf',stateHours:'hoursFather'},
  {name:'mother',key:'m',hoursKey:'hm',stateHours:'hoursMother'}];
function checkedHours(value,label){
  if(typeof value!=='number'||!Number.isFinite(value)||value<0||value>40)
    throw new RangeError(label+': Wochenstunden müssen eine endliche Zahl zwischen 0 und 40 sein.');
  return value;
}
function checkedOverrideContainer(value,label){
  if(value==null)return;
  if(typeof value!=='object'||Array.isArray(value))throw new TypeError(label+': Elternteil-Objekt erforderlich.');
  for(const [parent,rows] of Object.entries(value)){
    if(!['father','mother'].includes(parent))throw new RangeError(label+': unbekannter Elternteil.');
    if(rows==null)continue;
    if(!Array.isArray(rows))throw new TypeError(label+': Monatsliste erforderlich.');
    if(label==='employmentOverrides')for(const row of rows)checkedHours(row?.weeklyHours,label);
  }
}
function codeFor(benefit,employment){
  const hours=checkedHours(employment.weeklyHours,'Erwerbstätigkeit');
  switch(benefit.type){
    case 'basis':return hours>0?'R':'B';
    case 'plus':return hours>0?'T':'P';
    case 'partnership_bonus':return 'K';
    case 'maternity_offset_basis':return 'MS';
    case 'none':return hours===0?'U':hours===40||employment.mode==='full_time'?'W':'Q';
    default:throw new RangeError('Unbekannte Leistungsart.');
  }
}
function materializePlan({state,schedule}={}){
  if(!state||typeof state!=='object'||Array.isArray(state))throw new TypeError('Planungszustand fehlt.');
  const input=schedule??state.schedule;
  if(!Array.isArray(input)||input.length<2||input.length>96)throw new RangeError('Planung braucht 2 bis 96 vollständige Lebensmonate.');
  checkedOverrideContainer(state.employmentOverrides,'employmentOverrides');
  checkedOverrideContainer(state.benefitOverrides,'benefitOverrides');
  const weeklyHours={};
  for(const parent of PARENTS)weeklyHours[parent.name]=checkedHours(state[parent.stateHours]??28,parent.stateHours);
  for(const row of input){
    if(!row||typeof row!=='object'||Array.isArray(row))throw new TypeError('Ungültige Monatszeile.');
    for(const parent of PARENTS){
      if(!VALID_CODES.has(row[parent.key]))throw new RangeError('Unbekannter oder fehlender Monatsstatus.');
      if(row[parent.hoursKey]!=null)checkedHours(row[parent.hoursKey],parent.hoursKey);
      if(parent.name==='father'&&row[parent.key]==='MS')throw new RangeError('Mutterschutz ist für diesen Elternteil im Standardmodell nicht unterstützt.');
    }
  }
  const axes=CalendarAxes.buildTimeAxes({birthDate:state.date??state.birthDate,
    expectedDueDate:state.expectedDueDate||state.date||state.birthDate,
    postnatalDays:state.postnatalDays??56,prenatalDays:state.prenatalDays??42,
    schedule:input,months:input.length,weeklyHours,
    leaveOverrides:state.leaveOverrides,employmentOverrides:state.employmentOverrides,
    benefitOverrides:state.benefitOverrides,bankLedger:state.bankLedger??[]});
  const effective=axes.timeline.map((month,index)=>{
    const row={...input[index]};
    for(const parent of PARENTS){
      const {employment,benefit}=month.parents[parent.name];
      let code=codeFor(benefit,employment);
      let hours=employment.weeklyHours;
      if(parent.name==='mother'&&month.maternityDays>0){
        if(employment.source==='user'&&hours>0)throw new RangeError('Arbeitszeit überschneidet die nachgeburtliche Mutterschutzfrist.');
        if(benefit.source==='user'&&!['basis','maternity_offset_basis'].includes(benefit.type))
          throw new RangeError('Monat mit Mutterschaftsleistungen benötigt Basis-Anrechnung.');
        code='MS';hours=0;
        // Keep the returned effective axes consistent with the forced
        // maternity status, retaining the original employer-leave axis.
        month.parents.mother.employment={mode:'maternity_status',weeklyHours:0,source:'derived_maternity'};
        month.parents.mother.benefit={type:'maternity_offset_basis',code:'MS',source:'derived_maternity'};
      }else if(code==='MS')throw new RangeError('Mutterschaftsleistungen außerhalb der modellierten Schutzfrist.');
      row[parent.key]=code;row[parent.hoursKey]=hours;
    }
    return row;
  });
  const requiresIndividualReview=axes.maternity.requiresIndividualReview||axes.timeline.some(m=>m.lm>2&&m.maternityDays>0);
  return {schedule:effective,axes,requiresIndividualReview,notices:axes.notices};
}
module.exports={materializePlan,codeFor};
