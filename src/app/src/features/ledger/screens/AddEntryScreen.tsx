/**
 * 添加账目页面
 */
import React, { useState } from 'react';
import { View, StyleSheet, Alert, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useLedgerStore } from '../stores/ledgerStore';
import EntryForm from '../components/EntryForm';
import { EntryFormData } from '../../../shared/types/form';

export default function AddEntryScreen() {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const { createEntry } = useLedgerStore();

  const handleSubmit = async (data: EntryFormData) => {
    try {
      setLoading(true);
      await createEntry(data);
      navigation.goBack();
    } catch (error) {
      Alert.alert('添加失败', error instanceof Error ? error.message : '未知错误');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView keyboardShouldPersistTaps="handled">
        <EntryForm onSubmit={handleSubmit} submitLabel="添加" loading={loading} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
