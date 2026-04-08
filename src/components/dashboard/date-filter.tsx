'use client';

import { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useFilterStore } from '@/stores/filter-store';
import { RotateCcw, ChevronDown, Search } from 'lucide-react';
import type { Product, AdAccount, Page } from '@/types';

interface SearchableSelectProps {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  placeholder: string;
}

function SearchableSelect({ value, onChange, options, placeholder }: SearchableSelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const filtered = options.filter(o => o.label.toLowerCase().includes(search.toLowerCase()));
  const selected = options.find(o => o.value === value);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => { setOpen(!open); setSearch(''); }}
        className="h-9 rounded-md bg-white/[0.06] border border-white/[0.1] text-white text-sm px-3 outline-none flex items-center gap-2 min-w-[140px] hover:bg-white/[0.08] transition-colors"
      >
        <span className="truncate flex-1 text-left">{selected?.label || placeholder}</span>
        <ChevronDown className={`w-3.5 h-3.5 text-white/40 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-1 z-50 w-full min-w-[200px] bg-[#1a1b2e] border border-white/[0.1] rounded-lg shadow-xl overflow-hidden">
          <div className="p-2 border-b border-white/[0.06]">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="ค้นหา..."
                autoFocus
                className="w-full h-8 pl-8 pr-3 rounded-md bg-white/[0.06] border border-white/[0.08] text-sm text-white placeholder:text-white/30 outline-none"
              />
            </div>
          </div>
          <div className="max-h-48 overflow-y-auto">
            {filtered.map(o => (
              <button
                key={o.value}
                type="button"
                onClick={() => { onChange(o.value); setOpen(false); }}
                className={`w-full text-left px-3 py-2 text-sm transition-colors ${
                  o.value === value
                    ? 'bg-indigo-500/20 text-indigo-300'
                    : 'text-white/70 hover:bg-white/[0.06] hover:text-white'
                }`}
              >
                {o.label}
              </button>
            ))}
            {filtered.length === 0 && (
              <div className="px-3 py-4 text-center text-xs text-white/30">ไม่พบ</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

interface DateFilterProps {
  accounts: AdAccount[];
  products: Product[];
  pages: Page[];
}

export function DateFilter({ accounts, products, pages }: DateFilterProps) {
  const { dateFilter, accountFilter, productFilter, pageFilter, setDateFilter, setAccountFilter, setProductFilter, setPageFilter, resetFilters } = useFilterStore();

  const accountOptions = [
    { value: 'all', label: 'ทั้งหมด' },
    ...accounts.map(a => ({ value: String(a.id), label: a.name })),
  ];
  const pageOptions = [
    { value: 'all', label: 'ทั้งหมด' },
    ...pages.map(p => ({ value: String(p.id), label: p.name })),
  ];
  const productOptions = [
    { value: 'all', label: 'ทั้งหมด' },
    ...products.map(p => ({ value: String(p.id), label: p.name })),
  ];

  return (
    <div className="flex flex-wrap items-center gap-3 mb-4">
      <Input type="date" value={dateFilter} onChange={e => setDateFilter(e.target.value)} className="w-44 bg-white/[0.06] border-white/[0.1] text-white" />
      <SearchableSelect value={accountFilter} onChange={setAccountFilter} options={accountOptions} placeholder="บัญชียิงแอด" />
      <SearchableSelect value={pageFilter} onChange={setPageFilter} options={pageOptions} placeholder="เพจ" />
      <SearchableSelect value={productFilter} onChange={setProductFilter} options={productOptions} placeholder="สินค้า" />
      <Button variant="ghost" size="sm" onClick={resetFilters} className="text-zinc-400 hover:text-white gap-1">
        <RotateCcw className="h-3.5 w-3.5" />
        ล้าง
      </Button>
    </div>
  );
}
