import {test,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';

const offlineUrl='file://'+fileURLToPath(new URL('../../index.html',import.meta.url));
const importParagraphs=[
 'Ein kompatibler JSON-Export stellt Eingaben, den Lebensmonatsplan und enthaltene manuelle Bankbuchungen wieder her und ersetzt den geöffneten Entwurf. Nicht übernommen werden unter anderem flüchtige Kita-/Eingewöhnungsvarianten, Zahlungszeitpunkt- und Liquiditätstests, temporäre Risikoannahmen, Suchergebnisse und Lernaufgaben. Vorher benötigte Varianten getrennt notieren; der Import stellt keine heruntergeladenen Dateien wieder her.',
 'Der Import löscht die optionale Browserkopie, sofern der Browser dies erlaubt. Die Speicherzustimmung wird nie automatisch übernommen. Nur eigene vertrauenswürdige, lokal gespeicherte JSON-Testdateien importieren. Maximal 1 MB.'
];
async function open(page,width=1265){
 await page.setViewportSize({width,height:844});
 await page.goto(offlineUrl);
}
async function exportedJson(page){
 const pending=page.waitForEvent('download');
 await page.locator('#btnJson').click();
 return JSON.parse(readFileSync(await (await pending).path()).toString('utf8'));
}

test('unchanged import warning is permanently visible before file selection, including on mobile',async({page})=>{
 for(const width of [320,390,768,1265]){
  await open(page,width);
  const notice=page.locator('#importNotice');
  await expect(notice).toBeVisible();
  await expect(notice.locator('details')).toHaveCount(0);
  const paragraphs=notice.locator('p:not(#importFeedback)');
  await expect(paragraphs).toHaveCount(2);
  for(let i=0;i<importParagraphs.length;i++){
   await expect(paragraphs.nth(i)).toBeVisible();
   await expect(paragraphs.nth(i)).toHaveText(importParagraphs[i]);
   expect(await paragraphs.nth(i).evaluate(el=>['label[for="importJson"]','#importJson'].every(selector=>!!(el.compareDocumentPosition(document.querySelector(selector)) & Node.DOCUMENT_POSITION_FOLLOWING)))).toBe(true);
  }
  await expect(notice.locator('label[for="importJson"]')).toBeVisible();
  await expect(notice.locator('#importJson')).toBeVisible();
  await expect(page.locator('#topActions #importJson')).toHaveCount(0);
  await expect(notice.locator('#importFeedback')).toHaveAttribute('aria-live','polite');
 }
});

test('invalid synthetic JSON preserves state; compatible JSON replaces it without a new confirmation and deletes browser copy',async({page})=>{
 const dialogs=[];
 page.on('dialog',async dialog=>{dialogs.push({type:dialog.type(),message:dialog.message()});await dialog.dismiss();});
 await open(page);
 const baseline=await page.evaluate(()=>window.__elternzeitTest.getState());
 await page.locator('#importJson').setInputFiles({name:'malformed.json',mimeType:'application/json',buffer:Buffer.from('{"invalid":')});
 await expect(page.locator('#importFeedback')).toContainText('kein gültiges JSON');
 expect(await page.evaluate(()=>window.__elternzeitTest.getState())).toEqual(baseline);
 const exported=await exportedJson(page);
 const invalid=structuredClone(exported);invalid.data.netFather=-1;
 await page.locator('#importJson').setInputFiles({name:'invalid-financial.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(invalid))});
 await expect.poll(()=>dialogs.length).toBe(2);
 expect(dialogs[1].message).toContain('Auszahlungs-Netto Elternteil 1');
 expect(await page.evaluate(()=>window.__elternzeitTest.getState())).toEqual(baseline);
 await page.locator('#localSave').check();
 await expect.poll(()=>page.evaluate(()=>localStorage.getItem('elternzeit-familienplan-v3')!==null)).toBe(true);
 const valid=structuredClone(exported);valid.data.netFather=2711;valid.data.expenses=987;
 await page.locator('#importJson').setInputFiles({name:'valid-synthetic-export.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(valid))});
 await expect(page.locator('#importFeedback')).toContainText('Import erfolgreich');
 const imported=await page.evaluate(()=>window.__elternzeitTest.getState());
 expect(imported.netFather).toBe(2711);expect(imported.expenses).toBe(987);
 expect(imported.storageConsent).toBe(false);
 expect(await page.evaluate(()=>localStorage.length)).toBe(0);
 expect(dialogs).toHaveLength(2);expect(dialogs.every(d=>d.type==='alert')).toBe(true);
});

test('entry hierarchy retains five functional templates, build anchors and decorative SVG semantics',async({page})=>{
 await open(page);
 await expect(page.locator('#v38QuickStart .v38-entry-grid')).toHaveCount(1);
 await expect(page.locator('#v38ExampleJump')).toHaveAttribute('href','#v38Templates');
 await expect(page.locator('#v38Templates')).toHaveAttribute('tabindex','-1');
 await expect(page.locator('#v38Personal > summary')).toHaveText('Eigene Werte eingeben – nur fünf Angaben');
 await expect(page.locator('#v38EditOwn')).toHaveCount(1);
 await expect(page.locator('.v38-entry-actions #v38EditOwn')).toHaveCount(1);
 for(const selector of ['.v38-selection-art','.v38-form-art']){
  await expect(page.locator(selector)).toHaveAttribute('aria-hidden','true');
  await expect(page.locator(selector)).toHaveAttribute('focusable','false');
 }
 const templates=page.locator('.v38-template');
 await expect(templates).toHaveCount(5);
 await expect(page.locator('.v38-template[aria-pressed="true"]')).toHaveCount(0);
 for(let i=0;i<5;i++){
  await expect(templates.nth(i)).toBeEnabled();
  await templates.nth(i).click();
  await expect(templates.nth(i)).toHaveAttribute('aria-pressed','true');
  await expect(page.locator('.v38-template[aria-pressed="true"]')).toHaveCount(1);
  expect(await templates.nth(i).evaluate(el=>getComputedStyle(el,'::after').content)).toContain('Ausgewählt');
 }
 await expect(page.locator('.v38-advice a')).toHaveAttribute('href','start.html#beratung');
 await expect(page.locator('.v38-advice a')).toHaveAttribute('rel','noopener noreferrer');
});

test('native entry link, template and existing form handler work by keyboard',async({page})=>{
 await open(page);
 await page.locator('#v38ExampleJump').focus();
 await page.keyboard.press('Enter');
 await expect(page.locator('#v38Templates')).toBeFocused();
 await page.keyboard.press('Tab');
 await expect(page.locator('.v38-template').first()).toBeFocused();
 await page.keyboard.press('Space');
 await expect(page.locator('.v38-template').first()).toHaveAttribute('aria-pressed','true');
 await page.locator('#v38EditOwn').focus();
 await page.keyboard.press('Enter');
 await expect(page.locator('#v38PersonalForm')).toBeVisible();
 await expect(page.locator('#v38Birth')).toBeFocused();
});

for(const [width,columns] of [[320,1],[390,1],[768,3],[1265,5]]){
 test(`entry reflows at ${width}px with closed and open details`,async({page})=>{
  await open(page,width);
  for(const openDetails of [false,true]){
   await page.locator('#v38QuickStart details').evaluateAll((els,value)=>els.forEach(el=>el.open=value),openDetails);
   expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
   expect(await page.locator('#v38QuickStart').evaluate(el=>el.scrollWidth<=el.clientWidth)).toBe(true);
  }
  expect(await page.locator('#v38Templates').evaluate(el=>getComputedStyle(el).gridTemplateColumns.split(' ').length)).toBe(columns);
  const widths=await page.locator('.v38-template').evaluateAll(els=>els.map(el=>el.getBoundingClientRect().width));
  expect(Math.max(...widths)-Math.min(...widths)).toBeLessThan(1);
  for(const selector of ['.v38-selection-art','.v38-form-art']){
   if(width<=680)await expect(page.locator(selector)).toBeHidden();
   else await expect(page.locator(selector)).toBeVisible();
  }
 });
}
test('entry and permanent import notice pass automated axe checks',async({page})=>{
 await open(page);
 const result=await new AxeBuilder({page}).include('#v38QuickStart').include('#importNotice').withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa']).analyze();
 expect(result.violations.map(v=>v.id)).toEqual([]);
});
test('200 percent root text enlargement increases entry type and retains reflow',async({page})=>{
 for(const width of [320,390]){
  await open(page,width);
  const intro=page.locator('.v38-intro>p');
  const before=await intro.evaluate(el=>parseFloat(getComputedStyle(el).fontSize));
  await page.addStyleTag({content:'html { font-size:200% !important; }'});
  expect(await intro.evaluate(el=>parseFloat(getComputedStyle(el).fontSize))).toBe(before*2);
  await page.locator('#v38Personal').evaluate(el=>el.open=true);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
  expect(await page.locator('#v38QuickStart').evaluate(el=>el.scrollWidth<=el.clientWidth)).toBe(true);
 }
});

test('template action baselines align per responsive row, also after selection',async({page})=>{
 for(const width of [768,1265]){
  await open(page,width);
  for(const selected of [false,true]){
   if(selected)await page.locator('.v38-template').first().click();
   const rows=await page.locator('.v38-template').evaluateAll(els=>els.map(el=>({top:el.getBoundingClientRect().top,action:el.querySelector('small').getBoundingClientRect().top})));
   for(const row of rows){
    const peers=rows.filter(other=>Math.abs(other.top-row.top)<1);
    expect(Math.max(...peers.map(x=>x.action))-Math.min(...peers.map(x=>x.action))).toBeLessThan(1);
   }
  }
 }
});

test('Pages sticky warning does not cover entry, open-form or file-input keyboard focus',async({page})=>{
 const {buildPagesPreview}=await import('../../scripts/pages-preview-build.mjs');
 const {out}=buildPagesPreview();
 for(const width of [320,390,768,1265]){
  await page.setViewportSize({width,height:844});
  await page.goto('file://'+out+'/index.html');
  await page.locator('#v38EditOwn').focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('#v38Birth')).toBeFocused();
  for(const selector of ['#v38ExampleJump','#v38EditOwn','#v38Birth','#v38NetF','#v38PersonalForm button[type="submit"]','#importJson']){
   await page.locator(selector).focus();
   await expect.poll(()=>page.locator(selector).evaluate(el=>{
    const r=el.getBoundingClientRect(),b=document.querySelector('#public-preview-notice').getBoundingClientRect();
    return r.top>=b.bottom+3 && r.bottom<=innerHeight-3;
   })).toBe(true);
   expect(await page.locator(selector).evaluate(el=>getComputedStyle(el).outlineStyle)).not.toBe('none');
  }
 }
});
