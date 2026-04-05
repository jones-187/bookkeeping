/**
 * Ledger Feature 类型定义
 */

/** 账目条目 */
export interface LedgerEntry {
  id: string;
  amount: number;
  type: 'income' | 'expense';
  description: string;
  date: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

/** 创建账目参数 */
export interface CreateLedgerEntryParams {
  amount: number;
  type: 'income' | 'expense';
  description: string;
  date: string;
}

/** 更新账目参数 */
export interface UpdateLedgerEntryParams {
  id: string;
  amount?: number;
  type?: 'income' | 'expense';
  description?: string;
  date?: string;
}

/** 账目过滤条件 */
export interface LedgerEntryFilter {
  type?: 'income' | 'expense';
  startDate?: string;
  endDate?: string;
}

/** 创建账目输入（金额单位：元） */
export interface CreateEntryInput {
  amount: number;
  type: 'income' | 'expense';
  description: string;
  date: string;
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
  totalIncome: number;
  totalExpense: number;
  balance: number;
  count: number;
}
