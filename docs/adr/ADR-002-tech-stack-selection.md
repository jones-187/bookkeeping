# ADR-002: 技术栈选型

## 状态

已采纳

## 上下文

作为独立开发者，技术栈选型需要考虑：

1. **开发效率**：一个人需要快速迭代
2. **跨平台需求**：需要支持 iOS 和 Android
3. **性能要求**：金融应用需要极致性能
4. **维护成本**：长期维护的可持续性
5. **生态成熟度**：社区支持和第三方库

## 决策

### 前端：React Native

| 方案 | 优点 | 缺点 |
|------|------|------|
| React Native | JavaScript 生态、热更新、社区活跃 | 性能略逊原生 |
| Flutter | 性能好、UI 一致 | Dart 生态小、学习成本 |
| 原生开发 | 性能最佳 | 双倍开发成本 |

**选择 React Native 的理由**：
- JavaScript/TypeScript 生态成熟
- 热更新支持快速迭代
- 后端开发者更容易上手
- 社区活跃，问题易解决

### 本地存储：SQLite + WatermelonDB

| 方案 | 优点 | 缺点 |
|------|------|------|
| SQLite | 成熟稳定、性能好 | 需要手写 SQL |
| WatermelonDB | ORM 支持、同步友好 | 学习成本 |
| Realm | 简单易用 | 性能一般、闭源 |

**选择 SQLite + WatermelonDB 的理由**：
- SQLite 是移动端最成熟的数据库
- WatermelonDB 提供同步友好的 ORM
- 支持复杂的查询和索引

### 后端：Go

| 方案 | 优点 | 缺点 |
|------|------|------|
| Go | 高性能、部署简单、并发强 | 生态不如 Node.js |
| Node.js | 前端友好、生态丰富 | 性能一般 |
| Python | 开发快、生态好 | 性能差 |

**选择 Go 的理由**：
- 极致性能，适合金融场景
- 单二进制部署，运维简单
- 强类型，减少运行时错误
- 并发模型简单高效

### 云端数据库：PostgreSQL

| 方案 | 优点 | 缺点 |
|------|------|------|
| PostgreSQL | 金融级可靠性、JSON 支持 | 运维成本 |
| MySQL | 流行、生态好 | JSON 支持弱 |
| MongoDB | 灵活、易扩展 | 无事务、不适合金融 |

**选择 PostgreSQL 的理由**：
- ACID 事务保证数据一致性
- JSONB 支持灵活的数据结构
- 金融行业首选数据库

### API 文档：OpenAPI/Swagger

- 标准化接口定义
- 自动生成客户端 SDK
- 在线文档测试

## 后果

### 正面影响

- **开发效率**：React Native 支持快速迭代
- **性能保障**：Go + SQLite 保证极致性能
- **数据可靠**：PostgreSQL 金融级可靠性
- **维护简单**：成熟技术栈，问题易解决

### 负面影响

- **学习成本**：需要学习 React Native 和 Go
- **跨语言开发**：前后端语言不同
- **包管理**：npm + Go modules 双套管理

## 技术栈总览

```
┌─────────────────────────────────────────────┐
│                   前端                       │
│  React Native + TypeScript + WatermelonDB   │
└─────────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────┐
│                   后端                       │
│         Go + Gin + shopspring/decimal       │
└─────────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────┐
│                  数据库                      │
│              PostgreSQL + Redis             │
└─────────────────────────────────────────────┘
```

## 参考

- [React Native Performance](https://reactnative.dev/docs/performance)
- [Go for Backend Development](https://go.dev/doc/)
- [PostgreSQL for Financial Applications](https://www.postgresql.org/about/)
