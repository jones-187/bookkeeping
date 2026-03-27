# 服务端工作区

此工作区包含移动应用使用的 Go API。

## 当前范围

- 用于进程健康检查的 `GET /healthz`
- 用于应用 bootstrap 元数据的 `GET /api/v1/bootstrap`
- 尚未实现数据库、迁移、身份验证或同步逻辑

## 关键文件

- `cmd/server/main.go`：进程入口点
- `internal/app/config.go`：基于环境的配置
- `internal/http/router.go`：Gin 路由设置
- `internal/http/handler/bootstrap.go`：HTTP 处理器
- `internal/http/router_test.go`：端点测试

## 直接运行

```bash
go mod download
go run ./cmd/server
```
