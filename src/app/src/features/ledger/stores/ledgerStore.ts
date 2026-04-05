/**
 * Ledger Store - Zustand 状态管理
 */
import { create } from 'zustand';
import {
  LedgerEntry,
  LedgerEntryFilter,
  CreateEntryInput,
  UpdateEntryInput,
  EntrySummary,
} from '../types/ledger.types';

interface LedgerState {
  // State
  entries: LedgerEntry[];
  summary: EntrySummary | null;
  isLoading: boolean;
  error: Error | null;
  filter: LedgerEntryFilter;

  // Actions
  fetchEntries: () => Promise<void>;
  fetchSummary: () => Promise<void>;
  createEntry: (input: CreateEntryInput) => Promise<LedgerEntry>;
  updateEntry: (input: UpdateEntryInput) => Promise<LedgerEntry>;
  deleteEntry: (id: string) => Promise<void>;
  setFilter: (filter: Partial<LedgerEntryFilter>) => void;
  clearError: () => void;
}

// 动态导入服务实例，避免循环依赖
let serviceInstance: ReturnType<typeof import('../services/LedgerEntryService').LedgerEntryService> | null = null;

const getService = async () => {
  if (!serviceInstance) {
    const { LedgerEntryService } = await import('../services/LedgerEntryService');
    const { LedgerEntryRepository } = await import('../repositories/LedgerEntryRepository');
    serviceInstance = new LedgerEntryService(new LedgerEntryRepository());
  }
  return serviceInstance;
};

export const useLedgerStore = create<LedgerState>((set, get) => ({
  entries: [],
  summary: null,
  isLoading: false,
  error: null,
  filter: {},

  fetchEntries: async () => {
    const { filter } = get();
    set({ isLoading: true, error: null });
    try {
      const service = await getService();
      const entries = await service.getList(filter);
      set({ entries, isLoading: false });
    } catch (error) {
      set({ error: error as Error, isLoading: false });
    }
  },

  fetchSummary: async () => {
    const { filter } = get();
    try {
      const service = await getService();
      const summary = await service.getSummary(filter);
      set({ summary });
    } catch (error) {
      set({ error: error as Error });
    }
  },

  createEntry: async (input: CreateEntryInput) => {
    set({ isLoading: true, error: null });
    try {
      const service = await getService();
      const entry = await service.create(input);
      // Refresh data
      const { fetchEntries, fetchSummary } = get();
      await Promise.all([fetchEntries(), fetchSummary()]);
      set({ isLoading: false });
      return entry;
    } catch (error) {
      set({ error: error as Error, isLoading: false });
      throw error;
    }
  },

  updateEntry: async (input: UpdateEntryInput) => {
    set({ isLoading: true, error: null });
    try {
      const service = await getService();
      const entry = await service.update(input);
      // Refresh data
      const { fetchEntries, fetchSummary } = get();
      await Promise.all([fetchEntries(), fetchSummary()]);
      set({ isLoading: false });
      return entry;
    } catch (error) {
      set({ error: error as Error, isLoading: false });
      throw error;
    }
  },

  deleteEntry: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const service = await getService();
      await service.delete(id);
      // Refresh data
      const { fetchEntries, fetchSummary } = get();
      await Promise.all([fetchEntries(), fetchSummary()]);
      set({ isLoading: false });
    } catch (error) {
      set({ error: error as Error, isLoading: false });
      throw error;
    }
  },

  setFilter: (filter: Partial<LedgerEntryFilter>) => {
    set((state) => ({ filter: { ...state.filter, ...filter } }));
  },

  clearError: () => {
    set({ error: null });
  },
}));
