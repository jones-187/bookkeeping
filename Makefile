.PHONY: help setup install build test lint clean dev run-app run-server

help:
	@echo "Available commands:"
	@echo "  make setup       Install app and server dependencies"
	@echo "  make run-app     Start the Expo app"
	@echo "  make run-server  Start the Go API server"
	@echo "  make test        Run app and server tests"
	@echo "  make lint        Run app lint and server go test"
	@echo "  make build       Build the Go server binary"
	@echo "  make clean       Remove generated artifacts"

setup: install

install:
	cd src/app && npm install
	cd src/server && go mod download

build:
	cd src/server && go build -o bin/server.exe ./cmd/server

test:
	cd src/app && npm test -- --runInBand
	cd src/server && go test ./...

lint:
	cd src/app && npm run lint
	cd src/server && go test ./...

clean:
	if [ -d src/app/node_modules ]; then rm -rf src/app/node_modules; fi
	if [ -d src/server/bin ]; then rm -rf src/server/bin; fi

dev:
	@echo "Run make run-server and make run-app in separate terminals."

run-app:
	cd src/app && npm start

run-server:
	cd src/server && go run ./cmd/server
