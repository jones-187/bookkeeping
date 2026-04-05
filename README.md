# Bookkeeping

基于 Local-First 架构的记账应用，支持 iOS 和 Android 平台，使用本地 SQLite 存储和离线使用。

## 当前状态

**阶段 1 已完成** ✅ - 本地账目流水记录功能已实现：

- ✅ SQLite 本地存储
- ✅ 账目流水的增删改查
- ✅ 收入/支出分类
- ✅ 金额使用整数存储（避免浮点精度问题）
- ✅ 单元测试和集成测试
- ✅ E2E 测试框架（Maestro）

## 技术栈

- **应用**：Expo 51 + React Native 0.74 + TypeScript
- **UI**：React Native Paper
- **导航**：React Navigation
- **存储**：expo-sqlite
- **测试**：Jest + Maestro
- **服务端**：Go 1.22 + Gin（可选，用于未来同步功能）

## 本地运行

### 1. 安装依赖

```bash
# 安装应用依赖
cd src/app
npm install

# 安装服务端依赖（可选）
cd ../server
go mod download
```

### 2. 启动应用

```bash
cd src/app
npm start
```

然后选择：
- 按 `i` 打开 iOS 模拟器
- 按 `a` 打开 Android 模拟器

### 3. 启动服务端（可选）

服务端目前仅用于健康检查，未来将支持数据同步：

```bash
cd src/server
go run ./cmd/server
```

服务端地址：`http://localhost:8080`

## 已实现功能

### 账目管理

- 📝 添加账目（收入/支出）
- ✏️ 编辑账目
- 🗑️ 删除账目（软删除）
- 📋 账目列表（按日期排序）
- 📊 收支汇总（总收入、总支出、结余）

### 数据存储

- 💾 本地 SQLite 存储
- 🔢 金额整数存储（分为单位）
- 🔒 数据验证和错误处理

## 测试

### 单元测试和集成测试

```bash
cd src/app
npm test
```

### E2E 测试（需要模拟器）

```bash
# 安装 Maestro
brew tap mobiledevops/mobiledevops
brew install maestro

# 启动应用后运行
cd src/app
npm run test:e2e
```

详细说明请参考 [tests/e2e/README.md](tests/e2e/README.md)。

## 项目结构

```
bookkeeping/
├── src/
│   ├── app/                    # React Native 应用
│   │   ├── src/
│   │   │   ├── components/     # UI 组件
│   │   │   ├── screens/        # 页面
│   │   │   ├── services/       # 业务逻辑层
│   │   │   ├── repositories/   # 数据访问层
│   │   │   ├── db/             # 数据库配置
│   │   │   ├── hooks/          # React Hooks
│   │   │   ├── utils/          # 工具函数
│   │   │   └── types/          # 类型定义
│   │   └── __tests__/          # 测试文件
│   └── server/                 # Go API 服务端（可选）
├── tests/
│   └── e2e/                    # E2E 测试
├── docs/                       # 文档
│   ├── adr/                    # 架构决策记录
│   └── designs/                # 设计文档
├── BACKLOG.md                  # 任务待办列表
└── ROADMAP.md                  # 产品路线图
```

## 文档

- [BACKLOG.md](BACKLOG.md) - 任务待办列表
- [ROADMAP.md](ROADMAP.md) - 产品路线图
- [docs/adr/](docs/adr/) - 架构决策记录
- [tests/e2e/README.md](tests/e2e/README.md) - E2E 测试说明

## 下一步计划

参见 [ROADMAP.md](ROADMAP.md) 阶段 2：

- 账户管理（现金、银行卡、信用卡等）
- 类别管理（餐饮、交通、工资等）
- 按账户/类别筛选
- 数据同步（可选）
