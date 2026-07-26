# 开发环境

## 前置条件

- Node.js 22.13 或更高版本（CI 使用 Node.js 22.13）
- npm
- 可选：`make`

移动端端到端测试还需要 Maestro、已启动的 iOS 或 Android 模拟器，以及已安装的 Bookkeeping 原生开发构建。安装与运行细节见 [端到端测试说明](../../tests/e2e/README.md)。

## 安装依赖

从仓库根目录执行：

```bash
cd src/app
npm ci
```

也可以执行 `make setup`；该命令在应用目录运行 `npm install`。

## 运行应用

启动 Expo 开发服务器：

```bash
cd src/app
npm start
```

也可使用 `npm run android` 或 `npm run ios` 启动对应平台。应用在设备本地使用 SQLite。

## 常用检查

```bash
make test
make lint
make build
```

这些命令分别运行应用测试、应用 lint，以及导出 Android 和 iOS bundle。更细的测试分层和命令见 [testing.md](testing.md)。
