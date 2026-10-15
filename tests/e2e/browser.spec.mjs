import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
const appUrl = process.env.BROWSER_APP_URL || `http://127.0.0.1:${process.env.PLAYWRIGHT_PORT || '8765'}/index.html`;
async function navigate(page, id) {
  const index = await page.locator('.slide').evaluateAll((slides, id) => slides.findIndex(s => s.id === id), id);
  await page.locator(`#sectionNav button[data-slide="${index}"]`).click();
  await expect(page.locator(`#${id}`)).toBeVisible();
}
async function standardInputs(page) {
  await navigate(page, 'slide-2');
  await page.locator('#standardCaseConfirmed').selectOption('yes');
  await page.locator('#date').fill('2026-05-28');
  await page.locator('#date').blur();
  await navigate(page, 'slide-region');
  await page.locator('#zve').fill('95000');
}
const runtimeErrors=new WeakMap();
test.beforeEach(async ({ page }) => {
  const errors=[];runtimeErrors.set(page,errors);
  page.on('pageerror',error=>errors.push(error.message));
  page.on('console',message=>{if(message.type()==='error')errors.push(message.text());});
  await page.goto(appUrl);
  await expect(page.locator('#sectionNav button').first()).toBeVisible();
});
test.afterEach(async ({page})=>{expect(runtimeErrors.get(page),'browser runtime and console errors').toEqual([]);});
test('offline three-step navigation, keyboard and runtime integrity', async ({ page }) => {
  const errors=[]; const requests=[];
  page.on('pageerror', e=>errors.push(e.message));
  page.on('console', m=>{ if(m.type()==='error')errors.push(m.text()); });
  page.on('request', r=>{ if(/^https?:/.test(r.url()))requests.push(r.url()); });
  await page.reload();
  requests.length=0;
  await page.context().setOffline(true);
  await expect(page.locator('#globalPlanStatus')).toContainText('NICHT_UNTERSTUETZT');
  await expect(page.locator('#globalPlanStatus')).toContainText('Alle Finanzwerte sind Schätzungen');
  await page.getByRole('button',{name:'1 · Eure Daten',exact:true}).click();
  await expect(page.locator('#slide-2')).toBeVisible();
  await standardInputs(page);
  await expect(page.locator('#globalPlanStatus')).toContainText('PLAUSIBEL_STANDARD');
  await expect(page.locator('#liveMonth')).toContainText('28.07.2026 bis 27.08.2026');
  await page.getByRole('button',{name:'Monatsdetails ansehen →',exact:true}).click();
  await expect(page.locator('#slide-6')).toBeVisible();
  await navigate(page,'slide-4');
  await page.getByRole('button',{name:'Elternzeit-Konfigurator',exact:true}).click();
  await expect(page.locator('#slide-builder')).toBeVisible();
  await navigate(page,'slide-1');
  await page.getByRole('button',{name:'2 · Ziele & Varianten',exact:true}).click();
  await expect(page.locator('#slide-goal')).toBeVisible();
  await navigate(page,'slide-1');
  await page.getByRole('button',{name:'3 · Plan prüfen',exact:true}).click();
  await expect(page.locator('#slide-10')).toBeVisible();
  await page.locator('#next').focus();
  await page.keyboard.press('ArrowLeft');
  await expect(page.locator('#slide-9')).toBeVisible();
  await page.locator('#btnReset').focus();
  await page.keyboard.press('Tab');
  await expect(page.locator('#btnCsv')).toBeFocused();
  expect(errors).toEqual([]);
  expect(requests).toEqual([]);
});
test('explicit persistence consent and deletion survive reload', async ({ page }) => {
  await standardInputs(page);
  expect(await page.evaluate(()=>localStorage.length)).toBe(0);
  await page.locator('#localSave').check();
  await navigate(page,'slide-2');
  await page.locator('#netFather').fill('2710');
  await page.locator('#netFather').blur();
  expect(await page.evaluate(()=>JSON.parse(localStorage.getItem('elternzeit-familienplan-v3')).netFather)).toBe(2710);
  await page.reload();
  await navigate(page,'slide-2');
  await expect(page.locator('#netFather')).toHaveValue('2710');
  await page.locator('#deleteLocal').click();
  expect(await page.evaluate(()=>localStorage.length)).toBe(0);
  await expect(page.locator('#localSave')).not.toBeChecked();
  await page.reload();
  await expect(page.locator('#localSave')).not.toBeChecked();
});
test('actual JSON download/import preserves inputs and independent leave sections', async ({ page }, testInfo) => {
  const dialogs=[];page.on('dialog',async d=>{dialogs.push(d.message());await d.dismiss();});
  await standardInputs(page);
  await navigate(page,'slide-axes');
  await page.locator('#axesFatherStart').fill('2026-07-28');
  await page.locator('#axesFatherEnd').fill('2026-09-27');
  await page.locator('#addFatherPeriod').click();
  await page.locator('#father-period-2-start').fill('2026-11-28');
  await page.locator('#father-period-2-end').fill('2026-12-27');
  await page.locator('#axesApply').click();
  const downloadPromise=page.waitForEvent('download');
  await page.locator('#btnJson').click();
  const downloaded=await downloadPromise;
  const file=testInfo.outputPath('synthetic-roundtrip.json');
  await downloaded.saveAs(file);
  const exported=JSON.parse(await readFile(file,'utf8'));
  expect(exported.data.leaveOverrides.father).toHaveLength(2);
  expect(exported.data.date).toBe('2026-05-28');
  await navigate(page,'slide-2');
  await page.locator('#date').fill('2026-08-01');
  await page.locator('#date').blur();
  await page.locator('#importJson').setInputFiles(file);
  await expect(page.locator('#date')).toHaveValue('2026-05-28');
  expect(dialogs).toEqual([]);
  const restored=await page.evaluate(()=>window.__elternzeitTest.getState());
  expect(restored.schedule).toEqual(exported.data.schedule);
  expect(restored.leaveOverrides).toEqual(exported.data.leaveOverrides);
  expect(restored.storageConsent).toBe(false);
});
for (const viewport of [{name:'desktop',width:1440,height:1000},{name:'mobile',width:390,height:844}]) {
  test(`${viewport.name}: every slide is contained and has no basic accessibility violations`, async ({page},testInfo)=>{
    await page.setViewportSize(viewport);
    await standardInputs(page);
    const ids=await page.locator('.slide').evaluateAll(slides=>slides.map(s=>s.id));
    const findings=[];
    for(const id of ids){
      await navigate(page,id);
      await page.waitForTimeout(250);
      if(id==='slide-1')expect(await page.locator('h1 .impact').evaluate(el=>Number.parseFloat(getComputedStyle(el).fontSize)),'hero second line remains legible at this viewport').toBeGreaterThanOrEqual(30);
      const dimensions=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,view:window.innerWidth}));
      expect(dimensions.scroll,`${id} horizontal page overflow`).toBeLessThanOrEqual(dimensions.view+1);
      const scan=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa']).analyze();
      findings.push({slide:id,violations:scan.violations.map(v=>({id:v.id,impact:v.impact,description:v.description,nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary}))}))});
      await page.screenshot({path:testInfo.outputPath(`${viewport.name}-${id}.png`),fullPage:true});
    }
    await mkdir('qa',{recursive:true});
    await writeFile(`qa/browser-accessibility-${viewport.name}.json`,JSON.stringify(findings,null,2));
    expect(findings.flatMap(f=>f.violations.map(v=>({slide:f.slide,id:v.id,affectedNodes:v.nodes.length})))).toEqual([]);
  });
}

