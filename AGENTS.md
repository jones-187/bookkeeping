# Agent 工作指南

## 使命

- 构建具有高金融正确性的 Local-First 记账应用
- 保持核心记账流程离线可用
- 用小型、可测试、可回滚的变更演进代码库
- 让代码、测试和当前状态文档在同一变更中保持一致

## 开始工作前

所有任务先阅读：

- [领域词汇](CONTEXT.md)
- [代码地图](docs/engineering/code-map.md)

按变更范围继续阅读：

| 变更范围 | 必读文档 |
|---|---|
| 金额、汇总、数据库或迁移 | [工程不变量](docs/engineering/invariants.md) |
| 模块边界、数据流或运行单元 | [架构文档](docs/architecture/context.md) |
| HTTP 接口 | [HTTP API](docs/api/http-api.md) |
| 测试基础设施 | [测试策略](docs/engineering/testing.md) |
| Issue、blocking 或 Wayfinder | [Issue Tracker](docs/engineering/issue-tracker.md) |
| 非平凡产品行为 | 对应 accepted spec；没有 spec 时先完成设计流程 |

## 强制约束

### 金额

- 目标不变量是持久化和领域运算使用整数最小货币单位；人民币当前使用“分”
- 不得在领域层引入基于浮点数的金额累计、比较或持久化
- 输入解析、舍入、负数、零值和上限必须有边界测试
- 当前 UI/Service 输入边界及 Web 存储仍有已知偏差，见[工程不变量](docs/engineering/invariants.md)；修改相关路径时不得扩大偏差

### Local-First

- 本地记账不能依赖 Go 服务可用
- 同步、备份或远程错误不能阻塞本地读写
- 不得把尚未实现的远程系统写成当前架构

### 数据完整性

- 删除账目条目使用软删除，普通查询排除已删除记录
- Schema 变化必须通过显式、可测试的版本迁移
- 迁移和回填不得依赖远程服务成功
- 任何可能破坏已有本地数据的变更必须先明确迁移和恢复策略

### 文档

- 叙述性文档使用中文，代码符号、命令和标准名称保持原文
- 未来工作只进入 Issue Tracker；禁止新增 Roadmap、Backlog、TODO 或 Plan 文件
- 当前状态文档只描述已实现事实
- 遵循 [文档治理规则](docs/DOCUMENTATION.md)

## 工作协议

1. 确认 issue/spec 的范围、阻塞关系和验收标准。
2. 读取相关代码、测试和文档，不能用旧计划推断当前事实。
3. 为行为变化先建立失败测试，再实现最小切片。
4. 运行相关测试、lint 和文档检查。
5. 更新受影响的当前状态文档；需要时添加 ADR。
6. 在交付说明中记录验证结果、已知限制和未解决风险。

## 常用命令

```bash
make setup
make run-app
make run-server
make lint
make test
bash scripts/check-docs.sh
```

原生 E2E 测试见 [tests/e2e/README.md](tests/e2e/README.md)。

## 完成定义

- 验收行为正确
- 相关自动化测试覆盖并通过
- 金额、迁移和 Local-First 不变量未被破坏
- 相关当前状态文档已同步更新
- 没有把未来计划写入 README、架构或参考文档
- 未完成工作留在 Issue Tracker，而不是仓库内的临时计划文件
