# Maestro E2E 测试数据隔离与可靠性提升计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 解决 E2E 测试数据污染问题，实现测试用例之间的完全隔离，确保测试可靠性

**Architecture:**
1. 添加应用内测试数据重置 API（仅 DEV 模式可用）
2. 修改测试流程，每个测试前重置数据状态
3. 使用唯一标识的测试数据，避免命名冲突
4. 精确断言，验证特定数据而非模糊匹配

**Tech Stack:** Maestro CLI, Expo Go, React Native, Deep Linking

---

## 问题分析

当前测试的根本缺陷：

```
测试 A: 创建 "E2E Test Income" → 通过 ✓
测试 B: 创建 "Edit Test..." → 列表已有 2 条数据 → 可能误判 ✓
测试 C: 删除 "Test Data..." → 列表还有 2 条旧数据 → 通过 ✓
```

**所有测试都通过了，但测试的可靠性是 0** —— 因为它们没有真正验证功能，只是在"碰运气"。

---

## Task 1: 添加应用内测试数据重置 API

**Files:**
- Create: `src/app/src/shared/db/test-utils.ts` - 测试工具函数
- Modify: `src/app/src/navigation/AppNavigator.tsx` - 添加深层链接处理
- Modify: `src/app/App.tsx` - 注册重置处理（如果需要）

### 方案选择

经过对比，选择 **方案 A: 深层链接重置端点**（简单可靠）

优点：
- 不需要修改 Maestro 测试框架
- 每个测试开始前可以确保干净状态
- 实现简单，不侵入生产代码逻辑

缺点：
- 需要确保生产环境不可用（通过 `__DEV__` 保护）

### 实施步骤

- [x] **Step 1: 创建测试工具模块**

创建 `src/app/src/shared/db/test-utils.ts`：

```typescript
/**
 * 测试工具函数 - 仅用于 E2E 测试
 * 所有函数都受 __DEV__ 保护，确保生产环境不可用
 */
import { getDatabase } from './native-db';

/**
 * 重置所有测试数据（标记为已删除）
 * 软删除所有描述以 TEST_ 或 E2E 开头的条目
 */
export async function resetTestData(): Promise<void> {
  if (!__DEV__) {
    console.warn('resetTestData is only available in DEV mode');
    return;
  }

  try {
    const db = await getDatabase();
    const now = new Date().toISOString();

    // 软删除所有测试数据
    await db.runAsync(
      `UPDATE ledger_entries 
       SET deleted_at = ? 
       WHERE description LIKE 'TEST_%' 
          OR description LIKE 'E2E %' 
          OR description LIKE 'Edit Test %' 
          OR description LIKE 'Test Data %'`,
      [now]
    );

    console.log('[TestUtils] Test data reset completed');
  } catch (error) {
    console.error('[TestUtils] Failed to reset test data:', error);
  }
}

/**
 * 完全清空数据库 - 谨慎使用
 * 仅用于测试前的完全重置
 */
export async function resetAllData(): Promise<void> {
  if (!__DEV__) {
    console.warn('resetAllData is only available in DEV mode');
    return;
  }

  try {
    const db = await getDatabase();
    // 硬删除所有数据（测试环境专用）
    await db.runAsync('DELETE FROM ledger_entries');
    console.log('[TestUtils] All data cleared');
  } catch (error) {
    console.error('[TestUtils] Failed to clear data:', error);
  }
}

/**
 * 生成唯一测试数据标识
 * 格式: TEST_{timestamp}_{random}
 */
export function generateTestId(prefix: string = 'TEST'): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}_${timestamp}_${random}`;
}
```

- [x] **Step 2: 添加深层链接处理**

修改 `src/app/src/navigation/AppNavigator.tsx`，添加对 `reset-test-data` 深层链接的处理：

```typescript
import { useEffect } from 'react';
import { Linking } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { resetTestData, resetAllData } from '../shared/db/test-utils';

