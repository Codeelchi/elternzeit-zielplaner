import {test,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import {fileURLToPath,pathToFileURL} from 'node:url';
const offline=pathToFileURL(fileURLToPath(new URL('../../index.html',import.meta.url))).href;

test('Monatsplaner ist vom Rechner-Einstieg direkt erreichbar',async({page})=>{
 await page.setViewportSize({width:390,height:850});await page.goto(offline);
 const before=await page.evaluate(()=>JSON.stringify(window.__elternzeitTest.getState()));
 await page.locator('#v42OpenFromStart').click();
 await expect(page.locator('#v42WishTitle')).toBeFocused();
 await expect(page.locator('#v42EntryContext')).toContainText('fiktiven Beispielplan');
 await expect(page.locator('#v42WishGrid [data-v42-wish-year]')).toHaveCount(3);
 expect(await page.evaluate(()=>JSON.stringify(window.__elternzeitTest.getState()))).toBe(before);
});

test('Wünsche werden monatlich verglichen und nur mit Bestätigung übernommen',async({page})=>{
 await page.goto(offline);
 await page.evaluate(()=>{const ui=window.__elternzeitTest;Object.assign(ui.s,{date:'2026-05-28',standardCaseConfirmed:true,zve:90000,childcareStart:19,expenses:1500});ui.changeValue('horizon',24);});
 await page.locator('[data-v38-template="classic"]').click();
 // Beispielwahl initialisiert den Modellzustand; für die Vergleichsprüfung explizit Testwerte setzen.
 await page.evaluate(()=>{const ui=window.__elternzeitTest;Object.assign(ui.s,{date:'2026-05-28',standardCaseConfirmed:true,zve:90000,childcareStart:19,expenses:1500});ui.changeValue('horizon',24);});
 await page.locator('#sectionNav button[data-slide="6"]').click();
 await page.locator('#v42WishMonth').selectOption('3');
 await page.locator('#v42WishFirst').selectOption('home');
 await page.locator('#v42WishSecond').selectOption('full');
 await page.locator('#v42WishCare').selectOption('parents');
 await page.locator('#v42FindMatches').click();
 await expect(page.locator('#v42WishResult')).toContainText('3 von 3 Angaben passend');
 const before=await page.evaluate(()=>JSON.stringify(window.__elternzeitTest.getState()));
 page.once('dialog',dialog=>dialog.dismiss());
 await page.locator('[data-v42-apply-match]').first().click();
 expect(await page.evaluate(()=>JSON.stringify(window.__elternzeitTest.getState()))).toBe(before);
});

for(const width of [320,390,1280])test('Wunschkalender ist bedienbar und ohne Seitenüberlauf bei '+width+' px',async({page})=>{
 await page.setViewportSize({width,height:850});await page.goto(offline);
 await page.locator('[data-v38-template="classic"]').click();await page.locator('#sectionNav button[data-slide="6"]').click();
 await expect(page.locator('#v42WishGrid button')).toHaveCount(36);
 await page.locator('[data-v42-wish-month="12"]').click();
 await expect(page.locator('#v42WishMonth')).toHaveValue('12');
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
 const result=await new AxeBuilder({page}).include('.v42-wishes').withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa']).analyze();
 expect(result.violations.map(v=>v.id)).toEqual([]);
});
