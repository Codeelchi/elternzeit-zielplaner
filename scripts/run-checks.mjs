// Runs all independent check scripts in parallel (bundled output per script).
// Every check must exit 0; otherwise exit 1 and name the failing scripts.
import {spawn} from 'node:child_process';
import {availableParallelism} from 'node:os';
import {fileURLToPath} from 'node:url';

// Exactly the former `npm test` chain (package.json script names).
export const CHECKS=[
 'direct-file:proof:check','rules:check','legislation:check','axes:check','modules:check',
 'sources:check','roadmap:check','docs:check','legacy:check','maternity:check',
 'independent-cases:check','independent-evidence:check','usability:check',
 'privacy:technical-check','search:micro-proof','quickstart:check','staging:check'
];

const npm=process.platform==='win32'?'npm.cmd':'npm';
function run(name){
 return new Promise(resolve=>{
  const t0=Date.now();
  const p=spawn(npm,['run','--silent',name],{stdio:['ignore','pipe','pipe'],shell:process.platform==='win32'});
  let out='';
  p.stdout.on('data',d=>out+=d);p.stderr.on('data',d=>out+=d);
  p.on('error',e=>resolve({name,code:1,out:out+String(e),ms:Date.now()-t0}));
  p.on('close',code=>resolve({name,code:code??1,out,ms:Date.now()-t0}));
 });
}

async function main(){
 const limit=Math.max(2,Math.min(CHECKS.length,availableParallelism()));
 const queue=[...CHECKS],results=[];
 async function worker(){
  while(queue.length){
   const r=await run(queue.shift());
   results.push(r);
   console.log(`\n=== ${r.name} (${r.code===0?'OK':'FEHLER '+r.code}, ${(r.ms/1000).toFixed(1)} s) ===\n${r.out.trimEnd()}`);
  }
 }
 await Promise.all(Array.from({length:limit},worker));
 const failed=results.filter(r=>r.code!==0).map(r=>r.name);
 if(failed.length){console.error('\nFehlgeschlagene Checks: '+failed.join(', '));process.exit(1);}
 console.log(`\n${results.length} Checks erfolgreich.`);
}
if(process.argv[1]&&fileURLToPath(import.meta.url)===process.argv[1])await main();
