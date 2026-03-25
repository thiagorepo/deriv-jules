# DerivOpus Implementation Plan & Progress Tracker

This document outlines the detailed step-by-step plan to implement the Multi-Tenant Algorithmic Trading Platform (`DerivOpus`) based on the specifications. It serves as a checklist to track what has been done and what remains.

---

## Phase 1: Core Setup & Shared Libraries Architecture

_Focus: Establishing the monorepo foundation, environment structure, and shared utilities (the "80%")._

- [x] **1.1 Database Schema Initialization**
  - [x] Implement `tenants`, `profiles`, and `tenant_memberships` tables with RLS policies and multi-tenant RPC helpers (`switch_active_tenant`, `get_current_tenant_id`).
  - [x] Implement Auth/Security tables (`deriv_tokens`, `api_keys`, `user_sessions`).
  - [x] Implement Billing tables (`feature_flags`, `subscription_plans`).
  - [x] Add base seed scripts for development.
- [ ] **1.2 Shared Supabase & Auth (`@org/supabase`, `@org/shared-auth`)**
  - [ ] Set up Supabase client factories for browser, server, and admin (service role).
  - [ ] Implement HOF Auth Guards: `withAuth`, `withAdmin`, `withTenant`.
  - [ ] Create authentication helpers (`signIn`, `signUp`, `signOut`, MFA enrollment/verification).
- [ ] **1.3 Shared UI & Theme (`@org/ui`, `@org/theme`)**
  - [ ] Configure Tailwind CSS v4 and integrate `shadcn/ui` base primitives.
  - [ ] Set up the CSS theme variables and custom dark variant structure.
  - [ ] Create common layout wrappers (`AppSidebar`, `Header`, `PageContainer`).
  - [ ] Implement formatting utilities (e.g., `formatCurrency`, `formatPercent`).
- [ ] **1.4 Core Routes & Configuration (`@org/core-routes`, `@org/shared-config`)**
  - [ ] Define RBAC-aware navigation structure.
  - [ ] Implement feature flag retrieval logic based on `feature_flags` table.
- [ ] **1.5 Deriv API Client (`@org/deriv-api`)**
  - [ ] Build the WebSocket client targeting `wss://ws.derivws.com/websockets/v3`.
  - [ ] Implement custom hooks: `useDerivConnection`, `useDerivBalance`, `useDerivContracts`.

## Phase 2: Core Application APIs & Middlewares

_Focus: Protecting routes, establishing API constraints, and handling cross-cutting concerns._

- [ ] **2.1 Security Middleware Pipeline**
  - [ ] Implement `apps/core/src/middleware.ts` for JWT validation, rate limiting, and setting security headers (CSP).
  - [ ] Implement token-based CSRF protection (`withCsrf`).
- [ ] **2.2 API Rate Limiting Setup**
  - [ ] Build the in-memory rate limiting engine for `authLimiter`, `tradingLimiter`, `defaultLimiter`, etc.
- [ ] **2.3 Environment & Utilities (`apps/core/src/lib`)**
  - [ ] Create Zod schemas for environment variables (`env.ts`).
  - [ ] Setup error handling (`logCatchError`, `createErrorResponse`) and metric recording utilities.

## Phase 3: Domain Features Implementation (The "Core App")

_Focus: Building out the domain logic as defined in the `features/` directory._

- [ ] **3.1 Trading Module (`features/trading`)**
  - [ ] Trade execution form (symbol, call/put, amount).
  - [ ] Real-time price chart and balance synchronization via Deriv API.
  - [ ] Open trades list & history viewing.
  - [ ] Trade execution API endpoint (`/api/trading/execute`).
- [ ] **3.2 Wallet & Billing (`features/wallet`, `features/billing`)**
  - [ ] Setup multi-currency wallet database tables.
  - [ ] Integrate Stripe checkout sessions (`createCheckoutSession`) and webhooks (`checkout.session.completed`).
- [ ] **3.3 Automation & Strategies (`features/automation`)**
  - [ ] Strategy creator interface (dnd-kit integration).
  - [ ] Backtesting engine and strategy API endpoints.
- [ ] **3.4 Social & Copy Trading (`features/copy-trading`)**
  - [ ] Discover traders interface and statistics API.
  - [ ] Start/stop copy logic and relationship management endpoints.
- [ ] **3.5 Admin Dashboard (`features/admin`)**
  - [ ] System health, recent activity, and user management interfaces.
  - [ ] Feature flag toggle controls.

## Phase 4: Tenant Apps Implementation

_Focus: Assembling the "20% thin apps" leveraging the shared libraries and routing._

- [ ] **4.1 Base Tenant Application Structure**
  - [ ] Create `apps/tenant-alpha` with its unique environment variables (`NEXT_PUBLIC_TENANT_ID`).
  - [ ] Integrate the `withAuth` and `withTenant` Server Component guards on base pages.
  - [ ] Wire up the shared `AppSidebar` and `Header` using `@org/theme` styling.
- [ ] **4.2 Feature Integration via Flags**
  - [ ] Ensure navigation and page rendering strictly respect the tenant's `feature_flags`.
  - [ ] Wire up Trading, Automation, and Billing pages based on plan configuration.
- [ ] **4.3 Additional Tenant Spawns**
  - [ ] Create `apps/tenant-test` and further environments to validate multi-tenancy isolation.

## Phase 5: Testing & CI/CD

_Focus: Ensuring reliability and preventing regressions._

- [ ] **5.1 Unit & Integration Testing**
  - [ ] Set up Vitest configuration.
  - [ ] Write critical path tests for Auth helpers, Rate limiting, and CSRF protection.
- [ ] **5.2 Frontend E2E Verification**
  - [ ] Set up Playwright tests for auth flows, tenant switching, and the trading interface.
- [ ] **5.3 Deployment Setup**
  - [ ] Configure Vercel/Railway build settings.
  - [ ] Establish pre-commit hooks and Github Actions workflows for Nx `lint`, `test`, and `build`.
