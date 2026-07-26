/**
 * 将领域层的整数分展示为人民币金额。
 *
 * 这里刻意不把金额转换为浮点数：`amount` 在领域层和持久化层都始终是分。
 */
export function formatCny(cents: number): string {
  const sign = cents < 0 ? '-' : '';
  const absoluteCents = Math.abs(cents);
  const yuan = Math.floor(absoluteCents / 100);
  const fraction = String(absoluteCents % 100).padStart(2, '0');

  return `${sign}¥${yuan}.${fraction}`;
}

/** 将正整数分恢复为表单所需的、恰好两位小数的十进制字符串。 */
export function formatCentsForInput(cents: number): string {
  const yuan = Math.floor(cents / 100);
  const fraction = String(cents % 100).padStart(2, '0');

  return `${yuan}.${fraction}`;
}
