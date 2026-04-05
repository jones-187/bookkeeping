/**
 * 获取单个账目的 Hook
 */
import { useState, useEffect } from 'react';
import { LedgerEntry } from '../types/ledger.types';

// 动态导入服务，避免循环依赖
let serviceInstance: Awaited<ReturnType<typeof import('../services/LedgerEntryService').LedgerEntryService>> | null = null;

const getService = async () => {
  if (!serviceInstance) {
    const { LedgerEntryService } = await import('../services/LedgerEntryService');
    const { LedgerEntryRepository } = await import('../repositories/LedgerEntryRepository');
    serviceInstance = new LedgerEntryService(new LedgerEntryRepository());
  }
  return serviceInstance;
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
        const service = await getService();
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
