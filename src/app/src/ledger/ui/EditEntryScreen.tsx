import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { Ledger, LedgerEntry, LedgerEntryInput } from '../contract';
import { EntryForm } from './EntryForm';
import { formatCentsForInput } from './money';

interface EditEntryScreenProps {
  entry: LedgerEntry;
  ledger: Ledger;
  onComplete: () => void;
}

function entryToInput(entry: LedgerEntry): LedgerEntryInput {
  return {
    amount: formatCentsForInput(entry.amount),
    type: entry.type,
    description: entry.description,
    date: entry.date,
  };
}

/** 编辑页面执行完整替换；领域模块仍是唯一的校验与持久化边界。 */
export function EditEntryScreen({ entry, ledger, onComplete }: EditEntryScreenProps) {
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const remove = async () => {
    if (isDeleting) {
      return;
    }

    setDeleteError(null);
    setIsDeleting(true);

    try {
      await ledger.remove(entry.id);
      onComplete();
    } catch (reason) {
      setDeleteError(reason instanceof Error ? reason.message : '无法删除账目，请稍后重试。');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <EntryForm
      initialValues={entryToInput(entry)}
      onCancel={onComplete}
      onSubmit={async (input) => {
        await ledger.update(entry.id, input);
        onComplete();
      }}
      saveLabel="保存修改"
      title="编辑账目"
    >
      <View style={styles.deleteSection}>
        {isConfirmingDelete ? (
          <>
            <Text>确定删除这笔账目？</Text>
            {deleteError ? <Text accessibilityRole="alert">{deleteError}</Text> : null}
            <View style={styles.deleteActions}>
              <Pressable
                accessibilityLabel="取消删除"
                accessibilityRole="button"
                disabled={isDeleting}
                onPress={() => {
                  setDeleteError(null);
                  setIsConfirmingDelete(false);
                }}
                style={styles.cancelButton}
              >
                <Text>取消</Text>
              </Pressable>
              <Pressable
                accessibilityLabel="确认删除"
                accessibilityRole="button"
                accessibilityState={{ disabled: isDeleting }}
                disabled={isDeleting}
                onPress={() => void remove()}
                style={styles.confirmDeleteButton}
              >
                <Text style={styles.confirmDeleteText}>
                  {isDeleting ? '正在删除…' : '确认删除'}
                </Text>
              </Pressable>
            </View>
          </>
        ) : (
          <Pressable
            accessibilityLabel="删除账目"
            accessibilityRole="button"
            onPress={() => setIsConfirmingDelete(true)}
            style={styles.deleteButton}
          >
            <Text style={styles.deleteButtonText}>删除账目</Text>
          </Pressable>
        )}
      </View>
    </EntryForm>
  );
}

const styles = StyleSheet.create({
  deleteSection: {
    borderTopColor: '#d8d8d8',
    borderTopWidth: StyleSheet.hairlineWidth,
    gap: 12,
    marginTop: 12,
    paddingTop: 20,
  },
  deleteActions: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    borderColor: '#9ca3af',
    borderRadius: 8,
    borderWidth: 1,
    padding: 12,
  },
  deleteButton: {
    alignItems: 'center',
    borderColor: '#b42318',
    borderRadius: 8,
    borderWidth: 1,
    padding: 14,
  },
  deleteButtonText: {
    color: '#b42318',
    fontWeight: '700',
  },
  confirmDeleteButton: {
    alignItems: 'center',
    backgroundColor: '#b42318',
    borderRadius: 8,
    padding: 12,
  },
  confirmDeleteText: {
    color: '#fff',
    fontWeight: '700',
  },
});
