import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {JSDOM} from 'jsdom';

const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');
function setup(){
 const dom=new JSDOM(html,{url:'https://elternzeit.local/',runScripts:'dangerously',pretendToBeVisual:true,beforeParse(w){w.scrollTo=()=>{};w.alert=()=>{};w.URL.createObjectURL=()=>'';w.URL.revokeObjectURL=()=>{};}});
 const doc=dom.window.document;
 doc.querySelector('[data-v38-template="classic"]').click();
 return {dom,doc,ui:dom.window.__elternzeitTest};
}
test('bridge reports concrete coverage ranges, not a fictional Kita commitment',()=>{
 const {dom,doc,ui}=setup();
 ui.changeValue('goalCare',18);
 const output=doc.getElementById('v38Summary').textContent;
 assert.match(output,/Übergang|finanzieller Übergang/);
 assert.match(output,/LM 15–18/);
 assert.match(output,/Kita-Vormerkung ist keine Platzzusage/);
 assert.equal(doc.querySelectorAll('.v310-next').length,1);
 assert.equal(doc.querySelectorAll('.v311-bridge').length,1);
 dom.window.close();
});
test('unknown expenses never produce a negative budget conclusion',()=>{
 const {dom,doc,ui}=setup();
 assert.match(doc.getElementById('v38Summary').textContent,/Ausgaben fehlen: keine belastbare Aussage/);
 ui.changeValue('expenses',0);
 assert.doesNotMatch(doc.getElementById('v38Summary').textContent,/Ausgaben fehlen: keine belastbare Aussage/);
 dom.window.close();
});
test('two-month Kita delay is conditional and does not change the stored plan',()=>{
 const {dom,doc,ui}=setup();
 ui.changeValue('goalCare',18);
 ui.changeValue('goalCareMode','partial');
 ui.changeValue('childcareStart',15);
 const before=JSON.stringify(ui.getState());
 const content=doc.getElementById('v38Summary').textContent;
 assert.match(content,/Kita zwei Lebensmonate später beginnt \(LM 17\)/);
 assert.match(content,/nicht neu berechnet/);
 assert.equal(JSON.stringify(ui.getState()),before);
 dom.window.close();
});

