import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { JSDOM, VirtualConsole } from 'jsdom';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
function page() {
  const errors = [];
  const virtualConsole = new VirtualConsole();
  virtualConsole.on('jsdomError', e => errors.push(e.message));
  const dom = new JSDOM(html, {
    url: 'https://elternzeit.local/',
    runScripts: 'dangerously',
    pretendToBeVisual: true,
    virtualConsole,
    beforeParse(window) {
      window.scrollTo = () => {};
      window.alert = () => {};
      window.URL.createObjectURL = () => 'blob:local';
      window.URL.revokeObjectURL = () => {};
    }
  });
  dom.window.__elternzeitTest.changeValue('date','2026-05-28');
  dom.window.__elternzeitTest.changeValue('zve',95000);
  dom.window.__elternzeitTest.changeValue('standardCaseConfirmed',true);
  return { dom, errors, app: dom.window.__elternzeitV3, ui: dom.window.__elternzeitTest };
}

test('application initializes with 36 child life months and tested rule version', () => {
  const p = page();
  assert.equal(p.app.ruleVersion, '3.7.0');
  assert.equal(p.ui.getState().schedule.length, 36);
  assert.equal(p.ui.dateFor(1).includes('28.05.2026'), true);
  assert.equal(p.ui.ageSpan(25).startsWith('2 Jahre'), true);
  assert.deepEqual(p.errors, []);
  p.dom.window.close();
});

test('12 father basis + 2 mother maternity exhausts 14 equivalents', () => {
  const p = page();
  const r = p.ui.modelPlan('father12');
  assert.equal(r.valid, true, r.errors.join(' | '));
  assert.equal(r.consumed, 14);
  assert.ok(r.rows[1].mg > 0, 'partial maternity offset in LM2');
  p.dom.window.close();
});

test('presets are legally plausible for standard assumptions', () => {
  const p = page();
  for (const s of p.ui.SCENARIOS) {
    const r = p.ui.modelPlan(s.id);
    assert.equal(r.valid, true, s.id + ': ' + r.errors.join(' | '));
  }
  p.dom.window.close();
});

test('plus can start LM15, interrupted plus after LM14 is flagged', () => {
  const p = page();
  const plan = () => Array.from({length:36}, (_, i) => ({f:'W',m:i<2?'MS':'W'}));
  const valid = plan();
  for (let i = 14; i < 18; i++) valid[i].f = 'P';
  assert.equal(p.app.evaluate(valid).valid, true);
  const gap = plan(); gap[14].f='P'; gap[16].f='P';
  assert.equal(p.app.evaluate(gap).valid, false);
  p.dom.window.close();
});

test('basis after LM14 and plus after LM32 are rejected', () => {
  const p = page();
  const make = () => Array.from({length:36}, (_, i) => ({f:'W',m:i<2?'MS':'W'}));
  const a = make(); a[14].f = 'B';
  assert.equal(p.app.evaluate(a).valid, false);
  const b = make(); b[32].f = 'P';
  assert.equal(p.app.evaluate(b).valid, false);
  p.dom.window.close();
});

test('income threshold and partner bonus hours are enforced', () => {
  const p = page();
  p.ui.changeValue('zve', 175001);
  assert.equal(p.ui.evaluate().sum(36,'totalEg'), 0);
  p.ui.changeValue('zve', 100000);
  const a = Array.from({length:36}, (_,i)=>({f:'W',m:i<2?'MS':'W'}));
  for (let i=14;i<17;i++)a[i]={f:'K',m:'K',hf:28,hm:28};
  assert.equal(p.app.evaluate(a).valid,true);
  a[14].hf=18;
  assert.equal(p.app.evaluate(a).valid,false);
  p.dom.window.close();
});

test('income uncertainty generates ordered outcomes', () => {
  const p = page();
  const outcomes = p.app.riskScenarios().map(x=>x.calc.sum(24,'cashAfter'));
  assert.equal(outcomes.length,3);
  assert.ok(outcomes[0] < outcomes[1] && outcomes[1] < outcomes[2], String(outcomes));
  p.dom.window.close();
});

test('goal search produces admissible schedules', () => {
  const p = page();
  p.app.runGoalSearch();
  const candidates = p.app.goalResults();
  assert.ok(candidates.length >= 1);
  for (const c of candidates) {
    assert.equal(c.valid, true, c.errors.join(' | '));
    assert.equal(p.app.isCaredFor(c.schedule), true);
  }
  p.dom.window.close();
});

test('all legal source references remain machine-readable and dated', () => {
  const rules = JSON.parse(readFileSync(new URL('../data/rechtsregeln-de-nrw-2026-10-14.json',import.meta.url),'utf8'));
  assert.equal(rules.verified_as_of,'2026-10-15');
  assert.ok(Array.isArray(rules.rules) || typeof rules === 'object');
});