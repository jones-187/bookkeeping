# 贡献指南

## 准备环境

先完成[开发环境设置](docs/engineering/setup.md)，再阅读 [AGENTS.md](AGENTS.md) 和[工程不变量](docs/engineering/invariants.md)。

## 变更流程

1. 从 `main` 创建只解决一个逻辑关注点的分支。
2. 确认对应 issue；非平凡功能还必须有 accepted spec。
3. 随行为变化添加或更新测试。
4. 运行 lint、相关测试和文档检查。
5. 在同一变更中更新受影响的当前状态文档。

建议分支名前缀：

- `feature/`
- `fix/`
- `docs/`
- `refactor/`

建议提交前缀：

- `feat:`
- `fix:`
- `docs:`
- `refactor:`
- `test:`
- `chore:`

## 提交前检查

```bash
make lint
make test
bash scripts/check-docs.sh
```

原生用户流程发生变化时还要运行相关 Maestro 流程，详见 [E2E 测试说明](tests/e2e/README.md)。

## 文档影响

每个 PR 都应明确回答“Documentation impact”。按[文档治理规则](docs/DOCUMENTATION.md)判断需要更新的文档；没有影响时说明原因。

## 高风险变更

金额、数据库迁移和 Local-First 数据流属于高风险区域。此类变更必须：

- 保持范围专注
- 列出受保护的不变量
- 覆盖边界和回归场景
- 明确已有数据的迁移与恢复路径
