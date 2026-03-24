# @org/core-routes

The `core-routes` library contains the essential Next.js App Router logic, Server Actions, and Edge Middleware shared across all multitenant applications.

## Key Exports
- **TenantPage**: The main dashboard page used by `tenant-app-*`.
- **RootLayout**: The root layout wrapper handling themes.
- **authenticateUser / logoutUser**: Supabase auth Server Actions.
- **tenantMiddleware**: Next.js Edge Middleware for implementing RBAC based on cookies.

This library relies heavily on dynamic CSS variables parsed by `@org/theme` and consumes shared UI components from `@org/ui`.
