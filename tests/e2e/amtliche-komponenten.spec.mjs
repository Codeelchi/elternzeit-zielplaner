import {test,expect} from '@playwright/test';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';

const fixture=JSON.parse(readFileSync(new URL('../fixtures/amtliche-komponenten-2026-10-21.json',import.meta.url),'utf8'));
const offlineUrl='file://'+fileURLToPath(new URL('../../index.html',import.meta.url));

test('A02-A04: offline calculator component returns published basis, theoretical basis and Plus ceiling without mutating inputs',async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(offlineUrl);
 const actual=await page.evaluate(cases=>{
  const ui=window.__elternzeitTest,before=JSON.stringify(ui.getState());
  const observations=cases.map(c=>{
   const i=c.published_inputs_eur_per_month;
   return {id:c.id,basis:ui.basis(i.prebirth_net,i.postbirth_net),theoretical:ui.basis(i.prebirth_net,0),plus:ui.plus(i.prebirth_net,i.postbirth_net)};
  });
  return {observations,mutated:JSON.stringify(ui.getState())!==before};
 },fixture.net_to_benefit_cases);
 expect(actual.mutated).toBe(false);
 for(const [index,caseData]of fixture.net_to_benefit_cases.entries()){
  const x=caseData.published_outputs_eur_per_month;
  expect(actual.observations[index]).toEqual({id:caseData.id,basis:x.basis,theoretical:x.theoretical_basis_without_postbirth_income,plus:x.plus});
  expect(Math.min(x.basis,x.plus_ceiling)).toBe(x.plus);
 }
 expect(errors).toEqual([]);
});

test('A06: date component renders published yearless life-month boundaries with clearly synthetic 2026 adapter',async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(offlineUrl);
 await page.locator('#v38Advanced').click();
 await page.evaluate(()=>{
  const ui=window.__elternzeitTest;
  ui.changeValue('date','2026-02-15');
  ui.showSlide([...document.querySelectorAll('.slide')].findIndex(slide=>slide.id==='slide-axes'));
 });
 const expected=['15.02.2026 – 14.03.2026','15.03.2026 – 14.04.2026','15.04.2026 – 14.05.2026'];
 for(const [i,value]of expected.entries()){
  await expect(page.locator('#axesTable tbody tr').nth(i).locator('td').nth(1)).toHaveText(value);
 }
 expect(fixture.life_month_case.published_birth_year).toBe(null);
 expect(fixture.life_month_case.synthetic_adapter_years).toContain(2026);
 expect(errors).toEqual([]);
});
