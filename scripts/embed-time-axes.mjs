import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
const root=resolve(fileURLToPath(new URL('..',import.meta.url)));
const htmlPath=resolve(root,'index.html'),sourcePath=resolve(root,'src/time-axes.cjs');
const start='/* TIME_AXES_MODULE_START */',end='/* TIME_AXES_MODULE_END */';
const source=readFileSync(sourcePath,'utf8');
const html=readFileSync(htmlPath,'utf8');
const a=html.indexOf(start),b=html.indexOf(end);
if(a<0||b<a||html.indexOf(start,a+1)!==-1||html.indexOf(end,b+1)!==-1)throw Error('Zeitachsen-Marker nicht eindeutig');
if(source.includes('</script'))throw Error('Script-Injektion nicht erlaubt');
const inline='const TimeAxes = (()=>{const module={exports:{}};\n'+source+'\nreturn Object.freeze(module.exports);})();';
const wanted=html.slice(0,a+start.length)+'\n'+inline+'\n'+html.slice(b);
if(process.argv.includes('--check')){if(html!==wanted){console.error('Zeitachsen-Snapshot abweichend, bitte npm run axes:sync ausführen');process.exitCode=1}else console.log('Zeitachsen-Snapshot synchron');}
else {if(html!==wanted)writeFileSync(htmlPath,wanted);console.log('Zeitachsen-Snapshot eingebettet');}
