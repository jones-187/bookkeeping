/**
 * 数据库初始化和连接管理
 * 根据平台自动选择 SQLite (iOS/Android) 或 IndexedDB (Web)
 */
import { Platform } from 'react-native';
import { Database } from './interface';
import { getNativeDatabase } from './native-db';

let db: Database | null = null;

/**
 * 获取数据库实例
 * Web 平台使用 IndexedDB，原生平台使用 SQLite
 */
export async function getDatabase(): Promise<Database> {
  if (db) {
    return db;
  }

  if (Platform.OS === 'web') {
    // 动态导入 Web 数据库实现
    // 使用 require 以兼容 Jest
    const { getWebDatabase } = require('./web-db');
    db = await getWebDatabase();
  } else {
    db = await getNativeDatabase();
  }

  return db!;
}

// 导出类型
export { Database } from './interface';
export { LedgerEntryRow } from './types';
