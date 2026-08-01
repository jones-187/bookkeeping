# Expo CNG 原生工程归属

## 状态

Accepted

## 背景

应用的 Expo 配置、原生工程目录和开发命令此前没有明确的所有权关系。仓库只忽略了原生工程内部的部分构建产物，无法表达 `android/` 与 `ios/` 本身可以被删除并重新生成这一事实；而 `npm run android` 与 `npm run ios` 只启动通用 Expo 开发服务器，不能稳定地表达 dedicated development build 的生成和安装入口。

原生工程可以有两种真实归属：把 `android/` 与 `ios/` 作为手工维护源码提交，或把它们作为 Expo 配置生成的本地产物。当前应用没有受版本控制的原生自定义代码、原生签名材料或必须直接审查的原生工程改动，配置生成模式能保持更小的受维护输入和更清晰的恢复路径。

## 决策

- `src/app/app.json` 是受版本控制的 Expo 配置，也是当前原生应用身份与平台配置的权威输入。
- 采用 Expo CNG；`src/app/android/` 和 `src/app/ios/` 由 Expo 生成，是可重新生成的本地产物，整个目录被 Git 忽略，不提交到仓库。
- `src/app` 的 `npm run android` 和 `npm run ios` 分别执行 `expo run:android` 和 `expo run:ios`，作为生成、构建并安装 dedicated development build 的平台入口。
- 当前仓库不保存原生自定义代码、debug keystore、APK、IPA、Pods 或 release signing 材料。

## 后果

- 原生工程目录可以在本地生成、删除和再次生成，Git 状态只反映 Expo 配置及其他受版本控制输入的变化。
- Android/iOS 的应用身份继续集中在 `app.json`，开发者使用平台命令时不依赖 Expo Go 作为运行目标。
- Native build 的设备安装和 Maestro 验收仍需要具备模拟器或真机的环境；CI 当前继续验证类型、lint、Jest 和双平台 bundle export，不把 bundle export 当作设备验收。
