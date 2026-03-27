# Project Overview

Last updated: 2026-03-27

## Background

This project aims to become a local-first bookkeeping app for personal finance use cases.
The product direction remains:

- fast local interaction
- reliable offline behavior
- simple and maintainable architecture
- strict financial correctness

## Current state

As of 2026-03-27, the repository is no longer documentation-only.
A minimal runnable scaffold now exists:

- Expo + React Native + TypeScript app in `src/app`
- Go + Gin API in `src/server`
- one implemented feature: a service status page

The service status page proves that:

- the app boots successfully
- the server boots successfully
- the app can call `GET /api/v1/bootstrap`
- the UI handles loading, success, and retry-after-failure states

Not implemented yet:

- local SQLite persistence
- ledger entry CRUD
- accounts and categories
- sync
- migrations
- auth
- money-domain logic

## Product goals

- deliver a bookkeeping experience that remains usable offline
- keep cloud responsibilities limited to backup and sync later on
- maintain a codebase that can be evolved safely with tests and docs

## Current architecture principles

### 1. Local-first remains the product direction

Current code does not implement local persistence yet, but all future data flows should still prefer local storage and treat sync as secondary.

### 2. Start from a narrow working slice

The repository intentionally starts with a thin end-to-end slice before moving into money and data correctness work.
The current slice is the service status page.

### 3. Financial correctness is deferred, not relaxed

Money logic is not implemented in this scaffold.
When it is introduced, it must not use floating-point arithmetic.

### 4. Keep the scaffold easy to replace

The current app and API code are intentionally small and should remain easy to refactor as real bookkeeping flows arrive.

## Current tech stack

### App

- Expo
- React Native
- TypeScript
- Jest + Testing Library
- ESLint

### Server

- Go 1.22
- Gin
- standard library tests

## Current public API

- `GET /healthz`
- `GET /api/v1/bootstrap`

Bootstrap payload fields:

- `status`
- `serviceName`
- `version`
- `serverTime`
- `features`

## Near-term roadmap

### Phase 1

- keep the current bootstrap flow stable
- introduce SQLite-backed local ledger entry capture

### Phase 2

- add account and category models
- add local reporting views

### Phase 3

- add explicit sync interfaces and conflict rules

## Documentation maintenance rule

Update this file when any of these change:

- project status
- implemented feature set
- public API surface
- core roadmap order
- major environment expectations
