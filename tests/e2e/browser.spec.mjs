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
  await page.locator('#expenses').fill('1800'); // Real budget comparisons require an explicit expense assumption.
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
  // Existing expert-mode E2E cases intentionally keep all 16 specialist slides available.
  await page.locator('#v38Advanced').click();
});
test.afterEach(async ({page})=>{expect(runtimeErrors.get(page),'browser runtime and console errors').toEqual([]);});
test('offline three-step navigation, keyboard and runtime integrity', async ({ page }) => {
  const errors=[]; const requests=[];
  page.on('pageerror', e=>errors.push(e.message));
  page.on('console', m=>{ if(m.type()==='error')errors.push(m.text()); });
  page.on('request', r=>{ if(/^https?:/.test(r.url()))requests.push(r.url()); });
  await page.reload();
  await page.locator('#v38Advanced').click();
  await expect(page.locator('.live-strip')).toBeVisible(); // Expert navigation works without first choosing an example.
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
  expect(proposals.every(p=>p.tradeoff?.scope==='VALIDATED_CANDIDATE_POOL')).toBe(true);
  await expect(page.locator('#goalResult [data-goal-tradeoff]')).toHaveCount(proposals.length);
  await expect(page.locator('#goalResult')).toContainText('Weder Betreuungsstunden noch ein vollständiges Optimum');
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

test('V3.8: example in one click, care-gap warning and unknown-cost transparency on mobile', async ({page},testInfo)=>{
 await page.setViewportSize({width:390,height:844});
 await page.locator('#v38Advanced').click();
 await expect(page.locator('#sectionNav button:not([hidden])')).toHaveCount(6);
 await expect(page.locator('#v38Summary')).toContainText('Beispiel auswählen');
 await page.locator('[data-v38-template="long18"]').click();
 await expect(page.locator('#v38Summary')).toContainText('Fiktives Beispiel');
 await expect(page.locator('#v38Summary')).toContainText('Rechnerisch ja');
 await expect(page.locator('#v38Summary')).toContainText('Geburtsjahr 2027');
 await expect(page.locator('#v38Summary')).toContainText('Einnahmen, kein frei verfügbares Budget');
 await expect(page.locator('#v38CostBanner')).toBeVisible();
 const state=await page.evaluate(()=>({state:window.__elternzeitTest.getState(),quick:window.__elternzeitV38.state()}));
 expect(state.state.storageConsent).toBe(false);
 expect(state.state.standardCaseConfirmed).toBe(null);
 expect(state.quick.mode).toBe('example');
 await page.locator('[data-v38-template="parttime"]').click();
 await expect(page.locator('#v38Summary')).toContainText('Betreuungslücke');
 const dimension=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,width:innerWidth}));
 expect(dimension.scroll).toBeLessThanOrEqual(dimension.width+1);
 const axe=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa']).analyze();
 expect(axe.violations.map(v=>v.id)).toEqual([]);
 await page.screenshot({path:testInfo.outputPath('v38-mobile-quickstart.png'),fullPage:true});
});

test('V3.8: personal five-field wizard distinguishes unknown from zero costs and repairs 18-month mismatch',async({page})=>{
 await page.locator('#v38Advanced').click();
 await page.locator('[data-v38-template="classic"]').click();
 await page.locator('#v38EditOwn').click();
 await page.locator('#v38Birth').fill('2027-05-28');
 await page.locator('#v38NetF').fill('2350');
 await page.locator('#v38NetM').fill('2600');
 await page.locator('#v38Goal').selectOption('18');
 await page.locator('#v38PersonalForm button[type=submit]').click();
 await expect(page.locator('#v38Summary')).toContainText('Persönliche Näherung');
 await expect(page.locator('#v38Summary')).toContainText('Betreuungslücke ab LM 15');
 await page.locator('[data-v38-match="long18"]').click();
 await expect(page.locator('#v38Summary')).toContainText('Rechnerisch ja');
 let state=await page.evaluate(()=>window.__elternzeitTest.getState());
 expect(state.netFather).toBe(2350);expect(state.netMother).toBe(2600);
 expect(state.expenses).toBe('');expect(state.zve).toBe('');
 expect(state.standardCaseConfirmed).toBe(null);
 expect(state.egNetFather).toBe(2350);
 await page.locator('#v38Expenses').fill('0');
 await page.locator('#v38PersonalForm button[type=submit]').click();
 state=await page.evaluate(()=>window.__elternzeitTest.getState());
 expect(state.expenses).toBe(0);
 await expect(page.locator('#v38CostBanner')).toBeHidden();
 await expect(page.locator('#v38Summary')).toContainText('nach eingegebenen Kosten');
});

