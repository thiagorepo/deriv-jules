# @org/core-routes

Central routing, page components, and middleware for the Deriv Jules multi-tenant platform.

## Overview

This library is the heart of the 80/20 architecture. It exports every page component and all middleware logic shared across all tenant applications. Tenant apps consume these exports as thin re-exports, keeping tenant code to a bare minimum.

## Exports

### Page Components

| Export               | Route              | Description                              |
|----------------------|--------------------|------------------------------------------|
| `LoginPage`          | `/login`           | Client-side login with Supabase auth     |
| `RegisterPage`       | `/register`        | User registration page                   |
| `AdminPage`          | `/admin`           | Admin dashboard (wrapped with `withAdmin`) |
| `AdminUsersPage`     | `/admin/users`     | User management                          |
| `AdminProductsPage`  | `/admin/products`  | Product management                       |
| `AdminPlansPage`     | `/admin/plans`     | Subscription plan management             |
| `AdminSettingsPage`  | `/admin/settings`  | Tenant branding & integration settings   |
| `UserPage`           | `/user`            | User trading dashboard                   |
| `UserMarketplacePage`| `/user/marketplace`| Product marketplace                      |
| `UserPlansPage`      | `/user/plans`      | User subscription management             |
| `UserPurchasesPage`  | `/user/purchases`  | Order history                            |
| `RootLayout`         | Layout             | Shared HTML shell with theme class       |

### Middleware

| Module              | Description                                        |
|---------------------|----------------------------------------------------|
| `rate-limiter.ts`   | IP-based rate limiting with configurable windows   |
| `csrf.ts`           | CSRF token validation for mutating requests        |

### Utilities

| Module              | Description                                        |
|---------------------|----------------------------------------------------|
| `actions.tsx`       | `authenticateUser`, `logoutUser` server actions    |
| `utils/errors.ts`   | `logCatchError`, `createErrorResponse` helpers     |
| `core-routes.ts`    | `getTenantFeatureFlags` and navigation helpers     |

## Usage in Tenant Apps

Each tenant page is a single-line re-export:

```js
// apps/tenant-app-1/app/admin/page.js
export { AdminPage as default } from '@org/core-routes';
```

## Rate Limiter

The built-in rate limiter is **in-memory only** — suitable for development but must be replaced with a Redis-backed solution (e.g. `@upstash/ratelimit`) before production deployment.

```ts
import { authLimiter, tradingLimiter } from '@org/core-routes';

// Returns false when limit exceeded
const allowed = authLimiter(clientIp); // 5 req/min
```

## CSRF Protection

```ts
import { withCsrf } from '@org/core-routes';

export const POST = withCsrf(async (req) => {
  // Handle mutating request
});
```

## Dependencies

- `@org/ui` — UI components rendered in pages
- `@org/theme` — `ThemeProvider` and `useTheme`
- `@org/shared-auth` — `withAuth`, `withAdmin`, `withTenant` guards
- `@org/supabase` — Server-side Supabase client
- `@org/shared-config` — Feature flags and tenant configuration
