/**
 * 数据库抽象接口
 * 支持 SQLite (iOS/Android) 和 IndexedDB (Web)
 */
export interface Database {
  /**
   * 执行 SQL 语句（无返回结果）
   */
  execAsync(sql: string): Promise<void>;

  /**
   * 执行 INSERT/UPDATE/DELETE 语句
   * @returns 受影响的行数和最后插入的 ID
   */
  runAsync(
    sql: string,
    params: (string | number | null)[]
  ): Promise<{ changes: number; lastInsertRowId: number }>;

  /**
   * 查询单条记录
   */
  getFirstAsync<T>(
    sql: string,
    params?: (string | number | null)[]
  ): Promise<T | null>;

  /**
   * 查询多条记录
   */
  getAllAsync<T>(
    sql: string,
    params?: (string | number | null)[]
  ): Promise<T[]>;
}

/**
 * 数据库行类型（通用）
 */
export interface DbRow {
  [key: string]: string | number | null;
}
