# 前端应用 (Mobile App)

基于 React Native / Flutter 的跨平台移动应用。

## 目录结构

```
app/
├── src/
│   ├── components/      # UI 组件
│   ├── screens/         # 页面
│   ├── navigation/      # 导航配置
│   ├── store/           # 状态管理
│   ├── services/        # 服务层
│   │   ├── database/    # 本地数据库
│   │   ├── sync/        # 同步引擎
│   │   └── api/         # API 调用
│   ├── utils/           # 工具函数
│   │   └── decimal/     # 金额计算 (精度处理)
│   └── types/           # TypeScript 类型定义
├── assets/              # 静态资源
└── tests/               # 应用测试
```

## 核心模块

### 1. 本地数据库
- SQLite / WatermelonDB
- 离线优先设计
- 数据迁移管理

### 2. 同步引擎
- 增量同步 (基于 version)
- 冲突解决
- 离线队列

### 3. 金额计算
- 字符串存储，禁止浮点数
- BigInt / decimal.js 处理精度

## 开发指南

(待补充)