test('goal search validates, explains and applies distinct proposals', async ({page},testInfo)=>{
  await standardInputs(page);
  await navigate(page,'slide-goal');
  await page.locator('#goalCare').selectOption('12');
  await page.locator('#goalMinFather').fill('2');
  await page.locator('#goalPart').selectOption('0');
  await page.locator('#runGoal').click();
  await expect(page.locator('#runGoal')).toBeEnabled({timeout:90000});
  await expect(page.locator('#goalResult')).toContainText('Automatische Suche abgeschlossen');
  const proposals=await page.evaluate(()=>window.__elternzeitV3.goalResults());
  expect(proposals.length).toBeGreaterThanOrEqual(2);
  const titles=await page.locator('#goalResult .plan-option h3').allTextContents();
  expect(titles.length).toBe(proposals.length);
  expect(new Set(titles).size).toBe(titles.length);
  for(let i=0;i<titles.length;i++){
    expect(titles[i]).toContain(proposals[i].title);
    expect(titles[i]).toMatch(/Fokus|Szenario|Stresstest/);
  }
  expect(proposals.every(p=>p.valid)).toBe(true);
  expect(proposals.every(p=>typeof p.explanation==='string'&&p.explanation.length>20)).toBe(true);
  await expect(page.locator('#goalResult')).toContainText('Begrenzte Vorlagensuche');
  expect(new Set(proposals.map(p=>JSON.stringify(p.schedule))).size).toBe(proposals.length);
  const comparison=await page.evaluate(()=>window.__elternzeitV3.goalComparison());
  expect(comparison.plans).toHaveLength(proposals.length);
  expect(comparison.bankReceiptsPredicted).toBe(false);
  const money=x=>Math.round(x).toLocaleString('de-DE')+' €';
  for(let i=0;i<comparison.plans.length;i++){
    const card=page.locator('#goalResult .plan-option').nth(i),plan=comparison.plans[i];
    expect(plan.freeMonths.father).toBe(proposals[i].free);expect(plan.freeMonths.mother).toBe(proposals[i].motherFree);
    await expect(card.locator('thead')).toContainText('Realistisch');
    await expect(card.locator('thead')).toContainText('Vorsichtig');
    const rows=card.locator('tbody tr');
    const fields=['totalAvailable','lowestAvailable','requiredReserves','bottleneckMonths'];
    for(let n=0;n<fields.length;n++)for(const [column,scenario]of [[0,'realistic'],[1,'conservative']]){
      const value=plan[scenario][fields[n]];
      const expected=n===3?(value.join(', ')||'keine'):money(n===2?Math.ceil(Math.max(0,value)):value);
      await expect(rows.nth(n).locator('td').nth(column)).toHaveText(expected);
    }
    await expect(card).toContainText('Anfangsrücklage');
    await expect(card).toContainText('Engpass-Lebensmonate');
  }
  const comparisonScans=[];
  for(const width of [1440,390]){
    await page.setViewportSize({width,height:900});
    const dimensions=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,view:window.innerWidth}));
    expect(dimensions.scroll,'comparison horizontal overflow').toBeLessThanOrEqual(dimensions.view+1);
    const scan=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa']).analyze();
    comparisonScans.push({width,violations:scan.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary}))}))});
    expect(scan.violations,JSON.stringify(scan.violations)).toEqual([]);
    await page.screenshot({path:testInfo.outputPath((width===390?'mobile':'desktop')+'-plan-comparison.png'),fullPage:true});
  }
  await writeFile('qa/browser-accessibility-comparison.json',JSON.stringify(comparisonScans,null,2));

  await page.locator('#goalResult [data-accept]').first().click();
  await expect(page.locator('#slide-5')).toBeVisible();
  const state=await page.evaluate(()=>window.__elternzeitTest.getState());
  expect(state.schedule).toEqual(proposals[0].schedule);
});

