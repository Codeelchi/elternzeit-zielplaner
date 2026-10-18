import {test,expect} from '@playwright/test';
import {buildPagesPreview} from '../../scripts/pages-preview-build.mjs';
import path from 'node:path';

const preview=buildPagesPreview();
const index='file://'+path.join(preview.out,'index.html');
const start='file://'+path.join(preview.out,'start.html');

test('public preview opens with a supported fictional 2026 example, while 2027 remains unsupported',async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(index);
 expect(await page.evaluate(()=>window.__elternzeitTest.getState().date)).toBe('2026-05-28');
 await expect(page.locator('#public-preview-notice')).toContainText('NUR FIKTIVE DATEN');
 await page.locator('#v38Advanced').click();
 await page.locator('#sectionNav button').filter({hasText:'Grundlagen'}).first().click();
 await page.locator('#date').fill('2027-05-28');
 await expect(page.locator('#checkValidDesc')).toContainText('NICHT_UNTERSTUETZT');
 expect(await page.evaluate(()=>window.__elternzeitTest.getState().date)).toBe('2027-05-28');
 expect(errors).toEqual([]);
});

test('all visible public-preview entry points and dynamic messages request fictional data only',async({page})=>{
 await page.goto(index);
 await expect(page.locator('#v38QuickStart')).not.toContainText('eigene Angaben sind erst im zweiten Schritt nötig');
 await page.locator('#v38EditOwn').click();
 await expect(page.locator('#v38PersonalForm')).toContainText('fiktiven Testwerten berechnen');
 await page.locator('#v311GoalJump').click();
 await expect(page.locator('#v311Goals')).toContainText('ausschließlich frei erfundene Zahlen');
 await page.locator('#v38Advanced').click();
 await page.locator('#sectionNav button').filter({hasText:'Grundlagen'}).first().click();
 await expect(page.locator('#incomeEntryMode')).not.toContainText('Bescheid übernehmen');
 await expect(page.locator('#incomeEntryMode')).toContainText('keine Bescheide');
 await expect(page.locator('#parentNameFather').locator('xpath=preceding-sibling::label')).toContainText('keine echten Namen');
 await expect(page.locator('#slide-2')).not.toContainText('ersetzt sie durch eure eigenen Werte');
 await page.goto(start);
 await expect(page.locator('body')).not.toContainText('Sammelt eure verlässlichen Einkommensangaben');
 await expect(page.locator('body')).toContainText('keine echten Unterlagen verwenden');
 await expect(page.locator('body')).toContainText('fiktiven Angaben');
});

test('negative income is rejected with associated accessible error and unchanged accepted state',async({page})=>{
 await page.goto(index);
 await page.locator('#v38Advanced').click();
 await page.locator('#sectionNav button').filter({hasText:'Grundlagen'}).first().click();
 const baseline=await page.evaluate(()=>window.__elternzeitTest.getState().netFather);
 await page.locator('#netFather').fill('-1');
 await expect(page.locator('#netFather')).toHaveValue('-1');
 await expect(page.locator('#netFather')).toHaveAttribute('aria-invalid','true');
 await expect(page.locator('#specialist-error-netFather')).toContainText('Nicht übernommen');
 await expect(page.locator('#v38Summary')).toHaveAttribute('data-stale','true');
 expect(await page.evaluate(()=>window.__elternzeitTest.getState().netFather)).toBe(baseline);
 await page.locator('#netFather').fill('999999');
 expect(await page.evaluate(()=>window.__elternzeitTest.getState().netFather)).toBe(baseline);
 await page.locator('#netMother').fill('2300');
 await expect(page.locator('#netFather')).toHaveValue('999999');
 await expect(page.locator('#netFather')).toHaveAttribute('aria-invalid','true');
 await page.locator('#netFather').fill('0');
 expect(await page.evaluate(()=>window.__elternzeitTest.getState().netFather)).toBe(0);
 await expect(page.locator('#netFather')).not.toHaveAttribute('aria-invalid','true');
 await expect(page.locator('#v38Summary')).not.toHaveAttribute('data-stale','true');
 await page.locator('#netFather').fill('');
 expect(await page.evaluate(()=>window.__elternzeitTest.getState().netFather)).toBe('');
 await page.locator('#netFather').fill('2400.25');
 expect(await page.evaluate(()=>window.__elternzeitTest.getState().netFather)).toBe(2400.25);
 expect(await page.locator('#netFather').evaluate(el=>el.validity.valid)).toBe(true);
});

