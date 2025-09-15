import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  timeout: 60_000,
  testDir: './tests/e2e',
  outputDir: 'test-results',
  globalSetup: require.resolve('./tests/global-setup'),
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [['list'], ['html', { outputFolder: 'playwright-report', open: 'never' }]],
  use: {
    baseURL: process.env.E2E_FRONTEND || 'http://localhost:3002',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: [
    {
      command: 'npm run dev',
      cwd: '../backend',
      port: 3006,
      reuseExistingServer: true,
      env: {
        DEV_LOGIN_ENABLED: 'true',
        SESSION_SECRET: 'testsecret',
        JWT_SECRET: 'testsecret',
      },
    },
    {
      command: 'npm run dev',
      cwd: '.',
      port: 3002,
      reuseExistingServer: true,
    },
  ],
});


