import {test,expect} from '@playwright/test';
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
