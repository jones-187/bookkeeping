/**
 * 数据流集成测试
 * 测试 Service → Repository → Database 完整链路
 *
 * 这个测试文件专注于数据层集成，不涉及 React 组件
 */
import { LedgerEntryRepository } from '../../src/features/ledger/repositories/LedgerEntryRepository';
import { LedgerEntryService } from '../../src/features/ledger/services/LedgerEntryService';
import * as SQLite from 'expo-sqlite';

// 辅助函数：清空数据库
async function clearDatabase() {
  // 必须使用与 Repository 相同的数据库名
  const db = await SQLite.openDatabaseAsync('bookkeeping.db');
  await db.execAsync('DELETE FROM ledger_entries');
}

describe('数据流集成测试', () => {
  let repository: LedgerEntryRepository;
  let service: LedgerEntryService;

  beforeEach(async () => {
    // 确保数据库完全清空
    await clearDatabase();
    repository = new LedgerEntryRepository();
    service = new LedgerEntryService(repository);
  });

  describe('完整的添加账目流程', () => {
    it('应该成功创建账目并可以查询到', async () => {
      // 通过 Service 创建
      const entry = await service.create({
        amount: 100.50,
        type: 'expense',
        description: '午餐',
        date: '2026-04-05',
      });

      expect(entry.id).toBeDefined();
      expect(entry.amount).toBe(10050); // 100.50 元 = 10050 分
      expect(entry.type).toBe('expense');
      expect(entry.description).toBe('午餐');

      // 通过 Repository 验证
      const found = await repository.findById(entry.id);
      expect(found).not.toBeNull();
      expect(found?.amount).toBe(10050);
    });

    it('应该正确计算汇总', async () => {
      await service.create({
        amount: 1000,
        type: 'income',
        description: '工资',
        date: '2026-04-01',
      });
      await service.create({
        amount: 200,
        type: 'expense',
        description: '午餐',
        date: '2026-04-02',
      });

      const summary = await service.getSummary();

      expect(summary.totalIncome).toBe(100000); // 1000 元
      expect(summary.totalExpense).toBe(20000); // 200 元
      expect(summary.balance).toBe(80000); // 800 元
      expect(summary.count).toBe(2);
    });
  });

  describe('完整的编辑账目流程', () => {
    it('应该成功更新账目', async () => {
      const entry = await service.create({
        amount: 100,
        type: 'expense',
        description: '原始描述',
        date: '2026-04-01',
      });

      const updated = await service.update({
        id: entry.id,
        description: '更新后的描述',
        amount: 200,
      });

      expect(updated.description).toBe('更新后的描述');
      expect(updated.amount).toBe(20000);

      // 验证数据库中的值
      const found = await repository.findById(entry.id);
      expect(found?.description).toBe('更新后的描述');
      expect(found?.amount).toBe(20000);
    });

    it('更新类型后汇总应该正确', async () => {
      const entry = await service.create({
        amount: 100,
        type: 'expense',
        description: '测试',
        date: '2026-04-01',
      });

      let summary = await service.getSummary();
      expect(summary.totalExpense).toBe(10000);
      expect(summary.totalIncome).toBe(0);

      await service.update({ id: entry.id, type: 'income' });

      summary = await service.getSummary();
      expect(summary.totalExpense).toBe(0);
      expect(summary.totalIncome).toBe(10000);
    });
  });

  describe('完整的删除账目流程', () => {
    it('应该成功删除账目（软删除）', async () => {
      const entry = await service.create({
        amount: 100,
        type: 'expense',
        description: '要删除',
        date: '2026-04-01',
      });

      // 删除
      await service.delete(entry.id);

      // 验证无法查询到
      const found = await repository.findById(entry.id);
      expect(found).toBeNull();

      // 验证列表为空
      const list = await service.getList();
      expect(list).toHaveLength(0);
    });

    it('删除后汇总应该更新', async () => {
      const entry = await service.create({
        amount: 500,
        type: 'income',
        description: '工资',
        date: '2026-04-01',
      });

      let summary = await service.getSummary();
      expect(summary.totalIncome).toBe(50000);

      await service.delete(entry.id);

      summary = await service.getSummary();
      expect(summary.totalIncome).toBe(0);
    });
  });

  describe('筛选功能', () => {
    it('应该正确按类型筛选', async () => {
      await service.create({ amount: 100, type: 'expense', description: '支出1', date: '2026-04-01' });
      await service.create({ amount: 200, type: 'income', description: '收入1', date: '2026-04-02' });
      await service.create({ amount: 50, type: 'expense', description: '支出2', date: '2026-04-03' });

      const incomeList = await service.getList({ type: 'income' });
      expect(incomeList).toHaveLength(1);
      expect(incomeList[0].type).toBe('income');

      const expenseList = await service.getList({ type: 'expense' });
      expect(expenseList).toHaveLength(2);
    });

    it('应该正确按日期范围筛选', async () => {
      await service.create({ amount: 100, type: 'expense', description: '4月1日', date: '2026-04-01' });
      await service.create({ amount: 100, type: 'expense', description: '4月3日', date: '2026-04-03' });
      await service.create({ amount: 100, type: 'expense', description: '4月5日', date: '2026-04-05' });

      const list = await service.getList({ startDate: '2026-04-02', endDate: '2026-04-04' });
      expect(list).toHaveLength(1);
      expect(list[0].description).toBe('4月3日');
    });
  });

  describe('验证规则', () => {
    it('金额为 0 应该抛出错误', async () => {
      await expect(service.create({
        amount: 0,
        type: 'expense',
        description: '测试',
        date: '2026-04-05',
      })).rejects.toThrow('金额必须大于0');
    });

    it('金额为负数应该抛出错误', async () => {
      await expect(service.create({
        amount: -10,
        type: 'expense',
        description: '测试',
        date: '2026-04-05',
      })).rejects.toThrow('金额必须大于0');
    });

    it('空描述应该抛出错误', async () => {
      await expect(service.create({
        amount: 100,
        type: 'expense',
        description: '',
        date: '2026-04-05',
      })).rejects.toThrow('描述不能为空');
    });

    it('无效日期格式应该抛出错误', async () => {
      await expect(service.create({
        amount: 100,
        type: 'expense',
        description: '测试',
        date: '2026/04/05',
      })).rejects.toThrow('日期格式无效');
    });

    it('未来日期应该抛出错误', async () => {
      await expect(service.create({
        amount: 100,
        type: 'expense',
        description: '测试',
        date: '2099-12-31',
      })).rejects.toThrow('日期不能晚于今天');
    });
  });

  describe('错误处理', () => {
    it('更新不存在的账目应该抛出错误', async () => {
      await expect(service.update({
        id: 'non-existent',
        amount: 100,
      })).rejects.toThrow('账目不存在');
    });

    it('删除不存在的账目应该抛出错误', async () => {
      await expect(service.delete('non-existent')).rejects.toThrow('账目不存在');
    });

    it('查询不存在的账目应该抛出错误', async () => {
      await expect(service.getById('non-existent')).rejects.toThrow('账目不存在');
    });
  });
});
