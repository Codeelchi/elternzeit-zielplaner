import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {createRequire} from 'node:module';
import {JSDOM, VirtualConsole} from 'jsdom';

const require=createRequire(import.meta.url);
const TimeAxes=require('../src/time-axes.cjs');
const research=readFileSync(new URL('../docs/TESTDATEN-QUELLEN-2026-10-21.md',import.meta.url));
const fixtures=JSON.parse(readFileSync(new URL('./fixtures/amtliche-komponenten-2026-10-21.json',import.meta.url),'utf8'));
const original=JSON.parse(readFileSync(new URL('../data/referenzfaelle-bund-2026-10-14.json',import.meta.url),'utf8'));
const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');

function browserModel() {
 const errors=[],virtualConsole=new VirtualConsole();
 virtualConsole.on('jsdomError',err=>errors.push(err.message));
 const dom=new JSDOM(html,{
  url:'https://elternzeit.local/',runScripts:'dangerously',pretendToBeVisual:true,virtualConsole,
  beforeParse(w){w.scrollTo=()=>{};w.alert=()=>{};w.URL.createObjectURL=()=>'';w.URL.revokeObjectURL=()=>{};}
 });
 return {dom,ui:dom.window.__elternzeitTest,errors};
}

test('new source-bound checks supplement the older eight end-amount checks, without claiming ten independent family cases',()=>{
 assert.deepEqual(fixtures.net_to_benefit_cases.map(x=>x.id),['A02','A03','A04']);
 assert.equal(fixtures.life_month_case.id,'A06');
 assert.equal(fixtures.complete_family_reference,false);
 assert.equal(fixtures.approval_status,'awaiting_external_review');
 assert.equal(fixtures.external_reviewer,null);
 assert.equal(fixtures.source_excerpt_hash,null);
 assert.equal(fixtures.evidence_kind,'published_component_example');
 assert.equal(fixtures.source_report,'docs/TESTDATEN-QUELLEN-2026-10-21.md');
 assert.equal(fixtures.source_report_sha256,createHash('sha256').update(research).digest('hex'));
 assert.match(fixtures.interface_mapping.input_semantics,/not wage payslip net/i);
 assert.match(fixtures.interface_mapping.year_adaptation,/yearless/i);
 assert.equal(fixtures.not_validated.some(s=>s.includes('Maternity')),true);
 assert.equal(new Set(fixtures.net_to_benefit_cases.map(x=>x.id)).size,3);
 const known=new Map(original.cases.map(x=>[x.id,x]));
 for(const f of fixtures.net_to_benefit_cases){
  assert.equal(f.existing_reference_ids.length,2);
  for(const [i,id] of f.existing_reference_ids.entries()){
   const prior=known.get(id);
   assert.ok(prior,'Historical reference missing: '+id);
   assert.equal(prior.evidence_kind,'official_published_example');
   assert.equal(prior.prebirth_elterngeld_net_eur,f.published_inputs_eur_per_month.prebirth_net);
   assert.equal(prior.postbirth_elterngeld_net_eur,f.published_inputs_eur_per_month.postbirth_net);
   assert.equal(prior.benefit_type,i===0?'basis':'plus');
   assert.equal(prior.expected_monthly_eur,i===0?f.published_outputs_eur_per_month.basis:f.published_outputs_eur_per_month.plus);
  }
 }
});

for(const f of fixtures.net_to_benefit_cases){
 test(f.id+': published intermediate numbers, basis/Plus ceiling and comparison sums are unchanged',()=>{
  const {dom,ui,errors}=browserModel();
  try{
   const before=JSON.stringify(ui.getState());
   const input=f.published_inputs_eur_per_month,output=f.published_outputs_eur_per_month,comparison=f.published_comparison;
   const pre=input.prebirth_net,post=input.postbirth_net;
   assert.equal((input.prebirth_net_considered_cap??pre)-post,input.income_difference,'Published capped income difference ('+f.id+')');
   if(input.prebirth_net_considered_cap!==undefined){
    assert.notEqual(pre-post,input.income_difference,'Raw payslip-style difference is not the published capped difference');
    assert.equal(Math.min(pre,input.prebirth_net_considered_cap)-post,input.income_difference);
    assert.equal(ui.basis(pre,post),ui.basis(input.prebirth_net_considered_cap,post));
    assert.notEqual(ui.basis(pre,post),Math.round((pre-post)*0.65),'Must not use uncapped prebirth net');
   }
   assert.equal(ui.basis(pre,post),output.basis,'Basis amount');
   assert.equal(ui.basis(pre,0),output.theoretical_basis_without_postbirth_income,'Theoretical no-income basis');
   assert.equal(ui.basis(pre,0)/2,output.plus_ceiling,'Published Plus cap');
   assert.equal(ui.plus(pre,post),output.plus,'Plus amount');
   assert.equal(Math.min(output.basis,output.plus_ceiling),output.plus,'Published cap decision');
   assert.equal(output.plus_ceiling<output.basis,f.plus_ceiling_effect==='binding','Expected binding status');
   assert.equal(comparison.basis_months*output.basis,comparison.basis_total_eur,'Published arithmetic illustration');
   assert.equal(comparison.plus_months*output.plus,comparison.plus_total_eur,'Published arithmetic illustration');
   // These sums are source illustrations, never a validator ruling that any household can receive this duration.
   assert.equal(JSON.stringify(ui.getState()),before,'Component calls must not mutate the family plan');
   assert.deepEqual(errors,[]);
  }finally{dom.window.close();}
 });
}

test('A06: published yearless 15-February life-month intervals match the pure time-axis component',()=>{
 const f=fixtures.life_month_case;
 assert.equal(f.published_birth_month_day,'02-15');
 assert.equal(f.published_birth_year,null);
 assert.deepEqual(f.published_intervals_month_day.map(x=>x.lm),[1,2,3]);
 assert.deepEqual(f.synthetic_adapter_years,[2025,2026]);
 assert.match(f.source.url,/familienportal\.de/);
 for(const year of f.synthetic_adapter_years){
  const months=TimeAxes.lifeMonths(year+'-'+f.published_birth_month_day,3);
  for(const [i,expected] of f.published_intervals_month_day.entries()){
   assert.equal(months[i].lm,expected.lm);
   assert.equal(months[i].startDate.slice(5),expected.start);
   assert.equal(months[i].endDate.slice(5),expected.end);
   assert.equal(months[i].exclusiveEnd,TimeAxes.addDays(months[i].endDate,1));
   if(i)assert.equal(months[i].startDate,months[i-1].exclusiveEnd);
  }
 }
 // The official text does not supply a year or a year-specific 2027 entitlement.
 assert.throws(()=>TimeAxes.lifeMonths('2026-02-30',3),RangeError);
});

test('A06: the offline app displays the same three reference month boundaries with a declared synthetic year',()=>{
 const {dom,ui,errors}=browserModel();
 try{
  const source=fixtures.life_month_case;
  ui.changeValue('date','2026-'+source.published_birth_month_day);
  for(const [i,interval] of source.published_intervals_month_day.entries()){
   const [sm,sd]=interval.start.split('-'),[em,ed]=interval.end.split('-');
   assert.equal(ui.dateFor(i+1),sd+'.'+sm+'.2026 bis '+ed+'.'+em+'.2026');
  }
  assert.deepEqual(errors,[]);
 }finally{dom.window.close();}
});