test('independent work and benefit axes affect projections while bank receipts remain separate',async({page})=>{
  await standardInputs(page);
  await navigate(page,'slide-axes');
  const original=await page.evaluate(()=>({leave:window.__elternzeitV3.timeAxes().leavePeriods,row:window.__elternzeitTest.evaluate().rows[2]}));
  await page.locator('#axisMonth').fill('3');
  await page.locator('#axisMonth').blur();
  await page.locator('#axisHoursFather').fill('24');
  await page.locator('#axisBenefitFather').selectOption('plus');
  await page.locator('#axesIndependentApply').click();
  const changed=await page.evaluate(()=>({axes:window.__elternzeitV3.timeAxes(),rows:window.__elternzeitTest.evaluate().rows}));
  expect(changed.axes.leavePeriods).toEqual(original.leave);
  expect(changed.rows[2].fi).toBeGreaterThan(original.row.fi);
  expect(changed.rows[2].fg).not.toBe(original.row.fg);
  await page.locator('#bankDate').fill('2026-09-01');
  await page.locator('#bankAmount').fill('700');
  await page.locator('#bankCategory').selectOption('elterngeld');
  await page.locator('#bankAdd').click();
  await expect(page.locator('#bankSummary')).toContainText('2026-09');
  await expect(page.locator('#bankSummary')).toContainText('700');
  const recorded=await page.evaluate(()=>({state:window.__elternzeitTest.getState(),rows:window.__elternzeitTest.evaluate().rows}));
  expect(recorded.state.bankLedger).toHaveLength(1);
  expect(recorded.rows).toEqual(changed.rows);
  await page.locator('#bankClear').click();
  await expect(page.locator('#bankSummary')).toContainText('Keine tatsächlichen Zahlungseingänge');
});

