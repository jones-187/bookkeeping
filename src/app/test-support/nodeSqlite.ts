import { DatabaseSync } from 'node:sqlite';

export type SqliteValue = string | number | null;

export class NodeSqliteConnection {
  private readonly database = new DatabaseSync(':memory:');

  async exec(sql: string): Promise<void> {
    this.database.exec(sql);
  }

  async run(
    sql: string,
    params: readonly SqliteValue[] = [],
  ): Promise<{ changes: number }> {
    const result = this.database.prepare(sql).run(...params);
    return { changes: Number(result.changes) };
  }

  async getFirst<T>(
    sql: string,
    params: readonly SqliteValue[] = [],
  ): Promise<T | null> {
    return (this.database.prepare(sql).get(...params) as T | undefined) ?? null;
  }

  async getAll<T>(
    sql: string,
    params: readonly SqliteValue[] = [],
  ): Promise<T[]> {
    return this.database.prepare(sql).all(...params) as T[];
  }

  async transaction<T>(
    task: (transaction: NodeSqliteConnection) => Promise<T>,
  ): Promise<T> {
    this.database.exec('BEGIN IMMEDIATE');
    try {
      const result = await task(this);
      this.database.exec('COMMIT');
      return result;
    } catch (error) {
      this.database.exec('ROLLBACK');
      throw error;
    }
  }

  close(): void {
    this.database.close();
  }
}
