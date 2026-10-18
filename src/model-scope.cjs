'use strict';

// Read-only interpretation of the EXISTING RuleValidator result. This module
// does not compute benefits, rewrite legal dates or decide any release gate.
const STATES=Object.freeze({
 PLAUSIBEL_STANDARD:'PLAUSIBLE_MODEL',
 NICHT_UNTERSTUETZT:'OUTSIDE_SCOPE',
 DATEN_UNVOLLSTAENDIG:'INPUTS_INCOMPLETE',
 REGELKONFLIKT:'RULE_CONFLICT'
});
const TITLES=Object.freeze({
 PLAUSIBLE_MODEL:'Standardmodell technisch plausibel – keine Freigabe',
 OUTSIDE_SCOPE:'Fall außerhalb des bestätigten Standardmodells',
 INPUTS_INCOMPLETE:'Bitte zuerst die grundlegenden Angaben prüfen',
 RULE_CONFLICT:'Die gewählte Monatsfolge enthält Regelkonflikte',
 FORECAST_ONLY:'Nur unverbindliche Zukunftsprognose'
});
const NEXT_STEPS=Object.freeze({
 PLAUSIBLE_MODEL:'Nettoangaben, Mutterschutz und individuelle Besonderheiten unabhängig prüfen. Keine amtliche Berechnungszusage.',
 OUTSIDE_SCOPE:'Abweichende Familien- oder Einkommenskonstellation beziehungsweise Regelgültigkeit in den Grundlagen prüfen; für Ansprüche zuständige Stelle kontaktieren.',
 INPUTS_INCOMPLETE:'Den unterstützten Standardfall, Einkommen, Geburtstag und gegebenenfalls fehlende Eingaben in den Grundlagen bestätigen.',
 RULE_CONFLICT:'Im Abschnitt „Plan prüfen“ betroffene Lebensmonate, mögliche Korrekturen und Quellen einsehen.',
 FORECAST_ONLY:'2027er-Rechtslage vor der Verwendung amtlich prüfen. Die vorläufige Suche ist keine positive Anspruchsentscheidung.'
});
const MODE_EXPLANATIONS=Object.freeze({
 estimate:'Beispiel-/Schätzwerte: keine persönlichen oder amtlich geprüften Einkommensangaben.',
 known:'Eigene bekannte Nettoangaben: Gehalts-Auszahlungsnetto und Elterngeld-Netto bleiben verschiedene Werte; keine automatische amtliche Prüfung.',
 official:'Werte als extern ermittelt gekennzeichnet: Die App hat Herkunft, Bescheid und Zeiträume nicht überprüft. Nicht den Elterngeld-Monatsbetrag als Elterngeld-Netto eingeben.'
});
const ISO=/^\d{4}-\d{2}-\d{2}$/;
function describeModelScope({validation,state,catalogue,publicReleaseApproved=false}={}){
 if(!validation||typeof validation!=='object'||!Object.hasOwn(STATES,validation.status)||
    !Array.isArray(validation.findings)||typeof validation.provisionalPlanningEligible!=='boolean')
  throw new TypeError('Strukturierter Validatorstatus erforderlich; ohne diesen keine Standardfall-Einstufung.');
 if(!state||typeof state!=='object'||Array.isArray(state))
  throw new TypeError('Planungsannahmen erforderlich.');
 const window=catalogue?.applicable_standard_birth_window;
 if(!window||!ISO.test(window.from)||!ISO.test(window.through)||window.from>window.through||
    !ISO.test(catalogue.verified_as_of))
  throw new TypeError('Datierter Rechtskatalog mit gültiger Standardkohorte erforderlich.');
 // Intentionally fail shut if a future release decision is set elsewhere.
 // Public launch has a separate, independent evidence-and-approval workflow.
 if(publicReleaseApproved!==false)throw new RangeError('Öffentliche Freigabe darf nicht aus einer Modell-Einstufung abgeleitet werden.');
 const codes=validation.findings.map(f=>String(f?.code??''));
 const missingBirth=codes.includes('BIRTH_DATE_INVALID');
 const forecast=validation.provisionalPlanningEligible===true &&
    validation.status==='NICHT_UNTERSTUETZT';
 const kind=missingBirth?'INPUTS_INCOMPLETE':forecast?'FORECAST_ONLY':STATES[validation.status];
 const date=typeof state.date==='string'?state.date:'';
 const withinWindow=ISO.test(date)&&date>=window.from&&date<=window.through;
 const mode=Object.hasOwn(MODE_EXPLANATIONS,state.incomeEntryMode)?
  state.incomeEntryMode:'estimate';
 const expensesKnown=state.expenses!==''&&state.expenses!==null&&state.expenses!==undefined;
 const sample=state.standardCaseConfirmed===true?'Bestätigung des Standardfalls gesetzt':
  state.standardCaseConfirmed===false?'Standardfall verneint – individuelle Prüfung erforderlich':
  'Standardfall noch nicht bestätigt';
 const reasons=validation.findings.slice(0,3).map(f=>({
   code:String(f.code??''),
   status:String(f.status??''),
   message:String(f.message??'')
 }));
 const birthText=withinWindow?
  'Geburtsdatum innerhalb der technisch berücksichtigten Standardkohorte.':
  forecast?'Geburtsdatum außerhalb der bestätigten Standardkohorte – Prognose ausdrücklich ohne Regelzusage.':
  'Geburtsdatum liegt nicht in der bestätigten Standardkohorte oder ist ungültig.';
 const moneyText=MODE_EXPLANATIONS[mode]+
   (expensesKnown?' Haushaltsausgaben sind eingegeben, aber nicht extern überprüft.':
   ' Haushaltsausgaben unbekannt: Der verbleibende Monatsbetrag ist nicht belastbar.');
 return {
  code:kind,title:TITLES[kind],nextStep:NEXT_STEPS[kind],
  modelPlausible:kind==='PLAUSIBLE_MODEL',
  forecastOnly:kind==='FORECAST_ONLY',
  publicUseApproved:false,officialEntitlementConfirmed:false,
  inputMode:mode,expensesKnown,withinStandardBirthWindow:withinWindow,
  birthWindow:{from:window.from,through:window.through},
  sourceCheckedAt:catalogue.verified_as_of,
  sourceVersion:catalogue.version??null,
  birthText,standardText:sample,moneyText,
  reasons,remainingFindings:Math.max(0,validation.findings.length-reasons.length),
  releaseText:'Öffentliche Freigabe ausstehend: unabhängige Berechnungs-, Rechts-, Datenschutz- und Nutzertests fehlen. Der Mutterschutz-Referenzkonflikt (4/5 Resttage) ist ungeklärt.',
  disclaimer:'Dies ist eine Statusinterpretation der vorhandenen Modellprüfung, keine neue Rechtsregel, keine Bewilligung und kein Ersatz für persönliche Beratung.'
 };
}
module.exports={describeModelScope,STATES,MODE_EXPLANATIONS};
