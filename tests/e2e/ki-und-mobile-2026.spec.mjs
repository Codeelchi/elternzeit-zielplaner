import {test,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import {fileURLToPath,pathToFileURL} from 'node:url';

const offline=pathToFileURL(fileURLToPath(new URL('../../index.html',import.meta.url))).href;

test('KI-Vorschlag wird kontrolliert übernommen und erst danach berechnet',async({page})=>{
 await page.goto(offline);
 await page.locator('#kiAssistant summary').click();
 await page.locator('#kiInput').fill(JSON.stringify({format:'elternzeit-ki-einstieg-v1',geburt:'2026-05-20',netto1:0,netto2:2500,betreuung:18,ausgaben:null}));
 const before=await page.evaluate(()=>JSON.stringify(window.__elternzeitTest.getState()));
 await page.locator('#kiPreview').click();
 await expect(page.locator('#kiStatus')).toContainText('Netto Elternteil 1: 0');
 await expect(page.locator('#v38Birth')).toHaveValue('');
 await page.locator('#kiApply').click();
 await expect(page.locator('#v38Birth')).toHaveValue('2026-05-20');
 await expect(page.locator('#v38Expenses')).toHaveValue('');
 expect(await page.evaluate(()=>JSON.stringify(window.__elternzeitTest.getState()))).toBe(before);
 await page.locator('#v38PersonalForm button[type=submit]').click();
 await expect(page.locator('#v38Summary')).toContainText('2026');
});

test('mobile Monatskarte und Variantenkarten sind ohne horizontales Scrollen bedienbar',async({page})=>{
 await page.setViewportSize({width:390,height:850});
 await page.goto(offline);await page.locator('[data-v38-template="classic"]').click();
 await page.locator('#sectionNav button[data-slide="6"]').click();
 await expect(page.locator('#v42MonthPosition')).toContainText('3 von 24');
 await page.locator('#v42NextMonth').click();
 await expect(page.locator('#v42MonthDetail h4')).toContainText('LM 4');
 await page.locator('#v42Save').click();
 await expect(page.locator('.v42-compare-card')).toHaveCount(2);
 await expect(page.locator('.v42-compare-card').first()).toBeVisible();
 await expect(page.locator('.v42-compare-scroll')).toBeHidden();
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
 const a11y=await new AxeBuilder({page}).include('#v42FamilyPlanner').withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa']).analyze();
 expect(a11y.violations.map(x=>x.id)).toEqual([]);
});