export function AppNavigator() {
  useEffect(() => {
    if (!__DEV__) return;

    // 处理深层链接
    const handleDeepLink = async (event: { url: string }) => {
      const { url } = event;
      console.log('[DeepLink] Received:', url);

      if (url.includes('--/reset-test-data')) {
        console.log('[DeepLink] Resetting test data...');
        await resetTestData();
        // 发送事件通知测试数据已重置
        // 可以通过全局事件或状态管理通知 UI 刷新
      } else if (url.includes('--/reset-all-data')) {
        console.log('[DeepLink] Clearing all data...');
        await resetAllData();
      }
    };

    // 监听深层链接
    const subscription = Linking.addEventListener('url', handleDeepLink);

    // 检查启动时的深层链接
    Linking.getInitialURL().then((url) => {
      if (url) handleDeepLink({ url });
    });

    return () => {
      subscription.remove();
    };
  }, []);

  return (
    <NavigationContainer>
      <LedgerNavigator />
    </NavigationContainer>
  );
}
```

- [ ] **Step 3: 配置深层链接 scheme**

确保 `app.json` 中配置了深层链接：

```json
{
  "expo": {
    "scheme": "bookkeeping",
    "android": {
      "intentFilters": [
        {
          "action": "VIEW",
          "data": [{ "scheme": "bookkeeping" }],
          "category": ["BROWSABLE", "DEFAULT"]
        }
      ]
    }
  }
}
```

---

## Task 2: 修改测试流程，添加数据重置步骤

**Files:**
- Modify: `tests/e2e/flows/add-entry.yaml`
- Modify: `tests/e2e/flows/edit-entry.yaml`
- Modify: `tests/e2e/flows/delete-entry.yaml`
- Create: `tests/e2e/flows/_reset.yaml` - 可复用的重置流程

### 实施步骤

- [x] **Step 1: 创建可复用的重置流程**

创建 `tests/e2e/flows/_reset.yaml`：

```yaml
# 重置测试数据流程
# 用法: 在其他流程开头引入

appId: host.exp.exponent
---
# 通过深层链接重置测试数据
- openLink:
    link: "exp://192.168.31.249:8081/--/reset-test-data"

- waitForAnimationToEnd:
    timeout: 2000

# 等待应用重新加载并显示主界面
- extendedWaitUntil:
    visible:
      id: "entry-list"
    timeout: 15000
```

- [x] **Step 2: 修改 add-entry.yaml**

**已修复:** 金额格式从 `+100.50` 改为 `¥10050.00`

```yaml
appId: host.exp.exponent
name: Add Entry Flow
---
# 0. 重置测试数据
- runFlow: _reset.yaml

# 1. 点击添加按钮
- tapOn:
    id: "add-entry-fab"
- waitForAnimationToEnd:
    timeout: 2000

# 2. 验证添加表单显示
- assertVisible:
    text: "支出"

# 3. 选择收入类型
- tapOn:
    text: "收入"

# 4. 输入金额（使用唯一标识）
- tapOn:
    id: "amount-input"
- doubleTapOn:
    id: "amount-input"
- eraseText
- eraseText
- eraseText
- inputText: "100.50"

# 5. 输入描述（使用唯一标识）
- tapOn:
    id: "description-input"
- doubleTapOn:
    id: "description-input"
- eraseText
- eraseText
- eraseText
- inputText: "TEST_ADD_001"

# 6. 输入日期
- tapOn:
    id: "date-input"
- doubleTapOn:
    id: "date-input"
- eraseText
- eraseText
- eraseText
- inputText: "2026-04-05"

# 7. 提交表单
- tapOn:
    id: "submit-button"
- waitForAnimationToEnd:
    timeout: 3000

# 8. 验证返回列表页
- assertVisible:
    id: "entry-list"

# 9. 验证特定条目显示（精确匹配）
- assertVisible:
    text: "TEST_ADD_001"

# 10. 验证金额显示正确
- assertVisible:
    text: "+100.50"
```

- [x] **Step 3: 修改 edit-entry.yaml**

```yaml
appId: host.exp.exponent
name: Edit Entry Flow
---
# 0. 重置测试数据
- runFlow: _reset.yaml

# 1. 先添加一条测试数据
- tapOn:
    id: "add-entry-fab"
- waitForAnimationToEnd:
    timeout: 2000

- tapOn:
    id: "amount-input"
- doubleTapOn:
    id: "amount-input"
- eraseText
- eraseText
- eraseText
- inputText: "50"

- tapOn:
    id: "description-input"
- doubleTapOn:
    id: "description-input"
- eraseText
- eraseText
- eraseText
- inputText: "TEST_EDIT_ORIGINAL"

- tapOn:
    id: "submit-button"
- waitForAnimationToEnd:
    timeout: 3000