test('dynamic model timelines remain accessible across all 36 life months',async({page})=>{
  await standardInputs(page);
  const findings=[];
  for(const width of [1440,390]){
    await page.setViewportSize({width,height:900});
    for(const model of ['bonus','hybridWork','quickReturn']){
      await navigate(page,'slide-3');
      await page.locator(`[data-model="${model}"]`).click();
      await expect(page.locator(`[data-model="${model}"]`)).toHaveAttribute('aria-pressed','true');
      await navigate(page,'slide-4');
      const scroll=page.locator('#timelineWrap');
      const cells=page.locator('#timeline .status-cell');
      expect(await cells.count()).toBe(72);
      for(const position of [0,0.5,1]){
        await scroll.evaluate((element,position)=>{element.scrollLeft=(element.scrollWidth-element.clientWidth)*position;},position);
        await page.waitForTimeout(100);
        const result=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa']).analyze();
        findings.push({width,model,position,violations:result.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary}))}))});
      }
    }
  }
  await writeFile('qa/browser-accessibility-models.json',JSON.stringify(findings,null,2));
  const failures=findings.filter(f=>f.violations.length);
  if(failures.length)console.error('DYNAMIC_ACCESSIBILITY_FINDINGS '+JSON.stringify(failures,null,2));
  expect(failures,JSON.stringify(failures,null,2)).toEqual([]);
});

