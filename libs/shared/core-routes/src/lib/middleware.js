import { NextResponse } from 'next/server';

// Shared Middleware for all 5 Tenant Apps
export function tenantMiddleware(request) {
  const url = request.nextUrl.clone();
  
  // Read the HttpOnly cookie set by the Server Action
  const userRole = request.cookies.get('user_role')?.value;

  // 1. RBAC: Prevent unauthenticated users from accessing protected routes
  if (!userRole && (url.pathname.startsWith('/admin') || url.pathname.startsWith('/user'))) {
    console.log('[Middleware] Unauthorized access attempt. Redirecting to /login.');
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  // 2. RBAC: Prevent standard 'user' from accessing '/admin'
  if (userRole === 'user' && url.pathname.startsWith('/admin')) {
    console.log('[Middleware] User attempted to access Admin Portal. Redirecting to /user.');
    url.pathname = '/user';
    return NextResponse.redirect(url);
  }

  // 3. UX: Prevent authenticated users from going back to login/register pages
  if (userRole && (url.pathname === '/login' || url.pathname === '/register')) {
    console.log(`[Middleware] Authenticated user (${userRole}) visiting auth page. Redirecting to dashboard.`);
    url.pathname = userRole === 'admin' ? '/admin' : '/user';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

// Ensure the middleware only runs on paths we care about,
// skipping Next.js static assets and image optimization
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
