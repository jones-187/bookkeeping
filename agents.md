# AI Agent Guide

This file defines how coding agents should work in this repository.

## Mission

- Build a local-first bookkeeping app with high financial correctness.
- Keep architecture simple and maintainable.
- Prefer small, testable, low-risk changes.

## Project Status (2026-03-27)

- Repository now contains a runnable minimal scaffold.
- `src/app` is an Expo + React Native + TypeScript app with a single service status page.
- `src/server` is a Go + Gin API exposing `GET /healthz` and `GET /api/v1/bootstrap`.
- SQLite, money-domain logic, sync, migrations, and auth are still ahead.

## Core Constraints

- Never use floating-point arithmetic for money.
- Preserve local-first behavior: local data must still work when offline.
- Keep API and schema changes backward compatible when possible.
- Do not introduce hidden side effects in sync or migration paths.

## Working Agreement

- Read `docs/code-map.md` before making structural edits.
- Read `docs/risk-areas.md` before touching money/sync/migration code.
- Keep commits focused on one logical concern.
- Add or update tests with behavior changes.
- Update all related docs in the same change when implementation or workflow changes.

## Standard Workflow

1. Confirm scope and target paths.
2. Implement the smallest viable change.
3. Run lint and relevant tests.
4. Document assumptions in PR/commit notes or user summary.
5. Update docs that describe the changed behavior, setup, or architecture.

## Useful Commands

- Setup: `make setup`
- Run backend: `make run-server`
- Run app: `make run-app`
- Run all tests: `make test`
- Lint all: `make lint`

Windows direct commands remain the primary fallback because `make` may not be installed.

## Environment Notes

- Prefer absolute paths under `E:\User_File\project\Project\bookkeeping` when invoking shell commands.
- In this environment, tool `workdir` may not reliably switch to the repo on `E:`. Use `Set-Location 'E:\...path...'` or `cmd /c "cd /d E:\... && ..."` explicitly.
- Node commands against the `E:` workspace may fail inside the sandbox with `EPERM` or path-resolution errors. If lint, test, or install hits that class of error, rerun with escalated permissions instead of retrying the same sandboxed command.
- Go commands may fail if they write to the default user build cache. Prefer setting `GOCACHE` to a workspace-local path such as `E:\User_File\project\Project\bookkeeping\.cache\go-build` for test/build runs.
- Do not ignore `src/server/go.sum`; it is part of the tracked dependency state.
- Avoid broad recursive file scans that include `src/app/node_modules`; they create noise and timeouts. Exclude dependency directories when auditing docs or source files.
- If a temporary `.cache/` directory is created for Go, it should stay git-ignored and not be committed.

## Definition of Done

- Change is functionally correct.
- No float-based money logic introduced.
- Lint and tests pass, or failures are explicitly explained.
- Docs are updated when behavior, setup, or architecture changed.

## When Unsure

- Choose correctness over speed for monetary logic.
- Choose simpler design over speculative abstractions.
- Ask for clarification if a change could affect data integrity.
