import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { getAuthUser } from '@/lib/auth';

const pageSchema = z.object({
  name: z.string().min(1, 'กรุณากรอกชื่อเพจ'),
});

export async function GET() {
  const pages = await prisma.page.findMany({
    where: { isActive: true },
    orderBy: { name: 'asc' },
  });
  return NextResponse.json(pages.map(p => ({ id: p.id, name: p.name })));
}

export async function POST(request: NextRequest) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const parsed = pageSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Validation error' }, { status: 400 });
  }

  const page = await prisma.page.create({ data: parsed.data });
  return NextResponse.json({ id: page.id, name: page.name }, { status: 201 });
}
