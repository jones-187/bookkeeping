import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import type { Ledger, LedgerEntry } from '../contract';
import { AddEntryScreen } from './AddEntryScreen';
import { EditEntryScreen } from './EditEntryScreen';
import { LedgerListScreen } from './LedgerListScreen';
import { formatLocalDate } from '../localDate';

type LedgerStackParamList = {
  LedgerList: undefined;
  AddEntry: undefined;
  EditEntry: { entry: LedgerEntry };
};

const Stack = createNativeStackNavigator<LedgerStackParamList>();

interface LedgerAppProps {
  ledger: Ledger;
  today?: () => string;
}

/**
 * 账目 UI 的 composition 边界。
 *
 * 后续新增、编辑等界面继续注册在此 stack；页面仅得到已经装配完成的 Ledger。
 */
export function LedgerApp({ ledger, today = formatLocalDate }: LedgerAppProps) {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="LedgerList" options={{ headerShown: false }}>
          {({ navigation }) => (
            <LedgerListScreen
              ledger={ledger}
              onAdd={() => navigation.navigate('AddEntry')}
              onEdit={(entry) => navigation.navigate('EditEntry', { entry })}
            />
          )}
        </Stack.Screen>
        <Stack.Screen name="EditEntry" options={{ headerShown: false }}>
          {({ navigation, route }) => (
            <EditEntryScreen
              entry={route.params.entry}
              ledger={ledger}
              onComplete={() => navigation.goBack()}
            />
          )}
        </Stack.Screen>
        <Stack.Screen name="AddEntry" options={{ headerShown: false }}>
          {({ navigation }) => (
            <AddEntryScreen
              initialDate={today()}
              ledger={ledger}
              onComplete={() => navigation.goBack()}
            />
          )}
        </Stack.Screen>
      </Stack.Navigator>
    </NavigationContainer>
  );
}
