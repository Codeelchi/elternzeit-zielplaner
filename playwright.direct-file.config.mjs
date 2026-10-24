import {defineConfig} from '@playwright/test';
import {existsSync} from 'node:fs';

// Dedicated actual file:// proof: deliberately no webServer or HTTP app URL.
// All test pages also refuse network transport and record unexpected requests.
export default defineConfig({
 testDir:'./tests/e2e',
 testMatch:'current-direct-file.spec.mjs',
 workers:1,
 fullyParallel:false,
 timeout:60000,
 reporter:'json',
 outputDir:'.local-review/direct-file-test-output',
 use:{
  browserName:'chromium',
  launchOptions:{
   executablePath:process.env.CHROMIUM_PATH||
    (existsSync('/usr/bin/chromium')?'/usr/bin/chromium':undefined),
   args:['--no-sandbox']
  },
  screenshot:'only-on-failure',
  trace:'retain-on-failure'
 }
});
