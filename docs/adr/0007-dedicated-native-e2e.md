# 独立原生构建与状态隔离

## 状态

Accepted

## 背景

原生端 E2E 必须验证应用自己的 bundle identifier、SQLite 文件和导航行为。原有流程依赖 Expo Go、深层链接和仅为测试存在的重置入口，使测试运行时与交付应用不同，也把测试协议带进生产导航。

每个流程还需要可重复的初始数据状态。当前没有需要保留的测试设备数据，因此可以让 E2E 工具清除应用沙盒，而不在产品代码中维护重置后门。

## 决策

- Maestro 只针对 bundle identifier / package 均为 `com.jones187.bookkeeping` 的原生 development build 运行。
- 每个独立流程使用 `launchApp.clearState` 清除应用沙盒后再启动，不使用 Expo Go、深层链接或应用内测试重置入口。
- Jest 负责快速验证 Ledger 契约、真实 SQLite 查询与迁移以及界面行为；Maestro 只覆盖新增、编辑、删除和关键输入边界的原生用户流程。
- 当前 GitHub Actions 没有设备运行环境，因此执行 Jest、静态检查和双平台 bundle 导出；Maestro 由具备模拟器或真机的环境执行。

本 ADR 替代 [原生端 E2E 验收](0004-native-e2e-testing.md)。

## 后果

- E2E 运行对象与实际原生应用具有相同的应用标识和本地存储边界。
- 产品导航和业务代码不包含测试专用重置协议。
- 各流程相互独立，但 `clearState` 会删除目标应用在设备上的全部本地数据，因此不得在需要保留数据的安装上运行。
- CI 能证明 TypeScript、测试和 Android/iOS bundle 可构建；真实设备行为仍需在安装 development build 的环境中验收。
