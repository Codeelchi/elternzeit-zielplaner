import {readFileSync} from 'node:fs';
import {createRequire} from 'node:module';
const root=new URL('../',import.meta.url);
const require=createRequire(import.meta.url);
const {auditOfficialSources}=require('../src/source-audit.cjs');
const data=JSON.parse(readFileSync(new URL('data/official-source-review-2026-10-17.json',root),'utf8'));
const result=auditOfficialSources(data,{asOf:data.asOf});
if(result.count<10)throw new Error('Quellenbasis unvollständig.');
if(!result.findings.some(f=>f.type==='CONFLICT')||!result.findings.some(f=>f.type==='PROPOSAL'))
 throw new Error('Ungeklärte Kerndifferenz oder zukünftiger Entwurf wurde versehentlich entfernt.');
if(result.items.some(item=>item.calculationApproved))throw new Error('Quellenprüfung fälschlich als unabhängige Fachfreigabe markiert.');
console.log('Quellen-Metadaten gültig: '+result.count+' amtliche Einträge; '+result.findings.length+' offene Statushinweise; rechtliche Freigabe: NEIN.');