test('V3.9 mobile first template is visible without scrolling and mobile actions are accessible',async({page})=>{
 await page.setViewportSize({width:320,height:740});
 await page.goto('about:blank');
 await page.goto(appUrl); // Fresh navigation instead of reload, which can restore the previous scroll position under file://.
 const rect=await page.locator('[data-v38-template="classic"]').evaluate(el=>el.getBoundingClientRect().toJSON());
 expect(rect.top).toBeLessThan(740);
 expect(rect.top).toBeGreaterThanOrEqual(0);
 await expect(page.locator('#v39MobileMenu')).toBeVisible();
 await page.locator('#v39MobileMenu').click();
 await expect(page.locator('#btnJson')).toBeVisible();
 await page.locator('#v39MobileMenu').click(); // Dismiss the overlay before opening privacy details.
 await page.locator('#v39PrivacyToggle').click();
 await expect(page.locator('#localSave')).toBeVisible();
 await page.locator('[data-v38-template="classic"]').click();
 await expect(page.locator('#v38Summary')).toContainText('Fiktives Beispiel');
 const dims=await page.evaluate(()=>({scrollWidth:document.documentElement.scrollWidth,width:innerWidth}));
 expect(dims.scrollWidth).toBeLessThanOrEqual(dims.width+1);
});

test('V3.9 editing short wizard cannot overwrite manually improved tax and monthly data',async({page})=>{
 await navigate(page,'slide-1');
 await page.locator('[data-v38-template="long18"]').click();
 await page.locator('#v38EditOwn').click();
 await page.locator('#v38Birth').fill('2027-05-28');
 await page.locator('#v38NetF').fill('2350');
 await page.locator('#v38NetM').fill('2600');
 await page.locator('#v38Goal').selectOption('18');
 await page.locator('#v38Expenses').fill('1550');
 await page.locator('#v38PersonalForm button[type="submit"]').click();
 await navigate(page,'slide-2');
 await page.locator('#egNetFather').fill('1725');
 await navigate(page,'slide-region');
 await page.locator('#zve').fill('91000');
 await navigate(page,'slide-4'); // Individual month editor contains the status selectors.
 await page.locator('#fatherStatus').selectOption('U');
 const before=await page.evaluate(()=>({s:window.__elternzeitTest.getState()}));
 await navigate(page,'slide-1');
 await page.locator('#v38EditOwn').click();
 await page.locator('#v38Expenses').fill('1675');
 await page.locator('#v38PersonalForm button[type="submit"]').click();
 const after=await page.evaluate(()=>window.__elternzeitTest.getState());
 expect(after.egNetFather).toBe(1725);
 expect(after.zve).toBe(before.s.zve); // Inputs preserve exact state, including string-valued tax entries.
 expect(Number(after.zve)).toBe(91000);
 expect(after.model).toBe('custom');
 expect(after.schedule).toEqual(before.s.schedule);
 expect(after.expenses).toBe(1675);
 await expect(page.locator('#v38Summary')).toContainText('Individueller Plan');
});

test('V3.9 unknown costs never show fictitious zero reserves in robustness',async({page})=>{
 await navigate(page,'slide-1');
 await page.locator('[data-v38-template="long18"]').click();
 await navigate(page,'slide-risk');
 await expect(page.locator('#reserveReport')).toContainText('nicht berechenbar');
 await expect(page.locator('#riskCards')).toContainText('Haushaltsausgaben fehlen');
 await expect(page.locator('#riskBar')).toBeEmpty();
 await navigate(page,'slide-2');
 await page.locator('#expenses').fill('1600');
 await navigate(page,'slide-risk');
 await expect(page.locator('#reserveReport')).toContainText('Erforderliche Anfangsrücklage');
});

test('V3.9 cancelled reset leaves wizard data and selected preview unchanged',async({page})=>{
 await navigate(page,'slide-1');
 await page.locator('[data-v38-template="long18"]').click();
 await page.locator('#v38EditOwn').click();
 await page.locator('#v38Birth').fill('2027-05-28');
 await page.locator('#v38NetF').fill('2200');
 await page.locator('#v38NetM').fill('2500');
 await page.locator('#v38PersonalForm button[type="submit"]').click();
 const before=await page.evaluate(()=>JSON.stringify(window.__elternzeitTest.getState()));
 page.once('dialog',dialog=>dialog.dismiss());
 await page.locator('#btnReset').click();
 expect(await page.evaluate(()=>JSON.stringify(window.__elternzeitTest.getState()))).toBe(before);
 await expect(page.locator('#v38Summary')).toContainText('Persönliche Näherung');
});

