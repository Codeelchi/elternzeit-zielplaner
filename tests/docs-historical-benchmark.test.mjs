import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const report=readFileSync(new URL('../docs/P2-ZIELSUCHE-VERGLEICH-2026-10-18.md',import.meta.url),'utf8');
const verifiedSnapshotSha='30d277e1147d61a963c197bf531939706a4dd210261ede85340ce9730fab2074';

test('October 18 measured goal-search benchmark retains the original tested HTML snapshot',()=>{
 assert.ok(report.includes('HTML-SHA256 '+verifiedSnapshotSha),
  'The historical benchmark must not be relabeled with a newer source-HTML checksum.');
 assert.match(report,/4555 ms/);
 assert.match(report,/4485 ms/);
 assert.match(report,/kein CI-Performance-Gate/);
});
