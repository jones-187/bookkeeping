# Android 原生 E2E：WSL2 与 Windows 模拟器

本文说明一种可迁移的混合环境：仓库、Gradle 构建和 Metro 运行在 WSL2，
Android 模拟器、ADB server 与 Maestro 运行在 Windows。具体安装目录由本机环境决定，
不属于仓库配置。

通用的原生测试要求见[开发环境](setup.md)和
[Maestro 端到端测试](../../tests/e2e/README.md)。本文只补充跨 WSL2/Windows 边界时的
组件归属、连接方式和排错原则。

## 组件归属

| 组件 | 推荐运行侧 | 原因 |
| --- | --- | --- |
| 仓库、npm、Metro、Gradle | WSL2 | 避免跨文件系统构建，并复用仓库内依赖。 |
| Linux Android SDK、NDK、CMake | WSL2 | Gradle 必须调用与 Linux ABI 匹配的工具链。 |
| Android Emulator、ADB server | Windows | 使用 Windows 虚拟化和图形环境。 |
| Maestro 与 JDK | Windows | Maestro 与模拟器观察同一个 Windows ADB server。 |

WSL2 与 Windows 必须各自安装适合本平台的 Android 工具。不能让 WSL Gradle 调用
Windows SDK 中的二进制，也不能假设 Linux Maestro 能自动发现 Windows ADB server。

## 可配置路径

机器相关路径只保存在 shell 环境或本地包装脚本中，不写入仓库。建议定义：

```bash
export ANDROID_HOME="<WSL 中的 Linux Android SDK>"
export ANDROID_SDK_ROOT="$ANDROID_HOME"
export WINDOWS_ADB="<Windows Android SDK 中 adb.exe 的 WSL 路径>"
export WINDOWS_JAVA="<Windows JDK 17 中 java.exe 的 WSL 路径>"
export WINDOWS_MAESTRO_HOME="<Windows Maestro 发行目录的 WSL 路径>"
```

Gradle 所需的 platform、build-tools、NDK 与 CMake 版本应从当前 React Native/Expo
依赖解析，不在本文复制一份易过期的版本表。安装完成后，以 `sdkmanager --list_installed`
和原生构建输出核对实际版本。

生成的 `src/app/android/local.properties` 可以记录本机 Linux SDK 位置。它位于整体被
忽略的原生生成目录中，不提交到 Git。

## 让 WSL 命令使用 Windows ADB

模拟器由 Windows ADB server 管理时，WSL 内的 Expo/Gradle 辅助命令也必须操作同一个
server。最直接的方式是在 PATH 前端放置本地 `adb` 包装脚本：

```bash
#!/usr/bin/env bash
set -euo pipefail

: "${WINDOWS_ADB:?Set WINDOWS_ADB to adb.exe}"
exec "$WINDOWS_ADB" "$@"
```

确认 `command -v adb` 指向包装脚本，并验证：

```bash
adb version
adb devices -l
```

若 WSL 可以稳定访问 Windows ADB server 的 TCP 监听地址，也可以配置
`ADB_SERVER_SOCKET`；但 Windows server 只监听 loopback 时，包装 `adb.exe` 更可靠。

## 让模拟器访问 WSL Metro

混合环境需要把模拟器的 Metro 请求跨过两层边界：

```text
Android 模拟器
  → Windows ADB reverse / Windows loopback
  → Windows 到 WSL 的 TCP 转发
  → WSL Metro :8081
```

Windows 到 WSL 的转发可以使用系统端口转发能力或任意受控 TCP relay。转发器应满足：

- Windows 侧只监听需要的本地接口与端口；
- 目标地址使用当前 WSL2 实例的 IP 和 Metro 端口；
- WSL2 IP 变化后重新配置或重启；
- 进程生命周期由开发者显式管理，不作为仓库服务。

启动 Metro 后建立设备反向端口：

```bash
adb reverse tcp:8081 tcp:8081
adb reverse --list
```

React Native 调试构建可通过 `metro.host` 系统属性指定 dev server 主机。该属性只填写
主机名，不附加端口，否则 React Native 会再次拼接端口：

```bash
adb root
adb shell setprop metro.host localhost
adb shell getprop metro.host
```

设置系统属性需要允许 root/setprop 的 userdebug 模拟器镜像。Play Store 镜像通常禁止
root；需要离线验收时，使用不含 Play Store 的 `google_apis` userdebug AVD。

