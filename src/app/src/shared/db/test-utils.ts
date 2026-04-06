/**
 * 测试工具函数 - 仅用于 E2E 测试
 * 所有函数都受 __DEV__ 保护，确保生产环境不可用
 */
import { getNativeDatabase } from './native-db';

/**
 * 重置所有测试数据（标记为已删除）
 * 软删除所有描述以 TEST_ 或 E2E 开头的条目
 */
export async function resetTestData(): Promise<void> {
  if (!__DEV__) {
    console.warn('resetTestData is only available in DEV mode');
    return;
  }

  try {
    const db = await getNativeDatabase();
    const now = new Date().toISOString();

    // 软删除所有测试数据
    await db.runAsync(
      `UPDATE ledger_entries
       SET deleted_at = ?
       WHERE description LIKE 'TEST_%'
          OR description LIKE 'E2E %'
          OR description LIKE 'Edit Test %'
          OR description LIKE 'Test Data %'`,
      [now]
    );

    console.log('[TestUtils] Test data reset completed');
  } catch (error) {
    console.error('[TestUtils] Failed to reset test data:', error);
  }
}

/**
 * 完全清空数据库 - 谨慎使用
 * 仅用于测试前的完全重置
 */
export async function resetAllData(): Promise<void> {
  if (!__DEV__) {
    console.warn('resetAllData is only available in DEV mode');
    return;
  }

  try {
    const db = await getNativeDatabase();
    // 硬删除所有数据（测试环境专用）
    await db.runAsync('DELETE FROM ledger_entries');
    console.log('[TestUtils] All data cleared');
  } catch (error) {
    console.error('[TestUtils] Failed to clear data:', error);
  }
}

/**
 * 生成唯一测试数据标识
 * 格式: TEST_{timestamp}_{random}
 */
export function generateTestId(prefix: string = 'TEST'): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}_${timestamp}_${random}`;
}
