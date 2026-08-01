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

type WriteState = 'idle' | 'saving' | 'deleting';

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
  const [writeState, setWriteState] = useState<WriteState>('idle');
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const isBusy = writeState !== 'idle';

  const remove = async () => {
    if (isBusy) {
      return;
    }

    setDeleteError(null);
    setWriteState('deleting');

    try {
      await ledger.remove(entry.id);
      onComplete();
    } catch (reason) {
      setDeleteError(reason instanceof Error ? reason.message : '无法删除账目，请稍后重试。');
    } finally {
      setWriteState('idle');
    }
  };

  return (
    <EntryForm
      initialValues={entryToInput(entry)}
      isBusy={isBusy}
      onCancel={onComplete}
      onSubmit={async (input) => {
        if (isBusy) {
          return;
        }

        setWriteState('saving');
        try {
          await ledger.update(entry.id, input);
          onComplete();
        } finally {
          setWriteState('idle');
        }
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
                disabled={isBusy}
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
                accessibilityState={{ disabled: isBusy }}
                disabled={isBusy}
                onPress={() => void remove()}
                style={styles.confirmDeleteButton}
              >
                <Text style={styles.confirmDeleteText}>
                  {writeState === 'deleting' ? '正在删除…' : '确认删除'}
                </Text>
              </Pressable>
            </View>
          </>
        ) : (
          <Pressable
            accessibilityLabel="删除账目"
            accessibilityRole="button"
            disabled={isBusy}
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
