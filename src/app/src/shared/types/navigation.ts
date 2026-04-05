/**
 * 导航类型定义
 */
import type { LedgerEntry } from '../../features/ledger/types/ledger.types';

export type RootStackParamList = {
  LedgerList: undefined;
  AddEntry: undefined;
  EditEntry: { entryId: string };
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}

/**
 * 导航路由名称
 */
export const ROUTES = {
  LEDGER_LIST: 'LedgerList' as const,
  ADD_ENTRY: 'AddEntry' as const,
  EDIT_ENTRY: 'EditEntry' as const,
};
