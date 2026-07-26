import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { Ledger, LedgerEntry, LedgerSnapshot } from '../contract';
import { LedgerSummary } from './LedgerSummary';
import { formatCny } from './money';

interface LedgerListScreenProps {
  ledger: Ledger;
  onAdd: () => void;
  onEdit: (entry: LedgerEntry) => void;
}

type SnapshotState =
  | { status: 'loading' }
  | { status: 'ready'; snapshot: LedgerSnapshot }
  | { status: 'error' };

export function LedgerListScreen({ ledger, onAdd, onEdit }: LedgerListScreenProps) {
  const requestId = useRef(0);
  const [state, setState] = useState<SnapshotState>({ status: 'loading' });

  const loadSnapshot = useCallback(() => {
    const currentRequest = requestId.current + 1;
    requestId.current = currentRequest;
    setState({ status: 'loading' });

    void ledger.snapshot().then(
      (snapshot) => {
        if (requestId.current === currentRequest) {
          setState({ status: 'ready', snapshot });
        }
      },
      () => {
        if (requestId.current === currentRequest) {
          setState({ status: 'error' });
        }
      },
    );
  }, [ledger]);

  useFocusEffect(
    useCallback(() => {
      loadSnapshot();

      return () => {
        requestId.current += 1;
      };
    }, [loadSnapshot]),
  );

  if (state.status === 'loading') {
    return (
      <SafeAreaView edges={['top', 'bottom']} style={styles.safeArea}>
        <Text style={styles.message}>正在读取账目…</Text>
      </SafeAreaView>
    );
  }

  if (state.status === 'error') {
    return (
      <SafeAreaView edges={['top', 'bottom']} style={styles.safeArea}>
        <View style={styles.error}>
          <Text style={styles.message}>无法读取本地账目，请稍后重试。</Text>
          <Pressable
            accessibilityLabel="重试读取"
            accessibilityRole="button"
            onPress={loadSnapshot}
            style={styles.retryButton}
          >
            <Text style={styles.retryButtonText}>重试</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const { entries, summary } = state.snapshot;

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <LedgerSummary summary={summary} />
        <Pressable
          accessibilityLabel="新增账目"
          accessibilityRole="button"
          onPress={onAdd}
          style={styles.addButton}
        >
          <Text style={styles.addButtonText}>新增账目</Text>
        </Pressable>
        {entries.length === 0 ? (
          <Text style={styles.message}>还没有账目条目</Text>
        ) : (
          entries.map((entry) => (
            <Pressable
              accessibilityLabel={`编辑 ${entry.description}`}
              accessibilityRole="button"
              key={entry.id}
              onPress={() => onEdit(entry)}
              style={styles.entry}
            >
              <View>
                <Text style={styles.description}>{entry.description}</Text>
                <Text style={styles.date}>{entry.date}</Text>
              </View>
              <Text style={entry.type === 'expense' ? styles.expense : styles.income}>
                {entry.type === 'expense' ? '-' : '+'}
                {formatCny(entry.amount)}
              </Text>
            </Pressable>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: '#fff',
    flex: 1,
  },
  content: {
    flexGrow: 1,
  },
  message: {
    padding: 20,
    textAlign: 'center',
  },
  error: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  retryButton: {
    borderColor: '#164e63',
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  retryButtonText: {
    color: '#164e63',
    fontWeight: '600',
  },
  entry: {
    alignItems: 'center',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#d8d8d8',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  addButton: {
    alignItems: 'center',
    backgroundColor: '#164e63',
    borderRadius: 8,
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 14,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '700',
  },
  description: {
    fontSize: 17,
    fontWeight: '500',
  },
  date: {
    color: '#666',
    marginTop: 4,
  },
  income: {
    color: '#157a36',
    fontVariant: ['tabular-nums'],
    fontWeight: '600',
  },
  expense: {
    color: '#b42318',
    fontVariant: ['tabular-nums'],
    fontWeight: '600',
  },
});
