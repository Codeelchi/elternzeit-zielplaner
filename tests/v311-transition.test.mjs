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
