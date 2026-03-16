.PHONY: help setup install build test lint clean dev migrate

help:
	@echo "可用命令:"
	@echo "  make setup        一键配置开发环境"
	@echo "  make dev          启动全套开发服务"
	@echo "  make test         运行所有测试"
	@echo "  make lint         运行代码检查"
	@echo "  make migrate      执行数据库迁移"
	@echo "  make build        构建所有项目"
	@echo "  make clean        清理构建产物"

setup: install
	@echo ">>> 配置 Git Hooks"
	@git config core.hooksPath .githooks 2>/dev/null || true
	@echo ">>> 开发环境配置完成"

install:
	@echo ">>> 安装前端依赖"
	cd src/app && npm install
	@echo ">>> 安装后端依赖"
	cd src/server && go mod download

build:
	@echo ">>> 构建前端"
	cd src/app && npm run build
	@echo ">>> 构建后端"
	cd src/server && go build -o bin/server ./cmd/server

test:
	@echo ">>> 运行前端测试"
	cd src/app && npm test
	@echo ">>> 运行后端测试"
	cd src/server && go test -v -race -coverprofile=coverage.out ./...

test-unit:
	cd src/app && npm test
	cd src/server && go test -v -race ./...

test-coverage:
	cd src/server && go test -coverprofile=coverage.out ./...
	cd src/app && npm test -- --coverage

lint:
	@echo ">>> 检查前端代码"
	cd src/app && npm run lint
	@echo ">>> 检查后端代码"
	cd src/server && golangci-lint run

lint-app:
	cd src/app && npm run lint

lint-server:
	cd src/server && golangci-lint run

clean:
	rm -rf src/app/node_modules
	rm -rf src/app/dist
	rm -rf src/server/bin
	rm -rf coverage
	rm -rf tmp

dev:
	@echo ">>> 启动开发环境..."
	@echo ">>> 请在新终端运行: make run-app"
	@echo ">>> 请在新终端运行: make run-server"
	@$(MAKE) run-server

run-app:
	@echo ">>> 启动前端应用"
	cd src/app && npm start

run-server:
	@echo ">>> 启动后端服务"
	cd src/server && go run ./cmd/server

migrate:
	@echo ">>> 执行数据库迁移"
	cd src/server && go run ./cmd/migrate

migrate-rollback:
	@echo ">>> 回滚上一次迁移"
	cd src/server && go run ./cmd/migrate -rollback

docker-up:
	docker-compose up -d

docker-down:
	docker-compose down

docker-logs:
	docker-compose logs -f
