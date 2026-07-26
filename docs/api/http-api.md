# HTTP API

Go 服务当前只提供两个无认证的只读端点。路由由 [Handler.RegisterRoutes](../../src/server/internal/http/handler/bootstrap.go) 注册，并经 [NewRouter](../../src/server/internal/http/router.go) 启用 Gin 的日志、恢复和默认 CORS 中间件。

服务默认监听 `8080` 端口；`PORT`、`SERVICE_NAME` 与 `APP_VERSION` 可通过环境变量覆盖，定义见 [LoadConfig](../../src/server/internal/app/config.go)。

## `GET /healthz`

返回 HTTP `200 OK`，用于确认服务进程可响应请求。

```json
{
  "status": "ok"
}
```

响应类型和处理逻辑见 [HealthResponse 与 Health](../../src/server/internal/http/handler/bootstrap.go)。

## `GET /api/v1/bootstrap`

返回 HTTP `200 OK` 和服务启动元数据。

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `status` | string | 固定为 `ok`。 |
| `serviceName` | string | 服务名，来自 `SERVICE_NAME` 或默认值 `bookkeeping-server`。 |
| `version` | string | 版本，来自 `APP_VERSION` 或默认值 `dev`。 |
| `serverTime` | string | 处理请求时的 UTC 时间，RFC 3339 格式。 |
| `features` | string[] | 当前配置中声明的特性标识。 |

响应结构和序列化逻辑见 [BootstrapResponse 与 Bootstrap](../../src/server/internal/http/handler/bootstrap.go)；默认配置的具体值见 [LoadConfig](../../src/server/internal/app/config.go)。

该服务没有账目条目的 HTTP 端点。账目条目 CRUD 与汇总由应用直接经本地数据库完成，入口见 [LedgerEntryService](../../src/app/src/features/ledger/services/LedgerEntryService.ts)。
