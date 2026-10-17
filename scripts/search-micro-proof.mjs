import {readFileSync} from 'node:fs';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const {microspaceProof}=require('../src/microspace-proof.cjs');
const cat=JSON.parse(readFileSync(new URL('../data/rechtsregeln-de-nrw-2026-10-14.json',import.meta.url),'utf8'));
const family={date:'2026-05-28',standardCaseConfirmed:true,births:1,zve:95000,
 hoursFather:28,hoursMother:28,netFather:2700,netMother:2500,
 egNetFather:2700,egNetMother:2500,ptNetFather:1800,ptNetMother:1800,
 incomeProfileFather:'salary_only',incomeProfileMother:'salary_only'};
const r=microspaceProof(cat,family);
if(r.enumerated!==256||r.unique!==256||r.globalCompleteness||r.realElterngeldAmountChecked)
 throw Error('Kleiner vollständiger Suchraum nicht korrekt ausgewertet.');
console.log(JSON.stringify(r,null,2));