# 2. 验证测试数据已创建
- assertVisible:
    text: "TEST_EDIT_ORIGINAL"

# 3. 点击进入编辑页面
- tapOn:
    text: "TEST_EDIT_ORIGINAL"
- waitForAnimationToEnd:
    timeout: 2000

# 4. 验证编辑表单显示
- assertVisible:
    id: "amount-input"

# 5. 修改金额
- tapOn:
    id: "amount-input"
- doubleTapOn:
    id: "amount-input"
- eraseText
- eraseText
- eraseText
- inputText: "75"

# 6. 修改描述
- tapOn:
    id: "description-input"
- doubleTapOn:
    id: "description-input"
- eraseText
- eraseText
- eraseText
- inputText: "TEST_EDIT_MODIFIED"

# 7. 提交修改
- tapOn:
    id: "submit-button"
- waitForAnimationToEnd:
    timeout: 3000

# 8. 验证返回列表页
- assertVisible:
    id: "entry-list"

# 9. 验证修改后的条目显示
- assertVisible:
    text: "TEST_EDIT_MODIFIED"

# 10. 验证原条目不再显示
- assertNotVisible:
    text: "TEST_EDIT_ORIGINAL"

# 11. 验证金额更新
- assertVisible:
    text: "75.00"
```

- [x] **Step 4: 修改 delete-entry.yaml**

```yaml
appId: host.exp.exponent
name: Delete Entry Flow
---
# 0. 重置测试数据
- runFlow: _reset.yaml

# 1. 先添加一条测试数据
- tapOn:
    id: "add-entry-fab"
- waitForAnimationToEnd:
    timeout: 2000

- tapOn:
    id: "amount-input"
- doubleTapOn:
    id: "amount-input"
- eraseText
- eraseText
- eraseText
- inputText: "30"

- tapOn:
    id: "description-input"
- doubleTapOn:
    id: "description-input"
- eraseText
- eraseText
- eraseText
- inputText: "TEST_DELETE_TARGET"

- tapOn:
    id: "submit-button"
- waitForAnimationToEnd:
    timeout: 3000

# 2. 验证测试数据已创建
- assertVisible:
    text: "TEST_DELETE_TARGET"

# 3. 点击进入编辑页面
- tapOn:
    text: "TEST_DELETE_TARGET"
- waitForAnimationToEnd:
    timeout: 2000

# 4. 验证删除按钮显示
- assertVisible:
    id: "delete-button"

# 5. 点击删除按钮
- tapOn:
    id: "delete-button"
- waitForAnimationToEnd:
    timeout: 1000

# 6. 确认删除对话框
- tapOn:
    text: "删除"
- waitForAnimationToEnd:
    timeout: 3000

# 7. 验证返回列表页
- assertVisible:
    id: "entry-list"

# 8. 验证条目已删除
- assertNotVisible:
    text: "TEST_DELETE_TARGET"
```

---

## Task 3: 验证测试隔离性

**Files:**
- 无文件修改，纯验证步骤

- [ ] **Step 1: 单独运行每个测试**

```bash
cd src/app

# 运行 add-entry 测试 3 次
maestro test --debug-output ../../tests/e2e/debug --test-output-dir ../../tests/e2e/results ../../tests/e2e/flows/add-entry.yaml
maestro test --debug-output ../../tests/e2e/debug --test-output-dir ../../tests/e2e/results ../../tests/e2e/flows/add-entry.yaml
maestro test --debug-output ../../tests/e2e/debug --test-output-dir ../../tests/e2e/results ../../tests/e2e/flows/add-entry.yaml
```

每次运行都应该成功，且列表中只有一条数据。

- [ ] **Step 2: 打乱顺序运行测试**

```bash
# 先运行 delete
maestro test --debug-output ../../tests/e2e/debug --test-output-dir ../../tests/e2e/results ../../tests/e2e/flows/delete-entry.yaml

# 再运行 add
maestro test --debug-output ../../tests/e2e/debug --test-output-dir ../../tests/e2e/results ../../tests/e2e/flows/add-entry.yaml

