# 代码地图

## 仓库布局

```text
bookkeeping/
├── src/
│   ├── app/                 # Expo + React Native 应用
│   │   ├── src/
│   │   │   ├── features/    # 按业务功能组织的应用代码
│   │   │   ├── navigation/  # React Navigation 配置
│   │   │   └── shared/      # 数据库、金额、错误和共享组件
│   │   └── __tests__/       # Jest 测试
│   └── server/              # Gin HTTP 服务
├── tests/
│   └── e2e/                 # Maestro 端到端流程
├── docs/
│   ├── adr/                 # 架构决策记录
│   ├── api/                 # API 文档
│   ├── architecture/        # 架构文档
│   └── engineering/         # 工程协作说明
└── Makefile                 # 常用开发命令
```

## 应用端

应用入口是 `src/app/App.tsx`，它装配 React Native Paper 和 `AppNavigator`。导航定义在 `src/app/src/navigation/`，账目功能位于 `src/app/src/features/ledger/`。

| 位置 | 职责 |
| --- | --- |
| `features/ledger/screens/` | 账目列表、添加和编辑页面 |
| `features/ledger/components/EntryForm.tsx` | 添加和编辑共用的表单 |
| `features/ledger/stores/ledgerStore.ts` | Zustand 状态、列表和汇总刷新 |
| `features/ledger/hooks/useEntry.ts` | 按 ID 读取单个账目条目 |
| `features/ledger/services/LedgerEntryService.ts` | 输入校验、金额转换、汇总和领域错误 |
| `features/ledger/repositories/LedgerEntryRepository.ts` | 账目条目的持久化查询与软删除 |
| `shared/db/` | `Database` 接口及 SQLite、IndexedDB 实现 |
| `shared/utils/Money.ts` | 分单位金额的计算、转换和格式化 |
| `shared/constants/api.ts` | API 基地址解析 |

数据路径为：页面和表单 → Zustand store 或 `useEntry` → `LedgerEntryService` → `LedgerEntryRepository` → `Database`。原生平台使用 `expo-sqlite`，Web 平台使用 IndexedDB；两者都通过 `shared/db/interface.ts` 暴露数据库操作。

在开发构建中，`AppNavigator` 处理 `reset-test-data`、`reset-all-data` 与 `go-home` 深层链接，用于端到端测试重置数据和导航。

## 服务端

`src/server/cmd/server/main.go` 读取配置并启动 Gin 路由。服务端代码按下列边界组织：

| 位置 | 职责 |
| --- | --- |
| `internal/app/config.go` | 读取端口、服务名、版本和功能标记 |
| `internal/http/router.go` | 创建带日志、恢复和 CORS 中间件的路由器 |
| `internal/http/handler/bootstrap.go` | 注册并实现 HTTP 处理器 |
| `internal/http/router_test.go` | 健康检查和 bootstrap 端点测试 |

已注册的端点为 `GET /healthz` 与 `GET /api/v1/bootstrap`。

## 测试位置

应用的 Jest 测试放在 `src/app/__tests__/`，覆盖应用入口、数据库、金额工具、账目服务、仓储和集成流程。Go 测试与路由代码相邻。Maestro 流程放在 `tests/e2e/flows/`，共享步骤位于 `tests/e2e/flows/_shared/`。测试命令见 [testing.md](testing.md)。
