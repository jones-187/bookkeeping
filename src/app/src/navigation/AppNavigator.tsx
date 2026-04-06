/**
 * 应用导航配置
 */
import React, { useEffect } from 'react';
import { Linking } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { LedgerNavigator } from './features/ledgerNavigator';
import { resetTestData, resetAllData } from '../shared/db/test-utils';

export function AppNavigator() {
  useEffect(() => {
    if (!__DEV__) return;

    // 处理深层链接
    const handleDeepLink = async (event: { url: string }) => {
      const { url } = event;
      console.log('[DeepLink] Received:', url);

      if (url.includes('--/reset-test-data')) {
        console.log('[DeepLink] Resetting test data...');
        await resetTestData();
      } else if (url.includes('--/reset-all-data')) {
        console.log('[DeepLink] Clearing all data...');
        await resetAllData();
      }
    };

    // 监听深层链接
    const subscription = Linking.addEventListener('url', handleDeepLink);

    // 检查启动时的深层链接
    Linking.getInitialURL().then((url) => {
      if (url) handleDeepLink({ url });
    });

    return () => {
      subscription.remove();
    };
  }, []);

  return (
    <NavigationContainer>
      <LedgerNavigator />
    </NavigationContainer>
  );
}
