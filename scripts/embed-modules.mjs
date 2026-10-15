import {readFileSync,writeFileSync} from 'node:fs';
const root=new URL('../',import.meta.url), path=new URL('index.html',root);
let html=readFileSync(path,'utf8');
const before=html;
for(const [file,name] of [['candidate-patterns','CandidatePatterns'],['planning-model','PlanningModel'],['rule-validator','RuleValidator'],['family-budget','FamilyBudget'],['application-guide','ApplicationGuide'],['goal-ranking','GoalRanking']]){
 const source=readFileSync(new URL(`src/${file}.cjs`,root),'utf8');
 if(/<\/script/i.test(source))throw Error('Unsafe inline source');
 const start=`/* ${name}_START */`,end=`/* ${name}_END */`;
 const inline=`${start}\nconst ${name}=((bundledTimeAxes)=>{const module={exports:{}};const require=(id)=>{if(id==='./time-axes.cjs')return bundledTimeAxes;throw Error('Unknown bundled dependency');};\n${source}\nreturn Object.freeze(module.exports);})(TimeAxes);\n${end}`;
 const a=html.indexOf(start),b=html.indexOf(end);
 if(a<0) html=html.replace('/* TIME_AXES_MODULE_END */','/* TIME_AXES_MODULE_END */\n'+inline);
 else {if(b<a||html.indexOf(start,a+1)!==-1)throw Error('Invalid module markers');html=html.slice(0,a)+inline+html.slice(b+end.length);}
}
if(process.argv.includes('--check')){if(before!==html){console.error('Offline module snapshots stale: npm run modules:sync');process.exitCode=1;}}
else writeFileSync(path,html);
