import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const {getUnderstandingTasks}=require('../src/understanding-guide.cjs');
const {validateUsabilityEvidence}=require('../src/usability-evidence.cjs');
const source=readFileSync(new URL('../src/understanding-guide.cjs',import.meta.url));
const manifest=JSON.parse(readFileSync(new URL('../data/usability-review-v317d.json',import.meta.url),'utf8'));
const result=validateUsabilityEvidence({
 manifest,taskIds:getUnderstandingTasks().map(t=>t.id),
 sourceSha256:createHash('sha256').update(source).digest('hex')
});
console.log(result.tasksPrepared+' synthetische Aufgaben vorbereitet; '+result.tasksObserved+
 ' extern beobachtet; '+result.participantsObserved+' Personen erfasst; externe Nutzerfreigabe: NEIN.');
console.log('Nur Vorbereitungs- und Strukturprüfung, kein realer Nutzertest.');
