/**
 * 应用导航配置
 */
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList, ROUTES } from '../types/navigation';

// Screens
import LedgerListScreen from '../screens/LedgerListScreen';
import AddEntryScreen from '../screens/AddEntryScreen';
import EditEntryScreen from '../screens/EditEntryScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function AppNavigator() {
  return (
    <NavigationContainer>
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
    </NavigationContainer>
  );
}
