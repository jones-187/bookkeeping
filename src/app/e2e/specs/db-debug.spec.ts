/**
 * 调试测试 - 检查数据库查询
 */
import { test, expect } from '../fixtures/test';

test.describe('数据库查询调试', () => {
  test('直接测试数据库插入和查询', async ({ cleanPage }) => {
    const page = cleanPage;

    // 访问首页
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // 等待 FAB
    const fab = page.getByTestId('add-entry-fab');
    await fab.waitFor({ state: 'visible' });

    // 点击添加
    await fab.click();
    await page.getByTestId('amount-input').waitFor({ state: 'visible' });

    // 填写并提交
    await page.getByTestId('amount-input').fill('100');
    await page.getByTestId('description-input').fill('测试');
    await page.getByTestId('date-input').fill('2026-04-05');
    await page.getByTestId('submit-button').click();

    // 等待返回
    await fab.waitFor({ state: 'visible' });
    await page.waitForTimeout(1000);

    // 检查 IndexedDB 原始数据
    const rawData = await page.evaluate(() => {
      return new Promise((resolve) => {
        const request = indexedDB.open('bookkeeping');
        request.onsuccess = () => {
          const db = request.result;
          const transaction = db.transaction(['ledger_entries'], 'readonly');
          const store = transaction.objectStore('ledger_entries');
          store.getAll().onsuccess = (e) => {
            resolve((e.target as any).result);
          };
        };
        request.onerror = () => resolve([]);
      });
    });

    console.log('Raw IndexedDB data:', JSON.stringify(rawData, null, 2));

    // 监听控制台消息
    page.on('console', msg => {
      console.log('Browser console:', msg.text());
    });

    // 刷新页面触发查询
    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // 检查页面是否显示条目
    const hasEntry = await page.locator('text=/测试/').isVisible().catch(() => false);
    console.log('页面上显示"测试":', hasEntry);

    // 截图
    await page.screenshot({ path: 'test-results/db-debug.png' });

    // 验证
    expect(Array.isArray(rawData)).toBe(true);
    expect((rawData as any[]).length).toBeGreaterThan(0);
  });
});
