/**
 * 测试 aria-label 获取
 */
import { test, expect } from '../fixtures/test';

test.describe('ARIA label 测试', () => {
  test('检查条目卡片的 aria-label', async ({ cleanPage }) => {
    const page = cleanPage;

    // 添加条目
    await page.getByTestId('add-entry-fab').click();
    await page.getByTestId('amount-input').fill('35.5');
    await page.getByTestId('description-input').fill('午餐');
    await page.getByTestId('date-input').fill('2026-04-05');
    await page.getByTestId('submit-button').click();
    await page.getByTestId('add-entry-fab').waitFor({ state: 'visible' });

    // 刷新页面
    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.locator('[data-testid^="entry-item-"]').first().waitFor({ state: 'visible', timeout: 10000 });

    // 查找包含 aria-label 的元素
    const elementWithAriaLabel = page.locator('[aria-label*="账目:"]').first();
    const ariaLabel = await elementWithAriaLabel.getAttribute('aria-label');
    console.log('aria-label:', ariaLabel);

    // 截图
    await page.screenshot({ path: 'test-results/aria-label-test.png' });

    expect(ariaLabel).toContain('午餐');
  });
});
