import { NextRequest } from 'next/server';
import { tenantMiddleware } from '@org/core-routes';

export function middleware(request: NextRequest) {
  return tenantMiddleware(request);
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
