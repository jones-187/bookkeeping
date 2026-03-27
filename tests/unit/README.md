# 单元测试

最后更新：2026-03-27

此目录捕获当前和下一阶段的单元测试意图。

## 当前现状

仓库目前有：

- `src/app/__tests__/App.test.tsx` 中的应用 UI 状态测试
- `src/server/internal/http/router_test.go` 中的服务端处理器/路由测试

## 当前优先级

### 应用

- bootstrap 请求的加载状态
- bootstrap 有效负载的成功渲染
- 失败渲染和重试流程

### 服务端

- `GET /healthz` 返回 `200`，状态为 `ok`
- `GET /api/v1/bootstrap` 返回完整的 JSON 有效负载
- `serverTime` 保持 RFC3339 格式

## 下一个优先级

当货币领域代码出现时，单元测试必须覆盖：

- 整数或小数安全的货币数学
- 负数、零和大值边界
- 序列化和验证边界情况