test('JSON roundtrip restores independent axes, bank ledger and calculated finances without keeping an old local copy',async({page},testInfo)=>{
  const dialogs=[];page.on('dialog',async dialog=>{dialogs.push(dialog.message());await dialog.dismiss();});
  await standardInputs(page);
  await navigate(page,'slide-axes');
  await page.locator('#axisMonth').fill('3');await page.locator('#axisMonth').blur();
  await page.locator('#axisHoursFather').fill('24');
  await page.locator('#axisBenefitFather').selectOption('plus');
  await page.locator('#axesIndependentApply').click();
  await page.locator('#bankDate').fill('2026-09-01');
  await page.locator('#bankAmount').fill('700');
  await page.locator('#bankCategory').selectOption('elterngeld');
  await page.locator('#bankAdd').click();
  const original=await page.evaluate(()=>({state:window.__elternzeitTest.getState(),rows:window.__elternzeitTest.evaluate().rows,axes:window.__elternzeitV3.timeAxes()}));
  expect(original.state.employmentOverrides.father).not.toHaveLength(0);
  expect(original.state.benefitOverrides.father).not.toHaveLength(0);
  const downloadedPromise=page.waitForEvent('download');await page.locator('#btnJson').click();
  const file=testInfo.outputPath('synthetic-independent-roundtrip.json');await(await downloadedPromise).saveAs(file);
  await page.locator('#localSave').check();
  await page.locator('#axesIndependentReset').click();await page.locator('#bankClear').click();
  expect(await page.evaluate(()=>localStorage.length)).toBeGreaterThan(0);
  await page.locator('#importJson').setInputFiles(file);
  await expect(page.locator('#bankSummary')).toContainText('700');
  const imported=await page.evaluate(()=>({state:window.__elternzeitTest.getState(),rows:window.__elternzeitTest.evaluate().rows,axes:window.__elternzeitV3.timeAxes(),stored:localStorage.length}));
  for(const key of ['employmentOverrides','benefitOverrides','bankLedger'])expect(imported.state[key]).toEqual(original.state[key]);
  expect(imported.rows).toEqual(original.rows);expect(imported.axes).toEqual(original.axes);
  expect(imported.state.storageConsent).toBe(false);expect(imported.stored).toBe(0);
  await expect(page.locator('#localSave')).not.toBeChecked();expect(dialogs).toEqual([]);
});

test('per-parent stress inputs affect wages independently and preserve maternity benefits',async({page})=>{
  await standardInputs(page);
  await navigate(page,'slide-3');await page.locator('[data-model="quickReturn"]').click();
  await navigate(page,'slide-risk');
  await expect(page.locator('#riskFatherPercent')).toHaveValue('');
  await expect(page.locator('#riskMotherPercent')).toHaveValue('');
  const before=await page.locator('#riskCards').innerText();
  await page.locator('#riskFatherPercent').fill('0');await page.locator('#riskMotherPercent').fill('30');
  await expect(page.locator('#riskCards')).toContainText('Elternteil 1 0 %, Elternteil 2 30 %');
  expect(await page.locator('#riskCards').innerText()).not.toBe(before);
  const scenarios=await page.evaluate(()=>window.__elternzeitV3.riskScenarios().map(s=>({id:s.id,rows:s.calc.rows})));
  const base=scenarios.find(s=>s.id==='base').rows,down=scenarios.find(s=>s.id==='down').rows;
  expect(base.some(r=>r.fi>0)).toBe(true);expect(base.some(r=>r.mi>(r.maternityBenefits||0))).toBe(true);
  for(let i=0;i<base.length;i++){
    expect(down[i].fi).toBeCloseTo(base[i].fi,6);
    expect(down[i].maternityBenefits||0).toBeCloseTo(base[i].maternityBenefits||0,6);
    expect(down[i].mi-(down[i].maternityBenefits||0)).toBeCloseTo((base[i].mi-(base[i].maternityBenefits||0))*.7,6);
  }
  await page.locator('#riskFatherPercent').fill('');
  await expect(page.locator('#riskCards')).toContainText('Elternteil 1 15 %, Elternteil 2 30 %');
});

