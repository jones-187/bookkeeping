# API 定义文档

本目录存放 API 接口定义和 OpenAPI/Swagger 规范。

## API 设计原则

1. **RESTful 风格**：遵循 REST 架构约束
2. **版本控制**：使用 URL 版本控制 (如 `/api/v1/`)
3. **统一响应格式**：标准化的成功/错误响应
4. **幂等性**：关键操作支持幂等

## 文档结构

```
api/
├── openapi.yaml          # OpenAPI 主文件
├── schemas/              # 数据模型定义
│   ├── transaction.yaml
│   ├── account.yaml
│   └── category.yaml
└── paths/                # 接口路径定义
    ├── transactions.yaml
    ├── accounts.yaml
    └── sync.yaml
```

## 现有 API 文档

(待添加)
