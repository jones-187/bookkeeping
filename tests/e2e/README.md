# Maestro 端到端测试

本目录验证 iOS 和 Android dedicated development build 的原生账目流程。测试不使用
Expo Go、深层链接或应用内测试后门。

## 运行前提

- 已安装 [Maestro](https://maestro.mobile.dev/)；`maestro --version` 应可执行。
- 已启动 Android 或 iOS 模拟器。
- 已构建并安装目标平台的 dedicated development build。首次或原生依赖、应用配置变更后，
  从 `src/app` 执行：

```bash
npx expo run:android
# 或
npx expo run:ios
```

`expo run:*` 会启动 Metro；若已安装构建，只需启动 Metro：

```bash
npx expo start --dev-client
```

## 命令

从 `src/app` 运行完整套件：

```bash
npm run test:e2e
```

运行独立流程：

```bash
maestro test ../../tests/e2e/flows/add-entry.yaml
```

可用的独立流程为 `add-entry.yaml`、`edit-entry.yaml`、`delete-entry.yaml` 和
`validation.yaml`。

## 数据隔离

每个独立流程均以 `launchApp` 的 `clearState: true` 开始。Maestro 会清除该应用的
本地状态（包括 SQLite 数据库）后重新启动应用，因此流程不依赖执行顺序，也不需要
额外的重置 URL 环境变量。这会删除模拟器中该应用的本地测试数据；不要在需要保留的
数据上运行这些流程。

测试描述使用 ASCII 字符串，避免 Android `inputText` 的非 ASCII 输入差异。

## 常见排错

- `App not found`：先运行对应平台的 `npx expo run:android` 或 `npx expo run:ios`，确认
  bundle ID / package 为 `com.jones187.bookkeeping`。
- 找不到元素或超时：确认 Metro 已连接到 development build，并用 `maestro studio`
  查看当前界面及可访问名称。
- 清除后仍有旧数据：确认运行的是 dedicated development build，而不是 Expo Go；单独运行
  对应 flow 也会重新执行 `clearState`。