test('mother and both-role searches produce valid recommendations and mark changed assumptions stale',async({page})=>{
  await standardInputs(page);await navigate(page,'slide-goal');
  await page.locator('#goalCare').selectOption('12');await page.locator('#goalMinFather').fill('2');await page.locator('#goalPart').selectOption('0');
  await page.locator('#goalRoles').selectOption('mother');await page.locator('#runGoal').click();
  await expect(page.locator('#runGoal')).toBeEnabled({timeout:90000});
  await expect(page.locator('#goalResult')).toContainText('Automatische Suche abgeschlossen');
  const mother=await page.evaluate(()=>window.__elternzeitV3.goalResults());
  expect(mother.length).toBeGreaterThan(0);
  expect(mother.every(p=>p.valid&&p.careLead==='mother'&&p.motherFree>=p.free)).toBe(true);
  await page.locator('#goalRoles').selectOption('both');await page.locator('#runGoal').click();
  await expect(page.locator('#runGoal')).toBeEnabled({timeout:90000});
  const both=await page.evaluate(()=>window.__elternzeitV3.goalResults());
  expect(both.length).toBeGreaterThan(0);expect(both.every(p=>p.valid)).toBe(true);
  await navigate(page,'slide-risk');await page.locator('#riskMotherPercent').fill('30');
  await navigate(page,'slide-goal');await expect(page.locator('#goalResult')).toContainText('veraltet');
  for(const button of await page.locator('#goalResult [data-accept]').all())await expect(button).toBeDisabled();
  await page.locator('#runGoal').click();await expect(page.locator('#runGoal')).toBeEnabled({timeout:90000});
  await navigate(page,'slide-axes');await page.locator('#axesFatherStart').fill('2026-07-28');await page.locator('#axesFatherEnd').fill('2026-08-27');await page.locator('#axesApply').click();
  await navigate(page,'slide-goal');await expect(page.locator('#goalResult')).toContainText('veraltet');
  for(const button of await page.locator('#goalResult [data-accept]').all())await expect(button).toBeDisabled();
  await navigate(page,'slide-axes');await page.locator('#axesReset').click();await navigate(page,'slide-goal');
  await page.locator('#runGoal').click();await expect(page.locator('#runGoal')).toBeEnabled({timeout:90000});
  const accepted=await page.evaluate(()=>window.__elternzeitV3.goalResults()[0]);expect(accepted).toBeTruthy();
  await page.locator('#goalResult [data-accept]').first().click();await expect(page.locator('#slide-5')).toBeVisible();
  expect(await page.evaluate(()=>window.__elternzeitTest.getState().schedule)).toEqual(accepted.schedule);
});

test('2027 forecast search never claims legally verified eligibility', async ({page})=>{
 await navigate(page,'slide-2');
 await page.locator('#standardCaseConfirmed').selectOption('yes');
 await navigate(page,'slide-region');
 await page.locator('#zve').fill('95000');
 await navigate(page,'slide-goal');
 await page.locator('#goalCare').selectOption('12');
 await page.locator('#goalMinFather').fill('2');
 await page.locator('#goalPart').selectOption('0');
 await page.locator('#runGoal').click();
 await expect(page.locator('#runGoal')).toBeEnabled({timeout:90000});
 await expect(page.locator('#goalResult')).toContainText('UNVERBINDLICHE PROGNOSE FÜR 2027');
 const plans=await page.evaluate(()=>window.__elternzeitV3.goalResults());
 expect(plans.length).toBeGreaterThanOrEqual(1);
 expect(plans.every(x=>x.forecastPreview===true&&x.valid===false)).toBe(true);
 await page.locator('#goalResult [data-accept]').first().click();
 await expect(page.locator('#globalPlanStatus')).toContainText('NICHT_UNTERSTUETZT');
});

test('2027 legal event statuses, Kita deadline and commission-income warning in real browser', async ({page})=>{
  await navigate(page,'slide-law');
  await expect(page.locator('#legalEvents')).toContainText('Gesetzentwurf – nicht geltend');
  await expect(page.locator('#legalEvents')).toContainText('Verkündet – künftiges Inkrafttreten');
  await navigate(page,'slide-9');
  await expect(page.locator('#applicationChecklist')).toContainText('NRW-Kita-Betreuungsbedarf');
  await expect(page.locator('#applicationChecklist')).toContainText('28.05.2028');
  await expect(page.locator('#applicationChecklist')).toContainText('Kindergeld-Auszahlungsweg');
  await navigate(page,'slide-2');
  await page.locator('#standardCaseConfirmed').selectOption('yes');
  await page.locator('#incomeProfileFather').selectOption('recurring_commissions');
  await navigate(page,'slide-region');
  await page.locator('#zve').fill('95000');
  await expect(page.locator('#globalPlanStatus')).toContainText('NICHT_UNTERSTUETZT');
  const state=await page.evaluate(()=>window.__elternzeitTest.getState());
  expect(state.incomeProfileFather).toBe('recurring_commissions');
  await navigate(page,'slide-2');
  await expect(page.locator('#incomeProfileFather')).toHaveValue('recurring_commissions');
});


