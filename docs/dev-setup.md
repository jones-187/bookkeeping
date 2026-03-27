# 开发设置

最后更新：2026-03-27

## 前置条件

- Node.js 22.x
- npm 10.x+
- Go 1.22.2+
- 可选：`make`

## 引导

### Windows PowerShell

```powershell
cd E:\User_File\project\Project\bookkeeping\src\app
npm install

cd E:\User_File\project\Project\bookkeeping\src\server
go mod download
```

### 使用 make

```bash
make setup
```

## 运行当前脚手架

### 服务端

```powershell
cd E:\User_File\project\Project\bookkeeping\src\server
go run ./cmd/server
```

### 应用

```powershell
cd E:\User_File\project\Project\bookkeeping\src\app
Copy-Item .env.example .env
npm start
```

应用期望：

```dotenv
EXPO_PUBLIC_API_BASE_URL=http://localhost:8080
```

对于物理设备，请将 `localhost` 替换为你计算机可访问的 IP 地址。

## 测试和 Lint

### 应用

```powershell
cd E:\User_File\project\Project\bookkeeping\src\app
npm run lint
npm test -- --runInBand
```

### 服务端

```powershell
cd E:\User_File\project\Project\bookkeeping\src\server
go test ./...
go build ./cmd/server
```

## 当前已实现的行为

仓库中唯一的端到端行为是服务状态页面：

- 应用加载
- 应用请求 `GET /api/v1/bootstrap`
- 成功状态渲染 bootstrap 数据
- 失败状态渲染错误框和重试按钮

## 注意事项

- 对于当前脚手架，Windows 上不需要 `make`
- 在这些模块存在之前，数据库、迁移、同步和身份验证命令有意缺失
