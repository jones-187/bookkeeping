import { formatLocalDate } from '../../src/ledger/localDate';

it('使用设备本地日历字段，不从 UTC 日期字符串截取默认日期', () => {
  const instant = new Date('2026-07-25T16:30:00.000Z');
  jest.spyOn(instant, 'getFullYear').mockReturnValue(2026);
  jest.spyOn(instant, 'getMonth').mockReturnValue(6);
  jest.spyOn(instant, 'getDate').mockReturnValue(26);

  expect(instant.toISOString().slice(0, 10)).toBe('2026-07-25');
  expect(formatLocalDate(instant)).toBe('2026-07-26');
});