test('V3.10 next steps guide missing evidence to the exact focused input without replacing the plan',async({page})=>{
 await navigate(page,'slide-1');
 await page.locator('[data-v38-template="long18"]').click();
 await expect(page.locator('.v310-next')).toContainText('keine Freigabe oder Antragsprüfung');
 const initial=await page.evaluate(()=>window.__elternzeitTest.getState().schedule);
 await page.locator('.v310-next [data-v310-focus="standardCaseConfirmed"]').click();
 await expect(page.locator('#slide-2')).toBeVisible();
 await expect(page.locator('#standardCaseConfirmed')).toBeFocused();
 await page.locator('#standardCaseConfirmed').selectOption('yes');
 await navigate(page,'slide-1');
 expect(await page.locator('.v310-next [data-v310-focus="standardCaseConfirmed"]').count()).toBe(0);
 await page.locator('.v310-next [data-v310-focus="zve"]').click();
 await expect(page.locator('#slide-region')).toBeVisible();
 await expect(page.locator('#zve')).toBeFocused();
 await page.locator('#zve').fill('95000');
 await navigate(page,'slide-1');
 expect(await page.locator('.v310-next [data-v310-focus="zve"]').count()).toBe(0);
 await page.locator('.v310-next [data-v310-focus="expenses"]').click();
 await expect(page.locator('#expenses')).toBeFocused();
 await page.locator('#expenses').fill('0');
 await navigate(page,'slide-1');
 expect(await page.locator('.v310-next [data-v310-focus="expenses"]').count()).toBe(0);
 await page.locator('.v310-next [data-v310-focus="egNetFather"]').click();
 await expect(page.locator('#egNetFather')).toBeFocused();
 expect(await page.evaluate(()=>window.__elternzeitTest.getState().schedule)).toEqual(initial);
});

test('V3.10 introductory net-pay help distinguishes estimates and opens official sources without transferring data',async({page})=>{
 await navigate(page,'slide-1');
 await page.locator('#v38EditOwn').click();
 await page.locator('.v310-netto-help summary').click();
 await expect(page.locator('.v310-netto-help')).toContainText('Elterngeld-Netto');
 await expect(page.locator('.v310-netto-help')).toContainText('vom Auszahlungsnetto abweichen');
 await expect(page.locator('.v310-netto-help')).toContainText('keine Eingaben aus diesem Plan übertragen');
 const link=page.locator('.v310-netto-help a');
 const url=new URL(await link.getAttribute('href'));
 expect(url.hostname).toBe('familienportal.de');expect(url.search).toBe('');
 await expect(link).toHaveAttribute('rel','noopener noreferrer');
 await expect(link).toHaveAttribute('target','_blank');
 const scan=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa']).analyze();
 expect(scan.violations).toEqual([]);
 await writeFile('qa/browser-accessibility-guidance.json',JSON.stringify([{view:'introductory-net-pay-help',violations:scan.violations}],null,2));
});

test('V3.10 contextual planning knowledge preserves open cards and remains accessible on desktop and mobile',async({page},testInfo)=>{
 await standardInputs(page);await navigate(page,'slide-1');
 await page.locator('#planningKnowledge > summary').click();
 const cards=page.locator('#planningKnowledgeCards > details');
 const reference=await page.evaluate(()=>window.__elternzeitV3.planningKnowledge());
 await expect(cards).toHaveCount(reference.cards.length);
 expect(reference.omittedCount).toBe(0);
 expect(reference.verifiedAt).toBe('2026-10-16');
 const selected=reference.cards[0];
 const first=page.locator(`[data-knowledge-id="${selected.id}"]`);
 await first.locator('summary').click();
 await expect(first).toContainText(selected.action);
 await expect(first).toContainText('Quellen geprüft: 2026-10-16');
 for(const link of await first.locator('a').all()){
  const url=new URL(await link.getAttribute('href'));
  expect(url.protocol).toBe('https:');expect(url.search).toBe('');
  await expect(link).toHaveAttribute('rel','noopener noreferrer');
 }
 await navigate(page,'slide-2');await page.locator('#expenses').fill('1900');await navigate(page,'slide-1');
 await expect(page.locator(`[data-knowledge-id="${selected.id}"]`)).toHaveAttribute('open','');
 const findings=[];
 for(const width of [1440,390]){
  await page.setViewportSize({width,height:900});
  for(const detail of await cards.all())if(await detail.getAttribute('open')===null)await detail.locator('summary').click();
  const dimensions=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,view:innerWidth}));
  expect(dimensions.scroll).toBeLessThanOrEqual(dimensions.view+1);
  const scan=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa']).analyze();
  findings.push({width,violations:scan.violations});expect(scan.violations).toEqual([]);
  await page.screenshot({path:testInfo.outputPath((width===390?'mobile':'desktop')+'-planning-knowledge.png'),fullPage:true});
 }
 await writeFile('qa/browser-accessibility-knowledge.json',JSON.stringify(findings,null,2));
 await navigate(page,'slide-2');await page.locator('#date').fill('2027-05-28');await page.locator('#date').blur();
 await navigate(page,'slide-1');
 await expect(page.locator('#planningKnowledgeCoverage')).toContainText('2027');
 await expect(page.locator('#globalPlanStatus')).toContainText('NICHT_UNTERSTUETZT');
 const preserved=await page.evaluate(()=>window.__elternzeitTest.getState());
 const portalPopup=page.waitForEvent('popup');
 await page.locator('#planningKnowledge > a[href="start.html#beratung"]').click();
 const popup=await portalPopup;await popup.waitForLoadState('domcontentloaded');
 await expect(popup.locator('#beratung')).toBeVisible();
 expect(await page.evaluate(()=>window.__elternzeitTest.getState())).toEqual(preserved);
 expect(new URL(page.url()).pathname).toBe(new URL(appUrl).pathname);
 await popup.close();
});

