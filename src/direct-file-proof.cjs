'use strict';

// A *self-reported technical browser test receipt*, never an independent
// accessibility, legal or human review. Verify exact HTML and test-source
// fingerprints; retain the public-release gate independently.
const {createHash}=require('node:crypto');
const SHA=/^[a-f0-9]{64}$/;
const DATE=/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/;
const FILES=[
 'index.html','start.html','tests/e2e/current-direct-file.spec.mjs',
 'playwright.direct-file.config.mjs','scripts/direct-file-proof.mjs',
 'src/direct-file-proof.cjs','package-lock.json'
];
function digest(value){return createHash('sha256').update(value).digest('hex');}
function validateDirectFileProof({proof,contents,appVersion}={}){
 if(!proof||proof.format!=='direct-file-offline-technical-proof-v1'||
    proof.status!=='AUTOMATED_ONLY_NOT_INDEPENDENT'||
    proof.technicalPass!==true||
    proof.publicReleaseApproved!==false||
    proof.humanScreenreaderReviews!==0||
    proof.independentLegalReviews!==0||
    proof.independentPrivacyReviews!==0||
    typeof appVersion!=='string'||proof.appVersion!==appVersion||
    !DATE.test(proof.generatedAt)||!Number.isFinite(Date.parse(proof.generatedAt)))
  throw new TypeError('Unzulässige Browserbeleg-Metadaten oder vorgetäuschte Freigabe.');
 if(!contents||typeof contents!=='object'||!proof.sourceSha256||
    Object.keys(proof.sourceSha256).length!==FILES.length)
  throw new TypeError('Vollständige Prüfsourcen-Fingerprints erforderlich.');
 for(const path of FILES){
  if(!(path in contents)||!SHA.test(proof.sourceSha256[path])||
     proof.sourceSha256[path]!==digest(contents[path]))
   throw new TypeError('Browserbeleg nicht mehr quellgleich: '+path);
 }
 if(!proof.tests||proof.tests.passed!==4||proof.tests.total!==4||
    proof.tests.skipped!==0||proof.tests.failed!==0||proof.tests.flaky!==0||
    !Array.isArray(proof.tests.titles)||proof.tests.titles.length!==4||
    new Set(proof.tests.titles).size!==4||
    !Number.isFinite(proof.tests.durationMs)||proof.tests.durationMs<=0||
    !proof.tests.titles.every(x=>typeof x==='string'&&
      (x.startsWith('direct-file ')||x.startsWith('fresh actual '))))
  throw new TypeError('Kein vollständiger erfolgreicher Datei-Browserlauf dokumentiert.');
 if(!proof.constraints||proof.constraints.pageProtocol!=='file:'||
    proof.constraints.blockHttpAndWebSocket!==true||
    proof.constraints.browserOfflineMode!==true||
    proof.constraints.automatedAxeScans!==2||
    proof.constraints.pageNetworkAttempts!==0||
    proof.constraints.a4PagesGenerated!==2||
    proof.constraints.manualATReviewCompleted!==false||
    proof.constraints.externalAuthorityApproved!==false)
  throw new TypeError('Keine vollständigen Netzwerk-/Druck-/Prüfgrenzen vorhanden.');
 return Object.freeze({
  status:'VALID_SOURCE_PINNED_AUTOMATED_PROOF_ONLY',
  indexSha256:proof.sourceSha256['index.html'],
  startSha256:proof.sourceSha256['start.html'],
  cases:proof.tests.passed,
  independentApproval:false,
  publicReleaseApproved:false
 });
}
module.exports={validateDirectFileProof,digest,FILES};
