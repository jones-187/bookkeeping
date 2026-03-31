# ADR-003: SQLite 库选型

日期：2026-03-31
状态：已接受

## 背景

项目需要在 React Native 应用中实现本地 SQLite 数据库存储。需要选择一个与 Expo 兼容、性能良好、维护活跃的 SQLite 库。

## 候选方案

### 1. expo-sqlite

**优点：**
- Expo 官方支持，与 Expo 生态完美集成
- 最新版本（55.0.11）提供现代 Promise-based API
- 支持 React Hooks（useSQLiteContext）
- 跨平台支持（iOS、Android、Web）
- 活跃维护，文档完善
- 无需 eject Expo 项目

**缺点：**
- 功能相对基础
- Web 平台使用 WebSQL（已废弃）或 SQL.js

### 2. react-native-sqlite-storage

**优点：**
- 功能丰富，性能优秀
- 社区成熟，使用广泛

**缺点：**
- 需要 eject Expo 项目或使用 bare workflow
- 不支持 Expo Go
- 配置复杂

## 决策

选择 **expo-sqlite**

## 理由

1. **Expo 兼容性**：项目使用 Expo 托管工作流，expo-sqlite 无需 eject
2. **官方支持**：Expo 官方维护，长期稳定性有保障
3. **现代 API**：Promise-based API 和 React Hooks 符合现代开发习惯
4. **跨平台**：支持 iOS、Android、Web 三端
5. **简单性**：对于记账应用的需求，expo-sqlite 功能足够

## 影响

- 使用 `npx expo install expo-sqlite` 安装
- 使用 Promise-based API 进行数据库操作
- 使用 `useSQLiteContext` Hook 管理数据库连接
- Web 平台需要额外处理（使用 SQL.js）

## 参考资料

- [Expo SQLite 官方文档](https://docs.expo.dev/versions/latest/sdk/sqlite/)
- [expo-sqlite npm](https://www.npmjs.com/package/expo-sqlite)
