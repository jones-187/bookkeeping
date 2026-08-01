# 系统上下文

Bookkeeping 是一款本地优先的记账应用。用户在 iOS 或 Android 的 Expo / React Native 应用中创建、查看、更新和软删除账目条目；账目条目只保存在运行应用的设备中。

```mermaid
flowchart LR
    user[用户] --> app[Bookkeeping 应用\nExpo / React Native]
    app -->|本地读写| ledger[Ledger]
    ledger --> sqlite[(SQLite\nbookkeeping-native-v1.db)]
```

## 边界与职责

| 元素 | 当前职责 |
| --- | --- |
| 用户 | 通过应用维护收入和支出账目条目。 |
| Bookkeeping 应用 | 装配 Ledger 并提供账目界面。 |
| Ledger | 校验精确金额与日期、维护软删除可见性，并返回列表与汇总一致的快照。 |
| SQLite | iOS 与 Android 上的持久化存储，数据库文件名为 `bookkeeping-native-v1.db`。 |

账目读写不依赖网络或远程进程。应用的组合根创建原生 Ledger；对外只暴露 [Ledger 契约](../../src/app/src/ledger/contract.ts)，SQLite 连接、迁移和行映射均为该模块内部实现。

## Expo 原生工程归属

`src/app/app.json` 是受版本控制的 Expo 配置，也是当前原生应用身份和平台配置的权威输入。项目采用 Expo CNG；`src/app/android/` 与 `src/app/ios/` 是由该配置生成、整体被 Git 忽略的本地产物，不作为手工维护的源码提交。详细决策见 [Expo CNG 原生工程归属](../adr/0008-expo-cng-native-project-ownership.md)，开发命令见 [开发环境](../engineering/setup.md)。