for(const width of [1440,390])test(`V3.10 family information portal: ${width}px offline filters, FAQ, accessibility and calculator navigation`,async({page},testInfo)=>{
 const externalRequests=[];page.on('request',request=>{if(/^https?:/.test(request.url())&&new URL(request.url()).hostname!=='127.0.0.1')externalRequests.push(request.url());});
 if(appUrl.startsWith('file:'))await page.context().setOffline(true);
 await page.setViewportSize({width,height:900});
 await page.goto(new URL('start.html',appUrl).href);
 await expect(page.locator('h1')).toBeVisible();
 await expect(page.locator('#tips article:visible')).toHaveCount(6);
 await page.locator('#phase-filter button[data-phase="pregnancy"]').click();
 await expect(page.locator('#tips article:visible')).toHaveCount(2);
 await expect(page.locator('#phase-filter button[data-phase="pregnancy"]')).toHaveAttribute('aria-pressed','true');
 await expect(page.locator('#filter-result')).toContainText('2');
 await page.locator('#phase-filter button[data-phase="planning"]').focus();await page.keyboard.press('Enter');
 await expect(page.locator('#tips article:visible')).toHaveCount(2);
 await expect(page.locator('#tips article:visible').first()).toContainText('Zeit und Geld');
 await page.locator('#phase-filter button[data-phase="all"]').click();
 await expect(page.locator('#tips article:visible')).toHaveCount(6);
 const faqs=page.locator('#fragen details');await expect(faqs).toHaveCount(5);
 for(const detail of await faqs.all())await detail.locator('summary').click();
 await expect(page.locator('#fragen')).toContainText('keine Analyse- oder Werbedienste');
 for(const link of await page.locator('a[target="_blank"]').all()){
  const url=new URL(await link.getAttribute('href'));expect(url.protocol).toBe('https:');expect(url.search).toBe('');
  await expect(link).toHaveAttribute('rel','noopener noreferrer');
 }
 const dimensions=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,view:innerWidth}));
 expect(dimensions.scroll).toBeLessThanOrEqual(dimensions.view+1);
 const scan=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa']).analyze();
 expect(scan.violations).toEqual([]);
 await writeFile(`qa/browser-accessibility-portal-${width}.json`,JSON.stringify([{width,violations:scan.violations}],null,2));
 await page.screenshot({path:testInfo.outputPath((width===390?'mobile':'desktop')+'-start-portal.png'),fullPage:true});
 expect(await page.evaluate(()=>localStorage.length)).toBe(0);
 expect(externalRequests).toEqual([]);
 await page.locator('.hero a.button[href="index.html"]').click();
 await expect(page.locator('#v38QuickStart')).toBeVisible();
 expect(new URL(page.url()).pathname).toBe(new URL(appUrl).pathname);
 expect(externalRequests).toEqual([]);
});

