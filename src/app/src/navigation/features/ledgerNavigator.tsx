/**
 * Ledger Feature Navigator
 */
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { ROUTES } from '../routes';

// Import screens from ledger feature
import LedgerListScreen from '../../features/ledger/screens/LedgerListScreen';
import AddEntryScreen from '../../features/ledger/screens/AddEntryScreen';
import EditEntryScreen from '../../features/ledger/screens/EditEntryScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function LedgerNavigator() {
  return (
    <Stack.Navigator
      initialRouteName={ROUTES.LEDGER_LIST}
      screenOptions={{
        headerStyle: {
          backgroundColor: '#6200ee',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen
        name={ROUTES.LEDGER_LIST}
        component={LedgerListScreen}
        options={{
          title: '账目流水',
        }}
      />
      <Stack.Screen
        name={ROUTES.ADD_ENTRY}
        component={AddEntryScreen}
        options={{
          title: '添加账目',
        }}
      />
      <Stack.Screen
        name={ROUTES.EDIT_ENTRY}
        component={EditEntryScreen}
        options={{
          title: '编辑账目',
        }}
      />
    </Stack.Navigator>
  );
}
