import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { productSchema } from '@/lib/validators';
import { decimalToNumber } from '@/lib/utils';

export async function GET() {
  const products = await prisma.product.findMany({
    where: { isActive: true },
    orderBy: { name: 'asc' },
  });

  return NextResponse.json(products.map(p => ({
    id: p.id,
    name: p.name,
    cost: decimalToNumber(p.cost),
    price: decimalToNumber(p.price),
    stock: p.stock,
  })));
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = productSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Validation error' }, { status: 400 });
  }

  const product = await prisma.product.create({ data: parsed.data });
  return NextResponse.json({
    id: product.id,
    name: product.name,
    cost: decimalToNumber(product.cost),
    price: decimalToNumber(product.price),
    stock: product.stock,
  }, { status: 201 });
}
