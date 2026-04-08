import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';

export function middleware(request: NextRequest) {
  const start = Date.now();
  const requestId = crypto.randomUUID();

  const response = NextResponse.next();
  response.headers.set('x-request-id', requestId);

  const durationMs = Date.now() - start;

  logger.info({
    requestId,
    method: request.method,
    path: request.nextUrl.pathname,
    durationMs,
    message: 'Request processed',
  });

  return response;
}

export const config = {
  matcher: '/api/:path*',
};
