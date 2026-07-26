export type SqliteValue = string | number | null;

export interface SqliteSession {
  exec(sql: string): Promise<void>;
  run(
    sql: string,
    params?: readonly SqliteValue[],
  ): Promise<{ changes: number }>;
  getFirst<T>(
    sql: string,
    params?: readonly SqliteValue[],
  ): Promise<T | null>;
  getAll<T>(sql: string, params?: readonly SqliteValue[]): Promise<T[]>;
}

export interface SqliteConnection extends SqliteSession {
  transaction<T>(task: (transaction: SqliteSession) => Promise<T>): Promise<T>;
}
