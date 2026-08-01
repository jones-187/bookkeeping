# Ledger 设计评审记录

## 结论

当前 `Ledger` 是正确的深模块边界，不需要推倒重构。它以很小的公开契约封装金额解析、日期校验、软删除、迁移、SQLite 查询、事务和一致快照；界面只依赖该契约。[公开契约](../../src/app/src/ledger/contract.ts)、[实现](../../src/app/src/ledger/internal/createLedger.ts) 与 [已接受的边界决策](../adr/0006-deep-ledger-module.md) 彼此一致。

因此不应重新引入 `Repository`、`Service`、`Store` 或面向应用其他模块的通用 `Database`。这类纯转发层会再次暴露持久化细节，却不能减少账本规则本身的复杂度。`SqliteConnection` 仍是 Ledger 内部为原生适配器和真实 SQLite 契约测试保留的 seam，而非 UI 或其他业务模块的接口。[容器边界](containers.md) 与 [数据模型](data-model.md) 已记录这一所有权。

本次发现的是在现有边界内演进时必须正视的设计压力，不是需要另建架构层的理由。

## 当前实现事实

### 持久化身份与 schema 版本

原生装配把数据库文件名固定为 `bookkeeping-native-v1.db`，而 schema 版本由 `ledger_schema` 和迁移实现单独维护。[原生装配](../../src/app/src/ledger/native.ts)、[迁移实现](../../src/app/src/ledger/internal/migrations.ts)；这一事实也见于[系统上下文](context.md)和[工程不变量](../engineering/invariants.md)。

文件名是设备上既有数据的身份，而不是 schema 版本号。当前名称把两者耦合：一旦 schema 升级，改文件名会打开另一份空数据库，不能构成对既有条目的迁移。schema 演进的决策触发条件是需要保留已有本地数据的 schema 变化；届时必须保持数据库身份稳定，并在同一文件内经 `ledger_schema` 执行显式、可测试的迁移。该约束来自[数据完整性不变量](../engineering/invariants.md)和[原生账目规格](../specs/native-ledger-mvp.md)的本地持久化模型。

### 编辑操作的忙状态

`EditEntryScreen` 以 `idle`、`saving`、`deleting` 表达单一写入过程，并将该状态交给编辑表单；保存、删除、取消、重复操作和全部可编辑控件由同一状态协调。[表单实现](../../src/app/src/ledger/ui/EntryForm.tsx)、[编辑页面](../../src/app/src/ledger/ui/EditEntryScreen.tsx)。保存或删除失败后状态回到 `idle`，既有错误提示保留，页面可继续操作。

这一状态属于 UI 交互协调，不进入 Ledger 领域边界。Ledger 仍只负责每次写入的原子性与规则校验。

### 条目规模与读取路径

`snapshot()` 在一个 SQLite 事务内读取全部未删除条目，映射为 `entries` 后在 JavaScript 中计算汇总；列表页面以 `ScrollView` 和 `entries.map` 渲染全部条目。[快照实现](../../src/app/src/ledger/internal/createLedger.ts)、[列表页面](../../src/app/src/ledger/ui/LedgerListScreen.tsx)。这满足当前“列表与汇总来自同一快照”的要求。[工程不变量](../engineering/invariants.md)

该路径的成本随条目数同时增加在 SQLite 结果传输、JavaScript 汇总和 React Native 全量渲染三个位置。决策触发条件是账目规模或实际设备上的读取、滚动体验开始使全量快照不再可接受；届时读取接口仍须由 Ledger 对外提供，并保持条目与汇总观察同一数据视图。不能把 SQL、分页或汇总规则移回界面层。

### 公共金额单位

`LedgerEntry.amount`、`LedgerSummary.totalIncome`、`totalExpense` 和 `balance` 在公开契约中均为普通 `number`。[Ledger 契约](../../src/app/src/ledger/contract.ts) 实际实现将它们作为整数分解析、存储和累加。[金额解析与汇总](../../src/app/src/ledger/internal/createLedger.ts)、[迁移约束](../../src/app/src/ledger/internal/migrations.ts)。

现有不变量已经保证数值正确，但公开字段名没有携带单位，调用者须依赖上下文才能知道它们是分。决策触发条件是 Ledger 外出现第二个金额运算者、其他货币最小单位，或接口被更广泛复用；届时单位须成为公开类型或字段命名中不可忽略的语义。无论表达方式如何，输入边界仍传递原始十进制字符串，领域与持久化仍使用整数最小单位。[金额不变量](../engineering/invariants.md)

### Expo CNG 的原生目录归属

仓库采用 Expo CNG：[app.json](../../src/app/app.json) 是受版本控制的原生应用身份与平台配置权威输入，`src/app/android/` 和 `src/app/ios/` 是整体被 Git 忽略的可再生成本地产物。[原生工程归属决策](../adr/0008-expo-cng-native-project-ownership.md)、[开发环境](../engineering/setup.md)。

`npm run android` 与 `npm run ios` 分别通过 `expo run:android` 和 `expo run:ios` 生成、构建并安装 development build；仓库不保存原生自定义代码、原生签名材料或生成工程。设备安装与 Maestro 验收仍需要具备对应原生工具链和模拟器或真机的环境。

### 交付验证边界

GitHub Actions 执行类型检查、lint、Jest 和 `npm run build`。[CI 工作流](../../.github/workflows/ci.yml) 后者仅通过 `expo export --platform android|ios` 导出 bundle，而不是安装或运行原生应用。[构建脚本](../../src/app/package.json)。Maestro 流程的定义要求已安装的 dedicated development build 和运行中的模拟器或设备。[端到端测试说明](../../tests/e2e/README.md)；当前 CI 没有执行这些流程，这也是[原生 E2E 决策](../adr/0007-dedicated-native-e2e.md)明确的边界。

所以当前 CI 证明 JavaScript/TypeScript、测试和双平台 bundle 导出，不能证明原生 APK/IPA 构建、安装、SQLite 原生运行或设备交互。决策触发条件是交付声明需要覆盖这些原生行为；届时验证环境必须实际构建、安装并运行目标平台的流程，而不能把 bundle export 当作设备验收。

## 不可破坏的约束

- `Ledger` 继续是账目业务与存储协调的唯一公开边界；UI 不接触 SQL、迁移、行类型或平台存储 API。[系统上下文](context.md)
- 金额输入保持十进制字符串，解析、持久化和汇总保持安全整数分；收入和支出的方向不由金额正负号表示。[工程不变量](../engineering/invariants.md)、[领域词汇](../../CONTEXT.md)
- 删除保持软删除，常规读取、更新和汇总排除已删除条目；schema 变化经显式事务迁移，不能以远程成功为前提。[迁移实现](../../src/app/src/ledger/internal/migrations.ts)、[工程不变量](../engineering/invariants.md)
- `snapshot()` 的列表和汇总必须来自同一个一致读取，不能为了性能把它们拆成可观察到不同状态的独立请求。[原生账目规格](../specs/native-ledger-mvp.md)
- 本地读写继续离线可用。当前没有后台写入、同步、备份或多人协作；在这些条件实际出现前，不需要版本号、冲突检测或冲突解决模型。[原生账目规格](../specs/native-ledger-mvp.md)
