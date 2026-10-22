import {test,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import {fileURLToPath} from 'node:url';
const offline='file://'+fileURLToPath(new URL('../../index.html',import.meta.url));
const cash=async page=>{
 // In the mobile pristine state the navigation is intentionally hidden; the first
 // user action is selecting an existing example before viewing its cashflow.
 await page.locator('[data-v38-template="classic"]').click();
 await page.locator('#sectionNav button[data-slide="6"]').click();
 await expect(page.locator('#v42FamilyPlanner')).toBeVisible();
};

test('model timeline is keyboard accessible, reuses active monthly figures and preserves focus',async({page})=>{
 const errors=[];page.on('pageerror',err=>errors.push(String(err)));
 await page.goto(offline);
 await cash(page);
 await expect(page.locator('#v42Timeline button[data-v42-month]')).toHaveCount(24);
 await expect(page.locator('#v42MonthDetail h4')).toContainText('LM 3');
 await expect(page.locator('#v42MonthDetail')).toContainText('Nicht berechenbar');
 const liveRows=await page.evaluate(()=>window.__elternzeitTest.evaluate().rows);
 const expected=liveRows[2].income.toLocaleString('de-DE',{style:'currency',currency:'EUR'});
 await expect(page.locator('#v42MonthDetail')).toContainText(expected);
 const month=page.locator('[data-v42-month="3"]');
 await month.focus();await page.keyboard.press('ArrowRight');
 await expect(page.locator('#v42MonthDetail h4')).toContainText('LM 4');
 await expect(page.locator('[data-v42-month="4"]')).toHaveAttribute('aria-pressed','true');
 await expect(page.locator('[data-v42-month="4"]')).toBeFocused();
 await page.keyboard.press('Home');await expect(page.locator('#v42MonthDetail h4')).toContainText('LM 1');
 await page.keyboard.press('End');await expect(page.locator('#v42MonthDetail h4')).toContainText('LM 24');
 expect(errors).toEqual([]);
});
test('three session-only comparisons retain the prior scenario without mutating active plan',async({page})=>{
 await page.goto(offline);await cash(page);
 const before=await page.evaluate(()=>JSON.stringify(window.__elternzeitTest.getState()));
 await page.locator('#v42VariantName').fill('Ursprungsmodell');
 await page.locator('#v42Save').click();
 expect(await page.evaluate(()=>JSON.stringify(window.__elternzeitTest.getState()))).toBe(before);
 await expect(page.locator('#v42Comparison tbody tr')).toHaveCount(2);
 await expect(page.locator('#v42Comparison tbody tr').nth(1)).toContainText('Ursprungsmodell');
 await page.evaluate(()=>window.__elternzeitTest.chooseModel('father18'));
 await expect(page.locator('#v42Comparison tbody tr')).toHaveCount(2);
 await expect(page.locator('#v42Comparison tbody tr').nth(1)).toContainText('Ursprungsmodell');
 await page.locator('#v42Save').click();
 await page.evaluate(()=>window.__elternzeitTest.chooseModel('father24'));
 await page.locator('#v42Save').click();
 await expect(page.locator('#v42Comparison tbody tr')).toHaveCount(4);
 await expect(page.locator('#v42Save')).toBeDisabled();
 await expect(page.locator('#v42Comparison')).toContainText('Nicht vergleichbar');
 await page.locator('[data-v42-remove="1"]').click();
 await expect(page.locator('#v42Comparison tbody tr')).toHaveCount(3);
 await expect(page.locator('#v42Save')).toBeEnabled();
 await page.locator('#v42Clear').click();
 await expect(page.locator('#v42Comparison tbody tr')).toHaveCount(1);
 expect(await page.evaluate(()=>window.__familienzeitV42.state())).toMatchObject({count:0,persisted:false});
});
test('costs, future-law status and date are never silently equated to verified benefits',async({page})=>{
 await page.goto(offline);await cash(page);
 await page.locator('#v42Save').click();
 await expect(page.locator('#v42Comparison tbody tr').nth(1)).toContainText('Nicht vergleichbar');
 await page.evaluate(()=>window.__elternzeitTest.changeValue('expenses',0));
 await expect(page.locator('#v42Comparison tbody tr').nth(0)).not.toContainText('Nicht vergleichbar');
 await expect(page.locator('#v42Comparison tbody tr').nth(1)).toContainText('Nicht vergleichbar');
 await expect(page.locator('#v42Comparison')).toContainText('Kein Bewilligungsnachweis');
 await expect(page.locator('#v42MonthDetail')).toContainText('keine amtlich bewilligten Zahlungen');
 await expect(page.locator('#v42MonthDetail')).toContainText('Rest nach eingegebenen Kosten');
 await page.evaluate(()=>window.__elternzeitTest.changeValue('horizon',36));
 await expect(page.locator('#v42Timeline button[data-v42-month]')).toHaveCount(36);
 await expect(page.locator('#v42Comparison')).toContainText('LM 1–36');
});
test('confirmed reset clears session comparisons while canceled reset does not',async({page})=>{
 await page.goto(offline);await cash(page);
 await page.locator('#v42Save').click();
 page.once('dialog',dialog=>dialog.dismiss());
 await page.locator('#btnReset').click();
 await expect(page.locator('#v42Comparison tbody tr')).toHaveCount(2);
 page.once('dialog',dialog=>dialog.accept());
 await page.locator('#btnReset').click();
 await expect(page.locator('#v42Comparison tbody tr')).toHaveCount(1);
 await expect(page.locator('#v42Feedback')).toContainText('Zurückgesetzt');
 await expect(page.locator('#v42Save')).toBeEnabled();
});
for(const width of [320,390,768,1280]){
 test('responsive timeline, table and comparison avoid whole-page horizontal overflow at '+width+' px',async({page})=>{
  await page.setViewportSize({width,height:850});
  await page.goto(offline);await cash(page);
  await page.locator('#v42Save').click();
  const dim=await page.evaluate(()=>{
   const container=document.querySelector('#v42FamilyPlanner');
   const track=container.querySelector('.v42-scroll');
   return {viewport:innerWidth,body:document.documentElement.scrollWidth,
    timelineWidth:track.scrollWidth,trackClient:track.clientWidth,
    comparisonWidth:container.querySelector('.v42-compare-scroll').scrollWidth};
  });
  expect(dim.body).toBeLessThanOrEqual(dim.viewport+1);
  expect(dim.timelineWidth).toBeGreaterThan(dim.trackClient);
  await expect(page.locator('#v42MonthDetail')).toBeVisible();
  const result=await new AxeBuilder({page}).include('#v42FamilyPlanner')
    .withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa']).analyze();
  expect(result.violations.map(x=>x.id)).toEqual([]);
 });
}
test('at 200% root font, controls remain operable without whole-page overflow',async({page})=>{
 await page.setViewportSize({width:390,height:850});
 await page.goto(offline);await cash(page);
 await page.evaluate(()=>{document.documentElement.style.fontSize='200%';});
 await expect(page.locator('#v42Save')).toBeVisible();
 await page.locator('#v42Save').click();
 await expect(page.locator('#v42Comparison tbody tr')).toHaveCount(2);
 const widths=await page.evaluate(()=>({viewport:innerWidth,doc:document.documentElement.scrollWidth}));
 expect(widths.doc).toBeLessThanOrEqual(widths.viewport+1);
});

test('successful JSON import clears volatile comparisons; rejected JSON preserves them and the active plan',async({page})=>{
 await page.goto(offline);await cash(page);
 await page.locator('#v42Save').click();
 const before=await page.evaluate(()=>window.__elternzeitTest.getState());
 await page.locator('#importJson').setInputFiles({name:'invalid.json',mimeType:'application/json',buffer:Buffer.from('{"data":')});
 await expect(page.locator('#importFeedback')).toHaveAttribute('data-import-result','error');
 await expect(page.locator('#v42Comparison tbody tr')).toHaveCount(2);
 expect(await page.evaluate(()=>window.__elternzeitTest.getState())).toEqual(before);
 const valid={fileType:'elternzeit-offline-v3',schemaVersion:1,data:before};
 await page.locator('#importJson').setInputFiles({name:'valid-synthetic.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(valid))});
 await expect(page.locator('#importFeedback')).toHaveAttribute('data-import-result','success');
 await expect(page.locator('#v42Comparison tbody tr')).toHaveCount(1);
 await expect(page.locator('#v42Feedback')).toContainText('Importiert');
 await expect(page.locator('#localSave')).not.toBeChecked();
});
test('variant names are safely escaped and snapshots disappear on reload without persistence',async({page})=>{
 await page.goto(offline);await cash(page);
 await page.locator('#v42VariantName').fill('<img src=x onerror=alert(1)>');
 await page.locator('#v42Save').click();
 await expect(page.locator('#v42Comparison tbody tr').nth(1)).toContainText('<img src=x onerror=alert(1)>');
 expect(await page.locator('#v42Comparison img').count()).toBe(0);
 expect(await page.evaluate(()=>window.localStorage.getItem('elternzeit-familienplan-v3'))).toBeNull();
 await page.reload();
 await expect(page.locator('#v42Comparison tbody tr')).toHaveCount(1);
 expect(await page.evaluate(()=>window.__familienzeitV42.state().persisted)).toBe(false);
});
