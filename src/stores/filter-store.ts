import { create } from 'zustand';

interface FilterState {
  dateFilter: string;
  accountFilter: string;
  productFilter: string;
  setDateFilter: (date: string) => void;
  setAccountFilter: (account: string) => void;
  setProductFilter: (product: string) => void;
  resetFilters: () => void;
}

export const useFilterStore = create<FilterState>((set) => ({
  dateFilter: '',
  accountFilter: 'all',
  productFilter: 'all',
  setDateFilter: (date) => set({ dateFilter: date }),
  setAccountFilter: (account) => set({ accountFilter: account }),
  setProductFilter: (product) => set({ productFilter: product }),
  resetFilters: () => set({ dateFilter: '', accountFilter: 'all', productFilter: 'all' }),
}));
