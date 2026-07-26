# 测试

## 分层

| 层级 | 位置 | 工具与关注点 |
| --- | --- | --- |
| Ledger 契约与 SQLite 测试 | `src/app/__tests__/ledger/` | Jest + Node 内置 `node:sqlite`；真实 SQLite 迁移、约束、查询、软删除与一致快照 |
| App 与界面测试 | `src/app/__tests__/` | Jest + React Native Testing Library；App 初始化与完整 `Ledger` 替身驱动的界面行为 |
| 移动端端到端测试 | `tests/e2e/flows/` | Maestro；添加、编辑、删除与边界输入流程 |

## 通用命令

从仓库根目录：

```bash
make test
make lint
make build
```

也可按组件分别运行：

```bash
cd src/app && npm test -- --runInBand
cd src/app && npm run lint
cd src/app && npm run typecheck
cd src/app && npm run build
```

`node:sqlite` 测试执行的是真实 SQLite SQL、迁移和查询，不使用 Expo SQLite mock。它验证 Ledger 的内部持久化契约；原生运行时仍由 `expo-sqlite` 提供连接。

界面测试只替换完整 `Ledger` 公开契约，不替换 Ledger 内部数据库、迁移或领域逻辑。

## 端到端测试

应用的 `test:e2e` 和 `test:e2e:ci` 脚本调用 Maestro，测试入口为 `tests/e2e/flows/test-suite.yaml`。端到端测试需要运行中的原生开发构建和模拟器；请遵循 [tests/e2e/README.md](../../tests/e2e/README.md) 中的环境准备、重置和单流程执行说明。

当前 GitHub Actions 的 `lint-and-test` job 使用 Node.js 22.13，运行文档检查、应用类型检查、lint、Jest 测试，并导出 Android 和 iOS bundle。Maestro 需要原生设备环境，不在当前 GitHub Actions 工作流中运行。
