/**
 * 表单验证测试
 * 测试各种边缘情况和错误处理
 */
import { test, expect } from '../fixtures/test';
import { LedgerListPage } from '../pages/LedgerListPage';
import { EntryFormPage } from '../pages/EntryFormPage';

test.describe('表单验证', () => {
  let listPage: LedgerListPage;
  let formPage: EntryFormPage;

  test.beforeEach(async ({ cleanPage }) => {
    listPage = new LedgerListPage(cleanPage);
    formPage = new EntryFormPage(cleanPage);
    await listPage.goto();
    await listPage.waitForLoad();
  });

  test.describe('金额验证', () => {
    test('金额为 0 时应该显示错误', async () => {
      await listPage.clickAddButton();

      await formPage.fillForm({
        amount: 0,
        description: '测试',
        date: '2026-04-05',
      });

      await formPage.submitExpectingError();

      // 应该还在表单页面，未跳转
      await formPage.assertHasError();
    });

    test('金额为负数时应该显示错误', async () => {
      await listPage.clickAddButton();

      await formPage.fillForm({
        amount: -10,
        description: '测试',
        date: '2026-04-05',
      });

      await formPage.submitExpectingError();

      await formPage.assertHasError();
    });

    test('金额为空时应该显示错误', async () => {
      await listPage.clickAddButton();

      await formPage.fillForm({
        description: '测试',
        date: '2026-04-05',
      });

      await formPage.submitExpectingError();

      await formPage.assertHasError();
    });

    test('有效的金额应该能提交', async () => {
      await listPage.clickAddButton();

      await formPage.fillForm({
        amount: 0.01, // 最小金额
        description: '测试最小金额',
        date: '2026-04-05',
      });

      await formPage.submit();
      await listPage.reloadAndWait();

      await listPage.assertEntryCount(1);
    });

    test('大金额应该能正常处理', async () => {
      await listPage.clickAddButton();

      await formPage.fillForm({
        amount: 999999.99,
        description: '测试大金额',
        date: '2026-04-05',
      });

      await formPage.submit();
      await listPage.reloadAndWait();

      await listPage.assertEntryCount(1);
    });

    test('小数金额应该正确存储', async () => {
      await listPage.clickAddButton();

      await formPage.fillForm({
        amount: 12.34,
        description: '测试小数',
        date: '2026-04-05',
      });

      await formPage.submit();
      await listPage.reloadAndWait();

      const entries = await listPage.getEntries();
      expect(entries[0].amount).toContain('12.34');
    });
  });

  test.describe('描述验证', () => {
    test('空描述应该显示错误', async () => {
      await listPage.clickAddButton();

      await formPage.fillForm({
        amount: 100,
        description: '',
        date: '2026-04-05',
      });

      await formPage.submitExpectingError();

      await formPage.assertHasError();
    });

    test('只有空格的描述应该显示错误', async () => {
      await listPage.clickAddButton();

      await formPage.fillForm({
        amount: 100,
        description: '   ',
        date: '2026-04-05',
      });

      await formPage.submitExpectingError();

      await formPage.assertHasError();
    });

    test('有效描述应该能提交', async () => {
      await listPage.clickAddButton();

      await formPage.fillForm({
        amount: 100,
        description: '正常描述',
        date: '2026-04-05',
      });

      await formPage.submit();
      await listPage.reloadAndWait();

      await listPage.assertEntryCount(1);
    });

    test('长描述应该能正常处理', async () => {
      await listPage.clickAddButton();

      const longDescription = '这是一段很长的描述'.repeat(10);
      await formPage.fillForm({
        amount: 100,
        description: longDescription,
        date: '2026-04-05',
      });

      await formPage.submit();
      await listPage.reloadAndWait();

      await listPage.assertEntryCount(1);
    });
  });

  test.describe('日期验证', () => {
    test('无效日期格式应该显示错误', async () => {
      await listPage.clickAddButton();

      await formPage.fillForm({
        amount: 100,
        description: '测试',
        date: '2026/04/05', // 错误格式
      });

      await formPage.submitExpectingError();

      await formPage.assertHasError();
    });

    test('未来日期应该显示错误', async () => {
      await listPage.clickAddButton();

      await formPage.fillForm({
        amount: 100,
        description: '测试',
        date: '2099-12-31',
      });

      await formPage.submitExpectingError();

      await formPage.assertHasError();
    });

    test('空日期应该使用默认值（今天）', async () => {
      await listPage.clickAddButton();

      await formPage.fillForm({
        amount: 100,
        description: '测试',
        // 不填写日期，使用默认值
      });

      await formPage.submit();
      await listPage.reloadAndWait();

      await listPage.assertEntryCount(1);
    });

    test('有效的历史日期应该能提交', async () => {
      await listPage.clickAddButton();

      await formPage.fillForm({
        amount: 100,
        description: '测试历史日期',
        date: '2020-01-01',
      });

      await formPage.submit();
      await listPage.reloadAndWait();

      await listPage.assertEntryCount(1);
    });

    test('今天的日期应该能提交', async () => {
      await listPage.clickAddButton();

      const today = new Date().toISOString().split('T')[0];
      await formPage.fillForm({
        amount: 100,
        description: '测试今天日期',
        date: today,
      });

      await formPage.submit();
      await listPage.reloadAndWait();

      await listPage.assertEntryCount(1);
    });
  });

  test.describe('类型切换', () => {
    test('默认类型应该是支出', async () => {
      await listPage.clickAddButton();

      // 不选择类型，直接填写其他字段
      await formPage.fillForm({
        amount: 100,
        description: '测试默认类型',
        date: '2026-04-05',
      });

      await formPage.submit();
      await listPage.reloadAndWait();

      const entries = await listPage.getEntries();
      expect(entries[0].type).toBe('expense');
    });

    test('应该能切换类型并正确保存', async () => {
      await listPage.clickAddButton();

      await formPage.fillForm({
        type: 'income',
        amount: 100,
        description: '测试收入类型',
        date: '2026-04-05',
      });

      await formPage.submit();
      await listPage.reloadAndWait();

      const entries = await listPage.getEntries();
      expect(entries[0].type).toBe('income');
    });
  });

  test.describe('编辑时的验证', () => {
    test('编辑时清空金额应该显示错误', async () => {
      // 先添加一条账目
      await listPage.clickAddButton();
      await formPage.fillForm({
        amount: 100,
        description: '原始账目',
        date: '2026-04-01',
      });
      await formPage.submit();
      await listPage.reloadAndWait();

      // 进入编辑
      const entryId = await listPage.getEntryIdByDescription('原始账目');
      await listPage.clickEntry(entryId!);

      // 清空金额
      await formPage.fillAmount(0);
      await formPage.submitExpectingError();

      await formPage.assertHasError();
    });

    test('编辑时清空描述应该显示错误', async () => {
      // 先添加一条账目
      await listPage.clickAddButton();
      await formPage.fillForm({
        amount: 100,
        description: '原始账目',
        date: '2026-04-01',
      });
      await formPage.submit();
      await listPage.reloadAndWait();

      // 进入编辑
      const entryId = await listPage.getEntryIdByDescription('原始账目');
      await listPage.clickEntry(entryId!);

      // 清空描述
      await formPage.fillDescription('');
      await formPage.submitExpectingError();

      await formPage.assertHasError();
    });
  });
});
