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
  timeout: 60000, // 每个测试最长 60 秒
  expect: {
    timeout: 10000, // 断言超时 10 秒
  },
  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report' }],
  ],
  use: {
    baseURL: 'http://localhost:8081',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    headless: true,
    actionTimeout: 10000, // 每个操作超时 10 秒
    navigationTimeout: 30000, // 导航超时 30 秒
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
