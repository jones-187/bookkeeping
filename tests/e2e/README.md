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

### 前置条件

1. 安装 Maestro：
   ```bash
   # macOS
   brew tap mobiledevops/mobiledevops
   brew install maestro

   # 或使用 npm
   npm install -g maestro
   ```

2. 启动 iOS 模拟器或 Android 模拟器

3. 启动应用：
   ```bash
   cd src/app
   npm start
   ```

### 运行测试

```bash
# 运行所有 E2E 测试
cd src/app
npm run test:e2e

# 运行单个测试
maestro test ../tests/e2e/flows/add-entry.yaml
```

## CI/CD 集成

E2E 测试已集成到 GitHub Actions（`.github/workflows/ci.yml`）：

- **触发条件**：main 分支的 push
- **运行环境**：macOS + iOS 模拟器
- **测试结果**：上传为 artifacts

## 测试覆盖

| 流程 | 文件 | 覆盖场景 |
|------|------|----------|
| 添加账目 | `add-entry.yaml` | 空状态 → 添加 → 列表显示 |
| 编辑账目 | `edit-entry.yaml` | 添加 → 编辑 → 验证修改 |
| 删除账目 | `delete-entry.yaml` | 添加 → 删除 → 确认对话框 → 验证删除 |

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

1. 确保应用已完全加载
2. 检查 `testID` 是否正确添加
3. 使用 `maestro studio` 进行调试

### 模拟器启动失败

```bash
# 重置模拟器
xcrun simctl shutdown all
xcrun simctl erase all
```

### CI 测试超时

增加 `waitForAnimationToEnd` 的 timeout 值。
