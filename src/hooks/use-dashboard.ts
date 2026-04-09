'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useFilterStore } from '@/stores/filter-store';
import { entriesAPI, productsAPI, accountsAPI, pagesAPI, targetsAPI, dashboardAPI } from '@/lib/api-client';
import type { Entry, Product, AdAccount, Page, DailyTarget, EntryFormData, DashboardSummary } from '@/types';

// ═══ Entries ═══
export function useEntries() {
  const queryClient = useQueryClient();
  const { dateFilter, accountFilter, productFilter, pageFilter } = useFilterStore();

  const { data, isLoading } = useQuery({
    queryKey: ['entries', dateFilter, accountFilter, productFilter, pageFilter],
    queryFn: () => entriesAPI.list({ date: dateFilter, accountId: accountFilter, productId: productFilter, pageId: pageFilter }),
  });

  const { data: summaryData } = useQuery({
    queryKey: ['dashboard-summary', dateFilter, accountFilter, productFilter, pageFilter],
    queryFn: () => dashboardAPI.summary({ date: dateFilter, accountId: accountFilter, productId: productFilter, pageId: pageFilter }),
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['entries'] });
    queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
    queryClient.invalidateQueries({ queryKey: ['products'] });
  };

  const buildPayload = (formData: EntryFormData) => ({
    date: formData.date,
    accountId: Number(formData.accountId),
    productId: Number(formData.productId),
    adCost: Number(formData.adCost) || 0,
    messages: Number(formData.messages) || 0,
    closed: Number(formData.closed) || 0,
    orders: Number(formData.orders) || 0,
    salesFromPage: Number(formData.salesFromPage) || 0,
    quantity: Number(formData.quantity) || 0,
    crmSales: Number(formData.crmSales) || 0,
    crmQty: Number(formData.crmQty) || 0,
    shippingCost: Number(formData.shippingCost) || 0,
    packingCost: Number(formData.packingCost) || 0,
    adminCommission: Number(formData.adminCommission) || 0,
    pageId: Number(formData.pageId) || undefined,
    hotSales: Number(formData.hotSales) || 0,
    crmOrders: Number(formData.crmOrders) || 0,
    crmProductId: Number(formData.crmProductId) || undefined,
    note: formData.note || '',
    ...(formData.hotProducts?.length ? { hotProducts: formData.hotProducts } : {}),
    ...(formData.crmProducts?.length ? { crmProducts: formData.crmProducts } : {}),
  });

  const addMutation = useMutation({
    mutationFn: (formData: EntryFormData) => entriesAPI.create(buildPayload(formData)),
    onSuccess: invalidate,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: EntryFormData }) => entriesAPI.update(id, buildPayload(data)),
    onSuccess: invalidate,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => entriesAPI.delete(id),
    onSuccess: invalidate,
  });

  const entries: Entry[] = (data?.data || []).map((e: any) => ({
    ...e,
    adCost: Number(e.adCost) || 0,
    messages: Number(e.messages) || 0,
    closed: Number(e.closed) || 0,
    orders: Number(e.orders) || 0,
    salesFromPage: Number(e.salesFromPage) || 0,
    quantity: Number(e.quantity) || 0,
    crmSales: Number(e.crmSales) || 0,
    crmQty: Number(e.crmQty) || 0,
    shippingCost: Number(e.shippingCost) || 0,
    packingCost: Number(e.packingCost) || 0,
    adminCommission: Number(e.adminCommission) || 0,
    hotSales: Number(e.hotSales || e.hotSales) || 0,
    crmOrders: Number(e.crmOrders) || 0,
    product: e.product ? { ...e.product, cost: Number(e.product.cost), price: Number(e.product.price) } : e.product,
    products: e.entryProducts || e.products || [],
    crmProduct: e.crmProduct,
  }));

  const summary: DashboardSummary = summaryData ? {
    adCost: Number(summaryData.totals?.adCost) || 0,
    messages: Number(summaryData.totals?.messages) || 0,
    closed: Number(summaryData.totals?.closed) || 0,
    totalSales: Number(summaryData.totals?.totalSales) || 0,
    salesPage: Number(summaryData.totals?.salesPage) || 0,
    crmSales: Number(summaryData.totals?.crmSales) || 0,
    crmQty: Number(summaryData.totals?.crmQty) || 0,
    profitPage: Number(summaryData.totals?.profitPage) || 0,
    profitCRM: Number(summaryData.totals?.profitCRM) || 0,
    profitTotal: Number(summaryData.totals?.profitTotal) || 0,
    hotSales: Number(summaryData.totals?.hotSales) || 0,
  } : { adCost: 0, messages: 0, closed: 0, totalSales: 0, salesPage: 0, crmSales: 0, crmQty: 0, profitPage: 0, profitCRM: 0, profitTotal: 0, hotSales: 0 };

  return {
    entries,
    summary,
    isLoading,
    addEntry: (data: EntryFormData) => addMutation.mutate(data),
    updateEntry: (id: number, data: EntryFormData) => updateMutation.mutate({ id, data }),
    deleteEntry: (id: number) => deleteMutation.mutate(id),
  };
}

