import {defineConfig} from '@playwright/test';
export default defineConfig({testDir:'./tests/e2e',testMatch:'wunschkalender.spec.mjs',workers:1,timeout:60000,
 use:{browserName:'chromium',screenshot:'only-on-failure'},outputDir:'.local-review/wunschkalender'});
