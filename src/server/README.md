# Server Workspace

This workspace contains the Go API used by the mobile app.

## Current scope

- `GET /healthz` for process health checks
- `GET /api/v1/bootstrap` for app bootstrap metadata
- No database, migration, auth, or sync logic yet

## Key files

- `cmd/server/main.go`: process entry point
- `internal/app/config.go`: environment-backed config
- `internal/http/router.go`: Gin router setup
- `internal/http/handler/bootstrap.go`: HTTP handlers
- `internal/http/router_test.go`: endpoint tests

## Run directly

```bash
go mod download
go run ./cmd/server
```
