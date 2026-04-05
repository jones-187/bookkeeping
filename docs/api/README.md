# API 文档

最后更新：2026-04-05

本目录记录当前已实现的 HTTP API 范围。

## 设计规则

1. 使用 REST 风格的 HTTP 端点
2. 在 `/api/v1/` 下版本化公共端点
3. 返回明确的 JSON 有效负载
4. 在记账领域模型存在之前，保持当前范围较小

## 已实现的端点

### `GET /healthz`

用途：

- 进程健康检查
- 本地启动验证

响应：

```json
{
  "status": "ok"
}
```

### `GET /api/v1/bootstrap`

用途：

- 为应用提供稳定的启动元数据
- 验证应用到服务端的连接性

响应：

```json
{
  "status": "ok",
  "serviceName": "bookkeeping-server",
  "version": "dev",
  "serverTime": "2026-04-05T12:34:56Z",
  "features": [
    "local-first-ready",
    "offline-ledger-planned",
    "sync-not-enabled"
  ]
}
```

## 应用内部 API

应用主要使用本地 SQLite 存储，核心数据访问通过 Repository 和 Service 层：

### LedgerEntryService

```typescript
// 创建账目
await ledgerEntryService.create({
  amount: 100,      // 元（内部转换为分）
  type: 'expense',
  description: '午餐',
  date: '2026-04-05'
});

// 更新账目
await ledgerEntryService.update({
  id: 'uuid',
  amount: 150,
  description: '午餐加饮料'
});

// 删除账目（软删除）
await ledgerEntryService.delete(id);

// 获取列表
const entries = await ledgerEntryService.getList();

// 按类型筛选
const expenses = await ledgerEntryService.getList({ type: 'expense' });

// 按日期范围筛选
const entries = await ledgerEntryService.getList({
  startDate: '2026-04-01',
  endDate: '2026-04-30'
});

// 获取汇总
const summary = await ledgerEntryService.getSummary();
// {
//   totalIncome: 50000,    // 分
//   totalExpense: 30000,   // 分
//   balance: 20000,        // 分
//   count: 10
// }

// 获取单个账目
const entry = await ledgerEntryService.getById(id);
```

### Money 工具

```typescript
import * as Money from './utils/Money';

// 元 -> 分
const cents = Money.fromYuan(100.50);  // 10050

// 分 -> 元
const yuan = Money.toYuan(10050);       // 100.5

// 格式化显示
const formatted = Money.format(10050);  // "¥100.50"

// 计算
const sum = Money.add(1000, 2000);      // 3000
const diff = Money.subtract(5000, 2000); // 3000
```

## 尚未实现

以下内容在未来版本中实现：

- 账户端点
- 类别端点
- 同步端点
- 身份验证端点
- 报表端点

添加这些区域时，本目录应随端点特定文档或 OpenAPI 文件一起扩展。
