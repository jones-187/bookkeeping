import { useState, type ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { LedgerEntryInput } from '../contract';

interface EntryFormProps {
  children?: ReactNode;
  initialValues: LedgerEntryInput;
  onCancel: () => void;
  onSubmit: (input: LedgerEntryInput) => Promise<void>;
  saveLabel: string;
  title: string;
}

/**
 * 新增和编辑共用的纯输入表单。
 * 金额保留为用户输入的十进制字符串，解析与校验由 Ledger 完成。
 */
export function EntryForm({
  children,
  initialValues,
  onCancel,
  onSubmit,
  saveLabel,
  title,
}: EntryFormProps) {
  const [values, setValues] = useState<LedgerEntryInput>(initialValues);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const save = async () => {
    if (isSaving) {
      return;
    }

    setError(null);
    setIsSaving(true);

    try {
      await onSubmit(values);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : '无法保存账目，请稍后重试。');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.select({ android: 'height', ios: 'padding' })}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
            <Pressable
              accessibilityLabel="取消"
              accessibilityRole="button"
              disabled={isSaving}
              onPress={onCancel}
              style={styles.cancelButton}
            >
              <Text style={styles.cancelText}>取消</Text>
            </Pressable>
          </View>
          <View style={styles.field}>
            <Text style={styles.label}>金额</Text>
            <TextInput
              accessibilityLabel="金额"
              inputMode="decimal"
              onChangeText={(amount) => setValues((current) => ({ ...current, amount }))}
              placeholder="例如 12.34"
              placeholderTextColor="#6b7280"
              style={styles.input}
              value={values.amount}
            />
          </View>
          <View style={styles.field}>
            <Text style={styles.label}>收支类型</Text>
            <View style={styles.typeButtons}>
              {(['income', 'expense'] as const).map((type) => {
                const label = type === 'income' ? '收入' : '支出';
                return (
                  <Pressable
                    accessibilityLabel={label}
                    accessibilityRole="button"
                    accessibilityState={{ selected: values.type === type }}
                    key={type}
                    onPress={() => setValues((current) => ({ ...current, type }))}
                    style={values.type === type ? styles.selectedType : styles.typeButton}
                  >
                    <Text style={values.type === type ? styles.selectedTypeText : styles.typeText}>
                      {label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
          <View style={styles.field}>
            <Text style={styles.label}>说明</Text>
            <TextInput
              accessibilityLabel="说明"
              onChangeText={(description) =>
                setValues((current) => ({ ...current, description }))
              }
              placeholder="例如 午餐"
              placeholderTextColor="#6b7280"
              style={styles.input}
              value={values.description}
            />
          </View>
          <View style={styles.field}>
            <Text style={styles.label}>日期</Text>
            <TextInput
              accessibilityLabel="日期"
              onChangeText={(date) => setValues((current) => ({ ...current, date }))}
              placeholder="YYYY-MM-DD"
              placeholderTextColor="#6b7280"
              style={styles.input}
              value={values.date}
            />
          </View>
          {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
          <Pressable
            accessibilityLabel={saveLabel}
            accessibilityRole="button"
            accessibilityState={{ disabled: isSaving }}
            disabled={isSaving}
            onPress={() => void save()}
            style={styles.saveButton}
          >
            <Text style={styles.saveButtonText}>{isSaving ? '正在保存…' : saveLabel}</Text>
          </Pressable>
          {children}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: '#fff',
    flex: 1,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  container: {
    gap: 16,
    flexGrow: 1,
    padding: 20,
    paddingBottom: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelButton: {
    padding: 8,
  },
  cancelText: {
    color: '#164e63',
    fontWeight: '600',
  },
  field: {
    gap: 8,
  },
  label: {
    color: '#1f2937',
    fontSize: 15,
    fontWeight: '600',
  },
  input: {
    backgroundColor: '#fff',
    borderColor: '#9ca3af',
    borderRadius: 8,
    borderWidth: 1,
    color: '#111827',
    fontSize: 16,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  typeButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  typeButton: {
    borderColor: '#9ca3af',
    borderRadius: 8,
    borderWidth: 1,
    padding: 12,
  },
  typeText: {
    color: '#1f2937',
    fontWeight: '600',
  },
  selectedTypeText: {
    color: '#1d4ed8',
    fontWeight: '700',
  },
  error: {
    color: '#b42318',
  },
  selectedType: {
    backgroundColor: '#dbeafe',
    borderColor: '#2563eb',
    borderRadius: 8,
    borderWidth: 1,
    padding: 12,
  },
  saveButton: {
    alignItems: 'center',
    backgroundColor: '#164e63',
    borderRadius: 8,
    padding: 14,
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: '700',
  },
});
