import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {JSDOM, VirtualConsole} from 'jsdom';

const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');
function make(){
 const errors=[],virtualConsole=new VirtualConsole();
 virtualConsole.on('jsdomError',e=>errors.push(e.message));
 const dom=new JSDOM(html,{url:'https://example.invalid/',runScripts:'dangerously',pretendToBeVisual:true,virtualConsole,
  beforeParse(w){w.scrollTo=()=>{};w.alert=()=>{};w.URL.createObjectURL=()=>'';w.URL.revokeObjectURL=()=>{};}});
 return {dom,doc:dom.window.document,ui:dom.window.__elternzeitTest,quick:dom.window.__elternzeitV38,errors};
}
const nav=d=>[...d.querySelectorAll('#sectionNav button:not([hidden])')].map(x=>x.textContent.trim());
const active=d=>d.querySelector('.slide.active')?.id;

test('simple navigation numbers six visible steps consecutively and skips expert-only slides on previous/next',()=>{
 const t=make(),d=t.doc;
 assert.deepEqual(nav(d),['01 Überblick','02 Grundlagen','03 Modelle','04 Cashflow','05 Plan prüfen','06 Zielsuche']);
 assert.equal(d.getElementById('counter').textContent,'1 / 6');
 assert.equal(d.getElementById('previous').disabled,true);
 d.querySelector('[data-v38-template=classic]').click();
 for(let i=0;i<3;i++)d.getElementById('next').click();
 assert.equal(active(d),'slide-5');
 assert.equal(d.getElementById('counter').textContent,'4 / 6');
 assert.equal(d.querySelector('#sectionNav button[aria-current=step]').dataset.slide,'6');
 assert.equal(d.getElementById('progress').style.width,100*4/6+'%');
 d.getElementById('previous').click();
 assert.equal(active(d),'slide-3');
 d.querySelector('#sectionNav button[data-slide="12"]').click();
 assert.equal(active(d),'slide-goal');
 assert.equal(d.getElementById('counter').textContent,'6 / 6');
 assert.equal(d.getElementById('next').disabled,true);
 assert.deepEqual(t.errors,[]);
 t.dom.window.close();
});

test('opened specialist slide is an explicitly labelled extra step, and expert navigation retains all 16 tabs',()=>{
 const t=make(),d=t.doc;
 t.ui.showSlide(5);
 assert.equal(active(d),'slide-axes');
 assert.equal(nav(d).length,7);
 assert.ok(nav(d).some(v=>v.startsWith('04 Detail: ')));
 assert.equal(d.getElementById('counter').textContent,'4 / 7');
 assert.equal(d.querySelector('#sectionNav button[data-slide="5"]').getAttribute('aria-current'),'step');
 d.getElementById('v41ModeToggle').click();
 assert.equal(nav(d).length,16);
 assert.equal(d.getElementById('counter').textContent,'6 / 16');
 d.getElementById('v41ModeToggle').click();
 assert.equal(nav(d).length,7);
 assert.deepEqual(t.errors,[]);
 t.dom.window.close();
});

test('summary gives four non-certifying decisions and marks the 2027 example as a legal preview',()=>{
 const t=make(),d=t.doc;
 d.querySelector('[data-v38-template=long18]').click();
 const cards=[...d.querySelectorAll('#v38Summary [data-v41-metric]')];
 assert.deepEqual(cards.map(e=>e.dataset.v41Metric),['duration','gap','cash','legal']);
 assert.equal(d.querySelector('[data-v41-metric=cash] strong').textContent,'Nicht berechenbar');
 assert.match(d.querySelector('[data-v41-metric=legal]').textContent,/Rechtsstand 2027 offen/);
 assert.match(d.querySelector('.v41-major-notice').textContent,/keine bestätigten Ansprüche/);
 assert.match(d.querySelector('.v41-totals').textContent,/Einnahmen vor Haushalts- und Kita-Kosten/);
 assert.match(d.querySelector('.v41-quality').textContent,/Fiktive Vorlage/);
 assert.match(d.querySelector('.v41-quality').textContent,/HaushaltskostenNicht angegeben/);
 assert.equal(d.querySelector('.v41-review').open,false);
 assert.match(d.querySelector('.v41-review').textContent,/NICHT_UNTERSTUETZT/);
 assert.deepEqual(t.errors,[]);
 t.dom.window.close();
});

test('entered zero expenses is distinct from missing; unknown amounts remain uncalculated',()=>{
 const t=make(),d=t.doc;d.querySelector('[data-v38-template=classic]').click();
 const before=JSON.stringify(t.ui.getState());
 assert.equal(d.querySelector('[data-v41-metric=cash] strong').textContent,'Nicht berechenbar');
 assert.match(d.querySelector('.v41-quality').textContent,/Nicht angegeben/);
 assert.equal(JSON.stringify(t.ui.getState()),before,'dashboard rendering must not change state');
 t.ui.changeValue('expenses',0);
 assert.notEqual(d.querySelector('[data-v41-metric=cash] strong').textContent,'Nicht berechenbar');
 assert.match(d.querySelector('.v41-totals').textContent,/Rest nach Haushalts- und Kita-Kosten über 14 LM/);
 t.ui.changeValue('expenses','');
 assert.equal(d.querySelector('[data-v41-metric=cash] strong').textContent,'Nicht berechenbar');
 assert.deepEqual(t.errors,[]);
 t.dom.window.close();
});

test('provenance changes on profile selection, without treating official labels as independent verification',()=>{
 const t=make(),d=t.doc;d.querySelector('[data-v38-template=classic]').click();
 const choice=d.querySelector('select[data-profile="incomeEntryMode"]');
 assert.ok(choice);
 choice.value='official';choice.dispatchEvent(new t.dom.window.Event('change',{bubbles:true}));
 assert.equal(t.quick.state().mode,'personal');
 assert.match(d.querySelector('.v41-quality').textContent,/Als übernommen angegeben, nicht verifiziert/);
 assert.doesNotMatch(d.querySelector('.v41-quality').textContent,/Fiktive Vorlage/);
 t.ui.changeValue('egNetFather','');
 assert.match(d.querySelector('.v41-quality').textContent,/Mindestens ein Wert fehlt/);
 assert.deepEqual(t.errors,[]);
 t.dom.window.close();
});

test('an imported draft is labelled loaded and unverified, and expanded explanations survive re-render',()=>{
 const t=make(),d=t.doc;d.querySelector('[data-v38-template=classic]').click();
 const state=JSON.stringify(t.ui.getState());
 t.quick.onImported();
 assert.equal(t.quick.state().mode,'restored');
 assert.match(d.querySelector('#v38Summary h3').textContent,/Geladener Entwurf/);
 assert.match(d.querySelector('.v41-quality').textContent,/Wiederhergestellt, ungeprüft/);
 assert.equal(JSON.stringify(t.ui.getState()),state);
 d.querySelector('.v41-review').open=true;
 d.querySelector('.v39-assumptions').open=true;
 t.ui.changeValue('expenses',0);
 assert.equal(d.querySelector('.v41-review').open,true);
 assert.equal(d.querySelector('.v39-assumptions').open,true);
 const input=d.getElementById('netFather');
 input.value='2500';input.dispatchEvent(new t.dom.window.Event('input',{bubbles:true}));
 assert.match(d.querySelector('.v41-quality').textContent,/Teilweise geändert, Herkunft prüfen/);
 assert.doesNotMatch(d.querySelector('#v38Summary').textContent,/Teilweise angepasstes Beispiel/);
 assert.deepEqual(t.errors,[]);
 t.dom.window.close();
});
