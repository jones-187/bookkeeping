# Web E2E 测试方案设计

日期：2026-04-05

## 目标

为 Web 平台实现 E2E 测试，覆盖所有核心功能，支持本地 headless 运行和 CI 自动运行。

## 技术方案

| 项目 | 选择 | 理由 |
|------|------|------|
| 框架 | Playwright | 业内最成熟的 Web E2E 框架 |
| 语言 | TypeScript | 与项目技术栈一致 |
| 运行模式 | headless | 开发环境为远程 Linux 服务器 |
| 调试方式 | Trace Viewer + 截图 | Playwright 内置，业内标准 |
| 代码模式 | Page Object Model | 业内标准，易于维护 |

## 测试范围

### 1. 核心用户流程

- 添加账目（收入/支出）
- 账目列表显示
- 编辑账目
- 删除账目（软删除）
- 收支汇总显示

### 2. 边缘情况

- 金额为 0 → 显示错误
- 金额为负数 → 显示错误
- 描述为空 → 显示错误
- 日期格式无效 → 显示错误
- 未来日期 → 显示错误

### 3. 数据持久化

- 添加账目后刷新页面，数据仍然存在
- 编辑账目后刷新页面，修改仍然存在
- 删除账目后刷新页面，账目仍然不存在

## 目录结构

```
src/app/
├── e2e/
│   ├── fixtures/
│   │   └── test.ts           # 自定义 test fixture，包含数据库清理
│   ├── pages/
│   │   ├── LedgerListPage.ts # 账目列表页
│   │   └── EntryFormPage.ts  # 添加/编辑表单页
│   └── specs/
│       ├── ledger-crud.spec.ts    # 核心流程测试
│       ├── validation.spec.ts     # 边缘情况测试
│       └── persistence.spec.ts    # 持久化测试
├── playwright.config.ts      # Playwright 配置
└── package.json              # 添加 e2e 依赖和脚本
```

## Page Object 设计

### LedgerListPage

```typescript
class LedgerListPage {
  // 导航
  goto(): Promise<void>

  // 查询
  getEntries(): Promise<Entry[]>
  getSummary(): Promise<Summary>
  getEntryById(id: string): Promise<Entry | null>
  isEmptyState(): Promise<boolean>

  // 操作
  clickAddButton(): Promise<void>
  clickEntry(id: string): Promise<void>
}
```

### EntryFormPage

```typescript
class EntryFormPage {
  // 填充表单
  fillAmount(amount: number): Promise<void>
  fillDescription(description: string): Promise<void>
  fillDate(date: string): Promise<void>
  selectType(type: 'income' | 'expense'): Promise<void>

  // 提交
  submit(): Promise<void>
  delete(): Promise<void>

  // 错误信息
  getErrorMessage(): Promise<string | null>
}
```

## 配置

### playwright.config.ts

```typescript
export default defineConfig({
  testDir: './e2e/specs',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,  // 单线程，避免 IndexedDB 并发问题
  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report' }],
  ],
  use: {
    baseURL: 'http://localhost:8081',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    headless: true,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'npm run web -- --port 8081',
    url: 'http://localhost:8081',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
});
```

### package.json 新增

```json
{
  "scripts": {
    "test:e2e:web": "playwright test",
    "test:e2e:web:ui": "playwright test --ui",
    "test:e2e:web:debug": "playwright test --debug"
  },
  "devDependencies": {
    "@playwright/test": "^1.42.0"
  }
}
```

## CI 配置

### .github/workflows/ci.yml 新增 Job

```yaml
e2e-web-tests:
  needs: lint-and-test
  runs-on: ubuntu-latest

  steps:
    - name: Checkout code
      uses: actions/checkout@v4

    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: "22"
        cache: "npm"
        cache-dependency-path: src/app/package-lock.json

    - name: Install dependencies
      working-directory: src/app
      run: npm ci

    - name: Install Playwright browsers
      working-directory: src/app
      run: npx playwright install --with-deps chromium

    - name: Run E2E tests
      working-directory: src/app
      run: npm run test:e2e:web

    - name: Upload Playwright report
      uses: actions/upload-artifact@v4
      if: always()
      with:
        name: playwright-report
        path: src/app/playwright-report/
        retention-days: 7
```

## 调试方式

### 1. Trace Viewer

测试失败时自动生成 trace，可在本地查看：

```bash
npx playwright show-trace trace.zip
```

Trace 包含：
- 每一步的截图
- DOM 快照
- 网络请求
- 控制台日志

### 2. 截图

失败时自动截图，保存在 `test-results/` 目录。

### 3. HTML 报告

```bash
npx playwright show-report
```

## 测试数据隔离

每个测试用例运行前清空 IndexedDB：

```typescript
// e2e/fixtures/test.ts
import { test as base } from '@playwright/test';

export const test = base.extend({
  page: async ({ page }, use) => {
    // 清空 IndexedDB
    await page.goto('/');
    await page.evaluate(() => {
      return new Promise((resolve) => {
        const request = indexedDB.deleteDatabase('bookkeeping');
        request.onsuccess = () => resolve(undefined);
        request.onerror = () => resolve(undefined);
      });
    });
    await use(page);
  },
});
```

## 预估工作量

| 任务 | 时间 |
|------|------|
| 安装配置 Playwright | 0.5h |
| 实现 Page Object | 1h |
| 核心流程测试 | 1h |
| 边缘情况测试 | 0.5h |
| 持久化测试 | 0.5h |
| CI 配置 | 0.5h |
| **总计** | 4h |
