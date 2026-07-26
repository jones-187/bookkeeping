# 代码地图

## 仓库布局

```text
bookkeeping/
├── src/
│   └── app/                 # Expo + React Native 应用
│       ├── src/
│       │   └── ledger/      # 账本深模块及其界面
│       ├── __tests__/       # Jest 测试
│       └── test-support/    # 真实 SQLite 测试适配器
├── tests/
│   └── e2e/                 # Maestro 端到端流程
├── docs/
│   ├── adr/                 # 架构决策记录
│   ├── architecture/        # 架构文档
│   └── engineering/         # 工程协作说明
└── Makefile                 # 常用开发命令
```

## 应用端

应用入口是 `src/app/App.tsx`。它是组合根：创建原生 Ledger，处理初始化状态，并将 Ledger 交给 `LedgerApp`。账目功能位于 `src/app/src/ledger/`。

| 位置 | 职责 |
| --- | --- |
| `ledger/contract.ts` | `Ledger` 的公开契约、输入输出类型及领域错误。 |
| `ledger/native.ts` | 原生组合：打开 SQLite、配置连接并创建 Ledger。 |
| `ledger/internal/` | Ledger 私有的 SQLite 接口、迁移、校验、查询和汇总实现。 |
| `ledger/ui/` | 账目列表、添加、编辑、汇总和共用表单。 |
| `ledger/localDate.ts` | 设备本地日期格式化。 |

数据路径为：`App.tsx`（组合根）→ `LedgerApp` 与页面 → `Ledger` 公开契约 → Ledger 内部 SQLite 实现。界面不依赖数据库、迁移或 SQL。

Maestro 使用原生开发构建的 `clearState` 建立每个流程的干净应用状态。

## 测试位置

应用的 Jest 测试放在 `src/app/__tests__/`，覆盖 App 初始化、完整 Ledger 契约、真实 SQLite 迁移与查询，以及 Ledger UI 行为。Maestro 流程放在 `tests/e2e/flows/`。测试命令见 [testing.md](testing.md)。
