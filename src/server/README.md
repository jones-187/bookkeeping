# 后端服务 (API Server)

基于 Go 的高性能 API 服务。

## 目录结构

```
server/
├── cmd/                 # 应用入口
│   └── server/
│       └── main.go
├── internal/            # 内部代码
│   ├── handler/         # HTTP 处理器
│   ├── service/         # 业务逻辑
│   ├── repository/      # 数据访问层
│   ├── model/           # 数据模型
│   └── middleware/      # 中间件
├── pkg/                 # 可复用包
│   ├── decimal/         # 金额精度处理
│   ├── sync/            # 同步协议
│   └── auth/            # 认证授权
├── migrations/          # 数据库迁移
├── config/              # 配置文件
└── tests/               # 服务测试
```

## 核心模块

### 1. API 服务
- RESTful API
- JWT 认证
- 请求验证

### 2. 同步服务
- 版本控制
- 增量同步
- 冲突检测

### 3. 金额处理
- shopspring/decimal
- 精度计算
- 货币转换

## 开发指南

(待补充)
