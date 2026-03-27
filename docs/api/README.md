# API 文档

最后更新：2026-03-27

本目录记录当前已实现的 HTTP API 范围。在此阶段，仓库仅暴露一个最小化的 bootstrap API。

## 设计规则

1. 使用 REST 风格的 HTTP 端点
2. 在 `/api/v1/` 下版本化公共端点
3. 返回明确的 JSON 有效负载
4. 在记账领域模型存在之前，保持当前范围较小

## 已实现的端点

### `GET /healthz`

用途：

- 进程健康检查
- 本地启动验证

响应：

```json
{
  "status": "ok"
}
```

### `GET /api/v1/bootstrap`

用途：

- 为应用提供稳定的启动元数据
- 验证应用到服务端的连接性

响应：

```json
{
  "status": "ok",
  "serviceName": "bookkeeping-server",
  "version": "dev",
  "serverTime": "2026-03-27T12:34:56Z",
  "features": [
    "local-first-ready",
    "offline-ledger-planned",
    "sync-not-enabled"
  ]
}
```

## 尚未实现

以下内容有意在当前脚手架中缺失：

- 账户端点
- 类别端点
- 账目流水端点
- 同步端点
- 身份验证端点
- 迁移或架构文档

添加这些区域时，本目录应随端点特定文档或 OpenAPI 文件一起扩展。
