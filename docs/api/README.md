# API Docs

Last updated: 2026-03-27

This directory documents the currently implemented HTTP API surface.
The repository only exposes a minimal bootstrap API at this stage.

## Design rules

1. Use REST-style HTTP endpoints.
2. Version public endpoints under `/api/v1/`.
3. Return explicit JSON payloads.
4. Keep the current surface small until bookkeeping domain models exist.

## Implemented endpoints

### `GET /healthz`

Purpose:

- process health check
- local startup verification

Response:

```json
{
  "status": "ok"
}
```

### `GET /api/v1/bootstrap`

Purpose:

- provide the app with stable startup metadata
- verify app-to-server connectivity

Response:

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

## Not implemented yet

The following are intentionally absent in the current scaffold:

- account endpoints
- category endpoints
- ledger entry endpoints
- sync endpoints
- auth endpoints
- migrations or schema docs

When those areas are added, this directory should expand with endpoint-specific documents or an OpenAPI file.
