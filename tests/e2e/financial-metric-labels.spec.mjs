import {test,expect} from '@playwright/test';
import {readFile} from 'node:fs/promises';

const url=`http://127.0.0.1:${process.env.PLAYWRIGHT_PORT||8765}/index.html`;
const incomeLabel='Einnahmen vor Haushalts- und Kita-Kosten';
const money=n=>Math.round(n).toLocaleString('de-DE')+' €';
async function open(page,expenses=2500){
 await page.goto(url);await page.locator('#v38Advanced').click();
 await page.evaluate(expenses=>{
  const ui=window.__elternzeitTest;
  Object.assign(ui.s,{date:'2026-06-17',standardCaseConfirmed:true,zve:68000,netFather:2400,netMother:2000,egNetFather:2400,egNetMother:2000,kind:259,childcareStart:12,childcareMonthly:350,childcareMeals:40,confirmedGrant:500,grantVerified:true,grantMonth:12,horizon:18,expenses,storageConsent:false});
  ui.changeValue('month',12);
 },expenses);
}
async function show(page,id){await page.evaluate(id=>window.__elternzeitTest.showSlide([...document.querySelectorAll('.slide')].findIndex(el=>el.id===id)),id);}
async function downloadedText(page,id){
 const pending=page.waitForEvent('download');await page.locator(id).click();
 return readFile(await (await pending).path(),'utf8');
}
for(const expenses of ['',0,2500])test(`income and rest labels keep their numbers and export scope with expenses=${JSON.stringify(expenses)}`,async({page})=>{
 await open(page,expenses);
 const snapshot=await page.evaluate(()=>{
  const ui=window.__elternzeitTest,x=ui.evaluate();return {state:ui.getState(),rows:x.rows,total:x.sum(18,'income')};
 });
 await expect(page.locator('#liveBudget').locator('..')).toContainText(expenses===''?incomeLabel:'Rest nach eingetragenen Haushalts- und Kita-Kosten / LM');
 await expect(page.locator('#liveBudget')).toHaveText(money(expenses===''?snapshot.rows[11].income:snapshot.rows[11].cashAfter));
 for(const [slide,id]of [['slide-3','modelTotal'],['slide-builder','builderIncome'],['slide-5','incomeTotal']]){
  await show(page,slide);const card=page.locator('#'+id).locator('..');
  await expect(card).toContainText(incomeLabel);await expect(card).toContainText('18');
  await expect(card).not.toContainText('Budget');await expect(page.locator('#'+id)).toHaveText(money(snapshot.total));
 }
 await expect(page.locator('#incomeChart svg')).toHaveAttribute('aria-label',/vor Haushalts- und Kita-Kosten je Lebensmonat/);
 await show(page,'slide-7');
 await expect(page.locator('#compareTable')).toBeVisible();
 await expect(page.locator('#compareTable thead')).toContainText(incomeLabel);
 await expect(page.locator('#compareHorizon')).toHaveText('18');
 await show(page,'slide-axes');
 await expect(page.locator('#axesTable thead')).toContainText('Modelleinnahmen vor Haushalts- und Kita-Kosten / LM');
 await expect(page.locator('#axesTable tbody tr').nth(11).locator('td').last()).toHaveText(money(snapshot.rows[11].income));
 await show(page,'slide-6');
 await expect(page.locator('#detailTotal').locator('..')).toContainText('Modelleinnahmen vor Haushalts- und Kita-Kosten in diesem LM');
 await expect(page.locator('#detailTotal')).toHaveText(money(snapshot.rows[11].income));
 if(expenses==='')await expect(page.locator('#detailSurplus')).toContainText('Haushaltsausgaben unbekannt: kein verlässlicher Rest');
 else await expect(page.locator('#detailSurplus')).toContainText('Rest in diesem LM nach eingetragenen Haushalts- und Kita-Kosten: '+money(snapshot.rows[11].cashAfter));
 const csv=(await downloadedText(page,'#btnCsv')).replace(/^\uFEFF/,'').split('\r\n').map(line=>line.split(';'));
 expect(csv).toHaveLength(37);expect(csv[0]).toHaveLength(24);
 expect(csv[0].slice(0,17)).toEqual(['Lebensmonat','Alter_Beginn','Alter_Ende','Zeitraum','Vater','Mutter','Stunden_Vater','Stunden_Mutter','Netto_Vater','Netto_Mutter_Mutterschutz','Elterngeld_Vater','Elterngeld_Mutter','Kindergeld','Bestätigte_Sonderzahlung','Kita_Kosten','Familieneinkommen','Frei_nach_Kosten']);
 for(const [index,row]of snapshot.rows.entries()){
  expect(csv[index+1].slice(4,17)).toEqual([row.f,row.m,row.hf,row.hm,Math.round(row.fi),Math.round(row.mi),Math.round(row.fg),Math.round(row.mg),row.kind,row.grant,Math.round(row.childcare),Math.round(row.income),expenses===''?'':Math.round(row.cashAfter)].map(String));
  expect(csv[index+1].at(-1)).toContain('je Lebensmonat und Zeitraum');
  expect(csv[index+1].at(-1)).toContain('Einnahmen vor Haushalts- und Kita-Kosten');
  expect(csv[index+1].at(-1)).toContain('kein datierter Zahlungseingang oder Kontostand');
 }
 const plan=JSON.parse(await downloadedText(page,'#btnJson'));
 expect(plan.schemaVersion).toBe(1);expect(plan.data).toEqual(snapshot.state);
 expect(plan.planningDisclosure.warnings.join(' ')).toContain('keine berechnete Einnahmen- oder Restsumme');
 expect(plan.planningDisclosure.warnings.join(' ')).toContain('Rest nach eingetragenen Haushalts- und Kita-Kosten');
});

