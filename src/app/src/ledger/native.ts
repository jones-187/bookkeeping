import { randomUUID } from 'expo-crypto';
import {
  openDatabaseAsync,
  type SQLiteDatabase,
  type SQLiteRunResult,
} from 'expo-sqlite';

import type { Ledger } from './contract';
import { createLedger } from './internal/createLedger';
import type {
  SqliteConnection,
  SqliteSession,
  SqliteValue,
} from './internal/database';

const DATABASE_NAME = 'bookkeeping-native-v1.db';

type ExpoSqliteSession = Pick<
  SQLiteDatabase,
  'execAsync' | 'runAsync' | 'getFirstAsync' | 'getAllAsync'
>;

class ExpoSessionAdapter implements SqliteSession {
  constructor(private readonly session: ExpoSqliteSession) {}

  async exec(sql: string): Promise<void> {
    await this.session.execAsync(sql);
  }

  async run(
    sql: string,
    params: readonly SqliteValue[] = [],
  ): Promise<{ changes: number }> {
    const result: SQLiteRunResult = await this.session.runAsync(sql, [
      ...params,
    ]);
    return { changes: result.changes };
  }

  async getFirst<T>(
    sql: string,
    params: readonly SqliteValue[] = [],
  ): Promise<T | null> {
    return this.session.getFirstAsync<T>(sql, [...params]);
  }

  async getAll<T>(
    sql: string,
    params: readonly SqliteValue[] = [],
  ): Promise<T[]> {
    return this.session.getAllAsync<T>(sql, [...params]);
  }
}

class ExpoConnectionAdapter
  extends ExpoSessionAdapter
  implements SqliteConnection
{
  constructor(private readonly database: SQLiteDatabase) {
    super(database);
  }

  async transaction<T>(
    task: (transaction: SqliteSession) => Promise<T>,
  ): Promise<T> {
    let completed = false;
    let result: T | undefined;
    await this.database.withExclusiveTransactionAsync(async (transaction) => {
      result = await task(new ExpoSessionAdapter(transaction));
      completed = true;
    });
    if (!completed) {
      throw new Error('SQLite 事务未完成');
    }
    return result as T;
  }
}

export async function createNativeLedger(): Promise<Ledger> {
  const database = await openDatabaseAsync(DATABASE_NAME);
  await database.execAsync(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;
    PRAGMA busy_timeout = 5000;
  `);

  return createLedger({
    database: new ExpoConnectionAdapter(database),
    now: () => new Date(),
    generateId: randomUUID,
  });
}
