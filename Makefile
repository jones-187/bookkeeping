.PHONY: help setup build test lint run-app run-android run-ios

help:
	@echo "Available commands:"
	@echo "  make setup       Install app dependencies"
	@echo "  make run-app     Start the Expo development server"
	@echo "  make run-android Build and install the Android development build"
	@echo "  make run-ios     Build and install the iOS development build"
	@echo "  make test        Run app tests"
	@echo "  make lint        Run app lint"
	@echo "  make build       Build Android and iOS bundles"

setup:
	cd src/app && npm ci

build:
	cd src/app && npm run build

test:
	cd src/app && npm test

lint:
	cd src/app && npm run lint

run-app:
	cd src/app && npm start

run-android:
	cd src/app && npm run android

run-ios:
	cd src/app && npm run ios