for(const width of [320,390])test(`V3.11 guided objective and Kita delay at ${width}px remain accessible and do not overwrite schedules`,async({page},testInfo)=>{
 await page.setViewportSize({width,height:820});
 const external=[];page.on('request',request=>{
  if(/^https?:/.test(request.url())&&new URL(request.url()).hostname!=='127.0.0.1')external.push(request.url());
 });
 await navigate(page,'slide-1');
 await page.locator('[data-v38-template="classic"]').click();
 await expect(page.locator('#v311GoalsTitle')).toHaveText('Was soll euer Familienplan erreichen?');
 const schedule=await page.evaluate(()=>JSON.stringify(window.__elternzeitTest.getState().schedule));
 await page.locator('#v311Priority').selectOption('balanced');
 await page.locator('#v311Care').selectOption('24');
 await page.locator('#v311CareMode').selectOption('partial');
 await page.locator('#v311GoalsSubmit').click();
 await expect(page.locator('#slide-goal')).toBeVisible();
 await expect(page.locator('#goalResult')).toContainText('Planvarianten konnten noch nicht geprüft werden');
 await expect(page.locator('#goalResult')).toContainText('Das Geburtsdatum liegt außerhalb');
 await expect(page.locator('#goalResult')).not.toContainText('Automatische Suche abgeschlossen');
 expect(await page.evaluate(()=>JSON.stringify(window.__elternzeitTest.getState().schedule))).toBe(schedule);
 expect(await page.evaluate(()=>localStorage.length)).toBe(0);
 if(await page.locator('#cancelGoalSearch').isVisible())await page.locator('#cancelGoalSearch').click();
 await navigate(page,'slide-1');
 const delay=page.locator('#v311KitaDelay');
 await expect(delay).toBeVisible();
 const baseline=await page.evaluate(()=>JSON.stringify(window.__elternzeitTest.getState()));
 await delay.selectOption('6');
 await expect(page.locator('#v311BridgeResult')).toContainText('LM 25');
 await expect(page.locator('#v311BridgeResult')).toContainText('nicht neu berechnet');
 expect(await page.evaluate(()=>JSON.stringify(window.__elternzeitTest.getState()))).toBe(baseline);
 const dimensions=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,width:innerWidth}));
 expect(dimensions.scroll).toBeLessThanOrEqual(dimensions.width+1);
 const axe=await new AxeBuilder({page}).include('#v311Goals').withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa']).analyze();
 expect(axe.violations.map(v=>v.id)).toEqual([]);
 await page.screenshot({path:testInfo.outputPath(`v311-goals-${width}.png`),fullPage:true});
 expect(external).toEqual([]);
});

for(const width of [320,390])test(`V3.12 explicit Kita financial counterfactual stays non-destructive at ${width}px`,async({page},testInfo)=>{
 await page.setViewportSize({width,height:820});
 await navigate(page,'slide-1');
 await page.locator('[data-v38-template="classic"]').click();
 await navigate(page,'slide-region');
 await page.locator('#childcareStart').selectOption('15');
 await navigate(page,'slide-2');
 await page.locator('#expenses').fill('1200');
 await navigate(page,'slide-goal');
 await page.locator('#goalCare').selectOption('18');
 await page.locator('#goalCareMode').selectOption('partial');
 await navigate(page,'slide-1');
 const before=await page.evaluate(()=>JSON.stringify(window.__elternzeitTest.getState()));
 await expect(page.locator('.v312-finance')).toBeVisible();
 await page.locator('.v312-finance summary').click();
 await page.locator('#v312LostWage').fill('300.55');
 await page.locator('#v312ExtraCare').fill('50.05');
 await page.locator('#v311KitaDelay').selectOption('3');
 await expect(page.locator('#v312ImpactResult')).toContainText('-1.051,80');
 await expect(page.locator('#v312ImpactResult')).toContainText('kein Zahlungsplan');
 await page.locator('#v312WaiveFees').check();
 await expect(page.locator('#v312ImpactResult')).toContainText('-151,80');
 expect(await page.evaluate(()=>JSON.stringify(window.__elternzeitTest.getState()))).toBe(before);
 expect(await page.evaluate(()=>localStorage.length)).toBe(0);
 const dims=await page.evaluate(()=>({width:innerWidth,scroll:document.documentElement.scrollWidth}));
 expect(dims.scroll).toBeLessThanOrEqual(dims.width+1);
 const axe=await new AxeBuilder({page}).include('.v312-finance').withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa']).analyze();
 expect(axe.violations.map(v=>v.id)).toEqual([]);
 await page.screenshot({path:testInfo.outputPath(`v312-kita-scenario-${width}.png`),fullPage:true});
});

test('V3.12 recorded calendar bookings stay separate from modeled entitlements and session reserve',async({page})=>{
 await navigate(page,'slide-axes');
 await page.locator('#bankDate').fill('2026-05-13');
 await page.locator('#bankAmount').fill('100');
 await page.locator('#bankCategory').selectOption('wage');
 await page.locator('#bankAdd').click();
 await page.locator('#bankDate').fill('2026-07-13');
 await page.locator('#bankAmount').fill('-150.25');
 await page.locator('#bankCategory').selectOption('childcare');
 await page.locator('#bankAdd').click();
 const state=await page.evaluate(()=>JSON.stringify(window.__elternzeitTest.getState()));
 await expect(page.locator('#bankSummary')).toContainText('2026-06');
 await expect(page.locator('#bankSummary')).toContainText('Keine Buchungen erfasst');
 await expect(page.locator('#bankSummary')).toContainText('Ohne ausdrücklich eingegebene Anfangsrücklage');
 await page.locator('#recordedOpeningReserve').fill('0');
 await expect(page.locator('#bankSummary')).toContainText('Der Rechensaldo ist ab 2026-07 zeitweise negativ');
 await expect(page.locator('#bankSummary')).toContainText('keine Kontostands- oder Liquiditätsprognose');
 expect(await page.evaluate(()=>JSON.stringify(window.__elternzeitTest.getState()))).toBe(state);
 expect(await page.evaluate(()=>localStorage.length)).toBe(0);
});

