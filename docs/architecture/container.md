# 容器架构图 (C4 - Level 2)

展示系统内部的容器（应用、数据库、服务）及其交互。

```mermaid
graph TB
    subgraph 用户设备
        App[移动应用<br/>React Native]
        LocalDB[(本地数据库<br/>SQLite)]
        SyncEngine[同步引擎]
        
        App --> LocalDB
        App --> SyncEngine
        SyncEngine --> LocalDB
    end
    
    subgraph 云端
        API[API 服务<br/>Go]
        CloudDB[(云端数据库<br/>PostgreSQL)]
        Cache[(缓存<br/>Redis)]
        Auth[认证服务]
        
        API --> CloudDB
        API --> Cache
        API --> Auth
    end
    
    subgraph 外部服务
        Push[推送服务]
        Storage[对象存储]
    end
    
    SyncEngine --> |HTTPS/REST| API
    API --> Push
    API --> Storage

    style App fill:#bbf,stroke:#333
    style LocalDB fill:#ffd,stroke:#333
    style SyncEngine fill:#bfb,stroke:#333
    style API fill:#fbb,stroke:#333
    style CloudDB fill:#ffd,stroke:#333
    style Cache fill:#ffd,stroke:#333
    style Auth fill:#fbf,stroke:#333
```

## 容器说明

### 用户设备端

| 容器 | 技术栈 | 职责 |
|------|--------|------|
| 移动应用 | React Native | UI 展示、用户交互 |
| 本地数据库 | SQLite | 数据持久化、离线存储 |
| 同步引擎 | TypeScript | 增量同步、冲突解决 |

### 云端

| 容器 | 技术栈 | 职责 |
|------|--------|------|
| API 服务 | Go | 业务逻辑、数据接口 |
| 云端数据库 | PostgreSQL | 数据存储、事务支持 |
| 缓存 | Redis | 会话管理、热点数据 |
| 认证服务 | JWT | 用户认证、授权 |

## 数据流

### 本地操作流程
1. 用户在 App 中操作
2. 数据写入本地 SQLite
3. 同步引擎记录变更

### 同步流程
1. 同步引擎检测网络
2. 发送增量变更到 API
3. API 处理并返回结果
4. 同步引擎更新本地版本
