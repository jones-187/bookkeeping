/**
 * 账目流水 Repository 测试
 */
import { LedgerEntryRepository } from '../../src/features/ledger/repositories/LedgerEntryRepository';
import type { CreateLedgerEntryParams } from '../../src/features/ledger/types/ledger.types';
import { getDatabase } from '../../src/shared/db/index';

describe('LedgerEntryRepository', () => {
  let repository: LedgerEntryRepository;

  beforeEach(async () => {
    // 确保数据库已初始化
    await getDatabase();
    repository = new LedgerEntryRepository();

    // 清空测试数据
    const db = await getDatabase();
    await db.runAsync('DELETE FROM ledger_entries', []);
  });

  describe('create', () => {
    it('应该成功创建账目流水', async () => {
      const params: CreateLedgerEntryParams = {
        amount: 5000, // 50.00 元
        type: 'expense',
        description: '测试支出',
        date: '2026-03-31',
      };

      const entry = await repository.create(params);

      expect(entry.id).toBeDefined();
      expect(entry.amount).toBe(5000);
      expect(entry.type).toBe('expense');
      expect(entry.description).toBe('测试支出');
      expect(entry.date).toBe('2026-03-31');
      expect(entry.createdAt).toBeDefined();
      expect(entry.updatedAt).toBeDefined();
      expect(entry.deletedAt).toBeNull();
    });

    it('应该生成唯一 ID', async () => {
      const entry1 = await repository.create({
        amount: 100,
        type: 'income',
        description: '测试1',
        date: '2026-03-31',
      });

      const entry2 = await repository.create({
        amount: 200,
        type: 'income',
        description: '测试2',
        date: '2026-03-31',
      });

      expect(entry1.id).not.toBe(entry2.id);
    });
  });

  describe('findById', () => {
    it('应该根据 ID 查询到账目', async () => {
      const created = await repository.create({
        amount: 1000,
        type: 'income',
        description: '测试收入',
        date: '2026-03-31',
      });

      const found = await repository.findById(created.id);

      expect(found).not.toBeNull();
      expect(found?.id).toBe(created.id);
      expect(found?.description).toBe('测试收入');
    });

    it('查询不存在的 ID 应返回 null', async () => {
      const found = await repository.findById('non-existent-id');
      expect(found).toBeNull();
    });

    it('不应该返回已删除的记录', async () => {
      const created = await repository.create({
        amount: 1000,
        type: 'income',
        description: '测试',
        date: '2026-03-31',
      });

      await repository.delete(created.id);
      const found = await repository.findById(created.id);

      expect(found).toBeNull();
    });
  });

  describe('findAll', () => {
    beforeEach(async () => {
      // 创建测试数据
      await repository.create({ amount: 100, type: 'income', description: '收入1', date: '2026-03-30' });
      await repository.create({ amount: 200, type: 'expense', description: '支出1', date: '2026-03-31' });
      await repository.create({ amount: 300, type: 'income', description: '收入2', date: '2026-03-31' });
    });

    it('应该返回所有未删除的记录', async () => {
      const entries = await repository.findAll();
      expect(entries.length).toBe(3);
    });

    it('应该按类型筛选', async () => {
      const incomeEntries = await repository.findAll({ type: 'income' });
      expect(incomeEntries.length).toBe(2);
      expect(incomeEntries.every(e => e.type === 'income')).toBe(true);

      const expenseEntries = await repository.findAll({ type: 'expense' });
      expect(expenseEntries.length).toBe(1);
      expect(expenseEntries.every(e => e.type === 'expense')).toBe(true);
    });

    it('应该按日期范围筛选', async () => {
      const entries = await repository.findAll({ startDate: '2026-03-31', endDate: '2026-03-31' });
      expect(entries.length).toBe(2);
      expect(entries.every(e => e.date === '2026-03-31')).toBe(true);
    });

    it('应该按日期降序排列', async () => {
      const entries = await repository.findAll();
      // 日期是字符串格式 YYYY-MM-DD，使用字符串比较
      expect(entries[0].date >= entries[1].date).toBe(true);
    });
  });

  describe('update', () => {
    it('应该更新账目信息', async () => {
      const created = await repository.create({
        amount: 1000,
        type: 'expense',
        description: '原描述',
        date: '2026-03-31',
      });

      const updated = await repository.update({
        id: created.id,
        amount: 2000,
        description: '新描述',
      });

      expect(updated).not.toBeNull();
      expect(updated?.amount).toBe(2000);
      expect(updated?.description).toBe('新描述');
      expect(updated?.type).toBe('expense'); // 未更新的字段应保持原值
    });

    it('更新不存在的 ID 应返回 null', async () => {
      const result = await repository.update({
        id: 'non-existent-id',
        amount: 1000,
      });
      expect(result).toBeNull();
    });

    it('更新已删除的记录应返回 null', async () => {
      const created = await repository.create({
        amount: 1000,
        type: 'expense',
        description: '测试',
        date: '2026-03-31',
      });

      await repository.delete(created.id);
      const result = await repository.update({
        id: created.id,
        amount: 2000,
      });
      expect(result).toBeNull();
    });
  });

  describe('delete', () => {
    it('应该软删除账目', async () => {
      const created = await repository.create({
        amount: 1000,
        type: 'expense',
        description: '测试',
        date: '2026-03-31',
      });

      const deleted = await repository.delete(created.id);
      expect(deleted).toBe(true);

      const found = await repository.findById(created.id);
      expect(found).toBeNull();
    });

    it('删除不存在的 ID 应返回 false', async () => {
      const result = await repository.delete('non-existent-id');
      expect(result).toBe(false);
    });

    it('重复删除应返回 false', async () => {
      const created = await repository.create({
        amount: 1000,
        type: 'expense',
        description: '测试',
        date: '2026-03-31',
      });

      await repository.delete(created.id);
      const result = await repository.delete(created.id);
      expect(result).toBe(false);
    });
  });

  describe('count', () => {
    beforeEach(async () => {
      await repository.create({ amount: 100, type: 'income', description: '收入1', date: '2026-03-30' });
      await repository.create({ amount: 200, type: 'expense', description: '支出1', date: '2026-03-31' });
      await repository.create({ amount: 300, type: 'income', description: '收入2', date: '2026-03-31' });
    });

    it('应该统计所有未删除的记录', async () => {
      const count = await repository.count();
      expect(count).toBe(3);
    });

    it('应该按类型统计', async () => {
      const incomeCount = await repository.count({ type: 'income' });
      expect(incomeCount).toBe(2);

      const expenseCount = await repository.count({ type: 'expense' });
      expect(expenseCount).toBe(1);
    });

    it('应该按日期范围统计', async () => {
      const count = await repository.count({ startDate: '2026-03-31', endDate: '2026-03-31' });
      expect(count).toBe(2);
    });
  });
});
