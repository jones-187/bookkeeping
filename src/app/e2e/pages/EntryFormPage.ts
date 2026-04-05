/**
 * 账目表单页 Page Object
 * 用于添加和编辑账目
 */
import { Page, Locator, expect } from '@playwright/test';

/**
 * 表单数据
 */
export interface EntryFormData {
  type: 'income' | 'expense';
  amount: number;
  description: string;
  date: string;
}

/**
 * 账目表单页 Page Object
 */
export class EntryFormPage {
  readonly page: Page;
  readonly typeSelector: Locator;
  readonly typeExpense: Locator;
  readonly typeIncome: Locator;
  readonly amountInput: Locator;
  readonly descriptionInput: Locator;
  readonly dateInput: Locator;
  readonly submitButton: Locator;
  readonly deleteButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.typeSelector = page.getByTestId('type-selector');
    this.typeExpense = page.getByTestId('type-expense');
    this.typeIncome = page.getByTestId('type-income');
    this.amountInput = page.getByTestId('amount-input');
    this.descriptionInput = page.getByTestId('description-input');
    this.dateInput = page.getByTestId('date-input');
    this.submitButton = page.getByTestId('submit-button');
    this.deleteButton = page.getByTestId('delete-button');
  }

  /**
   * 选择类型
   */
  async selectType(type: 'income' | 'expense'): Promise<void> {
    if (type === 'income') {
      await this.typeIncome.click();
    } else {
      await this.typeExpense.click();
    }
  }

  /**
   * 填写金额
   */
  async fillAmount(amount: number): Promise<void> {
    await this.amountInput.clear();
    await this.amountInput.fill(String(amount));
  }

  /**
   * 填写描述
   */
  async fillDescription(description: string): Promise<void> {
    await this.descriptionInput.clear();
    await this.descriptionInput.fill(description);
  }

  /**
   * 填写日期
   */
  async fillDate(date: string): Promise<void> {
    await this.dateInput.clear();
    await this.dateInput.fill(date);
  }

  /**
   * 填写完整表单
   */
  async fillForm(data: Partial<EntryFormData>): Promise<void> {
    if (data.type !== undefined) {
      await this.selectType(data.type);
    }
    if (data.amount !== undefined) {
      await this.fillAmount(data.amount);
    }
    if (data.description !== undefined) {
      await this.fillDescription(data.description);
    }
    if (data.date !== undefined) {
      await this.fillDate(data.date);
    }
  }

  /**
   * 提交表单
   */
  async submit(): Promise<void> {
    await this.submitButton.click();
    // 等待返回列表页（通过检测列表元素而不是 URL）
    // 先等待 FAB 出现，然后等待条目加载
    await this.page.getByTestId('add-entry-fab').waitFor({ state: 'visible', timeout: 10000 });
    // 额外等待数据加载
    await this.page.waitForTimeout(1000);
  }

  /**
   * 点击删除按钮
   * 注意：删除有确认对话框，需要额外处理
   */
  async clickDelete(): Promise<void> {
    await this.deleteButton.click();
  }

  /**
   * 确认删除对话框
   */
  async confirmDelete(): Promise<void> {
    // Web 上 Alert.alert 在 React Native Web 中可能表现为 window.confirm
    // 等待返回列表页（通过检测列表元素而不是 URL）
    await this.page.getByTestId('add-entry-fab').waitFor({ state: 'visible', timeout: 10000 });
  }

  /**
   * 获取金额错误信息
   */
  async getAmountError(): Promise<string | null> {
    const errorLocator = this.amountInput.locator('xpath=../..').locator('text=/金额必须|金额为正/');
    if (await errorLocator.isVisible()) {
      return await errorLocator.textContent();
    }
    return null;
  }

  /**
   * 获取描述错误信息
   */
  async getDescriptionError(): Promise<string | null> {
    const errorLocator = this.descriptionInput.locator('xpath=../..').locator('text=/描述不能为空/');
    if (await errorLocator.isVisible()) {
      return await errorLocator.textContent();
    }
    return null;
  }

  /**
   * 获取日期错误信息
   */
  async getDateError(): Promise<string | null> {
    const errorLocator = this.dateInput.locator('xpath=../..').locator('text=/日期格式|日期不能/');
    if (await errorLocator.isVisible()) {
      return await errorLocator.textContent();
    }
    return null;
  }

  /**
   * 提交表单（用于验证错误场景，不等待返回列表页）
   */
  async submitExpectingError(): Promise<void> {
    await this.submitButton.click();
    // 等待一小段时间让验证错误显示
    await this.page.waitForTimeout(500);
  }

  /**
   * 断言表单有错误
   */
  async assertHasError(): Promise<void> {
    // 提交按钮应该还在页面上（表单未提交成功）
    await expect(this.submitButton).toBeVisible();
  }
}
