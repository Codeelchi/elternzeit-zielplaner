import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {JSDOM,VirtualConsole} from 'jsdom';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const {buildApplicationGuide}=require('../src/application-guide.cjs');
const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');
function setup(){
 const errors=[],vc=new VirtualConsole();vc.on('jsdomError',e=>errors.push(e.message));
 const dom=new JSDOM(html,{url:'https://elternzeit.local/',runScripts:'dangerously',pretendToBeVisual:true,
   virtualConsole:vc,beforeParse(w){w.scrollTo=()=>{};w.alert=()=>{};w.confirm=()=>true;
   w.URL.createObjectURL=()=>'';w.URL.revokeObjectURL=()=>{};}});
 const d=dom.window.document,api=dom.window.__elternzeitTest;
 assert.ok(api,'offline boot');
 d.querySelector('[data-v38-template="classic"]').click();
 function change(id,value,type='input') {
  const el=d.getElementById(id);assert.ok(el,id);el.value=String(value);
  el.dispatchEvent(new dom.window.Event(type,{bubbles:true}));
 }
 return {dom,d,api,change,errors};
}
test('KiBiz 2026 and promulgated 2027 law show separate dates, no future municipal fee in model',()=>{
 const {dom,d,api,errors}=setup();
 api.changeValue('date','2026-05-28');api.changeValue('childcareStart',12);
 assert.match(d.getElementById('v315KibizResult').textContent,/Fassung zum geplanten Kita-Beginn bereits in Kraft/);
 assert.match(d.getElementById('v315KibizResult').textContent,/28\.10\.2026/);
 api.changeValue('childcareStart',18);
 assert.match(d.getElementById('v315KibizResult').textContent,/Verkündet, ab 01\.08\.2027 künftig wirksam/);
 assert.match(d.getElementById('v315KibizResult').textContent,/Bedarfsanzeige grundsätzlich bis/);
 assert.match(d.getElementById('v315KibizResult').textContent,/Keine individuelle Beitragsfreigabe/);
 assert.equal(api.evaluate().rows[17].childcare,300);
 assert.deepEqual(errors,[]);
 dom.window.close();
});
test('presets and personal weekly risk show usable dates without editing the saved legal model',()=>{
 const {dom,d,api,change,errors}=setup();
 api.changeValue('date','2026-05-28');api.changeValue('childcareStart',19);
 const before=JSON.stringify(api.getState());
 change('v315CarePreset','late','change');
 assert.match(d.getElementById('v315CareResult').textContent,/12\.12\.2027/);
 assert.match(d.getElementById('v315CareResult').textContent,/Arbeitsstunden rechnerisch unbetreut/);
 change('v315NetRisk','560');
 change('v315BackupHours','8');
 change('v315BackupCost','12');
 assert.match(d.getElementById('v315CareResult').textContent,/Mehrbelastung während der 6 Übergangswochen/);
 assert.equal(api.getState().bankLedger.length,0);
 assert.equal(JSON.stringify(api.getState()),before);
 assert.equal(dom.window.localStorage.length,0);
 assert.equal(dom.window.__elternzeitV3.settlingScenario().delayWeeks,'2');
 assert.deepEqual(errors,[]);
 dom.window.close();
});
test('unknown income at risk does not generate phantom zeros or amounts',()=>{
 const {dom,d,api,change}=setup();
 change('v315CarePreset','long','change');
 assert.match(d.getElementById('v315CareResult').textContent,/Keine vollständige Euro-Schätzung/);
 assert.match(d.getElementById('v315CareResult').textContent,/Unbekannt/);
 api.changeValue('childcareStart',0);
 assert.match(d.getElementById('v315CareResult').textContent,/Zuerst einen geplanten Kita-Start/);
 dom.window.close();
});
test('invalid and overprecise risk input yields accessible error and no silent calculation',()=>{
 const {dom,d,change}=setup();
 change('v315NetRisk','1.001');
 assert.equal(d.getElementById('v315CareResult').querySelector('[role="alert"]')!==null,true);
 assert.match(d.getElementById('v315CareResult').textContent,/Nachkommastellen/);
 dom.window.close();
});
test('KiZ navigator builds last six calendar months and official links, never credits income',()=>{
 const {dom,d,api,change}=setup();
 const state=JSON.stringify(api.getState());
 change('v315BenefitDate','2027-02-28','change');
 assert.match(d.getElementById('v315BenefitsResult').textContent,/2026-08, 2026-09, 2026-10, 2026-11, 2026-12, 2027-01/);
 change('v315KiZAlready','yes','change');
 assert.match(d.getElementById('v315BenefitsResult').textContent,/Folgeanträgen/);
 assert.doesNotMatch(d.getElementById('v315BenefitsResult').textContent,/2026-08, 2026-09/);
 assert.ok([...d.querySelectorAll('#v315BenefitsResult a')].some(a=>a.href.includes('arbeitsagentur.de')));
 assert.equal(JSON.stringify(api.getState()),state);
 dom.window.close();
});
test('own application checklist marks are non-official, survive re-render and reset',()=>{
 const {dom,d,api,change,errors}=setup();
 api.changeValue('date','2026-05-28');api.changeValue('childcareStart',12);
 const record=d.querySelector('#applicationChecklist [data-v315-task="nrw-childcare-notice"]');
 assert.ok(record,'Kita notice now covers 2026 cohorts');
 assert.match(d.getElementById('applicationChecklist').textContent,/2026/);
 const stateBefore=JSON.stringify(api.getState());
 record.focus();
 change(record.id,'done','change');
 assert.equal(d.activeElement?.id,record.id);
 assert.match(d.getElementById('applicationChecklist').textContent,/selbst als erledigt markiert/);
 assert.equal(d.querySelector('#applicationChecklist [data-v315-task="nrw-childcare-notice"]').value,'done');
 api.changeValue('city','Köln');
 assert.equal(d.querySelector('#applicationChecklist [data-v315-task="nrw-childcare-notice"]').value,'done');
 assert.equal(JSON.stringify(api.getState()),stateBefore);
 // Changing the underlying deadline must not reuse the old completion marker.
 api.changeValue('childcareStart',18);
 assert.equal(d.querySelector('#applicationChecklist [data-v315-task="nrw-childcare-notice"]').value,'open');
 d.getElementById('btnReset').click();
 assert.equal(d.querySelector('#applicationChecklist [data-v315-task="nrw-childcare-notice"]')?.value??'open','open');
 assert.equal(d.getElementById('v315NetRisk').value,'');
 assert.deepEqual(errors,[]);
 dom.window.close();
});
test('standalone application guide includes 2026 and 2027 NRW tasks without fabricated confirmed fee',()=>{
 const v26=buildApplicationGuide({birthDate:'2026-05-28',childcareStartLm:12});
 const v27=buildApplicationGuide({birthDate:'2026-05-28',childcareStartLm:18});
 const notice26=v26.tasks.find(x=>x.id==='nrw-childcare-notice');
 const notice27=v27.tasks.find(x=>x.id==='nrw-childcare-notice');
 assert.equal(notice26.dueDate,'2026-10-28');
 assert.equal(notice26.legal_status,'effective');
 assert.equal(notice27.legal_status,'promulgated_future_effective');
 assert.ok(v27.tasks.some(t=>t.id==='nrw-childcare-fee-check'&&t.dueDate===null));
});