function selectGoal(doc,id,value){
 const field=doc.getElementById(id);
 assert.ok(field,id);
 field.value=String(value);
 field.dispatchEvent(new doc.defaultView.Event('input',{bubbles:true}));
}
function submitGoals(dom,doc){
 doc.getElementById('v311GoalsForm').dispatchEvent(new dom.window.Event('submit',{bubbles:true,cancelable:true}));
}
test('Kita-delay picker compares 0 to 6 months without modifying input assumptions or persistence',()=>{
 const {dom,doc,ui}=setup();
 ui.changeValue('goalCare',18);ui.changeValue('goalCareMode','partial');ui.changeValue('childcareStart',15);
 const before=JSON.stringify(ui.getState());
 const picker=doc.getElementById('v311KitaDelay');
 assert.ok(picker);
 assert.equal(picker.options.length,7);
 picker.value='0';picker.dispatchEvent(new dom.window.Event('change',{bubbles:true}));
 assert.match(doc.getElementById('v311BridgeResult').textContent,/wie geplant startet \(LM 15\)/);
 picker.value='6';picker.dispatchEvent(new dom.window.Event('change',{bubbles:true}));
 assert.match(doc.getElementById('v311BridgeResult').textContent,/6 Lebensmonate später beginnt \(LM 21\)/);
 assert.match(doc.getElementById('v311BridgeResult').textContent,/nicht neu berechnet/);
 assert.equal(JSON.stringify(ui.getState()),before);
 assert.equal(dom.window.localStorage.length,0);
 dom.window.close();
});
test('Kita-delay beyond the 36-month horizon is not clipped to LM36',()=>{
 const {dom,doc,ui}=setup();
 ui.changeValue('goalCare',36);ui.changeValue('childcareStart',36);
 const picker=doc.getElementById('v311KitaDelay');
 picker.value='6';picker.dispatchEvent(new dom.window.Event('change',{bubbles:true}));
 assert.match(doc.getElementById('v311BridgeResult').textContent,/LM 42/);
 dom.window.close();
});
test('goal wizard refuses to search without choosing an illustrative or personal plan',()=>{
 const dom=new JSDOM(html,{url:'https://elternzeit.local/',runScripts:'dangerously',pretendToBeVisual:true,
   beforeParse(w){w.scrollTo=()=>{};w.alert=()=>{};w.URL.createObjectURL=()=>'';w.URL.revokeObjectURL=()=>{};}});
 const doc=dom.window.document,ui=dom.window.__elternzeitTest;
 const before=JSON.stringify(ui.getState());
 selectGoal(doc,'v311Priority','balanced');
 submitGoals(dom,doc);
 assert.match(doc.getElementById('v311GoalError').textContent,/zuerst ein Beispiel auswählen/);
 assert.equal(JSON.stringify(ui.getState()),before);
 assert.equal(doc.querySelector('.slide.active').id,'slide-1');
 dom.window.close();
});
test('financial goal is rejected when expenses are unknown, without partially changing state',()=>{
 const {dom,doc,ui}=setup();
 const before=JSON.stringify(ui.getState());
 selectGoal(doc,'v311Priority','floor');selectGoal(doc,'v311Care','24');
 selectGoal(doc,'v311Minimum','2200');
 submitGoals(dom,doc);
 assert.match(doc.getElementById('v311GoalError').textContent,/Haushaltsausgaben/);
 assert.equal(doc.activeElement.id,'v311Minimum');
 assert.equal(JSON.stringify(ui.getState()),before);
 dom.window.close();
});
test('guided time objective updates constraints, navigates to original engine and preserves month plan',()=>{
 const {dom,doc,ui}=setup();
 const before=JSON.stringify(ui.getState().schedule);
 selectGoal(doc,'v311Priority','balanced');
 selectGoal(doc,'v311Care','24');
 selectGoal(doc,'v311CareMode','partial');
 selectGoal(doc,'v311Part','0');
 submitGoals(dom,doc);
 assert.equal(doc.getElementById('v311GoalError').textContent,'');
 const s=ui.getState();
 assert.equal(s.goalObjective,'balanced');
 assert.equal(s.goalCare,24);
 assert.equal(s.goalCareMode,'partial');
 assert.equal(s.goalPart,0);
 assert.equal(s.goalMinIncome,0);
 assert.equal(JSON.stringify(s.schedule),before);
 assert.equal(doc.querySelector('.slide.active').id,'slide-goal');
 assert.equal(dom.window.localStorage.length,0);
 dom.window.__elternzeitV3.cancelGoalSearch();
 dom.window.close();
});
test('explicit zero expenses is known and allows a financial objective with a two-cent threshold',()=>{
 const {dom,doc,ui}=setup();
 ui.changeValue('expenses',0);
 selectGoal(doc,'v311Priority','floor');
 selectGoal(doc,'v311Minimum','1700.02');
 submitGoals(dom,doc);
 assert.equal(doc.getElementById('v311GoalError').textContent,'');
 assert.equal(ui.getState().goalObjective,'floor');
 assert.equal(ui.getState().goalMinIncome,1700.02);
 dom.window.__elternzeitV3.cancelGoalSearch();
 dom.window.close();
});
test('invalid over-precise budget is rejected without rounding the constraint',()=>{
 const {dom,doc,ui}=setup();
 ui.changeValue('expenses',1000);
 const before=JSON.stringify(ui.getState());
 selectGoal(doc,'v311Minimum','1000.005');
 submitGoals(dom,doc);
 assert.match(doc.getElementById('v311GoalError').textContent,/zwei Nachkommastellen/);
 assert.equal(JSON.stringify(ui.getState()),before);
 dom.window.close();
});
test('pending changes in personal form must be submitted before launching search',()=>{
 const {dom,doc,ui}=setup();
 const before=JSON.stringify(ui.getState());
 const input=doc.getElementById('v38NetF');
 input.value='1800';
 input.dispatchEvent(new dom.window.Event('input',{bubbles:true}));
 selectGoal(doc,'v311Priority','balanced');
 submitGoals(dom,doc);
 assert.match(doc.getElementById('v311GoalError').textContent,/Änderungen offen/);
 assert.equal(JSON.stringify(ui.getState()),before);
 dom.window.close();
});


test('guided form keeps an existing 12-month expert goal instead of silently losing it',()=>{
 const {dom,doc,ui}=setup();
 ui.changeValue('goalCare',12);
 assert.equal(doc.getElementById('v311Care').value,'12');
 selectGoal(doc,'v311Priority','balanced');
 submitGoals(dom,doc);
 assert.equal(ui.getState().goalCare,12);
 assert.equal(doc.getElementById('v311GoalError').textContent,'');
 dom.window.__elternzeitV3.cancelGoalSearch();
 dom.window.close();
});
test('quickstart displays actual cents from personal net values instead of silently rounding to euros',()=>{
 const {dom,doc}=setup();
 const entries={v38Birth:'2026-05-28',v38NetF:'2300.50',v38NetM:'2500.40',v38Goal:'18',v38Expenses:'1950.30'};
 for(const [id,value] of Object.entries(entries))doc.getElementById(id).value=value;
 doc.getElementById('v38PersonalForm').dispatchEvent(new dom.window.Event('submit',{bubbles:true,cancelable:true}));
 const output=doc.getElementById('v38Summary').textContent;
 assert.match(output,/2\.300,50\s*€/);
 assert.match(output,/2\.500,40\s*€/);
 assert.match(output,/1\.950,30\s*€/);
 dom.window.close();
});
