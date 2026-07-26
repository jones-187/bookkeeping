# 文档治理

## 原则

### 按问题确定唯一来源

文档不是进度数据库。当前事实、稳定知识、构建合同、工作状态和历史记录分别管理，不能在多个文件中复制同一份内容。

| 信息 | 权威来源 |
|---|---|
| 当前行为和精确实现 | 代码、测试、schema、接口定义 |
| 当前系统的解释 | `docs/architecture/`、`docs/api/`、`docs/engineering/` |
| 领域语言 | `CONTEXT.md` |
| 稳定产品方向 | `docs/product/vision.md` |
| 难以逆转的决策及理由 | `docs/adr/` |
| 准备构建的行为合同 | `docs/specs/` |
| 未知问题、任务、状态和阻塞关系 | Issue Tracker |
| 已实现和已发布的用户可见历史 | `CHANGELOG.md` |

信息冲突时，先按问题找到对应权威来源；不要用旧 spec、已关闭 issue 或历史 ADR 覆盖当前代码事实。

### Git 是历史档案

过期计划和被替代的说明直接删除，不建立 `archive/`、`legacy/` 或“旧版文档”目录。需要追溯时使用 Git 历史。ADR 是例外：真实的 accepted 决策被替代后仍保留，并明确指向替代它的新 ADR。

### 只创建有内容的文档

没有真实内容时不创建目录、模板或占位 README。研究、handoff 和 prototype 是临时工作资产；只有会长期帮助维护代码的结论才进入正式文档。

## 文档类型

### 当前状态文档

`README.md`、architecture、engineering 和 API 文档始终描述当前实现，允许随代码直接编辑。禁止包含未来组件、开发排期或“计划中”的接口。

### 领域词汇

`CONTEXT.md` 只包含已经确认的领域概念、边界和关系。实现字段、UI、技术选型和开放问题不得写入。术语确定后立即更新，不按批次补录。

### ADR

只有同时满足以下条件才创建 ADR：

1. 改变决定的成本显著；
2. 缺少上下文会令维护者困惑；
3. 存在真实替代方案和权衡。

ADR 文件名使用四位序号和英文 kebab-case，例如 `0005-sync-authority.md`。正文必须包含：

```markdown
# 决策名称

## 状态

Proposed | Accepted | Superseded | Rejected

## 背景
## 决策
## 后果
```

Accepted 后不重写背景、决策和后果，只允许修正文字或增加替代关系。新决定通过新 ADR 替代旧 ADR。

### Spec

大型、模糊工作先通过 Wayfinder 解决决策；较小功能通过带文档的设计访谈解决。问题清空后才创建 spec。

Spec 文件名使用功能名，例如 `account-and-category-management.md`，并包含：

```markdown
# 功能名称

## 状态

Draft | Accepted | Implemented | Superseded

## 来源
## Outcome
## Non-goals
## Domain model impact
## User-visible behaviour
## Data and migration
## Interfaces
## Failure and recovery
## Acceptance criteria
## Open questions
```

`Open questions` 非空时不能进入 Accepted。Accepted 后才能拆实现 tickets。Implemented 后冻结；后续行为变化建立新 spec，并用 Superseded 关系连接。

### Issue Tracker 和 Wayfinder

Issue Tracker 是所有未来工作的唯一状态来源：

- Wayfinder map 管理大范围探索的 destination、已完成决策、fog 和 scope。
- Wayfinder child ticket 每次解决一个决策或决策前置工作。
- Accepted spec 通过实现 tickets 交付。
- assignee 表示认领，原生 blocking 关系表示依赖。

仓库内禁止建立 map、ticket 或状态列表的镜像。文档可以链接 issue，但不能复制它的进度。

GitHub 的具体标签、父子关系、dependency、frontier 和 claim 操作见 [Issue Tracker](engineering/issue-tracker.md)。

### CHANGELOG

只记录已经实现的用户可见变化。`Unreleased` 保存已完成但尚未发布的变化，不得包含“计划中”条目。测试数量、提交哈希和预测日期不属于变更记录。

## 更新触发条件

| 发生变化 | 必须复审 |
|---|---|
| 启动方式、依赖或工具链 | `README.md`、`docs/engineering/setup.md` |
| 领域含义 | `CONTEXT.md` |
| 模块边界、数据流或存储模型 | architecture、code map；必要时 ADR |
| 金额、迁移、同步或时区约束 | engineering invariants |
| HTTP 接口 | API 文档 |
| 用户可见行为 | 对应 spec、测试、CHANGELOG |
| 测试策略或命令 | engineering testing、局部测试 README |

每个 PR 必须说明 Documentation impact。没有影响时写明理由，不通过复制“无需更新”模板代替判断。

## 写作和结构

- 叙述使用中文；代码符号、命令和标准名称保持原文
- 文件名使用英文 kebab-case
- 一个文件只回答一类问题
- 使用相对链接，不复制其他文档正文
- 不写手工“最后更新”日期；Git 提供时间
- 不记录易过期的测试数量、提交哈希或未来日期
- 不使用 emoji 表示状态；ADR、spec 和 issue 状态必须是机器可检查的文本

## 自动检查

从仓库根运行：

```bash
bash scripts/check-docs.sh
```

CI 使用同一命令检查入口文件、禁止的计划文件、内部链接以及 ADR/spec 状态。