test('work return and Kita hours are independent from Cologne tariff without mutating model',()=>{
 const {dom,d,api,change,errors}=setup();
 api.changeValue('date','2026-05-28');api.changeValue('childcareStart',19);
 const before=JSON.stringify(api.getState());
 change('v315CarePreset','late','change');
 change('v315TargetHours','25');
 change('v315WorkReturnWeeks','6');
 change('v315NetRisk','560');
 change('v315BackupHours','0');
 change('v315BackupCost','0');
 const report=d.getElementById('v315CareResult');
 assert.match(report.textContent,/geplanter Arbeitsbeginn: 09\.01\.2028/);
 assert.match(report.textContent,/Während der 6 Übergangswochen bleiben 0 Arbeitsstunden/);
 assert.match(report.textContent,/Mehrbelastung während der 6 Übergangswochen: 0/);
 assert.match(report.textContent,/Dauerhafte Betreuungslücke/);
 assert.match(report.textContent,/3 Arbeitsstunden/);
 assert.equal(api.getState().childcareHours,35,'tariff hours not changed');
 assert.equal(JSON.stringify(api.getState()),before);
 assert.deepEqual(errors,[]);
 dom.window.close();
});
test('zero transition does not present regular childcare gap as one-off cost',()=>{
 const {dom,d,change}=setup();
 change('v315CarePreset','immediate','change');
 change('v315TargetHours','25');
 change('v315NetRisk','560');
 change('v315BackupCost','0');
 const text=d.getElementById('v315CareResult').textContent;
 assert.match(text,/0 Übergangswochen/);
 assert.match(text,/Regelwoche – nur Vorschau/);
 assert.match(text,/Dauerhafte Betreuungslücke/);
 assert.match(text,/Keine Übergangswoche/);
 assert.match(text,/0 €/);
 dom.window.close();
});
test('legacy imported plan resets nonexported weekly return assumptions',()=>{
 const {dom,d,api,change,errors}=setup();
 const before=JSON.stringify(api.getState());
 change('v315WorkReturnWeeks','10');
 change('v315TargetHours','45');
 assert.equal(api.getState().childcareHours,35);
 assert.equal(JSON.stringify(api.getState()),before);
 d.getElementById('btnReset').click();
 assert.equal(d.getElementById('v315WorkReturnWeeks').value,'0');
 assert.equal(d.getElementById('v315TargetHours').value,'35');
 assert.deepEqual(errors,[]);
 dom.window.close();
});

test('V3.15.2 controlled Kita delay sensitivities compare fixed return dates without storing them',()=>{
 const {dom,d,api,change,errors}=setup();
 api.changeValue('date','2026-05-28');api.changeValue('childcareStart',19);
 const original=JSON.stringify(api.getState());
 change('v315CarePreset','late','change');
 change('v315BackupHours','8');change('v315BackupCost','12');change('v315NetRisk','560');
 const view=d.getElementById('v315CareResult'),details=view.querySelector('.v315-resilience');
 assert.ok(details);
 const text=details.textContent;
 assert.match(text,/Kita 2 Wochen später/);
 assert.match(text,/Kita 4 Wochen später/);
 assert.match(text,/Mehr als eigene Annahme/);
 assert.match(text,/992 €/);
 assert.match(text,/1\.984 €/);
 assert.match(text,/Nicht berechenbar/);
 assert.equal(JSON.stringify(api.getState()),original);
 assert.equal(dom.window.localStorage.length,0);
 assert.deepEqual(errors,[]);
 dom.window.close();
});
test('V3.15.2 unknown cash and skipped variants remain explicitly incomplete',()=>{
 const {dom,d,change}=setup();
 change('v315DelayWeeks','11');
 const text=d.querySelector('.v315-resilience').textContent;
 assert.match(text,/zusätzliche Varianten ausgelassen/);
 assert.doesNotMatch(text,/Kita 4 Wochen später/);
 assert.match(text,/Unbekannt/);
 assert.match(text,/Nicht berechenbar/);
 dom.window.close();
});
