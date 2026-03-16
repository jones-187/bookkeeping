# 开发规范 (Contributing Guide)

本文档定义了项目的开发规范和工作流程。

## 开发环境

### 环境要求

- Node.js v20+
- Go 1.22+
- Docker & Docker Compose
- React Native 开发环境

### 一键配置

```bash
make setup
```

## 分支策略

采用 **Trunk-Based Development**：

| 分支 | 说明 |
|------|------|
| `main` | 永远是可发布的稳定状态 |
| `feature/xxx` | 开发新功能 |
| `fix/xxx` | Bug 修复 |

### 工作流

1. 从 `main` 创建 `feature/xxx` 分支
2. 开发完成后提交 PR
3. **自己 Review 代码**（复盘习惯）
4. 合并到 `main`

## 提交规范

```
feat: 添加新功能
fix: 修复 Bug
docs: 文档更新
refactor: 代码重构
test: 测试相关
chore: 构建/工具相关
```

**示例**：
```
feat: 添加账户管理模块
fix: 修复金额计算精度问题
docs: 更新 API 文档
```

## 测试规范

### 测试金字塔

| 层级 | 覆盖率要求 | 重点 |
|------|-----------|------|
| 单元测试 | 核心逻辑 100% | 金额计算、同步逻辑 |
| 集成测试 | 80%+ | API 接口、数据库操作 |
| E2E 测试 | 关键路径 | 用户核心流程 |

### 金融专项测试

**必须覆盖的边界场景**：
- 金额为 0
- 金额为负数
- 金额极大值 (Overflow)
- 精度丢失测试

### 运行测试

```bash
make test           # 运行所有测试
make test-unit      # 仅运行单元测试
make test-coverage  # 生成覆盖率报告
```

## 代码规范

### Go (后端)

- 使用 `golangci-lint` 检查
- 金额计算必须使用 `shopspring/decimal`
- 错误处理禁止吞掉异常

```bash
make lint-server
```

### TypeScript (前端)

- 使用 ESLint + Prettier
- 金额使用 String 存储，禁止 Float
- 使用 Zustand 管理状态

```bash
make lint-app
```

## 数据库迁移

### 迁移策略

1. 所有 Schema 变更必须编写迁移脚本
2. 迁移脚本放在 `src/server/migrations/`
3. 兼容离线同步逻辑（`deleted_at`, `version` 字段）

### 运行迁移

```bash
make migrate        # 执行迁移
make migrate-rollback # 回滚上一次迁移
```

## 架构决策记录 (ADR)

### 何时记录

- 技术选型变更
- 架构调整
- 引入新依赖
- 重大重构

### 如何记录

1. 复制 `docs/adr/README.md` 中的模板
2. 命名为 `ADR-XXX-简短标题.md`
3. 填写上下文、决策、后果

## PR 检查清单

- [ ] 代码通过 Lint 检查
- [ ] 单元测试通过
- [ ] 新功能有对应测试
- [ ] 文档已更新（如有必要）
- [ ] PR 描述关联 Issue (`Fixes #xxx`)
