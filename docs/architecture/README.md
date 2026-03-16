# 架构图文档

本目录存放基于 Mermaid 的 C4 模型架构图。

## C4 模型层级

| 层级 | 名称 | 说明 |
|------|------|------|
| L1 | Context | 系统上下文，用户如何使用 App |
| L2 | Container | 容器图，App、API、数据库的交互 |
| L3 | Component | 组件图，内部模块结构 |
| L4 | Code | 代码级类图 |

## 现有架构图

- [系统上下文图](./context.md) - L1 Context 层级
- [容器架构图](./container.md) - L2 Container 层级

## Mermaid 渲染

GitHub/GitLab 原生支持 Mermaid 语法渲染，无需额外工具。
