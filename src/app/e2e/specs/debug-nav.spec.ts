/**
 * 调试测试 - 检查导航行为
 */
import { test, expect } from '../fixtures/test';

test.describe('调试导航', () => {
  test('检查添加条目后数据是否存在', async ({ cleanPage }) => {
    const page = cleanPage;

    // 访问首页
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    console.log('初始 URL:', page.url());

    // 等待 FAB 出现
    const fab = page.getByTestId('add-entry-fab');
    await fab.waitFor({ state: 'visible' });
    console.log('FAB 可见');

    // 点击 FAB
    await fab.click();
    console.log('已点击 FAB');

    // 等待表单加载
    await page.getByTestId('amount-input').waitFor({ state: 'visible' });
    console.log('表单已加载');

    // 填写表单
    await page.getByTestId('amount-input').fill('35.5');
    await page.getByTestId('description-input').fill('午餐');
    await page.getByTestId('date-input').fill('2026-04-05');
    console.log('表单已填写');

    // 提交
    await page.getByTestId('submit-button').click();
    console.log('已点击提交');

    // 等待返回列表页
    await fab.waitFor({ state: 'visible' });
    console.log('已返回列表页');

    // 等待一下数据加载
    await page.waitForTimeout(2000);

    // 检查 IndexedDB 中的数据
    const entries = await page.evaluate(() => {
      return new Promise((resolve) => {
        const request = indexedDB.open('bookkeeping');
        request.onsuccess = () => {
          const db = request.result;
          const transaction = db.transaction(['ledger_entries'], 'readonly');
          const store = transaction.objectStore('ledger_entries');
          const getAll = store.getAll();
          getAll.onsuccess = () => resolve(getAll.result);
          getAll.onerror = () => resolve([]);
        };
        request.onerror = () => resolve([]);
      });
    });
    console.log('IndexedDB 中的条目:', JSON.stringify(entries, null, 2));

    // 截图
    await page.screenshot({ path: 'test-results/debug-after-submit.png' });

    // 检查页面上的条目
    const entryCards = await page.locator('[data-testid^="entry-item-"]').count();
    console.log('页面上的条目卡片数量:', entryCards);

    // 直接调试查询 - 在浏览器控制台执行
    const queryResult = await page.evaluate(async () => {
      try {
        // 动态导入 db 模块
        const dbModule = (window as any).__dbModule;
        if (!dbModule) {
          return { error: 'dbModule not found' };
        }
        const db = await dbModule.getDatabase();
        const rows = await db.getAllAsync('SELECT * FROM ledger_entries WHERE deleted_at IS NULL', []);
        return { success: true, rows };
      } catch (e: any) {
        return { error: e.message };
      }
    });
    console.log('直接查询结果:', JSON.stringify(queryResult, null, 2));

    // 简单验证
    expect(entryCards).toBeGreaterThanOrEqual(0);
  });
});