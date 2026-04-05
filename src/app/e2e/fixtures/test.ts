/**
 * 自定义测试 fixture
 * 每个测试前清空 IndexedDB，确保测试隔离
 */
import { test as base, Page } from '@playwright/test';

/**
 * 扩展的测试 fixture
 */
export const test = base.extend<{
  /**
   * 已清空数据库的页面对象
   */
  cleanPage: Page;
}>({
  cleanPage: async ({ page }, use) => {
    // 访问页面并清空数据库
    await page.goto('/');
    await page.evaluate(() => {
      return new Promise<void>((resolve) => {
        const request = indexedDB.deleteDatabase('bookkeeping');
        request.onsuccess = () => resolve();
        request.onerror = () => resolve();
        request.onblocked = () => resolve();
      });
    });
    await use(page);
  },
});

export { expect } from '@playwright/test';
