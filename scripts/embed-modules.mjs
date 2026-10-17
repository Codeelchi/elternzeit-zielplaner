import {readFileSync,writeFileSync} from 'node:fs';
const root=new URL('../',import.meta.url), path=new URL('index.html',root);
let html=readFileSync(path,'utf8');
const before=html;
for(const [file,name] of [['money','Money'],['planning-knowledge','PlanningKnowledge'],['plan-comparison','PlanComparison'],['candidate-patterns','CandidatePatterns'],['planning-model','PlanningModel'],['rule-validator','RuleValidator'],['family-budget','FamilyBudget'],['application-guide','ApplicationGuide'],['goal-ranking','GoalRanking'],['care-impact','CareImpact'],['recorded-liquidity','RecordedLiquidity']]){
 const source=readFileSync(new URL(`src/${file}.cjs`,root),'utf8');
 if(/<\/script/i.test(source))throw Error('Unsafe inline source');
 const start=`/* ${name}_START */`,end=`/* ${name}_END */`;
 const inline=`${start}\nconst ${name}=((bundledTimeAxes)=>{const module={exports:{}};const require=(id)=>{if(id==='./time-axes.cjs')return bundledTimeAxes;if(id==='./family-budget.cjs')return FamilyBudget;if(id==='./money.cjs')return Money;throw Error('Unknown bundled dependency');};\n${source}\nreturn Object.freeze(module.exports);})(TimeAxes);\n${end}`;
 const a=html.indexOf(start),b=html.indexOf(end);
 if(a<0){const anchor=name==='PlanComparison'?'/* FamilyBudget_END */':name==='CareImpact'?'/* GoalRanking_END */':name==='RecordedLiquidity'?'/* CareImpact_END */':'/* TIME_AXES_MODULE_END */';if(!html.includes(anchor))throw Error('Missing dependency anchor '+name);html=html.replace(anchor,anchor+'\n'+inline);}
 else {if(b<a||html.indexOf(start,a+1)!==-1)throw Error('Invalid module markers');html=html.slice(0,a)+inline+html.slice(b+end.length);}
}
if(process.argv.includes('--check')){if(before!==html){console.error('Offline module snapshots stale: npm run modules:sync');process.exitCode=1;}}
else writeFileSync(path,html);