for(const width of [320,390])test(`V3.13 manual payment timing and risk guidance remain offline and mobile at ${width}px`,async({page},testInfo)=>{
 await page.setViewportSize({width,height:820});
 await navigate(page,'slide-axes');
 const state=await page.evaluate(()=>JSON.stringify(window.__elternzeitTest.getState()));
 await page.locator('#v313PaymentDate').fill('2026-06-05');
 await page.locator('#v313PaymentAmount').fill('1000');
 await page.locator('#v313PaymentDirection').selectOption('incoming');
 await page.locator('#v313PaymentAdd').click();
 await page.locator('#v313PaymentDate').fill('2026-06-06');
 await page.locator('#v313PaymentAmount').fill('800');
 await page.locator('#v313PaymentDirection').selectOption('outgoing');
 await page.locator('#v313PaymentCategory').selectOption('household');
 await page.locator('#v313PaymentAdd').click();
 await page.locator('#v313Delay').selectOption('7');
 await expect(page.locator('#v313PaymentResults')).toContainText('800,00');
 await expect(page.locator('#v313PaymentResults')).toContainText('2026-06-12');
 await page.locator('#v313Opening').fill('100');
 await expect(page.locator('#v313PaymentResults')).toContainText('niedrigste rechnerische Zwischensaldo');
 await expect(page.locator('#bankSummary')).toContainText('Keine tatsächlichen Zahlungseingänge');
 expect(await page.evaluate(()=>JSON.stringify(window.__elternzeitTest.getState()))).toBe(state);
 expect(await page.evaluate(()=>localStorage.length)).toBe(0);
 const axe1=await new AxeBuilder({page}).include('.v313-payment').withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa']).analyze();
 expect(axe1.violations.map(v=>v.id)).toEqual([]);
 await page.screenshot({path:testInfo.outputPath(`v313-payment-${width}.png`),fullPage:true});
 await navigate(page,'slide-risk');
 await page.locator('#v313InsuranceType').selectOption('private');
 await expect(page.locator('#v313FinanceResults')).toContainText('Arbeitgeberzuschuss');
 await expect(page.locator('#v313FinanceResults')).toContainText('Progressionsvorbehalt');
 const axe2=await new AxeBuilder({page}).include('.v313-finance').withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa']).analyze();
 expect(axe2.violations.map(v=>v.id)).toEqual([]);
 const dims=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,window:innerWidth}));
 expect(dims.scroll).toBeLessThanOrEqual(dims.window+1);
});

