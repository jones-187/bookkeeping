# Risk Areas

Last updated: 2026-03-27

This file marks high-risk areas that require extra care and review.

## P0: Monetary Correctness

- No floats for amount storage or arithmetic.
- Ensure deterministic rounding behavior.
- Validate negative, zero, and large amount edge cases.

Required checks:

- Unit tests for money operations and rounding boundaries.
- Input validation tests for invalid formats.

## P0: Data Migrations

- Migrations must be forward-safe and reversible when possible.
- Never couple migration success to remote service availability.
- Backfill steps must be idempotent.

Required checks:

- Migration test on clean DB.
- Migration test from prior schema snapshot.

## P1: Local-First Sync

- Offline actions must not be blocked by sync failures.
- Conflict resolution must be explicit and reproducible.
- Version/timestamp assumptions must be documented.

Required checks:

- Integration tests for conflict cases.
- Retry/idempotency tests for duplicate sync payloads.

## P1: Reporting/Aggregation

- Totals must match ledger source of truth.
- Timezone boundaries can skew daily/monthly reports.

Required checks:

- Tests around day/month boundaries and timezone conversion.

## Review Rule

Changes touching P0 areas require:

- Focused PR scope.
- Explicit invariant checklist in PR description.
- At least one reviewer who did not author the change.
