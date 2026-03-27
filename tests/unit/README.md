# Unit Tests

Last updated: 2026-03-27

This directory captures unit-test intent for the current and next phases.

## Current reality

The repo currently has:

- app UI state tests in `src/app/__tests__/App.test.tsx`
- server handler/router tests in `src/server/internal/http/router_test.go`

## Current priorities

### App

- loading state for bootstrap request
- success rendering for bootstrap payload
- failure rendering and retry flow

### Server

- `GET /healthz` returns `200` with status `ok`
- `GET /api/v1/bootstrap` returns a complete JSON payload
- `serverTime` stays RFC3339 formatted

## Next priorities

When money-domain code appears, unit tests must cover:

- integer or decimal-safe money math
- negative, zero, and large-value boundaries
- serialization and validation edge cases
