# Bookkeeping

Bookkeeping 是一款 Local-First 个人记账应用。账目条目首先写入设备本地存储，核心记账流程不依赖服务端在线。

## 当前能力

- 新增、查看、编辑和软删除收入/支出账目条目
- 按日期排列账目条目并计算收入、支出和结余汇总
- iOS/Android 使用 SQLite；Web 提供辅助 IndexedDB 适配器，其已知语义差异记录在[工程不变量](docs/engineering/invariants.md)
- Jest 覆盖领域逻辑、数据访问和集成流程
- Maestro 覆盖原生端关键用户流程
- Go 服务提供健康检查和启动元数据接口；它不参与当前本地记账流程

iOS 和 Android 是主要产品平台；Web 是辅助运行目标，不能替代原生端验收。

## 快速开始

需要 Node.js 22、npm 10 和 Go 1.22。

```bash
make setup
make run-app
```

也可以直接启动应用：

```bash
cd src/app
npm install
npm start
```

Expo 启动后可选择 iOS、Android 或 Web 运行目标。Go 服务不是本地记账流程的前置条件；如需验证服务接口：

```bash
make run-server
```

## 验证

```bash
make lint
make test
bash scripts/check-docs.sh
```

原生端 E2E 测试需要 Maestro 和模拟器或真机，详见 [E2E 测试说明](tests/e2e/README.md)。

## 文档

- [文档导航](docs/README.md)
- [领域词汇](CONTEXT.md)
- [开发环境](docs/engineering/setup.md)
- [代码地图](docs/engineering/code-map.md)
- [工程不变量](docs/engineering/invariants.md)
- [贡献指南](CONTRIBUTING.md)
- [变更记录](CHANGELOG.md)

尚未完成的决策和工作统一在 GitHub Issues 中管理，不在仓库内维护 Roadmap 或 Backlog。
