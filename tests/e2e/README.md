# End-to-End Tests

Last updated: 2026-03-27

This directory captures end-to-end test intent.

## Current reality

No E2E harness is implemented yet.
The current runnable slice is small enough that local manual verification is still acceptable.

## Current manual E2E checklist

1. Start the Go API.
2. Start the Expo app.
3. Confirm the service status page loads.
4. Confirm service name, version, server time, and feature flags render.
5. Stop the API and confirm the app shows the retryable error state.

## Future automated E2E scope

When the product grows beyond the bootstrap page, automate:

- ledger entry creation
- offline reopen and local persistence checks
- sync recovery after reconnect
- reporting flows
