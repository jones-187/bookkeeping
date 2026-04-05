/**
 * 账目列表页 Page Object
 */
import { Page, Locator, expect } from '@playwright/test';

/**
 * 账目条目数据
 */
export interface Entry {
  id: string;
  description: string;
  amount: string;
  type: 'income' | 'expense';
  date: string;
}

/**
 * 汇总数据
 */
export interface Summary {
  totalIncome: string;
  totalExpense: string;
  balance: string;
}

/**
 * 账目列表页 Page Object
 */
export class LedgerListPage {
  readonly page: Page;
  readonly summaryCard: Locator;
  readonly totalIncome: Locator;
  readonly totalExpense: Locator;
  readonly balance: Locator;
  readonly entryList: Locator;
  readonly emptyState: Locator;
  readonly addFab: Locator;

  constructor(page: Page) {
    this.page = page;
    this.summaryCard = page.getByTestId('summary-card');
    this.totalIncome = page.getByTestId('total-income');
    this.totalExpense = page.getByTestId('total-expense');
    this.balance = page.getByTestId('balance');
    this.entryList = page.getByTestId('entry-list');
    this.emptyState = page.getByTestId('empty-state');
    this.addFab = page.getByTestId('add-entry-fab');
  }

  /**
   * 导航到列表页
   */
  async goto(): Promise<void> {
    await this.page.goto('/');
  }

  /**
   * 等待页面加载完成
   */
  async waitForLoad(): Promise<void> {
    // 等待汇总卡片或空状态出现
    await Promise.race([
      this.summaryCard.waitFor({ state: 'visible' }),
      this.emptyState.waitFor({ state: 'visible' }),
    ]);
  }

  /**
   * 获取汇总数据
   */
  async getSummary(): Promise<Summary> {
    const incomeText = await this.totalIncome.textContent() || '¥0';
    const expenseText = await this.totalExpense.textContent() || '¥0';
    const balanceText = await this.balance.textContent() || '¥0';

    return {
      totalIncome: incomeText,
      totalExpense: expenseText,
      balance: balanceText,
    };
  }

  /**
   * 获取所有账目条目
   */
  async getEntries(): Promise<Entry[]> {
    const cards = await this.page.locator('[data-testid^="entry-item-"]').all();
    const entries: Entry[] = [];

    for (const card of cards) {
      const testId = await card.getAttribute('data-testid') || '';
      const id = testId.replace('entry-item-', '');

      const description = await card.locator('text=/^(?!\\+|\\-|¥)/').first().textContent() || '';

      // 获取金额（带 +/- 前缀）
      const amountText = await card.locator('text=/^[+\\-]/').textContent() || '';

      // 判断类型
      const type = amountText.startsWith('+') ? 'income' : 'expense';

      // 获取日期
      const dateText = await card.locator('text=/^\\d{4}-\\d{2}-\\d{2}$/').textContent() || '';

      entries.push({
        id,
        description: description.trim(),
        amount: amountText,
        type,
        date: dateText,
      });
    }

    return entries;
  }

  /**
   * 检查是否为空状态
   */
  async isEmptyState(): Promise<boolean> {
    return await this.emptyState.isVisible();
  }

  /**
   * 点击添加按钮
   */
  async clickAddButton(): Promise<void> {
    await this.addFab.click();
    // 等待表单页面加载
    await this.page.waitForURL('**/add');
  }

  /**
   * 点击指定条目进入编辑
   */
  async clickEntry(entryId: string): Promise<void> {
    await this.page.getByTestId(`entry-item-${entryId}`).click();
    // 等待编辑页面加载
    await this.page.waitForURL('**/edit/**');
  }

  /**
   * 根据描述获取条目 ID
   */
  async getEntryIdByDescription(description: string): Promise<string | null> {
    const entries = await this.getEntries();
    const entry = entries.find(e => e.description.includes(description));
    return entry?.id || null;
  }

  /**
   * 断言汇总数据
   */
  async assertSummary(expected: Partial<Summary>): Promise<void> {
    const summary = await this.getSummary();

    if (expected.totalIncome !== undefined) {
      expect(summary.totalIncome).toContain(expected.totalIncome);
    }
    if (expected.totalExpense !== undefined) {
      expect(summary.totalExpense).toContain(expected.totalExpense);
    }
    if (expected.balance !== undefined) {
      expect(summary.balance).toContain(expected.balance);
    }
  }

  /**
   * 断言条目数量
   */
  async assertEntryCount(count: number): Promise<void> {
    const entries = await this.getEntries();
    expect(entries).toHaveLength(count);
  }

  /**
   * 断言为空状态
   */
  async assertEmptyState(): Promise<void> {
    await expect(this.emptyState).toBeVisible();
  }
}
