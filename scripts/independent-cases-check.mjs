import {readFileSync} from 'node:fs';
const data=JSON.parse(readFileSync(new URL('../data/independent-case-requests-2026-10-17.json',import.meta.url),'utf8'));
if(!Array.isArray(data.cases)||data.cases.length<10)throw Error('Weniger als zehn unabhängige Fachprüffälle angefordert.');
const seen=new Set();let independentlyVerified=0;
for(const item of data.cases){
 if(!item.id||seen.has(item.id)||!item.title||!item.birthDate||!item.parents||!item.variant)throw Error('Fachfall unvollständig.');
 seen.add(item.id);
 if(item.independentlyVerified){
  if(!Array.isArray(item.expectedFamilyMonthlyBenefits)||!item.expectedFamilyMonthlyBenefits.length||
    !item.expectedSourceUrl?.startsWith('https://')||!item.independentReviewer)
   throw Error('Vollständiger externer Familienfall ohne authentifizierbares Review.');
  independentlyVerified++;
 }else if(item.expectedFamilyMonthlyBenefits!==null||item.status!=='awaiting_full_external_case')
  throw Error('Ungeprüfter Standardfall wurde fälschlich als Referenz ausgegeben.');
}
if(independentlyVerified!==0)throw Error('Für diesen dokumentierten Prüflauf ist noch keine unabhängige Familienfreigabe eingegangen.');
console.log('Prüfmatrix:',seen.size,'synthetische Anfragen vorbereitet,',independentlyVerified,'vollständige extern bestätigte Referenzfamilien. Gate bleibt offen.');
