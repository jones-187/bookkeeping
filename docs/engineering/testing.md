# 测试

## 分层

| 层级 | 位置 | 工具与关注点 |
| --- | --- | --- |
| 应用单元与组件测试 | `src/app/__tests__/` | Jest；金额工具、服务、仓储、数据库、应用和组件行为 |
| 应用集成流程测试 | `src/app/__tests__/integration/` | Jest；账目条目流程与 `useEntries` 行为 |
| 服务端 HTTP 测试 | `src/server/internal/http/router_test.go` | Go `httptest`；路由和响应契约 |
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
cd src/server && go test ./...
cd src/server && go build -o bin/server.exe ./cmd/server
```

## 端到端测试

应用的 `test:e2e` 和 `test:e2e:ci` 脚本调用 Maestro，测试入口为 `tests/e2e/flows/test-suite.yaml`。端到端测试需要运行中的应用和模拟器；请遵循 [tests/e2e/README.md](../../tests/e2e/README.md) 中的环境准备、重置和单流程执行说明。

当前 GitHub Actions 的 `lint-and-test` job 运行文档检查、应用 lint、Go 测试和应用 Jest 测试，`build` job 构建服务端。Maestro 需要设备环境，不在当前 GitHub Actions 工作流中运行。