// ═══ Products ═══
export function useProducts() {
  const queryClient = useQueryClient();

  const { data: products = [] } = useQuery({
    queryKey: ['products'],
    queryFn: productsAPI.list,
  });

  const mapped: Product[] = products.map((p: any) => ({
    ...p,
    cost: Number(p.cost),
    price: Number(p.price),
    stock: Number(p.stock),
    isActive: true,
  }));

  const addMutation = useMutation({
    mutationFn: (p: Omit<Product, 'id' | 'isActive'>) => productsAPI.create(p),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['products'] }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Product> }) => productsAPI.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['products'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => productsAPI.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['products'] }),
  });

  return {
    products: mapped,
    addProduct: (p: Omit<Product, 'id' | 'isActive'>) => addMutation.mutate(p),
    updateProduct: (id: number, data: Partial<Product>) => updateMutation.mutate({ id, data }),
    deleteProduct: (id: number) => deleteMutation.mutate(id),
  };
}

// ═══ Accounts ═══
export function useAccounts() {
  const queryClient = useQueryClient();

  const { data: accounts = [] } = useQuery({
    queryKey: ['accounts'],
    queryFn: accountsAPI.list,
  });

  const mapped: AdAccount[] = accounts.map((a: any) => ({ ...a, isActive: true }));

  const addMutation = useMutation({
    mutationFn: (name: string) => accountsAPI.create({ name }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['accounts'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => accountsAPI.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['accounts'] }),
  });

  return {
    accounts: mapped,
    addAccount: (name: string) => addMutation.mutate(name),
    deleteAccount: (id: number) => deleteMutation.mutate(id),
  };
}

// ═══ Pages ═══
export function usePages() {
  const qc = useQueryClient();
  const { data: pages = [] } = useQuery({
    queryKey: ['pages'],
    queryFn: pagesAPI.list,
  });

  const mapped: Page[] = pages.map((p: any) => ({ ...p, isActive: true }));

  const { mutateAsync: addPage } = useMutation({
    mutationFn: (name: string) => pagesAPI.create({ name }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['pages'] }),
  });

  return { pages: mapped, addPage };
}

// ═══ Targets ═══
export function useTargets() {
  const queryClient = useQueryClient();

  const { data } = useQuery({
    queryKey: ['targets'],
    queryFn: targetsAPI.get,
  });

  const targets: DailyTarget = data ? {
    id: data.id || 0,
    profit: Number(data.profit) || 0,
    adPercent: Number(data.adPercent) || 0,
    closeRate: Number(data.closeRate) || 0,
    costPerClick: Number(data.costPerClick) || 0,
  } : { id: 0, profit: 0, adPercent: 0, closeRate: 0, costPerClick: 0 };

  const updateMutation = useMutation({
    mutationFn: (data: Partial<DailyTarget>) => targetsAPI.update(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['targets'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
    },
  });

  return {
    targets,
    updateTargets: (data: Partial<DailyTarget>) => updateMutation.mutate(data),
  };
}
