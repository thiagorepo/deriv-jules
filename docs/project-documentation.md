# Project Documentation - `@org` Multi-Tenant Platform

## Overview

This repository houses a highly scalable, white-labeled trading platform built using a monorepo architecture. It leverages Next.js (App Router) and Tailwind CSS v4, orchestrated by Nx.

The primary goal of this architecture is to support dozens or hundreds of individual tenant applications without code duplication.

## Architecture: The "80/20 Rule"

The project strictly enforces an 80/20 separation of concerns:

- **Shared Libraries (`libs/shared/*`) - 80%:** These libraries contain the core business logic, UI components, authentication routines, APIs, and even the Next.js routing structures. They are built as framework-agnostic (or Next.js-specific) packages that can be consumed by any tenant app.
- **Tenant Apps (`apps/tenant-app-*`) - 20%:** These are exceedingly thin, "zero-code" Next.js applications. They consist almost entirely of configuration files (like `.env.local` for tenant-specific styling and naming) and basic Next.js boilerplate that re-exports the routing logic directly from the shared `@org/core-routes` library.

### Shared Libraries Breakdown

- `@org/core-routes`: The heart of the application. It contains all the Next.js `page.tsx`, `layout.tsx`, and `middleware.ts` files. Tenant apps simply re-export these. It also handles mock authentication via Next.js Server Actions.
- `@org/ui`: A shared component library (e.g., `Button`, `Card`, `InputField`, `Sidebar`, `AdminDashboard`) used across all routes.
- `@org/theme`: Contains the `ThemeProvider` context which dynamically injects CSS variables based on the tenant's configuration, allowing Tailwind CSS to adapt to different brand colors at runtime.
- `@org/deriv-api`: A singleton WebSocket manager designed to connect to the Deriv API. It handles reconnection, state management, and pub/sub events.
- `@org/supabase`: A mocked Supabase client. It simulates database queries (like fetching a list of mock tenants) and provides mocked authentication functions for both Server-Side Rendering (SSR) and Client-Side Rendering (CSR).

## Key Features

1. **Dynamic Theming (Tailwind v4):** A central `global.css` defines base variables. The `ThemeProvider` injects the tenant's specific `--primary` color (defined in their `.env.local` as `NEXT_PUBLIC_PRIMARY_COLOR`) into the DOM, which Tailwind then uses dynamically.
2. **Role-Based Access Control (RBAC):** Next.js Edge Middleware (`tenantMiddleware`) intercepts requests. It reads an `HttpOnly` cookie (`user_role`) set during the mock login process. Users with the `admin` role are directed to `/admin`, while standard users are directed to `/user`. Unauthorized users are redirected to `/login`.
3. **Mobile Responsiveness:** UI components are designed with mobile best practices in mind, including 16px base fonts (to prevent iOS zoom) and minimum 44px touch targets.
4. **Strict Typing:** The codebase is written in strict TypeScript (`.ts` and `.tsx`), ensuring robust interfaces between the core routing logic, the UI components, and the API integrations.

## Mock Authentication System

Currently, the platform uses a simulated authentication system for demonstration purposes:

- **Admin Login:** Any email ending in `@admin.com` (e.g., `test@admin.com`) with a password of at least 6 characters.
- **User Login:** Any other valid email (e.g., `trader@example.com`) with a password of at least 6 characters.
- **Flow:** The `authenticateUser` Server Action validates the input, sets a `user_role` cookie (`'admin'` or `'user'`), and redirects the user. The Next.js Middleware then enforces access based on this cookie.

## Adding a New Tenant

Spinning up a new tenant is designed to take seconds:

1. Generate a new Next.js app in the `apps` directory using Nx.
2. Replace the generated `app/` directory contents with re-exports from `@org/core-routes`.
3. Create a `.env.local` file with the tenant's specific configuration:
   ```env
   NEXT_PUBLIC_THEME=dark
   NEXT_PUBLIC_PRIMARY_COLOR=#3b82f6
   NEXT_PUBLIC_TENANT_NAME="New Brokerage"
   ```
4. Update port configurations in `project.json` to ensure it runs concurrently with other tenants without collision.

## Current Gaps & Future Work

While the architecture is sound, several areas require development for production readiness (detailed further in `docs/code-reviews/in-depth-audit.md`):

1. **Testing:** Implement comprehensive unit tests (Jest/Vitest) for libraries and End-to-End tests (Playwright) to ensure the shared routing logic doesn't break tenant apps.
2. **Real Authentication:** Replace the mock Server Actions and mock Supabase client with a genuine identity provider and proper session management.
3. **Data Management:** Implement real database connections and robust CRUD interfaces in the Admin dashboards.
4. **Advanced UI:** Expand the `@org/ui` library with complex data tables, modal dialogs, and toast notifications to support a fully-featured trading platform.
