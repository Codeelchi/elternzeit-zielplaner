import { existsSync } from 'node:fs';
import { defineConfig } from '@playwright/test';
const port=process.env.PLAYWRIGHT_PORT || '8765';
export default defineConfig({
  testDir: './tests/e2e',
  webServer: { command: `python3 -m http.server ${port} --bind 127.0.0.1`, url: `http://127.0.0.1:${port}/index.html`, reuseExistingServer: true },
  fullyParallel: false,
  workers: 1,
  timeout: 120000,
  reporter: [['list'], ['json', { outputFile: 'qa/browser-results.json' }]],
  outputDir: 'qa/browser-artifacts',
  use: { browserName: 'chromium', launchOptions: { executablePath: process.env.CHROMIUM_PATH || (existsSync('/usr/bin/chromium') ? '/usr/bin/chromium' : undefined), args: ['--no-sandbox'] }, screenshot: 'only-on-failure', trace: 'retain-on-failure' },
});
