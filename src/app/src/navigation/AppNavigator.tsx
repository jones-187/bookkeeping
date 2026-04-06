/**
 * 应用导航配置
 */
import React, { useEffect, useRef } from 'react';
import { Linking } from 'react-native';
import { NavigationContainer, NavigationContainerRef } from '@react-navigation/native';
import { LedgerNavigator } from './features/ledgerNavigator';
import { resetTestData, resetAllData } from '../shared/db/test-utils';
import { ROUTES } from './routes';

export function AppNavigator() {
  const navigationRef = useRef<NavigationContainerRef>(null);

  useEffect(() => {
    if (!__DEV__) return;

    // 重置导航到首页
    const resetNavigationToHome = () => {
      if (navigationRef.current) {
        navigationRef.current.reset({
          index: 0,
          routes: [{ name: ROUTES.LEDGER_LIST }],
        });
        console.log('[DeepLink] Navigation reset to home');
      }
    };

    // 处理深层链接
    const handleDeepLink = async (event: { url: string }) => {
      const { url } = event;
      console.log('[DeepLink] Received:', url);

      if (url.includes('--/reset-test-data')) {
        console.log('[DeepLink] Resetting test data...');
        await resetTestData();
        resetNavigationToHome();
      } else if (url.includes('--/reset-all-data')) {
        console.log('[DeepLink] Clearing all data...');
        await resetAllData();
        resetNavigationToHome();
      } else if (url.includes('--/go-home')) {
        console.log('[DeepLink] Navigating to home...');
        resetNavigationToHome();
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
    <NavigationContainer ref={navigationRef}>
      <LedgerNavigator />
    </NavigationContainer>
  );
}
