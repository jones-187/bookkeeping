# Maestro E2E 测试稳定性修复计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 修复 Maestro E2E 测试的输出目录配置和应用崩溃问题，确保测试稳定运行

**Architecture:**
1. 使用 `--debug-output` 和 `--test-output-dir` 参数将所有测试产物保存到项目目录
2. 手动验证应用是否存在自动崩溃问题
3. 根据崩溃原因修复应用或调整测试配置

**Tech Stack:** Maestro CLI, Expo Go, ADB, React Native

---

## Task 1: 配置测试输出目录到项目路径

**Files:**
- Modify: `src/app/package.json` - 更新 test:e2e 脚本
- Modify: `agents.md` - 更新文档说明

- [ ] **Step 1: 更新 package.json 中的 test:e2e 脚本**

修改 `src/app/package.json`，添加输出目录参数：

```json
{
  "scripts": {
    "test:e2e": "maestro test --debug-output ../tests/e2e/debug --test-output-dir ../tests/e2e/results ../tests/e2e/flows",
    "test:e2e:ci": "maestro test --format junit --debug-output ../tests/e2e/debug --test-output-dir ../tests/e2e/results ../tests/e2e/flows",
    "test:e2e:web": "playwright test",
    "test:e2e:web:ui": "playwright test --ui",
    "test:e2e:web:debug": "playwright test --debug"
  }
}
```

- [ ] **Step 2: 创建测试输出目录结构**

```bash
mkdir -p tests/e2e/debug tests/e2e/results tests/e2e/screenshots
```

- [ ] **Step 3: 更新 agents.md 文档**

确保 `agents.md` 包含正确的命令说明：

```markdown
# Agent 开发指南

## E2E 测试 (Maestro)

### 输出目录配置

运行 Maestro 测试时，测试产物会自动保存到项目目录：

- 调试输出：`tests/e2e/debug/`
- 测试结果：`tests/e2e/results/`
- 截图：`tests/e2e/screenshots/`

运行测试命令：
```bash
cd src/app
npm run test:e2e
```

或直接使用 maestro 命令：
```bash
maestro test --debug-output tests/e2e/debug --test-output-dir tests/e2e/results tests/e2e/flows
```

### 手动截图

使用 adb 手动截图时，保存到项目目录：
```bash
adb exec-out screencap -p > "tests/e2e/screenshots/xxx.png"
```
```

- [ ] **Step 4: 验证输出目录配置**

运行一次测试，验证输出目录是否正确：
```bash
cd src/app
npm run test:e2e
```

检查 `tests/e2e/debug/` 和 `tests/e2e/results/` 是否有文件生成。

---

## Task 2: 手动验证应用崩溃问题

**Files:**
- 无文件修改，纯验证步骤

- [ ] **Step 1: 启动 Expo 服务器**

```bash
cd src/app
npx expo start --lan --android
```

等待服务器启动，确认显示类似：
```
Metro waiting on http://192.168.31.xxx:8081
```

- [ ] **Step 2: 通过深层链接启动应用**

```bash
adb shell "am start -a android.intent.action.VIEW -d 'exp://192.168.31.xxx:8081' host.exp.exponent"
```

- [ ] **Step 3: 等待 60 秒观察应用状态**

不执行任何操作，仅等待。每隔 15 秒截图一次：

```bash
sleep 15 && adb exec-out screencap -p > "tests/e2e/screenshots/stability-check-15s.png"
sleep 15 && adb exec-out screencap -p > "tests/e2e/screenshots/stability-check-30s.png"
sleep 15 && adb exec-out screencap -p > "tests/e2e/screenshots/stability-check-45s.png"
sleep 15 && adb exec-out screencap -p > "tests/e2e/screenshots/stability-check-60s.png"
```

- [ ] **Step 4: 检查截图，判断是否自动崩溃**

查看截图：
- 如果截图显示 Expo Go 主界面，说明应用已崩溃
- 如果截图显示记账应用界面，说明应用稳定

