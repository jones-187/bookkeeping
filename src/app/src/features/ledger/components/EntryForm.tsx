/**
 * 账目表单组件
 */
import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  TextInput,
  Button,
  SegmentedButtons,
  Text,
  useTheme,
} from 'react-native-paper';
import { entryFormSchema, EntryFormData } from '../../../shared/types/form';

interface EntryFormProps {
  initialValues?: Partial<EntryFormData>;
  onSubmit: (data: EntryFormData) => Promise<void>;
  onDelete?: () => Promise<void>;
  submitLabel?: string;
  loading?: boolean;
}

export default function EntryForm({
  initialValues,
  onSubmit,
  onDelete,
  submitLabel = '保存',
  loading = false,
}: EntryFormProps) {
  const theme = useTheme();

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
  } = useForm<EntryFormData>({
    resolver: zodResolver(entryFormSchema),
    defaultValues: {
      type: 'expense',
      date: new Date().toISOString().split('T')[0],
      ...initialValues,
    },
  });

  // 当 initialValues 变化时（例如编辑页面数据加载完成），重置表单
  useEffect(() => {
    if (initialValues) {
      reset({
        type: 'expense',
        date: new Date().toISOString().split('T')[0],
        ...initialValues,
      });
    }
  }, [initialValues, reset]);

  const type = watch('type');

  return (
    <View style={styles.container}>
      <Controller
        control={control}
        name="type"
        render={({ field: { onChange, value } }) => (
          <View style={styles.field}>
            <Text style={styles.label}>类型</Text>
            <SegmentedButtons
              value={value}
              onValueChange={onChange}
              buttons={[
                {
                  value: 'expense',
                  label: '支出',
                  icon: 'arrow-up',
                  style: value === 'expense' ? { backgroundColor: '#FFEBEE' } : undefined,
                  testID: 'type-expense',
                  accessibilityLabel: '支出',
                },
                {
                  value: 'income',
                  label: '收入',
                  icon: 'arrow-down',
                  style: value === 'income' ? { backgroundColor: '#E8F5E9' } : undefined,
                  testID: 'type-income',
                  accessibilityLabel: '收入',
                },
              ]}
            />
          </View>
        )}
      />

      <Controller
        control={control}
        name="amount"
        render={({ field: { onChange, onBlur, value } }) => (
          <View style={styles.field}>
            <TextInput
              label="金额（元）"
              value={value ? String(value) : ''}
              onChangeText={(text) => {
                const num = parseFloat(text);
                onChange(isNaN(num) ? undefined : num);
              }}
              onBlur={onBlur}
              keyboardType="decimal-pad"
              error={!!errors.amount}
              mode="outlined"
              left={<TextInput.Affix text="¥" />}
              testID="amount-input"
              accessibilityLabel="金额输入"
            />
            {errors.amount && (
              <Text style={styles.error}>{errors.amount.message}</Text>
            )}
          </View>
        )}
      />

      <Controller
        control={control}
        name="description"
        render={({ field: { onChange, onBlur, value } }) => (
          <View style={styles.field}>
            <TextInput
              label="描述"
              value={value || ''}
              onChangeText={onChange}
              onBlur={onBlur}
              multiline
              numberOfLines={3}
              error={!!errors.description}
              mode="outlined"
              placeholder="例如：午餐、交通、工资等"
              testID="description-input"
              accessibilityLabel="描述输入"
            />
            {errors.description && (
              <Text style={styles.error}>{errors.description.message}</Text>
            )}
          </View>
        )}
      />

      <Controller
        control={control}
        name="date"
        render={({ field: { onChange, value } }) => (
          <View style={styles.field}>
            <TextInput
              label="日期"
              value={value}
              onChangeText={onChange}
              error={!!errors.date}
              mode="outlined"
              placeholder="YYYY-MM-DD"
              right={<TextInput.Icon icon="calendar" />}
              testID="date-input"
              accessibilityLabel="日期输入"
            />
            {errors.date && (
              <Text style={styles.error}>{errors.date.message}</Text>
            )}
          </View>
        )}
      />

      <View style={styles.buttons}>
        <Button
          mode="contained"
          onPress={handleSubmit(onSubmit)}
          loading={loading}
          disabled={loading}
          style={[styles.button, { backgroundColor: theme.colors.primary }]}
          testID="submit-button"
          accessibilityLabel={submitLabel}
        >
          {submitLabel}
        </Button>

        {onDelete && (
          <Button
            mode="outlined"
            onPress={onDelete}
            loading={loading}
            disabled={loading}
            textColor="#F44336"
            style={styles.button}
            testID="delete-button"
            accessibilityLabel="删除"
          >
            删除
          </Button>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  field: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    marginBottom: 8,
    color: '#666',
  },
  error: {
    color: '#F44336',
    fontSize: 12,
    marginTop: 4,
  },
  buttons: {
    marginTop: 24,
    gap: 12,
  },
  button: {
    paddingVertical: 6,
  },
});
