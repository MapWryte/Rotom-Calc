// @ts-check
const { defineConfig, devices } = require('@playwright/test');

/**
 * Rotom-Calc is a single self-contained HTML file (index.html) — no build step,
 * no server-side logic, no relative asset fetches. It's loaded directly via
 * file:// in tests (see tests/helpers.js), so there is intentionally no
 * `webServer` block here.
 *
 * If you ever split assets out of index.html (separate .js/.css files), switch
 * to `npx serve .` + a `baseURL`/`webServer` block instead — file:// pages
 * can't fetch relative resources under Chromium's default security model.
 */
module.exports = defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: [['html', { open: 'never' }]],

  use: {
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
});
