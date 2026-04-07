// @ts-nocheck — pending Prisma migration for new fields
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { calculateEntry } from '@/lib/calculations';
import { decimalToNumber } from '@/lib/utils';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const where: any = {};

  const date = searchParams.get('date');
  const accountId = searchParams.get('accountId');
  const productId = searchParams.get('productId');
  const pageId = searchParams.get('pageId');

  if (date) where.date = new Date(date);
  if (accountId) where.accountId = Number(accountId);
  if (productId) where.productId = Number(productId);
  if (pageId) where.pageId = Number(pageId);

  const entries = await prisma.entry.findMany({
    where,
    include: {
      product: { select: { cost: true } },
    },
  });

  // Aggregate
  let totals = {
    adCost: 0, messages: 0, closed: 0, orders: 0,
    salesPage: 0, crmSales: 0, totalSales: 0, crmQty: 0,
    hotSales: 0,
    profitPage: 0, profitCRM: 0, profitTotal: 0,
  };

  for (const entry of entries) {
    const productCost = decimalToNumber(entry.product.cost);
    const calc = calculateEntry({
      adCost: decimalToNumber(entry.adCost),
      messages: entry.messages,
      closed: entry.closed,
      orders: entry.orders,
      salesFromPage: decimalToNumber(entry.salesFromPage),
      quantity: entry.quantity,
      hotSales: decimalToNumber(entry.hotSales),
      crmOrders: entry.crmOrders,
      crmSales: decimalToNumber(entry.crmSales),
      crmQty: entry.crmQty,
      shippingCost: decimalToNumber(entry.shippingCost),
      packingCost: decimalToNumber(entry.packingCost),
      adminCommission: decimalToNumber(entry.adminCommission),
      productCost,
    });

    totals.adCost += decimalToNumber(entry.adCost);
    totals.messages += entry.messages;
    totals.closed += entry.closed;
    totals.orders += entry.orders;
    totals.salesPage += decimalToNumber(entry.salesFromPage);
    totals.crmSales += decimalToNumber(entry.crmSales);
    totals.hotSales += decimalToNumber(entry.hotSales);
    totals.totalSales += calc.totalSales;
    totals.crmQty += entry.crmQty;
    totals.profitPage += calc.profitPage;
    totals.profitCRM += calc.profitCRM;
    totals.profitTotal += calc.profitTotal;
  }

  const rates = {
    adPercent: totals.totalSales > 0 ? (totals.adCost / totals.totalSales) * 100 : null,
    closeRate: totals.messages > 0 ? (totals.closed / totals.messages) * 100 : null,
    costPerClick: totals.messages > 0 ? totals.adCost / totals.messages : null,
    roas: totals.adCost > 0 ? totals.totalSales / totals.adCost : null,
    aovPage: totals.closed > 0 ? totals.salesPage / totals.closed : null,
    aovCRM: totals.crmQty > 0 ? totals.crmSales / totals.crmQty : null,
    aovTotal: (totals.closed + totals.crmQty) > 0 ? totals.totalSales / (totals.closed + totals.crmQty) : null,
  };

  // Get targets
  const target = await prisma.dailyTarget.findFirst({
    where: { isActive: true },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({
    totals,
    rates,
    targets: target ? {
      profit: decimalToNumber(target.profit),
      adPercent: decimalToNumber(target.adPercent),
      closeRate: decimalToNumber(target.closeRate),
      costPerClick: decimalToNumber(target.costPerClick),
    } : { profit: 0, adPercent: 0, closeRate: 0, costPerClick: 0 },
  });
}
