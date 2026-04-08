'use client';

import { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useFilterStore } from '@/stores/filter-store';
import { RotateCcw, ChevronDown, Search, Check } from 'lucide-react';
import type { Product, AdAccount, Page } from '@/types';

interface MultiSelectProps {
  values: string[];
  onChange: (v: string[]) => void;
  options: { value: string; label: string }[];
  placeholder: string;
}

function MultiSelect({ values, onChange, options, placeholder }: MultiSelectProps) {
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

  const itemOptions = options.filter(o => o.value !== 'all');
  const filtered = itemOptions.filter(o => o.label.toLowerCase().includes(search.toLowerCase()));
  const isAll = values.length === 0 || values.includes('all');
  const allChecked = isAll || values.length === itemOptions.length;

  function toggleAll() {
    if (allChecked) {
      onChange([]);
    } else {
      onChange(['all']);
    }
  }

  function toggleItem(val: string) {
    if (isAll) {
      // Was "all" → uncheck this one = select everything except this
      const allExcept = itemOptions.filter(o => o.value !== val).map(o => o.value);
      onChange(allExcept);
    } else if (values.includes(val)) {
      const next = values.filter(v => v !== val && v !== 'all');
      onChange(next.length === 0 ? ['all'] : next);
    } else {
      const next = [...values.filter(v => v !== 'all'), val];
      onChange(next.length === itemOptions.length ? ['all'] : next);
    }
  }

  function isChecked(val: string) {
    if (isAll) return true;
    return values.includes(val);
  }

  // Display text
  let displayText = placeholder;
  if (allChecked) {
    displayText = 'ทั้งหมด';
  } else if (values.length === 1) {
    displayText = options.find(o => o.value === values[0])?.label || placeholder;
  } else if (values.length > 1) {
    displayText = `${values.length} รายการ`;
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => { setOpen(!open); setSearch(''); }}
        className="h-9 rounded-md bg-white/[0.06] border border-white/[0.1] text-white text-sm px-3 outline-none flex items-center gap-2 min-w-[140px] hover:bg-white/[0.08] transition-colors"
      >
        <span className="truncate flex-1 text-left text-white/90">{displayText}</span>
        <ChevronDown className={`w-3.5 h-3.5 text-white/50 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-1 z-50 w-full min-w-[220px] bg-[#1a1b2e] border border-white/[0.12] rounded-lg shadow-2xl overflow-hidden">
          <div className="p-2 border-b border-white/[0.08]">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/40" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="ค้นหา..."
                autoFocus
                className="w-full h-8 pl-8 pr-3 rounded-md bg-white/[0.08] border border-white/[0.1] text-sm text-white placeholder:text-white/40 outline-none focus:border-indigo-500/50"
              />
            </div>
          </div>
          <div className="max-h-56 overflow-y-auto">
            {/* ทั้งหมด */}
            {!search && (
              <button
                type="button"
                onClick={toggleAll}
                className={`w-full text-left px-3 py-2 text-sm flex items-center gap-2.5 transition-colors border-b border-white/[0.04] ${allChecked ? 'text-indigo-300' : 'text-white/70 hover:bg-white/[0.04]'}`}
              >
                <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${allChecked ? 'bg-indigo-500 border-indigo-500' : 'border-white/20 bg-white/[0.04]'}`}>
                  {allChecked && <Check className="w-3 h-3 text-white" />}
                </div>
                <span className="font-medium">ทั้งหมด</span>
              </button>
            )}
            {filtered.map(o => (
              <button
                key={o.value}
                type="button"
                onClick={() => toggleItem(o.value)}
                className={`w-full text-left px-3 py-2 text-sm flex items-center gap-2.5 transition-colors ${isChecked(o.value) ? 'text-indigo-300' : 'text-white/70 hover:bg-white/[0.04]'}`}
              >
                <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${isChecked(o.value) ? 'bg-indigo-500 border-indigo-500' : 'border-white/20 bg-white/[0.04]'}`}>
                  {isChecked(o.value) && <Check className="w-3 h-3 text-white" />}
                </div>
                {o.label}
              </button>
            ))}
            {filtered.length === 0 && <div className="px-3 py-3 text-center text-xs text-white/40">ไม่พบ</div>}
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

  // Convert single string to array for multi-select, back to single for store
  const accountValues = accountFilter === 'all' ? ['all'] : accountFilter.split(',').filter(Boolean);
  const pageValues = pageFilter === 'all' ? ['all'] : pageFilter.split(',').filter(Boolean);
  const productValues = productFilter === 'all' ? ['all'] : productFilter.split(',').filter(Boolean);

  return (
    <div className="flex flex-wrap items-center gap-3 mb-4">
      <Input type="date" value={dateFilter} onChange={e => setDateFilter(e.target.value)} className="w-44 bg-white/[0.06] border-white/[0.1] text-white" />
      <MultiSelect values={accountValues} onChange={v => setAccountFilter(v.includes('all') ? 'all' : v.join(','))} options={accountOptions} placeholder="บัญชียิงแอด" />
      <MultiSelect values={pageValues} onChange={v => setPageFilter(v.includes('all') ? 'all' : v.join(','))} options={pageOptions} placeholder="เพจ" />
      <MultiSelect values={productValues} onChange={v => setProductFilter(v.includes('all') ? 'all' : v.join(','))} options={productOptions} placeholder="สินค้า" />
      <Button variant="ghost" size="sm" onClick={resetFilters} className="text-zinc-400 hover:text-white gap-1">
        <RotateCcw className="h-3.5 w-3.5" />
        ล้าง
      </Button>
    </div>
  );
}
