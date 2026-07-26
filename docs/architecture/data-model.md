# 数据模型

## 持久化边界

账目数据由 Ledger 模块独占管理。iOS 和 Android 使用 `expo-sqlite` 打开 `bookkeeping-native-v1.db`；SQLite 连接和内部 `SqliteConnection` 仅用于 Ledger 的实现与真实 SQLite 契约测试，不是应用层公共存储抽象。

## ledger_entries_v1 与 ledger_schema

精确 schema 与索引定义位于 [迁移实现](../../src/app/src/ledger/internal/migrations.ts)。首次初始化会在同一个排他事务中创建 `ledger_schema`、`ledger_entries_v1` 和索引，并写入 schema 版本 `1`；任一语句失败时不会留下部分初始化状态。

| 字段 | 存储形式 | 含义 |
| --- | --- | --- |
| `sequence` | 整数，自增主键 | 用于稳定地排列同一天创建的条目。 |
| `id` | 文本，唯一 | 应用创建的 UUID。 |
| `amount` | 整数 | 金额，单位为分。 |
| `type` | `income` 或 `expense` | 收入或支出。 |
| `description` | 文本 | 条目描述。 |
| `date` | `YYYY-MM-DD` 文本 | 账目日期。 |
| `created_at` | ISO 8601 文本 | 创建时刻。 |
| `updated_at` | ISO 8601 文本 | 最近一次更新时刻。 |
| `deleted_at` | 可空 ISO 8601 文本 | 软删除时刻；`null` 表示有效记录。 |

对外的 `LedgerEntry` 不泄漏数据库时间戳或删除标记；映射和查询是 Ledger 的内部细节。当前模型只有这一种持久化实体，条目之间没有外键或其他实体关系。

## 不变量与访问语义

- `ledger_entries_v1` 是 `STRICT` 表；`amount` 必须为 `1` 至 `100000000` 的整数分，`type` 只能是 `income` 或 `expense`。
- Ledger 只接受格式为十进制字符串、最多两位小数的金额，范围为 `0.01` 至 `1,000,000.00`；不会进行隐式舍入。
- 描述在写入前去除首尾空白，长度必须为 1 至 500 个字符。
- 日期必须是有效的 `YYYY-MM-DD`，且不得晚于设备本地当天。
- 删除更新 `deleted_at`；读取、更新和汇总均排除已删除记录。列表按 `date` 与 `sequence` 降序排列。
- `snapshot()` 在同一 SQLite 事务中取得可见条目并由该列表计算汇总，因此列表、收入、支出、结余和数量对应同一视图。
