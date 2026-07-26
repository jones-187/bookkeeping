# 仅保留原生本地持久化

## 状态

Accepted

## 背景

账目 MVP 的核心要求是可靠的 Local-First 记账。原有跨平台 `Database` 接口以 SQL 字符串为边界，使 Web IndexedDB 适配器需要解释部分 SQL；这既没有形成可靠的存储等价性，也扩大了需要维护和测试的持久化表面。Go 服务没有参与本地记账流程。

当前项目无人使用，也没有需要保留的生产数据，因此可以在不承担兼容成本的前提下重建本地 schema `v1`。

## 决策

- 账目 MVP 只支持 iOS 和 Android。
- 账目数据只使用原生 `expo-sqlite` 持久化。
- 删除 Web IndexedDB、通用 SQL `Database` 接口和 Go 服务，不保留兼容适配器。
- SQLite schema 通过显式、可测试的事务迁移创建；本次重建从 schema `v1` 开始。

本 ADR 替代 [客户端本地持久化方案](0002-client-persistence.md)。

## 后果

- 本地账目读写只有一个事实来源和一套可由真实 SQLite 验证的语义。
- 应用缩小到明确交付的原生平台，Web 不再是隐含或辅助运行目标。
- 不再维护 SQL 到 IndexedDB 的行为映射，也不再维护无消费者的 HTTP 服务。
- 若未来重新引入 Web、同步或服务端，它们必须通过新的 ADR 重新评估 Local-First、不丢数据和跨存储一致性的成本。
