'use client';
import { useState, useMemo } from 'react';
import { mockEntries, mockProducts, mockAccounts, mockTargets, getMockSummary } from '@/lib/mock-data';
import { calculateEntry } from '@/lib/calculations';
import { useFilterStore } from '@/stores/filter-store';
import type { Entry, Product, AdAccount, DailyTarget, EntryFormData } from '@/types';

export function useEntries() {
  const [entries, setEntries] = useState<Entry[]>(mockEntries);
  const { dateFilter, accountFilter, productFilter } = useFilterStore();

  const filtered = useMemo(() => {
    let r = entries;
    if (dateFilter) r = r.filter(x => x.date === dateFilter);
    if (accountFilter !== 'all') r = r.filter(x => String(x.accountId) === accountFilter);
    if (productFilter !== 'all') r = r.filter(x => String(x.productId) === productFilter);
    return r;
  }, [entries, dateFilter, accountFilter, productFilter]);

  const summary = useMemo(() => {
    return filtered.reduce((acc, r) => {
      const prod = mockProducts.find(p => p.id === r.productId);
      const c = calculateEntry({ ...r, productCost: prod?.cost || 0 });
      return {
        adCost: acc.adCost + r.adCost,
        messages: acc.messages + r.messages,
        closed: acc.closed + r.closed,
        totalSales: acc.totalSales + c.totalSales,
        salesPage: acc.salesPage + r.salesFromPage,
        crmSales: acc.crmSales + r.crmSales,
        crmQty: acc.crmQty + r.crmQty,
        profitPage: acc.profitPage + c.profitPage,
        profitCRM: acc.profitCRM + c.profitCRM,
        profitTotal: acc.profitTotal + c.profitTotal,
      };
    }, { adCost: 0, messages: 0, closed: 0, totalSales: 0, salesPage: 0, crmSales: 0, crmQty: 0, profitPage: 0, profitCRM: 0, profitTotal: 0 });
  }, [filtered]);

  const addEntry = (data: EntryFormData) => {
    const product = mockProducts.find(p => p.id === Number(data.productId));
    const account = mockAccounts.find(a => a.id === Number(data.accountId));
    if (!product || !account) return;
    const newEntry: Entry = {
      id: Date.now(),
      ...data as any,
      accountId: Number(data.accountId),
      productId: Number(data.productId),
      account,
      product,
      adCost: Number(data.adCost) || 0,
      messages: Number(data.messages) || 0,
      closed: Number(data.closed) || 0,
      orders: Number(data.orders) || 0,
      salesFromPage: Number(data.salesFromPage) || 0,
      quantity: Number(data.quantity) || 0,
      crmSales: Number(data.crmSales) || 0,
      crmQty: Number(data.crmQty) || 0,
      shippingCost: Number(data.shippingCost) || 0,
      packingCost: Number(data.packingCost) || 0,
      adminCommission: Number(data.adminCommission) || 0,
    };
    setEntries(prev => [newEntry, ...prev]);
  };

  const updateEntry = (id: number, data: EntryFormData) => {
    setEntries(prev => prev.map(e => e.id === id ? { ...e, ...data, accountId: Number(data.accountId), productId: Number(data.productId), adCost: Number(data.adCost) || 0, messages: Number(data.messages) || 0, closed: Number(data.closed) || 0, orders: Number(data.orders) || 0, salesFromPage: Number(data.salesFromPage) || 0, quantity: Number(data.quantity) || 0, crmSales: Number(data.crmSales) || 0, crmQty: Number(data.crmQty) || 0, shippingCost: Number(data.shippingCost) || 0, packingCost: Number(data.packingCost) || 0, adminCommission: Number(data.adminCommission) || 0 } as Entry : e));
  };

  const deleteEntry = (id: number) => {
    setEntries(prev => prev.filter(e => e.id !== id));
  };

  return { entries: filtered, summary, addEntry, updateEntry, deleteEntry };
}

export function useProducts() {
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const addProduct = (p: Omit<Product, 'id' | 'isActive'>) => setProducts(prev => [...prev, { ...p, id: Date.now(), isActive: true }]);
  const updateProduct = (id: number, data: Partial<Product>) => setProducts(prev => prev.map(p => p.id === id ? { ...p, ...data } : p));
  const deleteProduct = (id: number) => setProducts(prev => prev.filter(p => p.id !== id));
  return { products, addProduct, updateProduct, deleteProduct };
}

export function useAccounts() {
  const [accounts, setAccounts] = useState<AdAccount[]>(mockAccounts);
  const addAccount = (name: string) => setAccounts(prev => [...prev, { id: Date.now(), name, isActive: true }]);
  const deleteAccount = (id: number) => setAccounts(prev => prev.filter(a => a.id !== id));
  return { accounts, addAccount, deleteAccount };
}

export function useTargets() {
  const [targets, setTargets] = useState<DailyTarget>(mockTargets);
  const updateTargets = (data: Partial<DailyTarget>) => setTargets(prev => ({ ...prev, ...data }));
  return { targets, updateTargets };
}
