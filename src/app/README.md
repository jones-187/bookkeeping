# 应用工作区

此工作区包含项目的 Expo + React Native 移动外壳。

## 当前范围

- 单屏幕 bootstrap 应用
- 从 `GET /api/v1/bootstrap` 获取后端状态
- 渲染服务名称、版本、服务器时间和功能列表
- 当后端不可用时显示重试操作

## 关键文件

- `App.tsx`：屏幕入口点
- `src/services/api.ts`：后端请求包装器
- `src/types/bootstrap.ts`：bootstrap 响应契约
- `__tests__/App.test.tsx`：UI 状态测试

## 直接运行

```bash
npm install
npm start
```
