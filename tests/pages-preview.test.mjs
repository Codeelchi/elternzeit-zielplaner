import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,readdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {execFileSync,spawnSync} from 'node:child_process';
import path from 'node:path';
import {buildPagesPreview} from '../scripts/pages-preview-build.mjs';

const projectRoot=new URL('../',import.meta.url);
function digest(input){return createHash('sha256').update(input).digest('hex');}
function scriptBody(html){
 const matches=[...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)];
 assert.equal(matches.length,1,'only one script, no preview-injected code');
 return matches[0][1];
}
test('the public test preview publishes two HTML files only and retains source script byte for byte',()=>{
 const {out,info}=buildPagesPreview();
 assert.equal(info.releaseApproved,false);
 assert.equal(info.schemaVersion,1);
 assert.equal(info.kind,'PUBLIC_TEST_PREVIEW_NOT_RELEASE');
 assert.deepEqual(readdirSync(out).sort(),['.nojekyll','index.html','robots.txt','start.html'].sort());
 assert.equal(info.commitSha,execFileSync('git',['rev-parse','HEAD'],{cwd:new URL('../',import.meta.url),encoding:'utf8'}).trim());
 assert.equal(info.packageVersion,'3.10.0');
 assert.equal(info.ruleDate,'15.10.2026');
 for(const file of ['index.html','start.html']){
  const html=readFileSync(path.join(out,file),'utf8');
  const source=readFileSync(new URL('../'+file,import.meta.url),'utf8');
  assert.equal(info.files[file].sourceSha256,digest(source));
  assert.equal(info.files[file].publicPreviewSha256,digest(html));
  assert.equal(scriptBody(html),scriptBody(source),'preview must not change core algorithms');
  assert.match(html,/id="public-preview-notice"/);
  assert.match(html,/KEIN AMTLICHER ELTERNGELDRECHNER/);
  assert.match(html,/GitHub Pages verarbeitet Zugriffs-IP-Adressen/);
  assert.match(html,/id="public-preview-build-info"/);
  assert.match(html,/Paket 3.10.0/);
  assert.match(html,/Rechtsquellenstand 15.10.2026/);
  assert.match(html,/V3.15\/V3.16 bezeichnen historische Funktionsbereiche/);
  assert.ok(html.includes(info.commitSha));
  assert.match(html,/name="preview-commit" content="[a-f0-9]{40}"/);
  assert.match(html,/name="robots" content="noindex,nofollow,noarchive"/);
  assert.match(html,/Content-Security-Policy/);
  assert.match(html,/script-src 'sha256-[A-Za-z0-9+/=]+'/);
  assert.match(html,/connect-src 'none'/);
  assert.doesNotMatch(html,/<script[^>]+\bsrc=/i);
  assert.doesNotMatch(html,/(?:github\.com\/Codeelchi\/elternzeit-zielplaner\/blob|(?:src|data)\/independent-review)/);
 }
 assert.match(readFileSync(path.join(out,'robots.txt'),'utf8'),/Disallow: \//);
});

test('synthetic-only direction is visible in input, result, cashflow, task and export areas',()=>{
 const {out}=buildPagesPreview();
 const html=readFileSync(path.join(out,'index.html'),'utf8');
 assert.match(html,/Mit fiktiven Zahlen testen/);
 assert.match(html,/Fiktive Testwerte eingeben – nur fünf Angaben/);
 assert.match(html,/Mit fiktiven Zahlen weiter testen/);
 assert.match(html,/Fiktive Zahlungseingänge \(Testmodus\)/);
 assert.match(html,/lokale Berechnung · öffentliche Testseite/);
 assert.match(html,/Lokal berechnet · öffentlich gehostete Testseite/);
 assert.doesNotMatch(html,/Finanzielle Vergleiche benötigen echte Ausgaben/);
 assert.doesNotMatch(html,/Gehaltsabrechnungen und gegebenenfalls Bescheid bereithalten/);
 assert.doesNotMatch(html,/Weiter planen mit echten Zahlen/);
 assert.match(html,/keine persönlichen Abrechnungen oder Bescheide bereithalten oder eingeben/);
 assert.match(html,/Historische Funktionsbezeichnungen V3.15\/V3.16/);
 for(const section of ['quickstart-form','slide-2','slide-axes','slide-5','slide-6','slide-9','slide-10']){
  const marker='data-preview-context="'+section+'"';
  assert.ok(html.includes(marker),section+' required as user-visible context');
 }
 assert.equal((html.match(/data-preview-context=/g)||[]).length,7);
 assert.match(html,/Keine echten Gehaltsabrechnungen, Bescheide, Namen oder Finanzdaten eingeben, importieren oder exportieren/);
 assert.match(html,/besonders für 2027 und Sonderfälle liegt keine geprüfte Anspruchsberechnung vor/);
});
test('deployment provenance accepts only the current checkout SHA and rejects a forged one',()=>{
 const result=spawnSync(process.execPath,['scripts/pages-preview-build.mjs'],{
  cwd:new URL('../',import.meta.url),env:{...process.env,GITHUB_SHA:'0'.repeat(40)},encoding:'utf8',timeout:10000
 });
 assert.notEqual(result.status,0);
 assert.match(result.stderr,/differs from GITHUB_SHA/);
});

test('manual Pages workflow only deploys a test preview, then reads back the exact live commit and run',()=>{
 const yaml=readFileSync(new URL('../.github/workflows/pages-test-preview.yml',import.meta.url),'utf8');
 assert.match(yaml,/workflow_dispatch:/);
 assert.doesNotMatch(yaml,/^\s*push:/m,'public preview must not auto-deploy on a normal code push');
 assert.match(yaml,/confirm_public_preview/);
 assert.match(yaml,/npm run release:check/);
 assert.match(yaml,/npm run test:e2e -- tests\/e2e\/pages-preview\.spec\.mjs/);
 assert.match(yaml,/path: dist\/pages-preview/);
 assert.match(yaml,/^  verify:/m);
 assert.match(yaml,/needs: deploy/);
 assert.match(yaml,/EXPECTED_SHA: \$\{\{ github\.sha \}\}/);
 assert.match(yaml,/EXPECTED_RUN_ID: \$\{\{ github\.run_id \}\}/);
 assert.match(yaml,/grep -Fq "\$EXPECTED_SHA"/);
 assert.match(yaml,/grep -Fq "Deployment-Lauf \$EXPECTED_RUN_ID"/);
});