- [ ] **Step 5: 如果崩溃，检查日志**

```bash
adb logcat -d | grep -iE "(FATAL|Exception|Error)" | tail -30
```

---

## Task 3: 根据崩溃原因修复问题

**Files:**
- 可能修改: `src/app/App.tsx`
- 可能修改: `src/app/src/navigation/AppNavigator.tsx`

- [ ] **Step 1: 分析崩溃日志**

根据 Task 2 的日志，判断崩溃原因：

常见原因及解决方案：

1. **UIManager 初始化问题**
   - 原因：`react-native-screens` 与 Expo Go 兼容性问题
   - 解决：移除 `enableScreens(true)` 或使用 development build

2. **导航组件问题**
   - 原因：NavigationContainer 在某些情况下初始化失败
   - 解决：添加 fallback 或检查 React Native 版本兼容性

3. **内存不足**
   - 原因：模拟器内存不足
   - 解决：增加模拟器内存或简化应用

- [ ] **Step 2: 应用修复方案**

根据分析结果修改代码：

**方案 A: 移除 enableScreens（如果已添加）**

修改 `src/app/App.tsx`：
```tsx
import React from 'react';
import { PaperProvider } from 'react-native-paper';
import { AppNavigator } from './src/navigation/AppNavigator';

export default function App() {
  return (
    <PaperProvider>
      <AppNavigator />
    </PaperProvider>
  );
}
```

**方案 B: 添加 NavigationContainer fallback**

修改 `src/app/src/navigation/AppNavigator.tsx`：
```tsx
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { LedgerNavigator } from './features/ledgerNavigator';
import { Text, View } from 'react-native';

export function AppNavigator() {
  return (
    <NavigationContainer
      fallback={
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text>Loading...</Text>
        </View>
      }
    >
      <LedgerNavigator />
    </NavigationContainer>
  );
}
```

- [ ] **Step 3: 重新验证应用稳定性**

重复 Task 2 的验证步骤，确认应用不再自动崩溃。

---

## Task 4: 更新测试用例文档

**Files:**
- Modify: `tests/e2e/README.md`（如果存在）
- Create: `tests/e2e/README.md`（如果不存在）

- [ ] **Step 1: 创建或更新测试文档**

```markdown
# E2E 测试说明

## 测试环境

- Android 模拟器（Pixel 4）
- Expo Go 应用
- Maestro CLI

## 运行测试

### 前置条件

1. 启动 Expo 服务器：
```bash
cd src/app
npx expo start --lan --android
```

2. 等待服务器启动完成

### 运行测试

```bash
cd src/app
npm run test:e2e
```

### 单独运行某个测试

```bash
maestro test --debug-output ../tests/e2e/debug --test-output-dir ../tests/e2e/results ../tests/e2e/flows/add-entry.yaml
```

## 测试用例

### add-entry.yaml
测试添加账目功能：
1. 通过深层链接启动应用
2. 点击添加按钮
3. 填写表单
4. 保存并验证

### edit-entry.yaml
测试编辑账目功能

### delete-entry.yaml
测试删除账目功能

## 输出目录

- `tests/e2e/debug/` - 调试输出（日志、截图）
- `tests/e2e/results/` - 测试结果
- `tests/e2e/screenshots/` - 手动截图

## 常见问题

### 应用崩溃

如果应用在 Expo Go 中崩溃，检查：
1. react-native-screens 版本兼容性
2. 模拟器内存是否充足
3. 查看 adb logcat 日志
```

- [ ] **Step 2: 提交所有更改**

```bash
git add agents.md src/app/package.json tests/e2e/ docs/superpowers/plans/
git commit -m "fix: 修复 Maestro E2E 测试配置和稳定性问题"
```

---

## 执行顺序

1. **Task 1** - 配置输出目录（最高优先级）
2. **Task 2** - 验证崩溃问题
3. **Task 3** - 修复崩溃（如果需要）
4. **Task 4** - 更新文档
