# Bookkeeping App

个人记账应用 - React Native + Expo

## 项目结构

采用 Feature-Slice 架构模式组织代码：

```
src/
├── features/                      # 功能模块
│   └── ledger/                    # 账目功能
│       ├── components/            # 组件
│       ├── screens/               # 页面
│       ├── hooks/                 # 业务 hooks
│       ├── stores/                # Zustand store
│       ├── services/              # 业务逻辑
│       ├── repositories/          # 数据访问
│       ├── types/                 # 类型定义
│       └── index.ts               # 公开 API
│
├── shared/                        # 共享资源
│   ├── db/                        # 数据库抽象层
│   └── types/                     # 通用类型
│
├── navigation/                    # 路由配置
│   ├── AppNavigator.tsx           # 根导航
│   ├── features/                  # Feature 路由
│   ├── routes.ts                  # 路由常量
│   └── types.ts                   # 路由类型
│
└── App.tsx                        # 应用入口
```

## 技术栈

- **框架**: React Native + Expo
- **语言**: TypeScript
- **路由**: React Navigation v7
- **状态管理**: Zustand
- **数据库**: SQLite (原生) / IndexedDB (Web)

## 开发指南

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm start
```

### 运行测试

```bash
# 单元测试
npm test

# E2E 测试
npm run test:e2e
```

### 构建生产版本

```bash
# Android
npx expo build:android

# iOS
npx expo build:ios

# Web
npx expo build:web
```

## 架构原则

1. **Feature 自包含**: 每个功能模块包含该功能的所有代码
2. **单向依赖**: features 依赖 shared，features 之间不相互依赖
3. **公开 API**: 每个 feature 通过 `index.ts` 导出公开接口
4. **状态隔离**: 每个 feature 有独立的 Zustand store

## 功能模块

### Ledger (账目)

账目流水管理，支持：
- 添加收入/支出记录
- 编辑已有记录
- 删除记录
- 按日期/类型筛选
- 收支统计

## 相关文档

- [ADR-001: Local-First 架构](../../docs/adr/ADR-001-local-first-architecture.md)
- [ADR-002: 技术栈选型](../../docs/adr/ADR-002-tech-stack-selection.md)
- [ADR-003: SQLite 库选型](../../docs/adr/ADR-003-sqlite-library.md)
- [ADR-004: Feature-Slice 架构](../../docs/adr/ADR-004-feature-slice-architecture.md)
- [数据模型设计](../../docs/designs/data-model.md)
