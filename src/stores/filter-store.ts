import { create } from 'zustand';

interface FilterState {
  dateFilter: string;
  accountFilter: string;
  productFilter: string;
  pageFilter: string;
  setDateFilter: (date: string) => void;
  setAccountFilter: (account: string) => void;
  setProductFilter: (product: string) => void;
  setPageFilter: (page: string) => void;
  resetFilters: () => void;
}

export const useFilterStore = create<FilterState>((set) => ({
  dateFilter: '',
  accountFilter: 'all',
  productFilter: 'all',
  pageFilter: 'all',
  setDateFilter: (date) => set({ dateFilter: date }),
  setAccountFilter: (account) => set({ accountFilter: account }),
  setProductFilter: (product) => set({ productFilter: product }),
  setPageFilter: (page) => set({ pageFilter: page }),
  resetFilters: () => set({ dateFilter: '', accountFilter: 'all', productFilter: 'all', pageFilter: 'all' }),
}));
