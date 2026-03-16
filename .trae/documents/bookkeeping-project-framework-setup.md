# 记账 App 项目框架搭建计划

## 项目概述

基于 **Local-First + 极致性能** 架构理念，为独立开发者打造一套高效、可维护的记账应用项目框架。

## 一、目录结构设计

```
bookkeeping/
├── docs/                      # 文档中心 (Docs-as-Code)
│   ├── adr/                   # 架构决策记录
│   │   ├── ADR-001-local-first-architecture.md
│   │   ├── ADR-002-tech-stack-selection.md
│   │   └── README.md
│   ├── designs/               # 方案设计文档
│   │   └── README.md
│   ├── api/                   # API 定义
│   │   └── README.md
│   └── architecture/          # 架构图 (Mermaid)
│       └── README.md
├── src/
│   ├── app/                   # 前端应用
│   │   └── README.md
│   └── server/                # 后端服务
│       └── README.md
├── tests/                     # 测试目录
│   ├── unit/                  # 单元测试
│   ├── integration/           # 集成测试
│   └── e2e/                   # 端到端测试
├── scripts/                   # 自动化脚本
│   └── README.md
├── .github/
│   └── workflows/             # GitHub Actions CI/CD
│       └── ci.yml
├── .gitignore
├── README.md                  # 项目入口文档
└── Makefile                   # 常用命令快捷方式
```

## 二、实施步骤

### 步骤 1：创建文档目录结构
- [ ] 创建 `docs/adr/` 目录及 ADR 模板
- [ ] 创建 `docs/designs/` 目录
- [ ] 创建 `docs/api/` 目录
- [ ] 创建 `docs/architecture/` 目录

### 步骤 2：创建源代码目录结构
- [ ] 创建 `src/app/` 目录 (前端)
- [ ] 创建 `src/server/` 目录 (后端)

### 步骤 3：创建测试目录结构
- [ ] 创建 `tests/unit/` 目录
- [ ] 创建 `tests/integration/` 目录
- [ ] 创建 `tests/e2e/` 目录

### 步骤 4：创建辅助目录
- [ ] 创建 `scripts/` 目录
- [ ] 创建 `.github/workflows/` 目录

### 步骤 5：编写核心 ADR 文档
- [ ] ADR-001: Local-First 架构决策
- [ ] ADR-002: 技术栈选型

### 步骤 6：创建架构图
- [ ] C4 模型 Context 层级图
- [ ] C4 模型 Container 层级图

### 步骤 7：配置文件
- [ ] 创建 `.gitignore`
- [ ] 创建 GitHub Actions CI 配置
- [ ] 创建 Makefile

### 步骤 8：更新 README.md
- [ ] 完善项目说明、运行指南、架构概览

## 三、核心设计原则

### 1. 金融数据精度保障
- 后端使用 `shopspring/decimal` 处理金额
- 前端使用字符串存储金额，禁止浮点数计算
- 所有金额计算必须有单元测试覆盖

### 2. 同步机制设计
- 每条记录包含 `version` 字段支持增量同步
- 使用 `deleted_at` 实现软删除，防止离线删除丢失
- 冲突解决策略：基于版本号的 Last-Write-Wins

### 3. 质量关卡
- Lint & Format 自动化
- Type Check 强制执行
- 单元测试覆盖率要求（核心计算逻辑 100%）

## 四、技术栈预选

| 层级 | 技术选型 | 说明 |
|------|----------|------|
| 前端 | React Native / Flutter | 跨平台移动应用 |
| 本地存储 | SQLite / WatermelonDB | Local-First 核心 |
| 后端 | Go | 高性能 API 服务 |
| 云端数据库 | PostgreSQL | 金融级可靠性 |
| API 文档 | OpenAPI/Swagger | 标准化接口定义 |

## 五、后续扩展建议

1. **第一个月**：完成核心记账功能 + 本地存储
2. **第二个月**：实现同步协议 + 云端备份
3. **第三个月**：报表功能 + 多设备同步测试

---

*本计划遵循 Docs-as-Code 理念，文档与代码同步维护。*
