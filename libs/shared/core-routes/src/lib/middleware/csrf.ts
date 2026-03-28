import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function withCsrf(handler: (request: NextRequest) => Promise<NextResponse>) {
  return async (request: NextRequest) => {
    // Only apply CSRF protection to mutating methods
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method)) {
      const csrfToken = request.headers.get('x-csrf-token');
      const cookieToken = request.cookies.get('csrf_token')?.value;

      if (!csrfToken || !cookieToken || csrfToken !== cookieToken) {
        return new NextResponse(JSON.stringify({ error: 'CSRF token validation failed' }), {
          status: 403,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    }

    return handler(request);
  };
}
