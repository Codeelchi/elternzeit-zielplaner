import {test,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import {fileURLToPath} from 'node:url';
const offline='file://'+fileURLToPath(new URL('../../index.html',import.meta.url));

test('six-step short route has sequential numbers and next/previous skip expert-only slides',async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(offline);
 const buttons=page.locator('#sectionNav button:not([hidden])');
 await expect(buttons).toHaveCount(6);
 expect((await buttons.allTextContents()).map(s=>s.trim())).toEqual([
  '01 Überblick','02 Grundlagen','03 Modelle','04 Cashflow','05 Plan prüfen','06 Zielsuche'
 ]);
 await page.locator('[data-v38-template=classic]').click();
 await expect(page.locator('.footer-nav')).toBeVisible();
 await expect(page.locator('#counter')).toHaveText('1 / 6');
 for(let i=0;i<3;i++)await page.locator('#next').click();
 await expect(page.locator('#slide-5')).toHaveClass(/active/);
 await expect(page.locator('#counter')).toHaveText('4 / 6');
 await expect(page.locator('#sectionNav button[aria-current=step]')).toHaveAttribute('data-slide','6');
 await page.locator('#previous').click();
 await expect(page.locator('#slide-3')).toHaveClass(/active/);
 await page.locator('#v41ModeToggle').click();
 await expect(page.locator('#sectionNav button:not([hidden])')).toHaveCount(16);
 await expect(page.locator('#counter')).toHaveText('3 / 16');
 await page.locator('#v41ModeToggle').click();
 await expect(page.locator('#counter')).toHaveText('3 / 6');
 expect(errors).toEqual([]);
});

test('future-year template exposes four non-certifying decisions and leaves spendable cash unknown',async({page})=>{
 await page.goto(offline);
 const before=await page.evaluate(()=>window.__elternzeitTest.getState());
 await page.locator('[data-v38-template=long18]').click();
 const cards=page.locator('[data-v41-metric]');
 await expect(cards).toHaveCount(4);
 await expect(page.locator('[data-v41-metric=cash] strong')).toHaveText('Nicht berechenbar');
 await expect(page.locator('[data-v41-metric=legal]')).toContainText('Rechtsstand 2027 offen');
 await expect(page.locator('.v41-major-notice')).toContainText('keine bestätigten Ansprüche');
 await expect(page.locator('.v41-quality')).toContainText('Fiktive Vorlage');
 await expect(page.locator('.v41-quality')).toContainText('Nicht angegeben');
 await expect(page.locator('.v41-review')).not.toHaveAttribute('open','');
 await expect(page.locator('.v41-review')).toContainText('NICHT_UNTERSTUETZT');
 expect(await page.evaluate(()=>window.__elternzeitTest.getState().storageConsent)).toBe(false);
 expect(before.storageConsent).toBe(false);
 await page.evaluate(()=>window.__elternzeitTest.changeValue('expenses',1000));
 await expect(page.locator('[data-v41-metric=cash] strong')).not.toHaveText('Nicht berechenbar');
 await expect(page.locator('.v41-totals')).toContainText('Rest nach Haushalts- und Kita-Kosten');
 await page.evaluate(()=>window.__elternzeitTest.changeValue('expenses',''));
 await expect(page.locator('[data-v41-metric=cash] strong')).toHaveText('Nicht berechenbar');
});

for(const width of [320,390,768,1265]){
 test('result dashboard reflows without page overflow at '+width+'px and has no basic a11y violations',async({page})=>{
  await page.setViewportSize({width,height:850});
  await page.goto(offline);
  await page.locator('[data-v38-template=classic]').click();
  await expect(page.locator('.v41-overview')).toBeVisible();
  const sizes=await page.evaluate(()=>({scrollWidth:document.documentElement.scrollWidth,innerWidth:window.innerWidth}));
  expect(sizes.scrollWidth).toBeLessThanOrEqual(sizes.innerWidth+1);
  for(const card of await page.locator('[data-v41-metric]').all())await expect(card).toBeVisible();
  const result=await new AxeBuilder({page}).include('#v38Summary').withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa']).analyze();
  expect(result.violations.map(v=>v.id)).toEqual([]);
 });
}

test('provenance follows manual source changes but never claims an official validation',async({page})=>{
 await page.goto(offline);
 await page.locator('[data-v38-template=classic]').click();
 await page.evaluate(()=>{
  const field=document.querySelector('select[data-profile="incomeEntryMode"]');
  field.value='official';field.dispatchEvent(new Event('change',{bubbles:true}));
 });
 await expect(page.locator('.v41-quality')).toContainText('Als übernommen angegeben, nicht verifiziert');
 await expect(page.locator('#v38Summary h3')).toContainText('Persönliche Näherung');
 await expect(page.locator('.v41-quality')).not.toContainText('Fiktive Vorlage');
});

test('simple decision cards remain readable with 200 percent root text size on mobile',async({page})=>{
 await page.setViewportSize({width:390,height:850});
 await page.goto(offline);
 await page.locator('[data-v38-template=long18]').click();
 await page.evaluate(()=>{document.documentElement.style.fontSize='200%';});
 await expect(page.locator('.v41-overview')).toBeVisible();
 await expect(page.locator('#v41ModeToggle')).toBeVisible();
 const metrics=await page.evaluate(()=>{
  const summary=document.querySelector('#v38Summary');
  const cards=[...document.querySelectorAll('[data-v41-metric]')];
  return {viewport:window.innerWidth,pageWidth:document.documentElement.scrollWidth,
   cardWidth:Math.max(...cards.map(x=>x.getBoundingClientRect().width)),
   cardFont:parseFloat(getComputedStyle(cards[0].querySelector('strong')).fontSize),
   summaryVisible:summary.getBoundingClientRect().width>0};
 });
 expect(metrics.pageWidth).toBeLessThanOrEqual(metrics.viewport+1);
 expect(metrics.cardWidth).toBeLessThanOrEqual(metrics.viewport);
 expect(metrics.cardFont).toBeGreaterThan(24);
 expect(metrics.summaryVisible).toBe(true);
});
