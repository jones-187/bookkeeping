# Agent 开发指南

## E2E 测试 (Maestro)

### 输出目录配置

运行 Maestro 测试时，测试产物会自动保存到项目目录：

- 调试输出：`tests/e2e/debug/`
- 测试结果：`tests/e2e/results/`
- 截图：`tests/e2e/screenshots/`

运行测试命令（推荐使用命令行参数指定输出目录）：
```bash
maestro test --debug-output tests/e2e/debug --test-output-dir tests/e2e/results tests/e2e/flows/test-suite.yaml
```

或运行单个测试：
```bash
maestro test --debug-output tests/e2e/debug --test-output-dir tests/e2e/results tests/e2e/flows/add-entry/happy-path.yaml
```

### 手动截图

使用 adb 手动截图时，保存到项目目录：
```bash
adb exec-out screencap -p > "tests/e2e/screenshots/xxx.png"
```

### 截图查看流程

**重要**：Read 工具读取图片存在缓存问题，可能返回错误内容。

查看截图的正确流程：
1. 我截图保存到项目目录
2. **我通知您截图路径，然后停止输出等待您粘贴图片**
3. **您手动粘贴图片到对话中**
4. 我根据您提供的图片内容进行分析

**原则**：尽可能减少截图次数，避免不必要的人工介入。

### 测试文件位置

- 测试流程定义：`tests/e2e/flows/`
- 测试结果输出：`tests/e2e/results/`
- 手动截图：`tests/e2e/screenshots/`
- 调试输出：`tests/e2e/debug/`

### 测试数据隔离

#### 设计原则

1. **每个测试独立**: 测试之间不应有数据依赖
2. **测试前重置**: 使用 `_reset.yaml` 流程重置数据
3. **唯一命名**: 使用 `TEST_{类型}_{序号}` 格式

#### 深层链接重置 API

开发模式下可用：
- `exp://192.168.31.249:8081/--/reset-test-data` - 软删除测试数据
- `exp://192.168.31.249:8081/--/reset-all-data` - 清空所有数据

#### 添加新测试流程

1. 复制现有流程文件
2. 修改测试数据名称（使用唯一标识）
3. 确保开头包含 `- runFlow: _reset.yaml`
4. 使用精确断言验证特定数据

## 计划文件

Superpower 计划文件位于 `docs/superpowers/plans/`：
- `2026-04-06-maestro-e2e-test-stability.md` - E2E 测试稳定性修复计划
- `2026-04-06-maestro-e2e-test-isolation.md` - E2E 测试数据隔离计划