test('V3.13 export calendar contains only tentative checklists; unsupported import schema cannot change plan',async({page},testInfo)=>{
 await standardInputs(page);
 await navigate(page,'slide-9');
 const download=page.waitForEvent('download');
 await page.locator('#v313DownloadIcs').click();
 const artifact=await download;
 const f=testInfo.outputPath('unverbindliche-fristen.ics');
 await artifact.saveAs(f);
 const ics=await readFile(f,'utf8');
 expect(ics).toContain('BEGIN:VCALENDAR');
 expect(ics).toContain('STATUS:TENTATIVE');
 expect(ics).toContain('DTSTART;VALUE=DATE:');
 expect(ics).toContain('END:VCALENDAR');
 const baseline=await page.evaluate(()=>JSON.stringify(window.__elternzeitTest.getState()));
 const alerts=[];page.on('dialog',async dialog=>{alerts.push(dialog.message());await dialog.accept();});
 const raw=await page.evaluate(()=>({fileType:'elternzeit-offline-v3',schemaVersion:2,data:window.__elternzeitTest.getState()}));
 await page.locator('#importJson').setInputFiles({name:'future.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(raw))});
 await expect.poll(()=>alerts.length).toBe(1);
 expect(alerts[0]).toContain('Unbekannte JSON-Schemaversion');
 expect(await page.evaluate(()=>JSON.stringify(window.__elternzeitTest.getState()))).toBe(baseline);
});

test('V3.13 Cologne snapshot preview is dated and does not alter manually entered Kita fees',async({page})=>{
 await navigate(page,'slide-2');
 await page.locator('#date').fill('2026-05-28');
 await page.locator('#date').blur();
 await navigate(page,'slide-region');
 await page.locator('#childcareStart').selectOption('19');
 await page.locator('#childcareMonthly').fill('313');
 await page.locator('#childcareMonthly').blur();
 const before=await page.evaluate(()=>window.__elternzeitTest.evaluate().rows[18].childcare);
 await page.locator('#childcareMode').selectOption('cologne2025');
 await expect(page.locator('#v313ColognePreview')).toBeVisible();
 await expect(page.locator('#v313ColognePreview')).toContainText('Historische Tarif-Orientierung');
 await expect(page.locator('#v313ColognePreview')).toContainText('2027/2028');
 const after=await page.evaluate(()=>window.__elternzeitTest.evaluate().rows[18].childcare);
 expect(after).toBe(before);
 await page.locator('#region').selectOption('BY');
 await expect(page.locator('#v313ColognePreview')).toBeHidden();
});

for(const width of [320,390])test(`V3.14 manual premium and tax allocation stays local at ${width}px`,async({page},testInfo)=>{
 await page.setViewportSize({width,height:820});
 await navigate(page,'slide-1');
 await page.locator('[data-v38-template="classic"]').click();
 await navigate(page,'slide-2');
 await page.locator('#expenses').fill('1200');
 await page.locator('#expenses').blur();
 await navigate(page,'slide-risk');
 const original=await page.evaluate(()=>JSON.stringify(window.__elternzeitTest.getState()));
 await page.locator('.v314-cost-buffer summary').click();
 await page.locator('#v313InsuranceIncluded').selectOption('no');
 await page.locator('#v314InsuranceExtra').fill('175.25');
 await page.locator('#v314TaxExtra').fill('90.50');
 await expect(page.locator('#v314CostResult')).toContainText('Zusätzlich selbst angesetzt');
 await expect(page.locator('#v314CostResult')).toContainText('Keine Steuer- oder Beitragsberechnung');
 const a=await new AxeBuilder({page}).include('.v314-cost-buffer').withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa']).analyze();
 expect(a.violations.map(x=>x.id)).toEqual([]);
 await page.locator('#v313InsuranceIncluded').selectOption('yes');
 await expect(page.locator('#v314CostResult')).toContainText('nicht doppelt ansetzen');
 expect(await page.evaluate(()=>JSON.stringify(window.__elternzeitTest.getState()))).toBe(original);
 expect(await page.evaluate(()=>localStorage.length)).toBe(0);
 const dimensions=await page.evaluate(()=>({scrollWidth:document.documentElement.scrollWidth,innerWidth}));
 expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.innerWidth+1);
 await page.screenshot({path:testInfo.outputPath(`v314-manual-cost-${width}.png`),fullPage:true});
});

test('V3.14 goal search reports bounded counts and never global completeness',async({page})=>{
 test.setTimeout(90000);
 await standardInputs(page);
 await navigate(page,'slide-region');
 await page.locator('#childcareStart').selectOption('15');
 await navigate(page,'slide-goal');
 await page.locator('#goalCare').selectOption('18');
 await page.locator('#runGoal').click();
 await expect(page.locator('#runGoal')).toBeEnabled({timeout:75000});
 const stats=await page.evaluate(()=>window.__elternzeitV3.goalStatistics());
 expect(stats.generated).toBeGreaterThan(0);
 expect(stats.seen).toBeGreaterThan(0);
 expect(stats.generated).toBeGreaterThanOrEqual(stats.seen);
 expect(stats.valid).toBeLessThanOrEqual(stats.seen);
 expect(stats.valid+Object.values(stats.rejected).reduce((a,b)=>a+b,0)).toBe(stats.seen);
 await expect(page.locator('#goalResult')).toContainText('Suchfenster:');
 await expect(page.locator('#goalResult')).toContainText('Drei Perspektiven');
 await expect(page.locator('#goalResult')).toContainText('Weniger Rücklagenrisiko');
 await expect(page.locator('#goalResult')).toContainText('welcher Anteil aller denkbaren');
 expect(await page.evaluate(()=>window.__elternzeitV3.goalResults().every(x=>x.valid))).toBe(true);
});

for(const width of [320,390])test(`V3.15 Kita transition, NRW source cohorts and local-only assumptions at ${width}px`,async({page},testInfo)=>{
 await page.setViewportSize({width,height:844});
 await standardInputs(page);
 await page.locator('#childcareStart').selectOption('18');
 await expect(page.locator('#v315KibizResult')).toContainText('Verkündet, ab 01.08.2027 künftig wirksam');
 await expect(page.locator('#v315KibizResult')).toContainText('Keine individuelle Beitragsfreigabe');
 const original=await page.evaluate(()=>JSON.stringify(window.__elternzeitTest.getState()));
 await page.locator('#v315CarePreset').selectOption('late');
 await expect(page.locator('#v315CareResult')).toContainText('angenommene volle Wochenbetreuung');
 await page.locator('#v315WorkHours').fill('28');
 await page.locator('#v315BackupHours').fill('8');
 await page.locator('#v315BackupCost').fill('12');
 await page.locator('#v315NetRisk').fill('560');
 await expect(page.locator('#v315CareResult')).toContainText('zusätzliche Finanzbelastung');
 expect(await page.evaluate(()=>JSON.stringify(window.__elternzeitTest.getState()))).toBe(original);
 expect(await page.evaluate(()=>localStorage.length)).toBe(0);
 const violations=await new AxeBuilder({page}).include('.v315-care').withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa']).analyze();
 expect(violations.violations.map(v=>v.id)).toEqual([]);
 const dims=await page.evaluate(()=>({page:document.documentElement.scrollWidth,view:window.innerWidth}));
 expect(dims.page).toBeLessThanOrEqual(dims.view+1);
 await page.screenshot({path:testInfo.outputPath(`v315-transition-${width}.png`),fullPage:true});
});

test('V3.15 NRW 2026 versus promulgated 2027 stays dated and historic Cologne fees never enter budget',async({page})=>{
 await standardInputs(page);
 await page.locator('#childcareStart').selectOption('12');
 await expect(page.locator('#v315KibizResult')).toContainText('Fassung zum geplanten Kita-Beginn bereits in Kraft');
 await expect(page.locator('#v315KibizResult')).toContainText('28.10.2026');
 const original=await page.evaluate(()=>window.__elternzeitTest.evaluate().rows[11].childcare);
 await page.locator('#childcareMode').selectOption('cologne2025');
 expect(await page.evaluate(()=>window.__elternzeitTest.evaluate().rows[11].childcare)).toBe(original);
 await page.locator('#childcareStart').selectOption('18');
 await expect(page.locator('#v315KibizResult')).toContainText('Verkündet, ab 01.08.2027 künftig wirksam');
 await expect(page.locator('#v313ColognePreview')).toContainText('NICHT ins Budget übernommen');
});

test('V3.15 local checklist status excludes own completed tasks from tentative ICS without official submission',async({page},testInfo)=>{
 await standardInputs(page);
 await page.locator('#childcareStart').selectOption('12');
 await navigate(page,'slide-9');
 const task=page.locator('#applicationChecklist [data-v315-task="nrw-childcare-notice"]');
 await expect(task).toBeVisible();
 await task.focus();
 await task.selectOption('done');
 await expect(page.locator('#applicationChecklist [data-v315-task="nrw-childcare-notice"]')).toBeFocused();
 await expect(page.locator('#applicationChecklist')).toContainText('selbst als erledigt markiert');
 const download=page.waitForEvent('download');
 await page.locator('#v313DownloadIcs').click();
 const item=await download,file=testInfo.outputPath('offene-fristen.ics');
 await item.saveAs(file);
 const ics=await readFile(file,'utf8');
 expect(ics).toContain('BEGIN:VCALENDAR');
 expect(ics).toContain('STATUS:TENTATIVE');
 expect(ics).not.toContain('NRW-Kita-Betreuungsbedarf beim Jugendamt anzeigen');
 expect(ics).toContain('Elterngeldantrag');
 await navigate(page,'slide-region');
 await page.locator('#childcareStart').selectOption('18');
 await navigate(page,'slide-9');
 await expect(page.locator('#applicationChecklist [data-v315-task="nrw-childcare-notice"]')).toHaveValue('open');
 expect(await page.evaluate(()=>localStorage.length)).toBe(0);
});

test('V3.15 KiZ document navigator uses the six prior calendar months without assigning fictitious grants',async({page})=>{
 await standardInputs(page);
 const before=await page.evaluate(()=>JSON.stringify(window.__elternzeitTest.getState()));
 await page.locator('.v315-benefits summary').click();
 await page.locator('#v315BenefitDate').fill('2027-02-28');
 await expect(page.locator('#v315BenefitsResult')).toContainText('2026-08, 2026-09, 2026-10, 2026-11, 2026-12, 2027-01');
 await page.locator('#v315KiZAlready').selectOption('yes');
 await expect(page.locator('#v315BenefitsResult')).toContainText('Folgeanträgen');
 await expect(page.locator('#v315BenefitsResult')).not.toContainText('2026-08, 2026-09');
 expect(await page.evaluate(()=>JSON.stringify(window.__elternzeitTest.getState()))).toBe(before);
 const scan=await new AxeBuilder({page}).include('.v315-benefits').withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa']).analyze();
 expect(scan.violations.map(v=>v.id)).toEqual([]);
});

test('V3.15 beginner can open settling-in planner without enabling all expert views',async({page})=>{
 // The global beforeEach activates expert mode; deliberately return to lite.
 await page.locator('#v38Advanced').click();
 await expect(page.locator('#v38Advanced')).toHaveAttribute('aria-pressed','false');
 await page.locator('#v315CareJump').click();
 await expect(page.locator('#slide-region')).toBeVisible();
 await expect(page.locator('#slide-region h2')).toBeFocused();
 await expect(page.locator('#v315CarePreset')).toBeVisible();
 await expect(page.locator('#v38Advanced')).toHaveAttribute('aria-pressed','false');
 await page.locator('#v315CareBack').click();
 await expect(page.locator('#slide-1')).toBeVisible();
 await expect(page.locator('#v38Advanced')).toHaveAttribute('aria-pressed','false');
});
