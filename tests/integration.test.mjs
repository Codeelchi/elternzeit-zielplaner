import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { JSDOM, VirtualConsole } from 'jsdom';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');

function setup(){
  const virtualConsole = new VirtualConsole();
  const scriptErrors = [];
  virtualConsole.on('jsdomError', err=>scriptErrors.push(err.message));
  const dom = new JSDOM(html, {
    url:'https://elternzeit.local/',runScripts:'dangerously',pretendToBeVisual:true,
    virtualConsole,
    beforeParse(window){
      window.scrollTo = () => {};
      window.alert = () => {};
      window.URL.createObjectURL = () => 'blob:local';
      window.URL.revokeObjectURL = () => {};
    }
  });
  return {dom,scriptErrors,ui:dom.window.__elternzeitTest,app:dom.window.__elternzeitV3};
}
test('full monthly evaluation matches two independently published benefit amounts',()=>{
  const {dom,ui,app,scriptErrors}=setup();
  ui.changeValue('egNetFather',2000);
  ui.changeValue('netFather',2000);
  ui.changeValue('ptNetFather',500);
  ui.changeValue('egPtNetFather',500);
  ui.changeValue('hoursFather',28);
  const schedule=ui.SCENARIOS.find(x=>x.id==='hybridWork');
  assert.ok(schedule);
  const calc=ui.modelPlan('hybridWork');
  assert.equal(calc.valid,true,calc.errors.join('; '));
  assert.ok(Math.abs(calc.rows[2].fg-1300)<.015,'father basis LM3 = 1300');
  assert.ok(Math.abs(calc.rows[10].fg-650)<.015,'father plus+part time LM11 = 650');
  assert.equal(calc.rows[10].fi,500,'part time pay differs from Elterngeld');
  assert.deepEqual(scriptErrors,[]);
  dom.window.close();
});

test('variable weekly hours are averaged within a Plus income cohort',()=>{
  const {dom,ui,app}=setup();
  ui.changeValue('egNetFather',2000);
  ui.changeValue('ptNetFather',1500);
  ui.changeValue('egPtNetFather',1500);
  ui.changeValue('hoursFather',28);
  const schedule=Array.from({length:36},(_,i)=>({f:'W',m:i<2?'MS':'W'}));
  // Four Plus months in LM 11-14 (no later continuity requirement).
  schedule[10]={f:'T',m:'W',hf:20};
  schedule[11]={f:'T',m:'W',hf:32};
  schedule[12]={f:'T',m:'W',hf:28};
  schedule[13]={f:'T',m:'W',hf:28};
  const calc=app.evaluate(schedule);
  assert.equal(calc.valid,true,calc.errors.join('; '));
  const expectedMean=1500*(20+32+28+28)/4/28;
  const expectedPlus=ui.plus(2000,expectedMean);
  for (const lm of [11,12,13,14]) assert.ok(Math.abs(calc.rows[lm-1].fg-expectedPlus)<.015);
  assert.ok(calc.rows[10].fi<calc.rows[11].fi);
  dom.window.close();
});

test('the date-bound rule catalog never identifies drafts as currently in force',()=>{
  const {dom,app}=setup();
  const drafts=app.ruleCatalog.rules.filter(x=>x.planned);
  assert.ok(drafts.length>=1);
  for(const r of drafts){
    assert.equal(r.verification_status,'draft_not_in_force');
  }
  assert.ok(app.ruleCatalog.rules.every(x=>x.effective_from&&x.verification_status));
  dom.window.close();
});

test('birth in 2027 is explicitly flagged as later than the legal source-check date',()=>{
  const {dom,ui,app}=setup();
  const active=dom.window.document.getElementById('ruleItems').textContent;
  assert.match(active,/Geburtsjahr nach Prüfstand/);
  assert.match(ui.evaluate().notices.join(' '),/Geburtsjahr liegt nach dem Quellenprüfstand/);
  dom.window.close();
});
