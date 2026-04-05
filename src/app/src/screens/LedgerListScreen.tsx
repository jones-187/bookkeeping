/**
 * 账目列表页面
 */
import React from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  Text,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Card, FAB, useTheme } from 'react-native-paper';
import { useEntries } from '../hooks/useEntries';
import { RootStackParamList } from '../types/navigation';
import { LedgerEntry } from '../repositories/LedgerEntryRepository';
import * as Money from '../utils/Money';
import { ROUTES } from '../types/navigation';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function LedgerListScreen() {
  const navigation = useNavigation<NavigationProp>();
  const theme = useTheme();
  const { entries, summary, loading, error, refresh } = useEntries();

  const renderEntry = ({ item }: { item: LedgerEntry }) => {
    const isIncome = item.type === 'income';
    const amountColor = isIncome ? '#4CAF50' : '#F44336';
    const prefix = isIncome ? '+' : '-';

    return (
      <Card
        style={styles.entryCard}
        onPress={() => navigation.navigate(ROUTES.EDIT_ENTRY, { entryId: item.id })}
        testID={`entry-item-${item.id}`}
        accessibilityLabel={`账目: ${item.description}, ${prefix}${Money.format(item.amount)}`}
      >
        <Card.Content style={styles.entryContent}>
          <View style={styles.entryLeft}>
            <Text style={styles.entryDescription}>{item.description}</Text>
            <Text style={styles.entryDate}>{item.date}</Text>
          </View>
          <Text style={[styles.entryAmount, { color: amountColor }]}>
            {prefix}{Money.format(item.amount)}
          </Text>
        </Card.Content>
      </Card>
    );
  };

  const renderSummary = () => {
    if (!summary) return null;

    return (
      <Card style={styles.summaryCard} testID="summary-card">
        <Card.Content>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>收入</Text>
              <Text style={[styles.summaryValue, { color: '#4CAF50' }]} testID="total-income">
                +{Money.format(summary.totalIncome)}
              </Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>支出</Text>
              <Text style={[styles.summaryValue, { color: '#F44336' }]} testID="total-expense">
                -{Money.format(summary.totalExpense)}
              </Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>结余</Text>
              <Text style={[styles.summaryValue, { color: summary.balance >= 0 ? '#4CAF50' : '#F44336' }]} testID="balance">
                {Money.format(Math.abs(summary.balance))}
              </Text>
            </View>
          </View>
        </Card.Content>
      </Card>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer} testID="empty-state">
      <Text style={styles.emptyText}>暂无账目记录</Text>
      <Text style={styles.emptyHint}>点击右下角按钮添加第一笔账目</Text>
    </View>
  );

  if (error) {
    return (
      <View style={styles.centerContainer} testID="error-state">
        <Text style={styles.errorText}>加载失败: {error.message}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {renderSummary()}

      {loading && !refreshing ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : (
        <FlatList
          data={entries}
          keyExtractor={(item) => item.id}
          renderItem={renderEntry}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={renderEmpty}
          refreshControl={
            <RefreshControl refreshing={loading} onRefresh={refresh} />
          }
          testID="entry-list"
        />
      )}

      <FAB
        icon="plus"
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        onPress={() => navigation.navigate(ROUTES.ADD_ENTRY)}
        color="#fff"
        testID="add-entry-fab"
        accessibilityLabel="添加账目"
        accessibilityRole="button"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  summaryCard: {
    margin: 16,
    marginBottom: 8,
    elevation: 2,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryItem: {
    alignItems: 'center',
    flex: 1,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  listContent: {
    padding: 16,
    paddingTop: 8,
    paddingBottom: 80,
  },
  entryCard: {
    marginBottom: 8,
    elevation: 1,
  },
  entryContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  entryLeft: {
    flex: 1,
  },
  entryDescription: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  entryDate: {
    fontSize: 12,
    color: '#666',
  },
  entryAmount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 60,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 8,
  },
  emptyHint: {
    fontSize: 14,
    color: '#999',
  },
  errorText: {
    color: '#F44336',
    fontSize: 16,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});

// Workaround for RefreshControl typing
const refreshing = false;