test('income onboarding identifies manual sources without deriving net pay or changing legal roles',async({page})=>{
  await standardInputs(page);await navigate(page,'slide-2');
  await expect(page.locator('#incomeGuide')).toContainText('Erkundungsmodus');
  const before=await page.evaluate(()=>({rows:window.__elternzeitTest.evaluate().rows,axes:window.__elternzeitV3.timeAxes()}));
  await page.locator('#parentNameFather').fill('Alex');await page.locator('#parentNameMother').fill('Robin');
  await page.locator('#incomeEntryMode').selectOption('known');
  await expect(page.locator('#incomeGuide')).toContainText('Auszahlungs-Netto und Elterngeld-Netto getrennt');
  await expect(page.locator('label[for="netFather"]')).toContainText('Alex');
  await expect(page.locator('label[for="netMother"]')).toContainText('Robin');
  await page.locator('#incomeEntryMode').selectOption('official');
  await expect(page.locator('#incomeGuide')).toContainText('nicht automatisch überprüft');
  await expect(page.locator('#incomeGuide')).toContainText('gehört nicht in das Feld Elterngeld-Netto');
  await expect(page.locator('#incomeOnboarding')).toContainText('keine Übertragung');
  await expect(page.locator('#incomeOnboarding')).toContainText('gebärende Person');
  const net=await page.locator('#netFather').inputValue(),eg=await page.locator('#egNetFather').inputValue();
  await page.locator('#grossFather').fill('9999');await page.locator('#grossFather').blur();
  await expect(page.locator('#netFather')).toHaveValue(net);await expect(page.locator('#egNetFather')).toHaveValue(eg);
  const after=await page.evaluate(()=>({rows:window.__elternzeitTest.evaluate().rows,axes:window.__elternzeitV3.timeAxes()}));
  expect(after).toEqual(before);
  expect(await page.locator('body').textContent()).not.toContain('Steuerklasse IV/IV');
  await page.locator('#egNetFather').fill('');await page.locator('#egNetFather').blur();
  await expect(page.locator('#egNetFather')).toHaveValue('');
  expect(await page.evaluate(()=>window.__elternzeitTest.getState().egNetFather)).toBe('');
  await expect(page.locator('#globalPlanStatus')).toContainText('DATEN_UNVOLLSTAENDIG');
  await navigate(page,'slide-goal');await page.locator('#runGoal').click();
  await expect(page.locator('#runGoal')).toBeEnabled();
  expect(await page.evaluate(()=>window.__elternzeitV3.goalResults())).toEqual([]);
  expect(await page.locator('#goalResult [data-accept]').count()).toBe(0);
  await expect(page.locator('#globalPlanStatus')).toContainText('DATEN_UNVOLLSTAENDIG');
  await navigate(page,'slide-2');await page.locator('#egNetFather').fill('0');await page.locator('#egNetFather').blur();
  await expect(page.locator('#egNetFather')).toHaveValue('0');
  expect(await page.evaluate(()=>window.__elternzeitTest.getState().egNetFather)).toBe(0);
  await expect(page.locator('#globalPlanStatus')).toContainText('PLAUSIBEL_STANDARD');
  await page.locator('#egNetFather').fill(eg);await page.locator('#egNetFather').blur();
  await expect(page.locator('#egNetFather')).toHaveValue(eg);

});

