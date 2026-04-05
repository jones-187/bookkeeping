/**
 * 导航类型定义
 */

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
