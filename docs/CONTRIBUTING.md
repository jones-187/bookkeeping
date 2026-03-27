# 贡献指南

最后更新：2026-03-27

本仓库目前包含一个最小化的可运行脚手架。贡献的变更应保持该脚手架稳定，同时为后续的记账功能做准备。

## 开发环境

### 所需工具

- Node.js 22.x
- npm 10.x+
- Go 1.22.2+
- 可选：`make`

### 引导

```powershell
cd E:\User_File\project\Project\bookkeeping\src\app
npm install

cd E:\User_File\project\Project\bookkeeping\src\server
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

## 当前测试规则

### 应用

```powershell
cd E:\User_File\project\Project\bookkeeping\src\app
npm run lint
npm test -- --runInBand
```

### 服务端

```powershell
cd E:\User_File\project\Project\bookkeeping\src\server
$env:GOCACHE='E:\User_File\project\Project\bookkeeping\.cache\go-build'
go test ./...
go build ./cmd/server
```

## 当前已实现范围

仓库目前仅保证此端到端行为：

- Expo 应用启动
- Go API 启动
- 应用获取 `GET /api/v1/bootstrap`
- 应用渲染该请求的成功和失败状态

## 编码约束

### Go

- 保持处理器和配置简单
- 在这些模块存在之前，避免引入数据库或迁移假设
- 稍后引入货币逻辑时，仅使用整数/小数安全表示

### TypeScript / React Native

- 保持当前脚手架单一用途且易于测试
- 在存在真正的产品压力之前，避免不必要的状态库或导航
- 稍后引入的任何货币值必须避免浮点数

## 文档规则

当你变更行为或设置时，在同一变更集中更新所有相关文档。至少审查：

- `README.md`
- `docs/dev-setup.md`
- `docs/code-map.md`
- `docs/designs/project-overview.md`
- `docs/api/README.md`
- `agents.md`

## 拉取请求检查清单

- [ ] 行为正确
- [ ] 已添加或更新相关测试
- [ ] 已运行 lint 和测试命令，或解释了失败原因
- [ ] 已更新相关文档
- [ ] 未引入基于浮点数的货币逻辑
