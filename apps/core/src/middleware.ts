import { NextResponse, type NextRequest } from 'next/server';

/**
 * Security headers configuration
 * Applied to all requests
 */
const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
};

/**
 * CSP (Content Security Policy) header
 * Dynamically generated based on environment
 */
function getCspHeader(): string {
  const isDev = process.env.NODE_ENV === 'development';

  const cspParts = [
    "default-src 'self'",
    `script-src 'self' ${isDev ? "'unsafe-inline'" : "'strict-dynamic'"}`,
    `style-src 'self' ${isDev ? "'unsafe-inline'" : "'strict-dynamic'"}`,
    "img-src 'self' data: blob: https://*.supabase.co https://images.unsplash.com",
    "font-src 'self' data:",
    "connect-src 'self' https://*.supabase.co wss://ws.derivws.com https://ws.derivws.com",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ];

  return cspParts.join('; ');
}

/**
 * Routes that should skip authentication
 */
const SKIP_AUTH_ROUTES = [
  /^\/auth\//,
  /^\/$/,
  /^\/about$/,
  /^\/privacy-policy$/,
  /^\/terms-of-service$/,
  /^\/api\/auth\//,
  /^\/api\/webhooks\//,
];

/**
 * Protected routes that require authentication
 */
const PROTECTED_ROUTES = [/^\/\(app\)\//];

/**
 * Check if a route should skip authentication
 */
function shouldSkipAuth(pathname: string): boolean {
  return SKIP_AUTH_ROUTES.some((pattern) => pattern.test(pathname));
}

/**
 * Check if a route is protected
 */
function isProtectedRoute(pathname: string): boolean {
  return PROTECTED_ROUTES.some((pattern) => pattern.test(pathname));
}

/**
 * Extract JWT token from cookies
 */
function getAuthToken(request: NextRequest): string | null {
  const token = request.cookies.get('sb-auth-token')?.value;
  return token || null;
}

/**
 * Verify JWT token validity (basic validation)
 * In production, this would validate against Supabase's public key
 */
function verifyAuthToken(token: string): boolean {
  if (!token) return false;

  try {
    // For development: simple JWT structure check
    const parts = token.split('.');
    if (parts.length !== 3) return false;

    // Decode payload to check expiration
    const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
    const expiresAt = payload.exp;

    if (!expiresAt) return false;

    // Check if token is expired
    const isExpired = Date.now() >= expiresAt * 1000;
    return !isExpired;
  } catch {
    return false;
  }
}

/**
 * In-memory rate limiting store
 * Key: IP address, Value: { count, resetTime }
 */
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX = 100; // requests per window

/**
 * Basic rate limiting implementation
 */
function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitStore.get(ip);

  if (!record || now >= record.resetTime) {
    // Reset or create new record
    rateLimitStore.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }

  record.count++;

  if (record.count > RATE_LIMIT_MAX) {
    return false;
  }

  return true;
}

/**
 * Get client IP address
 */
function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  const realIp = request.headers.get('x-real-ip');
  if (realIp) {
    return realIp;
  }
  return 'unknown';
}

/**
 * Clean up old rate limit records (run periodically)
 */
function cleanupRateLimitStore(): void {
  const now = Date.now();
  const keysToDelete: string[] = [];
  rateLimitStore.forEach((value, key) => {
    if (now >= value.resetTime) {
      keysToDelete.push(key);
    }
  });
  keysToDelete.forEach((key) => rateLimitStore.delete(key));
}

// Cleanup interval
let cleanupInterval: NodeJS.Timeout | null = null;
if (typeof globalThis !== 'undefined' && !cleanupInterval) {
  cleanupInterval = setInterval(cleanupRateLimitStore, 60 * 1000);
}

/**
 * Main middleware function
 * Runs on every request to the Next.js app
 */
export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Skip static assets and Next.js internal routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/public') ||
    pathname.match(/\.(jpg|jpeg|png|gif|ico|css|js|json)$/)
  ) {
    return NextResponse.next();
  }

  // Skip RSC internal requests
  if (request.nextUrl.searchParams.has('_rsc')) {
    return NextResponse.next();
  }

  // Apply rate limiting
  const clientIp = getClientIp(request);
  if (!checkRateLimit(clientIp)) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  // Initialize response
  const response = NextResponse.next();

  // Apply security headers to all responses
  Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  // Apply CSP header
  response.headers.set('Content-Security-Policy', getCspHeader());

  // Check authentication for protected routes
  if (!shouldSkipAuth(pathname)) {
    const token = getAuthToken(request);
    const isAuthenticated = token ? verifyAuthToken(token) : false;

    if (isProtectedRoute(pathname)) {
      // Protected route: require authentication
      if (!isAuthenticated) {
        // Return 401 JSON for API/RSC requests
        if (
          pathname.startsWith('/api/') ||
          request.headers.get('accept')?.includes('application/json')
        ) {
          return NextResponse.json(
            { error: 'Unauthorized', message: 'Authentication required' },
            { status: 401 },
          );
        }

        // Redirect to sign-in for page requests
        const url = request.nextUrl.clone();
        url.pathname = '/auth/sign-in';
        url.searchParams.set('redirect', pathname);
        return NextResponse.redirect(url);
      }

      // Authenticated user: set auth context headers for server components
      if (token) {
        response.headers.set('x-auth-token', token);
      }
    }
  }

  return response;
}

/**
 * Middleware configuration
 * Defines which routes trigger the middleware
 */
export const config = {
  matcher: [
    // Match all routes except static files
    '/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)',
  ],
};
