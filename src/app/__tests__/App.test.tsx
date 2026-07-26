import { fireEvent, render, screen } from '@testing-library/react-native';

import { BookkeepingApp } from '../App';
import type { Ledger } from '../src/ledger';

it('composition root 打开本地账本后才呈现账目界面', async () => {
  const ledger: Ledger = {
    snapshot: jest.fn().mockResolvedValue({
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
  const openLedger = jest.fn().mockResolvedValue(ledger);

  render(<BookkeepingApp openLedger={openLedger} />);

  expect(screen.getByText('正在打开本地账本…')).toBeOnTheScreen();
  expect(await screen.findByText('还没有账目条目')).toBeOnTheScreen();
  expect(openLedger).toHaveBeenCalledTimes(1);
});

it('打开本地账本失败后可以重试同一个装配入口', async () => {
  const ledger: Ledger = {
    snapshot: jest.fn().mockResolvedValue({
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
  const openLedger = jest
    .fn()
    .mockRejectedValueOnce(new Error('migration failed'))
    .mockResolvedValueOnce(ledger);

  render(<BookkeepingApp openLedger={openLedger} />);

  expect(await screen.findByText('无法打开本地账本，请重试。')).toBeOnTheScreen();
  fireEvent.press(screen.getByRole('button', { name: '重试' }));

  expect(screen.getByText('正在打开本地账本…')).toBeOnTheScreen();
  expect(await screen.findByText('还没有账目条目')).toBeOnTheScreen();
  expect(openLedger).toHaveBeenCalledTimes(2);
});