test('dated recorded transfers and assumed payments remain separate from life-month income and rest',async({page})=>{
 await open(page);await show(page,'slide-axes');
 const before=await page.evaluate(()=>window.__elternzeitTest.evaluate().rows);
 for(const [date,amount]of [['2026-06-17','1000'],['2026-06-18','-300']]){
  await page.locator('#bankDate').fill(date);await page.locator('#bankAmount').fill(amount);await page.locator('#bankAdd').click();
 }
 await page.locator('#recordedOpeningReserve').fill('500');
 await expect(page.locator('#bankSummary')).toContainText('Datierte Bankbuchungen je Kalendermonat');
 const row=page.locator('#bankSummary tbody tr').first();
 await expect(row).toContainText('2026-06');await expect(row).toContainText('700 €');await expect(row).toContainText('1.200 €');
 await expect(page.locator('#bankSummary')).toContainText('nicht erfasste Zahlungen und Ausgaben können fehlen');
 for(const [date,amount,direction]of [['2026-06-17','1000','incoming'],['2026-06-18','1200','outgoing']]){
  await page.locator('#v313PaymentDate').fill(date);await page.locator('#v313PaymentAmount').fill(amount);await page.locator('#v313PaymentDirection').selectOption(direction);await page.locator('#v313PaymentAdd').click();
 }
 await expect(page.locator('.v313-payment h3')).toHaveText('Angenommene datierte Zahlungen – Liquiditätsszenario nach Kalendertag');
 await expect(page.locator('#v313PaymentResults')).toContainText('Nur für die eingegebenen Zahlungen');
 await expect(page.locator('#v313PaymentResults')).toContainText('200,00');
 expect(await page.evaluate(()=>window.__elternzeitTest.evaluate().rows)).toEqual(before);
 await page.setViewportSize({width:320,height:780});await show(page,'slide-5');
 await expect(page.locator('#incomeTotal').locator('..')).toContainText(incomeLabel);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth+1)).toBe(true);
});
