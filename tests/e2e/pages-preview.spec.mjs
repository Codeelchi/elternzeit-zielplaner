import {test,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import {createServer} from 'node:http';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {buildPagesPreview} from '../../scripts/pages-preview-build.mjs';

async function withPreview(callback){
 const {out}=buildPagesPreview();
 const base='/elternzeit-zielplaner/';
 const server=createServer((req,res)=>{
  const url=new URL(req.url,'http://127.0.0.1/');
  const rel=url.pathname.startsWith(base)?url.pathname.slice(base.length):null;
  const file=rel===''?'index.html':rel;
  if(!['index.html','start.html','robots.txt'].includes(file)){
   res.writeHead(404,{'content-type':'text/plain'});res.end('Not found');return;
  }
  res.writeHead(200,{'content-type':file.endsWith('.html')?'text/html; charset=utf-8':'text/plain'});
  res.end(readFileSync(path.join(out,file)));
 });
 await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(0,'127.0.0.1',resolve)});
 const url='http://127.0.0.1:'+server.address().port+base;
 try{await callback({url,out});}
 finally{await new Promise(resolve=>server.close(resolve));}
}
test('GitHub Pages demo loads beneath repository subpath with visible caution and no external requests',async({page})=>{
 await withPreview(async({url})=>{
  const problems=[],external=[];
  page.on('pageerror',error=>problems.push(error.message));
  page.on('request',request=>{if(!request.url().startsWith('http://127.0.0.1:')&&!request.url().startsWith('data:'))external.push(request.url())});
  await page.setViewportSize({width:390,height:844});
  await page.goto(url);
  await expect(page.locator('#public-preview-notice')).toBeVisible();
  await expect(page.locator('#public-preview-notice')).toContainText('NUR FIKTIVE DATEN');
  await expect(page.locator('#v38Advanced')).toBeVisible();
  await page.locator('#v38Advanced').click();
  await expect(page.locator('#sectionNav button').first()).toBeVisible();
  await expect(page.locator('#localSave')).not.toBeChecked();
  await page.goto(url+'start.html');
  await expect(page.locator('#public-preview-notice')).toBeVisible();
  await expect(page.locator('body')).toContainText('Familien');
  expect(problems).toEqual([]);
  expect(external).toEqual([]);
 });
});
test('published preview remains usable offline via file:// without online requests',async({page})=>{
 await withPreview(async({out})=>{
  const issues=[];page.on('pageerror',error=>issues.push(error.message));
  const file='file://'+path.join(out,'index.html');
  await page.goto(file);
  await expect(page.locator('#public-preview-notice')).toContainText('TESTVORSCHAU');
  await expect(page.locator('#v38Advanced')).toBeVisible();
  await page.context().setOffline(true);
  await page.reload();
  await expect(page.locator('#v38Advanced')).toBeVisible();
  expect(issues).toEqual([]);
 });
});

test('source-bound preview separates technical version, rule date, personal data and unsupported cases',async({page})=>{
 await withPreview(async({url})=>{
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.setViewportSize({width:390,height:844});
  await page.goto(url);
  const provenance=page.locator('#public-preview-build-info');
  await expect(provenance).toBeVisible();
  await expect(provenance).toContainText('Paket 3.10.0');
  await expect(provenance).toContainText('Rechtsquellenstand 15.10.2026');
  await expect(provenance).toContainText('V3.15/V3.16 bezeichnen historische Funktionsbereiche');
  const headCommit=await page.locator('meta[name="preview-commit"]').getAttribute('content');
  expect(headCommit).toMatch(/^[a-f0-9]{40}$/);
  await expect(provenance.locator('a[href*="/commit/"]')).toHaveAttribute('href','https://github.com/Codeelchi/elternzeit-zielplaner/commit/'+headCommit);
  await expect(page.locator('#public-preview-notice')).toContainText('NUR FIKTIVE DATEN');
  const accessibility=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa']).analyze();
  expect(accessibility.violations.map(v=>v.id)).toEqual([]);
  await page.locator('#v38EditOwn').click();
  await expect(page.locator('[data-preview-context="quickstart-form"]')).toBeVisible();
  await expect(page.locator('[data-preview-context="quickstart-form"]')).toContainText('Keine echten Gehaltsabrechnungen');
  await expect(page.locator('#v38Personal > summary')).toContainText('Fiktive Testwerte');
  await page.setViewportSize({width:1440,height:900});
  await page.locator('#v38Advanced').click();
  for(const id of ['slide-2','slide-axes','slide-5','slide-6','slide-9','slide-10']){
   const index=await page.locator('.slide').evaluateAll((slides,id)=>slides.findIndex(s=>s.id===id),id);
   await page.locator('#sectionNav button[data-slide="'+index+'"]').click();
   await expect(page.locator('#'+id)).toBeVisible();
   const note=page.locator('[data-preview-context="'+id+'"]');
   await expect(note).toBeVisible();
   await expect(note).toContainText('Keine echten Gehaltsabrechnungen');
   await expect(note).toContainText('2027 und Sonderfälle');
   if(id==='slide-axes'){await expect(page.getByRole('heading',{name:'Fiktive Zahlungseingänge (Testmodus)'})).toBeVisible();}
  }
  await expect(page.locator('#globalPlanStatus')).toContainText('NICHT_UNTERSTUETZT');
  expect(errors).toEqual([]);
 });
});

test('fictitious preview JSON/CSV downloads keep non-approval metadata and import remains local',async({page})=>{
 await withPreview(async({url})=>{
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.setViewportSize({width:1440,height:900});
  await page.goto(url);
  await page.locator('#v38Advanced').click();
  const jsonPending=page.waitForEvent('download');
  await page.locator('#btnJson').click();
  const jsonDownload=await jsonPending;
  const bytes=readFileSync(await jsonDownload.path());
  const exported=JSON.parse(bytes.toString('utf8'));
  expect(exported.schemaVersion).toBe(1);
  expect(exported.version).toBe('3.10.0');
  expect(exported.planningDisclosure.publicReleaseApproved).toBe(false);
  expect(exported.planningDisclosure.legallyVerified).toBe(false);
  expect(exported.planningDisclosure.warnings.some(x=>x.includes('Mutterschutz'))).toBe(true);
  const csvPending=page.waitForEvent('download');
  await page.locator('#btnCsv').click();
  const csvDownload=await csvPending;
  const csv=readFileSync(await csvDownload.path()).toString('utf8');
  expect(csv).toContain('Amtliche_Freigabe');
  expect(csv).toContain('Mutterschutz_Referenz');
  expect(csv).toContain('4_oder_5_Resttage_offen');
  expect(csv).toContain('SCHAETZUNG_KEINE_AUSZAHLUNGSZUSAGE');
  await page.locator('#importJson').setInputFiles({
   name:'synthetisch-export.json',mimeType:'application/json',buffer:bytes
  });
  await expect(page.locator('#localSave')).not.toBeChecked();
  expect(await page.evaluate(()=>localStorage.length)).toBe(0);
  // Exercise explicit consent and erasure, using only the synthetic fixture.
  await page.locator('#localSave').check();
  await expect.poll(()=>page.evaluate(()=>localStorage.getItem('elternzeit-familienplan-v3')!==null)).toBe(true);
  await page.locator('#deleteLocal').click();
  await expect(page.locator('#privacyStorageStatus')).toContainText('Browserkopien dieser App gelöscht');
  expect(await page.evaluate(()=>localStorage.getItem('elternzeit-familienplan-v3'))).toBeNull();
  await expect(page.locator('#localSave')).not.toBeChecked();
  expect(errors).toEqual([]);
 });
});
