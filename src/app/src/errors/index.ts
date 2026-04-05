/**
 * 业务错误类型定义
 */

/** 验证错误 - 字段级别 */
export class ValidationError extends Error {
  constructor(
    message: string,
    public readonly field: string
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

/** 账目未找到错误 */
export class EntryNotFoundError extends Error {
  constructor(id: string) {
    super(`账目不存在: ${id}`);
    this.name = 'EntryNotFoundError';
  }
}

/** 业务规则错误 */
export class BusinessError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'BusinessError';
  }
}