## 让 Maestro 使用 Windows 运行时

Maestro 必须与 Windows 模拟器共享同一个 ADB 视图。若 WSL 中的 Linux Maestro 找不到
模拟器，从 WSL 调用 Windows JDK 17 和 Windows Maestro 发行包：

```bash
#!/usr/bin/env bash
set -euo pipefail

: "${WINDOWS_JAVA:?Set WINDOWS_JAVA to java.exe}"
: "${WINDOWS_MAESTRO_HOME:?Set WINDOWS_MAESTRO_HOME}"

windows_args=()
for argument in "$@"; do
  case "$argument" in
    -*) windows_args+=("$argument") ;;
    /*) windows_args+=("$(wslpath -w "$argument")") ;;
    *)  windows_args+=("$argument") ;;
  esac
done

exec "$WINDOWS_JAVA" \
  -classpath "$(wslpath -w "$WINDOWS_MAESTRO_HOME")\\lib\\*" \
  maestro.cli.AppKt "${windows_args[@]}"
```

本地包装脚本不提交。运行 `maestro --version` 和一个只读设备查询，确认它使用预期的
Windows JDK 与 ADB 环境。

## 构建与在线 E2E

从仓库应用目录执行：

```bash
cd src/app
npm run android
```

这会按 Expo CNG 配置生成被忽略的 Android 工程、构建 development APK 并安装到目标
设备。安装后确认包名和 Metro 连接，再运行：

```bash
adb reverse tcp:8081 tcp:8081
npm run test:e2e
```

完整套件必须覆盖新增、编辑、软删除和输入校验。Expo bundle export、Expo Go 或 Jest
不能替代这一设备验收。

## 离线验收

`adb reverse` 通过 ADB 通道连接 Metro，不依赖模拟器的外部网络，因此可以在 development
build 中验证 Local-First 行为：

1. 记录目标设备和当前网络状态。
2. 确认 `adb reverse --list` 包含 Metro 端口。
3. 禁用目标模拟器的 Wi-Fi 与移动数据。
4. 证明设备没有 active default network，且外部地址不可达。
5. 重跑覆盖创建、读取、编辑、软删除和汇总的 Maestro 流程。
6. 需要存储层证据时，从应用沙盒读取 SQLite 数据库及 WAL，并确认金额以整数分保存。
7. 无论成功或失败，都恢复原网络状态并再次确认。

Maestro flow 会使用 `clearState: true` 删除 Bookkeeping 应用数据。只在可丢弃数据的模拟器
或明确授权的测试设备上运行，不对其他应用或整个设备执行重置。

## 常见故障定位

### WSL 看不到模拟器

先比较 Windows `adb devices -l` 与 WSL `adb devices -l`。如果只有 Windows 能看到，
说明两侧连接了不同的 ADB server；修正包装脚本或 `ADB_SERVER_SOCKET`，不要反复重启
模拟器掩盖问题。

### 模拟器打不开 Metro

依次核对 WSL Metro 监听、Windows 到 WSL 的转发、`adb reverse --list` 和
`metro.host`。出现包含两个端口的非法 URL 时，检查 `metro.host` 是否错误地包含端口。

### Maestro 看不到模拟器

确认 Maestro 实际运行在 Windows JDK 上，并与 Windows `adb.exe` 使用同一 server。
路径参数从 WSL 传给 Windows 进程前必须用 `wslpath -w` 转换。

### Gradle 找不到或无法执行 Android 工具

确认 `ANDROID_HOME` 指向 Linux SDK，所需组件与当前 React Native/Expo 版本一致。
手工解压 NDK 时必须保留可执行位和符号链接；损坏的 NDK 应重新安装，不能只替换单个
编译器文件。

### 依赖下载不稳定

先诊断 DNS、代理和缓存，再重试官方工具。若必须手工下载，校验来源和完整性，并保持
SDK 目录结构、可执行位与符号链接；不要把下载物或本机 SDK 路径提交到仓库。

## 验收记录边界

稳定的方法和边界可以维护在本文。具体设备 ID、用户名、盘符、WSL IP、临时转发器路径、
单次测试时间和一次性日志属于本地验收记录，不进入当前状态文档。测试是否通过应记录在
对应 Issue、PR 或交付说明中，而不是把本文变成机器状态快照。
