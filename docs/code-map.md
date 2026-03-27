# Code Map

Last updated: 2026-03-27

## Repository Layout

- `docs/`: architecture notes, ADRs, API docs, and contribution guidance.
- `src/app/`: mobile app workspace (currently scaffold-level docs).
- `src/server/`: backend workspace (currently scaffold-level docs).
- `tests/unit/`: unit test strategy and notes.
- `tests/integration/`: integration test strategy and notes.
- `tests/e2e/`: end-to-end test strategy and notes.
- `scripts/`: automation and helper scripts (to be expanded).
- `Makefile`: primary developer task entrypoint.

## Existing Documentation

- Architecture: `docs/architecture/`
- ADRs: `docs/adr/`
- Product/Design overview: `docs/designs/`
- API docs: `docs/api/`

## Planned Ownership (Target State)

- `src/app`: UI flows, local cache, sync client behavior.
- `src/server`: API, data model, migrations, sync protocol.
- `tests/*`: regression safety net for money logic and sync behavior.

## Priority Build Order

1. Backend domain model for accounts, categories, and ledger entries.
2. Local app data model and offline-first CRUD flows.
3. Sync protocol and conflict strategy.
4. Reporting views and aggregation endpoints.

## Change Planning Rule

For any non-trivial change, list:

- Paths to edit.
- Invariants to preserve.
- Tests to add or update.
