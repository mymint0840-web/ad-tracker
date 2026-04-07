import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { encode } from 'next-auth/jwt';

// Simple rate limiter for test-token endpoint
const attempts = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = attempts.get(ip);

  if (!record || now > record.resetAt) {
    attempts.set(ip, { count: 1, resetAt: now + 5 * 60 * 1000 }); // 5 min window
    return true;
  }

  if (record.count >= 5) return false; // max 5 attempts per 5 min
  record.count++;
  return true;
}

// Clean up old entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, val] of attempts) {
    if (now > val.resetAt) attempts.delete(key);
  }
}, 10 * 60 * 1000);

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') ?? request.headers.get('x-real-ip') ?? 'unknown';
  if (!checkRateLimit(ip)) {
    return NextResponse.json({ error: 'Too many attempts. Try again later.' }, { status: 429 });
  }

  const { email, password } = await request.json();

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });

  const token = await encode({
    token: { id: user.id, name: user.name, email: user.email, role: user.role },
    secret: process.env.NEXTAUTH_SECRET!,
  });

  return NextResponse.json({
    token,
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
    usage: 'curl -H "Authorization: Bearer TOKEN" or Cookie: next-auth.session-token=TOKEN',
  });
}
