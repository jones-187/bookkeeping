# 数据模型设计

最后更新：2026-03-31

## 概述

本文档定义 Bookkeeping 应用的本地数据库模型。所有数据存储在客户端 SQLite 数据库中，遵循 Local-First 架构原则。

## 核心约束

1. **货币金额使用整数存储**：以分（cent）为单位，避免浮点数精度问题
2. **时间戳使用 ISO 8601 格式**：便于跨平台兼容
3. **软删除策略**：保留 `deleted_at` 字段，支持数据恢复和同步
4. **UUID 主键**：为未来多设备同步做准备

---

## 阶段 1：账目流水表

### ledger_entries

账目流水记录表，存储所有收入和支出记录。

#### 表结构

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| id | TEXT | PRIMARY KEY | UUID，客户端生成 |
| amount | INTEGER | NOT NULL | 金额（分为单位），必须 > 0 |
| type | TEXT | NOT NULL | 类型：'income' 或 'expense' |
| description | TEXT | NOT NULL | 描述，最大 500 字符 |
| date | TEXT | NOT NULL | 交易日期，ISO 8601 格式 (YYYY-MM-DD) |
| created_at | TEXT | NOT NULL | 创建时间，ISO 8601 格式 |
| updated_at | TEXT | NOT NULL | 更新时间，ISO 8601 格式 |
| deleted_at | TEXT | NULL | 删除时间，NULL 表示未删除 |

#### 索引

```sql
-- 按日期查询（最常用）
CREATE INDEX idx_ledger_entries_date ON ledger_entries(date DESC);

-- 按类型筛选
CREATE INDEX idx_ledger_entries_type ON ledger_entries(type);

-- 软删除过滤
CREATE INDEX idx_ledger_entries_deleted_at ON ledger_entries(deleted_at);

-- 复合索引：日期范围 + 未删除
CREATE INDEX idx_ledger_entries_date_active
ON ledger_entries(date DESC, deleted_at)
WHERE deleted_at IS NULL;
```

#### 建表 SQL

```sql
CREATE TABLE IF NOT EXISTS ledger_entries (
  id TEXT PRIMARY KEY,
  amount INTEGER NOT NULL CHECK(amount > 0),
  type TEXT NOT NULL CHECK(type IN ('income', 'expense')),
  description TEXT NOT NULL CHECK(length(description) <= 500),
  date TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  deleted_at TEXT
);
```

#### 示例数据

```sql
-- 收入记录
INSERT INTO ledger_entries VALUES (
  '550e8400-e29b-41d4-a716-446655440000',
  500000,  -- 5000.00 元
  'income',
  '工资收入',
  '2026-03-31',
  '2026-03-31T13:47:21.568Z',
  '2026-03-31T13:47:21.568Z',
  NULL
);

-- 支出记录
INSERT INTO ledger_entries VALUES (
  '550e8400-e29b-41d4-a716-446655440001',
  3500,  -- 35.00 元
  'expense',
  '午餐',
  '2026-03-31',
  '2026-03-31T14:20:00.000Z',
  '2026-03-31T14:20:00.000Z',
  NULL
);
```

---

## 数据类型映射

### 金额处理

**存储格式**：INTEGER（分）
**显示格式**：DECIMAL(10, 2)（元）

```typescript
// 转换示例
class Money {
  // 元 -> 分
  static fromYuan(yuan: number): number {
    return Math.round(yuan * 100);
  }

  // 分 -> 元
  static toYuan(cents: number): number {
    return cents / 100;
  }
}

// 使用示例
const amount = Money.fromYuan(35.50);  // 3550
const display = Money.toYuan(3550);     // 35.50
```

### 日期处理

**存储格式**：TEXT (ISO 8601)
- 日期：`YYYY-MM-DD` (例: `2026-03-31`)
- 时间戳：`YYYY-MM-DDTHH:mm:ss.sssZ` (例: `2026-03-31T13:47:21.568Z`)

```typescript
// 转换示例
const date = new Date().toISOString().split('T')[0];  // "2026-03-31"
const timestamp = new Date().toISOString();            // "2026-03-31T13:47:21.568Z"
```

---

## 阶段 2：账户和类别表（预览）

### accounts

