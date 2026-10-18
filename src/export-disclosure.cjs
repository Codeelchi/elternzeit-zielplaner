'use strict';

// Export-only advisory. Never trust an imported copy as proof, never alter the
// source financial state, and never put personal data or derived benefit amounts
// into the advisory. Actual benefits remain exclusively in the plan payload.
const CODES=Object.freeze(['PLAUSIBLE_MODEL','OUTSIDE_SCOPE','INPUTS_INCOMPLETE','RULE_CONFLICT','FORECAST_ONLY']);
const MODES=Object.freeze(['estimate','known','official']);
const LIMITATIONS=Object.freeze([
 'Alle dargestellten Eurobeträge sind Modell-/Nutzereingaben und keine amtlich bestätigten Auszahlungsbeträge.',
 'Auszahlungsnetto ist nicht dasselbe wie das Elterngeld-Netto; diese Anwendung leitet das amtliche Elterngeld-Netto nicht automatisch aus Brutto ab.',
 'Lebensmonatsanspruch, erwartete Kalenderzahlung und tatsächliche manuelle Bankbuchung sind verschiedene Informationen.',
 'Die Vorlagensuche ermittelt kein mathematisch garantiert globales Optimum.',
 'Mutterschutz: Eine amtliche Referenz nennt fünf Resttage, die Modellherleitung vier; unabhängige fachliche Klärung fehlt.',
 'Alle zusätzlichen Kita-/Wochenkoordinationsannahmen der V3.15–V3.16-Ansicht bleiben flüchtig und sind nicht im Hauptplanexport enthalten.'
]);
function buildExportDisclosure(scope){
 if(!scope||typeof scope!=='object'||!CODES.includes(scope.code)||
    !MODES.includes(scope.inputMode)||typeof scope.sourceCheckedAt!=='string'||
    !/^\d{4}-\d{2}-\d{2}$/.test(scope.sourceCheckedAt)||
    !scope.birthWindow||typeof scope.birthWindow.from!=='string'||typeof scope.birthWindow.through!=='string'||
    typeof scope.expensesKnown!=='boolean'||scope.publicUseApproved!==false||
    scope.officialEntitlementConfirmed!==false||typeof scope.modelPlausible!=='boolean'||
    scope.modelPlausible!==(scope.code==='PLAUSIBLE_MODEL'))
  throw new TypeError('Ohne vollständige, nicht amtlich freigegebene Modell-Einordnung ist kein Exporthinweis zulässig.');
 const incomeSource=scope.inputMode==='official'?'extern_eingetragen_herkunft_nicht_geprueft':
  scope.inputMode==='known'?'eigene_nettowerte_nicht_fachgeprueft':'beispiel_oder_schaetzung';
 return {
  advisoryVersion:1,
  basedOn:'current_validator_not_independent_review',
  modelClassification:scope.code,
  technicalStandardBirthWindow:{from:scope.birthWindow.from,through:scope.birthWindow.through,approvalStatus:'technische_standardregel_keine_freigabe'},
  sourceCheckedAt:scope.sourceCheckedAt,
  inputProvenance:incomeSource,
  expensesProvided:scope.expensesKnown,
  budgetAfterExpensesReliable:scope.expensesKnown?'nicht_unabhaengig_verifiziert':'nicht_berechenbar_ohne_ausgaben',
  legallyVerified:false,
  independentlyReviewed:false,
  publicReleaseApproved:false,
  applicableFutureLawVerified:false,
  containsOnlyScopeMetadata:true,
  warnings:[...LIMITATIONS]
 };
}
const CSV_EXTRA_COLUMNS=Object.freeze([
 'Modell_Einordnung','Quellen_geprueft_am','Einkommen_Herkunft',
 'Haushaltsausgaben_vorhanden','Amtliche_Freigabe','Mutterschutz_Referenz','Monatswerte'
]);
function csvAdvisoryFields(info){
 if(!info||!CODES.includes(info.modelClassification)||info.legallyVerified!==false||
    info.publicReleaseApproved!==false||info.independentlyReviewed!==false)
  throw new TypeError('Exporthinweis ungültig oder fälschlich als freigegeben markiert.');
 return [
  info.modelClassification,info.sourceCheckedAt,info.inputProvenance,
  info.expensesProvided?'ja_ungeprueft':'nein_unbekannt',
  'NEIN','4_oder_5_Resttage_offen','SCHAETZUNG_KEINE_AUSZAHLUNGSZUSAGE'
 ];
}
module.exports={buildExportDisclosure,csvAdvisoryFields,CSV_EXTRA_COLUMNS};
