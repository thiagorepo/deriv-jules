# Deriv Jules — Multi-Tenant Trading Platform (Nx Monorepo)

A highly scalable, white-labeled trading platform built with **Next.js 16 (App Router)**, **React 19**, **Tailwind CSS v4**, and **Supabase**, structured as an **Nx monorepo**.

## Architecture: The 80/20 Rule

The project enforces a strict separation of concerns to support dozens or hundreds of tenants without code duplication:

- **80% Shared Libraries (`libs/shared/*`)**: Core business logic, UI components, Tailwind themes, authentication (RBAC), and API clients (Deriv/Supabase).
- **20% Tenant Apps (`apps/tenant-app-*`)**: Thin, "zero-code" Next.js applications that run on distinct ports. They contain `.env.local` files for tenant-specific configuration (themes, colors, names) and simply re-export routing and middleware logic from the shared `@org/core-routes` library.

Adding a new tenant requires only ~15 one-line re-export files and a `.env.local` configuration — all business logic is inherited from shared libraries.

## Key Features

- **Tailwind CSS v4:** Integrated using PostCSS across the monorepo. A central `global.css` dynamically applies the tenant's primary color (`--primary`) while maintaining a cohesive base dark/light theme.
- **Role-Based Access Control (RBAC):** Composable HOC guards (`withAuth`, `withAdmin`, `withRole`, `withTenant`) wrap server components for fine-grained access control.
- **Next.js App Router + RSC:** Pages are server-rendered by default for performance and SEO. Client interactivity is isolated to leaf components with `'use client'`.
- **Deriv WebSocket API:** Singleton `DerivApiService` manages a persistent WebSocket connection with auto-reconnect and pub/sub message routing.
- **Multi-tenant theming:** `ThemeProvider` injects CSS variables per tenant, allowing Tailwind classes like `bg-primary` to dynamically reflect tenant branding.
- **Mobile Responsive:** UI components follow mobile best practices — 16px minimum font sizes, 48px touch targets, horizontal-scrolling data tables.
- **Security headers:** CSP, X-Frame-Options, X-Content-Type-Options, and Permissions-Policy applied on every request via middleware.

## Repository Structure

```
deriv-jules/
├── apps/
│   ├── core/              # Next.js hub with full API layer (TypeScript)
│   ├── tenant-app/        # Primary tenant (ports 3000)
│   ├── tenant-app-1/      # Tenant 1 — port 3001
│   ├── tenant-app-2/      # Tenant 2 — port 3002
│   ├── tenant-app-3/      # Tenant 3 — port 3003
│   └── tenant-app-4/      # Tenant 4 — port 3004
├── libs/shared/
│   ├── core-routes/       # All page components, middleware, RBAC
│   ├── ui/                # Reusable React components (Button, Card, Sidebar…)
│   ├── theme/             # ThemeProvider, CSS variable injection
│   ├── shared-auth/       # withAuth, withAdmin, withRole, withTenant guards
│   ├── shared-config/     # Tenant config, feature flags, nav definitions
│   ├── shared-types/      # Shared TypeScript interfaces
│   ├── shared-supabase/   # Multi-client Supabase factory
│   ├── supabase/          # Supabase client utilities
│   └── deriv-api/         # WebSocket API client + React hooks
├── e2e/                   # Playwright E2E tests
├── supabase/              # DB migrations
└── docs/                  # Architecture docs & specs
```

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm (recommended) or npm
- A Supabase project (see `.env.example`)

### Installation

```bash
# Install dependencies
pnpm install

# Sync Nx workspace (fixes TypeScript project references after cloning)
pnpm nx sync

# Copy and configure environment variables
cp .env.example apps/tenant-app-1/.env.local
# Edit .env.local with your Supabase URL and anon key
```

### Running a Tenant

```bash
# Run tenant-app-1 on port 3001
pnpm nx run tenant-app-1:dev

# Run the core app
pnpm nx run core:dev

# Build all apps
pnpm nx run-many -t build --all
```

### Testing

```bash
# Run unit tests
pnpm nx run-many -t test --all

# Run E2E tests
pnpm nx run e2e:e2e

# Type check
pnpm nx run-many -t typecheck --all
```

## Authentication

The platform uses Supabase Auth for session management. Guards wrap server components to enforce RBAC.

| Credential             | Password      | Role  | Redirects to |
|------------------------|---------------|-------|--------------|
| `test@admin.com`       | `password123` | admin | `/admin`     |
| `trader@example.com`   | `password123` | user  | `/user`      |

## Environment Variables

Copy `.env.example` and fill in values:

| Variable                                | Required | Description                          |
|-----------------------------------------|----------|--------------------------------------|
| `NEXT_PUBLIC_SUPABASE_URL`              | Yes      | Supabase project URL                 |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY`         | Yes      | Supabase anon (public) key           |
| `NEXT_PUBLIC_TENANT_NAME`               | Yes      | Display name for the tenant          |
| `NEXT_PUBLIC_PRIMARY_COLOR`             | No       | Brand colour (hex, default `#10b981`)|
| `NEXT_PUBLIC_THEME`                     | No       | `dark` or `light` (default: `dark`)  |
| `FEATURE_TRADING`                       | No       | Enable trading module (`true/false`) |

## Shared Library Reference

| Package               | Description                                           |
|-----------------------|-------------------------------------------------------|
| `@org/core-routes`    | Page components, middleware, CSRF/rate-limiter        |
| `@org/ui`             | Button, Card, Sidebar, dashboards, admin/user views   |
| `@org/theme`          | `ThemeProvider`, `useTheme` hook, CSS variables       |
| `@org/shared-auth`    | `withAuth`, `withAdmin`, `withRole`, `withTenant`     |
| `@org/shared-config`  | `getTenantConfig`, feature flags, navigation          |
| `@org/shared-types`   | `AppUser`, `TenantConfig`, `NavItem`, `UserRole`      |
| `@org/supabase`       | `createServerClient`, `createBrowserClient`           |
| `@org/deriv-api`      | `DerivApiService` singleton, `useDerivConnection`     |

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for commit conventions, branch strategy, and PR process.