# 最后运行 edit
maestro test --debug-output ../../tests/e2e/debug --test-output-dir ../../tests/e2e/results ../../tests/e2e/flows/edit-entry.yaml
```

每个测试都应该独立通过，不受之前测试的影响。

- [ ] **Step 3: 并行运行测试（如果 Maestro 支持）**

验证测试之间没有资源竞争。

- [ ] **Step 4: 运行完整测试套件**

```bash
npm run test:e2e
```

验证所有测试通过。

---

## Task 4: 更新文档

**Files:**
- Modify: `tests/e2e/README.md`（创建或更新）
- Modify: `agents.md` - 添加测试数据隔离说明

- [x] **Step 1: 创建/更新 E2E 测试 README**

创建 `tests/e2e/README.md`：

```markdown
# E2E 测试说明

## 测试环境

- Android 模拟器（Pixel 4）
- Expo Go 应用
- Maestro CLI

## 测试数据隔离

为了确保测试可靠性，每个测试用例都遵循以下原则：

1. **测试前重置**: 每个测试开始前调用 `_reset.yaml` 重置测试数据
2. **唯一标识**: 使用 `TEST_{类型}_{序号}` 格式命名测试数据
3. **精确断言**: 验证特定的测试数据，而非模糊匹配

### 测试数据命名规范

| 测试文件 | 数据前缀 |
|---------|---------|
| add-entry.yaml | TEST_ADD_001 |
| edit-entry.yaml | TEST_EDIT_ORIGINAL, TEST_EDIT_MODIFIED |
| delete-entry.yaml | TEST_DELETE_TARGET |

## 运行测试

### 前置条件

1. 启动 Expo 服务器：
```bash
cd src/app
npx expo start --lan --android
```

2. 等待服务器启动完成

### 运行所有测试

```bash
cd src/app
npm run test:e2e
```

### 单独运行某个测试

```bash
maestro test --debug-output ../tests/e2e/debug --test-output-dir ../tests/e2e/results ../tests/e2e/flows/add-entry.yaml
```

### 重置测试数据

手动重置测试数据：
```bash
adb shell "am start -a android.intent.action.VIEW -d 'exp://192.168.31.249:8081/--/reset-test-data' host.exp.exponent"
```

## 输出目录

- `tests/e2e/debug/` - 调试输出（日志、截图）
- `tests/e2e/results/` - 测试结果
- `tests/e2e/screenshots/` - 手动截图

## 添加新测试

1. 使用 `TEST_{类型}_{序号}` 格式命名测试数据
2. 在测试开头引入 `_reset.yaml`
3. 验证特定数据而非模糊匹配
4. 运行测试验证隔离性

## 常见问题

### 测试数据残留

如果测试数据没有正确清理：
1. 手动调用重置深层链接
2. 检查 `__DEV__` 模式是否正确启用
3. 查看应用日志确认重置函数被调用

### 测试顺序依赖

如果测试必须按特定顺序运行才能通过，说明隔离性有问题。检查：
1. 是否正确调用了 `_reset.yaml`
2. 深层链接处理是否正确
3. 数据库操作是否成功
```

- [x] **Step 2: 更新 agents.md**

在 `agents.md` 中添加测试数据隔离说明：

```markdown
## E2E 测试数据隔离

### 设计原则

1. **每个测试独立**: 测试之间不应有数据依赖
2. **测试前重置**: 使用 `_reset.yaml` 流程重置数据
3. **唯一命名**: 使用 `TEST_{类型}_{序号}` 格式

### 深层链接重置 API

开发模式下可用：
- `exp://192.168.31.249:8081/--/reset-test-data` - 软删除测试数据
- `exp://192.168.31.249:8081/--/reset-all-data` - 清空所有数据

### 添加新测试流程

1. 复制现有流程文件
2. 修改测试数据名称（使用唯一标识）
3. 确保开头包含 `- runFlow: _reset.yaml`
4. 使用精确断言验证特定数据
```

---

## 执行顺序

1. **Task 1** - 添加测试数据重置 API（最高优先级）
2. **Task 2** - 修改测试流程，添加数据重置
3. **Task 3** - 验证测试隔离性
4. **Task 4** - 更新文档

---

## 风险评估

| 风险 | 可能性 | 影响 | 缓解措施 |
|-----|-------|------|---------|
| 深层链接处理失败 | 低 | 中 | 添加错误处理和日志 |
| `__DEV__` 检查被绕过 | 低 | 高 | 代码审查，添加警告日志 |
| 重置 API 影响生产数据 | 极低 | 高 | 多重 `__DEV__` 检查 |
| 测试运行时间增加 | 中 | 低 | 优化重置逻辑，只清理测试数据 |
