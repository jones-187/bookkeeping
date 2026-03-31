/**
 * 数据库类型定义
 */

export interface LedgerEntryRow {
  id: string;
  amount: number;
  type: 'income' | 'expense';
  description: string;
  date: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}
