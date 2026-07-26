# Maestro 端到端测试

本目录包含移动端的 Maestro E2E 测试。测试入口是
`flows/test-suite.yaml`，覆盖添加、编辑和删除账目条目的完整流程；各场景也可
从 `flows/add-entry`、`flows/edit-entry` 和 `flows/delete-entry` 单独运行。

## 运行前提

- 已安装 [Maestro](https://maestro.mobile.dev/) 并可执行 `maestro --version`。
- 已启动 Android 或 iOS 模拟器，并在其中启动了应用。
- 在 `src/app` 中运行 Expo 开发服务器，并等待应用进入账目列表页。
- 已设置 `MAESTRO_RESET_URL`，其值是当前设备可访问的 Expo URL，并以
  `/--/reset-all-data` 结尾。

```bash
cd src/app
npm start
```

例如 Metro 显示的地址是 `exp://192.168.1.20:8081` 时，在另一个终端设置：

```bash
export MAESTRO_RESET_URL="exp://192.168.1.20:8081/--/reset-all-data"
```

PowerShell 使用：

```powershell
$env:MAESTRO_RESET_URL="exp://192.168.1.20:8081/--/reset-all-data"
```

Maestro CLI 会自动把以 `MAESTRO_` 开头的 shell 环境变量注入 flow。不要把个人局域网地址提交进 YAML。

## 命令

从 `src/app` 运行完整套件：

```bash
npm run test:e2e
```

运行单个流程时，从 `src/app` 指定对应 YAML 文件：

```bash
maestro test ../../tests/e2e/flows/add-entry/happy-path.yaml
```

## 数据隔离

每个独立场景应在开头运行 `flows/_reset.yaml`。该流程通过 `MAESTRO_RESET_URL` 指向的开发环境重置
深层链接清空测试数据、回到列表页，并等待 `empty-state` 出现后才继续。

新增场景请使用明确的 `TEST_` 前缀测试数据，并断言该测试数据本身，避免
依赖之前的测试执行顺序或设备上的残留数据。

## 产物

测试运行产生的调试信息位于 `tests/e2e/debug/`，结果位于
`tests/e2e/results/`。这两个目录用于本地排查，不应作为测试用例的输入。

## 常见排错

- `App not found`：确认模拟器已启动，且应用已在该模拟器中打开。
- 找不到元素或超时：等待 Metro 构建完成，并确认应用当前停留在账目列表页；
  可使用 `maestro studio` 检查当前界面和选择器。
- `MAESTRO_RESET_URL is undefined` 或无法打开重置链接：按 Metro 当前显示的
  Expo URL 重新设置环境变量，并确认模拟器或真机可以访问该主机。
- 重置后仍有数据：确认开发模式下的重置深层链接可用，并等待 `_reset.yaml`
  的 `empty-state` 断言完成。
- 流程单独通过、整套失败：检查新流程是否先执行重置，以及测试数据与断言
  是否具有唯一性。
