import test from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const {buildExportDisclosure,csvAdvisoryFields,CSV_EXTRA_COLUMNS}=require('../src/export-disclosure.cjs');
const scope=()=>({
 code:'PLAUSIBLE_MODEL',inputMode:'known',sourceCheckedAt:'2026-10-15',
 birthWindow:{from:'2025-04-01',through:'2026-12-31'},
 expensesKnown:true,publicUseApproved:false,officialEntitlementConfirmed:false,modelPlausible:true
});
test('export advisory is bounded to neutral, factual descriptions without original personal data',()=>{
 const original=scope();
 const report=buildExportDisclosure(original);
 assert.equal(report.advisoryVersion,1);
 assert.equal(report.modelClassification,'PLAUSIBLE_MODEL');
 assert.equal(report.sourceCheckedAt,'2026-10-15');
 assert.equal(report.legallyVerified,false);
 assert.equal(report.independentlyReviewed,false);
 assert.equal(report.publicReleaseApproved,false);
 assert.equal(report.applicableFutureLawVerified,false);
 assert.equal(report.containsOnlyScopeMetadata,true);
 assert.equal(report.technicalStandardBirthWindow.from,'2025-04-01');
 assert.equal(report.inputProvenance,'eigene_nettowerte_nicht_fachgeprueft');
 assert.deepEqual(original,scope());
 assert.match(report.warnings.join(' '),/Mutterschutz.*fünf Resttage.*vier/);
 assert.match(report.warnings.join(' '),/Wochenkoordinationsannahmen.*nicht im Hauptplanexport/);
 for(const key of Object.keys(report))assert.doesNotMatch(key,/netFather|dateOfBirth|parentName|incomeAmount/i);
});
test('all supported status and provenance variants have explicit, nonapproval semantics',()=>{
 for(const code of ['PLAUSIBLE_MODEL','OUTSIDE_SCOPE','INPUTS_INCOMPLETE','RULE_CONFLICT','FORECAST_ONLY']){
  for(const mode of ['estimate','known','official']){
   const report=buildExportDisclosure({...scope(),code,modelPlausible:code==='PLAUSIBLE_MODEL',inputMode:mode,expensesKnown:false});
   assert.equal(report.modelClassification,code);
   assert.equal(report.expensesProvided,false);
   assert.equal(report.budgetAfterExpensesReliable,'nicht_berechenbar_ohne_ausgaben');
   assert.equal(report.legallyVerified,false);
   assert.equal(csvAdvisoryFields(report)[0],code);
  }
 }
 assert.equal(buildExportDisclosure({...scope(),inputMode:'official'}).inputProvenance,'extern_eingetragen_herkunft_nicht_geprueft');
});
test('CSV advisory is appended without changing existing 17 columns',()=>{
 assert.equal(CSV_EXTRA_COLUMNS.length,7);
 assert.equal(new Set(CSV_EXTRA_COLUMNS).size,7);
 const notes=csvAdvisoryFields(buildExportDisclosure(scope()));
 assert.equal(notes.length,CSV_EXTRA_COLUMNS.length);
 assert.ok(notes.every(x=>typeof x==='string'&&!x.includes(';')&&!x.includes('\r')&&!x.includes('\n')));
 assert.equal(notes[4],'NEIN');
 assert.match(notes[5],/offen/);
});
test('an invalid or forged positive review cannot produce a disclosure',()=>{
 assert.throws(()=>buildExportDisclosure(null),TypeError);
 assert.throws(()=>buildExportDisclosure({...scope(),code:'APPROVED'}),TypeError);
 assert.throws(()=>buildExportDisclosure({...scope(),inputMode:'verified_automatically'}),TypeError);
 assert.throws(()=>buildExportDisclosure({...scope(),sourceCheckedAt:'today'}),TypeError);
 assert.throws(()=>buildExportDisclosure({...scope(),publicUseApproved:true}),TypeError);
 assert.throws(()=>buildExportDisclosure({...scope(),code:'OUTSIDE_SCOPE',modelPlausible:true}),TypeError);
 assert.throws(()=>buildExportDisclosure({...scope(),officialEntitlementConfirmed:true}),TypeError);
 const generated=buildExportDisclosure(scope());
 assert.throws(()=>csvAdvisoryFields({...generated,publicReleaseApproved:true}),TypeError);
 assert.throws(()=>csvAdvisoryFields({...generated,independentlyReviewed:true}),TypeError);
 assert.throws(()=>csvAdvisoryFields({...generated,modelClassification:'APPROVED'}),TypeError);
});
