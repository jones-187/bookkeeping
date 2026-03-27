# Code Map

Last updated: 2026-03-27

## Repository layout

- `docs/`: architecture, ADRs, setup, and contributor guidance
- `src/app/`: Expo + React Native app workspace
- `src/server/`: Go API workspace
- `tests/`: reserved strategy folders for broader test planning
- `scripts/`: helper scripts
- `Makefile`: convenience commands for environments that provide `make`

## Current implementation

### `src/app`

- `App.tsx`: single-screen status page
- `src/services/api.ts`: bootstrap API request
- `src/types/bootstrap.ts`: response contract
- `src/components/ServiceStatusCard.tsx`: success-state card
- `__tests__/App.test.tsx`: app success and retry flows

### `src/server`

- `cmd/server/main.go`: executable entry point
- `internal/app/config.go`: environment-based config
- `internal/http/router.go`: Gin router and middleware
- `internal/http/handler/bootstrap.go`: health and bootstrap handlers
- `internal/http/router_test.go`: HTTP endpoint tests

## Current public interface

- `GET /healthz`
- `GET /api/v1/bootstrap`

Bootstrap response fields:

- `status`
- `serviceName`
- `version`
- `serverTime`
- `features`

## Near-term build order

1. Keep the service status page stable.
2. Introduce local SQLite-backed ledger entry capture.
3. Add account/category models.
4. Add offline-first persistence and later sync.

## Change planning rule

For non-trivial changes, continue to list:

- paths to edit
- invariants to preserve
- tests to add or update
