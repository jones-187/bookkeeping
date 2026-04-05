/**
 * LedgerEntryService 单元测试
 */
import { LedgerEntryService, CreateEntryInput, UpdateEntryInput } from '../../src/features/ledger/services/LedgerEntryService';
import { LedgerEntryRepository, LedgerEntry } from '../../src/features/ledger/repositories/LedgerEntryRepository';
import { ValidationError, EntryNotFoundError, BusinessError } from '../../src/shared/errors';

// Mock Repository
jest.mock('../../src/features/ledger/repositories/LedgerEntryRepository');

describe('LedgerEntryService', () => {
  let service: LedgerEntryService;
  let mockRepository: jest.Mocked<LedgerEntryRepository>;

  const mockEntry: LedgerEntry = {
    id: 'test-id',
    amount: 10000, // 100.00 元
    type: 'expense',
    description: '测试账目',
    date: '2026-04-05',
    createdAt: '2026-04-05T10:00:00.000Z',
    updatedAt: '2026-04-05T10:00:00.000Z',
    deletedAt: null,
  };

  beforeEach(() => {
    mockRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    } as unknown as jest.Mocked<LedgerEntryRepository>;

    service = new LedgerEntryService(mockRepository);
  });

  describe('create', () => {
    const validInput: CreateEntryInput = {
      amount: 100.5,
      type: 'expense',
      description: '午餐',
      date: '2026-04-05',
    };

    it('应该成功创建账目', async () => {
      mockRepository.create.mockResolvedValue(mockEntry);

      const result = await service.create(validInput);

      expect(mockRepository.create).toHaveBeenCalledWith({
        amount: 10050, // 100.50 元 = 10050 分
        type: 'expense',
        description: '午餐',
        date: '2026-04-05',
      });
      expect(result).toBe(mockEntry);
    });

    it('应该去除描述的空白字符', async () => {
      mockRepository.create.mockResolvedValue(mockEntry);

      await service.create({ ...validInput, description: '  午餐  ' });

      expect(mockRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ description: '午餐' })
      );
    });

    it('金额为0时应该抛出验证错误', async () => {
      await expect(service.create({ ...validInput, amount: 0 }))
        .rejects.toThrow(ValidationError);
      await expect(service.create({ ...validInput, amount: 0 }))
        .rejects.toHaveProperty('field', 'amount');
    });

    it('金额为负数时应该抛出验证错误', async () => {
      await expect(service.create({ ...validInput, amount: -10 }))
        .rejects.toThrow(ValidationError);
    });

    it('金额超过100万时应该抛出验证错误', async () => {
      await expect(service.create({ ...validInput, amount: 1000001 }))
        .rejects.toThrow(ValidationError);
    });

    it('描述为空时应该抛出验证错误', async () => {
      await expect(service.create({ ...validInput, description: '' }))
        .rejects.toThrow(ValidationError);
      await expect(service.create({ ...validInput, description: '   ' }))
        .rejects.toThrow(ValidationError);
    });

    it('描述超过500字符时应该抛出验证错误', async () => {
      const longDesc = 'a'.repeat(501);
      await expect(service.create({ ...validInput, description: longDesc }))
        .rejects.toThrow(ValidationError);
    });

    it('日期格式无效时应该抛出验证错误', async () => {
      await expect(service.create({ ...validInput, date: '2026/04/05' }))
        .rejects.toThrow(ValidationError);
      await expect(service.create({ ...validInput, date: 'invalid' }))
        .rejects.toThrow(ValidationError);
    });

    it('未来日期应该抛出验证错误', async () => {
      const futureDate = '2099-12-31';
      await expect(service.create({ ...validInput, date: futureDate }))
        .rejects.toThrow(ValidationError);
    });

    it('无效类型应该抛出验证错误', async () => {
      await expect(service.create({ ...validInput, type: 'invalid' as any }))
        .rejects.toThrow(ValidationError);
    });

    it('应该支持收入类型', async () => {
      mockRepository.create.mockResolvedValue({ ...mockEntry, type: 'income' });

      await service.create({ ...validInput, type: 'income' });

      expect(mockRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'income' })
      );
    });
  });

  describe('update', () => {
    const validInput: UpdateEntryInput = {
      id: 'test-id',
      amount: 200,
    };

    it('应该成功更新账目', async () => {
      mockRepository.findById.mockResolvedValue(mockEntry);
      mockRepository.update.mockResolvedValue({ ...mockEntry, amount: 20000 });

      const result = await service.update(validInput);

      expect(mockRepository.update).toHaveBeenCalledWith({
        id: 'test-id',
        amount: 20000, // 200 元 = 20000 分
      });
      expect(result.amount).toBe(20000);
    });

    it('账目不存在时应该抛出错误', async () => {
      mockRepository.findById.mockResolvedValue(null);

      await expect(service.update(validInput))
        .rejects.toThrow(EntryNotFoundError);
    });

    it('更新不存在的账目应该抛出错误', async () => {
      mockRepository.findById.mockResolvedValue(mockEntry);
      mockRepository.update.mockResolvedValue(null);

      await expect(service.update(validInput))
        .rejects.toThrow(BusinessError);
    });

    it('应该验证更新的字段', async () => {
      mockRepository.findById.mockResolvedValue(mockEntry);

      await expect(service.update({ id: 'test-id', amount: -10 }))
        .rejects.toThrow(ValidationError);
      await expect(service.update({ id: 'test-id', description: '' }))
        .rejects.toThrow(ValidationError);
    });
  });

  describe('delete', () => {
    it('应该成功删除账目', async () => {
      mockRepository.findById.mockResolvedValue(mockEntry);
      mockRepository.delete.mockResolvedValue(true);

      await service.delete('test-id');

      expect(mockRepository.delete).toHaveBeenCalledWith('test-id');
    });

    it('删除不存在的账目应该抛出错误', async () => {
      mockRepository.findById.mockResolvedValue(null);

      await expect(service.delete('non-existent'))
        .rejects.toThrow(EntryNotFoundError);
    });

    it('删除失败应该抛出错误', async () => {
      mockRepository.findById.mockResolvedValue(mockEntry);
      mockRepository.delete.mockResolvedValue(false);

      await expect(service.delete('test-id'))
        .rejects.toThrow(BusinessError);
    });
  });

  describe('getById', () => {
    it('应该返回账目', async () => {
      mockRepository.findById.mockResolvedValue(mockEntry);

      const result = await service.getById('test-id');

      expect(result).toBe(mockEntry);
    });

    it('账目不存在时应该抛出错误', async () => {
      mockRepository.findById.mockResolvedValue(null);

      await expect(service.getById('non-existent'))
        .rejects.toThrow(EntryNotFoundError);
    });
  });

  describe('getList', () => {
    it('应该返回账目列表', async () => {
      const entries = [mockEntry];
      mockRepository.findAll.mockResolvedValue(entries);

      const result = await service.getList();

      expect(result).toEqual(entries);
    });

    it('应该传递筛选条件', async () => {
      mockRepository.findAll.mockResolvedValue([]);

      await service.getList({ type: 'income', startDate: '2026-01-01' });

      expect(mockRepository.findAll).toHaveBeenCalledWith({
        type: 'income',
        startDate: '2026-01-01',
      });
    });
  });

  describe('getSummary', () => {
    it('应该正确计算汇总', async () => {
      const entries: LedgerEntry[] = [
        { ...mockEntry, id: '1', type: 'income', amount: 10000 },  // 100 元收入
        { ...mockEntry, id: '2', type: 'income', amount: 5000 },   // 50 元收入
        { ...mockEntry, id: '3', type: 'expense', amount: 3000 },  // 30 元支出
      ];
      mockRepository.findAll.mockResolvedValue(entries);

      const result = await service.getSummary();

      expect(result.totalIncome).toBe(15000);  // 150 元
      expect(result.totalExpense).toBe(3000);  // 30 元
      expect(result.balance).toBe(12000);      // 120 元
      expect(result.count).toBe(3);
    });

    it('没有账目时应该返回零值', async () => {
      mockRepository.findAll.mockResolvedValue([]);

      const result = await service.getSummary();

      expect(result.totalIncome).toBe(0);
      expect(result.totalExpense).toBe(0);
      expect(result.balance).toBe(0);
      expect(result.count).toBe(0);
    });
  });

  describe('count', () => {
    it('应该返回账目数量', async () => {
      mockRepository.count.mockResolvedValue(10);

      const result = await service.count();

      expect(result).toBe(10);
    });

    it('应该传递筛选条件', async () => {
      mockRepository.count.mockResolvedValue(5);

      await service.count({ type: 'expense' });

      expect(mockRepository.count).toHaveBeenCalledWith({ type: 'expense' });
    });
  });
});
