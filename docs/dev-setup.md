# 开发设置

最后更新：2026-04-05

## 前置条件

- Node.js 22.x
- npm 10.x+
- Go 1.22.2+（可选，用于服务端）
- 可选：`make`

## 引导

### macOS / Linux

```bash
cd src/app
npm install

# 服务端（可选）
cd ../server
go mod download
```

### Windows PowerShell

```powershell
cd src/app
npm install

# 服务端（可选）
cd ..\server
go mod download
```

### 使用 make

```bash
make setup
```

## 运行应用

### 启动应用

```bash
cd src/app
npm start
```

然后选择：
- 按 `i` 打开 iOS 模拟器
- 按 `a` 打开 Android 模拟器
- 按 `w` 打开 Web 浏览器

### 启动服务端（可选）

服务端目前仅用于健康检查，未来将支持数据同步：

```bash
cd src/server
go run ./cmd/server
```

服务端地址：`http://localhost:8080`

## 测试

### 单元测试和集成测试

```bash
cd src/app
npm test
```

### E2E 测试

需要先安装 Maestro 和启动模拟器：

```bash
# 安装 Maestro
brew tap mobiledevops/mobiledevops
brew install maestro

# 启动应用后运行
cd src/app
npm run test:e2e
```

详细说明请参考 [tests/e2e/README.md](../../tests/e2e/README.md)。

### 服务端测试

```bash
cd src/server
go test ./...
```

## Lint

```bash
cd src/app
npm run lint
```

## 当前已实现的功能

### 账目管理

- 📝 添加账目（收入/支出）
- ✏️ 编辑账目
- 🗑️ 删除账目（软删除）
- 📋 账目列表（按日期排序）
- 📊 收支汇总

### 数据存储

- 💾 本地 SQLite 存储
- 🔢 金额整数存储（分为单位）
- 🔒 数据验证和错误处理

## 环境配置

从 `src/app/.env.example` 创建 `src/app/.env`：

```bash
cd src/app
cp .env.example .env
```

默认情况下，应用使用本地 SQLite，无需配置服务端地址。

如果需要连接服务端，设置 `EXPO_PUBLIC_API_BASE_URL`：

```env
# iOS 模拟器 / Web
EXPO_PUBLIC_API_BASE_URL=http://localhost:8080

# Android 模拟器
EXPO_PUBLIC_API_BASE_URL=http://10.0.2.2:8080

# 物理设备（使用电脑局域网 IP）
EXPO_PUBLIC_API_BASE_URL=http://192.168.1.x:8080
```

## 注意事项

- 应用可完全离线运行，服务端是可选的
- 所有数据存储在本地 SQLite 数据库
- 货币金额使用整数存储，避免浮点精度问题
