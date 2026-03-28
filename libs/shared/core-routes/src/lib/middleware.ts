import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function tenantMiddleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const userRole = request.cookies.get('user_role')?.value;

  // Add CSP headers
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64');
  const cspHeader = `
    default-src 'self';
    script-src 'self' 'nonce-${nonce}' 'strict-dynamic';
    style-src 'self' 'unsafe-inline';
    img-src 'self' blob: data: https://dummyimage.com;
    font-src 'self';
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
    connect-src 'self' wss://ws.derivws.com https://*.supabase.co;
  `.replace(/\s{2,}/g, ' ').trim();

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-nonce', nonce);
  requestHeaders.set('Content-Security-Policy', cspHeader);

  let response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  // Basic RBAC
  if (!userRole && (url.pathname.startsWith('/admin') || url.pathname.startsWith('/user'))) {
    url.pathname = '/login';
    response = NextResponse.redirect(url);
  } else if (userRole === 'user' && url.pathname.startsWith('/admin')) {
    url.pathname = '/user';
    response = NextResponse.redirect(url);
  } else if (userRole && (url.pathname === '/login' || url.pathname === '/register')) {
    url.pathname = userRole === 'admin' ? '/admin' : '/user';
    response = NextResponse.redirect(url);
  }

  response.headers.set('Content-Security-Policy', cspHeader);
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');

  return response;
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
