# 自动化脚本

本目录存放项目自动化脚本。

## 脚本列表

| 脚本 | 用途 | 使用方式 |
|------|------|----------|
| `backup.sh` | 数据备份 | `./scripts/backup.sh` |
| `migrate.sh` | 数据迁移 | `./scripts/migrate.sh` |
| `deploy.sh` | 部署脚本 | `./scripts/deploy.sh` |
| `test.sh` | 测试运行 | `./scripts/test.sh` |

## 开发规范

1. 所有脚本使用 Shell (Bash) 编写
2. 脚本顶部添加使用说明注释
3. 错误处理使用 `set -e`
4. 日志输出清晰明了
