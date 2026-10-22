import {test,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import {fileURLToPath} from 'node:url';
const offline='file://'+fileURLToPath(new URL('../../index.html',import.meta.url));
async function open(page,template='classic'){
 await page.goto(offline);
 await page.locator('[data-v38-template="'+template+'"]').click();
 await page.locator('#sectionNav button[data-slide="6"]').click();
 await expect(page.locator('#v43WhatIf')).toBeVisible();
}
const state=page=>page.evaluate(()=>JSON.stringify(window.__elternzeitTest.getState()));
const set=async(page,id,value)=>page.locator('#'+id).fill(String(value));

test('neutral what-if shows the original and alternative without changing active state',async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await open(page);
 const before=await state(page);
 await expect(page.locator('#v43Result .v43-panel')).toHaveCount(2);
 await expect(page.locator('#v43Result')).toContainText('Nicht berechenbar');
 await expect(page.locator('#v43Result')).toContainText('keine Bewilligung');
 await expect(page.locator('#v43Status')).toContainText('Ohne vollständige Kostenangaben');
 await expect(page.locator('#v43Delay')).toHaveValue('0');
 await expect(page.locator('#v43FatherHours')).toBeDisabled();
 expect(await state(page)).toBe(before);
 expect(errors).toEqual([]);
});
test('Kita shift 0-6 months needs an explicit loss and bridge-cost assumption, even when both zero',async({page})=>{
 await open(page);
 const before=await state(page);
 await page.locator('#v43Delay').selectOption('2');
 await expect(page.locator('#v43Result')).toContainText('Netto-Ausfall je Verzögerungsmonat');
 await expect(page.locator('#v43Result')).toContainText('Ersatzbetreuungskosten je Verzögerungsmonat');
 await expect(page.locator('#v43Result .v43-alt')).toContainText('Nicht berechenbar');
 await set(page,'v43BridgeWage',0);
 await set(page,'v43BridgeCare',0);
 await expect(page.locator('#v43Result')).not.toContainText('Für einen vollständigen finanziellen Vergleich fehlen');
 await expect(page.locator('#v43Result')).toContainText('Kita: LM 19 → angenommen LM 21');
 await page.locator('#v43Delay').selectOption('6');
 await expect(page.locator('#v43Result')).toContainText('angenommen LM 25');
 expect(await state(page)).toBe(before);
});
test('household cost and income effects are shown only when known; fee waiver needs explicit opt-in',async({page})=>{
 await open(page);
 await page.evaluate(()=>window.__elternzeitTest.changeValue('expenses',2100));
 const before=await state(page);
 await page.locator('#v43Delay').selectOption('2');
 await set(page,'v43BridgeWage',100);
 await set(page,'v43BridgeCare',50);
 await expect(page.locator('#v43Result .v43-delta')).toContainText('Gesamtrest-Differenz');
 const without=await page.locator('#v43Result .v43-delta').innerText();
 await page.locator('#v43WaiveFees').check();
 const withWaiver=await page.locator('#v43Result .v43-delta').innerText();
 expect(withWaiver).not.toBe(without);
 await set(page,'v43ExpensesDelta',25);
 await expect(page.locator('#v43Result')).toContainText('LM 19 → angenommen LM 21');
 expect(await state(page)).toBe(before);
});
test('changing part-time hours fails financially closed without signed wage delta, then unlocks on 0',async({page})=>{
 await open(page,'parttime');
 await expect(page.locator('#v43FatherHours')).toBeEnabled();
 const original=await state(page);
 await set(page,'v43FatherHours',20);
 await expect(page.locator('#v43Result')).toContainText('Nettoänderung für die neuen Teilzeitstunden von Elternteil 1');
 await expect(page.locator('#v43Result .v43-alt')).toContainText('Nicht berechenbar');
 await set(page,'v43FatherNet',0);
 await expect(page.locator('#v43Result')).not.toContainText('Nettoänderung für die neuen Teilzeitstunden von Elternteil 1');
 await expect(page.locator('#v43Detail')).toContainText('20 /');
 await page.locator('#v43WageRisk').fill('15');
 await expect(page.locator('#v43WageRiskValue')).toHaveText('15 %');
 expect(await state(page)).toBe(original);
});
test('invalid negative alternative household spending and hours do not change planner',async({page})=>{
 await open(page);
 await page.evaluate(()=>window.__elternzeitTest.changeValue('expenses',600));
 const original=await state(page);
 await set(page,'v43ExpensesDelta',-900);
 await expect(page.locator('#v43Result')).toContainText('Szenario nicht berechenbar');
 await expect(page.locator('#v43Result')).toContainText('dürfen nicht negativ werden');
 await set(page,'v43ExpensesDelta',0);
 await page.locator('#v43WageRisk').fill('10');
 await expect(page.locator('#v43Result')).not.toContainText('Szenario nicht berechenbar');
 expect(await state(page)).toBe(original);
});
test('scenario-only reset preserves active plan and existing Paket 2 snapshots',async({page})=>{
 await open(page);
 await page.locator('#v42Save').click();
 await expect(page.locator('#v42Comparison tbody tr')).toHaveCount(2);
 await page.evaluate(()=>window.__elternzeitTest.changeValue('expenses',1500));
 const original=await state(page);
 await page.locator('#v43Delay').selectOption('3');
 await set(page,'v43BridgeWage',0);await set(page,'v43BridgeCare',30);
 await set(page,'v43ExpensesDelta',100);
 await page.locator('#v43Reset').click();
 await expect(page.locator('#v43Delay')).toHaveValue('0');
 await expect(page.locator('#v43BridgeCare')).toHaveValue('');
 await expect(page.locator('#v43ExpensesDelta')).toHaveValue('0');
 await expect(page.locator('#v42Comparison tbody tr')).toHaveCount(2);
 await expect(page.locator('#v43Status')).toContainText('hypothetischen Annahmen zurückgesetzt');
 expect(await state(page)).toBe(original);
});
test('confirmed reset clears what-if but canceled reset does not, while rejected import preserves it',async({page})=>{
 await open(page);
 await page.locator('#v43WageRisk').fill('20');
 page.once('dialog',dialog=>dialog.dismiss());
 await page.locator('#btnReset').click();
 await expect(page.locator('#v43WageRisk')).toHaveValue('20');
 await page.locator('#importJson').setInputFiles({name:'bad.json',mimeType:'application/json',buffer:Buffer.from('{"data":')});
 await expect(page.locator('#importFeedback')).toHaveAttribute('data-import-result','error');
 await expect(page.locator('#v43WageRisk')).toHaveValue('20');
 page.once('dialog',dialog=>dialog.accept());
 await page.locator('#btnReset').click();
 await expect(page.locator('#v43WageRisk')).toHaveValue('0');
 await expect(page.locator('#v43Status')).toContainText('Plan zurückgesetzt');
});
test('successful JSON import discards transient scenario assumptions, never writes them to schema',async({page})=>{
 await open(page);
 const original=await page.evaluate(()=>window.__elternzeitTest.getState());
 await page.locator('#v43WageRisk').fill('15');
 await set(page,'v43ExpensesDelta',35);
 const payload={fileType:'elternzeit-offline-v3',schemaVersion:1,data:original};
 await page.locator('#importJson').setInputFiles({name:'safe.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(payload))});
 await expect(page.locator('#importFeedback')).toHaveAttribute('data-import-result','success');
 await expect(page.locator('#v43WageRisk')).toHaveValue('0');
 await expect(page.locator('#v43ExpensesDelta')).toHaveValue('0');
 await expect(page.locator('#v43Status')).toContainText('Plan importiert');
 expect(await page.evaluate(()=>window.__elternzeitTest.getState().storageConsent)).toBe(false);
});
test('no childcare start disables delay and never invents a new Kita place',async({page})=>{
 await open(page);
 await page.evaluate(()=>window.__elternzeitTest.changeValue('childcareStart',0));
 await expect(page.locator('#v43Delay')).toBeDisabled();
 await expect(page.locator('#v43CareHelp')).toContainText('kein Kita-Start eingetragen');
 await expect(page.locator('#v43Result')).toContainText('Nicht angenommen');
});
for(const width of [320,390,768,1280]){
 test('new what-if card responsive and automated accessibility at '+width+' px',async({page})=>{
  await page.setViewportSize({width,height:850});
  await open(page);
  await expect(page.locator('#v43WhatIf')).toBeVisible();
  const dims=await page.evaluate(()=>({
   width:innerWidth,
   pageWidth:document.documentElement.scrollWidth,
   controlsWidth:document.querySelector('#v43WhatIf').getBoundingClientRect().width
  }));
  expect(dims.pageWidth).toBeLessThanOrEqual(dims.width+1);
  expect(dims.controlsWidth).toBeLessThanOrEqual(dims.width);
  await page.locator('#v43Delay').selectOption('1');
  await expect(page.locator('#v43Result')).toContainText('Nicht berechenbar');
  const axe=await new AxeBuilder({page}).include('#v43WhatIf')
   .withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa']).analyze();
  expect(axe.violations.map(item=>item.id)).toEqual([]);
 });
}
test('200 percent root font keeps controls keyboard-accessible and causes no document overflow',async({page})=>{
 await page.setViewportSize({width:390,height:850});await open(page);
 await page.evaluate(()=>{document.documentElement.style.fontSize='200%';});
 const widths=await page.evaluate(()=>({page:document.documentElement.scrollWidth,width:innerWidth}));
 expect(widths.page).toBeLessThanOrEqual(widths.width+1);
 await page.locator('#v43Delay').focus();
 await page.keyboard.press('ArrowDown');
 await expect(page.locator('#v43Delay')).toHaveValue('1');
 await page.locator('#v43Reset').focus();
 await page.keyboard.press('Enter');
 await expect(page.locator('#v43Delay')).toHaveValue('0');
});
test('what-if controls and snapshots remain ephemeral after reload, no hidden schema persistence',async({page})=>{
 await open(page);await page.locator('#v42Save').click();
 await page.locator('#v43WageRisk').fill('30');
 await set(page,'v43ExpensesDelta',10);
 expect(await page.evaluate(()=>window.localStorage.getItem('elternzeit-familienplan-v3'))).toBeNull();
 await page.reload();
 await expect(page.locator('#v43WageRisk')).toHaveValue('0');
 await expect(page.locator('#v43ExpensesDelta')).toHaveValue('0');
 expect(await page.evaluate(()=>window.__whatIfV43.state())).toMatchObject({persisted:false,appliedToPlan:false});
 expect(await page.evaluate(()=>window.__familienzeitV42.state().count)).toBe(0);
});

test('original cashflow chart stays before the new hypothetical controls',async({page})=>{
 await open(page);
 const order=await page.evaluate(()=>{
  const slide=document.getElementById('slide-5');
  return [...slide.children].map(element=>element.id||element.className||element.tagName);
 });
 expect(order.indexOf('chart-zone')).toBeGreaterThan(order.indexOf('v42FamilyPlanner'));
 expect(order.indexOf('v43WhatIf')).toBeGreaterThan(order.indexOf('chart-zone'));
 expect(order.indexOf('v43WhatIf')).toBeGreaterThan(order.indexOf('spendingAlert'));
});
