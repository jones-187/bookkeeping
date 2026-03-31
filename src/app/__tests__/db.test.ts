/**
 * 数据库初始化测试
 */
import { getDatabase } from '../src/db/index';

describe('Database Initialization', () => {
  it('should create database and run migrations', async () => {
    const db = await getDatabase();
    expect(db).toBeDefined();

    // 验证 schema_version 表存在
    const versionResult = await db.getFirstAsync<{ version: number }>(
      'SELECT MAX(version) as version FROM schema_version'
    );
    expect(versionResult?.version).toBe(1);

    // 验证 ledger_entries 表存在
    const tableResult = await db.getFirstAsync<{ name: string }>(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='ledger_entries'"
    );
    expect(tableResult?.name).toBe('ledger_entries');
  });
});
