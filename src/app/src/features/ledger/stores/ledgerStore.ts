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
import { LedgerEntryService } from '../services/LedgerEntryService';
import { LedgerEntryRepository } from '../repositories/LedgerEntryRepository';

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

// 创建服务实例
const getService = () => {
  return new LedgerEntryService(new LedgerEntryRepository());
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
      const service = getService();
      const entries = await service.getList(filter);
      set({ entries, isLoading: false });
    } catch (error) {
      set({ error: error as Error, isLoading: false });
    }
  },

  fetchSummary: async () => {
    const { filter } = get();
    try {
      const service = getService();
      const summary = await service.getSummary(filter);
      set({ summary });
    } catch (error) {
      set({ error: error as Error });
    }
  },

  createEntry: async (input: CreateEntryInput) => {
    set({ isLoading: true, error: null });
    try {
      const service = getService();
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
      const service = getService();
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
      const service = getService();
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
