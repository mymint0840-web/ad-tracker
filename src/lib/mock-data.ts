import { Product, AdAccount, Page, Entry, DailyTarget, DashboardSummary } from '@/types';

export const mockProducts: Product[] = [
  { id: 1, name: 'เซรั่มหน้าใส', cost: 120, price: 590, stock: 200, isActive: true },
  { id: 2, name: 'ครีมกันแดด SPF50', cost: 85, price: 390, stock: 150, isActive: true },
  { id: 3, name: 'คอลลาเจนผง', cost: 200, price: 890, stock: 100, isActive: true },
];

export const mockPages: Page[] = [
  { id: 1, name: 'เพจ A', isActive: true },
  { id: 2, name: 'เพจ B', isActive: true },
];

export const mockAccounts: AdAccount[] = [
  { id: 1, name: 'บัญชี A', isActive: true },
  { id: 2, name: 'บัญชี B', isActive: true },
  { id: 3, name: 'บัญชี C', isActive: true },
];

export const mockEntries: Entry[] = [
  { id: 1, date: '2025-03-01', accountId: 1, account: { id: 1, name: 'บัญชี A', isActive: true }, productId: 1, product: { id: 1, name: 'เซรั่มหน้าใส', cost: 120, price: 590, stock: 200, isActive: true }, pageId: 1, page: { id: 1, name: 'เพจ A', isActive: true }, hotSales: 5000, crmOrders: 3, crmProductId: 1, products: [], adCost: 5000, messages: 120, closed: 18, orders: 15, salesFromPage: 45000, quantity: 18, crmSales: 12000, crmQty: 8, shippingCost: 900, packingCost: 360, adminCommission: 2250, totalSales: 57000, profitPage: 33330, profitCRM: 11040, profitTotal: 44370 },
  { id: 2, date: '2025-03-02', accountId: 2, account: { id: 2, name: 'บัญชี B', isActive: true }, productId: 2, product: { id: 2, name: 'ครีมกันแดด SPF50', cost: 85, price: 390, stock: 150, isActive: true }, pageId: 1, page: { id: 1, name: 'เพจ A', isActive: true }, hotSales: 5000, crmOrders: 3, crmProductId: 1, products: [], adCost: 3500, messages: 85, closed: 12, orders: 10, salesFromPage: 28000, quantity: 12, crmSales: 8500, crmQty: 5, shippingCost: 600, packingCost: 240, adminCommission: 1400, totalSales: 36500, profitPage: 20240, profitCRM: 8075, profitTotal: 28315 },
  { id: 3, date: '2025-03-03', accountId: 1, account: { id: 1, name: 'บัญชี A', isActive: true }, productId: 3, product: { id: 3, name: 'คอลลาเจนผง', cost: 200, price: 890, stock: 100, isActive: true }, pageId: 1, page: { id: 1, name: 'เพจ A', isActive: true }, hotSales: 5000, crmOrders: 3, crmProductId: 1, products: [], adCost: 4200, messages: 95, closed: 15, orders: 12, salesFromPage: 38000, quantity: 15, crmSales: 0, crmQty: 0, shippingCost: 750, packingCost: 300, adminCommission: 1900, totalSales: 38000, profitPage: 27850, profitCRM: 0, profitTotal: 27850 },
];

export const mockTargets: DailyTarget = { id: 1, profit: 10000, adPercent: 15, closeRate: 20, costPerClick: 50 };

export function getMockSummary(): DashboardSummary {
  return {
    adCost: 12700, messages: 300, closed: 45, totalSales: 131500,
    salesPage: 111000, crmSales: 20500, crmQty: 13,
    profitPage: 81420, profitCRM: 19115, profitTotal: 100535, hotSales: 15000,
  };
}
