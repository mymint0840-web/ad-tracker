import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { targetSchema } from '@/lib/validators';
import { decimalToNumber } from '@/lib/utils';
import { getAuthUser } from '@/lib/auth';

export async function GET() {
  const target = await prisma.dailyTarget.findFirst({
    where: { isActive: true },
    orderBy: { createdAt: 'desc' },
  });

  if (!target) {
    return NextResponse.json({ profit: 0, adPercent: 0, closeRate: 0, costPerClick: 0 });
  }

  return NextResponse.json({
    id: target.id,
    profit: decimalToNumber(target.profit),
    adPercent: decimalToNumber(target.adPercent),
    closeRate: decimalToNumber(target.closeRate),
    costPerClick: decimalToNumber(target.costPerClick),
  });
}

export async function PUT(request: NextRequest) {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const parsed = targetSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Validation error' }, { status: 400 });
  }

  // Deactivate all existing targets
  await prisma.dailyTarget.updateMany({
    where: { isActive: true },
    data: { isActive: false },
  });

  // Create new active target
  const target = await prisma.dailyTarget.create({
    data: { ...parsed.data, isActive: true },
  });

  return NextResponse.json({
    id: target.id,
    profit: decimalToNumber(target.profit),
    adPercent: decimalToNumber(target.adPercent),
    closeRate: decimalToNumber(target.closeRate),
    costPerClick: decimalToNumber(target.costPerClick),
  });
}
