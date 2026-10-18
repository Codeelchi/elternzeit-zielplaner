// Reproducible, manually invoked bench: no user data, no HTTP, no CI threshold.
import {chromium,expect} from '@playwright/test';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import os from 'node:os';
import path from 'node:path';
import {performance} from 'node:perf_hooks';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const count=Number(process.argv[2]||'2');
if(!Number.isInteger(count)||count<1||count>5)throw new Error('Use 1 to 5 synthetic repetitions.');
const entry=pathToFileURL(path.join(root,'index.html')).href;
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH||undefined,args:['--no-sandbox']});
const runs=[];
try{
 for(let n=0;n<count;n++){
  const context=await browser.newContext({viewport:{width:390,height:844}});
  const page=await context.newPage();
  const errors=[],httpRequests=[];
  page.on('pageerror',e=>errors.push(e.message));
  page.on('request',r=>{if(/^https?:/.test(r.url()))httpRequests.push(r.url());});
  await page.route('**/*',route=>/^https?:/.test(route.request().url())?route.abort('blockedbyclient'):route.continue());
  await page.goto(entry);
  await page.locator('#v38Advanced').click();
  async function slide(id){
   const index=await page.locator('.slide').evaluateAll((slides,target)=>slides.findIndex(el=>el.id===target),id);
   await page.locator('#sectionNav button[data-slide="'+index+'"]').click();
  }
  await slide('slide-2');
  await page.locator('#standardCaseConfirmed').selectOption('yes');
  await page.locator('#date').fill('2026-05-28');
  await page.locator('#expenses').fill('1800');
  await slide('slide-region');
  await page.locator('#zve').fill('95000');
  await slide('slide-goal');
  await page.locator('#goalCare').selectOption('12');
  await page.locator('#goalMinFather').fill('2');
  await page.locator('#goalPart').selectOption('0');
  const started=performance.now();
  await page.locator('#runGoal').click();
  await expect(page.locator('#runGoal')).toBeEnabled({timeout:90000});
  await expect(page.locator('#goalResult')).toContainText('Automatische Suche abgeschlossen');
  const durationMs=Math.round(performance.now()-started);
  const data=await page.evaluate(()=>({
   progress:document.getElementById('goalSearchProgress').textContent,
   count:window.__elternzeitV3.goalResults().length,
   storageKeys:Object.keys(localStorage).length,
   status:document.querySelector('#globalPlanStatus')?.textContent,
   resultBusy:document.getElementById('goalResult').getAttribute('aria-busy')
  }));
  if(errors.length||httpRequests.length||data.storageKeys||!data.count||data.resultBusy!=='false')throw Error('Browser probe violated benchmark expectations: '+JSON.stringify({errors,httpRequests,data}));
  runs.push({durationMs,proposals:data.count,appProgress:data.progress});
  await context.close();
 }
 const packageInfo=JSON.parse(readFileSync(path.join(root,'package.json'),'utf8'));
 const result={
  benchmark:'Elternzeit goal search (synthetic browser observations only)',
  gitHead:execFileSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8'}).trim(),
  workingTreeDirty:Boolean(execFileSync('git',['status','--porcelain'],{cwd:root,encoding:'utf8'}).trim()),
  testedIndexHtmlSha256:createHash('sha256').update(readFileSync(path.join(root,'index.html'))).digest('hex'),
  packageVersion:packageInfo.version,
  data:{birth:'2026-05-28',standardCaseConfirmed:true,expenses:1800,zve:95000,goalCare:12,goalMinFather:2,goalPart:0},
  hardware:{cpu:os.cpus()[0]?.model||'unknown',logicalCpus:os.cpus().length,arch:os.arch(),platform:os.platform(),node:process.version,chromium:browser.version(),viewport:'390x844 CSS pixels'},
  networkRequests:0,storageWrites:0,
  iterations:runs,
  warning:'Observed wall times in this Workbench, not representative smartphone performance or a service guarantee. No independent legal approval.'
 };
 console.log(JSON.stringify(result,null,2));
}finally{await browser.close();}
