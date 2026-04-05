# 贡献指南

最后更新：2026-04-05

本仓库包含一个 Local-First 记账应用，阶段 1（本地账目流水记录）已完成。

## 开发环境

### 所需工具

- Node.js 22.x
- npm 10.x+
- Go 1.22.2+（可选，用于服务端）
- 可选：`make`

### 引导

```bash
# 安装应用依赖
cd src/app
npm install

# 安装服务端依赖（可选）
cd ../server
go mod download
```

如果有 `make` 可用：

```bash
make setup
```

## 分支管理

使用从 `main` 分出的专注分支。保持每个分支仅限于一个逻辑关注点。

建议命名：

- `feature/<topic>`
- `fix/<topic>`
- `docs/<topic>`

## 提交指南

在实际可行的情况下使用常规前缀：

- `feat:` 功能工作
- `fix:` 错误修复
- `docs:` 文档变更
- `refactor:` 结构变更，无预期行为变更
- `test:` 仅测试更新
- `chore:` 工具或构建变更

## 测试

### 应用测试

```bash
cd src/app

# 单元测试和集成测试
npm test

# E2E 测试（需要模拟器）
npm run test:e2e

# Lint
npm run lint
```

### 服务端测试

```bash
cd src/server
go test ./...
go build ./cmd/server
```

## 当前已实现范围

### 账目管理

- 添加收入/支出记录
- 编辑账目
- 删除账目（软删除）
- 账目列表（按日期排序）
- 收支汇总

### 数据存储

- 本地 SQLite 存储
- 货币金额整数存储（分）
- 数据验证和错误处理

## 编码约束

### Go

- 保持处理器和配置简单
- 仅使用整数/小数安全表示货币逻辑

### TypeScript / React Native

- 业务逻辑放在 Service 层，与 UI 解耦
- 货币值必须使用整数（分），禁止浮点数
- 使用 `testID` 属性支持 E2E 测试

### 数据层

- 所有金额使用整数存储（分为单位）
- 使用软删除（`deleted_at` 字段）
- 使用 UUID 主键（为未来同步准备）

## 文档规则

当你变更行为或设置时，在同一变更集中更新所有相关文档。至少审查：

- `README.md`
- `docs/dev-setup.md`
- `docs/code-map.md`
- `docs/designs/project-overview.md`
- `docs/api/README.md`
- `BACKLOG.md`
- `ROADMAP.md`

## 拉取请求检查清单

- [ ] 行为正确
- [ ] 已添加或更新相关测试
- [ ] 已运行 lint 和测试命令，或解释了失败原因
- [ ] 已更新相关文档
- [ ] 未引入基于浮点数的货币逻辑
- [ ] 新 UI 组件已添加 testID 属性
