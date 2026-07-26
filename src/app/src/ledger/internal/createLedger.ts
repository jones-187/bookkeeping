import {
  LedgerEntryNotFoundError,
  LedgerValidationError,
  type Ledger,
  type LedgerEntry,
  type LedgerEntryInput,
  type LedgerEntryType,
  type LedgerSnapshot,
  type LedgerSummary,
} from '../contract';
import { formatLocalDate } from '../localDate';
import type { SqliteConnection } from './database';
import { migrate } from './migrations';

const MAX_AMOUNT_IN_CENTS = 100_000_000;

interface LedgerRow {
  id: string;
  amount: number;
  type: LedgerEntryType;
  description: string;
  date: string;
}

export interface CreateLedgerOptions {
  database: SqliteConnection;
  now: () => Date;
  generateId: () => string;
}

function parseAmount(amount: string): number {
  const match = /^(0|[1-9]\d*)(?:\.(\d{1,2}))?$/.exec(amount);
  if (match === null) {
    throw new LedgerValidationError(
      'amount',
      '金额必须是最多两位小数的十进制数字',
    );
  }

  const cents = Number(match[1]) * 100 + Number((match[2] ?? '').padEnd(2, '0'));
  if (
    !Number.isSafeInteger(cents) ||
    cents < 1 ||
    cents > MAX_AMOUNT_IN_CENTS
  ) {
    throw new LedgerValidationError('amount', '金额必须在 0.01 到 1,000,000.00 之间');
  }
  return cents;
}

function parseDate(date: string, today: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
  if (match === null) {
    throw new LedgerValidationError('date', '日期必须使用 YYYY-MM-DD 格式');
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const parsed = new Date(Date.UTC(year, month - 1, day));
  if (
    parsed.getUTCFullYear() !== year ||
    parsed.getUTCMonth() !== month - 1 ||
    parsed.getUTCDate() !== day
  ) {
    throw new LedgerValidationError('date', '日期不是有效的自然日');
  }
  if (date > today) {
    throw new LedgerValidationError('date', '日期不能晚于今天');
  }
  return date;
}

function validateInput(input: LedgerEntryInput, today: string): Omit<LedgerEntry, 'id'> {
  if (input.type !== 'income' && input.type !== 'expense') {
    throw new LedgerValidationError('type', '账目类型必须是收入或支出');
  }

  const description = input.description.trim();
  const descriptionLength = Array.from(description).length;
  if (descriptionLength < 1 || descriptionLength > 500) {
    throw new LedgerValidationError('description', '说明长度必须在 1 到 500 个字符之间');
  }

  return {
    amount: parseAmount(input.amount),
    type: input.type,
    description,
    date: parseDate(input.date, today),
  };
}

function toEntry(row: LedgerRow): LedgerEntry {
  return {
    id: row.id,
    amount: row.amount,
    type: row.type,
    description: row.description,
    date: row.date,
  };
}

function addCents(left: number, right: number): number {
  const result = left + right;
  if (!Number.isSafeInteger(result)) {
    throw new Error('账本汇总金额超出安全整数范围');
  }
  return result;
}

function summarize(entries: readonly LedgerEntry[]): LedgerSummary {
  let totalIncome = 0;
  let totalExpense = 0;
  for (const entry of entries) {
    if (entry.type === 'income') {
      totalIncome = addCents(totalIncome, entry.amount);
    } else {
      totalExpense = addCents(totalExpense, entry.amount);
    }
  }
  return {
    totalIncome,
    totalExpense,
    balance: addCents(totalIncome, -totalExpense),
    count: entries.length,
  };
}

export async function createLedger(options: CreateLedgerOptions): Promise<Ledger> {
  const { database, generateId, now } = options;
  await migrate(database);

  return {
    async snapshot(): Promise<LedgerSnapshot> {
      return database.transaction(async (transaction) => {
        const rows = await transaction.getAll<LedgerRow>(
          `SELECT id, amount, type, description, date
             FROM ledger_entries_v1
            WHERE deleted_at IS NULL
            ORDER BY date DESC, sequence DESC`,
        );
        const entries = rows.map(toEntry);
        return { entries, summary: summarize(entries) };
      });
    },

    async add(input): Promise<LedgerEntry> {
      const operationTime = now();
      const timestamp = operationTime.toISOString();
      const entry = {
        id: generateId(),
        ...validateInput(input, formatLocalDate(operationTime)),
      };
      await database.run(
        `INSERT INTO ledger_entries_v1
          (id, amount, type, description, date, created_at, updated_at, deleted_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, NULL)`,
        [
          entry.id,
          entry.amount,
          entry.type,
          entry.description,
          entry.date,
          timestamp,
          timestamp,
        ],
      );
      return entry;
    },

    async update(id, input): Promise<LedgerEntry> {
      const operationTime = now();
      const entry = {
        id,
        ...validateInput(input, formatLocalDate(operationTime)),
      };
      const result = await database.run(
        `UPDATE ledger_entries_v1
            SET amount = ?, type = ?, description = ?, date = ?, updated_at = ?
          WHERE id = ? AND deleted_at IS NULL`,
        [
          entry.amount,
          entry.type,
          entry.description,
          entry.date,
          operationTime.toISOString(),
          id,
        ],
      );
      if (result.changes !== 1) {
        throw new LedgerEntryNotFoundError(id);
      }
      return entry;
    },

    async remove(id): Promise<void> {
      const operationTime = now().toISOString();
      const result = await database.run(
        `UPDATE ledger_entries_v1
            SET deleted_at = ?, updated_at = ?
          WHERE id = ? AND deleted_at IS NULL`,
        [operationTime, operationTime, id],
      );
      if (result.changes !== 1) {
        throw new LedgerEntryNotFoundError(id);
      }
    },
  };
}
