# 待办事项清单

> 创建时间: 2026-04-05
> 状态: 进行中

## 当前状态

| 项目 | 状态 | 备注 |
|------|------|------|
| Feature-Slice 架构迁移 | ✅ 完成 | 已迁移 ledger 功能模块 |
| Zustand 状态管理 | ✅ 完成 | ledgerStore 已实现 |
| 单元测试 | ✅ 107/107 通过 | |
| E2E 测试 | ⚠️ 37/39 通过 | 2个编辑测试失败 |
| TypeScript 编译 | ✅ 通过 | |
| 设计文档 | ⚠️ 需要更新 | 架构已实现，文档未同步 |

---

## 待办事项

### 1. 🐛 修复 E2E 测试 Bug

**优先级**: 高
**状态**: 待处理

**问题描述**:
2个编辑相关的测试失败：
- `persistence.spec.ts >> 编辑类型后刷新页面，类型应该正确`
- `persistence.spec.ts >> 编辑日期后刷新页面，日期应该正确`

**错误信息**:
```
TimeoutError: locator.waitFor: Timeout 15000ms exceeded.
Call log:
  - waiting for getByTestId('add-entry-fab') to be visible
    35 × locator resolved to hidden
```

**分析**:
- `EntryFormPage.submit()` 等待 FAB 按钮出现超时
- 编辑表单提交后没有正确返回列表页
- 页面快照显示仍在编辑页面，表单显示验证错误

**相关文件**:
- `src/app/e2e/pages/EntryFormPage.ts` - Page Object
- `src/app/e2e/specs/persistence.spec.ts` - 测试文件
- `src/app/e2e/fixtures/test.ts` - 测试 fixture

---

### 2. 📝 更新设计文档

**优先级**: 中
**状态**: ✅ 已完成 (2026-04-05)

**已完成的事情**:

- [x] 创建 ADR-004: Feature-Slice 架构模式 (`docs/adr/ADR-004-feature-slice-architecture.md`)
- [x] 更新 ADR 索引 (`docs/adr/README.md`)
- [x] 更新 app README (`src/app/README.md`)
- [x] 标记计划文档为已完成 (`.claude/plans/shiny-honking-cloud.md`)

---

### 3. 🔍 架构检查

**优先级**: 低
**状态**: 待处理

**检查项**:

- [ ] 确认所有模块边界清晰
- [ ] 确认 feature 之间没有相互依赖
- [ ] 确认 shared 层没有业务逻辑
- [ ] 确认公开 API (index.ts) 导出正确

---

## 已完成

### Feature-Slice 架构迁移

**完成时间**: 2026-04-05

**已迁移内容**:
- `src/app/src/features/ledger/` - 账目功能模块
  - `components/` - EntryForm, EntryItem, SummaryCard
  - `screens/` - LedgerListScreen, AddEntryScreen, EditEntryScreen
  - `stores/` - ledgerStore (Zustand)
  - `services/` - LedgerEntryService
  - `repositories/` - LedgerEntryRepository
  - `types/` - ledger.types.ts
  - `hooks/` - useEntry
  - `index.ts` - 公开 API

- `src/app/src/shared/` - 共享资源
  - `db/` - 数据库抽象层
  - `types/` - 通用类型

- `src/app/src/navigation/` - 路由配置
  - `AppNavigator.tsx`
  - `features/ledgerNavigator.tsx`
  - `routes.ts`
  - `types.ts`

---

## 相关文件

| 文件 | 用途 |
|------|------|
| `.claude/plans/shiny-honking-cloud.md` | Feature-Slice 架构设计文档 |
| `src/app/e2e/test-results/` | E2E 测试失败详情 |
| `docs/adr/` | 架构决策记录目录 |
