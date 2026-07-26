# 客户端本地持久化方案

## 状态

Accepted

## 背景

应用需要在 Expo 管理工作流中保存结构化账目条目数据，并在 iOS、Android 和辅助 Web 运行目标之间保持一致的数据访问接口。

原生端需要可靠的事务型持久化；Web 环境无法直接使用相同的原生 SQLite 实现。引入同步型 ORM 会增加当前账目模型不需要的抽象和运行时复杂度。

## 决策

- iOS 和 Android 使用 `expo-sqlite`
- Web 使用 IndexedDB
- feature 代码依赖项目自有的异步 `Database` 接口，而不是直接依赖平台 API
- schema 变化由原生端显式版本迁移管理
- 精确 schema 以迁移代码和数据库适配器为准

## 后果

- Expo 管理工作流无需 eject 即可使用原生 SQLite
- ledger repository 可以在不同平台复用
- Web 适配器需要维护 SQL 行为到 IndexedDB 操作的映射
- 当前抽象只覆盖项目实际使用的数据库能力，不保证任意 SQL 或完整跨平台等价
- 如果未来引入另一种存储或 ORM，应通过新 ADR 评估迁移成本和接口边界
