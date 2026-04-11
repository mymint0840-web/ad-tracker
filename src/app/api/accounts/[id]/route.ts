import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { accountSchema } from '@/lib/validators';
import { getAuthUser } from '@/lib/auth';

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (user.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { id } = await params;
  const body = await request.json();
  const parsed = accountSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Validation error' }, { status: 400 });
  }

  const account = await prisma.adAccount.update({
    where: { id: Number(id) },
    data: parsed.data,
  });
  return NextResponse.json({ id: account.id, name: account.name });
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (user.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { id } = await params;
  await prisma.adAccount.update({
    where: { id: Number(id) },
    data: { isActive: false },
  });
  return NextResponse.json({ message: 'Deleted' });
}
