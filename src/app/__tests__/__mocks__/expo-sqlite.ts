/**
 * expo-sqlite Jest Mock
 */
export interface SQLiteRunResult {
  changes: number;
  lastInsertRowId: number | bigint;
}

export interface SQLiteDatabase {
  execAsync: (sql: string) => Promise<void>;
  runAsync: (sql: string, params?: unknown[]) => Promise<SQLiteRunResult>;
  getFirstAsync: <T = unknown>(sql: string, params?: unknown[]) => Promise<T | undefined>;
  getAllAsync: <T = unknown>(sql: string, params?: unknown[]) => Promise<T[]>;
  closeAsync: () => Promise<void>;
}

// In-memory database for testing
const databases = new Map<string, Map<string, unknown[][]>>();
const tables = new Map<string, { columns: string[]; rows: unknown[][] }>();

export const SQLiteMock = {
  openDatabaseAsync: async (name: string): Promise<SQLiteDatabase> => {
    const db = new Map<string, unknown[][]>();
    databases.set(name, db);
    tables.set(name, { columns: [], rows: [] });

    return {
      execAsync: async (sql: string) => {
        const table = tables.get(name)!;

        if (sql.includes('CREATE TABLE IF NOT EXISTS ledger_entries')) {
          table.columns = ['id', 'amount', 'type', 'description', 'date', 'created_at', 'updated_at', 'deleted_at'];
        } else if (sql.includes('CREATE INDEX')) {
          // Ignore index creation in tests
        } else if (sql.includes('CREATE TABLE IF NOT EXISTS schema_version')) {
          table.columns = ['version', 'applied_at'];
        }
      },

      runAsync: async (sql: string, params?: unknown[]): Promise<SQLiteRunResult> => {
        const table = tables.get(name)!;

        if (sql.includes('INSERT INTO schema_version')) {
          return { changes: 1, lastInsertRowId: 1 };
        }

        if (sql.includes('INSERT INTO ledger_entries')) {
          const row = params as unknown[];
          table.rows.push(row);
          return { changes: 1, lastInsertRowId: table.rows.length };
        }

        if (sql.includes('UPDATE ledger_entries')) {
          return { changes: 1, lastInsertRowId: 0 };
        }

        return { changes: 0, lastInsertRowId: 0 };
      },

      getFirstAsync: async <T>(sql: string, params?: unknown[]): Promise<T | undefined> => {
        const table = tables.get(name)!;

        if (sql.includes('SELECT MAX(version)')) {
          return { version: 1 } as T;
        }

        if (sql.includes('SELECT * FROM ledger_entries WHERE id = ?')) {
          const id = params?.[0];
          const row = table.rows.find(r => r[0] === id);
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

        if (sql.includes('SELECT COUNT(*)')) {
          return { count: table.rows.length } as T;
        }

        return undefined;
      },

      getAllAsync: async <T>(sql: string): Promise<T[]> => {
        const table = tables.get(name)!;

        if (sql.includes('SELECT * FROM ledger_entries')) {
          return table.rows.map(row => ({
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
        databases.delete(name);
        tables.delete(name);
      },
    };
  },
};

export default SQLiteMock;
