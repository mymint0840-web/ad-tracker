import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';

export async function getAuthUser() {
  const session = await getServerSession();
  if (!session?.user?.email) return null;

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, name: true, email: true, role: true, deletedAt: true },
  });

  // Soft-deleted users keep valid JWTs but cannot make authenticated requests
  if (!user || user.deletedAt) return null;
  return { id: user.id, name: user.name, email: user.email, role: user.role };
}
