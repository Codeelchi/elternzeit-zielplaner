import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {getDocStatusIssues} from '../scripts/docs-status-check.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=file=>readFileSync(path.join(root,file),'utf8');

test('current documentation matches source HTML, package, release lock and entry points',()=>{
 assert.deepEqual(getDocStatusIssues(root),[]);
});
test('changed offline HTML without documentation hash refresh fails the status gate',()=>{
 const warnings=getDocStatusIssues(root,{'index.html':read('index.html')+'\n<!-- synthetic test-only change -->'});
 assert.ok(warnings.some(item=>item.includes('HTML-Snapshot')&&item.includes('index.html')));
});
test('tampered publication approval never receives a documentation pass',()=>{
 const gate=JSON.parse(read('data/release-gates.json'));
 gate.publicReleaseApproved=true;
 const warnings=getDocStatusIssues(root,{'data/release-gates.json':JSON.stringify(gate)});
 assert.ok(warnings.some(item=>item.includes('Release-Flag verändert')));
});
test('stale current-state claims in the README are rejected',()=>{
 const warnings=getDocStatusIssues(root,{'README.md':'V3.19 technischer Kandidat\n'+read('README.md')});
 assert.ok(warnings.some(item=>item.includes('Veraltete aktuelle Statusbehauptung')));
});
test('broken relative status links are rejected without reading the network',()=>{
 const file='docs/STATUS-TECHNISCH-2026-10-19.md';
 const warnings=getDocStatusIssues(root,{[file]:read(file)+'\n[Broken](NOT-A-REAL-DOC.md)'});
 assert.ok(warnings.some(item=>item.includes('Lokaler Link')&&item.includes('NOT-A-REAL-DOC')));
});
test('package version drift invalidates the documented package identity',()=>{
 const pkg=JSON.parse(read('package.json'));
 pkg.version='99.99.99';
 const warnings=getDocStatusIssues(root,{'package.json':JSON.stringify(pkg)});
 assert.ok(warnings.some(item=>item.includes('Versionsangabe')));
});
