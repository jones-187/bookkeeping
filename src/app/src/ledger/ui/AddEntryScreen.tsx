import type { Ledger, LedgerEntryInput } from '../contract';
import { EntryForm } from './EntryForm';

interface AddEntryScreenProps {
  initialDate: string;
  ledger: Ledger;
  onComplete: () => void;
}

/** 新增账目页面只传递原始输入，校验和金额解析均由 Ledger 负责。 */
export function AddEntryScreen({
  initialDate,
  ledger,
  onComplete,
}: AddEntryScreenProps) {
  const initialValues: LedgerEntryInput = {
    amount: '',
    type: 'income',
    description: '',
    date: initialDate,
  };

  return (
    <EntryForm
      initialValues={initialValues}
      onCancel={onComplete}
      onSubmit={async (input) => {
        await ledger.add(input);
        onComplete();
      }}
      saveLabel="保存账目"
      title="新增账目"
    />
  );
}