test('weekly-hours boundary preserves last accepted value: 40 allowed, 41 or fraction rejected, 33 gets legal warning not input error',async({page})=>{
 await page.goto(index);
 await page.locator('#v38Advanced').click();
 await page.locator('#sectionNav button').filter({hasText:'Grundlagen'}).first().click();
 await page.locator('#hoursFather').fill('40');
 expect(await page.evaluate(()=>window.__elternzeitTest.getState().hoursFather)).toBe(40);
 await page.locator('#hoursFather').fill('41');
 await expect(page.locator('#hoursFather')).toHaveAttribute('aria-invalid','true');
 await expect(page.locator('#specialist-error-hoursFather')).toContainText('0 bis 40 Arbeitsstunden');
 expect(await page.evaluate(()=>window.__elternzeitTest.getState().hoursFather)).toBe(40);
 await page.locator('#hoursFather').fill('30.5');
 expect(await page.evaluate(()=>window.__elternzeitTest.getState().hoursFather)).toBe(40);
 await page.locator('#hoursFather').fill('33');
 expect(await page.evaluate(()=>window.__elternzeitTest.getState().hoursFather)).toBe(33);
 await expect(page.locator('#hoursFather')).not.toHaveAttribute('aria-invalid','true');
});

test('an unsubmitted or invalid Quickstart draft keeps previous results marked as outdated and preserves state',async({page})=>{
 await page.goto(index);
 await page.locator('[data-v38-template="long18"]').click();
 const summaryBefore=await page.locator('#v38Summary h3').innerText();
 const originalDate=await page.evaluate(()=>window.__elternzeitTest.getState().date);
 await page.locator('#v38EditOwn').click();
 await page.locator('#v38Birth').fill('2026-06-15');
 await expect(page.locator('#v38OutdatedResult')).toBeVisible();
 await expect(page.locator('#v38Summary')).toHaveAttribute('data-stale','true');
 expect(await page.evaluate(()=>window.__elternzeitTest.getState().date)).toBe(originalDate);
 await page.locator('#v38Birth').fill('');
 await page.locator('#v38PersonalForm button[type="submit"]').click();
 await expect(page.locator('#v38Birth')).toHaveAttribute('aria-invalid','true');
 await expect(page.locator('#v38OutdatedResult')).toContainText('letzten gültigen Entwurf');
 await expect(page.locator('#v38Summary h3')).toHaveText(summaryBefore);
 await page.locator('#v38Birth').fill('2026-06-15');
 await page.locator('#v38NetF').fill('2400');
 await page.locator('#v38NetM').fill('1800');
 await page.locator('#v38PersonalForm button[type="submit"]').click();
 await expect(page.locator('#v38OutdatedResult')).toBeHidden();
 await expect(page.locator('#v38Summary')).not.toHaveAttribute('data-stale','true');
 expect(await page.evaluate(()=>window.__elternzeitTest.getState().date)).toBe('2026-06-15');
});

test('switching fictional templates clears stale quickstart draft but retains separate rejected specialist input',async({page})=>{
 await page.goto(index);
 await page.locator('#v38EditOwn').click();
 await page.locator('#v38Birth').fill('2026-06-15');
 await expect(page.locator('#v38Summary')).toHaveAttribute('data-stale','true');
 await page.locator('[data-v38-template="classic"]').click();
 await expect(page.locator('#v38OutdatedResult')).toBeHidden();
 await page.locator('#v38Advanced').click();
 await page.locator('#sectionNav button').filter({hasText:'Grundlagen'}).first().click();
 await page.locator('#hoursMother').fill('41');
 await expect(page.locator('#specialist-error-hoursMother')).toBeVisible();
 await expect(page.locator('#v38Summary')).toHaveAttribute('data-stale','true');
 await page.locator('#netFather').fill('2500');
 await expect(page.locator('#v38Summary')).toHaveAttribute('data-stale','true');
 await expect(page.locator('#hoursMother')).toHaveAttribute('aria-invalid','true');
 await page.locator('#hoursMother').fill('32');
 await expect(page.locator('#v38Summary')).not.toHaveAttribute('data-stale','true');
});

