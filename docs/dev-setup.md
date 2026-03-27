# Dev Setup

Last updated: 2026-03-27

## Prerequisites

- Node.js 20+
- Go 1.22+
- Docker + Docker Compose
- `make` available in shell

## Bootstrap

```bash
make setup
```

This installs app and server dependencies and configures git hooks.

## Day-to-Day Commands

- Start backend: `make run-server`
- Start mobile app: `make run-app`
- Run all tests: `make test`
- Run unit tests only: `make test-unit`
- Generate coverage: `make test-coverage`
- Run lint checks: `make lint`

## Migrations

- Apply migrations: `make migrate`
- Roll back latest migration: `make migrate-rollback`

## Docker Helpers

- Start local stack: `make docker-up`
- Stop local stack: `make docker-down`
- Follow logs: `make docker-logs`

## Troubleshooting

- If `make setup` fails in `src/app`, remove `src/app/node_modules` and retry.
- If `go mod download` fails, check Go proxy/network settings.
- If lint fails before code exists, treat missing implementation as expected and keep docs updated.
