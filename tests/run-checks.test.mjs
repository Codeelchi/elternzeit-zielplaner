import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {CHECKS} from '../scripts/run-checks.mjs';

const pkg=JSON.parse(readFileSync(new URL('../package.json',import.meta.url),'utf8'));

// The checks that `npm test` ran serially before run-checks.mjs existed.
const LEGACY=['direct-file:proof:check','rules:check','legislation:check','axes:check','modules:check',
 'sources:check','roadmap:check','docs:check','legacy:check','maternity:check','independent-cases:check',
 'independent-evidence:check','usability:check','privacy:technical-check','search:micro-proof',
 'quickstart:check','staging:check'];

test('run-checks.mjs enthaelt alle bisherigen npm-test-Checks ohne Duplikate',()=>{
 assert.deepEqual([...CHECKS].sort(),[...LEGACY].sort());
 assert.equal(new Set(CHECKS).size,CHECKS.length);
 for(const c of CHECKS)assert.ok(pkg.scripts[c],'package.json-Script fehlt: '+c);
});

test('npm test startet run-checks.mjs und danach alle Unit-Tests',()=>{
 assert.match(pkg.scripts.test,/^node scripts\/run-checks\.mjs && node --test /);
 assert.match(pkg.scripts.test,/tests\/\*\.test\.mjs/);
});
