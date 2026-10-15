import { existsSync } from 'node:fs';
import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './tests/e2e',
  webServer: { command: 'python3 -m http.server 8765 --bind 127.0.0.1', url: 'http://127.0.0.1:8765/index.html', reuseExistingServer: true },
  fullyParallel: false,
  workers: 1,
  timeout: 120000,
  reporter: [['list'], ['json', { outputFile: 'qa/browser-results.json' }]],
  outputDir: 'qa/browser-artifacts',
  use: { browserName: 'chromium', launchOptions: { executablePath: process.env.CHROMIUM_PATH || (existsSync('/usr/bin/chromium') ? '/usr/bin/chromium' : undefined), args: ['--no-sandbox'] }, screenshot: 'only-on-failure', trace: 'retain-on-failure' },
});
