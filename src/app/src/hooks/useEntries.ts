/**
 * 账目数据管理 Hook
 */
import { useState, useEffect, useCallback } from 'react';
import { ledgerEntryService, EntrySummary } from '../services/LedgerEntryService';
import { LedgerEntry, LedgerEntryFilter } from '../repositories/LedgerEntryRepository';

interface UseEntriesResult {
  entries: LedgerEntry[];
  summary: EntrySummary | null;
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
  createEntry: (input: {
    amount: number;
    type: 'income' | 'expense';
    description: string;
    date: string;
  }) => Promise<LedgerEntry>;
  updateEntry: (id: string, input: {
    amount?: number;
    type?: 'income' | 'expense';
    description?: string;
    date?: string;
  }) => Promise<LedgerEntry>;
  deleteEntry: (id: string) => Promise<void>;
}

export function useEntries(filter?: LedgerEntryFilter): UseEntriesResult {
  const [entries, setEntries] = useState<LedgerEntry[]>([]);
  const [summary, setSummary] = useState<EntrySummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [entriesData, summaryData] = await Promise.all([
        ledgerEntryService.getList(filter),
        ledgerEntryService.getSummary(filter),
      ]);
      setEntries(entriesData);
      setSummary(summaryData);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('未知错误'));
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const createEntry = useCallback(async (input: {
    amount: number;
    type: 'income' | 'expense';
    description: string;
    date: string;
  }) => {
    const entry = await ledgerEntryService.create(input);
    await fetchData();
    return entry;
  }, [fetchData]);

  const updateEntry = useCallback(async (id: string, input: {
    amount?: number;
    type?: 'income' | 'expense';
    description?: string;
    date?: string;
  }) => {
    const entry = await ledgerEntryService.update({ id, ...input });
    await fetchData();
    return entry;
  }, [fetchData]);

  const deleteEntry = useCallback(async (id: string) => {
    await ledgerEntryService.delete(id);
    await fetchData();
  }, [fetchData]);

  return {
    entries,
    summary,
    loading,
    error,
    refresh: fetchData,
    createEntry,
    updateEntry,
    deleteEntry,
  };
}

/**
 * 获取单个账目的 Hook
 */
export function useEntry(id: string) {
  const [entry, setEntry] = useState<LedgerEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchEntry = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await ledgerEntryService.getById(id);
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
