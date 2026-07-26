import { openDatabaseAsync, type SQLiteDatabase } from 'expo-sqlite';

import { createNativeLedger } from '../../src/ledger/native';

jest.mock('expo-crypto', () => ({
  randomUUID: jest.fn(() => 'native-entry'),
}));

jest.mock('expo-sqlite', () => ({
  openDatabaseAsync: jest.fn(),
}));

const mockedOpenDatabase = jest.mocked(openDatabaseAsync);

afterEach(() => {
  jest.clearAllMocks();
});

it('原生数据库连接初始化失败时关闭已打开的连接', async () => {
  const setupError = new Error('pragma failed');
  const database = {
    execAsync: jest.fn().mockRejectedValue(setupError),
    closeAsync: jest.fn().mockResolvedValue(undefined),
  };
  mockedOpenDatabase.mockResolvedValue(database as unknown as SQLiteDatabase);

  await expect(createNativeLedger()).rejects.toBe(setupError);

  expect(database.closeAsync).toHaveBeenCalledTimes(1);
});

it('原生装配在 Expo SQLite 的排他事务句柄上迁移和读取快照', async () => {
  const transaction = {
    execAsync: jest.fn().mockResolvedValue(undefined),
    runAsync: jest.fn().mockResolvedValue({ changes: 1 }),
    getFirstAsync: jest.fn().mockResolvedValue(null),
    getAllAsync: jest.fn().mockResolvedValue([
      {
        id: 'native-entry',
        amount: 123,
        type: 'income',
        description: '原生装配',
        date: '2020-01-01',
      },
    ]),
  };
  const database = {
    execAsync: jest.fn().mockResolvedValue(undefined),
    runAsync: jest.fn().mockResolvedValue({ changes: 1 }),
    getFirstAsync: jest.fn().mockResolvedValue(null),
    getAllAsync: jest.fn().mockResolvedValue([]),
    withExclusiveTransactionAsync: jest.fn(
      async (
        task: (session: typeof transaction) => Promise<void>,
      ): Promise<void> => {
        await task(transaction);
      },
    ),
    closeAsync: jest.fn().mockResolvedValue(undefined),
  };
  mockedOpenDatabase.mockResolvedValue(database as unknown as SQLiteDatabase);

  const ledger = await createNativeLedger();
  await ledger.add({
    amount: '1.23',
    type: 'income',
    description: '原生装配',
    date: '2020-01-01',
  });

  await expect(ledger.snapshot()).resolves.toMatchObject({
    entries: [{ id: 'native-entry', amount: 123 }],
    summary: { totalIncome: 123, balance: 123, count: 1 },
  });
  expect(database.execAsync).toHaveBeenCalledWith(
    expect.stringContaining('PRAGMA journal_mode = WAL'),
  );
  expect(transaction.execAsync).toHaveBeenCalledWith(
    expect.stringContaining('CREATE TABLE IF NOT EXISTS ledger_schema'),
  );
  expect(database.runAsync).toHaveBeenCalledWith(
    expect.stringContaining('INSERT INTO ledger_entries_v1'),
    expect.any(Array),
  );
  expect(transaction.getAllAsync).toHaveBeenCalledWith(
    expect.stringContaining('WHERE deleted_at IS NULL'),
    [],
  );
  expect(database.withExclusiveTransactionAsync).toHaveBeenCalledTimes(2);
  expect(database.closeAsync).not.toHaveBeenCalled();
});
