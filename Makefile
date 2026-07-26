.PHONY: help setup build test lint run-app

help:
	@echo "Available commands:"
	@echo "  make setup       Install app dependencies"
	@echo "  make run-app     Start the Expo app"
	@echo "  make test        Run app tests"
	@echo "  make lint        Run app lint"
	@echo "  make build       Build Android and iOS bundles"

setup:
	cd src/app && npm install

build:
	cd src/app && npm run build

test:
	cd src/app && npm test -- --runInBand

lint:
	cd src/app && npm run lint

run-app:
	cd src/app && npm start
