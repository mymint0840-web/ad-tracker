export interface Product {
  id: number;
  name: string;
  cost: number;
  price: number;
  stock: number;
  isActive: boolean;
}

export interface Page {
  id: number;
  name: string;
  isActive: boolean;
}

export interface EntryProductItem {
  productId: number;
  product: Product;
  quantity: number;
}

export interface AdAccount {
  id: number;
  name: string;
  isActive: boolean;
}

export interface Entry {
  id: number;
  date: string;
  accountId: number;
  account: AdAccount;
  productId: number;
  product: Product;
  adCost: number;
  messages: number;
  closed: number;
  orders: number;
  salesFromPage: number;
  quantity: number;
  crmSales: number;
  crmQty: number;
  shippingCost: number;
  packingCost: number;
  adminCommission: number;
  pageId: number;
  page: Page;
  hotSales: number;
  crmOrders: number;
  crmProductId: number;
  crmProduct?: Product;
  products: EntryProductItem[];
  note?: string;
  // Calculated fields from API
  totalSales?: number;
  profitPage?: number;
  profitCRM?: number;
  profitTotal?: number;
  adPercent?: number | null;
  closeRate?: number | null;
  costPerClick?: number | null;
  roas?: number | null;
}

export interface EntryFormData {
  date: string;
  accountId: number | '';
  productId: number | '';
  adCost: number | '';
  messages: number | '';
  closed: number | '';
  orders: number | '';
  salesFromPage: number | '';
  quantity: number | '';
  crmSales: number | '';
  crmQty: number | '';
  shippingCost: number | '';
  packingCost: number | '';
  adminCommission: number | '';
  pageId: number | '';
  hotSales: number | '';
  crmOrders: number | '';
  crmProductId: number | '';
  impressions: number | '';
  clicks: number | '';
  note: string;
  // Multi-product arrays
  adProducts?: { productId: number; quantity: number }[];
  hotProducts?: { productId: number; quantity: number }[];
  crmProducts?: { productId: number; quantity: number }[];
}

export interface DailyTarget {
  id: number;
  profit: number;
  adPercent: number;
  closeRate: number;
  costPerClick: number;
}

export interface DashboardSummary {
  adCost: number;
  messages: number;
  closed: number;
  totalSales: number;
  salesPage: number;
  crmSales: number;
  crmQty: number;
  profitPage: number;
  profitCRM: number;
  profitTotal: number;
  hotSales: number;
}

export interface CalcResult {
  totalSales: number;
  totalSalesAll: number;
  hotSales: number;
  totalSpend: number;
  revenue: number;
  profitPage: number;
  profitCRM: number;
  profitTotal: number;
  adPercent: number | null;
  closeRate: number | null;
  costPerClick: number | null;
  roas: number | null;
  aovPage: number | null;
  aovCRM: number | null;
  aovTotal: number | null;
  ctr: number | null;
  cpm: number | null;
}
