import test from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {readFileSync} from 'node:fs';
const require=createRequire(import.meta.url);
const {describeModelScope}=require('../src/model-scope.cjs');
const catalog=JSON.parse(readFileSync(new URL('../data/rechtsregeln-de-nrw-2026-10-14.json',import.meta.url)));
const gates=JSON.parse(readFileSync(new URL('../data/release-gates.json',import.meta.url)));
const state={date:'2026-05-28',standardCaseConfirmed:true,incomeEntryMode:'known',expenses:1800};
const valid={status:'PLAUSIBEL_STANDARD',valid:true,provisionalPlanningEligible:false,findings:[]};
function scope(partial={},s=state,cat=catalog){
 return describeModelScope({validation:{...valid,...partial},state:s,catalogue:cat,publicReleaseApproved:gates.publicReleaseApproved});
}
const finding=(code,status='NICHT_UNTERSTUETZT',message='Nicht freigegeben')=>({code,status,message});
test('even a technically plausible standard model is NEVER approved publicly or as a benefit',()=>{
 assert.equal(gates.publicReleaseApproved,false);
 const r=scope();
 assert.equal(r.code,'PLAUSIBLE_MODEL');
 assert.equal(r.modelPlausible,true);
 assert.equal(r.publicUseApproved,false);
 assert.equal(r.officialEntitlementConfirmed,false);
 assert.equal(r.sourceCheckedAt,catalog.verified_as_of);
 assert.deepEqual(r.birthWindow,catalog.applicable_standard_birth_window);
 assert.match(r.title,/keine Freigabe/);
 assert.match(r.releaseText,/Mutterschutz/);
});
test('confirmed status is not assumed for an unconfirmed standard household',()=>{
 const r=scope({status:'DATEN_UNVOLLSTAENDIG',findings:[
  finding('STANDARD_CASE_UNCONFIRMED','DATEN_UNVOLLSTAENDIG','Bitte Standardfall bestätigen')
 ]},{...state,standardCaseConfirmed:null});
 assert.equal(r.code,'INPUTS_INCOMPLETE');
 assert.match(r.standardText,/noch nicht bestätigt/);
 assert.match(r.nextStep,/Standardfall/);
});
test('an explicitly unsupported family or out-of-bounds birth cannot get plausible label',()=>{
 const r=scope({status:'NICHT_UNTERSTUETZT',findings:[
  finding('PREBIRTH_INCOME_COMPOSITION_UNSUPPORTED')
 ]},{...state,standardCaseConfirmed:false});
 assert.equal(r.code,'OUTSIDE_SCOPE');
 assert.equal(r.modelPlausible,false);
 assert.equal(r.publicUseApproved,false);
});
test('2027 is only a non-binding preview when the existing validator allows a forecast',()=>{
 const findings=[finding('BIRTH_COHORT_UNSUPPORTED'),finding('FUTURE_COHORT_UNVERIFIED')];
 const r=scope({status:'NICHT_UNTERSTUETZT',provisionalPlanningEligible:true,findings},{...state,date:'2027-05-28'});
 assert.equal(r.code,'FORECAST_ONLY');
 assert.equal(r.forecastOnly,true);
 assert.equal(r.withinStandardBirthWindow,false);
 assert.match(r.birthText,/Prognose ausdrücklich ohne Regelzusage/);
 const blocked=scope({status:'NICHT_UNTERSTUETZT',provisionalPlanningEligible:false,findings},
  {...state,date:'2027-05-28'});
 assert.equal(blocked.code,'OUTSIDE_SCOPE');
});
test('rule conflicts and invalid date are not resolved by provenance metadata',()=>{
 const rule=scope({status:'REGELKONFLIKT',findings:[finding('BONUS_HOURS','REGELKONFLIKT')]});
 assert.equal(rule.code,'RULE_CONFLICT');
 const invalid=scope({status:'NICHT_UNTERSTUETZT',findings:[finding('BIRTH_DATE_INVALID','DATEN_UNVOLLSTAENDIG')]},
  {...state,date:'invalid-date'});
 assert.equal(invalid.code,'INPUTS_INCOMPLETE');
 assert.equal(invalid.withinStandardBirthWindow,false);
});
test('the income mode claimed to be external is never treated as verified by app',()=>{
 const original=structuredClone(state);
 const r=scope({}, {...state,incomeEntryMode:'official'});
 assert.equal(r.inputMode,'official');
 assert.match(r.moneyText,/Herkunft, Bescheid und Zeiträume nicht überprüft/);
 assert.deepEqual(state,original);
});
test('unknown household expenses are not inferred as zero',()=>{
 const unknown=scope({}, {...state,expenses:''});
 const zero=scope({}, {...state,expenses:0});
 assert.equal(unknown.expensesKnown,false);
 assert.match(unknown.moneyText,/nicht belastbar/);
 assert.equal(zero.expensesKnown,true);
});
test('limited findings and messages stay bounded without copying financial data',()=>{
 const reasons=Array.from({length:9},(_,i)=>finding('X'+i,'REGELKONFLIKT','Hinweis '+i));
 const r=scope({status:'REGELKONFLIKT',findings:reasons});
 assert.equal(r.reasons.length,3);
 assert.equal(r.remainingFindings,6);
 assert.equal(JSON.stringify(r).includes('1800'),false);
});
test('broken catalogue, unknown status, missing inputs, or released-gate bypass fail closed',()=>{
 assert.throws(()=>scope({status:'APPROVED'}),TypeError);
 assert.throws(()=>scope({findings:null}),TypeError);
 assert.throws(()=>describeModelScope({validation:valid,state:null,catalogue:catalog}),TypeError);
 assert.throws(()=>scope({},state,{...catalog,applicable_standard_birth_window:null}),TypeError);
 assert.throws(()=>describeModelScope({validation:valid,state,catalogue:catalog,publicReleaseApproved:true}),RangeError);
});
