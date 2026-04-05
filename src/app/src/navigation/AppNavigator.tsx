/**
 * 应用导航配置
 */
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { LedgerNavigator } from './features/ledgerNavigator';

export function AppNavigator() {
  return (
    <NavigationContainer>
      <LedgerNavigator />
    </NavigationContainer>
  );
}
