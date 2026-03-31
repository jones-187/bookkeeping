/**
 * Ledger Entry Repository
 * Data access layer for ledger entries
 */
import * as SQLite from 'expo-sqlite';
import { getDatabase } from '../db';
import { LedgerEntryRow } from '../db/types';

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

export interface CreateLedgerEntryParams {
  amount: number;
  type: 'income' | 'expense';
  description: string;
  date: string;
}

export interface UpdateLedgerEntryParams {
  id: string;
  amount?: number;
  type?: 'income' | 'expense';
  description?: string;
  date?: string;
}

export interface LedgerEntryFilter {
  type?: 'income' | 'expense';
  startDate?: string;
  endDate?: string;
}

export class LedgerEntryRepository {
  private db: SQLite.SQLiteDatabase | null = null;

  private async getDb(): Promise<SQLite.SQLiteDatabase> {
    if (!this.db) {
      this.db = await getDatabase();
    }
    return this.db;
  }

  async create(params: CreateLedgerEntryParams): Promise<LedgerEntry> {
    const db = await this.getDb();
    const now = new Date().toISOString();
    const id = crypto.randomUUID();

    await db.runAsync(
      'INSERT INTO ledger_entries (id, amount, type, description, date, created_at, updated_at, deleted_at) VALUES (?, ?, ?, ?, ?, ?, ?, NULL)',
      [id, params.amount, params.type, params.description, params.date, now, now]
    );

    const entry = await this.findById(id);
    if (!entry) {
      throw new Error('Failed to create entry');
    }
    return entry;
  }

  async findById(id: string): Promise<LedgerEntry | null> {
    const db = await this.getDb();
    const row = await db.getFirstAsync<LedgerEntryRow>(
      'SELECT * FROM ledger_entries WHERE id = ? AND deleted_at IS NULL',
      [id]
    );
    return row ? this.rowToEntity(row) : null;
  }

  async findAll(filter?: LedgerEntryFilter): Promise<LedgerEntry[]> {
    const db = await this.getDb();
    let query = 'SELECT * FROM ledger_entries WHERE deleted_at IS NULL';
    const params: (string | number)[] = [];

    if (filter?.type) {
      query += ' AND type = ?';
      params.push(filter.type);
    }

    if (filter?.startDate) {
      query += ' AND date >= ?';
      params.push(filter.startDate);
    }

    if (filter?.endDate) {
      query += ' AND date <= ?';
      params.push(filter.endDate);
    }

    query += ' ORDER BY date DESC, created_at DESC';

    const rows = await db.getAllAsync<LedgerEntryRow>(query, params);
    return rows.map(row => this.rowToEntity(row));
  }

  async update(params: UpdateLedgerEntryParams): Promise<LedgerEntry | null> {
    const db = await this.getDb();
    const updates: string[] = [];
    const values: (string | number)[] = [];

    if (params.amount !== undefined) {
      updates.push('amount = ?');
      values.push(params.amount);
    }

    if (params.type !== undefined) {
      updates.push('type = ?');
      values.push(params.type);
    }

    if (params.description !== undefined) {
      updates.push('description = ?');
      values.push(params.description);
    }

    if (params.date !== undefined) {
      updates.push('date = ?');
      values.push(params.date);
    }

    if (updates.length === 0) {
      return this.findById(params.id);
    }

    updates.push('updated_at = ?');
    values.push(new Date().toISOString());
    values.push(params.id);

    const query = 'UPDATE ledger_entries SET ' + updates.join(', ') + ' WHERE id = ? AND deleted_at IS NULL';
    await db.runAsync(query, values);

    return this.findById(params.id);
  }

  async delete(id: string): Promise<boolean> {
    const db = await this.getDb();
    const result = await db.runAsync(
      'UPDATE ledger_entries SET deleted_at = ? WHERE id = ? AND deleted_at IS NULL',
      [new Date().toISOString(), id]
    );
    return result.changes > 0;
  }

  async count(filter?: LedgerEntryFilter): Promise<number> {
    const db = await this.getDb();
    let query = 'SELECT COUNT(*) as count FROM ledger_entries WHERE deleted_at IS NULL';
    const params: (string | number)[] = [];

    if (filter?.type) {
      query += ' AND type = ?';
      params.push(filter.type);
    }

    if (filter?.startDate) {
      query += ' AND date >= ?';
      params.push(filter.startDate);
    }

    if (filter?.endDate) {
      query += ' AND date <= ?';
      params.push(filter.endDate);
    }

    const result = await db.getFirstAsync<{ count: number }>(query, params);
    return result?.count || 0;
  }

  private rowToEntity(row: LedgerEntryRow): LedgerEntry {
    return {
      id: row.id,
      amount: row.amount,
      type: row.type,
      description: row.description,
      date: row.date,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      deletedAt: row.deleted_at,
    };
  }
}

export const ledgerEntryRepository = new LedgerEntryRepository();
