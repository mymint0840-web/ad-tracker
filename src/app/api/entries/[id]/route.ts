// @ts-nocheck — pending Prisma migration for new fields
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { calculateEntry } from '@/lib/calculations';
import { entrySchema } from '@/lib/validators';
import { decimalToNumber } from '@/lib/utils';
import { getAuthUser } from '@/lib/auth';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const entry = await prisma.entry.findUnique({
    where: { id: Number(id) },
    include: {
      account: { select: { id: true, name: true } },
      product: { select: { id: true, name: true, cost: true } },
      page: { select: { id: true, name: true } },
      crmProduct: { select: { id: true, name: true, cost: true } },
      entryProducts: { include: { product: { select: { id: true, name: true, cost: true } } } },
    },
  });

  if (!entry) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  // STAFF can only read their own entries; return 404 (not 403) to avoid leaking existence
  if (user.role !== 'ADMIN' && entry.createdById !== user.id) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

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
    impressions: entry.impressions,
    clicks: entry.clicks,
  });

  return NextResponse.json({
    id: entry.id,
    date: entry.date.toISOString().split('T')[0],
    account: entry.account,
    product: { id: entry.product.id, name: entry.product.name, cost: productCost },
    page: entry.page,
    crmProduct: entry.crmProduct ? { id: entry.crmProduct.id, name: entry.crmProduct.name, cost: decimalToNumber(entry.crmProduct.cost) } : null,
    entryProducts: entry.entryProducts.filter(ep => ep.type === 'PAGE').map(ep => ({
      productId: ep.productId,
      quantity: ep.quantity,
      product: { id: ep.product.id, name: ep.product.name, cost: decimalToNumber(ep.product.cost) },
    })),
    crmProducts: entry.entryProducts.filter(ep => ep.type === 'CRM').map(ep => ({
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
    impressions: entry.impressions,
    clicks: entry.clicks,
    note: entry.note,
    calculated,
  });
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const entryId = Number(id);

  const existing = await prisma.entry.findUnique({ where: { id: entryId } });
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const body = await request.json();
  const parsed = entrySchema.safeParse(body);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    const field = issue?.path?.join('.') || 'unknown';
    return NextResponse.json({ error: `${field}: ${issue?.message ?? 'Validation error'}`, field }, { status: 400 });
  }

  const data = parsed.data;

  const updated = await prisma.$transaction(async (tx) => {
    // Get old entryProducts for stock restoration
    const oldEntryProducts = await tx.entryProduct.findMany({ where: { entryId } });

    if (oldEntryProducts.length > 0) {
      // Restore stock for each entryProduct
      for (const ep of oldEntryProducts) {
        if (ep.quantity > 0) {
          await tx.product.update({
            where: { id: ep.productId },
            data: { stock: { increment: ep.quantity } },
          });
        }
      }
      // Delete old entryProducts (will cascade but we do it explicitly to handle stock)
      await tx.entryProduct.deleteMany({ where: { entryId } });
    } else {
      // Fallback: restore primary product stock
      const oldTotal = existing.quantity + existing.crmQty;
      await tx.product.update({
        where: { id: existing.productId },
        data: { stock: { increment: oldTotal } },
      });
    }

    // Check new primary product stock availability
    const product = await tx.product.findUnique({ where: { id: data.productId } });
    if (!product) throw new Error('Product not found');

    // Update entry
    const updatedEntry = await tx.entry.update({
      where: { id: entryId },
      data: {
        date: new Date(data.date),
        accountId: data.accountId,
        productId: data.productId,
        pageId: data.pageId,
        crmProductId: data.crmProductId,
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
        impressions: data.impressions ?? null,
        clicks: data.clicks ?? null,
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

    // Create new PAGE EntryProduct records and deduct stock
    if (data.products && data.products.length > 0) {
      await tx.entryProduct.createMany({
        data: data.products.map(p => ({
          entryId,
          productId: p.productId,
          quantity: p.quantity,
          type: 'PAGE' as const,
        })),
      });

      for (const p of data.products) {
        if (p.quantity > 0) {
          await tx.product.update({
            where: { id: p.productId },
            data: { stock: { decrement: p.quantity } },
          });
          await tx.stockLog.create({
            data: { productId: p.productId, change: -p.quantity, reason: 'ENTRY_EDIT', entryId },
          });
        }
      }
    } else {
      // Fallback: deduct primary product stock
      const newTotal = data.quantity + (data.crmProducts && data.crmProducts.length > 0 ? 0 : data.crmQty);
      if (product.stock < newTotal) {
        throw new Error(`สต๊อกไม่พอ (มี ${product.stock} ต้องการ ${newTotal})`);
      }
      await tx.product.update({
        where: { id: data.productId },
        data: { stock: { decrement: newTotal } },
      });
      const diff = newTotal - (existing.quantity + existing.crmQty);
      if (diff !== 0) {
        await tx.stockLog.create({
          data: { productId: data.productId, change: -diff, reason: 'ENTRY_EDIT', entryId },
        });
      }
    }

    // Create new CRM EntryProduct records and deduct stock
    if (data.crmProducts && data.crmProducts.length > 0) {
      await tx.entryProduct.createMany({
        data: data.crmProducts.map(p => ({
          entryId,
          productId: p.productId,
          quantity: p.quantity,
          type: 'CRM' as const,
        })),
      });

      for (const p of data.crmProducts) {
        if (p.quantity > 0) {
          await tx.product.update({
            where: { id: p.productId },
            data: { stock: { decrement: p.quantity } },
          });
          await tx.stockLog.create({
            data: { productId: p.productId, change: -p.quantity, reason: 'ENTRY_EDIT_CRM', entryId },
          });
        }
      }
    }

    return updatedEntry;
  });

  return NextResponse.json(updated);
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const entryId = Number(id);

  const existing = await prisma.entry.findUnique({ where: { id: entryId } });
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  await prisma.$transaction(async (tx) => {
    // Restore stock
    const totalRestore = existing.quantity + existing.crmQty;
    if (totalRestore > 0) {
      await tx.product.update({
        where: { id: existing.productId },
        data: { stock: { increment: totalRestore } },
      });
      await tx.stockLog.create({
        data: { productId: existing.productId, change: totalRestore, reason: 'ENTRY_DELETE', entryId },
      });
    }

    await tx.entry.delete({ where: { id: entryId } });
  });

  return NextResponse.json({ message: 'Deleted' });
}