test('parent names and income source roundtrip as literal text without HTML injection',async({page},testInfo)=>{
  await standardInputs(page);await navigate(page,'slide-2');
  const name='<img src=x onerror=window.injected=1>';
  await page.locator('#parentNameFather').fill(name);await page.locator('#parentNameMother').fill('Robin & Kim');
  await page.locator('#incomeEntryMode').selectOption('official');
  await expect(page.locator('label[for="netFather"]')).toContainText(name);
  expect(await page.evaluate(()=>window.injected)).toBeUndefined();
  expect(await page.locator('img[src="x"]').count()).toBe(0);
  const original=await page.evaluate(()=>window.__elternzeitTest.getState());
  const pending=page.waitForEvent('download');await page.locator('#btnJson').click();
  const file=testInfo.outputPath('synthetic-names-roundtrip.json');await(await pending).saveAs(file);
  const downloaded=JSON.parse(await readFile(file,'utf8'));
  expect(downloaded.data.parentNameFather).toBe(name);expect(downloaded.data.parentNameMother).toBe('Robin & Kim');
  await page.locator('#parentNameFather').fill('Anderer Name');await page.locator('#incomeEntryMode').selectOption('known');
  await page.locator('#importJson').setInputFiles(file);
  await expect(page.locator('#parentNameFather')).toHaveValue(name);await expect(page.locator('#incomeEntryMode')).toHaveValue('official');
  const restored=await page.evaluate(()=>window.__elternzeitTest.getState());
  for(const key of ['parentNameFather','parentNameMother','incomeEntryMode','schedule'])expect(restored[key]).toEqual(original[key]);
  expect(restored.schedule[0].m).toBe('MS');expect(restored.schedule[0].f).not.toBe('MS');
  expect(await page.evaluate(()=>window.injected)).toBeUndefined();expect(await page.locator('img[src="x"]').count()).toBe(0);
});

test('async goal search can be cancelled, stopped by changed assumptions and restarted without applying a plan',async({page})=>{
  await standardInputs(page);await navigate(page,'slide-goal');
  await page.locator('#goalCare').selectOption('12');await page.locator('#goalMinFather').fill('2');await page.locator('#goalPart').selectOption('0');
  const original=await page.evaluate(()=>window.__elternzeitTest.getState().schedule);
  await page.locator('#runGoal').click();await expect(page.locator('#cancelGoalSearch')).toBeVisible();
  expect(await page.evaluate(()=>window.__elternzeitV3.goalSearchState().running)).toBe(true);
  await expect(page.locator('#goalSearchProgress')).not.toBeEmpty();
  await page.locator('#cancelGoalSearch').click();await expect(page.locator('#runGoal')).toBeEnabled();
  await expect(page.locator('#goalResult')).toContainText('abgebrochen');
  expect(await page.evaluate(()=>window.__elternzeitV3.goalSearchState().running)).toBe(false);
  expect(await page.evaluate(()=>window.__elternzeitTest.getState().schedule)).toEqual(original);
  expect(await page.locator('#goalResult [data-accept]').count()).toBe(0);
  await page.locator('#runGoal').click();await expect(page.locator('#cancelGoalSearch')).toBeVisible();
  await page.locator('#goalMinIncome').fill('100');await page.locator('#goalMinIncome').blur();
  await expect(page.locator('#runGoal')).toBeEnabled();await expect(page.locator('#goalResult')).toContainText('Eingaben geändert');
  expect(await page.evaluate(()=>window.__elternzeitTest.getState().schedule)).toEqual(original);
  await page.locator('#goalMinIncome').fill('0');await page.locator('#runGoal').click();
  await expect(page.locator('#runGoal')).toBeEnabled({timeout:90000});
  await expect(page.locator('#goalResult')).toContainText('Automatische Suche abgeschlossen');
  expect(await page.locator('#goalResult .plan-option').count()).toBeGreaterThan(0);
  expect(await page.evaluate(()=>window.__elternzeitTest.getState().schedule)).toEqual(original);
});
