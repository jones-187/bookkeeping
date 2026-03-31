/**
 * 数据库初始化和连接管理
 */
import * as SQLite from 'expo-sqlite';

const DB_NAME = 'bookkeeping.db';

let db: SQLite.SQLiteDatabase | null = null;

/**
 * 获取数据库实例
 */
export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (db) {
    return db;
  }

  db = await SQLite.openDatabaseAsync(DB_NAME);
  await runMigrations(db);
  return db;
}

/**
 * 执行数据库迁移
 */
async function runMigrations(database: SQLite.SQLiteDatabase): Promise<void> {
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
  const migrations = getMigrations();
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

/**
 * 迁移定义
 */
interface Migration {
  version: number;
  up: (db: SQLite.SQLiteDatabase) => Promise<void>;
}

function getMigrations(): Migration[] {
  return [
    {
      version: 1,
      up: async (database) => {
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
