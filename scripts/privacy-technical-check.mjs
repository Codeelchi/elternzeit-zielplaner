import {readFileSync} from 'node:fs';
const root=new URL('../',import.meta.url);
const index=readFileSync(new URL('index.html',root),'utf8');
const portal=readFileSync(new URL('start.html',root),'utf8');
for(const [name,page] of [['Kalkulator',index],['Infoportal',portal]]) {
 const violations=[];
 const blocks=[...page.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)];
 if(!blocks.length)violations.push('Keine lokal eingebettete Anwendung');
 if(/<script\b[^>]*\bsrc\s*=/i.test(page))violations.push('Externes JavaScript');
 if(/@import\s+(?:url\s*\()?\s*['"]?https?:/i.test(page)||/url\s*\(\s*['"]?https?:/i.test(page))
  violations.push('Externe CSS-Ressource');
 if(/<(?:img|iframe|video|audio|link|source)\b[^>]*(?:src|href)\s*=\s*['"]https?:/i.test(page))
  violations.push('Fremdmedien ohne expliziten Klick');
 if(blocks.some(x=>/\b(?:fetch\s*\(|new\s+WebSocket\s*\(|new\s+XMLHttpRequest\s*\(|navigator\.sendBeacon\s*\(|new\s+EventSource\s*\()/.test(x[1])))
  violations.push('Netzwerk-Transport-API in Seitenskript');
 if(blocks.some(x=>/document\.cookie\s*=/.test(x[1])))violations.push('Cookie-Setzen');
 if(violations.length)throw Error(name+': '+violations.join(', '));
 console.log(name+': im HTML statisch keine aktiven Netzwerk-/Cookie-/Drittmedien-Schnittstellen erkennbar.');
}
// Check behavior-relevant structure, not one historic one-line function layout.
function method(name){
 const start=index.indexOf('function '+name+'(');
 if(start<0)throw Error(name+': Pfad fehlt.');
 const end=index.indexOf('\n}',start);
 if(end<0)throw Error(name+': unvollständiger Funktionsblock.');
 return index.slice(start,end+2);
}
const save=method('persist'),erase=method('deleteLocalData'),restore=method('restore');
if(!/if\s*\(!s\.storageConsent\)\s*return\s+false\s*;/.test(save)||
 !/try\s*\{[\s\S]*localStorage\.setItem\('elternzeit-familienplan-v3'/.test(save)||
 !/catch\s*\([\w]+\)\s*\{[\s\S]*s\.storageConsent\s*=\s*false/.test(save)||
 !save.includes("reportStorageStatus("))
 throw Error('Opt-in-Pflicht, bestätigtes Speichern oder Fail-Closed-Behandlung fehlen.');
if(!erase.includes('PRIVATE_STORAGE_KEYS')||
 !/removeItem\(key\)/.test(erase)||
 !/verified\s*=\s*PRIVATE_STORAGE_KEYS\.every\(key\s*=>\s*localStorage\.getItem\(key\)===null\)/.test(erase)||
 !erase.includes('catch(e)')||
 !erase.includes('return verified'))
 throw Error('Löschung darf nur nach bestätigter Entfernung als erfolgreich gemeldet werden.');
if(!restore.includes('try{')||!restore.includes('catch(e)')||
 !restore.includes('reportStorageStatus('))
 throw Error('Wiederherstellungsfehler müssen sichtbar und fail-safe behandelt werden.');
if(!/id="privacyStorageStatus"[^>]*role="status"[^>]*aria-live="polite"/.test(index))
 throw Error('Zugänglicher permanenter Browser-Speicherstatus fehlt.');
for(const key of ['elternzeit-familienplan-v1','elternzeit-familienplan-v2','elternzeit-familienplan-v3'])
 if(!index.includes(key))throw Error('Legacy-Browser-Schlüssel fehlt: '+key);
for(const fragment of ['v314InsuranceExtra','v314TaxExtra','v313Payments']) {
 if(!index.includes(fragment))throw Error('Session-Szenario fehlt: '+fragment);
}
// This is not a DPO audit or dynamic proof for all browsers/extensions.
console.log('Statische Datenschutz-Schutzgeländer PASS; unabhängige rechtliche Prüfung und echte Geräte bleiben offen.');
