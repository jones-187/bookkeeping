import {
  LedgerEntryNotFoundError,
  LedgerValidationError,
  type LedgerEntryInput,
} from '../../src/ledger';
import { createLedger } from '../../src/ledger/internal/createLedger';
import { NodeSqliteConnection } from '../../test-support/nodeSqlite';

describe('Ledger', () => {
  let database: NodeSqliteConnection;

  beforeEach(() => {
    database = new NodeSqliteConnection();
  });

  afterEach(() => {
    database.close();
  });

  it('新增账目后返回包含列表和汇总的一致快照', async () => {
    const ledger = await createLedger({
      database,
      now: () => new Date('2026-07-26T08:00:00.000Z'),
      generateId: () => 'entry-1',
    });

    await ledger.add({
      amount: '100.50',
      type: 'income',
      description: ' 工资 ',
      date: '2026-07-26',
    });

    await expect(ledger.snapshot()).resolves.toEqual({
      entries: [
        {
          id: 'entry-1',
          amount: 10050,
          type: 'income',
          description: '工资',
          date: '2026-07-26',
        },
      ],
      summary: {
        totalIncome: 10050,
        totalExpense: 0,
        balance: 10050,
        count: 1,
      },
    });
  });

  it('描述长度按 Unicode 字符而不是 UTF-16 代码单元计算', async () => {
    const ledger = await createLedger({
      database,
      now: () => new Date('2026-07-26T08:00:00.000Z'),
      generateId: () => 'entry-emoji',
    });
    const description = `${'记'.repeat(499)}💰`;

    await expect(
      ledger.add({
        amount: '0.01',
        type: 'income',
        description,
        date: '2026-07-26',
      }),
    ).resolves.toMatchObject({ description });
  });

  it('一次写入只读取一次本地时钟，不能在跨午夜时接受未来日期', async () => {
    const now = jest
      .fn((): Date => new Date(2026, 6, 27, 0, 0, 0))
      .mockReturnValueOnce(new Date(2026, 6, 26, 23, 59, 59))
      .mockReturnValueOnce(new Date(2026, 6, 27, 0, 0, 0));
    const ledger = await createLedger({
      database,
      now,
      generateId: () => 'entry-future',
    });

    await expect(
      ledger.add({
        amount: '1.00',
        type: 'expense',
        description: '未来支出',
        date: '2026-07-27',
      }),
    ).rejects.toMatchObject<Partial<LedgerValidationError>>({
      field: 'date',
    });
    expect(now).toHaveBeenCalledTimes(1);
    await expect(ledger.snapshot()).resolves.toMatchObject({
      entries: [],
      summary: { count: 0 },
    });
  });

  it('编辑账目会原子替换字段并更新同一快照中的汇总', async () => {
    const ledger = await createLedger({
      database,
      now: () => new Date('2026-07-26T08:00:00.000Z'),
      generateId: () => 'entry-edit',
    });
    await ledger.add({
      amount: '10.00',
      type: 'income',
      description: '旧值',
      date: '2026-07-25',
    });

    await expect(
      ledger.update('entry-edit', {
        amount: '2.55',
        type: 'expense',
        description: ' 新值 ',
        date: '2026-07-26',
      }),
    ).resolves.toEqual({
      id: 'entry-edit',
      amount: 255,
      type: 'expense',
      description: '新值',
      date: '2026-07-26',
    });
    await expect(ledger.snapshot()).resolves.toEqual({
      entries: [
        {
          id: 'entry-edit',
          amount: 255,
          type: 'expense',
          description: '新值',
          date: '2026-07-26',
        },
      ],
      summary: {
        totalIncome: 0,
        totalExpense: 255,
        balance: -255,
        count: 1,
      },
    });
  });

  it('删除账目使用软删除，并从列表和汇总中同时排除', async () => {
    const ids = ['income-entry', 'expense-entry'];
    const ledger = await createLedger({
      database,
      now: () => new Date('2026-07-26T08:00:00.000Z'),
      generateId: () => ids.shift() ?? 'unexpected-id',
    });
    await ledger.add({
      amount: '100.00',
      type: 'income',
      description: '收入',
      date: '2026-07-26',
    });
    await ledger.add({
      amount: '120.00',
      type: 'expense',
      description: '支出',
      date: '2026-07-26',
    });

    await ledger.remove('income-entry');

    await expect(ledger.snapshot()).resolves.toEqual({
      entries: [
        {
          id: 'expense-entry',
          amount: 12000,
          type: 'expense',
          description: '支出',
          date: '2026-07-26',
        },
      ],
      summary: {
        totalIncome: 0,
        totalExpense: 12000,
        balance: -12000,
        count: 1,
      },
    });
    await expect(ledger.remove('income-entry')).rejects.toBeInstanceOf(
      LedgerEntryNotFoundError,
    );
  });

  it('同一天新增的账目按新增顺序稳定倒序排列', async () => {
    const ids = ['older-entry', 'newer-entry'];
    const ledger = await createLedger({
      database,
      now: () => new Date('2026-07-26T08:00:00.000Z'),
      generateId: () => ids.shift() ?? 'unexpected-id',
    });
    await ledger.add({
      amount: '1.00',
      type: 'income',
      description: '较早',
      date: '2026-07-26',
    });
    await ledger.add({
      amount: '2.00',
      type: 'income',
      description: '较新',
      date: '2026-07-26',
    });

    const snapshot = await ledger.snapshot();

    expect(snapshot.entries.map((entry) => entry.id)).toEqual([
      'newer-entry',
      'older-entry',
    ]);
  });

  it('接受金额上下限，并始终使用整数分计算负结余', async () => {
    const ids = ['minimum-entry', 'maximum-entry'];
    const ledger = await createLedger({
      database,
      now: () => new Date('2026-07-26T08:00:00.000Z'),
      generateId: () => ids.shift() ?? 'unexpected-id',
    });

    await ledger.add({
      amount: '0.01',
      type: 'income',
      description: '最小值',
      date: '2026-07-26',
    });
    await ledger.add({
      amount: '1000000.00',
      type: 'expense',
      description: '最大值',
      date: '2026-07-26',
    });

    await expect(ledger.snapshot()).resolves.toMatchObject({
      summary: {
        totalIncome: 1,
        totalExpense: 100000000,
        balance: -99999999,
        count: 2,
      },
    });
  });

  it.each([
    ['0', 'amount'],
    ['-0.01', 'amount'],
    ['1000000.01', 'amount'],
    ['1.001', 'amount'],
    ['1e2', 'amount'],
    [' 1.00 ', 'amount'],
    ['01.00', 'amount'],
    ['2026-02-29', 'date'],
    ['2026-07-27', 'date'],
    ['2026-7-01', 'date'],
    ['   ', 'description'],
    ['记'.repeat(501), 'description'],
  ] as const)('拒绝非法输入 %s，且不产生部分写入', async (value, field) => {
    const ledger = await createLedger({
      database,
      now: () => new Date('2026-07-26T08:00:00.000Z'),
      generateId: () => 'invalid-entry',
    });
    const input: LedgerEntryInput = {
      amount: '1.00',
      type: 'income',
      description: '合法说明',
      date: '2026-07-26',
      [field]: value,
    };

    await expect(ledger.add(input)).rejects.toMatchObject<
      Partial<LedgerValidationError>
    >({ field });
    await expect(ledger.snapshot()).resolves.toMatchObject({
      entries: [],
      summary: { count: 0 },
    });
  });

  it('编辑不存在或已删除的账目返回明确的 not-found 错误', async () => {
    const ledger = await createLedger({
      database,
      now: () => new Date('2026-07-26T08:00:00.000Z'),
      generateId: () => 'removed-entry',
    });
    const input: LedgerEntryInput = {
      amount: '1.00',
      type: 'income',
      description: '账目',
      date: '2026-07-26',
    };
    await ledger.add(input);
    await ledger.remove('removed-entry');

    await expect(ledger.update('removed-entry', input)).rejects.toBeInstanceOf(
      LedgerEntryNotFoundError,
    );
    await expect(ledger.update('missing-entry', input)).rejects.toBeInstanceOf(
      LedgerEntryNotFoundError,
    );
  });
});
