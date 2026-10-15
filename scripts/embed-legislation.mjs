import {readFileSync,writeFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {resolve} from 'node:path';
const base=resolve(fileURLToPath(new URL('..',import.meta.url)));
const file=resolve(base,'data/rechtsentwicklungen-2027-2026-10-15.json'),output=resolve(base,'index.html');
const begin='/* LEGISLATION_EVENTS_START */',end='/* LEGISLATION_EVENTS_END */';
const c=JSON.parse(readFileSync(file,'utf8'));
const acceptable=new Set(['bill_referred_not_in_force','parliament_passed_implementation_conditional','promulgated_future_effective','policy_discussion_no_enacted_parameter']);
const date=x=>typeof x==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(x)&&!Number.isNaN(Date.parse(x));
if(!date(c.verified_as_of)||!Array.isArray(c.events)||c.events.length<4)throw Error('Rechtsereignisse fehlen');
const ids=new Set();
for(const e of c.events){
 if(!e.id||ids.has(e.id)||!acceptable.has(e.status)||!date(e.observed_at)||e.observed_at>c.verified_as_of||
    !Array.isArray(e.sources)||!e.sources.length||!e.sources.every(x=>typeof x==='string'&&x.startsWith('https://')))
    throw Error('Rechtsereignis ohne gültige Quelle/Status: '+e.id);
 ids.add(e.id);
 if(e.status==='promulgated_future_effective'&&!date(e.effective_from))throw Error('Künftiges Inkrafttreten ohne Datum: '+e.id);
 if(e.status==='bill_referred_not_in_force'&&e.calculation_effect==='automatic_booked')throw Error('Entwurf kann nicht automatisch gezahlt werden');
}
const html=readFileSync(output,'utf8');
const start=html.indexOf(begin),stop=html.indexOf(end);
if(start<0||stop<start||html.indexOf(begin,start+1)!==-1||html.indexOf(end,stop+1)!==-1)throw Error('Rechtsereignis-Marker fehlen oder sind doppelt');
const snapshot=begin+'\nconst LEGAL_EVENTS=Object.freeze('+JSON.stringify(c).replace(/</g,'\\u003c')+');\n'+end;
const wanted=html.slice(0,start)+snapshot+html.slice(stop+end.length);
if(process.argv.includes('--check')){if(wanted!==html){console.error('Rechtsentwicklungs-Snapshot abweichend: npm run legislation:sync');process.exitCode=1;}else console.log('Rechtsentwicklungen: '+c.events.length+' datierte Ereignisse synchron');}
else{if(wanted!==html)writeFileSync(output,wanted);console.log('Rechtsentwicklungen in Offline-App eingebettet');}
