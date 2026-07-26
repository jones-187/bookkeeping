# 数据模型

## 存储抽象

账目仓储只依赖 [`Database` 接口](../../src/app/src/shared/db/interface.ts)。应用运行在 iOS 或 Android 时使用 [SQLite 适配器](../../src/app/src/shared/db/native-db.ts)；运行在 Web 时使用 [IndexedDB 适配器](../../src/app/src/shared/db/web-db.ts)。两者都以 `ledger_entries` 作为账目集合：SQLite 中是表，IndexedDB 中是以 `id` 为键路径的对象存储，索引为 `date`、`type` 和 `deleted_at`，定义见 [IndexedDB 升级逻辑](../../src/app/src/shared/db/web-db.ts)。

## ledger_entries

SQLite 的精确 schema 与索引定义位于 [原生迁移 v1](../../src/app/src/shared/db/native-db.ts)，而非复制于本文。数据库行的 TypeScript 类型见 [`LedgerEntryRow`](../../src/app/src/shared/db/types.ts)。

| 字段 | 存储形式 | 含义 |
| --- | --- | --- |
| `id` | 文本，主键 / 键路径 | 应用创建的 UUID。 |
| `amount` | 整数 | 金额，单位为分。 |
| `type` | `income` 或 `expense` | 收入或支出。 |
| `description` | 文本 | 条目描述。 |
| `date` | `YYYY-MM-DD` 文本 | 账目日期。 |
| `created_at` | ISO 8601 文本 | 创建时刻。 |
| `updated_at` | ISO 8601 文本 | 最近一次更新时刻。 |
| `deleted_at` | 可空 ISO 8601 文本 | 软删除时刻；`null` 表示有效记录。 |

`LedgerEntry` 将数据库使用的蛇形字段映射为驼峰字段，映射位于 [rowToEntity](../../src/app/src/features/ledger/repositories/LedgerEntryRepository.ts)。当前模型只有这一种持久化实体，条目之间没有外键或其他实体关系。

## 不变量与访问语义

- SQLite 迁移约束 `id` 唯一、`amount > 0`、`type` 只能是 `income` 或 `expense`，并限制 `description` 最多 500 个字符；精确定义见[迁移代码](../../src/app/src/shared/db/native-db.ts)。SQLite schema 本身没有检查描述非空，也没有使用 strict table 保证值一定以整数存储。
- 服务层接受以元为单位的金额，先验证其为有限正数且不超过 1,000,000 元，再舍入转换为分；实现见 [LedgerEntryService](../../src/app/src/features/ledger/services/LedgerEntryService.ts)。
- 日期必须符合 `YYYY-MM-DD`、能够被解析，且不得晚于本地当天。实现见 [日期校验](../../src/app/src/features/ledger/services/LedgerEntryService.ts)。
- repository 发出的查询要求删除时更新 `deleted_at`、普通读取排除已删除记录、列表按 `date` 和 `created_at` 降序，并支持类型与日期范围筛选；查询定义见 [LedgerEntryRepository](../../src/app/src/features/ledger/repositories/LedgerEntryRepository.ts)。

## 当前平台差异

上述 repository 语义在 SQLite 路径上由 SQL 执行。Web 的 IndexedDB 适配器只解析项目当前使用的一部分 SQL 形态，而且对象存储没有复制 SQLite 的 `CHECK` 约束，因此尚不能视为完全等价：

- 大于 0 但不足半分的元金额会在服务校验后舍入为 0；SQLite 拒绝写入，IndexedDB 当前可以保存
- 类型索引查询不会继续应用同一 `WHERE` 中的软删除或日期条件
- 日期范围条件没有在 Web 的 `matchesWhere` 中实现
- Web SQL 解析器没有实现 `COUNT(*)` 聚合，repository count 不能代表实际记录数
- Web update 解析 ID 条件，但不会独立执行 SQL 中的 `deleted_at IS NULL`

Web 是辅助运行目标。涉及筛选、删除可见性或金额边界的变更必须分别验证 SQLite 和 IndexedDB，不能仅凭共享 `Database` 接口假设语义一致。
