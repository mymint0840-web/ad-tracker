import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { productSchema } from '@/lib/validators';
import { decimalToNumber } from '@/lib/utils';

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();
  const parsed = productSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Validation error' }, { status: 400 });
  }

  const product = await prisma.product.update({
    where: { id: Number(id) },
    data: parsed.data,
  });

  return NextResponse.json({
    id: product.id,
    name: product.name,
    cost: decimalToNumber(product.cost),
    price: decimalToNumber(product.price),
    stock: product.stock,
  });
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.product.update({
    where: { id: Number(id) },
    data: { isActive: false },
  });
  return NextResponse.json({ message: 'Deleted' });
}
