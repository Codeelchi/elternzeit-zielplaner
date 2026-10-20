import {test,expect} from '@playwright/test';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';

const offlineUrl='file://'+fileURLToPath(new URL('../../index.html',import.meta.url));
// Synthetic annual amounts; the technical input range is not an eligibility cap.
const annualAmounts=[0,100000,100001,174999.99,175000,175000.01,180000,1000000000];
async function openAnnualInput(page){
 await page.goto(offlineUrl);
 await page.locator('#v38Advanced').click();
 await page.locator('#sectionNav button').filter({hasText:'Grundlagen'}).first().click();
 await page.locator('#date').fill('2026-06-17');
 await page.locator('#standardCaseConfirmed').selectOption('yes');
 await page.locator('#sectionNav button').filter({hasText:'Leistungen vor Ort'}).first().click();
}
async function downloadPlan(page){
 const pending=page.waitForEvent('download');
 await page.locator('#btnJson').click();
 return JSON.parse(readFileSync(await (await pending).path(),'utf8'));
}
async function importPlan(page,plan){
 await page.locator('#importJson').setInputFiles({name:'synthetic-zve.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(plan))});
 // importJson clears the file input only after its asynchronous reader finishes.
 await expect(page.locator('#importJson')).toHaveValue('');
}

test('annual zvE form accepts amounts above monthly limits and leaves eligibility to the rule check',async({page})=>{
 await openAnnualInput(page);
 for(const amount of annualAmounts){
  await page.locator('#zve').fill(String(amount));
  await expect(page.locator('#zve')).toHaveValue(String(amount));
  await expect(page.locator('#zve')).not.toHaveAttribute('aria-invalid','true');
  expect(await page.locator('#zve').evaluate(el=>el.validity.valid)).toBe(true);
  expect(await page.evaluate(()=>window.__elternzeitTest.getState().zve)).toBe(String(amount));
  // Read the result reached through the public field, never bypass its validation.
  const result=await page.evaluate(()=>{
   const calculation=window.__elternzeitTest.evaluate();
   return {exceeded:calculation.validation.findings.some(f=>f.code==='INCOME_LIMIT_EXCEEDED'),totalEg:calculation.rows.reduce((sum,row)=>sum+row.totalEg,0)};
  });
  expect(result.exceeded).toBe(amount>175000);
  if(amount>175000)expect(result.totalEg).toBe(0);
 }
});

test('annual zvE rejects invalid drafts without mutation, preserves unknown and keeps monthly limits',async({page})=>{
 await openAnnualInput(page);
 await page.locator('#zve').fill('68000');
 const accepted=await page.evaluate(()=>window.__elternzeitTest.getState());
 for(const value of ['-1','1000000001','175000.001']){
  await page.locator('#zve').fill(value);
  await expect(page.locator('#zve')).toHaveAttribute('aria-invalid','true');
  await expect(page.locator('#specialist-error-zve')).toContainText('Nicht übernommen');
  expect(await page.evaluate(()=>window.__elternzeitTest.getState())).toEqual(accepted);
 }
 await page.locator('#zve').fill('');
 expect(await page.evaluate(()=>window.__elternzeitTest.getState().zve)).toBe('');
 await expect(page.locator('#zve')).not.toHaveAttribute('aria-invalid','true');
 await page.locator('#sectionNav button').filter({hasText:'Grundlagen'}).first().click();
 await page.locator('#netFather').fill('100000');
 expect(await page.evaluate(()=>window.__elternzeitTest.getState().netFather)).toBe(100000);
 await page.locator('#netFather').fill('100001');
 await expect(page.locator('#netFather')).toHaveAttribute('aria-invalid','true');
 expect(await page.evaluate(()=>window.__elternzeitTest.getState().netFather)).toBe(100000);
});

test('JSON import accepts annual zvE numbers and numeric strings independently of eligibility',async({page})=>{
 await openAnnualInput(page);
 const exported=await downloadPlan(page);
 for(const amount of annualAmounts)for(const value of [amount,String(amount)]){
  const plan=structuredClone(exported);plan.data.zve=value;
  await importPlan(page,plan);
  await expect(page.locator('#importFeedback')).toHaveAttribute('data-import-result','success');
  expect(await page.evaluate(()=>window.__elternzeitTest.getState().zve)).toBe(amount);
  expect(await page.evaluate(()=>window.__elternzeitTest.getState().storageConsent)).toBe(false);
  expect(await page.evaluate(()=>window.__elternzeitTest.evaluate().validation.findings.some(f=>f.code==='INCOME_LIMIT_EXCEEDED'))).toBe(amount>175000);
 }
});

test('JSON import rejects malformed or out-of-range annual zvE without changing the accepted plan',async({page})=>{
 page.on('dialog',dialog=>dialog.dismiss());
 await openAnnualInput(page);
 await page.locator('#zve').fill('68000');
 const exported=await downloadPlan(page);
 const accepted=await page.evaluate(()=>window.__elternzeitTest.getState());
 for(const value of [-1,1000000001,'Infinity','NaN','not a number']){
  const plan=structuredClone(exported);plan.data.zve=value;
  await importPlan(page,plan);
  await expect(page.locator('#importFeedback')).toHaveAttribute('data-import-result','error');
  expect(await page.evaluate(()=>window.__elternzeitTest.getState())).toEqual(accepted);
 }
});
