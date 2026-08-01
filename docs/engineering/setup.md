# 开发环境

## 前置条件

- Node.js 22.13 或更高版本（CI 使用 Node.js 22.13）
- npm
- 可选：`make`（只在使用仓库根目录的 `make` 命令时需要）
- Android：JDK、Android SDK，以及已启动的 Android 模拟器或已连接设备
- iOS：macOS、Xcode、CocoaPods，以及已启动的 iOS 模拟器或已连接设备

移动端端到端测试还需要 Maestro、已启动的 iOS 或 Android 模拟器，以及已安装的 Bookkeeping 原生开发构建。安装与运行细节见 [端到端测试说明](../../tests/e2e/README.md)。

## 安装依赖

从仓库根目录执行：

```bash
cd src/app
npm ci
```

也可以执行 `make setup`；该命令在应用目录运行 `npm ci`。

## 运行应用

构建并安装 Android 或 iOS dedicated development build：

```bash
cd src/app
npm run android
# 或
npm run ios
```

这两个命令分别执行 `expo run:android` 和 `expo run:ios`。当 `src/app/android/` 或
`src/app/ios/` 不存在时，Expo 会依据受版本控制的 `app.json` 生成对应原生工程，再构建并安装 development build；生成目录是可重新生成的本地产物，不提交到 Git。

如果 `app.json` 发生变化且对应原生目录已经存在，先从 `src/app` 重新生成配置：

```bash
npx expo prebuild --clean --no-install
```

如果目标平台已经安装了 development build，只需启动连接该构建的 Metro 开发服务器：

```bash
cd src/app
npx expo start --dev-client
```

应用在设备本地使用 SQLite。`npm start` 只启动通用 Expo 开发服务器，不负责生成或安装原生构建。

## 常用检查

```bash
make test
make lint
make build
```

这些命令分别运行应用测试、应用 lint，以及导出 Android 和 iOS bundle；它们不替代设备上的原生构建安装。更细的测试分层和命令见 [testing.md](testing.md)。