test('negative advanced income and zvE values are not silently accepted',async({page})=>{
 await page.goto(index);
 await page.locator('#v38Advanced').click();
 await page.locator('#sectionNav button').filter({hasText:'Grundlagen'}).first().click();
 const previous=await page.evaluate(()=>({
  egPtNetFather:window.__elternzeitTest.getState().egPtNetFather,
  zve:window.__elternzeitTest.getState().zve
 }));
 await page.locator('#egPtNetFather').fill('-200');
 await expect(page.locator('#egPtNetFather')).toHaveAttribute('aria-invalid','true');
 expect(await page.evaluate(()=>window.__elternzeitTest.getState().egPtNetFather)).toEqual(previous.egPtNetFather);
 await page.locator('#egPtNetFather').fill('1200');
 await expect(page.locator('#egPtNetFather')).not.toHaveAttribute('aria-invalid','true');
 await page.locator('#sectionNav button').filter({hasText:'Leistungen vor Ort'}).first().click();
 await page.locator('#zve').fill('-1');
 await expect(page.locator('#zve')).toHaveAttribute('aria-invalid','true');
 expect(await page.evaluate(()=>window.__elternzeitTest.getState().zve)).toBe(previous.zve);
 await page.locator('#zve').fill('0');
 expect(await page.evaluate(()=>window.__elternzeitTest.getState().zve)).toBe('0');
});

test('monthly hour edits reject 41 without mutating schedule or silently replacing with 40',async({page})=>{
 await page.goto(index);
 await page.locator('#v38Advanced').click();
 await page.locator('#sectionNav button').filter({hasText:'Zeitplan'}).first().click();
 await page.locator('#fatherStatus').selectOption('R');
 await expect(page.locator('#monthHoursFather')).toBeEnabled();
 const before=await page.evaluate(()=>window.__elternzeitTest.getState().schedule[2].hf);
 await page.locator('#monthHoursFather').fill('41');
 await expect(page.locator('#monthHoursFather')).toHaveAttribute('aria-invalid','true');
 expect(await page.evaluate(()=>window.__elternzeitTest.getState().schedule[2].hf)).toBe(before);
 await page.locator('#monthHoursFather').fill('32');
 await expect(page.locator('#monthHoursFather')).not.toHaveAttribute('aria-invalid','true');
 expect(await page.evaluate(()=>window.__elternzeitTest.getState().schedule[2].hf)).toBe(32);
});

test('invalid expert birth date preserves last approved timeline and shows an accessible error',async({page})=>{
 await page.goto(index);
 await page.locator('#v38Advanced').click();
 await page.locator('#sectionNav button').filter({hasText:'Grundlagen'}).first().click();
 const original=await page.evaluate(()=>window.__elternzeitTest.getState().date);
 await page.locator('#date').fill('');
 await expect(page.locator('#date')).toHaveAttribute('aria-invalid','true');
 await expect(page.locator('#specialist-error-date')).toContainText('gültiges Geburtsdatum');
 expect(await page.evaluate(()=>window.__elternzeitTest.getState().date)).toBe(original);
 await page.locator('#date').fill('2026-06-15');
 expect(await page.evaluate(()=>window.__elternzeitTest.getState().date)).toBe('2026-06-15');
 await expect(page.locator('#date')).not.toHaveAttribute('aria-invalid','true');
});

test('reset discards rejected draft fields and the stale-summary warning',async({page})=>{
 page.on('dialog',dialog=>dialog.accept());
 await page.goto(index);
 await page.locator('#v38Advanced').click();
 await page.locator('#sectionNav button').filter({hasText:'Grundlagen'}).first().click();
 await page.locator('#netMother').fill('-1');
 await expect(page.locator('#netMother')).toHaveAttribute('aria-invalid','true');
 await page.locator('#btnReset').click();
 await expect(page.locator('#netMother')).not.toHaveAttribute('aria-invalid','true');
 await expect(page.locator('#specialist-error-netMother')).toHaveCount(0);
 await expect(page.locator('#v38Summary')).not.toHaveAttribute('data-stale','true');
});
