/**
 * useEntries Hook 核心逻辑集成测试
 * 测试 Hook 底层数据流与数据库的交互
 */
import { LedgerEntryRepository } from '../../src/repositories/LedgerEntryRepository';
import { LedgerEntryService } from '../../src/services/LedgerEntryService';
import * as SQLite from 'expo-sqlite';

// 辅助函数：清空数据库
async function clearDatabase() {
  const db = await SQLite.openDatabaseAsync('bookkeeping.db');
  await db.execAsync('DELETE FROM ledger_entries');
}

describe('useEntries Hook 核心逻辑集成测试', () => {
  describe('数据加载逻辑 (Repository)', () => {
    it('应该正确获取空的账目列表', async () => {
      await clearDatabase();
      const repo = new LedgerEntryRepository();

      const entries = await repo.findAll();
      expect(entries).toEqual([]);

      const count = await repo.count();
      expect(count).toBe(0);
    });

    it('应该正确获取已有数据', async () => {
      await clearDatabase();
      const repo = new LedgerEntryRepository();

      await repo.create({ amount: 10000, type: 'expense', description: '支出', date: '2026-04-01' });
      await repo.create({ amount: 50000, type: 'income', description: '收入', date: '2026-04-02' });

      const entries = await repo.findAll();
      expect(entries).toHaveLength(2);
    });
  });

  describe('筛选功能逻辑 (Repository)', () => {
    it('应该正确按类型筛选', async () => {
      await clearDatabase();
      const repo = new LedgerEntryRepository();

      await repo.create({ amount: 10000, type: 'expense', description: '支出', date: '2026-04-01' });
      await repo.create({ amount: 20000, type: 'income', description: '收入', date: '2026-04-02' });

      const entries = await repo.findAll({ type: 'income' });
      expect(entries).toHaveLength(1);
      expect(entries[0].type).toBe('income');
    });

    it('应该正确按日期范围筛选', async () => {
      await clearDatabase();
      const repo = new LedgerEntryRepository();

      await repo.create({ amount: 10000, type: 'expense', description: '支出1', date: '2026-04-01' });
      await repo.create({ amount: 20000, type: 'expense', description: '支出2', date: '2026-04-03' });
      await repo.create({ amount: 30000, type: 'expense', description: '支出3', date: '2026-04-05' });

      const entries = await repo.findAll({
        startDate: '2026-04-02',
        endDate: '2026-04-04'
      });
      expect(entries).toHaveLength(1);
      expect(entries[0].description).toBe('支出2');
    });
  });

  describe('Service 层集成', () => {
    it('Service 应该正确协调数据流', async () => {
      await clearDatabase();
      const service = new LedgerEntryService(new LedgerEntryRepository());

      // 创建
      const entry = await service.create({
        amount: 150, // 元
        type: 'expense',
        description: '测试消费',
        date: '2026-04-05'
      });
      expect(entry.id).toBeDefined();
      expect(entry.amount).toBe(15000); // 分

      // 查询
      const found = await service.getById(entry.id);
      expect(found).not.toBeNull();
      expect(found.description).toBe('测试消费');

      // 更新
      const updated = await service.update({ id: entry.id, amount: 200 }); // 元
      expect(updated.amount).toBe(20000); // 分

      // 汇总
      const summary = await service.getSummary();
      expect(summary.totalExpense).toBe(20000);
      expect(summary.count).toBe(1);

      // 删除
      await service.delete(entry.id);
      const afterDelete = await service.getList();
      expect(afterDelete).toHaveLength(0);
    });

    it('Service 应该正确计算汇总', async () => {
      await clearDatabase();
      const service = new LedgerEntryService(new LedgerEntryRepository());

      await service.create({ amount: 100, type: 'expense', description: '支出', date: '2026-04-01' });
      await service.create({ amount: 500, type: 'income', description: '收入', date: '2026-04-02' });

      const summary = await service.getSummary();
      expect(summary.totalIncome).toBe(50000); // 500元 = 50000分
      expect(summary.totalExpense).toBe(10000); // 100元 = 10000分
      expect(summary.balance).toBe(40000); // 400元 = 40000分
      expect(summary.count).toBe(2);
    });
  });
});
