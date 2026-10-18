import test from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const {getUnderstandingTasks,assessUnderstandingAnswer}=require('../src/understanding-guide.cjs');
const tasks=getUnderstandingTasks();
test('all eight synthetic tasks have distinct identifiers, valid choices and explanations',()=>{
 assert.equal(tasks.length,8);
 assert.equal(new Set(tasks.map(t=>t.id)).size,8);
 assert.deepEqual(tasks.map(t=>t.topic),[
  'Geltungsbereich','Einkommensbegriffe','Zeitachsen','Zahlung und Bank',
  'Haushaltsbudget','Offene Fachfrage','Zielsuche','Speichern und Datenschutz'
 ]);
 for(const t of tasks){
  assert.equal(t.choices.length,3);
  assert.equal(new Set(t.choices.map(c=>c.id)).size,3);
  assert.ok(t.choices.some(c=>c.id===t.answer));
  assert.ok(t.explanation.length>75);
 }
});
test('each matching synthetic answer is explanatory only, never a real user study',()=>{
 for(const t of tasks){
  const output=assessUnderstandingAnswer(t.id,t.answer);
  assert.equal(output.understandingMatch,true);
  assert.equal(output.suggestedAnswer,t.answer);
  assert.equal(output.humanStudyCompleted,false);
  assert.equal(output.officialAnswerCertified,false);
  assert.equal(output.explanation,t.explanation);
 }
});
test('all nonmatching synthetic answers stay a mismatch without a score or user identity',()=>{
 for(const t of tasks){
  for(const option of t.choices.filter(x=>x.id!==t.answer)){
   const result=assessUnderstandingAnswer(t.id,option.id);
   assert.equal(result.understandingMatch,false);
   assert.equal(result.humanStudyCompleted,false);
   assert.doesNotMatch(JSON.stringify(result),/name|email|nettoamount|certificate/i);
  }
 }
});
test('tasks returned to callers cannot mutate static lesson source',()=>{
 const copy=getUnderstandingTasks();
 copy[0].choices[0].label='manipuliert';
 copy[0].answer='approved';
 assert.equal(getUnderstandingTasks()[0].answer,'forecast');
 assert.notEqual(getUnderstandingTasks()[0].choices[0].label,'manipuliert');
});
test('unknown IDs or invalid choices are rejected and cannot count as an answer',()=>{
 for(const [id,answer] of [['missing','a'],[tasks[0].id,'missing'],[tasks[0].id,null],[null,'forecast']]){
  assert.throws(()=>assessUnderstandingAnswer(id,answer),RangeError);
 }
});
