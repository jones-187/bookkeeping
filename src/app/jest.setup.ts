import "@testing-library/jest-native/extend-expect";

// Mock expo-sqlite
jest.mock('expo-sqlite', () => {
  // 使用全局变量存储数据库状态
  const globalStore = global as unknown as { __testDb?: Map<string, { columns: string[]; rows: unknown[][] }> };

  // 每次测试文件加载时重置
  globalStore.__testDb = new Map();

  const databases = globalStore.__testDb;

  return {
    openDatabaseAsync: async (dbName: string) => {
      // 如果数据库不存在才创建，不重置已存在的数据库
      if (!databases.has(dbName)) {
        databases.set(dbName, { columns: [], rows: [] });
      }

      // 使用闭包捕获 dbName，确保所有方法使用同一个数据库名
      const tableName = dbName;

      return {
        execAsync: async (sql: string) => {
          const table = databases.get(tableName)!;
          if (sql.includes('CREATE TABLE IF NOT EXISTS ledger_entries')) {
            table.columns = ['id', 'amount', 'type', 'description', 'date', 'created_at', 'updated_at', 'deleted_at'];
          } else if (sql.includes('CREATE TABLE IF NOT EXISTS schema_version')) {
            table.columns = ['version', 'applied_at'];
          } else if (sql.includes('DELETE FROM ledger_entries')) {
            table.rows = [];
          }
        },

        runAsync: async (sql: string, params?: unknown[]) => {
          const table = databases.get(tableName)!;

          if (sql.includes('INSERT INTO schema_version')) {
            return { changes: 1, lastInsertRowId: 1 };
          }

          if (sql.includes('DELETE FROM ledger_entries')) {
            table.rows = [];
            return { changes: table.rows.length, lastInsertRowId: 0 };
          }

          if (sql.includes('INSERT INTO ledger_entries')) {
            // params 格式: [id, amount, type, description, date, created_at, updated_at]
            // deleted_at 在 SQL 中是 NULL，需要显式添加
            const row = [...(params || []), null];
            table.rows.push(row);
            return { changes: 1, lastInsertRowId: table.rows.length };
          }

          if (sql.includes('UPDATE ledger_entries SET deleted_at')) {
            // 软删除
            const id = params?.[1];
            const row = table.rows.find(r => r[0] === id);
            if (row && row[7] === null) {
              // 只有未删除的记录才能被删除
              row[7] = params?.[0]; // deleted_at
              return { changes: 1, lastInsertRowId: 0 };
            }
            return { changes: 0, lastInsertRowId: 0 };
          }

          if (sql.includes('UPDATE ledger_entries SET')) {
            // 更新操作
            // 解析 SET 子句
            const setMatch = sql.match(/SET\s+(.+?)\s+WHERE/i);
            if (setMatch && params) {
              const id = params[params.length - 1]; // 最后一个参数是 id
              const row = table.rows.find(r => r[0] === id && r[7] === null);
              if (row) {
                const setClauses = setMatch[1].split(',').map(s => s.trim());
                let paramIndex = 0;
                for (const clause of setClauses) {
                  const field = clause.split('=')[0].trim();
                  if (field === 'amount') row[1] = params[paramIndex++];
                  else if (field === 'type') row[2] = params[paramIndex++];
                  else if (field === 'description') row[3] = params[paramIndex++];
                  else if (field === 'date') row[4] = params[paramIndex++];
                  else if (field === 'updated_at') row[6] = params[paramIndex++];
                }
                return { changes: 1, lastInsertRowId: 0 };
              }
            }
            return { changes: 0, lastInsertRowId: 0 };
          }

          return { changes: 0, lastInsertRowId: 0 };
        },

        getFirstAsync: async <T>(sql: string, params?: unknown[]): Promise<T | undefined> => {
          const table = databases.get(tableName)!;

          if (sql.includes('SELECT MAX(version)')) {
            return { version: 1 } as T;
          }

          if (sql.includes('SELECT name FROM sqlite_master')) {
            return { name: 'ledger_entries' } as T;
          }

          if (sql.includes('SELECT COUNT(*)')) {
            // 处理带筛选条件的 count
            let rows = table.rows.filter(r => r[7] === null);

            if (sql.includes('type = ?') && params) {
              rows = rows.filter(r => r[2] === params[0]);
            }

            if (sql.includes('date >= ?') && params) {
              const startIdx = sql.indexOf('date >=') !== -1 ? params.findIndex(p => typeof p === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(p)) : -1;
              if (startIdx >= 0) rows = rows.filter(r => (r[4] as string) >= (params[startIdx] as string));
            }

            return { count: rows.length } as T;
          }

          if (sql.includes('SELECT * FROM ledger_entries WHERE id = ?')) {
            const id = params?.[0];
            const row = table.rows.find(r => r[0] === id && r[7] === null);
            if (!row) return undefined;
            return {
              id: row[0],
              amount: row[1],
              type: row[2],
              description: row[3],
              date: row[4],
              created_at: row[5],
              updated_at: row[6],
              deleted_at: row[7],
            } as T;
          }

          return undefined;
        },

        getAllAsync: async <T>(sql: string, params?: unknown[]): Promise<T[]> => {
          const table = databases.get(tableName)!;

          if (sql.includes('SELECT * FROM ledger_entries')) {
            let rows = table.rows.filter(r => r[7] === null);

            // 处理类型筛选
            if (sql.includes('type = ?') && params) {
              const typeParam = params[0];
              rows = rows.filter(r => r[2] === typeParam);
            }

            // 处理日期筛选
            if (params && params.length > 0) {
              // 简化处理：假设 params 顺序是 [type?, startDate?, endDate?]
              let paramIdx = sql.includes('type = ?') ? 1 : 0;

              if (sql.includes('date >= ?')) {
                const startDate = params[paramIdx] as string;
                rows = rows.filter(r => (r[4] as string) >= startDate);
                paramIdx++;
              }

              if (sql.includes('date <= ?')) {
                const endDate = params[paramIdx] as string;
                rows = rows.filter(r => (r[4] as string) <= endDate);
              }
            }

            // 按日期降序排列
            rows.sort((a, b) => ((b[4] as string) || '').localeCompare((a[4] as string) || ''));

            return rows.map(row => ({
              id: row[0],
              amount: row[1],
              type: row[2],
              description: row[3],
              date: row[4],
              created_at: row[5],
              updated_at: row[6],
              deleted_at: row[7],
            })) as T[];
          }

          return [];
        },

        closeAsync: async () => {
          // 不删除数据库，保持测试间状态
        },
      };
    },
  };
});
