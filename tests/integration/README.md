# Integration Tests

Last updated: 2026-03-27

This directory captures integration-test intent.

## Current reality

There is no separate integration suite yet.
The current scaffold is validated by:

- app Jest tests for UI behavior
- server HTTP tests
- manual local startup checks

## Near-term integration scope

The first real integration suite should cover:

- app-to-server bootstrap connectivity
- environment-based API base URL configuration
- server startup and endpoint responses

## Later integration scope

Once persistence and sync exist, add integration tests for:

- SQLite reads and writes
- migration behavior
- sync request idempotency
- conflict handling
