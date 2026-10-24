import {test,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import {readFileSync} from 'node:fs';

const indexUrl=new URL('../../index.html',import.meta.url).href;
const startUrl=new URL('../../start.html',import.meta.url).href;
async function offlinePage(page){
 const external=[],errors=[];
 page.on('request',request=>{
  if(/^(?:https?:|wss?:)/i.test(request.url()))external.push(request.url());
 });
 page.on('pageerror',error=>errors.push(error.message));
 await page.route('**/*',route=>{
  if(/^(?:https?:|wss?:)/i.test(route.request().url()))return route.abort('blockedbyclient');
  return route.continue();
 });
 await page.context().setOffline(true);
 return {external,errors};
}
const checkSilent=({external,errors})=>{
 expect(external,'No HTTP(S) or WebSocket attempts are allowed in direct-file offline tests').toEqual([]);
 expect(errors,'No script errors during direct-file offline use').toEqual([]);
};
async function sample(page){
 await page.locator('[data-v38-template="classic"]').click();
 await expect(page.locator('#sectionNav button')).not.toHaveCount(0);
}

test('fresh actual index.html and start.html load over file:// with all network unavailable, keyboard and accessible portal',async({page})=>{
 const events=await offlinePage(page);
 await page.setViewportSize({width:390,height:844});
 await page.goto(startUrl);
 await expect(page).toHaveURL(/^file:\/\//);
 await expect(page.locator('body')).toContainText('Familien');
 await expect(page.locator('body a[href*="index.html"]').first()).toBeVisible();
 const startAx=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa']).analyze();
 expect(startAx.violations.map(x=>x.id)).toEqual([]);
 await page.goto(indexUrl);
 await expect(page).toHaveURL(/^file:\/\//);
 await expect(page.locator('#v38Advanced')).toBeVisible();
 await expect(page.locator('#localSave')).not.toBeChecked();
 await page.keyboard.press('Tab');
 const indexAx=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa']).analyze();
 expect(indexAx.violations.map(x=>x.id)).toEqual([]);
 checkSilent(events);
});

test('direct-file six-step results reach source-linked task hub, two-page A4 print and return without internet',async({page})=>{
 const events=await offlinePage(page);
 await page.setViewportSize({width:390,height:844});
 await page.addInitScript(()=>{window.print=()=>{window.__printCalls=(window.__printCalls||0)+1};});
 await page.goto(indexUrl);
 await sample(page);
 await page.locator('#sectionNav button[data-slide="11"]').click();
 await expect(page.locator('#v44OpenActions')).toBeVisible();
 await page.locator('#v44OpenActions').click();
 await expect(page.locator('#v44TaskList a[href^="https://"]')).not.toHaveCount(0);
 const overviewAx=await new AxeBuilder({page}).include('#v44TaskHub').include('#v44ReportHub')
  .withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa']).analyze();
 expect(overviewAx.violations.map(x=>x.id)).toEqual([]);
 await page.locator('#v44Print').click();
 await expect(page.locator('#v44PrintSheet [data-v44-page]')).toHaveCount(2);
 expect(await page.evaluate(()=>window.__printCalls)).toBe(1);
 const pdf=await page.pdf({printBackground:true,preferCSSPageSize:true});
 const raw=pdf.toString('latin1');
 expect((raw.match(/\/Type\s*\/Page\b/g)||[])).toHaveLength(2);
 const boxes=raw.match(/\/MediaBox\s*\[[^\]]+\]/g)||[];
 expect(boxes).toHaveLength(2);
 for(const box of boxes){
  const dim=box.match(/\[\s*0\s+0\s+([\d.]+)\s+([\d.]+)/);
  expect(dim,'Expected exact A4 MediaBox').not.toBeNull();
  expect(Number(dim[1])).toBeGreaterThan(590);
  expect(Number(dim[1])).toBeLessThan(600);
  expect(Number(dim[2])).toBeGreaterThan(837);
  expect(Number(dim[2])).toBeLessThan(848);
 }
 await page.evaluate(()=>window.dispatchEvent(new Event('afterprint')));
 await expect(page.locator('#v44PrintSheet')).toBeEmpty();
 await page.locator('#v44BackResults').click();
 await expect(page.locator('#v44OpenActions')).toBeVisible();
 expect(await page.evaluate(()=>localStorage.length)).toBe(0);
 checkSilent(events);
});

test('direct-file safe JSON export/import, storage refusal, 2027 caution and restart without network',async({page})=>{
 const events=await offlinePage(page);
 await page.goto(indexUrl);
 await sample(page);
 const prior=await page.evaluate(()=>window.__elternzeitTest.getState());
 const exportPromise=page.waitForEvent('download');
 await page.locator('#btnJson').click();
 const exported=JSON.parse(readFileSync(await(await exportPromise).path(),'utf8'));
 expect(exported.fileType).toBe('elternzeit-offline-v3');
 expect(exported.schemaVersion).toBe(1);
 expect(exported.planningDisclosure.publicReleaseApproved).toBe(false);
 expect(exported.planningDisclosure.legallyVerified).toBe(false);
 await page.locator('#importJson').setInputFiles({
  name:'offline-synthetic.json',mimeType:'application/json',
  buffer:Buffer.from(JSON.stringify(exported))
 });
 await expect(page.locator('#importFeedback')).toHaveAttribute('data-import-result','success');
 await expect(page.locator('#localSave')).not.toBeChecked();
 await page.evaluate(()=>window.__elternzeitTest.changeValue('date','2027-05-28'));
 await expect(page.locator('#globalPlanStatus')).toContainText('NICHT_UNTERSTUETZT');
 await page.reload();
 await expect(page.locator('#localSave')).not.toBeChecked();
 expect(await page.evaluate(()=>localStorage.length)).toBe(0);
 expect(prior).toBeDefined();
 checkSilent(events);
});

test('direct-file is actual local content for both independent entry points, not the historical QA snapshot',async({page})=>{
 const events=await offlinePage(page);
 await page.goto(startUrl);
 expect(new URL(page.url()).protocol).toBe('file:');
 await expect(page.locator('body')).toContainText('Familien');
 await page.goto(indexUrl);
 expect(new URL(page.url()).protocol).toBe('file:');
 await expect(page.locator('#sectionNav button')).not.toHaveCount(0);
 await expect(page.locator('#v44TaskHub')).toHaveCount(1);
 checkSilent(events);
});
