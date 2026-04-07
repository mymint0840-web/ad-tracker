import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { getAuthUser } from '@/lib/auth';

const pageSchema = z.object({
  name: z.string().min(1, 'กรุณากรอกชื่อเพจ'),
});

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const body = await request.json();
  const parsed = pageSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Validation error' }, { status: 400 });
  }

  const page = await prisma.page.update({
    where: { id: Number(id) },
    data: parsed.data,
  });
  return NextResponse.json({ id: page.id, name: page.name });
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  await prisma.page.update({
    where: { id: Number(id) },
    data: { isActive: false },
  });
  return NextResponse.json({ message: 'Deleted' });
}
