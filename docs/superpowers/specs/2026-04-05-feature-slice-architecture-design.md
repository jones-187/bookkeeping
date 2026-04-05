# Feature-Slice 架构设计

## Context

记账应用已完成第一个功能（账目 CRUD），现在需要提前布局架构，为后续多页面管理做准备。用户选择了 Feature-Slice 设计模式，按功能域组织代码，每个 feature 自包含，扩展性强。

## 目标

1. 重构现有代码为 Feature-Slice 架构
2. 引入 Zustand 作为全局状态管理
3. 规范化目录结构和模块边界
4. 为后续功能模块（统计报表、分类管理、账户管理、预算管理）奠定基础

## 架构概览

### 核心原则

- **Feature 自包含**: 每个功能模块包含该功能的所有层级代码
- **单向依赖**: features 依赖 shared，features 之间不相互依赖
- **公开 API**: 每个 feature 通过 `index.ts` 导出公开接口
- **状态隔离**: 每个 feature 有独立的 Zustand store

### 目录结构

```
src/app/src/
├── features/                      # 功能模块 (核心)
│   ├── ledger/                    # 账目功能
│   │   ├── components/            # 账目相关组件
│   │   ├── screens/               # 页面
│   │   ├── hooks/                 # 业务 hooks
│   │   ├── stores/                # Zustand store
│   │   ├── services/              # 业务逻辑
│   │   ├── repositories/          # 数据访问
│   │   ├── types/                 # 类型定义
│   │   └── index.ts               # 公开 API
│   ├── statistics/                # 统计报表 (未来)
│   ├── categories/                # 分类管理 (未来)
│   ├── accounts/                  # 账户管理 (未来)
│   └── budget/                    # 预算管理 (未来)
├── shared/                        # 共享资源
│   ├── components/                # 通用组件
│   ├── hooks/                     # 通用 hooks
│   ├── stores/                    # 全局状态
│   ├── types/                     # 通用类型
│   ├── utils/                     # 工具函数
│   └── db/                        # 数据库抽象
├── navigation/                    # 路由配置
│   ├── AppNavigator.tsx           # 根导航
│   ├── features/                  # 各 feature 的路由配置
│   ├── routes.ts                  # 路由常量
│   └── types.ts                   # 路由类型定义
└── App.tsx                        # 应用入口
```

## 迁移步骤

1. 创建目录结构
2. 移动 ledger 功能模块代码
3. 创建 shared 共享资源目录
4. 引入 Zustand 状态管理
5. 重构路由架构
6. 创建 Feature 公开 API
7. 更新导入路径
8. 验证迁移结果

## 关键文件

- `src/app/src/features/ledger/` - 账目功能模块
- `src/app/src/shared/` - 共享资源
- `src/app/src/navigation/` - 路由配置
- `src/app/src/App.tsx` - 应用入口
- `src/app/package.json` - 添加 zustand 依赖
