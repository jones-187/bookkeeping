import { render, screen } from '@testing-library/react-native';

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
