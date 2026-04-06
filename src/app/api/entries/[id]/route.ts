import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { calculateEntry } from '@/lib/calculations';
import { entrySchema } from '@/lib/validators';
import { decimalToNumber } from '@/lib/utils';
import { getAuthUser } from '@/lib/auth';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const entry = await prisma.entry.findUnique({
    where: { id: Number(id) },
    include: {
      account: { select: { id: true, name: true } },
      product: { select: { id: true, name: true, cost: true } },
    },
  });

  if (!entry) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const productCost = decimalToNumber(entry.product.cost);
  const calculated = calculateEntry({
    adCost: decimalToNumber(entry.adCost),
    messages: entry.messages,
    closed: entry.closed,
    orders: entry.orders,
    salesFromPage: decimalToNumber(entry.salesFromPage),
    quantity: entry.quantity,
    crmSales: decimalToNumber(entry.crmSales),
    crmQty: entry.crmQty,
    shippingCost: decimalToNumber(entry.shippingCost),
    packingCost: decimalToNumber(entry.packingCost),
    adminCommission: decimalToNumber(entry.adminCommission),
    productCost,
  });

  return NextResponse.json({
    id: entry.id,
    date: entry.date.toISOString().split('T')[0],
    account: entry.account,
    product: { id: entry.product.id, name: entry.product.name, cost: productCost },
    adCost: decimalToNumber(entry.adCost),
    messages: entry.messages,
    closed: entry.closed,
    orders: entry.orders,
    salesFromPage: decimalToNumber(entry.salesFromPage),
    quantity: entry.quantity,
    crmSales: decimalToNumber(entry.crmSales),
    crmQty: entry.crmQty,
    shippingCost: decimalToNumber(entry.shippingCost),
    packingCost: decimalToNumber(entry.packingCost),
    adminCommission: decimalToNumber(entry.adminCommission),
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
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Validation error' }, { status: 400 });
  }

  const data = parsed.data;

  const updated = await prisma.$transaction(async (tx) => {
    // Restore old stock
    const oldTotal = existing.quantity + existing.crmQty;
    await tx.product.update({
      where: { id: existing.productId },
      data: { stock: { increment: oldTotal } },
    });

    // Check new stock availability
    const product = await tx.product.findUnique({ where: { id: data.productId } });
    if (!product) throw new Error('Product not found');

    const newTotal = data.quantity + data.crmQty;
    if (product.stock < newTotal) {
      throw new Error(`สต๊อกไม่พอ (มี ${product.stock} ต้องการ ${newTotal})`);
    }

    // Deduct new stock
    await tx.product.update({
      where: { id: data.productId },
      data: { stock: { decrement: newTotal } },
    });

    // Log stock changes
    const diff = newTotal - oldTotal;
    if (diff !== 0) {
      await tx.stockLog.create({
        data: { productId: data.productId, change: -diff, reason: 'ENTRY_EDIT', entryId },
      });
    }

    // Update entry
    return tx.entry.update({
      where: { id: entryId },
      data: {
        date: new Date(data.date),
        accountId: data.accountId,
        productId: data.productId,
        adCost: data.adCost,
        messages: data.messages,
        closed: data.closed,
        orders: data.orders,
        salesFromPage: data.salesFromPage,
        quantity: data.quantity,
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
      },
    });
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
