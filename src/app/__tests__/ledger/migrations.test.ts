import { createLedger } from '../../src/ledger/internal/createLedger';
import { NodeSqliteConnection } from '../../test-support/nodeSqlite';

describe('Ledger SQLite migration', () => {
  let database: NodeSqliteConnection;

  beforeEach(() => {
    database = new NodeSqliteConnection();
  });

  afterEach(() => {
    database.close();
  });

  it('schema 创建失败时版本记录与结构一起回滚', async () => {
    await database.exec(
      'CREATE TABLE ledger_entries_v1 (conflict TEXT) STRICT;',
    );

    await expect(
      createLedger({
        database,
        now: () => new Date('2026-07-26T08:00:00.000Z'),
        generateId: () => 'entry-1',
      }),
    ).rejects.toThrow();
    await expect(
      database.getFirst(
        "SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'ledger_schema'",
      ),
    ).resolves.toBeNull();

    await database.exec('DROP TABLE ledger_entries_v1;');
    const ledger = await createLedger({
      database,
      now: () => new Date('2026-07-26T08:00:00.000Z'),
      generateId: () => 'entry-1',
    });

    await expect(ledger.snapshot()).resolves.toMatchObject({
      entries: [],
      summary: { count: 0 },
    });
  });

  it('重复装配同一数据库不会重建或丢失已有账目', async () => {
    const options = {
      database,
      now: () => new Date('2026-07-26T08:00:00.000Z'),
      generateId: () => 'persisted-entry',
    };
    const firstLedger = await createLedger(options);
    await firstLedger.add({
      amount: '8.88',
      type: 'income',
      description: '保留',
      date: '2026-07-26',
    });

    const secondLedger = await createLedger(options);

    await expect(secondLedger.snapshot()).resolves.toMatchObject({
      entries: [{ id: 'persisted-entry', amount: 888 }],
      summary: { totalIncome: 888, count: 1 },
    });
  });

  it('拒绝用当前代码打开未知的未来 schema 版本', async () => {
    await database.exec(`
      CREATE TABLE ledger_schema (
        singleton INTEGER PRIMARY KEY CHECK (singleton = 1),
        version INTEGER NOT NULL CHECK (version >= 1)
      ) STRICT;
      INSERT INTO ledger_schema(singleton, version) VALUES (1, 2);
    `);

    await expect(
      createLedger({
        database,
        now: () => new Date('2026-07-26T08:00:00.000Z'),
        generateId: () => 'entry-1',
      }),
    ).rejects.toThrow('不支持的账本数据库版本：2，当前版本：1');
  });
});
