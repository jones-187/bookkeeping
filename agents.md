# AI Agent Guide

This file defines how coding agents should work in this repository.

## Mission

- Build a local-first bookkeeping app with high financial correctness.
- Keep architecture simple and maintainable.
- Prefer small, testable, low-risk changes.

## Project Status (2026-03-27)

- Repository is in scaffolding/documentation phase.
- `src/app` and `src/server` are placeholders with README files.
- Most implementation work is still ahead.

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

## Standard Workflow

1. Confirm scope and target paths.
2. Implement minimal viable change.
3. Run lint and relevant tests.
4. Document assumptions in PR/commit message.

## Useful Commands

- Setup: `make setup`
- Run backend: `make run-server`
- Run app: `make run-app`
- Run all tests: `make test`
- Lint all: `make lint`
- Run migrations: `make migrate`

## Definition of Done

- Change is functionally correct.
- No float-based money logic introduced.
- Lint and tests pass (or failures are explained).
- Docs are updated when behavior or architecture changed.

## When Unsure

- Choose correctness over speed for monetary logic.
- Choose simpler design over speculative abstractions.
- Ask for clarification if a change could affect data integrity.
