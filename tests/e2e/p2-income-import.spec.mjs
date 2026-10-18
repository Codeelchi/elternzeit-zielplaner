import {test,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';

const offlineUrl='file://'+fileURLToPath(new URL('../../index.html',import.meta.url));
async function wizardWithManualNetto(page){
 await page.goto(offlineUrl);
 await page.locator('[data-v38-template="long18"]').click();
 await page.locator('#v38EditOwn').click();
 await page.locator('#v38Birth').fill('2026-06-15');
 await page.locator('#v38NetF').fill('2400');
 await page.locator('#v38NetM').fill('1800');
 await page.locator('#v38PersonalForm button[type="submit"]').click();
 expect(await page.evaluate(()=>window.__elternzeitTest.getState().egNetFather)).toBe(2400);
 await page.locator('#v38Advanced').click();
 await page.locator('#sectionNav button').filter({hasText:'Grundlagen'}).first().click();
 await page.locator('#egNetFather').fill('1980.25');
 expect(await page.evaluate(()=>window.__elternzeitTest.getState().egNetFather)).toBe(1980.25);
 await page.locator('#sectionNav button').filter({hasText:'Überblick'}).first().click();
 await page.locator('#v38EditOwn').click();
 await page.locator('#v38NetF').fill('2550');
 await expect(page.locator('#v38NettoChoiceWrap')).toBeVisible();
}
test('retained expert Elterngeld-Netto explicitly blocks quickstart update until keep/estimate/clear is selected',async({page})=>{
 await wizardWithManualNetto(page);
 const before=await page.evaluate(()=>window.__elternzeitTest.getState());
 await page.locator('#v38PersonalForm button[type="submit"]').click();
 await expect(page.locator('#v38NettoChoice')).toHaveAttribute('aria-invalid','true');
 await expect(page.locator('#v38NettoChoiceError')).toContainText('Bitte entscheiden');
 expect(await page.evaluate(()=>window.__elternzeitTest.getState())).toEqual(before);
 await page.locator('#v38NettoChoice').selectOption('keep');
 await page.locator('#v38PersonalForm button[type="submit"]').click();
 const after=await page.evaluate(()=>window.__elternzeitTest.getState());
 expect(after.netFather).toBe(2550);
 expect(after.egNetFather).toBe(1980.25);
 await expect(page.locator('#v38NettoChoiceWrap')).toBeHidden();
 await expect(page.locator('#v38Summary')).toContainText('beibehaltener Elterngeld-Netto-Fachwert');
 await page.locator('#v38Summary details.v39-assumptions').evaluate(el=>el.open=true);
 await expect(page.locator('#v38Summary details.v39-assumptions')).toContainText('Herkunft Elterngeld-Netto');
 await expect(page.locator('#v38Summary details.v39-assumptions')).toContainText('Herkunft nicht unabhängig bestätigt');
});
for(const [choice,expected] of [['estimate',2550],['clear','']]){
 test('user-selected '+choice+' on manual Elterngeld-Netto is explicit, not a silent overwrite',async({page})=>{
  await wizardWithManualNetto(page);
  await page.locator('#v38NettoChoice').selectOption(choice);
  await page.locator('#v38PersonalForm button[type="submit"]').click();
  const state=await page.evaluate(()=>window.__elternzeitTest.getState());
  expect(state.netFather).toBe(2550);
  expect(state.egNetFather).toBe(expected);
  const downloadPending=page.waitForEvent('download');
  await page.locator('#btnJson').click();
  const saved=JSON.parse(readFileSync(await (await downloadPending).path()).toString('utf8'));
  expect(saved.schemaVersion).toBe(1);
  expect(saved.data.egNetFather).toBe(expected);
  expect(saved.planningDisclosure.publicReleaseApproved).toBe(false);
  expect(saved.planningDisclosure.legallyVerified).toBe(false);
  expect(saved.data).not.toHaveProperty('nettoChoice');
  await page.locator('#v38Summary details.v39-assumptions').evaluate(el=>el.open=true);
  const text=await page.locator('#v38Summary details.v39-assumptions').innerText();
  if(choice==='estimate')expect(text).toContain('vereinfachte Schätzung aus dem Schnellstart');
  else{
   expect(text).toContain('unbekannt');
   await expect(page.locator('#v38Summary')).toContainText('ausdrücklich unbekannt');
  }
 });
}
test('changing only other short-form assumptions does not demand a specialist-value decision',async({page})=>{
 await wizardWithManualNetto(page);
 await page.locator('#v38NetF').fill('2400');
 await expect(page.locator('#v38NettoChoiceWrap')).toBeHidden();
 await page.locator('#v38Expenses').fill('1700');
 await page.locator('#v38PersonalForm button[type="submit"]').click();
 const state=await page.evaluate(()=>window.__elternzeitTest.getState());
 expect(state.egNetFather).toBe(1980.25);
 expect(state.expenses).toBe(1700);
});

test('import reports malformed JSON and translated financial-key errors while preserving accepted plan',async({page})=>{
 const dialogs=[];
 page.on('dialog',async dialog=>{dialogs.push(dialog.message());await dialog.dismiss();});
 await page.goto(offlineUrl);
 await expect(page.locator('#importNotice')).toContainText('temporäre');
 const original=await page.evaluate(()=>window.__elternzeitTest.getState());
 await page.locator('#importJson').setInputFiles({name:'invalid.json',mimeType:'application/json',buffer:Buffer.from('{"invalid":')});
 await expect.poll(()=>dialogs.length).toBe(1);
 await expect(page.locator('#importFeedback')).toContainText('kein gültiges JSON');
 expect(await page.evaluate(()=>window.__elternzeitTest.getState())).toEqual(original);
 // Create an actual compatible source, then corrupt only its financial input.
 const jsonWait=page.waitForEvent('download');await page.locator('#btnJson').click();
 const downloaded=await jsonWait,exported=JSON.parse(readFileSync(await downloaded.path()).toString('utf8'));
 const malicious=structuredClone(exported);malicious.data.netFather=-1;
 await page.locator('#importJson').setInputFiles({name:'invalid-financial.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(malicious))});
 await expect.poll(()=>dialogs.length).toBe(2);
 expect(dialogs[1]).toContain('Auszahlungs-Netto Elternteil 1');
 expect(dialogs[1]).not.toContain('Ungültige Zahl: netFather');
 expect(await page.evaluate(()=>window.__elternzeitTest.getState())).toEqual(original);
 await page.locator('#importJson').setInputFiles({name:'oversized.json',mimeType:'application/json',buffer:Buffer.alloc(1000001,0x20)});
 await expect.poll(()=>dialogs.length).toBe(3);
 await expect(page.locator('#importFeedback')).toContainText('größer als 1 MB');
 expect(await page.evaluate(()=>window.__elternzeitTest.getState())).toEqual(original);
 await page.locator('#importJson').setInputFiles({name:'valid.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(exported))});
 await expect(page.locator('#importFeedback')).toContainText('Import erfolgreich');
 await expect(page.locator('#importFeedback')).toContainText('Temporäre Zahlungs-');
 expect(await page.evaluate(()=>window.__elternzeitTest.getState().storageConsent)).toBe(false);
 expect(await page.evaluate(()=>localStorage.length)).toBe(0);
});

test('after JSON import, changing wages requires an explicit decision for imported Elterngeld-Netto',async({page})=>{
 const dialogs=[];
 page.on('dialog',async d=>{dialogs.push(d.message());await d.dismiss();});
 await page.goto(offlineUrl);
 const pending=page.waitForEvent('download');await page.locator('#btnJson').click();
 const bytes=readFileSync(await (await pending).path());
 await page.locator('#importJson').setInputFiles({name:'fictional.json',mimeType:'application/json',buffer:bytes});
 await expect(page.locator('#importFeedback')).toContainText('Import erfolgreich');
 await page.locator('#v38EditOwn').click();
 await page.locator('#v38NetF').fill('2800');
 await expect(page.locator('#v38NettoChoiceWrap')).toBeVisible();
 const old=await page.evaluate(()=>window.__elternzeitTest.getState());
 await page.locator('#v38PersonalForm button[type="submit"]').click();
 await expect(page.locator('#v38NettoChoice')).toHaveAttribute('aria-invalid','true');
 expect(await page.evaluate(()=>window.__elternzeitTest.getState())).toEqual(old);
 expect(dialogs).toEqual([]);
});

test('switching the monthly template preserves an unsaved specialist choice and accepted wages',async({page})=>{
 await wizardWithManualNetto(page);
 await page.locator('#v38PersonalForm button[type="submit"]').click();
 await expect(page.locator('#v38NettoChoice')).toHaveAttribute('aria-invalid','true');
 await page.locator('[data-v38-template="classic"]').click();
 // Switching a schedule in personal mode is NOT a request to discard wage edits.
 await expect(page.locator('#v38NettoChoiceWrap')).toBeVisible();
 const state=await page.evaluate(()=>window.__elternzeitTest.getState());
 expect(state.netFather).toBe(2400);
 expect(state.egNetFather).toBe(1980.25);
 await expect(page.locator('#v38Summary')).toHaveAttribute('data-stale','true');
 await page.locator('#v38NettoChoice').selectOption('keep');
 await page.locator('#v38PersonalForm button[type="submit"]').click();
 expect(await page.evaluate(()=>window.__elternzeitTest.getState().egNetFather)).toBe(1980.25);
});
test('choosing another fictional example discards an unsubmitted example form',async({page})=>{
 await page.goto(offlineUrl);
 await page.locator('[data-v38-template="long18"]').click();
 await page.locator('#v38EditOwn').click();
 await page.locator('#v38NetF').fill('3400');
 await expect(page.locator('#v38Summary')).toHaveAttribute('data-stale','true');
 await page.locator('[data-v38-template="classic"]').click();
 await expect(page.locator('#v38NettoChoiceWrap')).toBeHidden();
 await expect(page.locator('#v38Personal')).not.toHaveAttribute('open');
 await expect(page.locator('#v38NetF')).toHaveValue('');
 await expect(page.locator('#v38Summary')).not.toHaveAttribute('data-stale','true');
 expect(await page.evaluate(()=>window.__elternzeitTest.getState().storageConsent)).toBe(false);
});

for(const width of [320,390]){
 test('accessible manual netto decision at '+width+'px keeps focus and controls within the viewport',async({page})=>{
  await page.setViewportSize({width,height:844});
  await wizardWithManualNetto(page);
  await page.locator('#v38PersonalForm button[type="submit"]').click();
  await expect(page.locator('#v38NettoChoice')).toBeFocused();
  await expect(page.locator('#v38NettoChoice')).toHaveAttribute('aria-describedby','v38NettoChoiceExplanation v38NettoChoiceError');
  const bounds=await page.locator('#v38NettoChoiceWrap').boundingBox();
  expect(bounds).not.toBeNull();
  expect(bounds.width).toBeLessThanOrEqual(width+1);
  const violations=await new AxeBuilder({page}).include('#v38NettoChoiceWrap')
   .withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa']).analyze();
  expect(violations.violations.map(v=>v.id)).toEqual([]);
 });
}
