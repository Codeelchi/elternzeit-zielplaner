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
if(!/if\(!s\.storageConsent\)return;try\{localStorage\.setItem\('elternzeit-familienplan-v3'/.test(index))
 throw Error('Der aktuelle Plan darf erst nach Speicher-Opt-in gespeichert werden.');
if(!/function deleteLocalData\(\)/.test(index))throw Error('Sichtbarer Löschpfad erforderlich.');
for(const fragment of ['v314InsuranceExtra','v314TaxExtra','v313Payments']) {
 if(!index.includes(fragment))throw Error('Session-Szenario fehlt: '+fragment);
}
// This is not a DPO audit or dynamic proof for all browsers/extensions.
console.log('Statische Datenschutz-Schutzgeländer PASS; unabhängige rechtliche Prüfung und echte Geräte bleiben offen.');
