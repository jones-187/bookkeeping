/**
 * 编辑账目页面
 */
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useLedgerStore } from '../stores/ledgerStore';
import { useEntry } from '../hooks/useEntry';
import EntryForm from '../components/EntryForm';
import { EntryFormData } from '../../../shared/types/form';
import { RootStackParamList } from '../../../navigation/types';
import * as Money from '../../../shared/utils/Money';

type EditEntryRouteProp = RouteProp<RootStackParamList, 'EditEntry'>;

export default function EditEntryScreen() {
  const navigation = useNavigation();
  const route = useRoute<EditEntryRouteProp>();
  const { entryId } = route.params;

  const { entry, loading, error: loadError } = useEntry(entryId);
  const { updateEntry, deleteEntry } = useLedgerStore();
  const [saving, setSaving] = useState(false);
  const [initialValues, setInitialValues] = useState<Partial<EntryFormData>>();

  useEffect(() => {
    if (entry) {
      setInitialValues({
        amount: Money.toYuan(entry.amount),
        type: entry.type,
        description: entry.description,
        date: entry.date,
      });
    }
  }, [entry]);

  useEffect(() => {
    if (loadError) {
      Alert.alert('加载失败', loadError.message);
      navigation.goBack();
    }
  }, [loadError, navigation]);

  const handleSubmit = async (data: EntryFormData) => {
    try {
      setSaving(true);
      await updateEntry({
        id: entryId,
        ...data,
      });
      navigation.goBack();
    } catch (error) {
      Alert.alert('更新失败', error instanceof Error ? error.message : '未知错误');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    const confirmDelete = () => {
      // 使用 Promise 包装以支持 async/await
      return new Promise<boolean>((resolve) => {
        if (Platform.OS === 'web') {
          // Web 上使用 window.confirm
          resolve(window.confirm('删除后无法恢复，确定要删除这条账目吗？'));
        } else {
          // 原生平台使用 Alert
          Alert.alert(
            '确认删除',
            '删除后无法恢复，确定要删除这条账目吗？',
            [
              { text: '取消', style: 'cancel', onPress: () => resolve(false) },
              { text: '删除', style: 'destructive', onPress: () => resolve(true) },
            ]
          );
        }
      });
    };

    const confirmed = await confirmDelete();
    if (!confirmed) return;

    try {
      setSaving(true);
      await deleteEntry(entryId);
      navigation.goBack();
    } catch (error) {
      if (Platform.OS === 'web') {
        window.alert(error instanceof Error ? error.message : '删除失败');
      } else {
        Alert.alert('删除失败', error instanceof Error ? error.message : '未知错误');
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView keyboardShouldPersistTaps="handled">
        <EntryForm
          initialValues={initialValues}
          onSubmit={handleSubmit}
          onDelete={handleDelete}
          submitLabel="更新"
          loading={saving}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
