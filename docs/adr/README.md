# 架构决策记录 (ADR)

## 什么是 ADR？

ADR (Architecture Decision Records) 是记录重要架构决策的轻量级文档。每个决策记录包含：

- **上下文 (Context)**：为什么要做这个决定
- **决策 (Decision)**：具体做了什么
- **后果 (Consequences)**：带来的好处和牺牲

## 为什么需要 ADR？

作为独立开发者，最怕的是"三个月后忘了为什么选这个方案"。ADR 是你的"大脑备份"，让你能快速找回当时的思维逻辑。

## ADR 列表

| 编号 | 标题 | 状态 | 日期 |
|------|------|------|------|
| [ADR-001](./ADR-001-local-first-architecture.md) | Local-First 架构决策 | 已采纳 | 2026-03-16 |
| [ADR-002](./ADR-002-tech-stack-selection.md) | 技术栈选型 | 已采纳 | 2026-03-16 |
| [ADR-003](./ADR-003-sqlite-library.md) | SQLite 库选型 | 已采纳 | 2026-03-31 |
| [ADR-004](./ADR-004-feature-slice-architecture.md) | Feature-Slice 架构模式 | 已采纳 | 2026-04-05 |

## ADR 模板

```markdown
# ADR-XXX: [决策标题]

## 状态

[已提议 | 已采纳 | 已废弃 | 已替代]

## 上下文

描述导致此决策的情况和问题。

## 决策

描述所做的决策及其理由。

## 后果

### 正面影响
- 影响 1
- 影响 2

### 负面影响
- 影响 1
- 影响 2

## 参考

- 相关链接和资料
```
