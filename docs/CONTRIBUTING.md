# Contributing Guide

Last updated: 2026-03-27

This repository currently contains a minimal runnable scaffold. Contributing changes should keep that scaffold stable while preparing for later bookkeeping features.

## Development environment

### Required tools

- Node.js 22.x
- npm 10.x+
- Go 1.22.2+
- Optional: `make`

### Bootstrap

```powershell
cd E:\User_File\project\Project\bookkeeping\src\app
npm install

cd E:\User_File\project\Project\bookkeeping\src\server
go mod download
```

If `make` is available:

```bash
make setup
```

## Branching

Use focused branches from `main`.
Keep each branch limited to one logical concern.

Suggested naming:

- `feature/<topic>`
- `fix/<topic>`
- `docs/<topic>`

## Commit guidance

Use conventional prefixes where practical:

- `feat:` feature work
- `fix:` bug fixes
- `docs:` documentation changes
- `refactor:` structural change without intended behavior change
- `test:` test-only updates
- `chore:` tooling or build changes

## Current testing rules

### App

```powershell
cd E:\User_File\project\Project\bookkeeping\src\app
npm run lint
npm test -- --runInBand
```

### Server

```powershell
cd E:\User_File\project\Project\bookkeeping\src\server
$env:GOCACHE='E:\User_File\project\Project\bookkeeping\.cache\go-build'
go test ./...
go build ./cmd/server
```

## Current implemented surface

The repo currently guarantees only this end-to-end behavior:

- the Expo app starts
- the Go API starts
- the app fetches `GET /api/v1/bootstrap`
- the app renders success and failure states for that request

## Coding constraints

### Go

- Keep handlers and config simple.
- Avoid introducing database or migration assumptions until those modules exist.
- When money logic is introduced later, use integer/decimal-safe representations only.

### TypeScript / React Native

- Keep the current scaffold single-purpose and easy to test.
- Avoid unnecessary state libraries or navigation until there is real product pressure.
- Any money values introduced later must avoid floats.

## Documentation rule

When you change behavior or setup, update all related docs in the same change set.
At minimum, review:

- `README.md`
- `docs/dev-setup.md`
- `docs/code-map.md`
- `docs/designs/project-overview.md`
- `docs/api/README.md`
- `agents.md`

## Pull request checklist

- [ ] Behavior is correct
- [ ] Relevant tests were added or updated
- [ ] Lint and test commands were run, or failures were explained
- [ ] Related docs were updated
- [ ] No float-based money logic was introduced
