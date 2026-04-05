import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright 配置
 * 用于 Web 平台 E2E 测试
 */
export default defineConfig({
  testDir: './e2e/specs',
  fullyParallel: false, // 单线程运行，避免 IndexedDB 并发问题
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1, // 单线程，避免 IndexedDB 并发问题
  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report' }],
  ],
  use: {
    baseURL: 'http://localhost:8081',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    headless: true,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'npm run web -- --port 8081',
    url: 'http://localhost:8081',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
});
