/**
 * Ledger Entry Service
 * 业务逻辑层 - 处理账目流水的创建、更新、删除和查询
 */
import { LedgerEntryRepository, CreateLedgerEntryParams, UpdateLedgerEntryParams, LedgerEntryFilter, LedgerEntry } from '../repositories/LedgerEntryRepository';
import { ValidationError, EntryNotFoundError, BusinessError } from '../errors';
import * as Money from '../utils/Money';

/** 创建账目输入（金额单位：元） */
export interface CreateEntryInput {
  amount: number; // 元（浮点数）
  type: 'income' | 'expense';
  description: string;
  date: string; // YYYY-MM-DD
}

/** 更新账目输入（金额单位：元） */
export interface UpdateEntryInput {
  id: string;
  amount?: number;
  type?: 'income' | 'expense';
  description?: string;
  date?: string;
}

/** 账目汇总 */
export interface EntrySummary {
  totalIncome: number;   // 总收入（分）
  totalExpense: number;  // 总支出（分）
  balance: number;       // 结余（分）
  count: number;         // 记录数
}

class LedgerEntryService {
  constructor(private repository: LedgerEntryRepository) {}

  /**
   * 创建账目
   */
  async create(input: CreateEntryInput): Promise<LedgerEntry> {
    // 验证输入
    this.validateAmount(input.amount);
    this.validateDescription(input.description);
    this.validateDate(input.date);
    this.validateType(input.type);

    // 转换金额：元 -> 分
    const amountInCents = Money.fromYuan(input.amount);

    const params: CreateLedgerEntryParams = {
      amount: amountInCents,
      type: input.type,
      description: input.description.trim(),
      date: input.date,
    };

    return this.repository.create(params);
  }

  /**
   * 更新账目
   */
  async update(input: UpdateEntryInput): Promise<LedgerEntry> {
    // 检查账目是否存在
    const existing = await this.repository.findById(input.id);
    if (!existing) {
      throw new EntryNotFoundError(input.id);
    }

    // 验证更新的字段
    if (input.amount !== undefined) {
      this.validateAmount(input.amount);
    }
    if (input.description !== undefined) {
      this.validateDescription(input.description);
    }
    if (input.date !== undefined) {
      this.validateDate(input.date);
    }
    if (input.type !== undefined) {
      this.validateType(input.type);
    }

    // 转换金额
    const params: UpdateLedgerEntryParams = {
      id: input.id,
      amount: input.amount !== undefined ? Money.fromYuan(input.amount) : undefined,
      type: input.type,
      description: input.description?.trim(),
      date: input.date,
    };

    const updated = await this.repository.update(params);
    if (!updated) {
      throw new BusinessError('更新失败');
    }
    return updated;
  }

  /**
   * 删除账目（软删除）
   */
  async delete(id: string): Promise<void> {
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new EntryNotFoundError(id);
    }

    const deleted = await this.repository.delete(id);
    if (!deleted) {
      throw new BusinessError('删除失败');
    }
  }

  /**
   * 根据 ID 获取账目
   */
  async getById(id: string): Promise<LedgerEntry> {
    const entry = await this.repository.findById(id);
    if (!entry) {
      throw new EntryNotFoundError(id);
    }
    return entry;
  }

  /**
   * 获取账目列表
   */
  async getList(filter?: LedgerEntryFilter): Promise<LedgerEntry[]> {
    return this.repository.findAll(filter);
  }

  /**
   * 获取账目汇总
   */
  async getSummary(filter?: LedgerEntryFilter): Promise<EntrySummary> {
    const entries = await this.repository.findAll(filter);

    let totalIncome = 0;
    let totalExpense = 0;

    for (const entry of entries) {
      if (entry.type === 'income') {
        totalIncome = Money.add(totalIncome, entry.amount);
      } else {
        totalExpense = Money.add(totalExpense, entry.amount);
      }
    }

    return {
      totalIncome,
      totalExpense,
      balance: Money.subtract(totalIncome, totalExpense),
      count: entries.length,
    };
  }

  /**
   * 获取账目数量
   */
  async count(filter?: LedgerEntryFilter): Promise<number> {
    return this.repository.count(filter);
  }

  // ========== 验证方法 ==========

  private validateAmount(amount: number): void {
    if (!Number.isFinite(amount)) {
      throw new ValidationError('金额必须是有效数字', 'amount');
    }
    if (amount <= 0) {
      throw new ValidationError('金额必须大于0', 'amount');
    }
    // 最大金额检查：100万元
    if (amount > 1000000) {
      throw new ValidationError('金额不能超过100万元', 'amount');
    }
  }

  private validateDescription(description: string): void {
    const trimmed = description?.trim();
    if (!trimmed) {
      throw new ValidationError('描述不能为空', 'description');
    }
    if (trimmed.length > 500) {
      throw new ValidationError('描述最多500个字符', 'description');
    }
  }

  private validateDate(date: string): void {
    // 格式检查
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      throw new ValidationError('日期格式无效，请使用 YYYY-MM-DD', 'date');
    }

    // 有效性检查
    const parsed = new Date(date);
    if (isNaN(parsed.getTime())) {
      throw new ValidationError('无效的日期', 'date');
    }

    // 不能是未来日期
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    if (parsed > today) {
      throw new ValidationError('日期不能晚于今天', 'date');
    }
  }

  private validateType(type: string): void {
    if (type !== 'income' && type !== 'expense') {
      throw new ValidationError('类型必须是收入或支出', 'type');
    }
  }
}

// 导出单例
export const ledgerEntryService = new LedgerEntryService(
  new LedgerEntryRepository()
);

// 导出类以便测试
export { LedgerEntryService };
