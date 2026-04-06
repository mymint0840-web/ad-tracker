import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { accountSchema } from '@/lib/validators';
import { getAuthUser } from '@/lib/auth';

export async function GET() {
  const accounts = await prisma.adAccount.findMany({
    where: { isActive: true },
    orderBy: { name: 'asc' },
  });
  return NextResponse.json(accounts.map(a => ({ id: a.id, name: a.name })));
}

export async function POST(request: NextRequest) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const parsed = accountSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Validation error' }, { status: 400 });
  }

  const account = await prisma.adAccount.create({ data: parsed.data });
  return NextResponse.json({ id: account.id, name: account.name }, { status: 201 });
}
