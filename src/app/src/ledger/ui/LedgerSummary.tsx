import { StyleSheet, Text, View } from 'react-native';

import type { LedgerSummary as LedgerSummaryModel } from '../contract';
import { formatCny } from './money';

interface LedgerSummaryProps {
  summary: LedgerSummaryModel;
}

export function LedgerSummary({ summary }: LedgerSummaryProps) {
  return (
    <View accessibilityLabel="账目汇总" style={styles.container}>
      <Text style={styles.count}>{summary.count} 笔账目</Text>
      <Text style={styles.total}>收入 {formatCny(summary.totalIncome)}</Text>
      <Text style={styles.total}>支出 {formatCny(summary.totalExpense)}</Text>
      <Text style={styles.balance}>结余 {formatCny(summary.balance)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 6,
    padding: 20,
  },
  count: {
    color: '#111827',
    fontSize: 18,
    fontWeight: '600',
  },
  total: {
    color: '#374151',
    fontSize: 16,
  },
  balance: {
    color: '#111827',
    fontSize: 22,
    fontWeight: '700',
  },
});
