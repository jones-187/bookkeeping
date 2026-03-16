# Project Context: Local-First Finance App
- **Architecture**: Local-First (前端 SQLite 本地存储, 云端仅增量备份)。
- **Tech Stack**:
  - Frontend: React Native (Expo) + TypeScript + Zustand + Victory Charts
  - Backend: Go + Gin + GORM + PostgreSQL

# Critical Constraints (Must Follow)
1. **Financial Accuracy (Highest Priority)**: 
   - 严禁在任何货币计算中使用 `Float` 或 `Double`。
   - 前端：使用 String 或高精度库处理金额。
   - 后端：必须且仅能使用 `shopspring/decimal` 进行所有金额运算。
   - 任何涉及金额的计算必须配备边界测试（0值、负数、极大值、精度丢失测试）。

2. **Database & Sync**:
   - 所有数据库 Schema 变更需兼容离线同步逻辑（注意 `deleted_at`, `version` 字段）。
   - 数据操作必须是原子的，确保离线状态下 SQLite 的 ACID 特性。

3. **Development Guidelines**:
   - **TDD**: 对于账务流水、余额汇总等核心业务逻辑，"测试先行"。在编写实现前，先写测试用例。
   - **Error Handling**: 金融类错误（如金额不平）必须抛出明确错误，禁止吞掉异常。
   - **Sync Strategy**: 所有的增量同步逻辑必须经过并发测试验证。

4. **Code Quality**:
   - 命名遵循 Go 和 TS 的标准社区规范。
   - 拒绝过度设计，保持函数/模块的“单一职责原则”。