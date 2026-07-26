import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';

import type { Ledger } from './src/ledger';
import { createNativeLedger } from './src/ledger/native';
import { LedgerApp } from './src/ledger/ui/LedgerApp';

type AppState =
  | { status: 'opening' }
  | { status: 'ready'; ledger: Ledger }
  | { status: 'error' };

interface BookkeepingAppProps {
  openLedger: () => Promise<Ledger>;
}

export function BookkeepingApp({ openLedger }: BookkeepingAppProps) {
  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState<AppState>({ status: 'opening' });

  useEffect(() => {
    let active = true;

    void openLedger()
      .then((ledger) => {
        if (active) {
          setState({ status: 'ready', ledger });
        }
      })
      .catch(() => {
        if (active) {
          setState({ status: 'error' });
        }
      });

    return () => {
      active = false;
    };
  }, [attempt, openLedger]);

  if (state.status === 'ready') {
    return (
      <>
        <StatusBar style="dark" />
        <LedgerApp ledger={state.ledger} />
      </>
    );
  }

  return (
    <View style={styles.centered}>
      <StatusBar style="dark" />
      {state.status === 'opening' ? (
        <>
          <ActivityIndicator accessibilityLabel="正在打开本地账本" />
          <Text style={styles.message}>正在打开本地账本…</Text>
        </>
      ) : (
        <>
          <Text style={styles.message}>无法打开本地账本，请重试。</Text>
          <Pressable
            accessibilityRole="button"
            onPress={() => {
              setState({ status: 'opening' });
              setAttempt((value) => value + 1);
            }}
            style={styles.retryButton}
          >
            <Text style={styles.retryText}>重试</Text>
          </Pressable>
        </>
      )}
    </View>
  );
}

export default function App() {
  return <BookkeepingApp openLedger={createNativeLedger} />;
}

const styles = StyleSheet.create({
  centered: {
    alignItems: 'center',
    flex: 1,
    gap: 16,
    justifyContent: 'center',
    padding: 24,
  },
  message: {
    color: '#303030',
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#1f5eff',
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  retryText: {
    color: '#ffffff',
    fontWeight: '600',
  },
});
