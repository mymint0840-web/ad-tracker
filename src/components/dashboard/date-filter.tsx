'use client';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useFilterStore } from '@/stores/filter-store';
import { RotateCcw } from 'lucide-react';
import type { Product, AdAccount, Page } from '@/types';

interface DateFilterProps {
  accounts: AdAccount[];
  products: Product[];
  pages: Page[];
}

export function DateFilter({ accounts, products, pages }: DateFilterProps) {
  const { dateFilter, accountFilter, productFilter, pageFilter, setDateFilter, setAccountFilter, setProductFilter, setPageFilter, resetFilters } = useFilterStore();

  return (
    <div className="flex flex-wrap items-center gap-3 mb-4">
      <Input type="date" value={dateFilter} onChange={e => setDateFilter(e.target.value)} className="w-44 bg-white/[0.06] border-white/[0.1] text-white" />
      <select value={accountFilter} onChange={e => setAccountFilter(e.target.value)} className="h-9 rounded-md bg-white/[0.06] border border-white/[0.1] text-white text-sm px-3 outline-none">
        <option value="all">ทุกบัญชี</option>
        {accounts.map(a => <option key={a.id} value={String(a.id)}>{a.name}</option>)}
      </select>
      <select value={pageFilter} onChange={e => setPageFilter(e.target.value)} className="h-9 rounded-md bg-white/[0.06] border border-white/[0.1] text-white text-sm px-3 outline-none">
        <option value="all">ทุกเพจ</option>
        {pages.map(p => <option key={p.id} value={String(p.id)}>{p.name}</option>)}
      </select>
      <select value={productFilter} onChange={e => setProductFilter(e.target.value)} className="h-9 rounded-md bg-white/[0.06] border border-white/[0.1] text-white text-sm px-3 outline-none">
        <option value="all">ทุกสินค้า</option>
        {products.map(p => <option key={p.id} value={String(p.id)}>{p.name}</option>)}
      </select>
      <Button variant="ghost" size="sm" onClick={resetFilters} className="text-zinc-400 hover:text-white gap-1">
        <RotateCcw className="h-3.5 w-3.5" />
        ล้าง
      </Button>
    </div>
  );
}
