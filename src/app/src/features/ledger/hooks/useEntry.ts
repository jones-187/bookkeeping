/**
 * 获取单个账目的 Hook
 */
import { useState, useEffect } from 'react';
import { LedgerEntry } from '../types/ledger.types';
import { LedgerEntryService } from '../services/LedgerEntryService';
import { LedgerEntryRepository } from '../repositories/LedgerEntryRepository';

// 创建服务实例
const getService = () => {
  return new LedgerEntryService(new LedgerEntryRepository());
};

export function useEntry(id: string) {
  const [entry, setEntry] = useState<LedgerEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchEntry = async () => {
      try {
        setLoading(true);
        setError(null);
        const service = getService();
        const data = await service.getById(id);
        setEntry(data);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('未知错误'));
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchEntry();
    }
  }, [id]);

  return { entry, loading, error };
}
