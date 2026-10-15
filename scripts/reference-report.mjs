import {readFileSync,writeFileSync} from 'node:fs';
import {JSDOM,VirtualConsole} from 'jsdom';
import TimeAxes from '../src/time-axes.cjs';

const root=new URL('../',import.meta.url);
const {version}=JSON.parse(readFileSync(new URL('package.json',root),'utf8'));
const fixtures=JSON.parse(readFileSync(new URL('data/referenzfaelle-bund-2026-10-14.json',root),'utf8'));
const published=JSON.parse(readFileSync(new URL('data/amtliche-beispielrechnungen-2026-10-15.json',root),'utf8'));
const errors=[],virtualConsole=new VirtualConsole();
virtualConsole.on('jsdomError',e=>errors.push(e.message));
const dom=new JSDOM(readFileSync(new URL('index.html',root),'utf8'),{
 url:'https://elternzeit.local',runScripts:'dangerously',pretendToBeVisual:true,virtualConsole
});
const ui=dom.window.__elternzeitTest;
const app=dom.window.__elternzeitV3;
if(errors.length||!ui||!app)throw Error(errors.join('; ')||'Application did not initialize');

const cases=fixtures.cases.map(f=>{
 const actual=ui[f.benefit_type==='basis'?'basis':'plus'](f.prebirth_elterngeld_net_eur,f.postbirth_elterngeld_net_eur);
 return {...f,actual_monthly_eur:actual,delta_eur:actual-f.expected_monthly_eur,within_tolerance:Math.abs(actual-f.expected_monthly_eur)<=f.tolerance_eur};
});
const monthlyCases=published.monthly_cases.map(f=>{
 const actual=ui[f.variant](f.prebirth_elterngeld_net_eur,f.postbirth_elterngeld_net_eur);
 return {...f,actual_monthly_eur:actual,delta_eur:actual-f.monthly_expected_eur,within_tolerance:Math.abs(actual-f.monthly_expected_eur)<=f.tolerance_eur};
});
Object.assign(ui.s,{date:'2026-05-28',zve:80000,standardCaseConfirmed:true,egNetMother:2000,netMother:2000});
const totalCases=published.total_cases.map(f=>{
 Object.assign(ui.s,{egNetFather:f.prebirth_elterngeld_net_eur,netFather:f.prebirth_elterngeld_net_eur,
  ptNetFather:f.postbirth_elterngeld_net_eur,egPtNetFather:f.postbirth_elterngeld_net_eur,
  hoursFather:28,employmentOverrides:null,benefitOverrides:null,leaveOverrides:null});
 const schedule=Array.from({length:36},(_,i)=>({f:'W',m:i<2?'MS':'W'}));
 for(let i=2;i<2+f.months;i++){
  schedule[i].f=f.postbirth_elterngeld_net_eur===0?(f.variant==='basis'?'B':'P'):(f.variant==='basis'?'R':'T');
 }
 const calc=app.evaluate(schedule);
 const actual=calc.rows.reduce((sum,row)=>sum+row.fg,0);
 return {...f,actual_total_eur:actual,delta_eur:actual-f.expected_total_eur,model_status:calc.validation.status,
  within_tolerance:calc.valid&&Math.abs(actual-f.expected_total_eur)<=f.tolerance_eur};
});
const lbank=published.lbank_official_multi_income_case;
const lbankCases=['mother','father'].flatMap(parent=>{
 const sample=lbank[parent],average=sample.postbirth_plus_nets.reduce((a,x)=>a+x,0)/sample.postbirth_plus_nets.length;
 return [{id:'lbank-'+parent+'-basis',parent,variant:'basis',prebirth_elterngeld_net_eur:sample.prebirth_net,postbirth_average_eur:0,actual_monthly_eur:ui.basis(sample.prebirth_net,0),expected_monthly_eur:sample.basis_expected},
         {id:'lbank-'+parent+'-plus',parent,variant:'plus',prebirth_elterngeld_net_eur:sample.prebirth_net,postbirth_average_eur:average,actual_monthly_eur:ui.plus(sample.prebirth_net,average),expected_monthly_eur:sample.plus_expected}]
 .map(f=>({...f,source_url:lbank.source_url,evidence_kind:lbank.evidence_kind,source_checked_at:'2026-10-15',delta_eur:f.actual_monthly_eur-f.expected_monthly_eur,
    within_tolerance:Math.abs(f.actual_monthly_eur-f.expected_monthly_eur)<0.01 &&
    (f.variant!=='plus'||f.postbirth_average_eur===sample.postbirth_average)}));
});
const birthDate=published.maternity_conflict.birth_date;
const mat=TimeAxes.maternityTimeline({birthDate,expectedDueDate:birthDate,postnatalDays:56});
const lm=TimeAxes.lifeMonths(birthDate)[1];
const covered=TimeAxes.daysOverlapInclusive(lm.startDate,lm.endDate,mat.postnatal.startDate,mat.postnatal.endDate);
const uncovered=lm.days-covered;
const sample=published.maternity_conflict.sources[0];
const maternity={
 id:'official-maternity-may20',
 source_url:sample.url,
 source_checked_at:'2026-10-15',
 evidence_kind:'conflicting_official_sources',
 published_uncovered_days:sample.uncovered_days,
 actual_uncovered_days:uncovered,period_days:lm.days,delta_days:uncovered-sample.uncovered_days,
 within_tolerance:uncovered===sample.uncovered_days,
 normative_last_protected_date:mat.postnatal.endDate,
 sources:published.maternity_conflict.sources,
 explanation:'Amtliches Bundesfamilienportal nennt 14.07. und 5/30, NRW-KomNet mit BGB-Fristbeginn sowie §24i SGB V dagegen 15.07. und 4/30. Keine fachliche Freigabe ohne zuständige Stellen.',
 release_blocker:uncovered!==sample.uncovered_days
};
const monetaryPass=[...cases,...monthlyCases,...totalCases,...lbankCases].every(x=>x.within_tolerance);
const report={
 version,checkedAt:'2026-10-15',referenceCollection:published.schema_version,
 provenanceWarning:'Amtlich veröffentlichte Beispielrechnungen sind keine echten anonymisierten Bewilligungsbescheide; Brutto/Steuer/SV wurden nicht amtlich als Gesamtfall verglichen.',
 amountCases:cases,additionalPublishedMonthlyCases:monthlyCases,additionalPublishedTotalCases:totalCases,additionalOfficialStateCases:lbankCases,
 maternity,published_amount_examples:cases.filter(x=>x.evidence_kind==='official_published_example').length+monthlyCases.length+lbankCases.length,
 published_total_examples:totalCases.length,total_monitored_amounts:cases.length+monthlyCases.length+totalCases.length+lbankCases.length,monetaryCasesPass:monetaryPass,
 publicReleaseGatePassed:monetaryPass&&maternity.within_tolerance
};
for(const path of [`qa/reference-deltas-v${version}.json`,'qa/reference-deltas-current.json'])
 writeFileSync(new URL(path,root),JSON.stringify(report,null,2)+'\n');
dom.window.close();
process.stdout.write(
 `${cases.length} existing monetary amounts, ${monthlyCases.length} additional Federal monthly, ${totalCases.length} Federal multi-month and ${lbankCases.length} State example amounts compared. Monetary cases: ${monetaryPass?'PASS':'FAIL'}; maternity discrepancy: ${maternity.delta_days} day(s). Public release: ${report.publicReleaseGatePassed?'REFERENCE GATE PASS':'BLOCKED'}\n`
);
