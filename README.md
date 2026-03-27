# Bookkeeping

Local-first bookkeeping app scaffold with a minimal Expo client and Go API.

## Current status

The repository now includes a runnable front-end and back-end skeleton.
The only implemented feature is a service status page that verifies:

- the Expo app can start
- the Go API can start
- the app can fetch `GET /api/v1/bootstrap`
- success and failure states render correctly

No money logic, local SQLite storage, sync, migrations, or authentication are implemented yet.

## Tech stack

- App: Expo + React Native + TypeScript
- Server: Go 1.22 + Gin
- Contract: JSON bootstrap response over HTTP

## Run locally

### 1. Install dependencies

Windows PowerShell:

```powershell
cd E:\User_File\project\Project\bookkeeping\src\app
npm install

cd E:\User_File\project\Project\bookkeeping\src\server
go mod download
```

If you have `make` available, you can also run:

```bash
make setup
```

### 2. Start the server

```powershell
cd E:\User_File\project\Project\bookkeeping\src\server
go run ./cmd/server
```

Server default address: `http://localhost:8080`

Available endpoints:

- `GET /healthz`
- `GET /api/v1/bootstrap`

### 3. Configure the app

Create `src/app/.env` from `src/app/.env.example` and keep:

```dotenv
EXPO_PUBLIC_API_BASE_URL=http://localhost:8080
```

If you run the app on a real device, replace `localhost` with the machine's LAN IP.

### 4. Start the app

```powershell
cd E:\User_File\project\Project\bookkeeping\src\app
npm start
```

## Implemented feature

The service status page shows:

- app title and short description
- backend connection state
- service name
- version
- current server time
- enabled feature flags
- retry button when the backend is unavailable

Default feature list returned by the server:

- `local-first-ready`
- `offline-ledger-planned`
- `sync-not-enabled`

## Test commands

App:

```powershell
cd E:\User_File\project\Project\bookkeeping\src\app
npm test -- --runInBand
npm run lint
```

Server:

```powershell
cd E:\User_File\project\Project\bookkeeping\src\server
go test ./...
go build ./cmd/server
```

## Next step

The next implementation phase should introduce local ledger entry capture backed by SQLite, while preserving the no-float money invariant.
