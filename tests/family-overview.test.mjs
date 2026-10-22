import test from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const {buildFamilyView}=require('../src/family-overview.cjs');
const make=(n=5,plan={})=>Array.from({length:n},(_,i)=>{
 const lm=i+1,f=plan.f?.[i]||'W',m=plan.m?.[i]||'W';
 const income=Number(plan.income?.[i]??2500),childcare=Number(plan.childcare?.[i]??0);
 return {lm,f,m,hf:f==='W'?40:['R','T','Q','K'].includes(f)?20:0,
  hm:m==='W'?40:['R','T','Q','K'].includes(m)?20:0,
  income,totalWage:income,totalEg:0,kind:0,childcare,cashAfter:income-childcare-3000};
});

test('existing month statuses become documented assumptions, not guaranteed weekly childcare',()=>{
 const rows=make(5,{f:['B','R','W','W','W'],m:['MS','W','W','W','W']});
 const v=buildFamilyView({rows,horizon:5,childcareStartLm:4,expensesKnown:false});
 assert.deepEqual(v.months.map(x=>x.care),['parent-at-home','not-documented','not-documented','planned-kita','planned-kita']);
 assert.equal(v.months[0].first.availability,'at-home');
 assert.equal(v.months[1].first.availability,'work-or-part-time');
 assert.equal(v.months[0].second.label,'Mutterschutz (pauschal)');
 assert.equal(v.firstUnattributed,2);
 assert.equal(v.homeMonths.first,1);
 assert.equal(v.homeMonths.second,1);
 assert.equal(v.totalIncome,12500);
 assert.equal(v.minAvailable,null);
 assert.equal(v.totalAvailable,null);
 assert.equal(v.requiredBuffer,null);
 assert.ok(!('bankLedger' in v));
});
test('zero entered expenses differs from entirely absent expenses',()=>{
 const rows=make(3,{income:[1000,2000,4500]});
 const unknown=buildFamilyView({rows,horizon:3,expensesKnown:false});
 assert.equal(unknown.months[0].available,null);
 assert.equal(unknown.requiredBuffer,null);
 const entered=buildFamilyView({rows,horizon:3,expensesKnown:true});
 assert.deepEqual(entered.months.map(x=>x.available),[-2000,-1000,1500]);
 assert.equal(entered.minAvailable,-2000);
 assert.equal(entered.totalAvailable,-1500);
 assert.equal(entered.requiredBuffer,3000);
});
test('comparison horizon is shared and never reinterprets missing months',()=>{
 const rows=make(36,{f:Array.from({length:36},(_,i)=>i<13?'B':'W')});
 const p12=buildFamilyView({rows,horizon:12,expensesKnown:false});
 const p18=buildFamilyView({rows,horizon:18,expensesKnown:false});
 assert.equal(p12.months.length,12);
 assert.equal(p18.months.length,18);
 assert.equal(p12.firstUnattributed,null);
 assert.equal(p18.firstUnattributed,14);
 assert.equal(p12.totalIncome,12*2500);
 assert.equal(p18.totalIncome,18*2500);
});
test('invalid codes, gaps, missing/invalid monetary data and out-of-range horizons fail closed',()=>{
 assert.throws(()=>buildFamilyView({rows:[]}),/fehlen/);
 assert.throws(()=>buildFamilyView({rows:make(5),horizon:6}),/Vergleichszeitraum/);
 assert.throws(()=>buildFamilyView({rows:make(5),horizon:0}),/Vergleichszeitraum/);
 assert.throws(()=>buildFamilyView({rows:make(5),horizon:5,childcareStartLm:37}),/Kita-Start/);
 assert.throws(()=>buildFamilyView({rows:make(5),horizon:5,expensesKnown:'no'}),/eindeutig/);
 const invalid=make(3);invalid[1].lm=6;
 assert.throws(()=>buildFamilyView({rows:invalid,horizon:3}),/lückenlos/);
 const hours=make(3);hours[0].hf=Number.NaN;
 assert.throws(()=>buildFamilyView({rows:hours,horizon:3}),/Wochenstunden/);
 const code=make(3);code[0].m='???';
 assert.throws(()=>buildFamilyView({rows:code,horizon:3}),/Monatscode/);
 const money=make(3);money[1].income=Infinity;
 assert.throws(()=>buildFamilyView({rows:money,horizon:3}),/Einnahmen/);
 const cash=make(3);cash[0].cashAfter=NaN;
 assert.throws(()=>buildFamilyView({rows:cash,horizon:3,expensesKnown:true}),/Rest nach Kosten/);
});
