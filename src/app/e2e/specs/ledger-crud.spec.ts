/**
 * 核心用户流程测试
 * 测试添加、列表显示、编辑、删除账目的完整流程
 */
import { test, expect } from '../fixtures/test';
import { LedgerListPage } from '../pages/LedgerListPage';
import { EntryFormPage } from '../pages/EntryFormPage';

test.describe('核心用户流程', () => {
  let listPage: LedgerListPage;
  let formPage: EntryFormPage;

  test.beforeEach(async ({ cleanPage }) => {
    listPage = new LedgerListPage(cleanPage);
    formPage = new EntryFormPage(cleanPage);
    await listPage.goto();
    await listPage.page.waitForLoadState('networkidle');
  });

  test('初始状态应该显示空状态', async () => {
    await listPage.assertEmptyState();
    await listPage.assertEntryCount(0);
  });

  test('应该能够添加支出账目', async () => {
    await listPage.clickAddButton();
    await formPage.fillForm({
      type: 'expense',
      amount: 35.5,
      description: '午餐',
      date: '2026-04-05',
    });
    await formPage.submit();
    await listPage.waitForLoad();

    await listPage.assertEntryCount(1);
    const entries = await listPage.getEntries();
    expect(entries[0].description).toContain('午餐');
    expect(entries[0].type).toBe('expense');
    expect(entries[0].amount).toContain('-');
  });

  test('应该能够添加收入账目', async () => {
    await listPage.clickAddButton();
    await formPage.fillForm({
      type: 'income',
      amount: 10000,
      description: '工资',
      date: '2026-04-01',
    });
    await formPage.submit();
    await listPage.waitForLoad();

    await listPage.assertEntryCount(1);
    const entries = await listPage.getEntries();
    expect(entries[0].description).toContain('工资');
    expect(entries[0].type).toBe('income');
    expect(entries[0].amount).toContain('+');
  });

  test('汇总数据应该正确计算', async () => {
    // 添加收入
    await listPage.clickAddButton();
    await formPage.fillForm({
      type: 'income',
      amount: 5000,
      description: '工资',
      date: '2026-04-01',
    });
    await formPage.submit();

    // 添加支出
    await listPage.clickAddButton();
    await formPage.fillForm({
      type: 'expense',
      amount: 100,
      description: '交通',
      date: '2026-04-02',
    });
    await formPage.submit();
    await listPage.waitForLoad();

    const summary = await listPage.getSummary();
    expect(summary.totalIncome).toContain('5000');
    expect(summary.totalExpense).toContain('100');
    expect(summary.balance).toContain('4900');
  });

  test('应该能够编辑账目', async () => {
    // 添加账目
    await listPage.clickAddButton();
    await formPage.fillForm({
      type: 'expense',
      amount: 50,
      description: '原始描述',
      date: '2026-04-01',
    });
    await formPage.submit();
    await listPage.waitForLoad();

    // 编辑
    const entryId = await listPage.getEntryIdByDescription('原始描述');
    expect(entryId).not.toBeNull();
    await listPage.clickEntry(entryId!);
    await formPage.fillForm({
      description: '修改后的描述',
      amount: 80,
    });
    await formPage.submit();
    await listPage.waitForLoad();

    const entries = await listPage.getEntries();
    expect(entries[0].description).toContain('修改后的描述');
    expect(entries[0].amount).toContain('80');
  });

  test('应该能够删除账目', async () => {
    // 添加账目
    await listPage.clickAddButton();
    await formPage.fillForm({
      type: 'expense',
      amount: 100,
      description: '要删除的账目',
      date: '2026-04-01',
    });
    await formPage.submit();
    await listPage.waitForLoad();

    await listPage.assertEntryCount(1);

    // 进入编辑页面删除
    const entryId = await listPage.getEntryIdByDescription('要删除的账目');
    expect(entryId).not.toBeNull();
    await listPage.clickEntry(entryId!);

    // 设置对话框处理器（在点击删除前）
    listPage.page.on('dialog', async (dialog) => {
      await dialog.accept();
    });

    await formPage.clickDelete();

    // 等待删除操作完成并返回列表页
    await listPage.page.waitForTimeout(2000);

    // 验证删除成功
    await listPage.assertEntryCount(0);
    await listPage.assertEmptyState();
  });

  test('账目列表应该按日期排序', async () => {
    // 添加 3 条账目
    for (const [date, desc, amount] of [
      ['2026-04-03', '4月3日', 100],
      ['2026-04-01', '4月1日', 200],
      ['2026-04-05', '4月5日', 150],
    ] as const) {
      await listPage.clickAddButton();
      await formPage.fillForm({
        type: 'expense',
        amount,
        description: desc,
        date,
      });
      await formPage.submit();
    }
    await listPage.waitForLoad();

    const entries = await listPage.getEntries();
    expect(entries).toHaveLength(3);
    expect(entries[0].date).toBe('2026-04-05');
    expect(entries[1].date).toBe('2026-04-03');
    expect(entries[2].date).toBe('2026-04-01');
  });

  test('应该能够处理多笔账目', async () => {
    // 添加 5 笔账目
    for (let i = 1; i <= 5; i++) {
      await listPage.clickAddButton();
      await formPage.fillForm({
        type: i % 2 === 0 ? 'income' : 'expense',
        amount: i * 10,
        description: `账目 ${i}`,
        date: `2026-04-0${i}`,
      });
      await formPage.submit();
    }
    await listPage.waitForLoad();

    await listPage.assertEntryCount(5);

    const summary = await listPage.getSummary();
    expect(summary.totalIncome).toContain('60'); // 20 + 40
    expect(summary.totalExpense).toContain('90'); // 10 + 30 + 50
  });
});
