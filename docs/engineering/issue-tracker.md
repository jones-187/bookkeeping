# Issue Tracker

本项目使用 [GitHub Issues](https://github.com/jones-187/bookkeeping/issues) 管理所有尚未完成的决策和工作。仓库文档不保存平行的进度列表。

## 基本约定

- issue 标题必须能独立表达问题或结果；在人类可读内容中用标题链接引用，不用裸编号代替名称
- open/closed 表示工作是否完成
- assignee 表示当前认领者
- GitHub 原生 sub-issue 表示父子关系
- GitHub 原生 issue dependency 表示 blocked by / blocking
- issue 正文保存问题或交付合同，讨论和 resolution comment 保存过程与结果

GitHub 官方支持 sub-issues 和 issue dependencies；GitHub CLI 的 `gh issue create`、`gh issue edit` 和 `gh issue view` 可以管理这些关系：

- [Sub-issues](https://docs.github.com/en/issues/tracking-your-work-with-issues/using-issues/adding-sub-issues)
- [Issue dependencies](https://docs.github.com/en/issues/tracking-your-work-with-issues/using-issues/creating-issue-dependencies)
- [GitHub CLI issue commands](https://cli.github.com/manual/gh_issue)

## 初始化

安装并登录当前版本的 GitHub CLI 后，从仓库根运行：

```bash
bash scripts/setup-tracker.sh
```

合并到 `main` 时，[Configure issue tracker](../../.github/workflows/configure-tracker.yml) workflow 也会运行同一脚本；需要重新同步标签时可手动触发该 workflow。

脚本幂等创建 Wayfinder 所需标签：

| 标签 | 用途 |
|---|---|
| `wayfinder:map` | 一项大型探索的 canonical map |
| `wayfinder:research` | 外部事实研究 |
| `wayfinder:prototype` | 通过粗糙产物提高讨论清晰度 |
| `wayfinder:grilling` | 与用户共同解决决策 |
| `wayfinder:task` | 决策前必须完成的手工工作 |

## Wayfinding operations

### 创建 map

```bash
gh issue create \
  --repo jones-187/bookkeeping \
  --title "<map title>" \
  --label "wayfinder:map" \
  --body-file <map-body.md>
```

Map 正文只包含 `Destination`、`Notes`、`Decisions so far`、`Not yet specified` 和 `Out of scope`。Open tickets 通过 sub-issues 查询，不复制进 map。

### 创建 child ticket

```bash
gh issue create \
  --repo jones-187/bookkeeping \
  --parent <map-number-or-url> \
  --title "<decision title>" \
  --label "wayfinder:<type>" \
  --body-file <ticket-body.md>
```

Ticket 正文只陈述：

```markdown
## Question

<本票据需要解决的问题>
```

### 设置阻塞关系

所有 tickets 创建完成后再进行第二遍 wiring：

```bash
gh issue edit <blocked-ticket> \
  --repo jones-187/bookkeeping \
  --add-blocked-by <blocker-ticket>
```

不要用正文中的 `Depends on` 文本替代原生关系。

### 查询 map 和 frontier

列出 open maps：

```bash
gh issue list \
  --repo jones-187/bookkeeping \
  --state open \
  --label "wayfinder:map"
```

加载 map 的低分辨率视图和 children：

```bash
gh issue view <map> \
  --repo jones-187/bookkeeping \
  --json title,body,url,subIssues
```

检查某个 child 的认领与阻塞状态：

```bash
gh issue view <ticket> \
  --repo jones-187/bookkeeping \
  --json title,state,assignees,blockedBy,url
```

Frontier 是 map 的 open sub-issues 中同时满足以下条件的 tickets：

- `assignees` 为空
- `blockedBy` 为空，或其中每个 issue 都已 closed

### 认领

任何工作开始前先认领：

```bash
gh issue edit <ticket> \
  --repo jones-187/bookkeeping \
  --add-assignee "@me"
```

### 记录 resolution

把答案作为 resolution comment 发布，再关闭 ticket：

```bash
gh issue comment <ticket> \
  --repo jones-187/bookkeeping \
  --body-file <resolution.md>

gh issue close <ticket> \
  --repo jones-187/bookkeeping \
  --reason completed
```

随后更新 map 的 `Decisions so far`，只添加一行标题链接和结论 gist。详细答案只留在 ticket。

### Scope 变化

- 新问题已经能精确陈述：创建 child ticket，再 wiring
- 仍不能精确陈述：保留在 `Not yet specified`
- 超出 destination：关闭对应 ticket，并以标题链接记录到 `Out of scope`
- 决策使其他 ticket 失效：立即更新或关闭，不让失效票据停留在 frontier

## 实现 tickets

Wayfinder 清空后先产出 accepted spec，再从 spec 建立实现 tickets。实现 ticket 至少链接 spec，并包含：

- 可观察的 outcome
- acceptance criteria
- blockers
- verification
- documentation impact

完成状态只在 issue 中维护；spec 不承担进度跟踪。
