# 更新日志

本文件记录项目的重要变更。格式基于 [Keep a Changelog](https://keepachangelog.com/)。

## [Unreleased]

### 新增
- 账户管理功能（计划中）
- 类别管理功能（计划中）

## [0.1.0] - 2026-04-05

### 新增
- 账目流水 CRUD（创建、查看、编辑、删除）
- 收入/支出分类
- 收支汇总显示
- 本地数据持久化（SQLite / IndexedDB）
- Feature-Slice 架构
- Zustand 状态管理
- E2E 测试框架（Playwright + Maestro）

### 技术细节
- 货币金额使用整数存储（分为单位），避免浮点精度问题
- 支持离线使用
- 单元测试 107 个通过
- E2E 测试 39 个通过

## [0.0.1] - 2026-03-27

### 新增
- 项目初始化
- Expo + React Native + TypeScript 应用框架
- Go + Gin API 后端框架
- 服务状态页面
- 基础 CI/CD 配置
- 中文文档体系
