# Multi-Tenant Trading Platform (Nx Monorepo)

This repository contains a highly scalable, white-labeled trading platform built with **Next.js (App Router)** and **Nx**.

## Architecture: The 80/20 Rule
The project enforces a strict separation of concerns to support dozens or hundreds of tenants without code duplication:
- **80% Shared Libraries (`libs/shared/*`)**: Core business logic, UI components, Tailwind themes, authentication (RBAC), and API clients (Deriv/Supabase).
- **20% Tenant Apps (`apps/tenant-app-*`)**: Thin, "zero-code" Next.js applications that run on distinct ports. They contain `.env.local` files for tenant-specific configuration (themes, colors, names) and simply re-export routing and middleware logic from the shared `@org/core-routes` library.

## Key Features
- **Tailwind CSS v4:** Integrated using PostCSS across the monorepo. A central `global.css` dynamically applies the tenant's primary color (`--primary`) while maintaining a cohesive base dark/light theme.
- **Role-Based Access Control (RBAC):** Next.js Edge Middleware and Server Actions handle mock authentication. Users with `@admin.com` are routed to the Admin Dashboard; others are routed to the Trading Dashboard.
- **Mobile Responsive:** UI components (`InputField`, `Button`, `Sidebar`) follow mobile web app best practices (16px font sizes to prevent iOS zoom, minimum 44px touch targets, horizontal scrolling data tables).

## Getting Started
1. **Install Dependencies:**
   ```bash
   npm install
   ```
2. **Sync Nx Workspace:** (Crucial after cloning to fix TypeScript project references)
   ```bash
   npx nx sync
   ```
3. **Build All Tenants:**
   ```bash
   npx nx run-many -t build --all
   ```
4. **Run a specific Tenant:** (e.g., Tenant 1 on Port 3001)
   ```bash
   npx nx run tenant-app-1:dev
   ```

## Authentication (Mock)
- **Admin Login:** `test@admin.com` (Password: `password123`) -> Redirects to `/admin`
- **User Login:** `trader@example.com` (Password: `password123`) -> Redirects to `/user`
