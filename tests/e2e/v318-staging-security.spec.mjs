import {test,expect} from '@playwright/test';
import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import {buildStaging} from '../../scripts/staging-build.mjs';

const fileUrl=new URL('../../index.html',import.meta.url).href;
async function privateServer(){
 const info=buildStaging();
 const server=createServer(async (req,res)=>{
  const route=new URL(req.url,'http://127.0.0.1').pathname;
  const match={'/index.html':'index.html','/start.html':'start.html'};
  const filename=match[route];
  if(!filename){res.writeHead(404);res.end('not found');return;}
  if(!['GET','HEAD'].includes(req.method)){res.writeHead(405);res.end();return;}
  res.setHeader('Content-Security-Policy',info.csp);
  res.setHeader('Referrer-Policy','no-referrer');
  res.setHeader('X-Content-Type-Options','nosniff');
  res.setHeader('Cache-Control','no-store');
  res.setHeader('Content-Type','text/html; charset=utf-8');
  const bytes=await readFile(new URL('../../'+filename,import.meta.url));
  res.writeHead(200);
  res.end(req.method==='HEAD'?undefined:bytes);
 });
 await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(0,'127.0.0.1',resolve)});
 return {server,url:'http://127.0.0.1:'+server.address().port};
}
test('V3.18 hashed-CSP staging page renders with no remote requests in a fresh browser',async({page})=>{
 const {server,url}=await privateServer();
 try{
  const runtime=[];const requested=[];
  page.on('pageerror',err=>runtime.push(err.message));
  page.on('request',request=>{if(!request.url().startsWith(url))requested.push(request.url())});
  await page.goto(url+'/index.html');
  await expect(page.locator('#sectionNav button').first()).toBeVisible();
  expect(await page.evaluate(()=>localStorage.length)).toBe(0);
  await expect(page.locator('#globalPlanStatus')).toContainText('Schätzungen');
  await page.setViewportSize({width:320,height:720});
  await page.locator('#v38Advanced').click();
  await expect(page.locator('#sectionNav button').first()).toBeVisible();
  expect(runtime).toEqual([]);
  expect(requested).toEqual([]);
  // Runtime must reject scripts without a matching SHA-256 even on a trusted page.
  const injection=await page.evaluate(()=>new Promise(resolve=>{
   let violation=false;
   document.addEventListener('securitypolicyviolation',event=>{
    if(event.violatedDirective.includes('script-src'))violation=true;
   },{once:true});
   const script=document.createElement('script');
   script.textContent='document.body.dataset.unsafeInline="executed"';
   document.body.append(script);
   setTimeout(()=>resolve({ran:document.body.dataset.unsafeInline==='executed',violation}),100);
  }));
  expect(injection).toEqual({ran:false,violation:true});
  const blockedConnection=await page.evaluate(()=>fetch(location.href).then(()=>false,()=>true));
  expect(blockedConnection).toBe(true);
  const policy=await page.evaluate(()=>document.querySelector('meta[http-equiv="Content-Security-Policy"]')?.content??null);
  expect(policy).toBeNull(); // Enforced by the HTTP response header, not mutable DOM metadata.
  await page.goto(url+'/start.html');
  await expect(page.locator('body')).toContainText('Familien');
  expect(runtime).toEqual([]);
  expect(requested).toEqual([]);
 }finally{
  await new Promise(resolve=>server.close(resolve));
 }
});
test('V3.18 direct file rejects inherited status names without mutating plan',async({page})=>{
 const dialogs=[];
 page.on('dialog',async d=>{dialogs.push(d.message());await d.dismiss()});
 await page.goto(fileUrl);
 await expect(page.locator('#sectionNav button').first()).toBeVisible();
 await page.locator('#v38Advanced').click();
 const baseline=await page.evaluate(()=>window.__elternzeitTest.getState());
 const pending=page.waitForEvent('download');
 await page.locator('#btnJson').click();
 const file=await pending;
 const exported=JSON.parse((await readFile(await file.path())).toString('utf8'));
 for(const code of ['__proto__','constructor','toString']){
  const hostile=structuredClone(exported);
  hostile.data.schedule[3].f=code;
  const previous=dialogs.length;
  await page.locator('#importJson').setInputFiles({
   name:'malicious-'+code+'.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(hostile))
  });
  await expect.poll(()=>dialogs.length).toBe(previous+1);
  expect(dialogs.at(-1)).toMatch(/Import fehlgeschlagen: Unbekannter Monatsstatus/);
  expect(await page.evaluate(()=>window.__elternzeitTest.getState())).toEqual(baseline);
 }
 expect(await page.evaluate(()=>localStorage.length)).toBe(0);
 await page.context().setOffline(true);
 await page.reload();
 await expect(page.locator('#sectionNav button').first()).toBeVisible();
 await expect(page.locator('#localSave')).not.toBeChecked();
});
