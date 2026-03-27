# Dev Setup

Last updated: 2026-03-27

## Prerequisites

- Node.js 22.x
- npm 10.x+
- Go 1.22.2+
- Optional: `make`

## Bootstrap

### Windows PowerShell

```powershell
cd E:\User_File\project\Project\bookkeeping\src\app
npm install

cd E:\User_File\project\Project\bookkeeping\src\server
go mod download
```

### With make

```bash
make setup
```

## Run the current scaffold

### Server

```powershell
cd E:\User_File\project\Project\bookkeeping\src\server
go run ./cmd/server
```

### App

```powershell
cd E:\User_File\project\Project\bookkeeping\src\app
Copy-Item .env.example .env
npm start
```

The app expects:

```dotenv
EXPO_PUBLIC_API_BASE_URL=http://localhost:8080
```

For physical devices, replace `localhost` with your computer's reachable IP address.

## Test and lint

### App

```powershell
cd E:\User_File\project\Project\bookkeeping\src\app
npm run lint
npm test -- --runInBand
```

### Server

```powershell
cd E:\User_File\project\Project\bookkeeping\src\server
go test ./...
go build ./cmd/server
```

## Current implemented behavior

The only end-to-end behavior in the repo is the service status page:

- app loads
- app requests `GET /api/v1/bootstrap`
- success state renders bootstrap data
- failure state renders an error box and retry button

## Notes

- `make` is not required on Windows for the current scaffold.
- Database, migration, sync, and auth commands are intentionally absent until those modules exist.
