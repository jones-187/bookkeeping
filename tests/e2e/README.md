# 端到端测试

最后更新：2026-04-05

此目录包含 E2E 测试配置和测试流程。

## 技术选型

使用 [Maestro](https://maestro.mobile.dev/) 作为 E2E 测试框架：

- ✅ 原生支持 Expo，无需 `expo prebuild`
- ✅ YAML 格式测试用例，简单直观
- ✅ 支持文本匹配和 testID 选择器
- ✅ CI/CD 友好

## 目录结构

```
tests/e2e/
├── config.yaml          # Maestro 全局配置
├── README.md            # 本文档
└── flows/               # 测试流程
    ├── add-entry.yaml   # 添加账目流程
    ├── edit-entry.yaml  # 编辑账目流程
    └── delete-entry.yaml # 删除账目流程
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
maestro test ../tests/e2e/flows/add-entry.yaml
```

### 快速运行（一行命令）

```bash
# 从项目根目录
cd src/app && npm start & sleep 30 && maestro test ../tests/e2e/flows/add-entry.yaml
```

## 测试覆盖

| 流程 | 文件 | 覆盖场景 |
|------|------|----------|
| 添加账目 | `add-entry.yaml` | 空状态 → 添加 → 列表显示 |
| 编辑账目 | `edit-entry.yaml` | 添加 → 编辑 → 验证修改 |
| 删除账目 | `delete-entry.yaml` | 添加 → 删除 → 确认对话框 → 验证删除 |

## CI/CD 集成

E2E 测试已集成到 GitHub Actions（`.github/workflows/ci.yml`）：

- **触发条件**：main 分支的 push
- **运行环境**：macOS + iOS 模拟器
- **测试结果**：上传为 artifacts

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

## 故障排除

### 测试找不到元素

1. 确保应用已完全加载（等待几秒再运行测试）
2. 检查应用是否在 Expo Go 中运行
3. 使用 `maestro studio` 进行可视化调试：
   ```bash
   maestro studio
   ```

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

## 注意事项

1. **appId 配置**：当前配置为 `host.exp.Exponent`（Expo Go），生产环境需修改为实际应用 ID
2. **数据隔离**：每个测试流程开始时会执行 `clearState` 清理数据
3. **异步操作**：测试中已添加适当的等待时间，避免时序问题
