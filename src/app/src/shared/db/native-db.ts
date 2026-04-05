/**
 * SQLite 数据库实现（iOS/Android 原生平台）
 */
import * as SQLite from 'expo-sqlite';
import { Database } from './interface';

const DB_NAME = 'bookkeeping.db';

/**
 * SQLite 数据库适配器
 * 将 expo-sqlite API 包装为统一的 Database 接口
 */
export class SQLiteDatabase implements Database {
  private db: SQLite.SQLiteDatabase | null = null;

  async init(): Promise<void> {
    if (!this.db) {
      this.db = await SQLite.openDatabaseAsync(DB_NAME);
      await this.runMigrations(this.db);
    }
  }

  private async runMigrations(database: SQLite.SQLiteDatabase): Promise<void> {
    // 创建版本管理表
    await database.execAsync(`
      CREATE TABLE IF NOT EXISTS schema_version (
        version INTEGER PRIMARY KEY,
        applied_at TEXT NOT NULL
      );
    `);

    // 获取当前版本
    const result = await database.getFirstAsync<{ version: number }>(
      'SELECT MAX(version) as version FROM schema_version'
    );
    const currentVersion = result?.version || 0;

    // 执行待应用的迁移
    const migrations = this.getMigrations();
    for (const migration of migrations) {
      if (migration.version > currentVersion) {
        await migration.up(database);
        await database.runAsync(
          'INSERT INTO schema_version (version, applied_at) VALUES (?, ?)',
          [migration.version, new Date().toISOString()]
        );
      }
    }
  }

  private getMigrations() {
    return [
      {
        version: 1,
        up: async (database: SQLite.SQLiteDatabase) => {
          await database.execAsync(`
            CREATE TABLE IF NOT EXISTS ledger_entries (
              id TEXT PRIMARY KEY,
              amount INTEGER NOT NULL CHECK(amount > 0),
              type TEXT NOT NULL CHECK(type IN ('income', 'expense')),
              description TEXT NOT NULL CHECK(length(description) <= 500),
              date TEXT NOT NULL,
              created_at TEXT NOT NULL,
              updated_at TEXT NOT NULL,
              deleted_at TEXT
            );

            CREATE INDEX idx_ledger_entries_date ON ledger_entries(date DESC);
            CREATE INDEX idx_ledger_entries_type ON ledger_entries(type);
            CREATE INDEX idx_ledger_entries_deleted_at ON ledger_entries(deleted_at);
          `);
        },
      },
    ];
  }

  async execAsync(sql: string): Promise<void> {
    if (!this.db) {
      await this.init();
    }
    return this.db!.execAsync(sql);
  }

  async runAsync(
    sql: string,
    params: (string | number | null)[]
  ): Promise<{ changes: number; lastInsertRowId: number }> {
    if (!this.db) {
      await this.init();
    }
    return this.db!.runAsync(sql, params);
  }

  async getFirstAsync<T>(
    sql: string,
    params?: (string | number | null)[]
  ): Promise<T | null> {
    if (!this.db) {
      await this.init();
    }
    return this.db!.getFirstAsync<T>(sql, params);
  }

  async getAllAsync<T>(
    sql: string,
    params?: (string | number | null)[]
  ): Promise<T[]> {
    if (!this.db) {
      await this.init();
    }
    return this.db!.getAllAsync<T>(sql, params);
  }
}

// 单例实例
let sqliteDb: SQLiteDatabase | null = null;

/**
 * 获取原生 SQLite 数据库实例
 */
export async function getNativeDatabase(): Promise<Database> {
  if (!sqliteDb) {
    sqliteDb = new SQLiteDatabase();
    await sqliteDb.init();
  }
  return sqliteDb;
}
