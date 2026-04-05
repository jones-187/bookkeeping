/**
 * IndexedDB 数据库实现（Web 平台）
 * 模拟 SQLite API 接口
 */
import { Database, DbRow } from './interface';

const DB_NAME = 'bookkeeping';
const DB_VERSION = 1;

/**
 * IndexedDB 数据库实现
 */
export class WebDatabase implements Database {
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        reject(new Error(`Failed to open IndexedDB: ${request.error?.message}`));
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // 创建 ledger_entries 存储
        if (!db.objectStoreNames.contains('ledger_entries')) {
          const store = db.createObjectStore('ledger_entries', { keyPath: 'id' });
          store.createIndex('date', 'date', { unique: false });
          store.createIndex('type', 'type', { unique: false });
          store.createIndex('deleted_at', 'deleted_at', { unique: false });
        }

        // 创建 schema_version 存储
        if (!db.objectStoreNames.contains('schema_version')) {
          db.createObjectStore('schema_version', { keyPath: 'version' });
        }
      };
    });
  }

  async execAsync(_sql: string): Promise<void> {
    // IndexedDB 不支持直接执行 SQL
    // 表结构在 onupgradeneeded 中创建
    // 此方法保留用于兼容性
    if (!this.db) {
      await this.init();
    }
  }

  async runAsync(
    sql: string,
    params: (string | number | null)[]
  ): Promise<{ changes: number; lastInsertRowId: number }> {
    if (!this.db) {
      await this.init();
    }

    const sqlUpper = sql.trim().toUpperCase();

    if (sqlUpper.startsWith('INSERT')) {
      return this.handleInsert(sql, params);
    } else if (sqlUpper.startsWith('UPDATE')) {
      return this.handleUpdate(sql, params);
    } else if (sqlUpper.startsWith('DELETE')) {
      return this.handleDelete(sql, params);
    }

    return { changes: 0, lastInsertRowId: 0 };
  }

  private async handleInsert(
    sql: string,
    params: (string | number | null)[]
  ): Promise<{ changes: number; lastInsertRowId: number }> {
    if (!this.db) throw new Error('Database not initialized');

    // 解析 INSERT 语句
    // INSERT INTO table (columns) VALUES (?, ?, ?)
    const match = sql.match(/INSERT\s+INTO\s+(\w+)\s*\(([^)]+)\)\s*VALUES/i);
    if (!match) {
      throw new Error(`Invalid INSERT statement: ${sql}`);
    }

    const tableName = match[1];
    const columns = match[2].split(',').map(c => c.trim());

    // 将 params 映射到列名
    const row: DbRow = {};
    columns.forEach((col, i) => {
      // 将 snake_case 转换为 camelCase 存储
      const camelKey = this.toCamelCase(col);
      // 如果 params[i] 是 undefined，使用 null
      row[camelKey] = params[i] !== undefined ? params[i] : null;
    });

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([tableName], 'readwrite');
      const store = transaction.objectStore(tableName);

      // 使用提供的 id 或生成新的
      const id = row.id as string || crypto.randomUUID();
      row.id = id;

      const request = store.add(row);

      request.onsuccess = () => {
        resolve({ changes: 1, lastInsertRowId: 1 });
      };

      request.onerror = () => {
        reject(new Error(`Insert failed: ${request.error?.message}`));
      };
    });
  }

  private async handleUpdate(
    sql: string,
    params: (string | number | null)[]
  ): Promise<{ changes: number; lastInsertRowId: number }> {
    if (!this.db) throw new Error('Database not initialized');

    // 解析 UPDATE 语句
    // UPDATE table SET col1 = ?, col2 = ? WHERE id = ?
    const match = sql.match(/UPDATE\s+(\w+)\s+SET\s+(.+?)\s+WHERE\s+(.+)/i);
    if (!match) {
      throw new Error(`Invalid UPDATE statement: ${sql}`);
    }

    const tableName = match[1];
    const setClause = match[2];
    const whereClause = match[3];

    // 解析 SET 子句
    const setMatches = setClause.matchAll(/(\w+)\s*=\s*\?/g);
    const updates: { [key: string]: string | number | null } = {};
    let paramIndex = 0;

    for (const m of setMatches) {
      const column = this.toCamelCase(m[1]);
      updates[column] = params[paramIndex++];
    }

    // 解析 WHERE 子句
    const whereMatch = whereClause.match(/id\s*=\s*\?/i);
    if (!whereMatch) {
      throw new Error(`Only id-based WHERE clauses are supported: ${whereClause}`);
    }
    const id = params[paramIndex] as string;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([tableName], 'readwrite');
      const store = transaction.objectStore(tableName);

      const getRequest = store.get(id);

      getRequest.onsuccess = () => {
        const row = getRequest.result;
        if (!row) {
          resolve({ changes: 0, lastInsertRowId: 0 });
          return;
        }

        // 应用更新
        Object.assign(row, updates);

        const putRequest = store.put(row);

        putRequest.onsuccess = () => {
          resolve({ changes: 1, lastInsertRowId: 0 });
        };

        putRequest.onerror = () => {
          reject(new Error(`Update failed: ${putRequest.error?.message}`));
        };
      };

      getRequest.onerror = () => {
        reject(new Error(`Get failed: ${getRequest.error?.message}`));
      };
    });
  }

  private async handleDelete(
    sql: string,
    params: (string | number | null)[]
  ): Promise<{ changes: number; lastInsertRowId: number }> {
    if (!this.db) throw new Error('Database not initialized');

    // 项目使用软删除，所以 DELETE 实际上是 UPDATE
    // 这里处理真正的 DELETE（如果需要）
    const match = sql.match(/DELETE\s+FROM\s+(\w+)\s+WHERE\s+(.+)/i);
    if (!match) {
      throw new Error(`Invalid DELETE statement: ${sql}`);
    }

    const tableName = match[1];
    const whereClause = match[2];

    const whereMatch = whereClause.match(/id\s*=\s*\?/i);
    if (!whereMatch) {
      throw new Error(`Only id-based WHERE clauses are supported: ${whereClause}`);
    }
    const id = params[0] as string;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([tableName], 'readwrite');
      const store = transaction.objectStore(tableName);

      const request = store.delete(id);

      request.onsuccess = () => {
        resolve({ changes: 1, lastInsertRowId: 0 });
      };

      request.onerror = () => {
        reject(new Error(`Delete failed: ${request.error?.message}`));
      };
    });
  }

  async getFirstAsync<T>(
    sql: string,
    params: (string | number | null)[] = []
  ): Promise<T | null> {
    const results = await this.getAllAsync<T>(sql, params);
    return results.length > 0 ? results[0] : null;
  }

  async getAllAsync<T>(
    sql: string,
    params: (string | number | null)[] = []
  ): Promise<T[]> {
    if (!this.db) {
      await this.init();
    }

    // 解析 SELECT 语句
    const match = sql.match(/SELECT\s+(.+?)\s+FROM\s+(\w+)(?:\s+WHERE\s+(.+?))?(?:\s+ORDER\s+BY\s+(.+?))?$/i);
    if (!match) {
      throw new Error(`Invalid SELECT statement: ${sql}`);
    }

    const columns = match[1];
    const tableName = match[2];
    const whereClause = match[3];
    const orderBy = match[4];

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([tableName], 'readonly');
      const store = transaction.objectStore(tableName);

      let request: IDBRequest;

      // 处理 WHERE 子句
      if (whereClause) {
        // 解析简单的 WHERE 条件
        const whereMatch = whereClause.match(/(\w+)\s*=\s*\?/i);
        if (whereMatch) {
          const column = this.toCamelCase(whereMatch[1]);
          const value = params[0];

          if (column === 'id') {
            request = store.get(value as string);
            request.onsuccess = () => {
              const row = request.result;
              if (row && this.matchesWhere(row, whereClause, params)) {
                resolve([this.transformRow<T>(row, columns)]);
              } else {
                resolve([]);
              }
            };
            request.onerror = () => reject(request.error);
            return;
          }

          // 使用索引查询
          const index = store.index(column);
          request = index.getAll(value);
        } else {
          // 复杂 WHERE 条件，获取全部后过滤
          request = store.getAll();
        }
      } else {
        request = store.getAll();
      }

      request.onsuccess = () => {
        let rows = request.result as DbRow[];

        // 应用 WHERE 过滤
        if (whereClause && !whereClause.match(/(\w+)\s*=\s*\?/)) {
          rows = rows.filter(row => this.matchesWhere(row, whereClause, params));
        }

        // 应用排序
        if (orderBy) {
          const orderParts = orderBy.split(',').map(p => p.trim());
          rows.sort((a, b) => {
            for (const part of orderParts) {
              const [col, dir] = part.split(/\s+/);
              const camelCol = this.toCamelCase(col);
              const aVal = a[camelCol];
              const bVal = b[camelCol];

              let cmp = 0;
              if (typeof aVal === 'string' && typeof bVal === 'string') {
                cmp = aVal.localeCompare(bVal);
              } else if (typeof aVal === 'number' && typeof bVal === 'number') {
                cmp = aVal - bVal;
              }

              if (dir?.toUpperCase() === 'DESC') {
                cmp = -cmp;
              }

              if (cmp !== 0) return cmp;
            }
            return 0;
          });
        }

        // 转换列名并返回
        resolve(rows.map(row => this.transformRow<T>(row, columns)));
      };

      request.onerror = () => {
        reject(new Error(`Query failed: ${request.error?.message}`));
      };
    });
  }

  /**
   * 检查行是否匹配 WHERE 条件
   */
  private matchesWhere(
    row: DbRow,
    whereClause: string,
    params: (string | number | null)[]
  ): boolean {
    // 处理 deleted_at IS NULL (包括 undefined 情况)
    if (whereClause.includes('deleted_at IS NULL')) {
      // undefined 也视为 NULL
      if (row.deletedAt !== null && row.deletedAt !== undefined) {
        return false;
      }
    }

    // 处理简单的 column = ? 条件
    const conditions = whereClause.split(/\s+AND\s+/i);
    let paramIndex = 0;

    for (const cond of conditions) {
      const match = cond.match(/(\w+)\s*=\s*\?/);
      if (match) {
        const column = this.toCamelCase(match[1]);
        const value = params[paramIndex++];

        if (row[column] !== value) {
          return false;
        }
      }

      // IS NULL 条件
      const nullMatch = cond.match(/(\w+)\s+IS\s+NULL/i);
      if (nullMatch) {
        const column = this.toCamelCase(nullMatch[1]);
        // undefined 也视为 NULL
        if (row[column] !== null && row[column] !== undefined) {
          return false;
        }
      }
    }

    return true;
  }

  /**
   * 转换行数据，处理列名映射
   */
  private transformRow<T>(row: DbRow, columns: string): T {
    if (columns === '*') {
      // 将 camelCase 转换为 snake_case 以匹配 SQLite 行格式
      const result: DbRow = {};
      for (const [key, value] of Object.entries(row)) {
        result[this.toSnakeCase(key)] = value;
      }
      return result as T;
    }

    // 选择特定列
    const result: DbRow = {};
    const cols = columns.split(',').map(c => c.trim());

    for (const col of cols) {
      const camelKey = this.toCamelCase(col);
      const snakeKey = this.toSnakeCase(camelKey);
      result[snakeKey] = row[camelKey];
    }

    return result as T;
  }

  /**
   * camelCase -> snake_case
   */
  private toSnakeCase(str: string): string {
    return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
  }

  /**
   * snake_case -> camelCase
   */
  private toCamelCase(str: string): string {
    return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
  }
}

// 单例实例
let webDb: WebDatabase | null = null;

/**
 * 获取 Web 数据库实例
 */
export async function getWebDatabase(): Promise<Database> {
  if (!webDb) {
    webDb = new WebDatabase();
    await webDb.init();
  }
  return webDb;
}
