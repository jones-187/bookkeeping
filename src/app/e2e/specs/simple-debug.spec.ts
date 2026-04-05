/**
 * 最简单的调试测试
 */
import { test, expect } from '../fixtures/test';

test.describe('简单调试', () => {
  test('添加条目并验证', async ({ cleanPage }) => {
    const page = cleanPage;

    // 添加条目
    await page.getByTestId('add-entry-fab').click();
    await page.getByTestId('amount-input').fill('35.5');
    await page.getByTestId('description-input').fill('午餐');
    await page.getByTestId('date-input').fill('2026-04-05');
    await page.getByTestId('submit-button').click();

    // 等待返回列表
    await page.getByTestId('add-entry-fab').waitFor({ state: 'visible' });

    // 刷新页面
    await page.reload();
    await page.waitForLoadState('networkidle');

    // 等待条目或空状态
    await Promise.race([
      page.locator('[data-testid^="entry-item-"]').first().waitFor({ state: 'visible', timeout: 10000 }),
      page.getByTestId('empty-state').waitFor({ state: 'visible', timeout: 10000 }),
    ]);

    // 检查条目是否存在
    const entryCount = await page.locator('[data-testid^="entry-item-"]').count();
    console.log('条目数量:', entryCount);

    // 截图
    await page.screenshot({ path: 'test-results/simple-debug.png' });

    // 验证
    expect(entryCount).toBeGreaterThan(0);
  });
});
