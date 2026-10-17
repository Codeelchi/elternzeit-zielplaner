import {readFileSync} from 'node:fs';
const root=new URL('../',import.meta.url);
const plan=JSON.parse(readFileSync(new URL('data/roadmap-status-2026-10-17.json',root),'utf8'));
const gates=JSON.parse(readFileSync(new URL('data/release-gates.json',root),'utf8'));
const statuses=['extern offen','teilweise','technisch umgesetzt'];
if(!Array.isArray(plan.items)||plan.items.length<12||plan.publicReleaseApproved!==false||gates.publicReleaseApproved!==false)
 throw Error('Unvollständige Roadmap oder Freigabestatus widerspricht den Fachgates.');
const ids=new Set();
for(const task of plan.items) {
 if(!task.id||ids.has(task.id)||!statuses.includes(task.status)||!task.title||!task.nextEvidence)
  throw Error('Ungültiger oder doppelter Roadmap-Eintrag.');
 if(task.id.startsWith('P0-')&&task.status!=='extern offen')
  throw Error('Fachliche P0-Abnahme fehlt, darf nicht als abgeschlossen zählen.');
 ids.add(task.id);
}
for(const id of ['P0-R1','P0-R2','P0-R3','P0-R4','P1-R5','P1-R6','P1-R7','P1-R8'])
 if(!ids.has(id))throw Error('Roadmap fehlt: '+id);
const counts=Object.fromEntries(statuses.map(status=>[status,plan.items.filter(x=>x.status===status).length]));
console.log('Roadmap-Status:',counts,'; öffentliche Freigabe: NEIN.');
