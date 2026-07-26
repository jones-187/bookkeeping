export type LedgerEntryType = 'income' | 'expense';

export interface LedgerEntry {
  id: string;
  amount: number;
  type: LedgerEntryType;
  description: string;
  date: string;
}

export interface LedgerEntryInput {
  amount: string;
  type: LedgerEntryType;
  description: string;
  date: string;
}

export interface LedgerSummary {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  count: number;
}

export interface LedgerSnapshot {
  entries: LedgerEntry[];
  summary: LedgerSummary;
}

export interface Ledger {
  snapshot(): Promise<LedgerSnapshot>;
  add(input: LedgerEntryInput): Promise<LedgerEntry>;
  update(id: string, input: LedgerEntryInput): Promise<LedgerEntry>;
  remove(id: string): Promise<void>;
}

export type LedgerInputField = 'amount' | 'type' | 'description' | 'date';

export class LedgerValidationError extends Error {
  constructor(
    readonly field: LedgerInputField,
    message: string,
  ) {
    super(message);
    this.name = 'LedgerValidationError';
  }
}

export class LedgerEntryNotFoundError extends Error {
  constructor(readonly entryId: string) {
    super(`找不到账目：${entryId}`);
    this.name = 'LedgerEntryNotFoundError';
  }
}
