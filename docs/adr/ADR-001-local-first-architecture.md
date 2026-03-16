# ADR-001: Local-First 架构决策

## 状态

已采纳

## 上下文

作为一款个人记账应用，我们需要解决以下核心问题：

1. **隐私与信任**：用户对财务数据上云存在顾虑
2. **网络依赖**：传统云应用在网络不佳时无法使用
3. **性能体验**：每次操作都需要网络请求，体验不佳
4. **数据安全**：云端数据泄露风险

传统架构方案：
- **纯本地应用**：数据安全，但无法多设备同步
- **纯云端应用**：多设备同步，但依赖网络，隐私风险
- **混合架构**：复杂度高，同步逻辑难以维护

## 决策

采用 **Local-First 架构**，核心原则：

1. **本地优先**：所有数据优先存储在本地 SQLite 数据库
2. **云端备份**：可选的云端同步，作为备份和多设备同步手段
3. **离线可用**：核心功能完全离线可用
4. **增量同步**：基于版本号的增量同步机制

### 数据模型设计

```sql
CREATE TABLE transactions (
    id TEXT PRIMARY KEY,
    account_id TEXT NOT NULL,
    category_id TEXT NOT NULL,
    amount TEXT NOT NULL,        -- 字符串存储，保证精度
    type TEXT NOT NULL,          -- 'income' | 'expense'
    description TEXT,
    transaction_date TEXT NOT NULL,
    version INTEGER NOT NULL DEFAULT 1,  -- 同步版本号
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    deleted_at TEXT              -- 软删除
);
```

### 同步策略

1. **版本控制**：每条记录包含 `version` 字段
2. **增量同步**：只同步 `version > last_sync_version` 的记录
3. **冲突解决**：Last-Write-Wins (基于 `updated_at`)
4. **软删除**：使用 `deleted_at` 标记删除，防止同步丢失

## 后果

### 正面影响

- **离线可用**：无网络时完全可用
- **极速响应**：本地数据库操作，毫秒级响应
- **数据主权**：用户完全掌控自己的数据
- **降低成本**：减少云服务依赖，降低运营成本

### 负面影响

- **同步复杂度**：需要处理数据冲突、版本管理
- **开发难度**：比传统 CRUD 应用复杂
- **数据迁移**：需要设计数据迁移策略
- **测试成本**：同步逻辑测试场景多

## 风险缓解

| 风险 | 缓解措施 |
|------|----------|
| 同步冲突 | 基于版本的冲突检测 + 用户手动解决 |
| 数据丢失 | 本地定期备份 + 云端备份双重保障 |
| 存储空间 | 数据压缩 + 历史数据归档 |

## 参考

- [Local-First Software](https://www.inkandswitch.com/local-first/)
- [CRDTs: The Hard Parts](https://www.youtube.com/watch?v=PMVBu9Lqx0E)
