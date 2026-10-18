import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const {validateReviewEvidence}=require('../src/independent-review-evidence.cjs');
const source=readFileSync(new URL('../data/independent-case-requests-2026-10-17.json',import.meta.url));
const requests=JSON.parse(source.toString('utf8'));
const manifest=JSON.parse(readFileSync(new URL('../data/independent-review-evidence-v317.json',import.meta.url),'utf8'));
const result=validateReviewEvidence({
 manifest,requests,requestsSha256:createHash('sha256').update(source).digest('hex')
});
console.log('Externe Referenzen:',result.total,'vorbereitet,',result.missing,'ohne Belege,',
 result.submittedUnverified,'eingereicht aber ungeprüft;',result.independentlyApproved,'unabhängig freigegeben.');
console.log(result.notice);
