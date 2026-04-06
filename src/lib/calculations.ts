import { CalcResult } from '@/types';

interface EntryData {
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
  productCost: number;
}

export function calculateEntry(data: EntryData): CalcResult {
  const totalSales = data.salesFromPage + data.crmSales;
  const totalSpend = data.adCost;
  const profitPage = data.salesFromPage - data.adminCommission - data.adCost - (data.productCost * data.quantity) - data.packingCost - data.shippingCost;
  const profitCRM = data.crmSales - (data.productCost * data.crmQty);
  const profitTotal = profitPage + profitCRM;
  const adPercent = totalSales > 0 ? (data.adCost / totalSales) * 100 : null;
  const closeRate = data.messages > 0 ? (data.closed / data.messages) * 100 : null;
  const costPerClick = data.messages > 0 ? data.adCost / data.messages : null;
  const roas = data.adCost > 0 ? totalSales / data.adCost : null;
  const aovPage = data.closed > 0 ? data.salesFromPage / data.closed : null;
  const aovCRM = data.crmQty > 0 ? data.crmSales / data.crmQty : null;
  const totalOrders = data.closed + data.crmQty;
  const aovTotal = totalOrders > 0 ? totalSales / totalOrders : null;
  return { totalSales, totalSpend, revenue: totalSales, profitPage, profitCRM, profitTotal, adPercent, closeRate, costPerClick, roas, aovPage, aovCRM, aovTotal };
}
