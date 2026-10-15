import {readFileSync} from 'node:fs';
const root=new URL('../',import.meta.url);
const gates=JSON.parse(readFileSync(new URL('data/release-gates.json',root),'utf8'));
const references=JSON.parse(readFileSync(new URL('qa/reference-deltas-current.json',root),'utf8'));
const failures=[];
for(const key of ['independentCalculationReview','legalReview','privacyReview','directFileBrowserReview','userTesting'])if(gates[key]!=='approved')failures.push(`${key}: ${gates[key]||'missing'}`);
if(gates.publicReleaseApproved!==true)failures.push('publicReleaseApproved: false');
if(references.publicReleaseGatePassed!==true)failures.push('Amtlicher Referenzabgleich: nicht bestanden');
if(gates.version!==references.version)failures.push('Versionsstände abweichend');
if(failures.length){process.stderr.write('Öffentlicher Release gesperrt:\n'+failures.map(x=>'- '+x).join('\n')+'\n');process.exitCode=1;}
else process.stdout.write('Dokumentierte Release-Gates freigegeben; technische Checks separat durchführen.\n');
