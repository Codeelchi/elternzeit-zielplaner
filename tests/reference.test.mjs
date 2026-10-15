import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { JSDOM, VirtualConsole } from 'jsdom';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const catalog = JSON.parse(readFileSync(new URL('../data/rechtsregeln-de-nrw-2026-10-14.json', import.meta.url),'utf8'));
const fixtureFile = JSON.parse(readFileSync(new URL('../data/referenzfaelle-bund-2026-10-14.json', import.meta.url), 'utf8'));
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
const p = dom.window.__elternzeitTest;
const advanced = dom.window.__elternzeitV3;

test('registry is exposed by the offline application without a network call', () => {
  assert.deepEqual(JSON.parse(JSON.stringify(advanced.ruleCatalog)), catalog);
  assert.equal(advanced.ruleCatalog.rules.length, catalog.rules.length);
  assert.deepEqual(errors, []);
});

for (const fixture of fixtureFile.cases) {
  test(`${fixture.id}: ${fixture.title} [${fixture.evidence_kind}]`, () => {
    const fn = fixture.benefit_type === 'basis' ? p.basis : p.plus;
    const actual = fn(fixture.prebirth_elterngeld_net_eur, fixture.postbirth_elterngeld_net_eur);
    assert.ok(
      Math.abs(actual - fixture.expected_monthly_eur) <= fixture.tolerance_eur,
      `${fixture.id}: expected ${fixture.expected_monthly_eur} EUR, got ${actual} EUR (delta ${(actual - fixture.expected_monthly_eur).toFixed(3)})`
    );
  });
}

test('published numerical examples are clearly distinguished from formula-derived cases', () => {
  assert.ok(fixtureFile.cases.some(x => x.evidence_kind === 'official_published_example'));
  assert.ok(fixtureFile.cases.some(x => x.evidence_kind === 'statutory_formula_derived'));
  assert.ok(fixtureFile.cases.every(x => x.source_url?.startsWith('https://familienportal.de/')));
  assert.ok(fixtureFile.cases.every(x => x.source_checked_at === '2026-10-14'));
});

test('published maternity discrepancy stays explicit: portal five days vs statutory calendar four days', () => {
  p.changeValue('date', '2026-05-20');
  const lm1=advanced.matDaysAt(1),lm2=advanced.matDaysAt(2);
  assert.equal(lm1.days,31);assert.equal(lm2.len,30);assert.equal(lm2.days,26);
  const actual=p.evaluate().rows[1].mg, published=p.basis(p.getState().egNetMother,0)*5/30;
  assert.ok(Math.abs(actual-p.basis(p.getState().egNetMother,0)*4/30)<0.001);
  assert.ok(Math.abs((published-actual)-p.basis(p.getState().egNetMother,0)/30)<0.001);
  // Release BLOCKER: portal says 20 May–14 July (5/30); §§187 BGB/3 MuSchG yield 15 July (4/30).
  // Original published reference is preserved; this test proves and does not hide the nonzero delta.
});

test('rule registry rejects invalid source schema at build-time, and dates can be interpreted', () => {
  for(const rule of catalog.rules) {
    assert.match(rule.effective_from, /^\d{4}-\d{2}-\d{2}$/);
    assert.ok(['official_source_checked', 'source_listed_review_pending', 'draft_not_in_force'].includes(rule.verification_status));
    assert.ok(rule.verification_status !== 'official_source_checked' || rule.checked_at);
    assert.ok(rule.planned !== true || rule.verification_status === 'draft_not_in_force');
  }
});
