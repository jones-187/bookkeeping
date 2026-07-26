# 关键不变量

以下约束包含必须保持的目标不变量和当前实现边界。修改相应代码时不能把已知边界误写成已经完全满足的保证。

## 金额与账目条目

- 表单和服务输入的金额单位是元；`LedgerEntryService` 在写入仓储前通过 `Money.fromYuan` 转为分。
- 目标不变量是 `ledger_entries.amount` 始终为正整数分。SQLite 表以 `CHECK(amount > 0)` 拒绝零值和负值，服务通常通过舍入生成整数分。
- 汇总在分单位上使用 `Money` 运算；收入、支出和结余不得改用浮点累计。
- 服务层拒绝非有限数、非正金额和大于 1,000,000 元的金额。
- 描述写入前会去除首尾空白，且不能为空、长度不得超过 500 个字符。

当前输入边界仍以 JavaScript `number` 表示“元”，`Money.fromYuan` 和 `Money.parse` 也经过浮点解析。这意味着“金额全链路不经过浮点”尚未成立。触及该边界时应优先改为确定性的十进制字符串解析，并用回归测试固定舍入行为。

服务在舍入前检查金额大于 0，因此 `0 < amount < 0.005` 元的输入可以通过校验并变成 0 分。SQLite 会拒绝该写入，IndexedDB 当前不会。这是已知的平台差异；相关变更必须覆盖亚分输入，并在两个存储适配器上验证结果。

## 账目条目可见性与时间

- 删除账目条目会写入 `deleted_at`，不会物理删除该记录。
- 仓储的按 ID 查询、列表和计数均排除 `deleted_at` 非空的记录；更新同样只作用于未删除记录。
- `date` 输入必须匹配 `YYYY-MM-DD`，能够被 JavaScript `Date` 解析，且不得晚于当前日期。
- 创建和更新时由仓储写入 ISO 8601 格式的 `created_at`、`updated_at`；创建的记录从未删除状态开始。

## 持久化实现

- 原生端通过 `schema_version` 表按版本顺序执行 SQLite 迁移；迁移成功后才记录版本。
- Web 端使用 IndexedDB 的 `ledger_entries` 和 `schema_version` 对象存储，并保持与 `Database` 接口相同的调用形状。
- 数据库选择由 `Platform.OS` 决定：Web 使用 IndexedDB，其他平台使用 SQLite。

`Database` 接口只统一调用形状，不保证当前实现已经具有完整语义等价性：

- IndexedDB 对象存储不执行 SQLite 的 `CHECK` 约束
- 类型索引查询当前可能绕过组合条件中的软删除和日期过滤
- 日期范围条件当前没有在 Web 过滤器中实现
- Web SQL 解析器当前没有实现 `COUNT(*)` 聚合
- Web update 不独立执行 `deleted_at IS NULL` 条件

触及金额、筛选、软删除或更新路径时，必须分别测试原生和 Web 适配器，不能只运行共享 repository 测试后推断平台一致。

## 应用状态与测试重置

- 创建、更新和删除成功后，`ledgerStore` 会重新读取列表和汇总，避免界面继续显示旧数据。
- 重置深层链接仅在 `__DEV__` 为真时处理，并将导航重置到账目列表页。
- Maestro 流程通过重置流程建立干净数据状态；具体方式见 [端到端测试说明](../../tests/e2e/README.md)。

## HTTP 契约

- `GET /healthz` 返回 HTTP 200 和 `status: "ok"`。
- `GET /api/v1/bootstrap` 返回服务状态、服务名、版本、RFC3339 格式的 UTC 服务时间和功能标记。
- 服务端默认监听端口为 `8080`；`PORT`、`SERVICE_NAME` 与 `APP_VERSION` 可覆盖对应配置。
