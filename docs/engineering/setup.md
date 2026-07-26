# 开发环境

## 前置条件

- Node.js 22（CI 使用此版本）
- npm
- Go 1.22.2
- 可选：`make`

移动端端到端测试还需要 Maestro、已启动的 iOS 或 Android 模拟器，以及 Expo Go。安装与运行细节见 [端到端测试说明](../../tests/e2e/README.md)。

## 安装依赖

从仓库根目录执行：

```bash
cd src/app
npm ci

cd ../server
go mod download
```

也可以执行 `make setup`；该命令在应用目录运行 `npm install`，并在服务端运行 `go mod download`。

## 运行应用

启动 Expo 开发服务器：

```bash
cd src/app
npm start
```

也可使用 `npm run android`、`npm run ios` 或 `npm run web` 启动对应平台。应用在原生平台使用 SQLite，在 Web 平台使用 IndexedDB。

## 运行服务端

```bash
cd src/server
go run ./cmd/server
```

默认地址为 `http://localhost:8080`。可通过 `PORT`、`SERVICE_NAME` 和 `APP_VERSION` 设置服务端配置。

`src/app/.env.example` 仅说明 `EXPO_PUBLIC_API_BASE_URL` 的默认解析规则：Android 模拟器默认为 `http://10.0.2.2:8080`，其他平台默认为 `http://localhost:8080`。

## 常用检查

```bash
make test
make lint
make build
```

这些命令分别运行应用与服务端测试、应用 lint 与服务端测试、以及服务端构建。更细的测试分层和命令见 [testing.md](testing.md)。
