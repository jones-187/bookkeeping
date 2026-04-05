/**
 * 路由常量定义
 */
export const ROUTES = {
  // Ledger Feature
  LEDGER_LIST: 'LedgerList',
  ADD_ENTRY: 'AddEntry',
  EDIT_ENTRY: 'EditEntry',

  // Statistics Feature (未来)
  STATISTICS: 'Statistics',

  // Categories Feature (未来)
  CATEGORY_LIST: 'CategoryList',

  // Settings (未来)
  SETTINGS: 'Settings',
} as const;

export type RouteName = typeof ROUTES[keyof typeof ROUTES];
