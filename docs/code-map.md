# 代码地图

最后更新：2026-03-27

## 仓库布局

- `docs/`：架构、ADR、设置和贡献者指南
- `src/app/`：Expo + React Native 应用工作区
- `src/server/`：Go API 工作区
- `tests/`：为更广泛的测试规划预留的策略文件夹
- `scripts/`：辅助脚本
- `Makefile`：为提供 `make` 的环境准备的便捷命令

## 当前实现

### `src/app`

- `App.tsx`：单屏幕状态页面
- `src/services/api.ts`：bootstrap API 请求
- `src/types/bootstrap.ts`：响应契约
- `src/components/ServiceStatusCard.tsx`：成功状态卡片
- `__tests__/App.test.tsx`：应用成功和重试流程

### `src/server`

- `cmd/server/main.go`：可执行入口点
- `internal/app/config.go`：基于环境的配置
- `internal/http/router.go`：Gin 路由和中间件
- `internal/http/handler/bootstrap.go`：健康和 bootstrap 处理器
- `internal/http/router_test.go`：HTTP 端点测试

## 当前公共接口

- `GET /healthz`
- `GET /api/v1/bootstrap`

Bootstrap 响应字段：

- `status`
- `serviceName`
- `version`
- `serverTime`
- `features`

## 近期构建顺序

1. 保持服务状态页面稳定
2. 引入由 SQLite 支持的本地账目流水记录
3. 添加账户/类别模型
4. 添加离线优先持久化和后续同步

## 变更规划规则

对于非平凡的变更，请继续列出：

- 要编辑的路径
- 要保持的不变量
- 要添加或更新的测试
