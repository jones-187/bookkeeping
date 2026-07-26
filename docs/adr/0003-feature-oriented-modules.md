# 按功能组织应用模块

## 状态

Superseded

已由 [ADR 0006：深层 Ledger 模块](0006-deep-ledger-module.md) 替代。

## 背景

随着账目条目的 UI、状态、业务规则和持久化逻辑增加，单纯按技术类型放置全部文件会让一次功能变更跨越许多无关目录，也容易产生不清晰的横向依赖。

完整 DDD 分层会给当前规模带来过多结构；完全扁平的目录又无法表达功能边界。

## 决策

应用代码按功能模块组织：

- 功能内的 screen、component、hook、store、service、repository 和 type 放在同一 feature 下
- feature 可以依赖 shared；shared 不得反向依赖 feature
- feature 之间不得直接依赖对方的内部实现
- 账目功能使用独立 Zustand store 管理 UI 状态和异步动作

## 后果

- 一项功能的大部分变更保持局部
- shared 必须只承载真正跨功能、语义稳定的能力
- 新功能不能以方便为由直接导入其他 feature 内部文件
- 目录层级增加，但换取了更清晰的依赖方向和测试边界
