# 端到端测试

最后更新：2026-04-06

此目录包含 E2E 测试配置和测试流程。

## 技术选型

使用 [Maestro](https://maestro.mobile.dev/) 作为 E2E 测试框架：

- 原生支持 Expo，无需 `expo prebuild`
- YAML 格式测试用例，简单直观
- 支持文本匹配和 testID 选择器
- CI/CD 友好

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

## 目录结构

```
tests/e2e/
├── config.yaml          # Maestro 全局配置
├── README.md            # 本文档
├── _reset.yaml          # 测试数据重置流程
├── flows/               # 测试流程
│   ├── add-entry.yaml   # 添加账目流程
│   ├── edit-entry.yaml  # 编辑账目流程
│   └── delete-entry.yaml # 删除账目流程
├── debug/               # 调试输出
├── results/             # 测试结果
└── screenshots/         # 手动截图
```

## 本地运行

### 步骤 1：安装 Maestro

```bash
# macOS
brew tap mobiledevops/mobiledevops
brew install maestro

# 验证安装
maestro --version
```

### 步骤 2：启动模拟器

```bash
# iOS (macOS only)
open -a Simulator

# 或 Android
# 启动 Android Studio 的模拟器
```

### 步骤 3：安装 Expo Go

```bash
# iOS 模拟器
xcrun simctl install booted "$(find ~/Library/Developer/CoreSimulator/Devices -name "Expo Go.app" | head -1)"

# 如果没有找到，可以从 App Store 或 Play Store 下载
```

### 步骤 4：启动应用

```bash
cd src/app
npm start
```

在 Expo CLI 中选择：
- 按 `i` 打开 iOS 模拟器
- 或按 `a` 打开 Android 模拟器

等待应用完全加载，看到账目列表页面。

### 步骤 5：运行测试

**新开一个终端窗口**，运行测试：

```bash
cd src/app

# 运行所有 E2E 测试
npm run test:e2e

# 或运行单个测试
maestro test ../../tests/e2e/flows/add-entry.yaml
```

### 快速运行（一行命令）

```bash
# 从项目根目录
cd src/app && npm start & sleep 30 && maestro test ../../tests/e2e/flows/add-entry.yaml
```

## 测试覆盖

| 流程 | 文件 | 覆盖场景 |
|------|------|----------|
| 添加账目 | `add-entry.yaml` | 重置数据 → 添加 → 验证特定数据 |
| 编辑账目 | `edit-entry.yaml` | 重置数据 → 添加 → 编辑 → 验证修改 |
| 删除账目 | `delete-entry.yaml` | 重置数据 → 添加 → 删除 → 验证删除 |

## 数据重置 API

开发模式下可用深层链接重置数据：

```bash
# 软删除测试数据
adb shell "am start -a android.intent.action.VIEW -d 'exp://192.168.31.249:8081/--/reset-test-data' host.exp.exponent"

# 清空所有数据
adb shell "am start -a android.intent.action.VIEW -d 'exp://192.168.31.249:8081/--/reset-all-data' host.exp.exponent"
```

## UI 选择器

测试使用以下选择器定位 UI 元素：

| 元素 | 选择器类型 | 值 |
|------|------------|-----|
| 添加按钮 | testID | `add-entry-fab` |
| 账目列表 | testID | `entry-list` |
| 类型选择 | testID | `type-selector` |
| 金额输入 | testID | `amount-input` |
| 描述输入 | testID | `description-input` |
| 日期输入 | testID | `date-input` |
| 提交按钮 | testID | `submit-button` |
| 删除按钮 | testID | `delete-button` |

## 添加新测试

1. 使用 `TEST_{类型}_{序号}` 格式命名测试数据
2. 在测试开头引入 `- runFlow: _reset.yaml`
3. 验证特定数据而非模糊匹配
4. 运行测试验证隔离性

## 故障排除

### 测试找不到元素

1. 确保应用已完全加载（等待几秒再运行测试）
2. 检查应用是否在 Expo Go 中运行
3. 使用 `maestro studio` 进行可视化调试：
   ```bash
   maestro studio
   ```

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

### 模拟器启动失败

```bash
# iOS 模拟器重置
xcrun simctl shutdown all
xcrun simctl erase all

# 重新启动模拟器
open -a Simulator
```

### "App not found" 错误

确认 Expo Go 已安装在模拟器中：
```bash
# iOS
xcrun simctl listapps booted | grep Expo

# 如果没有，手动安装 Expo Go
```

### CI 测试超时

增加 `waitForAnimationToEnd` 的 timeout 值：
```yaml
- waitForAnimationToEnd:
    timeout: 5000  # 增加到 5 秒
```

## CI/CD 集成

E2E 测试已集成到 GitHub Actions（`.github/workflows/ci.yml`）：

- **触发条件**：main 分支的 push
- **运行环境**：macOS + iOS 模拟器
- **测试结果**：上传为 artifacts

## 注意事项

1. **appId 配置**：当前配置为 `host.exp.exponent`（Expo Go），生产环境需修改为实际应用 ID
2. **数据隔离**：每个测试流程开始时会调用 `_reset.yaml` 清理测试数据
3. **异步操作**：测试中已添加适当的等待时间，避免时序问题
4. **DEV 模式**：数据重置 API 仅在 `__DEV__` 模式下可用
