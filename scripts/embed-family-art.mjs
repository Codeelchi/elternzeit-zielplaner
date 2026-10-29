import {readFileSync,writeFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import path from 'node:path';

const root=path.resolve(fileURLToPath(new URL('..',import.meta.url)));
const target=path.join(root,'start.html');
const bytes=readFileSync(path.join(root,'assets/familienstart-garten.webp'));
const markup='<img class="hero-family-image" alt="" width="1200" height="800" src="data:image/webp;base64,'+bytes.toString('base64')+'">';
const original=readFileSync(target,'utf8');
const pattern=/(<div class="hero-art">)(?:<svg\b[\s\S]*?<\/svg>|<img class="hero-family-image"[^>]*>)(<p class="art-caption">)/;
if(!pattern.test(original))throw Error('Familienstart-Bildbereich nicht eindeutig gefunden.');
const result=original.replace(pattern,(_,before,after)=>before+markup+after);
if(process.argv.includes('--check')){
 if(result!==original)throw Error('Familienillustration in start.html ist nicht aktuell.');
 console.log('Offline-Familienillustration ist synchron.');
}else if(result!==original){writeFileSync(target,result);console.log('Offline-Familienillustration eingebettet.');}

const plannerTarget=path.join(root,'src/v38-quickstart.html');
const plannerBytes=readFileSync(path.join(root,'assets/familienplan-notizbuch.webp'));
const plannerMarkup='<img class="v38-selection-art" aria-hidden="true" focusable="false" alt="" width="600" height="400" src="data:image/webp;base64,'+plannerBytes.toString('base64')+'">';
const plannerOriginal=readFileSync(plannerTarget,'utf8');
const plannerPattern=/<svg class="v38-selection-art"[\s\S]*?<\/svg>|<img class="v38-selection-art"[^>]*>/;
if(!plannerPattern.test(plannerOriginal))throw Error('Rechnerillustration nicht eindeutig gefunden.');
const plannerResult=plannerOriginal.replace(plannerPattern,plannerMarkup);
if(process.argv.includes('--check')){
 if(plannerResult!==plannerOriginal)throw Error('Rechnerillustration ist nicht aktuell.');
}else if(plannerResult!==plannerOriginal){writeFileSync(plannerTarget,plannerResult);console.log('Rechnerillustration eingebettet; quickstart:sync ausführen.');}
