import { tenantMiddleware } from '@org/core-routes';

export function middleware(request) {
  return tenantMiddleware(request);
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
