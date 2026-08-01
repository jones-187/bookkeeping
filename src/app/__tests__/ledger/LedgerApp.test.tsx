import {
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react-native';

import {
  LedgerValidationError,
  type Ledger,
  type LedgerSnapshot,
} from '../../src/ledger';
import { LedgerApp } from '../../src/ledger/ui/LedgerApp';

describe('LedgerApp', () => {
  it('从一个账本快照同时呈现账目和带负号的汇总', async () => {
    const ledger: Ledger = {
      snapshot: jest.fn().mockResolvedValue({
        entries: [
          {
            id: 'expense-entry',
            amount: 12000,
            type: 'expense',
            description: '房租',
            date: '2026-07-26',
          },
        ],
        summary: {
          totalIncome: 0,
          totalExpense: 12000,
          balance: -12000,
          count: 1,
        },
      }),
      add: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };

    render(<LedgerApp ledger={ledger} />);

    expect(await screen.findByText('房租')).toBeOnTheScreen();
    expect(screen.getByText('-¥120.00')).toBeOnTheScreen();
    expect(screen.getByText('1 笔账目')).toBeOnTheScreen();
    expect(ledger.snapshot).toHaveBeenCalledTimes(1);
  });

  it('新增表单把原始十进制金额字符串交给 Ledger，并在返回列表时刷新一次快照', async () => {
    const emptySnapshot: LedgerSnapshot = {
      entries: [],
      summary: {
        totalIncome: 0,
        totalExpense: 0,
        balance: 0,
        count: 0,
      },
    };
    const snapshotWithEntry: LedgerSnapshot = {
      entries: [
        {
          id: 'new-entry',
          amount: 1234,
          type: 'expense',
          description: '午餐',
          date: '2026-07-26',
        },
      ],
      summary: {
        totalIncome: 0,
        totalExpense: 1234,
        balance: -1234,
        count: 1,
      },
    };
    const ledger: Ledger = {
      snapshot: jest
        .fn()
        .mockResolvedValueOnce(emptySnapshot)
        .mockResolvedValueOnce(snapshotWithEntry),
      add: jest.fn().mockResolvedValue(snapshotWithEntry.entries[0]),
      update: jest.fn(),
      remove: jest.fn(),
    };
    render(<LedgerApp ledger={ledger} today={() => '2026-07-26'} />);
    expect(await screen.findByText('还没有账目条目')).toBeOnTheScreen();

    fireEvent.press(screen.getByRole('button', { name: '新增账目' }));
    fireEvent.changeText(await screen.findByLabelText('金额'), '12.34');
    fireEvent.press(screen.getByRole('button', { name: '支出' }));
    fireEvent.changeText(screen.getByLabelText('说明'), '午餐');
    expect(screen.getByDisplayValue('2026-07-26')).toBeOnTheScreen();
    fireEvent.press(screen.getByRole('button', { name: '保存账目' }));

    await waitFor(() => {
      expect(ledger.add).toHaveBeenCalledWith({
        amount: '12.34',
        type: 'expense',
        description: '午餐',
        date: '2026-07-26',
      });
    });
    expect(await screen.findByText('午餐')).toBeOnTheScreen();
    expect(ledger.snapshot).toHaveBeenCalledTimes(2);
  });

  it('编辑表单从整数分生成精确字符串，并把完整替换交给 Ledger', async () => {
    const existingSnapshot: LedgerSnapshot = {
      entries: [
        {
          id: 'rent-entry',
          amount: 12000,
          type: 'expense',
          description: '房租',
          date: '2026-07-25',
        },
      ],
      summary: {
        totalIncome: 0,
        totalExpense: 12000,
        balance: -12000,
        count: 1,
      },
    };
    const editedSnapshot: LedgerSnapshot = {
      entries: [
        {
          id: 'rent-entry',
          amount: 13050,
          type: 'income',
          description: '退租退款',
          date: '2026-07-26',
        },
      ],
      summary: {
        totalIncome: 13050,
        totalExpense: 0,
        balance: 13050,
        count: 1,
      },
    };
    const ledger: Ledger = {
      snapshot: jest
        .fn()
        .mockResolvedValueOnce(existingSnapshot)
        .mockResolvedValueOnce(editedSnapshot),
      add: jest.fn(),
      update: jest.fn().mockResolvedValue(editedSnapshot.entries[0]),
      remove: jest.fn(),
    };
    render(<LedgerApp ledger={ledger} />);
    expect(await screen.findByText('房租')).toBeOnTheScreen();

    fireEvent.press(screen.getByRole('button', { name: '编辑 房租' }));
    expect(await screen.findByDisplayValue('120.00')).toBeOnTheScreen();
    fireEvent.changeText(screen.getByLabelText('金额'), '130.50');
    fireEvent.press(screen.getByRole('button', { name: '收入' }));
    fireEvent.changeText(screen.getByLabelText('说明'), '退租退款');
    fireEvent.changeText(screen.getByLabelText('日期'), '2026-07-26');
    fireEvent.press(screen.getByRole('button', { name: '保存修改' }));

    await waitFor(() => {
      expect(ledger.update).toHaveBeenCalledWith('rent-entry', {
        amount: '130.50',
        type: 'income',
        description: '退租退款',
        date: '2026-07-26',
      });
    });
    expect(await screen.findByText('退租退款')).toBeOnTheScreen();
    expect(ledger.snapshot).toHaveBeenCalledTimes(2);
  });

  it('删除前要求用户明确确认，完成后从一致快照中消失', async () => {
    const existingSnapshot: LedgerSnapshot = {
      entries: [
        {
          id: 'delete-entry',
          amount: 500,
          type: 'expense',
          description: '待删除',
          date: '2026-07-26',
        },
      ],
      summary: {
        totalIncome: 0,
        totalExpense: 500,
        balance: -500,
        count: 1,
      },
    };
    const emptySnapshot: LedgerSnapshot = {
      entries: [],
      summary: {
        totalIncome: 0,
        totalExpense: 0,
        balance: 0,
        count: 0,
      },
    };
    const ledger: Ledger = {
      snapshot: jest
        .fn()
        .mockResolvedValueOnce(existingSnapshot)
        .mockResolvedValueOnce(emptySnapshot),
      add: jest.fn(),
      update: jest.fn(),
      remove: jest.fn().mockResolvedValue(undefined),
    };
    render(<LedgerApp ledger={ledger} />);
    expect(await screen.findByText('待删除')).toBeOnTheScreen();
    fireEvent.press(screen.getByRole('button', { name: '编辑 待删除' }));

    fireEvent.press(await screen.findByRole('button', { name: '删除账目' }));
    expect(screen.getByText('确定删除这笔账目？')).toBeOnTheScreen();
    expect(ledger.remove).not.toHaveBeenCalled();
    fireEvent.press(screen.getByRole('button', { name: '确认删除' }));

    await waitFor(() => {
      expect(ledger.remove).toHaveBeenCalledWith('delete-entry');
    });
    expect(await screen.findByText('还没有账目条目')).toBeOnTheScreen();
    expect(ledger.snapshot).toHaveBeenCalledTimes(2);
  });

  it('可以取消新增而不产生写入', async () => {
    const emptySnapshot: LedgerSnapshot = {
      entries: [],
      summary: {
        totalIncome: 0,
        totalExpense: 0,
        balance: 0,
        count: 0,
      },
    };
    const ledger: Ledger = {
      snapshot: jest.fn().mockResolvedValue(emptySnapshot),
      add: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };
    render(<LedgerApp ledger={ledger} />);
    expect(await screen.findByText('还没有账目条目')).toBeOnTheScreen();
    fireEvent.press(screen.getByRole('button', { name: '新增账目' }));

    fireEvent.press(await screen.findByRole('button', { name: '取消' }));

    expect(await screen.findByText('还没有账目条目')).toBeOnTheScreen();
    expect(ledger.add).not.toHaveBeenCalled();
    expect(ledger.snapshot).toHaveBeenCalledTimes(2);
  });

  it('本地读取失败后可以在原地重试', async () => {
    const ledger: Ledger = {
      snapshot: jest
        .fn()
        .mockRejectedValueOnce(new Error('database busy'))
        .mockResolvedValueOnce({
          entries: [],
          summary: {
            totalIncome: 0,
            totalExpense: 0,
            balance: 0,
            count: 0,
          },
        }),
      add: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };
    render(<LedgerApp ledger={ledger} />);
    expect(
      await screen.findByText('无法读取本地账目，请稍后重试。'),
    ).toBeOnTheScreen();

    fireEvent.press(screen.getByRole('button', { name: '重试读取' }));

    expect(await screen.findByText('还没有账目条目')).toBeOnTheScreen();
    expect(ledger.snapshot).toHaveBeenCalledTimes(2);
  });

  it('输入校验失败时保留表单并显示 Ledger 返回的字段错误', async () => {
    const emptySnapshot: LedgerSnapshot = {
      entries: [],
      summary: {
        totalIncome: 0,
        totalExpense: 0,
        balance: 0,
        count: 0,
      },
    };
    const ledger: Ledger = {
      snapshot: jest.fn().mockResolvedValue(emptySnapshot),
      add: jest
        .fn()
        .mockRejectedValue(
          new LedgerValidationError(
            'amount',
            '金额必须是最多两位小数的十进制数字',
          ),
        ),
      update: jest.fn(),
      remove: jest.fn(),
    };
    render(<LedgerApp ledger={ledger} today={() => '2026-07-26'} />);
    expect(await screen.findByText('还没有账目条目')).toBeOnTheScreen();
    fireEvent.press(screen.getByRole('button', { name: '新增账目' }));
    fireEvent.changeText(await screen.findByLabelText('金额'), '0.001');
    fireEvent.changeText(screen.getByLabelText('说明'), '精度错误');

    fireEvent.press(screen.getByRole('button', { name: '保存账目' }));

    expect(
      await screen.findByText('金额必须是最多两位小数的十进制数字'),
    ).toBeOnTheScreen();
    expect(screen.getByText('新增账目')).toBeOnTheScreen();
    expect(ledger.snapshot).toHaveBeenCalledTimes(1);
  });

  it('保存进行中时禁用编辑页的删除、取消、再次保存和所有编辑控件', async () => {
    const existingSnapshot: LedgerSnapshot = {
      entries: [
        {
          id: 'busy-save-entry',
          amount: 12000,
          type: 'expense',
          description: '房租',
          date: '2026-07-25',
        },
      ],
      summary: {
        totalIncome: 0,
        totalExpense: 12000,
        balance: -12000,
        count: 1,
      },
    };
    let resolveUpdate!: () => void;
    const updatePromise = new Promise<void>((resolve) => {
      resolveUpdate = resolve;
    });
    const ledger: Ledger = {
      snapshot: jest.fn().mockResolvedValue(existingSnapshot),
      add: jest.fn(),
      update: jest.fn().mockReturnValue(updatePromise),
      remove: jest.fn(),
    };

    render(<LedgerApp ledger={ledger} />);
    expect(await screen.findByText('房租')).toBeOnTheScreen();
    fireEvent.press(screen.getByRole('button', { name: '编辑 房租' }));
    expect(await screen.findByDisplayValue('120.00')).toBeOnTheScreen();

    fireEvent.press(screen.getByRole('button', { name: '保存修改' }));

    await waitFor(() => {
      expect(ledger.update).toHaveBeenCalledTimes(1);
    });
    expect(screen.getByText('正在保存…')).toBeOnTheScreen();
    expect(screen.getByLabelText('金额').props.editable).toBe(false);
    expect(screen.getByLabelText('说明').props.editable).toBe(false);
    expect(screen.getByLabelText('日期').props.editable).toBe(false);
    expect(screen.getByRole('button', { disabled: true, name: '收入' })).toBeOnTheScreen();
    expect(screen.getByRole('button', { disabled: true, name: '支出' })).toBeOnTheScreen();
    expect(screen.getByRole('button', { disabled: true, name: '保存修改' })).toBeOnTheScreen();
    expect(screen.getByLabelText('取消').props.accessibilityState?.disabled).toBe(true);
    expect(screen.getByRole('button', { disabled: true, name: '删除账目' })).toBeOnTheScreen();

    fireEvent.press(screen.getByRole('button', { name: '保存修改' }));
    fireEvent.press(screen.getByRole('button', { name: '删除账目' }));
    expect(screen.queryByText('确定删除这笔账目？')).toBeNull();
    expect(ledger.update).toHaveBeenCalledTimes(1);
    expect(ledger.remove).not.toHaveBeenCalled();

    resolveUpdate();
    expect(await screen.findByText('房租')).toBeOnTheScreen();
  });

  it('删除进行中时禁用编辑页的保存、取消、再次删除和所有编辑控件', async () => {
    const existingSnapshot: LedgerSnapshot = {
      entries: [
        {
          id: 'busy-delete-entry',
          amount: 500,
          type: 'expense',
          description: '待删除',
          date: '2026-07-26',
        },
      ],
      summary: {
        totalIncome: 0,
        totalExpense: 500,
        balance: -500,
        count: 1,
      },
    };
    let resolveRemove!: () => void;
    const removePromise = new Promise<void>((resolve) => {
      resolveRemove = resolve;
    });
    const ledger: Ledger = {
      snapshot: jest.fn().mockResolvedValue(existingSnapshot),
      add: jest.fn(),
      update: jest.fn(),
      remove: jest.fn().mockReturnValue(removePromise),
    };

    render(<LedgerApp ledger={ledger} />);
    expect(await screen.findByText('待删除')).toBeOnTheScreen();
    fireEvent.press(screen.getByRole('button', { name: '编辑 待删除' }));
    expect(await screen.findByDisplayValue('5.00')).toBeOnTheScreen();
    fireEvent.press(screen.getByRole('button', { name: '删除账目' }));
    fireEvent.press(screen.getByRole('button', { name: '确认删除' }));

    await waitFor(() => {
      expect(ledger.remove).toHaveBeenCalledTimes(1);
    });
    expect(screen.getByLabelText('金额').props.editable).toBe(false);
    expect(screen.getByLabelText('说明').props.editable).toBe(false);
    expect(screen.getByLabelText('日期').props.editable).toBe(false);
    expect(screen.getByRole('button', { disabled: true, name: '收入' })).toBeOnTheScreen();
    expect(screen.getByRole('button', { disabled: true, name: '支出' })).toBeOnTheScreen();
    expect(screen.getByRole('button', { disabled: true, name: '保存修改' })).toBeOnTheScreen();
    expect(screen.getByLabelText('取消').props.accessibilityState?.disabled).toBe(true);
    expect(screen.getByRole('button', { disabled: true, name: '取消删除' })).toBeOnTheScreen();
    expect(screen.getByRole('button', { disabled: true, name: '确认删除' })).toBeOnTheScreen();

    fireEvent.press(screen.getByRole('button', { name: '保存修改' }));
    fireEvent.press(screen.getByLabelText('取消'));
    fireEvent.press(screen.getByRole('button', { name: '确认删除' }));
    expect(ledger.update).not.toHaveBeenCalled();
    expect(ledger.remove).toHaveBeenCalledTimes(1);

    resolveRemove();
    expect(await screen.findByText('待删除')).toBeOnTheScreen();
  });

  it('保存失败后恢复编辑页操作并允许再次保存', async () => {
    const existingSnapshot: LedgerSnapshot = {
      entries: [
        {
          id: 'failed-save-entry',
          amount: 12000,
          type: 'expense',
          description: '房租',
          date: '2026-07-25',
        },
      ],
      summary: {
        totalIncome: 0,
        totalExpense: 12000,
        balance: -12000,
        count: 1,
      },
    };
    const ledger: Ledger = {
      snapshot: jest.fn().mockResolvedValue(existingSnapshot),
      add: jest.fn(),
      update: jest
        .fn()
        .mockRejectedValueOnce(new Error('保存失败'))
        .mockResolvedValueOnce(undefined),
      remove: jest.fn(),
    };

    render(<LedgerApp ledger={ledger} />);
    expect(await screen.findByText('房租')).toBeOnTheScreen();
    fireEvent.press(screen.getByRole('button', { name: '编辑 房租' }));
    expect(await screen.findByDisplayValue('120.00')).toBeOnTheScreen();
    fireEvent.press(screen.getByRole('button', { name: '保存修改' }));

    expect(await screen.findByText('保存失败')).toBeOnTheScreen();
    expect(screen.getByLabelText('金额').props.editable).toBe(true);
    expect(screen.getByLabelText('说明').props.editable).toBe(true);
    expect(screen.getByLabelText('日期').props.editable).toBe(true);
    expect(screen.getByRole('button', { disabled: false, name: '保存修改' })).toBeOnTheScreen();
    expect(screen.getByLabelText('取消').props.accessibilityState?.disabled).not.toBe(true);
    expect(screen.getByRole('button', { disabled: false, name: '删除账目' })).toBeOnTheScreen();

    fireEvent.press(screen.getByRole('button', { name: '保存修改' }));
    await waitFor(() => {
      expect(ledger.update).toHaveBeenCalledTimes(2);
    });
    expect(await screen.findByText('房租')).toBeOnTheScreen();
  });

  it('删除失败后恢复确认操作并允许再次删除', async () => {
    const existingSnapshot: LedgerSnapshot = {
      entries: [
        {
          id: 'failed-delete-entry',
          amount: 500,
          type: 'expense',
          description: '待删除',
          date: '2026-07-26',
        },
      ],
      summary: {
        totalIncome: 0,
        totalExpense: 500,
        balance: -500,
        count: 1,
      },
    };
    const ledger: Ledger = {
      snapshot: jest.fn().mockResolvedValue(existingSnapshot),
      add: jest.fn(),
      update: jest.fn(),
      remove: jest
        .fn()
        .mockRejectedValueOnce(new Error('删除失败'))
        .mockResolvedValueOnce(undefined),
    };

    render(<LedgerApp ledger={ledger} />);
    expect(await screen.findByText('待删除')).toBeOnTheScreen();
    fireEvent.press(screen.getByRole('button', { name: '编辑 待删除' }));
    expect(await screen.findByDisplayValue('5.00')).toBeOnTheScreen();
    fireEvent.press(screen.getByRole('button', { name: '删除账目' }));
    fireEvent.press(screen.getByRole('button', { name: '确认删除' }));

    expect(await screen.findByText('删除失败')).toBeOnTheScreen();
    expect(screen.getByLabelText('金额').props.editable).toBe(true);
    expect(screen.getByLabelText('说明').props.editable).toBe(true);
    expect(screen.getByLabelText('日期').props.editable).toBe(true);
    expect(screen.getByRole('button', { disabled: false, name: '保存修改' })).toBeOnTheScreen();
    expect(screen.getByRole('button', { disabled: false, name: '取消删除' })).toBeOnTheScreen();
    expect(screen.getByRole('button', { disabled: false, name: '确认删除' })).toBeOnTheScreen();

    fireEvent.press(screen.getByRole('button', { name: '确认删除' }));
    await waitFor(() => {
      expect(ledger.remove).toHaveBeenCalledTimes(2);
    });
    expect(await screen.findByText('待删除')).toBeOnTheScreen();
  });
});
