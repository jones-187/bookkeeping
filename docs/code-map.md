# 代码地图

最后更新：2026-04-05

## 仓库布局

```
bookkeeping/
├── docs/                      # 文档
│   ├── adr/                   # 架构决策记录
│   ├── designs/               # 设计文档
│   └── architecture/          # 架构文档
├── src/
│   ├── app/                   # Expo + React Native 应用
│   │   ├── src/
│   │   │   ├── components/    # UI 组件
│   │   │   ├── screens/       # 页面组件
│   │   │   ├── services/      # 业务逻辑层
│   │   │   ├── repositories/  # 数据访问层
│   │   │   ├── db/            # 数据库配置和迁移
│   │   │   ├── hooks/         # React Hooks
│   │   │   ├── utils/         # 工具函数
│   │   │   ├── types/         # TypeScript 类型定义
│   │   │   └── navigation/    # 路由配置
│   │   └── __tests__/         # 测试文件
│   └── server/                # Go API 服务端（可选）
├── tests/
│   └── e2e/                   # E2E 测试（Maestro）
├── scripts/                   # 辅助脚本
├── BACKLOG.md                 # 任务待办列表
├── ROADMAP.md                 # 产品路线图
└── Makefile                   # 便捷命令
```

## 应用核心模块 (`src/app/src`)

### 数据层

| 文件 | 职责 |
|------|------|
| `db/index.ts` | 数据库初始化和迁移 |
| `db/types.ts` | 数据库行类型定义 |
| `repositories/LedgerEntryRepository.ts` | 账目流水数据访问 |

### 业务层

| 文件 | 职责 |
|------|------|
| `services/LedgerEntryService.ts` | 账目流水业务逻辑 |
| `utils/Money.ts` | 货币计算工具（整数存储） |
| `errors/index.ts` | 自定义错误类型 |

### UI 层

| 文件 | 职责 |
|------|------|
| `screens/LedgerListScreen.tsx` | 账目列表页面 |
| `screens/AddEntryScreen.tsx` | 添加账目页面 |
| `screens/EditEntryScreen.tsx` | 编辑账目页面 |
| `components/EntryForm.tsx` | 账目表单组件 |
| `hooks/useEntries.ts` | 账目数据 Hook |

### 导航

| 文件 | 职责 |
|------|------|
| `navigation/AppNavigator.tsx` | 路由配置 |
| `types/navigation.ts` | 导航类型定义 |

## 服务端模块 (`src/server`)

| 文件 | 职责 |
|------|------|
| `cmd/server/main.go` | 可执行入口点 |
| `internal/app/config.go` | 配置管理 |
| `internal/http/router.go` | 路由配置 |
| `internal/http/handler/bootstrap.go` | Bootstrap 处理器 |

## 测试结构 (`src/app/__tests__`)

| 目录 | 内容 |
|------|------|
| `unit/` | 单元测试（已废弃，测试文件移至源文件旁） |
| `integration/` | 集成测试 |
| `db.test.ts` | 数据库测试 |
| `App.test.tsx` | 应用入口测试 |
| `api.test.ts` | API 测试 |

## 数据流

```
UI (screens/components)
       ↓
   Hooks (useEntries)
       ↓
   Services (LedgerEntryService)
       ↓
   Repositories (LedgerEntryRepository)
       ↓
   SQLite (expo-sqlite)
```

## 公共接口

### 服务端 API

- `GET /healthz` - 健康检查
- `GET /api/v1/bootstrap` - 启动元数据

### 应用服务

```typescript
// 创建账目
await ledgerEntryService.create({
  amount: 100,      // 元
  type: 'expense',
  description: '午餐',
  date: '2026-04-05'
});

// 获取列表
const entries = await ledgerEntryService.getList();

// 获取汇总
const summary = await ledgerEntryService.getSummary();
// { totalIncome, totalExpense, balance, count }
```

## 近期构建顺序

1. ✅ 本地账目流水记录
2. 🔄 账户和类别管理
3. ⏳ 本地报表和可视化
4. ⏳ 云端数据同步

## 变更规划规则

对于非平凡的变更，请继续列出：

- 要编辑的路径
- 要保持的不变量
- 要添加或更新的测试