账户表，存储现金、银行卡、信用卡等账户信息。

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| id | TEXT | PRIMARY KEY | UUID |
| name | TEXT | NOT NULL | 账户名称 |
| type | TEXT | NOT NULL | 类型：'cash', 'bank', 'credit' |
| balance | INTEGER | NOT NULL | 余额（分） |
| currency | TEXT | NOT NULL | 币种，默认 'CNY' |
| created_at | TEXT | NOT NULL | 创建时间 |
| updated_at | TEXT | NOT NULL | 更新时间 |
| deleted_at | TEXT | NULL | 删除时间 |

### categories

类别表，存储收支类别信息。

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| id | TEXT | PRIMARY KEY | UUID |
| name | TEXT | NOT NULL | 类别名称 |
| type | TEXT | NOT NULL | 类型：'income', 'expense' |
| icon | TEXT | NULL | 图标名称 |
| color | TEXT | NULL | 颜色代码 |
| parent_id | TEXT | NULL | 父类别 ID（支持二级分类） |
| created_at | TEXT | NOT NULL | 创建时间 |
| updated_at | TEXT | NOT NULL | 更新时间 |
| deleted_at | TEXT | NULL | 删除时间 |

### ledger_entries 扩展字段

阶段 2 将为 `ledger_entries` 添加以下字段：

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| account_id | TEXT | FOREIGN KEY | 关联账户 |
| category_id | TEXT | FOREIGN KEY | 关联类别 |

---

## 数据完整性规则

### 业务规则

1. **金额必须大于 0**：`CHECK(amount > 0)`
2. **类型必须是 income 或 expense**：`CHECK(type IN ('income', 'expense'))`
3. **描述不能为空且不超过 500 字符**：`CHECK(length(description) <= 500)`
4. **日期不能是未来日期**：应用层验证
5. **软删除记录不参与统计**：查询时过滤 `deleted_at IS NULL`

### 并发控制

使用 `updated_at` 字段实现乐观锁：

```typescript
// 更新时检查版本
UPDATE ledger_entries
SET amount = ?, updated_at = ?
WHERE id = ? AND updated_at = ?
```

---

## 迁移策略

### 版本 1：初始化

```sql
-- migrations/001_create_ledger_entries.sql
CREATE TABLE IF NOT EXISTS ledger_entries (
  id TEXT PRIMARY KEY,
  amount INTEGER NOT NULL CHECK(amount > 0),
  type TEXT NOT NULL CHECK(type IN ('income', 'expense')),
  description TEXT NOT NULL CHECK(length(description) <= 500),
  date TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  deleted_at TEXT
);

CREATE INDEX idx_ledger_entries_date ON ledger_entries(date DESC);
CREATE INDEX idx_ledger_entries_type ON ledger_entries(type);
CREATE INDEX idx_ledger_entries_deleted_at ON ledger_entries(deleted_at);
CREATE INDEX idx_ledger_entries_date_active
ON ledger_entries(date DESC, deleted_at)
WHERE deleted_at IS NULL;
```

### 版本管理

使用 `schema_version` 表跟踪迁移版本：

```sql
CREATE TABLE IF NOT EXISTS schema_version (
  version INTEGER PRIMARY KEY,
  applied_at TEXT NOT NULL
);
```

---

## 性能考虑

### 查询优化

1. **分页查询**：使用 `LIMIT` 和 `OFFSET`
2. **日期范围查询**：利用 `idx_ledger_entries_date` 索引
3. **避免全表扫描**：始终使用 `WHERE deleted_at IS NULL`

### 存储估算

假设平均每天记录 10 条账目：

- 每条记录约 200 字节
- 每月：10 × 30 × 200 = 60 KB
- 每年：60 KB × 12 = 720 KB
- 10 年：7.2 MB

SQLite 性能在 100MB 以下数据量时表现优异，完全满足需求。

---

## 安全考虑

1. **SQL 注入防护**：使用参数化查询
2. **数据加密**：未来可考虑使用 SQLCipher
3. **备份策略**：定期导出数据到云端

---

## 相关文档

- [ADR-001: Local-First 架构](../adr/ADR-001-local-first-architecture.md)
- [风险区域](../risk-areas.md)
- [BACKLOG.md](../../BACKLOG.md)
