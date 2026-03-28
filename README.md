# Bookkeeping

基于 Local-First 架构的记账应用脚手架，包含最小化的 Expo 客户端和 Go API。

## 当前状态

仓库现在包含一个可运行的前端和后端骨架。目前唯一实现的功能是服务状态页面，用于验证：

- Expo 应用可以启动
- Go API 可以启动
- 应用可以获取 `GET /api/v1/bootstrap`
- 成功和失败状态可以正确渲染

尚未实现货币逻辑、本地 SQLite 存储、同步、迁移或身份验证。

## 技术栈

- 应用：Expo + React Native + TypeScript
- 服务端：Go 1.22 + Gin
- 契约：基于 HTTP 的 JSON bootstrap 响应

## 本地运行

### 1. 安装依赖

Windows PowerShell：

```powershell
cd E:\User_File\project\Project\bookkeeping\src\app
npm install

cd E:\User_File\project\Project\bookkeeping\src\server
go mod download
```

如果有 `make` 可用，也可以运行：

```bash
make setup
```

### 2. 启动服务端

```powershell
cd E:\User_File\project\Project\bookkeeping\src\server
go run ./cmd/server
```

服务端默认地址：`http://localhost:8080`

可用端点：

- `GET /healthz`
- `GET /api/v1/bootstrap`

### 3. 配置应用

从 `src/app/.env.example` 创建 `src/app/.env`，默认保持 `EXPO_PUBLIC_API_BASE_URL` 未设置。

平台默认值会自动生效：

- iOS 模拟器和 Web: `http://localhost:8080`
- Android 模拟器: `http://10.0.2.2:8080`

如果你在真实设备上运行应用，或者后端不在本机，请在 `.env` 中显式设置一个设备可访问的地址。

### 4. 启动应用

```powershell
cd E:\User_File\project\Project\bookkeeping\src\app
npm start
```

## 已实现功能

服务状态页面显示：

- 应用标题和简短描述
- 后端连接状态
- 服务名称
- 版本
- 当前服务器时间
- 启用的功能标志
- 后端不可用时的重试按钮

服务端返回的默认功能列表：

- `local-first-ready`
- `offline-ledger-planned`
- `sync-not-enabled`

## 测试命令

应用：

```powershell
cd E:\User_File\project\Project\bookkeeping\src\app
npm test -- --runInBand
npm run lint
```

服务端：

```powershell
cd E:\User_File\project\Project\bookkeeping\src\server
go test ./...
go build ./cmd/server
```

## 下一步

下一个实现阶段应该引入由 SQLite 支持的本地账目流水记录，同时保持无浮点数的货币不变量。
