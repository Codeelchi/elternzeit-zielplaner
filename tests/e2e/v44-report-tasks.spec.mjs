import {test,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import {fileURLToPath} from 'node:url';
const offline='file://'+fileURLToPath(new URL('../../index.html',import.meta.url));

async function navigate(page){
 await page.goto(offline);
 await page.locator('[data-v38-template="classic"]').click();
 if(await page.locator('#v41ModeToggle').isVisible())await page.locator('#v41ModeToggle').click();
 else await page.locator('#v38Advanced').click(); // Mobile: top-actions is intentionally hidden.
 await page.locator('#sectionNav button[data-slide="10"]').click();
 await expect(page.locator('#v44TaskHub')).toBeVisible();
}
async function printReady(page){
 await page.addInitScript(()=>{window.print=()=>{window.__userPrintCalls=(window.__userPrintCalls||0)+1;};});
 await navigate(page);
}
const pdfPageCount=buffer=>(buffer.toString('latin1').match(/\/Type\s*\/Page\b/g)||[]).length;
const pdfMediaBoxes=buffer=>(buffer.toString('latin1').match(/\/MediaBox\s*\[[^\]]+\]/g)||[]);

test('compact task list uses official links, groups and does not mutate planner',async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await navigate(page);
 const before=await page.evaluate(()=>JSON.stringify(window.__elternzeitTest.getState()));
 await expect(page.locator('#v44TaskOverview')).toContainText('quellenbasierte Aufgaben');
 await expect(page.locator('#v44TaskOverview')).toContainText('Quellenstand');
 await expect(page.locator('#v44TaskList article')).toHaveCount(6);
 await expect(page.locator('#v44TaskList a[href^="https://"]')).toHaveCount(6);
 await expect(page.locator('#v44TaskList')).toContainText('Noch offen');
 await expect(page.locator('#v44TaskHub')).toContainText('keine Bestätigung');
 expect(await page.evaluate(()=>JSON.stringify(window.__elternzeitTest.getState()))).toBe(before);
 expect(errors).toEqual([]);
});
test('same session task state is synchronized bidirectionally with original checklist',async({page})=>{
 await navigate(page);
 const before=await page.evaluate(()=>JSON.stringify(window.__elternzeitTest.getState()));
 const first=page.locator('#v44TaskList select[data-v44-task-id]').first();
 const id=await first.getAttribute('data-v44-task-id');
 await first.selectOption('ready');
 await expect(page.locator('#v44TaskList article[data-v44-task="'+id+'"]')).toHaveCount(0);
 await expect(page.locator('#v44TaskOverview')).toContainText('1 vorbereitet');
 const original=page.locator('#applicationChecklist [data-v315-task="'+id+'"]');
 await expect(original).toHaveValue('ready');
 await page.locator('#v44TaskHub [data-v44-filter="ready"]').click();
 await expect(page.locator('#v44TaskHub [data-v44-filter="ready"]')).toHaveAttribute('aria-pressed','true');
 await expect(page.locator('#v44TaskList [data-v44-task="'+id+'"]')).toHaveCount(1);
 await original.selectOption('done');
 await expect(page.locator('#v44TaskOverview')).toContainText('1 selbst erledigt');
 await page.locator('#v44TaskHub [data-v44-filter="done"]').click();
 await expect(page.locator('#v44TaskList [data-v44-task="'+id+'"]')).toHaveCount(1);
 expect(await page.evaluate(()=>JSON.stringify(window.__elternzeitTest.getState()))).toBe(before);
});
test('filter moving an item keeps focus on a remaining task or selected filter',async({page})=>{
 await navigate(page);
 const select=page.locator('#v44TaskList select').first();
 await select.focus();
 await select.selectOption('ready'); // The previously focused row leaves the default 'open' filter.
 const focus=await page.evaluate(()=>document.activeElement?.outerHTML.slice(0,200));
 expect(focus).toMatch(/data-v44-task-id|data-v44-filter/);
});
test('print preview shows two report sections and never invents free cash from unknown expenses',async({page})=>{
 await navigate(page);
 const before=await page.evaluate(()=>JSON.stringify(window.__elternzeitTest.getState()));
 await page.locator('#v44Preview').click();
 await expect(page.locator('#v44Preview')).toHaveAttribute('aria-expanded','true');
 await expect(page.locator('#v44ReportPreview [data-v44-page]')).toHaveCount(2);
 await expect(page.locator('#v44ReportPreview [data-v44-page="1"]')).toContainText('Nicht berechenbar');
 await expect(page.locator('#v44ReportPreview [data-v44-page="1"]')).toContainText('VOR Haushalts- und Kita-Kosten');
 await expect(page.locator('#v44ReportPreview [data-v44-page="2"]')).toContainText('Quelle');
 await expect(page.locator('#v44ReportPreview [data-v44-page="2"] .v44-print-task a[href^="https://"]')).toHaveCount(6);
 await expect(page.locator('#v44ReportPreview')).toContainText('keine amtliche');
 expect(await page.evaluate(()=>JSON.stringify(window.__elternzeitTest.getState()))).toBe(before);
 await page.locator('#v44Preview').click();
 await expect(page.locator('#v44ReportPreview')).toBeHidden();
});
test('printing yields exactly two A4 portrait PDF pages, no other calculator slides',async({page})=>{
 await printReady(page);
 const before=await page.evaluate(()=>JSON.stringify(window.__elternzeitTest.getState()));
 await page.locator('#v44Print').click();
 await expect(page.locator('body')).toHaveClass(/v44-print-active/);
 await expect(page.locator('#v44PrintSheet [data-v44-page]')).toHaveCount(2);
 expect(await page.evaluate(()=>window.__userPrintCalls)).toBe(1);
 const pdf=await page.pdf({printBackground:true,preferCSSPageSize:true});
 expect(pdf.length).toBeGreaterThan(10000);
 expect(pdfPageCount(pdf)).toBe(2);
 const sizes=pdfMediaBoxes(pdf);
 expect(sizes).toHaveLength(2);
 for(const box of sizes){
  const matches=box.match(/\[(?:\s*0){2}\s*(\d+(?:\.\d+)?)\s*(\d+(?:\.\d+)?)/);
  expect(matches).not.toBeNull();
  expect(Number(matches[1])).toBeGreaterThan(590);
  expect(Number(matches[1])).toBeLessThan(600);
  expect(Number(matches[2])).toBeGreaterThan(835);
  expect(Number(matches[2])).toBeLessThan(850);
 }
 expect(await page.evaluate(()=>JSON.stringify(window.__elternzeitTest.getState()))).toBe(before);
 await page.evaluate(()=>window.dispatchEvent(new Event('afterprint')));
 await expect(page.locator('body')).not.toHaveClass(/v44-print-active/);
 await expect(page.locator('#v44PrintSheet')).toBeEmpty();
});
test('36 months and known household costs remain two A4 pages with six summary rows',async({page})=>{
 await printReady(page);
 await page.evaluate(()=>{window.__elternzeitTest.changeValue('horizon',36);window.__elternzeitTest.changeValue('expenses',2250);});
 await page.locator('#v44Print').click();
 await expect(page.locator('#v44ReportPreview [data-v44-page="1"] tbody tr')).toHaveCount(6);
 await expect(page.locator('#v44ReportPreview [data-v44-page="1"]')).toContainText('2.250,00');
 await expect(page.locator('#v44ReportPreview [data-v44-page="1"]')).not.toContainText('Haushaltsausgaben unbekannt');
 const pdf=await page.pdf({printBackground:true,preferCSSPageSize:true});
 expect(pdfPageCount(pdf)).toBe(2);
});
test('confirmed reset clears task markers but dismissed dialog retains them',async({page})=>{
 await navigate(page);
 const select=page.locator('#v44TaskList select').first(),id=await select.getAttribute('data-v44-task-id');
 await select.selectOption('ready');
 page.once('dialog',dialog=>dialog.dismiss());
 await page.locator('#btnReset').click();
 await expect(page.locator('#applicationChecklist [data-v315-task="'+id+'"]')).toHaveValue('ready');
 page.once('dialog',dialog=>dialog.accept());
 await page.locator('#btnReset').click();
 await expect(page.locator('#applicationChecklist [data-v315-task="'+id+'"]')).toHaveValue('open');
 await expect(page.locator('#v44TaskOverview')).toContainText('0 vorbereitet');
});
test('failed JSON import retains session statuses; successful import clears them',async({page})=>{
 await navigate(page);
 const control=page.locator('#v44TaskList select').first(),id=await control.getAttribute('data-v44-task-id');
 await control.selectOption('ready');
 const before=await page.evaluate(()=>window.__elternzeitTest.getState());
 await page.locator('#importJson').setInputFiles({name:'invalid.json',mimeType:'application/json',buffer:Buffer.from('{"data":')});
 await expect(page.locator('#importFeedback')).toHaveAttribute('data-import-result','error');
 await expect(page.locator('#applicationChecklist [data-v315-task="'+id+'"]')).toHaveValue('ready');
 const valid={fileType:'elternzeit-offline-v3',schemaVersion:1,data:before};
 await page.locator('#importJson').setInputFiles({name:'safe.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(valid))});
 await expect(page.locator('#importFeedback')).toHaveAttribute('data-import-result','success');
 await expect(page.locator('#applicationChecklist [data-v315-task="'+id+'"]')).toHaveValue('open');
});
test('future birth displays legal recheck, and invalid birthday does not yield a printable report',async({page})=>{
 await printReady(page);
 await page.evaluate(()=>window.__elternzeitTest.changeValue('date','2027-10-15'));
 await expect(page.locator('#v44TaskOverview')).toContainText('Geburt nach Quellenstand');
 await page.locator('#v44Preview').click();
 await expect(page.locator('#v44ReportPreview')).toContainText('Rechtsstand');
 await page.evaluate(()=>window.__elternzeitTest.changeValue('date','2027-02-30'));
 await page.locator('#v44Print').click();
 await expect(page.locator('#v44ReportFeedback')).toContainText('nicht berechenbar');
 expect(await page.evaluate(()=>window.__userPrintCalls||0)).toBe(0);
});
test('print preview and task statuses never persist after browser reload',async({page})=>{
 await navigate(page);
 await page.locator('#v44TaskList select').first().selectOption('ready');
 await page.locator('#v44Preview').click();
 await page.reload();
 await expect(page.locator('#v44TaskHub [data-v44-filter="open"]')).toHaveAttribute('aria-pressed','true');
 await expect(page.locator('#v44TaskOverview')).toContainText('0 vorbereitet');
 await expect(page.locator('#v44ReportPreview')).toBeHidden();
 expect(await page.evaluate(()=>window.__planActionsV44.state().persisted)).toBe(false);
});
for(const width of [320,390,768,1280]){
 test('new tasks and preview have no page overflow and pass automatic accessibility at '+width,async({page})=>{
  await page.setViewportSize({width,height:860});await navigate(page);
  await expect(page.locator('#v44TaskHub')).toBeVisible();
  await page.locator('#v44Preview').click();
  const size=await page.evaluate(()=>({
   viewport:innerWidth,body:document.documentElement.scrollWidth,
   preview:document.querySelector('#v44ReportPreview').getBoundingClientRect().width
  }));
  expect(size.body).toBeLessThanOrEqual(size.viewport+1);
  expect(size.preview).toBeLessThanOrEqual(size.viewport);
  const a=await new AxeBuilder({page}).include('#v44TaskHub').include('#v44ReportHub')
   .withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa']).analyze();
  expect(a.violations.map(x=>x.id)).toEqual([]);
 });
}
test('200 percent browser text zoom keeps task filters and print preview usable',async({page})=>{
 await page.setViewportSize({width:390,height:860});await navigate(page);
 await page.evaluate(()=>document.documentElement.style.fontSize='200%');
 await page.locator('#v44TaskHub [data-v44-filter="all"]').focus();await page.keyboard.press('Enter');
 await expect(page.locator('#v44TaskHub [data-v44-filter="all"]')).toHaveAttribute('aria-pressed','true');
 await page.locator('#v44Preview').click();
 await expect(page.locator('#v44ReportPreview [data-v44-page]')).toHaveCount(2);
 const bodyWidth=await page.evaluate(()=>document.documentElement.scrollWidth);
 expect(bodyWidth).toBeLessThanOrEqual(391);
});

test('simple six-step mode reaches tasks and print without switching to expert mode',async({page})=>{
 await page.setViewportSize({width:320,height:860});
 await page.goto(offline);
 await page.locator('[data-v38-template="classic"]').click();
 await expect(page.locator('body')).toHaveClass(/v38-lite/);
 await page.locator('#sectionNav button[data-slide="11"]').click();
 await expect(page.locator('#v44OpenActions')).toBeVisible();
 await page.locator('#v44OpenActions').click();
 await expect(page.locator('#v44TaskHub')).toBeVisible();
 await expect(page.locator('#v44Print')).toBeVisible();
 await expect(page.locator('body')).toHaveClass(/v38-lite/);
 await page.locator('#v44BackResults').click();
 await expect(page.locator('#v44OpenActions')).toBeVisible();
});
