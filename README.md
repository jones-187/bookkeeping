# Bookkeeping

Bookkeeping 是一款 Local-First 个人记账应用。账目条目首先写入设备本地存储，核心记账流程不依赖网络或远程服务。

## 当前能力

- 新增、查看、编辑和软删除收入/支出账目条目
- 按日期排列账目条目，并从同一快照计算收入、支出和结余
- iOS/Android 使用本地 SQLite 持久化；金额以整数分保存和运算
- Jest 覆盖 Ledger 契约、SQLite 迁移与界面行为
- Maestro 覆盖原生端关键用户流程

iOS 和 Android 是当前且仅有的产品平台。

## 快速开始

需要 Node.js 22.13 或更高版本和 npm。

```bash
make setup
make run-android  # 或 make run-ios
```

首次运行或原生配置变化后的完整命令和原生工程归属见[开发环境](docs/engineering/setup.md)和
[Expo CNG 原生工程归属](docs/adr/0008-expo-cng-native-project-ownership.md)。

也可以直接运行对应平台命令：

```bash
cd src/app
npm run android
# 或
npm run ios
```

如果已经安装 development build，只需运行 `npx expo start --dev-client` 启动 Metro。

## 验证

```bash
make lint
make test
make build
bash scripts/check-docs.sh
```

原生端 E2E 测试需要 Maestro、dedicated development build 和模拟器或真机，详见 [E2E 测试说明](tests/e2e/README.md)。

## 文档

- [文档导航](docs/README.md)
- [领域词汇](CONTEXT.md)
- [开发环境](docs/engineering/setup.md)
- [代码地图](docs/engineering/code-map.md)
- [工程不变量](docs/engineering/invariants.md)
- [贡献指南](CONTRIBUTING.md)
- [变更记录](CHANGELOG.md)

尚未完成的决策和工作统一在 GitHub Issues 中管理，不在仓库内维护 Roadmap 或 Backlog。
