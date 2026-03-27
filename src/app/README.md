# App Workspace

This workspace contains the Expo + React Native mobile shell for the project.

## Current scope

- Single-screen bootstrap app
- Fetches backend status from `GET /api/v1/bootstrap`
- Renders service name, version, server time, and feature list
- Shows a retry action when the backend is unavailable

## Key files

- `App.tsx`: screen entry point
- `src/services/api.ts`: backend request wrapper
- `src/types/bootstrap.ts`: bootstrap response contract
- `__tests__/App.test.tsx`: UI state tests

## Run directly

```bash
npm install
npm start
```
