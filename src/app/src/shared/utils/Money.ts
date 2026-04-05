/**
 * Money - 货币金额处理工具类
 *
 * 内部使用整数存储（以分为单位），避免浮点数精度问题
 */

export const SCALE = 100; // 1元 = 100分

/** 错误消息前缀 */
const ERROR_PREFIX = 'Invalid value';

/**
 * 从元转换为分
 * @param yuan - 金额（元），支持小数
 * @returns 金额（分），整数
 */
export function fromYuan(yuan: number): number {
  if (!Number.isFinite(yuan)) {
    throw new Error(`${ERROR_PREFIX}: yuan must be a finite number`);
  }
  return Math.round(yuan * SCALE);
}

/**
 * 从分转换为元
 * @param cents - 金额（分）
 * @returns 金额（元），保留两位小数
 */
export function toYuan(cents: number): number {
  if (!Number.isFinite(cents)) {
    throw new Error(`${ERROR_PREFIX}: cents must be a finite number`);
  }
  return cents / SCALE;
}

/**
 * 金额相加
 * @param cents1 - 第一个金额（分）
 * @param cents2 - 第二个金额（分）
 * @returns 相加结果（分）
 */
export function add(cents1: number, cents2: number): number {
  if (!Number.isFinite(cents1) || !Number.isFinite(cents2)) {
    throw new Error(`${ERROR_PREFIX}: cents must be finite numbers`);
  }
  return cents1 + cents2;
}

/**
 * 金额相减
 * @param cents1 - 被减数（分）
 * @param cents2 - 减数（分）
 * @returns 相减结果（分）
 */
export function subtract(cents1: number, cents2: number): number {
  if (!Number.isFinite(cents1) || !Number.isFinite(cents2)) {
    throw new Error(`${ERROR_PREFIX}: cents must be finite numbers`);
  }
  return cents1 - cents2;
}

/**
 * 金额乘法
 * @param cents - 金额（分）
 * @param multiplier - 乘数
 * @returns 乘法结果（分），四舍五入
 */
export function multiply(cents: number, multiplier: number): number {
  if (!Number.isFinite(cents) || !Number.isFinite(multiplier)) {
    throw new Error(`${ERROR_PREFIX}: cents and multiplier must be finite numbers`);
  }
  return Math.round(cents * multiplier);
}

/**
 * 金额除法
 * @param cents - 金额（分）
 * @param divisor - 除数
 * @returns 除法结果（分），四舍五入
 */
export function divide(cents: number, divisor: number): number {
  if (!Number.isFinite(cents) || !Number.isFinite(divisor)) {
    throw new Error(`${ERROR_PREFIX}: cents and divisor must be finite numbers`);
  }
  if (divisor === 0) {
    throw new Error('Division by zero');
  }
  return Math.round(cents / divisor);
}

/**
 * 格式化金额为显示字符串
 * @param cents - 金额（分）
 * @param showSymbol - 是否显示人民币符号（默认 true）
 * @returns 格式化的金额字符串，如 "¥100.00"
 */
export function format(cents: number, showSymbol: boolean = true): string {
  if (!Number.isFinite(cents)) {
    throw new Error(`${ERROR_PREFIX}: cents must be a finite number`);
  }
  // 使用纯整数运算避免浮点精度问题
  const integerYuan = Math.trunc(cents / SCALE);
  const remainder = Math.abs(cents % SCALE);
  const formatted = `${integerYuan}.${String(remainder).padStart(2, '0')}`;
  return showSymbol ? `¥${formatted}` : formatted;
}

/**
 * 解析金额字符串
 * @param value - 金额字符串，如 "100" 或 "100.50"
 * @returns 金额（分）
 */
export function parse(value: string): number {
  if (!value || value.trim() === '') {
    throw new Error(`${ERROR_PREFIX}: amount string cannot be empty`);
  }
  const parsed = parseFloat(value.trim());
  if (isNaN(parsed)) {
    throw new Error(`${ERROR_PREFIX}: amount string cannot be parsed to number`);
  }
  return fromYuan(parsed);
}

/**
 * 比较两个金额
 * @param cents1 - 第一个金额（分）
 * @param cents2 - 第二个金额（分）
 * @returns -1: cents1 < cents2, 0: 相等, 1: cents1 > cents2
 */
export function compare(cents1: number, cents2: number): number {
  if (!Number.isFinite(cents1) || !Number.isFinite(cents2)) {
    throw new Error(`${ERROR_PREFIX}: cents must be finite numbers`);
  }
  if (cents1 < cents2) return -1;
  if (cents1 > cents2) return 1;
  return 0;
}

/**
 * 取绝对值
 * @param cents - 金额（分）
 * @returns 绝对值（分）
 */
export function abs(cents: number): number {
  if (!Number.isFinite(cents)) {
    throw new Error(`${ERROR_PREFIX}: cents must be a finite number`);
  }
  return Math.abs(cents);
}

/**
 * 取负值
 * @param cents - 金额（分）
 * @returns 负值（分）
 */
export function negate(cents: number): number {
  if (!Number.isFinite(cents)) {
    throw new Error(`${ERROR_PREFIX}: cents must be a finite number`);
  }
  return cents === 0 ? 0 : -cents;
}