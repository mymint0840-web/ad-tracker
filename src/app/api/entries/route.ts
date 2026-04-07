// @ts-nocheck — pending Prisma migration for new fields
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { calculateEntry } from '@/lib/calculations';
import { entrySchema, filterSchema } from '@/lib/validators';
import { decimalToNumber } from '@/lib/utils';
import { getAuthUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const filters = filterSchema.parse({
    date: searchParams.get('date') ?? undefined,
    accountId: searchParams.get('accountId') ?? undefined,
    productId: searchParams.get('productId') ?? undefined,
    pageId: searchParams.get('pageId') ?? undefined,
    page: searchParams.get('page') ?? 1,
    limit: searchParams.get('limit') ?? 50,
  });

  const where: any = {};
  if (filters.date) where.date = new Date(filters.date);
  if (filters.accountId) where.accountId = filters.accountId;
  if (filters.productId) where.productId = filters.productId;
  if (filters.pageId) where.pageId = filters.pageId;

  const [entries, total] = await Promise.all([
    prisma.entry.findMany({
      where,
      include: {
        account: { select: { id: true, name: true } },
        product: { select: { id: true, name: true, cost: true } },
        page: { select: { id: true, name: true } },
        crmProduct: { select: { id: true, name: true, cost: true } },
        entryProducts: { include: { product: { select: { id: true, name: true, cost: true } } } },
      },
      orderBy: { date: 'desc' },
      skip: (filters.page - 1) * filters.limit,
      take: filters.limit,
    }),
    prisma.entry.count({ where }),
  ]);

  const data = entries.map(entry => {
    const productCost = decimalToNumber(entry.product.cost);
    const calculated = calculateEntry({
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

    return {
      id: entry.id,
      date: entry.date.toISOString().split('T')[0],
      account: entry.account,
      product: { id: entry.product.id, name: entry.product.name, cost: productCost },
      page: entry.page,
      crmProduct: entry.crmProduct ? { id: entry.crmProduct.id, name: entry.crmProduct.name, cost: decimalToNumber(entry.crmProduct.cost) } : null,
      entryProducts: entry.entryProducts.map(ep => ({
        productId: ep.productId,
        quantity: ep.quantity,
        product: { id: ep.product.id, name: ep.product.name, cost: decimalToNumber(ep.product.cost) },
      })),
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
      note: entry.note,
      calculated,
    };
  });

  return NextResponse.json({
    data,
    pagination: { page: filters.page, limit: filters.limit, total },
  });
}

export async function POST(request: NextRequest) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const parsed = entrySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Validation error' }, { status: 400 });
  }

  const data = parsed.data;

  // Verify primary product exists and has enough stock
  const product = await prisma.product.findUnique({ where: { id: data.productId } });
  if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 });

  const primaryDeduct = data.quantity + data.crmQty;
  if (product.stock < primaryDeduct) {
    return NextResponse.json({ error: `สต๊อกไม่พอ (มี ${product.stock} ต้องการ ${primaryDeduct})` }, { status: 400 });
  }

  // Create entry + deduct stock in transaction
  const entry = await prisma.$transaction(async (tx) => {
    const created = await tx.entry.create({
      data: {
        date: new Date(data.date),
        accountId: data.accountId,
        productId: data.productId,
        pageId: data.pageId,
        crmProductId: data.crmProductId,
        createdById: user.id,
        adCost: data.adCost,
        messages: data.messages,
        closed: data.closed,
        orders: data.orders,
        salesFromPage: data.salesFromPage,
        quantity: data.quantity,
        hotSales: data.hotSales,
        crmOrders: data.crmOrders,
        crmSales: data.crmSales,
        crmQty: data.crmQty,
        shippingCost: data.shippingCost,
        packingCost: data.packingCost,
        adminCommission: data.adminCommission,
        note: data.note,
      },
      include: {
        account: { select: { id: true, name: true } },
        product: { select: { id: true, name: true, cost: true } },
        page: { select: { id: true, name: true } },
        crmProduct: { select: { id: true, name: true, cost: true } },
        entryProducts: { include: { product: { select: { id: true, name: true, cost: true } } } },
      },
    });

    // Create EntryProduct records if products array provided
    if (data.products && data.products.length > 0) {
      await tx.entryProduct.createMany({
        data: data.products.map(p => ({
          entryId: created.id,
          productId: p.productId,
          quantity: p.quantity,
        })),
      });

      // Deduct stock for each entryProduct
      for (const p of data.products) {
        if (p.quantity > 0) {
          await tx.product.update({
            where: { id: p.productId },
            data: { stock: { decrement: p.quantity } },
          });
          await tx.stockLog.create({
            data: { productId: p.productId, change: -p.quantity, reason: 'SALE_PAGE', entryId: created.id },
          });
        }
      }
    } else {
      // Fallback: deduct primary product stock
      await tx.product.update({
        where: { id: data.productId },
        data: { stock: { decrement: primaryDeduct } },
      });
      if (data.quantity > 0) {
        await tx.stockLog.create({
          data: { productId: data.productId, change: -data.quantity, reason: 'SALE_PAGE', entryId: created.id },
        });
      }
      if (data.crmQty > 0) {
        await tx.stockLog.create({
          data: { productId: data.productId, change: -data.crmQty, reason: 'SALE_CRM', entryId: created.id },
        });
      }
    }

    return created;
  });

  return NextResponse.json(entry, { status: 201 });
}
