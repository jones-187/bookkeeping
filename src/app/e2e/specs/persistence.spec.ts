/**
 * 数据持久化测试
 * 测试刷新页面后数据是否仍然存在
 */
import { test, expect } from '../fixtures/test';
import { LedgerListPage } from '../pages/LedgerListPage';
import { EntryFormPage } from '../pages/EntryFormPage';

test.describe('数据持久化', () => {
  let listPage: LedgerListPage;
  let formPage: EntryFormPage;

  test.beforeEach(async ({ cleanPage }) => {
    listPage = new LedgerListPage(cleanPage);
    formPage = new EntryFormPage(cleanPage);
    await listPage.goto();
    await listPage.waitForLoad();
  });

  test.describe('添加后持久化', () => {
    test('添加账目后刷新页面，数据应该仍然存在', async () => {
      // 添加一条账目
      await listPage.clickAddButton();
      await formPage.fillForm({
        type: 'expense',
        amount: 88.88,
        description: '持久化测试账目',
        date: '2026-04-05',
      });
      await formPage.submit();
      await listPage.waitForLoad();

      // 验证添加成功
      await listPage.assertEntryCount(1);

      // 刷新页面
      await listPage.page.reload();
      await listPage.waitForLoad();

      // 验证数据仍然存在
      await listPage.assertEntryCount(1);
      const entries = await listPage.getEntries();
      expect(entries[0].description).toContain('持久化测试账目');
      expect(entries[0].amount).toContain('88.88');
    });

    test('添加多条账目后刷新页面，所有数据应该仍然存在', async () => {
      // 添加 3 条账目
      for (let i = 1; i <= 3; i++) {
        await listPage.clickAddButton();
        await formPage.fillForm({
          type: i % 2 === 0 ? 'income' : 'expense',
          amount: i * 50,
          description: `账目 ${i}`,
          date: `2026-04-0${i}`,
        });
        await formPage.submit();
        await listPage.waitForLoad();
      }

      await listPage.assertEntryCount(3);

      // 刷新页面
      await listPage.page.reload();
      await listPage.waitForLoad();

      // 验证所有数据仍然存在
      await listPage.assertEntryCount(3);
    });

    test('添加后刷新页面，汇总数据应该正确', async () => {
      // 添加收入
      await listPage.clickAddButton();
      await formPage.fillForm({
        type: 'income',
        amount: 5000,
        description: '工资',
        date: '2026-04-01',
      });
      await formPage.submit();
      await listPage.waitForLoad();

      // 添加支出
      await listPage.clickAddButton();
      await formPage.fillForm({
        type: 'expense',
        amount: 200,
        description: '购物',
        date: '2026-04-02',
      });
      await formPage.submit();
      await listPage.waitForLoad();

      // 刷新页面
      await listPage.page.reload();
      await listPage.waitForLoad();

      // 验证汇总数据
      const summary = await listPage.getSummary();
      expect(summary.totalIncome).toContain('5,000');
      expect(summary.totalExpense).toContain('200');
    });
  });

  test.describe('编辑后持久化', () => {
    test('编辑账目后刷新页面，修改应该仍然存在', async () => {
      // 先添加一条账目
      await listPage.clickAddButton();
      await formPage.fillForm({
        amount: 100,
        description: '原始描述',
        date: '2026-04-01',
      });
      await formPage.submit();
      await listPage.waitForLoad();

      // 编辑
      const entryId = await listPage.getEntryIdByDescription('原始描述');
      await listPage.clickEntry(entryId!);
      await formPage.fillForm({
        description: '修改后的描述',
        amount: 200,
      });
      await formPage.submit();
      await listPage.waitForLoad();

      // 刷新页面
      await listPage.page.reload();
      await listPage.waitForLoad();

      // 验证修改仍然存在
      const entries = await listPage.getEntries();
      expect(entries[0].description).toContain('修改后的描述');
      expect(entries[0].amount).toContain('200');
    });

    test('编辑类型后刷新页面，类型应该正确', async () => {
      // 添加支出
      await listPage.clickAddButton();
      await formPage.fillForm({
        type: 'expense',
        amount: 100,
        description: '测试类型切换',
        date: '2026-04-01',
      });
      await formPage.submit();
      await listPage.waitForLoad();

      // 编辑为收入
      const entryId = await listPage.getEntryIdByDescription('测试类型切换');
      await listPage.clickEntry(entryId!);
      await formPage.fillForm({
        type: 'income',
      });
      await formPage.submit();
      await listPage.waitForLoad();

      // 刷新页面
      await listPage.page.reload();
      await listPage.waitForLoad();

      // 验证类型
      const entries = await listPage.getEntries();
      expect(entries[0].type).toBe('income');

      // 验证汇总（应该是收入 100，支出 0）
      const summary = await listPage.getSummary();
      expect(summary.totalIncome).toContain('100');
    });

    test('编辑日期后刷新页面，日期应该正确', async () => {
      // 添加账目
      await listPage.clickAddButton();
      await formPage.fillForm({
        amount: 100,
        description: '测试日期修改',
        date: '2026-04-01',
      });
      await formPage.submit();
      await listPage.waitForLoad();

      // 编辑日期
      const entryId = await listPage.getEntryIdByDescription('测试日期修改');
      await listPage.clickEntry(entryId!);
      await formPage.fillForm({
        date: '2026-04-05',
      });
      await formPage.submit();
      await listPage.waitForLoad();

      // 刷新页面
      await listPage.page.reload();
      await listPage.waitForLoad();

      // 验证日期
      const entries = await listPage.getEntries();
      expect(entries[0].date).toBe('2026-04-05');
    });
  });

  test.describe('删除后持久化', () => {
    test('删除账目后刷新页面，账目应该仍然不存在', async () => {
      // 添加两条账目
      await listPage.clickAddButton();
      await formPage.fillForm({
        amount: 100,
        description: '账目 A',
        date: '2026-04-01',
      });
      await formPage.submit();
      await listPage.waitForLoad();

      await listPage.clickAddButton();
      await formPage.fillForm({
        amount: 200,
        description: '账目 B',
        date: '2026-04-02',
      });
      await formPage.submit();
      await listPage.waitForLoad();

      await listPage.assertEntryCount(2);

      // 删除账目 A
      const entryId = await listPage.getEntryIdByDescription('账目 A');
      await listPage.clickEntry(entryId!);
      await formPage.clickDelete();

      // 处理确认对话框（Web Alert）
      // 注意：在 Web 上，react-native 的 Alert.alert 可能表现为 window.confirm
      listPage.page.once('dialog', async (dialog) => {
        await dialog.accept();
      });

      // 等待返回列表页
      await listPage.page.waitForURL('**/', { timeout: 5000 }).catch(() => {
        // 如果超时，可能是因为 Alert 行为不同，手动返回
      });

      // 刷新页面
      await listPage.page.reload();
      await listPage.waitForLoad();

      // 验证只有账目 B 存在
      await listPage.assertEntryCount(1);
      const entries = await listPage.getEntries();
      expect(entries[0].description).toContain('账目 B');
    });
  });

  test.describe('跨会话持久化', () => {
    test('关闭浏览器标签页后重新打开，数据应该仍然存在', async () => {
      // 添加一条账目
      await listPage.clickAddButton();
      await formPage.fillForm({
        amount: 999.99,
        description: '跨会话测试',
        date: '2026-04-05',
      });
      await formPage.submit();
      await listPage.waitForLoad();

      // 记录当前 URL
      const url = listPage.page.url();

      // 模拟关闭并重新打开（通过清除上下文并重新访问）
      // 在 Playwright 中，我们通过新的浏览器上下文来模拟
      const browser = listPage.page.context().browser();
      const newContext = await browser!.newContext();
      const newPage = await newContext.newPage();

      // 访问相同 URL
      await newPage.goto(url);

      // 等待页面加载
      const newListPage = new LedgerListPage(newPage);
      await newListPage.waitForLoad();

      // 验证数据仍然存在
      await newListPage.assertEntryCount(1);
      const entries = await newListPage.getEntries();
      expect(entries[0].description).toContain('跨会话测试');

      await newContext.close();
    });
  });
});
