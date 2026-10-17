'use strict';
const time=require('./time-axes.cjs');
const KI_Z='https://www.arbeitsagentur.de/familie-und-kinder/kinderzuschlag-verstehen/kinderzuschlag-anspruch-hoehe-dauer';
const WO='https://www.bmwsb.bund.de/DE/wohnen/wohngeld/wohngeldrechner/wohngeldrechner-2025_artikel.html';
const BUT='https://www.arbeitsagentur.de/familie-und-kinder/informationen-zum-bildungspaket';
function precedingMonths(isoDate,count=6){
 time.lifeMonths(isoDate,1);
 if(!Number.isInteger(count)||count<1||count>12)throw new RangeError('Ungültiger Dokumentenzeitraum.');
 const d=new Date(isoDate+'T00:00:00Z'),list=[];
 for(let i=count;i>=1;i--){
  const v=new Date(Date.UTC(d.getUTCFullYear(),d.getUTCMonth()-i,1));
  list.push(v.toISOString().slice(0,7));
 }
 return list;
}
function benefitNavigator({applicationDate=null,hasBudgetGap=false,alreadyReceivesKiZ=false,region='NRW'}={}){
 if(applicationDate!==null&&applicationDate!=='')time.lifeMonths(applicationDate,1);
 if(typeof hasBudgetGap!=='boolean'||typeof alreadyReceivesKiZ!=='boolean'||typeof region!=='string')
  throw new TypeError('Angaben zur Leistungsprüfung ungültig.');
 const incomeMonths=applicationDate&&!alreadyReceivesKiZ?precedingMonths(applicationDate):[];
 const cards=[
  {id:'kiz',title:'Kinderzuschlag (KiZ)',url:KI_Z,status:'ANSPRUCH_UNGEPRUEFT',
   summary:'Die Familienkasse prüft Einkommen, Kosten und weitere Voraussetzungen. Elterngeld kann im individuellen Bemessungszeitraum relevant sein.',
   documents:['Nachweise zu Einkommen und Elterngeld','Wohnkosten und Haushaltsgröße','Vermögensangaben'],months:incomeMonths,
   warning:alreadyReceivesKiZ?'Bei Folgeanträgen kann sich der maßgebliche Sechsmonatszeitraum vom einfachen Vormonatsfenster unterscheiden. Familienkasse prüfen.':'Bei Erstantrag sind in der Regel die sechs Kalendermonate vor dem Antragsmonat maßgeblich. Keine Antragsfiktion.'},
  {id:'wohngeld',title:'Wohngeld-Plus',url:WO,status:'ANSPRUCH_UNGEPRUEFT',
   summary:'Der Bundesrechner hilft bei der Orientierung. Ob Wohngeld zusteht, hängt u. a. von Miete, Mietenstufe, Einkommen und Haushalt ab.',
   documents:['Mietvertrag/Mietkosten und Nebenkosten','Einkommensnachweise','Haushaltsmitglieder'],months:[]},
  {id:'but',title:'Bildung und Teilhabe (BuT)',url:BUT,status:'ANSPRUCH_UNGEPRUEFT',
   summary:'Bei bestimmten Leistungen, etwa Kinderzuschlag oder Wohngeld, kann Unterstützung für Kita-Mittagessen und weitere Bildungsausgaben möglich sein.',
   documents:['Bescheid zum Kinderzuschlag/Wohngeld, soweit vorhanden','Nachweise zu Kita-Mittagessen und Betreuungsangeboten'],months:[]}
 ];
 return {date:applicationDate||null,region,indication:hasBudgetGap?'BUDGET_LUECKE':'GENERAL_INFORMATION',
   cards,legalEntitlementInferred:false,autoAddedMonthlyBenefit:0,
   noDocumentUpload:true,checkedAt:'2026-10-17',
   cautions:['Keine dieser Leistungen wird ohne individuellen Bescheid in das Familieneinkommen eingebucht.',
     ...(!applicationDate?['Bitte ein freiwilliges Antragsdatum eintragen, um sechs zurückliegende Kalendermonate für mögliche KiZ-Unterlagen zu sehen.']:[])]};
}
module.exports={precedingMonths,benefitNavigator};
