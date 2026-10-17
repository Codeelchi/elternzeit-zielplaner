import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const {microspaceProof}=require('../src/microspace-proof.cjs');
const catalogue=JSON.parse(readFileSync(new URL('../data/rechtsregeln-de-nrw-2026-10-14.json',import.meta.url),'utf8'));
const state={date:'2026-05-28',standardCaseConfirmed:true,births:1,zve:95000,hoursFather:28,hoursMother:28,
 netFather:2700,netMother:2500,egNetFather:2700,egNetMother:2500,ptNetFather:1800,ptNetMother:1800,
 incomeProfileFather:'salary_only',incomeProfileMother:'salary_only'};
test('complete 256 synthetic LM3/4 status combinations have unique fingerprints and a separately checked winner',()=>{
 const r=microspaceProof(catalogue,state);
 assert.equal(r.enumerated,256);
 assert.equal(r.unique,256);
 assert.equal(r.accepted+Object.values(r.excluded).reduce((a,b)=>a+b,0),256);
 assert.equal(r.realElterngeldAmountChecked,false);
 assert.equal(r.globalCompleteness,false);
 assert.ok(r.accepted>0);
 assert.ok(Number.isFinite(r.oracleMaxTotal));
});
test('provisional or unconfirmed family data cannot be presented as independent standard-case proof',()=>{
 assert.throws(()=>microspaceProof(catalogue,{...state,standardCaseConfirmed:false}),TypeError);
 assert.throws(()=>microspaceProof(catalogue,{...state,date:'2027-05-28'}),TypeError);
 assert.throws(()=>microspaceProof(null,state),TypeError);
});
