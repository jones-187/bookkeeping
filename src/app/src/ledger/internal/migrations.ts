import type { SqliteConnection } from './database';

const CURRENT_SCHEMA_VERSION = 1;

interface SchemaVersionRow {
  version: number;
}

export async function migrate(database: SqliteConnection): Promise<void> {
  await database.transaction(async (transaction) => {
    await transaction.exec(`
      CREATE TABLE IF NOT EXISTS ledger_schema (
        singleton INTEGER PRIMARY KEY CHECK (singleton = 1),
        version INTEGER NOT NULL CHECK (version >= 1)
      ) STRICT;
    `);

    const current = await transaction.getFirst<SchemaVersionRow>(
      'SELECT version FROM ledger_schema WHERE singleton = 1',
    );

    if (current === null) {
      await transaction.exec(`
        CREATE TABLE ledger_entries_v1 (
          sequence INTEGER PRIMARY KEY AUTOINCREMENT,
          id TEXT NOT NULL UNIQUE,
          amount INTEGER NOT NULL
            CHECK (typeof(amount) = 'integer')
            CHECK (amount BETWEEN 1 AND 100000000),
          type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
          description TEXT NOT NULL
            CHECK (length(trim(description)) BETWEEN 1 AND 500),
          date TEXT NOT NULL
            CHECK (length(date) = 10)
            CHECK (date = strftime('%Y-%m-%d', date)),
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL,
          deleted_at TEXT
        ) STRICT;

        CREATE INDEX ledger_entries_v1_visible_order
          ON ledger_entries_v1(date DESC, sequence DESC)
          WHERE deleted_at IS NULL;

        INSERT INTO ledger_schema(singleton, version)
          VALUES (1, ${CURRENT_SCHEMA_VERSION});
      `);
      return;
    }

    if (current.version !== CURRENT_SCHEMA_VERSION) {
      throw new Error(
        `不支持的账本数据库版本：${current.version}，当前版本：${CURRENT_SCHEMA_VERSION}`,
      );
    }
  });
}
