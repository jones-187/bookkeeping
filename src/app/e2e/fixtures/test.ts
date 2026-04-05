/**
 * 自定义测试 fixture
 * 每个测试前清空 IndexedDB，确保测试隔离
 */
import { test as base, Page } from '@playwright/test';

/**
 * 清空 IndexedDB 数据库
 */
async function clearIndexedDB(page: Page): Promise<void> {
  await page.evaluate(() => {
    return new Promise<void>((resolve) => {
      const request = indexedDB.deleteDatabase('bookkeeping');
      request.onsuccess = () => resolve();
      request.onerror = () => resolve(); // 即使失败也继续
      request.onblocked = () => resolve(); // 被阻塞时也继续
    });
  });
}

/**
 * 扩展的测试 fixture
 */
export const test = base.extend<{
  /**
   * 清空数据库的页面对象
   */
  cleanPage: Page;
}>({
  cleanPage: async ({ page }, use) => {
    // 每个测试前清空数据库
    await page.goto('/');
    await clearIndexedDB(page);
    await use(page);
  },
});

export { expect } from '@playwright/test';
