import test from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const {calendarTaskExport:build,icalEscape,fold}=require('../src/calendar-export.cjs');
const {buildApplicationGuide:guide}=require('../src/application-guide.cjs');
test('officially sourced application-guide tasks become TENTATIVE calendar checks, not official approvals',()=>{
 const g=guide({birthDate:'2026-05-28',leavePeriods:{father:[{startDate:'2026-06-01',endDate:'2026-09-01'}]}});
 const r=build(g.tasks,{generatedAt:'2026-10-17T12:00:00Z'});
 assert.ok(r.content.startsWith('BEGIN:VCALENDAR\r\nVERSION:2.0'));
 assert.match(r.content,/DTSTAMP:20261017T120000Z/);
 assert.match(r.content,/DTSTART;VALUE=DATE:20260413/);
 assert.match(r.content,/DTEND;VALUE=DATE:20260414/);
 assert.match(r.content,/STATUS:TENTATIVE/);
 assert.equal(r.hasLegalApproval,false);
 assert.ok(r.included>=2);
 assert.match(r.content,/END:VCALENDAR\r\n$/);
});
test('ICS escaping neutralizes injected newlines and all physical lines are <=75 UTF-8 bytes',()=>{
 const task={id:'a',title:'X\nBEGIN:VEVENT;🧸'.repeat(4),dueDate:'2026-12-01',
  description:'Caution, use ; calendar',source:{url:'https://example.invalid/path'}};
 const r=build([task]);
 assert.ok(r.content.includes('\\n'));
 assert.ok(!r.content.includes('X\nBEGIN:VEVENT'));
 const lines=r.content.split('\r\n');
 for(const line of lines)assert.ok(new TextEncoder().encode(line).length<=75,'oversized ICS line: '+line);
 assert.match(r.content,/DTEND;VALUE=DATE:20261202/);
 assert.match(icalEscape('a,b;c\nd'),/a\\,b\\;c\\nd/);
});
test('no-date tasks are excluded instead of inventing a payment or reminder due date',()=>{
 const r=build([{id:'no-date',title:'Inform',dueDate:null}]);
 assert.equal(r.included,0);
 assert.doesNotMatch(r.content,/VEVENT/);
});
test('invalid dates, bad timestamps, duplicates and excessive lists are rejected',()=>{
 const entry={id:'a',title:'Task',dueDate:'2026-10-17'};
 for(const date of ['2026-02-30','2027-02-29','bad'])assert.throws(()=>build([{...entry,dueDate:date}]),RangeError);
 assert.throws(()=>build([entry,entry]),RangeError);
 assert.throws(()=>build([entry],{generatedAt:'broken'}),RangeError);
 assert.throws(()=>build(Array.from({length:81},()=>entry)),RangeError);
});
