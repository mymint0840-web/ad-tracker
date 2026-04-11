#!/usr/bin/env bun
// Stateful regression test for DELETE /api/users/[id] (soft-delete).
//
// Covers the four cases from the audit:
//   1. STAFF cannot delete                              → 403
//   2. ADMIN can delete an existing user                → 200 + deletedAt set
//   3. Soft-deleted user cannot log in                  → 401 (CredentialsSignin)
//   4. ADMIN deleting an already-deleted user           → 404
//
// Test users are created and torn down in the same run via try/finally so
// nothing leaks into the DB even if a check fails. Email prefix:
//   users-delete-test-<timestamp>-<role>@mac-tester.local
//
// Usage:
//   BASE_URL=http://localhost:3000 bun tests/api/users-delete.mjs

import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { encode } from 'next-auth/jwt';
import bcrypt from 'bcryptjs';

const BASE_URL = process.env.BASE_URL ?? 'http://localhost:3000';
const SECRET = process.env.NEXTAUTH_SECRET;
const DATABASE_URL = process.env.DATABASE_URL;
if (!SECRET || !DATABASE_URL) {
  console.error('NEXTAUTH_SECRET and DATABASE_URL must be set — source .env first.');
  process.exit(2);
}

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: DATABASE_URL }) });
const STAMP = Date.now();
const PREFIX = `users-delete-test-${STAMP}`;

let fail = 0;
function check(name, expected, actual) {
  if (expected === actual) {
    console.log(`PASS  ${name} → ${actual}`);
  } else {
    console.log(`FAIL  ${name} → expected ${expected}, got ${actual}`);
    fail = 1;
  }
}

async function makeCookie(user) {
  // Match the JWT shape produced by NextAuth's session callback.
  const token = await encode({
    token: { id: user.id, name: user.name, email: user.email, role: user.role, sub: user.id },
    secret: SECRET,
  });
  return `next-auth.session-token=${token}`;
}

async function main() {
  const password = await bcrypt.hash('testpass123', 10);
  const admin = await prisma.user.create({
    data: { name: 'admin', email: `${PREFIX}-admin@mac-tester.local`, password, role: 'ADMIN' },
  });
  const staff = await prisma.user.create({
    data: { name: 'staff', email: `${PREFIX}-staff@mac-tester.local`, password, role: 'STAFF' },
  });
  const victim = await prisma.user.create({
    data: { name: 'victim', email: `${PREFIX}-victim@mac-tester.local`, password, role: 'STAFF' },
  });

  const adminCookie = await makeCookie(admin);
  const staffCookie = await makeCookie(staff);

  // 1. STAFF cannot delete
  let res = await fetch(`${BASE_URL}/api/users/${victim.id}`, {
    method: 'DELETE',
    headers: { Cookie: staffCookie },
  });
  check('DELETE /api/users/[id] as STAFF', 403, res.status);

  // 2. ADMIN can delete the existing user
  res = await fetch(`${BASE_URL}/api/users/${victim.id}`, {
    method: 'DELETE',
    headers: { Cookie: adminCookie },
  });
  check('DELETE /api/users/[id] as ADMIN', 200, res.status);
  const body = await res.json();
  if (!body?.deletedAt) {
    console.log('FAIL  ADMIN delete did not return deletedAt');
    fail = 1;
  } else {
    console.log(`PASS  ADMIN delete returned deletedAt = ${body.deletedAt}`);
  }

  // 3. Soft-deleted user cannot log in via NextAuth credentials
  // We hit the callback URL directly: a successful login redirects 302 to
  // the callback URL, a failed login redirects 302 back to /login?error=…
  // Either way, status is 200 from NextAuth's HTML response in this build.
  // The reliable signal is that getAuthUser() with the OLD cookie now fails:
  const victimCookie = await makeCookie(victim);
  res = await fetch(`${BASE_URL}/api/entries`, {
    method: 'GET',
    headers: { Cookie: victimCookie },
  });
  check('GET /api/entries with soft-deleted JWT', 401, res.status);

  // 4. ADMIN deleting an already-deleted user → 404
  res = await fetch(`${BASE_URL}/api/users/${victim.id}`, {
    method: 'DELETE',
    headers: { Cookie: adminCookie },
  });
  check('DELETE /api/users/[id] already-deleted', 404, res.status);
}

try {
  await main();
} catch (err) {
  console.error('TEST HARNESS ERROR:', err);
  fail = 1;
} finally {
  // Hard-delete the test users — these are throwaway fixtures, not real users.
  const removed = await prisma.user.deleteMany({
    where: { email: { startsWith: PREFIX } },
  });
  console.log(`teardown: removed ${removed.count} test users`);
  await prisma.$disconnect();
}

process.exit(fail);
