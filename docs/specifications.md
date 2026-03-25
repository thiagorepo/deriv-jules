# DerivOpus — Complete Platform Specification

A multi-tenant algorithmic trading platform built on Next.js 16, React 19, TypeScript strict, Tailwind v4, shadcn/ui, Supabase, Stripe, and the Deriv WebSocket API.

This document describes every page, feature, API endpoint, database table, and integration so the platform can be replicated from scratch.

---

## Table of Contents

1. [Tech Stack](#tech-stack)
2. [Monorepo Structure](#monorepo-structure)
3. [Environment Variables](#environment-variables)
4. [Authentication System](#authentication-system)
5. [Multi-Tenancy Model](#multi-tenancy-model)
6. [Pages & Routes](#pages--routes)
7. [API Endpoints](#api-endpoints)
8. [Feature Modules](#feature-modules)
9. [Custom Hooks](#custom-hooks)
10. [Database Schema (42 Tables)](#database-schema)
11. [Deriv WebSocket Integration](#deriv-websocket-integration)
12. [Stripe Billing Integration](#stripe-billing-integration)
13. [Security Architecture](#security-architecture)
14. [Rate Limiting](#rate-limiting)
15. [Middleware Pipeline](#middleware-pipeline)
16. [Shared Packages](#shared-packages)
17. [UI Component Library](#ui-component-library)
18. [Theme System](#theme-system)
19. [Feature Flags](#feature-flags)
20. [Testing Setup](#testing-setup)

---

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | Next.js (App Router) | 16.x |
| UI | React | 19.x |
| Language | TypeScript | strict mode |
| Styling | Tailwind CSS | v4 (`@import 'tailwindcss'`) |
| Components | shadcn/ui (Radix UI) | 47+ primitives |
| Icons | lucide-react (primary), @tabler/icons-react (sidebar legacy) |
| Database | PostgreSQL via Supabase | 15.x |
| Auth | Supabase Auth (email/password, magic link, Google OAuth, MFA/TOTP) |
| Realtime | Deriv WebSocket API (`wss://ws.derivws.com/websockets/v3`) |
| Payments | Stripe (subscriptions, checkout, billing portal, webhooks) |
| Forms | react-hook-form + @hookform/resolvers + Zod v4 |
| Validation | Zod | 4.x |
| Toasts | sonner |
| URL State | nuqs |
| Monorepo | Nx | latest |
| Package Manager | pnpm | |
| CI/CD | GitHub Actions | |
| Deployment | Vercel / Railway | |
| Testing | Vitest 4.1 + @testing-library/react + jsdom | |
| Observability | Sentry (conditional) | |
| Linting | ESLint 8 (broken — needs v9 migration) | |

---

## Monorepo Structure

```
deriv-opus/
  apps/
    core/                    # Main application (port 1279)
      src/
        app/                 # Next.js App Router pages & API routes
        components/
          ui/                # 47+ shadcn/ui primitives (DO NOT edit directly)
          layout/            # AppSidebar, Header, InfoSidebar, PageContainer
          forms/             # 10 form field wrappers
          features/<domain>/ # Domain-specific components
            components/      # Feature UI components
        hooks/               # 16 custom React hooks
        lib/
          security/          # Auth middleware, CSRF, rate limiting, headers
          validation/        # 22 Zod schema files
          utils.ts           # cn() utility (clsx + tailwind-merge)
          env.ts             # Zod-validated environment variables
          error-logger.ts    # logCatchError()
          error-response.ts  # createErrorResponse(), createNotFoundResponse()
          api-client.ts      # parseJsonResponse<T>(), createTypedFetch<T>()
          metrics.ts         # recordApiMetric()
          logger.ts          # Environment-aware logging
          format.ts          # formatDate(), formatBytes()
        types/               # TypeScript type definitions
    tenant-alpha/             # Tenant variant (port 3001)
    tenant-test/              # Tenant variant (port 3002)
  packages/
    deriv-api/               # Deriv WebSocket client + React hooks
    shared-auth/             # Auth helpers (signIn, signUp, signOut, guards)
    shared-config/           # Navigation, feature flags, tenant config, Stripe
    shared-supabase/         # Client factories (browser, server, admin)
    shared-types/            # Cross-app TypeScript types
    shared-ui/               # Shared UI formatting utilities (formatCurrency, formatPercent)
  supabase/
    migrations/
      tables/                # 42 table definitions (one file per table)
      triggers/              # 4 trigger files
      indexes/               # 3 index files
      rpcs/                  # 8 RPC function files
      data/                  # Data migration files
      seed.sql               # Seed data
```

---

## Environment Variables

Validated at startup via Zod in `apps/core/src/lib/env.ts`.

**Required:**
- `NEXT_PUBLIC_SUPABASE_URL` — Supabase project URL
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY` — Supabase anon/publishable key
- `SUPABASE_SERVICE_ROLE_KEY` — Supabase service role key (bypasses RLS)

**Optional with defaults:**
- `DERIV_APP_ID` — Deriv API app ID (default: `1089`)
- `NEXT_PUBLIC_WS_URL` — Deriv WebSocket URL (default: `wss://ws.derivws.com/websockets/v3`)

**Optional:**
- `NEXT_PUBLIC_SENTRY_DSN`, `NEXT_PUBLIC_SENTRY_DISABLED` (default: true)
- `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `OPENAI_API_KEY`, `NEXT_PUBLIC_AI_MODEL` (default: gpt-4o-mini)
- `NEXT_PUBLIC_TENANT_ID`, `NEXT_PUBLIC_TENANT_NAME`, `NEXT_PUBLIC_TENANT_DOMAIN`, `NEXT_PUBLIC_TENANT_LOGO`, `NEXT_PUBLIC_TENANT_PRIMARY_COLOR`

---

## Authentication System

### Providers
- Email/password signup + sign-in
- Magic link (passwordless)
- Google OAuth

### Multi-Factor Authentication (MFA)
- TOTP enrollment via `/api/auth/mfa/enroll` (returns `factorId` + `qrCode`)
- Verification via `/api/auth/mfa/verify`
- Factor management via `/api/auth/mfa/factors` and `/api/auth/mfa/unenroll`
- TOTP secret is NOT exposed to client

### Auth Guards

**Client-side (React components):**
- `withAuth()` — redirects to `/auth/sign-in` if unauthenticated
- `withAdmin()` — redirects to `/overview` if not admin/super_admin

**Server-side (API routes):**
- `withAuth(fn)` — wraps handler, provides `{ userId, supabase, role, profile }`
- `withAdmin(fn)` — same + requires admin/super_admin role
- `withOptionalAuth(fn)` — passes user if available, no redirect
- `withRole(roles)(fn)` — custom role check
- `withTenant(fn)` — requires tenant context, provides `{ tenantId, userId, supabase, role }`
- `withAdminTenant(fn)` — withTenant + admin check
- `withCsrf(fn)` — CSRF token validation for mutating endpoints

### Session Flow
1. User signs in via Supabase Auth
2. JWT stored in cookies (managed by Supabase)
3. Middleware validates JWT on every request (including RSC requests)
4. Server components call `withAuth()` for page-level protection
5. API routes use HOF wrappers for endpoint-level protection
6. Database queries enforce RLS based on `auth.uid()`

---

## Multi-Tenancy Model

### Architecture
- Every table has `tenant_id UUID REFERENCES tenants(id)` with RLS enabled
- Users can belong to multiple tenants via `tenant_memberships`
- One membership per user has `is_default = true` (active tenant)
- RPC `switch_active_tenant(target_id)` atomically swaps active tenant

### Tenant Configuration
- `tenants` table stores: name, domain, logo_url, primary_color, plan (free/starter/pro/enterprise)
- Per-tenant feature flags via `feature_flags` table (11 flags)
- Per-tenant subscription plans via `subscription_plans` table
- Tenant apps (`tenant-alpha`, `tenant-test`) are separate Next.js deployments with env-based config

### RLS Pattern
```sql
-- Standard user access
CREATE POLICY "users_own_data" ON my_table
  FOR ALL USING (
    tenant_id = get_current_tenant_id()
    AND (user_id = auth.uid() OR is_tenant_admin())
  );

-- Admin-only access
CREATE POLICY "admin_only" ON admin_table
  FOR ALL USING (is_tenant_admin());
```

### RPC Helpers
- `get_current_tenant_id()` — resolves from `tenant_memberships` (is_default) or `profiles`
- `get_current_tenant_role()` — resolves role from active membership
- `is_tenant_admin()` — checks admin/super_admin via role
- `switch_active_tenant(target_id)` — atomically switches is_default flags
- `get_user_tenants()` — lists all tenants with roles

---

## Pages & Routes

### Public Pages

| Route | Purpose |
|-------|---------|
| `/` | Landing/marketing page |
| `/about` | About the platform |
| `/privacy-policy` | Privacy policy |
| `/terms-of-service` | Terms of service |

### Auth Pages

| Route | Purpose |
|-------|---------|
| `/auth` | Auth layout |
| `/auth/sign-in` | Email/password sign-in + Google OAuth + magic link |
| `/auth/sign-up` | Registration with email/password |
| `/auth/forgot-password` | Password reset request |

### App Pages (Authenticated, `(app)` route group)

**Layout:** Sidebar navigation + header + content area. All protected by `withAuth()` in the `(app)/layout.tsx`.

#### Dashboard & Overview

| Route | Purpose |
|-------|---------|
| `/overview` | Main dashboard with parallel route slots: `@area_stats`, `@bar_stats`, `@pie_stats`, `@sales` |

#### Trading

| Route | Purpose |
|-------|---------|
| `/trading` | Live trading interface with Deriv API integration |
| `/trading-analytics` | Trading performance analytics |
| `/open-trades` | Active/open trade positions |
| `/history` | Closed trade history |
| `/signals` | Trading signals feed |
| `/journal` | Trading journal/notes |
| `/copy-trading` | Copy trading — discover and follow traders |

#### Automation & Strategies

| Route | Purpose |
|-------|---------|
| `/automation` | Strategy list and management |
| `/automation/create-strategy` | Strategy creator with drag-and-drop (dnd-kit) |
| `/marketplace` | Strategy marketplace — browse and purchase |

#### Analytics & Data

| Route | Purpose |
|-------|---------|
| `/analytics` | Platform analytics |
| `/market-sentiment` | Market sentiment analysis |
| `/trading-analytics` | Detailed trading performance |

#### Finance

| Route | Purpose |
|-------|---------|
| `/wallets` | Wallet overview |
| `/wallets/multi-currency` | Multi-currency wallet management |
| `/plans` | Subscription plans (free/starter/pro/enterprise) |
| `/billing` | Stripe billing portal |
| `/coupons` | Coupon redemption |

#### Education

| Route | Purpose |
|-------|---------|
| `/education` | Education layout |
| `/education/courses` | Course catalog |
| `/education/courses/manage` | Course content management |
| `/education/tutorials` | Tutorials |
| `/courses` | Direct course access |
| `/tutorials` | Direct tutorial access |

#### Profile & Settings

| Route | Purpose |
|-------|---------|
| `/profile` | Catch-all profile pages `[[...profile]]` |
| `/settings` | Settings layout |
| `/settings/exports` | Data export management |
| `/connections/deriv-profile` | Deriv account connection |

#### Rewards & Gamification

| Route | Purpose |
|-------|---------|
| `/rewards` | Rewards dashboard |
| `/achievements` | Achievement gallery |
| `/gamification` | Challenges and gamification |
| `/affiliate` | Affiliate program dashboard |

#### AI & Support

| Route | Purpose |
|-------|---------|
| `/ai-assistant` | AI chatbot (OpenAI-powered) |
| `/support` | Support ticket creation |
| `/support/tickets` | Support ticket management |
| `/notifications` | Notification center |

#### Other

| Route | Purpose |
|-------|---------|
| `/api-keys` | API key management |
| `/downloads` | Downloadable files |
| `/events` | Platform events |
| `/exclusive` | Exclusive content |
| `/kanban` | Kanban board |
| `/monitoring` | System monitoring |
| `/onboarding` | User onboarding flow |
| `/optimization-test` | Strategy optimization testing |
| `/performance-report` | Performance reports |
| `/product` | Product catalog |
| `/product/[productId]` | Individual product page |
| `/tools` | Trading tools |
| `/workspaces` | Workspace management |
| `/workspaces/team/[[...rest]]` | Team workspace pages |
| `/migration-dashboard` | Migration tracking |

### Admin Pages (`/admin`)

**Layout:** Admin sidebar with sub-groups. Protected by `withAdmin()`.

#### Admin Dashboard

| Route | Purpose |
|-------|---------|
| `/admin` | Admin dashboard with sub-groups (operations, finance, users, content, trading) |

#### Admin — Users

| Route | Purpose |
|-------|---------|
| `/admin/users` | User list with bulk actions |
| `/admin/users/users-dashboard` | User analytics dashboard |
| `/admin/users/affiliates` | Affiliate management |
| `/admin/users/affiliates/payments` | Affiliate payout management |
| `/admin/users/register` | Admin user registration |

#### Admin — Trading

| Route | Purpose |
|-------|---------|
| `/admin/trading/trading` | Trading oversight |
| `/admin/trading/open-trades` | All open trades |
| `/admin/trading/trade-history` | Full trade history |
| `/admin/trading/signals` | Signal management |
| `/admin/trading/copy-trading` | Copy trading oversight |

#### Admin — Content

| Route | Purpose |
|-------|---------|
| `/admin/content/marketplace` | Marketplace listing management |
| `/admin/content/education` | Education content management |
| `/admin/content/gamification` | Gamification management |
| `/admin/content/events` | Event management |
| `/admin/content/strategies` | Strategy management |
| `/admin/content/strategies-management` | Strategy listing and approval |
| `/admin/content/strategy-creator` | Strategy creation |
| `/admin/content/strategy-builder` | Visual strategy builder |

#### Admin — Finance

| Route | Purpose |
|-------|---------|
| `/admin/finance/wallets` | Wallet oversight |
| `/admin/finance/plans` | Subscription plan management |
| `/admin/finance/coupons` | Coupon management |
| `/admin/finance/rewards` | Reward management |
| `/admin/finance/analytics` | Revenue analytics |
| `/admin/finance/ai-config` | AI configuration |

#### Admin — Operations

| Route | Purpose |
|-------|---------|
| `/admin/operations/operations` | Operations dashboard |
| `/admin/operations/support` | Support ticket management |
| `/admin/operations/notifications` | System notifications |
| `/admin/operations/downloads` | Download management |
| `/admin/operations/market-sentiment` | Market sentiment |
| `/admin/operations/feature-flags` | Per-tenant feature flags (11 flags) |
| `/admin/operations/api-keys` | API key oversight |
| `/admin/operations/logs` | Audit logs |
| `/admin/operations/settings` | System settings |
| `/admin/operations/login` | Login as user |
| `/admin/operations/test` | Testing utilities |
| `/admin/operations/connections` | Connection management |
| `/admin/operations/gamification` | Gamification settings |

---

## API Endpoints

### Authentication (`/api/auth`)

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| POST | `/api/auth/magic-link` | public | Send magic link email |
| POST | `/api/auth/verify-magic-link` | public | Verify magic link token |
| GET | `/api/auth/admin-check` | withAuth | Check if user is admin |
| POST | `/api/auth/oauth/google` | public | Google OAuth handler |
| POST | `/api/auth/mfa/enroll` | withAuth | Enroll TOTP factor (returns factorId + qrCode) |
| POST | `/api/auth/mfa/verify` | withAuth | Verify TOTP code |
| GET | `/api/auth/mfa/factors` | withAuth | List enrolled MFA factors |
| POST | `/api/auth/mfa/unenroll` | withAuth | Remove MFA factor |

### Trading (`/api/trading`)

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| POST | `/api/trading/execute` | withAuth, withCsrf | Execute a trade (rate-limited: 60/min) |
| GET | `/api/trading/open-positions` | withAuth | Get open trade positions |
| GET | `/api/trading/history` | withAuth | Get trade history |
| GET | `/api/trading/positions` | withAuth | Get all positions |
| GET | `/api/trading/signals` | withAuth | Get trading signals |
| POST | `/api/trading/signals/backtest` | withAuth | Backtest signal strategy |
| POST | `/api/trading/orders` | withAuth | Place trading order (market/limit/stop) |

### Deriv Integration (`/api/deriv`)

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| GET | `/api/deriv/auth-status` | withAuth | Check Deriv token validity |
| GET | `/api/deriv/connection-status` | withAuth | WebSocket connection status |
| GET | `/api/deriv/balance` | withAuth | Get account balance |
| GET | `/api/deriv/balance/subscribe` | withAuth | Subscribe to balance updates |
| GET | `/api/deriv/active-symbols` | withAuth | Get available trading symbols |
| GET | `/api/deriv/contracts-for` | withAuth | Get available contract types |
| GET | `/api/deriv/portfolio` | withAuth | Get portfolio |
| GET | `/api/deriv/tick-history` | withAuth | Get historical tick data |
| GET | `/api/deriv/status` | withAuth | Deriv API status |
| GET | `/api/deriv/debug-data` | withAuth | Debug data |
| GET | `/api/deriv/user-token` | withAuth | Get current user token |
| GET | `/api/deriv/client-tokens` | withAuth | List all stored tokens |
| POST | `/api/deriv/tokens` | withAuth, withCsrf | Store new Deriv token |
| GET | `/api/deriv/tokens/active` | withAuth | Get active tokens |
| GET | `/api/deriv/tokens/primary` | withAuth | Get primary token |
| PATCH | `/api/deriv/tokens/[id]` | withAuth, withCsrf | Update token (set primary) |
| DELETE | `/api/deriv/tokens/[id]` | withAuth, withCsrf | Delete token |
| POST | `/api/deriv/auto-authenticate` | withAuth | Auto-authenticate with Deriv |
| POST | `/api/deriv/test-connection` | withAuth | Test Deriv connection |

### Copy Trading (`/api/copy-trading`)

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| GET | `/api/copy-trading/traders` | withAuth | Discover traders to copy |
| GET | `/api/copy-trading/statistics` | withAuth | Platform-wide copy trading stats |
| GET | `/api/copy-trading/my-copies` | withAuth | User's active copy relationships |
| POST | `/api/copy-trading/start-copy` | withAuth, withCsrf | Start copying a trader |
| POST | `/api/copy-trading/execute` | withAuth | Execute copy trade |
| GET | `/api/copy-trading/stats` | withAuth | User's copy trading performance |
| PATCH | `/api/copy-trading/copies/[id]/pause` | withAuth, withCsrf | Pause a copy relationship |
| PATCH | `/api/copy-trading/copies/[id]/resume` | withAuth, withCsrf | Resume a copy relationship |
| PATCH | `/api/copy-trading/copies/[id]/stop` | withAuth, withCsrf | Stop copying |

### Automation & Strategies (`/api/automation`, `/api/algorithmic`)

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| GET | `/api/automation/strategies` | withAuth | List user's strategies |
| POST | `/api/automation/strategies` | withAuth, withCsrf | Create strategy |
| PATCH | `/api/automation/strategies/toggle` | withAuth, withCsrf | Toggle strategy active/inactive |
| GET | `/api/automation/settings` | withAuth | Get automation settings |
| PUT | `/api/automation/settings` | withAuth, withCsrf | Update automation settings |
| GET | `/api/automation/market-conditions` | withAuth | Get current market conditions |
| GET | `/api/algorithmic/strategies` | withAuth | List algorithmic strategies |
| POST | `/api/algorithmic/backtesting` | withAuth | Run backtest |

### Marketplace (`/api/marketplace`)

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| GET | `/api/marketplace/strategies` | withOptionalAuth | Browse marketplace strategies |
| POST | `/api/marketplace/purchases` | withAuth, withCsrf | Purchase a strategy |
| GET | `/api/marketplace/my-purchases` | withAuth | User's purchased strategies |
| GET | `/api/marketplace/analytics` | withAuth | Marketplace analytics |

### Education (`/api/education`)

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| GET | `/api/education/courses` | withOptionalAuth | List courses |
| POST | `/api/education/courses` | withAdmin, withCsrf | Create course |
| GET | `/api/education/enrollments` | withAuth | User's enrollments |
| POST | `/api/education/enrollments` | withAuth, withCsrf | Enroll in course |

### Payments (`/api/payments`)

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| POST | `/api/payments/create-checkout` | withAuth, withCsrf | Create Stripe checkout session |
| GET | `/api/payments/portal` | withAuth | Create Stripe billing portal session |
| GET | `/api/payments/subscription` | withAuth | Get subscription status |
| POST | `/api/payments/webhook` | public (Stripe signature) | Handle Stripe webhook events |

### Plans (`/api/plans`)

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| POST | `/api/plans/subscribe` | withAuth, withCsrf | Subscribe to plan |

### Wallets (`/api/wallets`)

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| GET | `/api/wallets/summary` | withAuth | Wallet balances |
| GET | `/api/wallets/transactions` | withAuth | Transaction history |

### Market Data (`/api/market`)

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| GET | `/api/market/prices` | withAuth | Current market prices |

### Notifications (`/api/notifications`)

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| GET | `/api/notifications` | withAuth | List notifications |
| POST | `/api/notifications/email` | withAuth | Send email notification |

### Support (`/api/support`)

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| GET | `/api/support/tickets` | withAuth | List support tickets |
| POST | `/api/support/tickets` | withAuth, withCsrf | Create support ticket |

### Compliance (`/api/compliance`)

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| GET | `/api/compliance/status` | withAuth | KYC/compliance status |
| POST | `/api/compliance/documents` | withAuth, withCsrf | Upload KYC document |
| GET | `/api/compliance/documents` | withAuth | List KYC documents |
| POST | `/api/compliance/verify` | withAdmin, withCsrf | Verify/reject KYC document |
| GET | `/api/compliance/events` | withAuth | Compliance event log |
| GET | `/api/compliance/reports` | withAuth | Compliance reports |
| POST | `/api/compliance/reports` | withAuth, withCsrf | Generate compliance report |

### Affiliate (`/api/affiliate`)

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| GET | `/api/affiliate` | withAuth | Get affiliate info |
| GET | `/api/affiliate/stats` | withAuth | Affiliate performance stats |
| GET | `/api/affiliate/referrals` | withAuth | List referrals |
| POST | `/api/affiliate/track` | public | Track referral click |

### AI (`/api/ai`)

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| POST | `/api/ai/support-chat` | withAuth | AI support chatbot (OpenAI) |
| GET | `/api/ai/trade-recommendations` | withAuth | AI-powered trade recommendations |

### Analytics (`/api/analytics`)

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| GET | `/api/analytics/performance` | withAuth | Trading performance data |

### Admin (`/api/admin`)

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| GET | `/api/admin/system/health` | withAdmin | System health check |
| GET | `/api/admin/recent-activity` | withAdmin | Recent activity feed |
| GET | `/api/admin/analytics/revenue` | withAdmin | Revenue analytics |
| GET | `/api/admin/users/stats` | withAdmin | User statistics |
| POST | `/api/admin/clients/bulk-action` | withAdmin, withCsrf | Bulk user actions |
| GET | `/api/admin/feature-flags` | withAdmin | List feature flags |
| PATCH | `/api/admin/feature-flags` | withAdmin, withCsrf | Update feature flags |
| GET | `/api/admin/operations/alerts` | withAdmin | System alerts |
| POST | `/api/admin/strategies/approve` | withAdmin, withCsrf | Approve marketplace strategy |
| POST | `/api/admin/strategies/reject` | withAdmin, withCsrf | Reject marketplace strategy |

### Other

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| GET | `/api/tenants/list` | withAuth | List user's tenants |
| POST | `/api/tenants/switch` | withAuth, withCsrf | Switch active tenant |
| POST | `/api/upload` | withAuth, withCsrf | File upload |
| GET | `/api/files/[id]` | withAuth | Get uploaded file |
| GET | `/api/exports` | withAuth | List exports |
| POST | `/api/exports` | withAuth, withCsrf | Create export |
| GET | `/api/exports/[id]/download` | withAuth | Download export |
| GET | `/api/portfolio/get` | withAuth | Get portfolio data |
| GET | `/api/security/audit` | withAuth | Security audit log |
| POST | `/api/security/2fa` | withAuth, withCsrf | 2FA management |
| GET | `/api/strategies` | withAuth | List strategies |
| POST | `/api/social` | withAuth | Social features |
| GET | `/api/ws` | withAuth | WebSocket endpoint |
| POST | `/api/jobs` | withAuth | Job management |
| GET | `/api/mobile/auth` | withAuth | Mobile auth |
| GET | `/api/mobile/notifications` | withAuth | Mobile notifications |
| POST | `/api/mobile/trading` | withAuth | Mobile trading |
| POST | `/api/enterprise/white-label` | withAdmin, withCsrf | Enterprise white-label config |

---

## Feature Modules

### `features/trading/` — Live Trading
- Trade execution form with symbol selection, trade type (CALL/PUT), amount, duration
- Real-time price display via Deriv WebSocket
- Open trades list with live P&L
- Trade history with filtering
- Trading journal for notes

### `features/automation/` — Algorithmic Strategies
- Strategy types: trend-following, mean-reversion, volatility, momentum, arbitrage, custom
- Drag-and-drop strategy creator (dnd-kit)
- Strategy config as JSONB (indicators, parameters, risk settings)
- Backtesting engine with historical data
- Automation settings: max concurrent strategies, max daily loss, default risk level, auto-stop

### `features/copy-trading/` — Social Trading
- Trader discovery with stats (total return, monthly return, win rate, followers)
- Trading style tags: conservative, moderate, aggressive
- Copy relationships with amount allocation
- Real-time P&L tracking per copy
- Pause/resume/stop controls

### `features/marketplace/` — Strategy Marketplace
- Strategy listing with performance metrics
- Category filtering and search
- Purchase flow via Stripe
- Admin approval workflow
- Rating and review system

### `features/education/` — Course System
- Course catalog with categories, levels, prices
- Instructor assignment
- Enrollment and progress tracking
- Lesson completion tracking (JSONB array of completed lesson IDs)
- Course content as JSONB structure

### `features/wallet/` — Wallet System
- Multi-currency wallets
- Transaction types: deposit, withdrawal, transfer, trade_pnl, commission, refund, fee
- Transaction history with filtering
- Balance tracking

### `features/gamification/` — Gamification
- XP and leveling system (stored on profiles)
- Challenges with targets, XP rewards, time windows (weekly)
- Achievement system with unlock tracking
- Leaderboard: daily, weekly, monthly, all_time rankings

### `features/affiliate/` — Referral Program
- Unique referral codes
- Commission rates (default 10%)
- Referral tracking: pending, active, converted, expired
- Earnings accumulation

### `features/signals/` — Trading Signals
- Signal types: buy, sell, strong_buy, strong_sell, hold
- Confidence scoring, risk levels, entry prices, targets, stop losses
- Timeframe-based signals with expiration
- AI-generated signals via OpenAI

### `features/support/` — Support Tickets
- Ticket creation with priority (low/medium/high/urgent) and category
- Message threading with attachments (JSONB)
- Internal notes (is_internal flag)
- Status workflow: open → in_progress → waiting → resolved → closed
- Agent assignment

### `features/compliance/` — KYC & Compliance
- Document upload: identity, address, income, selfie, passport, drivers_license, utility_bill, bank_statement, tax_document
- Document review workflow: not_submitted → pending → under_review → verified/rejected
- KYC level calculation (0-3) based on verified documents
- Automated compliance event logging (triggers)
- Report generation: transaction, tax, audit_trail, kyc_summary, aml_report, activity_log

### `features/analytics/` — Platform Analytics
- Trading performance metrics
- Revenue analytics (admin)
- Market sentiment analysis
- User behavior analytics

### `features/admin/` — Admin Panel
- Dashboard with sub-groups: operations, finance, users, content, trading
- Revenue analytics with charts
- User management with bulk actions
- System health monitoring
- Feature flags (11 per-tenant flags)
- Strategy review/approval
- System alerts (info/warning/critical)
- Recent activity feed
- Audit log viewer

### `features/dashboard/` — Main Dashboard
- Parallel route slots: area_stats, bar_stats, pie_stats, sales
- Aggregate trading, financial, and platform metrics
- Quick actions and navigation

### `features/profile/` — User Profile
- Profile editing (name, avatar)
- Account settings
- Connection management (Deriv accounts)
- Notification preferences

### `features/settings/` — App Settings
- General settings
- Security settings (MFA, password change)
- Data exports management
- API key management

### `features/social/` — Social Features
- Social interactions (following, sharing)
- Activity feed

### `features/kanban/` — Kanban Board
- Task/board management interface

### `features/products/` — Product Catalog
- Product listing and detail pages

---

## Custom Hooks

| Hook | Purpose |
|------|---------|
| `use-deriv-balance.ts` | Polls Deriv account balance via API |
| `use-deriv-contracts.ts` | Tracks active Deriv contracts |
| `use-deriv-trade-execution.ts` | Handles trade execution flow |
| `use-strategy-config.ts` | Manages strategy configuration state |
| `use-symbols.ts` | Fetches and caches trading symbols |
| `use-data-table.ts` | Data table with sorting, filtering, pagination |
| `use-api-cache.ts` | TTL-based API response caching |
| `use-nav.ts` | Navigation state and RBAC filtering |
| `use-debounce.tsx` | Debounced value hook |
| `use-debounced-callback.ts` | Debounced callback hook |
| `use-media-query.ts` | Responsive breakpoint detection |
| `use-mobile.tsx` | Mobile viewport detection |
| `use-breadcrumbs.tsx` | Dynamic breadcrumb generation |
| `use-error-handling.ts` | Error boundary and handling |
| `use-callback-ref.tsx` | Stable callback reference |
| `use-controllable-state.tsx` | Controlled/uncontrolled state pattern |

---

## Database Schema

### Core Tables

**tenants** — Tenant/brand configuration
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| name | TEXT NOT NULL | |
| domain | TEXT UNIQUE | |
| logo_url | TEXT | |
| primary_color | TEXT | Default: #6366f1 |
| plan | TEXT | free/starter/pro/enterprise |
| created_at | TIMESTAMPTZ | |
| updated_at | TIMESTAMPTZ | Auto-updated via trigger |

**profiles** — User profiles (linked to Supabase Auth)
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | References auth.users(id) ON DELETE CASCADE |
| tenant_id | UUID FK | References tenants(id) |
| full_name | TEXT | |
| avatar_url | TEXT | |
| role | TEXT | user/admin/super_admin |
| level | INTEGER | Default: 1 |
| xp | INTEGER | Default: 0 |
| kyc_level | INTEGER | 0/1/2/3 |
| kyc_verified_at | TIMESTAMPTZ | |
| compliance_status | TEXT | pending/verified/suspended/blocked |
| created_at / updated_at | TIMESTAMPTZ | |

**tenant_memberships** — Multi-tenant membership
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| user_id | UUID FK | References auth.users(id) |
| tenant_id | UUID FK | References tenants(id) |
| role | TEXT | user/admin/super_admin |
| is_default | BOOLEAN | One per user is true |
| created_at / updated_at | TIMESTAMPTZ | |
| UNIQUE | (user_id, tenant_id) | |

### Auth & Security Tables

**deriv_tokens** — Deriv API tokens
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| user_id | UUID FK | |
| tenant_id | UUID FK | |
| token | TEXT | Plaintext (should be encrypted) |
| token_encrypted | BYTEA | PGP encrypted |
| token_hash | TEXT | SHA256 hash |
| label | TEXT | |
| scopes | TEXT[] | |
| is_primary | BOOLEAN | |
| deleted_at | TIMESTAMPTZ | Soft delete |

**user_sessions** — Active session tracking
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| user_id | UUID FK | |
| tenant_id | UUID FK | |
| device, browser, os | TEXT | |
| ip_address | INET | |
| location | TEXT | |
| last_active | TIMESTAMPTZ | |
| expires_at | TIMESTAMPTZ | Default: 30 days |
| is_current | BOOLEAN | |

**api_keys** — API key management
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| user_id | UUID FK | |
| tenant_id | UUID FK | |
| key_hash | TEXT | |
| label | TEXT | |
| permissions | TEXT[] | |
| last_used | TIMESTAMPTZ | |
| expires_at | TIMESTAMPTZ | |
| revoked_at | TIMESTAMPTZ | |
| is_active | BOOLEAN | |

### Billing Tables

**feature_flags** — Per-tenant feature toggles
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| tenant_id | UUID FK | |
| flag_key | TEXT | TRADING, AUTOMATION, COPY_TRADING, SIGNALS, EDUCATION, MARKETPLACE, GAMIFICATION, WALLETS, AI_ASSISTANT, AFFILIATE, ANALYTICS |
| enabled | BOOLEAN | |
| description | TEXT | |
| metadata | JSONB | |
| UNIQUE | (tenant_id, flag_key) | |

**subscription_plans** — Per-tenant subscription plans
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| tenant_id | UUID FK | |
| name, description | TEXT | |
| price | NUMERIC(10,2) | |
| currency | TEXT | USD |
| interval | TEXT | month/year |
| features | JSONB | |
| stripe_price_id | TEXT | |
| is_active | BOOLEAN | |
| sort_order | INTEGER | |

**user_subscriptions** — User subscription state
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| user_id | UUID FK | |
| tenant_id | UUID FK | |
| plan_id | UUID FK | |
| status | TEXT | active/cancelled/past_due/trialing/incomplete |
| stripe_subscription_id | TEXT | |
| current_period_start/end | TIMESTAMPTZ | |
| cancel_at_period_end | BOOLEAN | |

### Wallet & Transaction Tables

**wallets** — Multi-currency wallets
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| user_id | UUID FK | |
| tenant_id | UUID FK | |
| currency | TEXT | Default: USD |
| balance | NUMERIC(18,2) | |
| is_primary | BOOLEAN | |

**wallet_transactions** — Transaction ledger
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| wallet_id | UUID FK | |
| tenant_id | UUID FK | |
| type | TEXT | deposit/withdrawal/transfer/trade_pnl/commission/refund/fee |
| amount | NUMERIC(18,2) | |
| balance_after | NUMERIC(18,2) | |
| description | TEXT | |
| reference_id | UUID | |
| status | TEXT | pending/completed/failed/cancelled |

### Trading Tables

**trades** — Executed trades
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| tenant_id, user_id | UUID FK | |
| bot_id | UUID FK | Nullable — linked to bot if automated |
| symbol | TEXT | |
| contract_type | TEXT | buy/sell |
| stake | NUMERIC(18,2) | |
| entry_price, current_price, exit_price | NUMERIC(18,6) | |
| profit_loss | NUMERIC(18,2) | |
| status | TEXT | open/closed/won/lost/cancelled/error |
| metadata | JSONB | |
| created_at, closed_at | TIMESTAMPTZ | |

**trading_orders** — Pending orders
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| tenant_id, user_id | UUID FK | |
| symbol | TEXT | |
| order_type | TEXT | market/limit/stop |
| side | TEXT | buy/sell |
| price | NUMERIC(18,6) | |
| quantity | NUMERIC(18,6) | |
| status | TEXT | pending/filled/cancelled/rejected |
| created_at, filled_at | TIMESTAMPTZ | |

**trading_signals** — Trading signals
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| tenant_id | UUID FK | |
| symbol | TEXT | |
| signal_type | TEXT | buy/sell/strong_buy/strong_sell/hold |
| confidence | NUMERIC(5,2) | |
| risk_level | TEXT | low/medium/high |
| entry_price, targets, stop_loss | NUMERIC | |
| analysis | TEXT | |
| timeframe | TEXT | Default: 1h |
| expires_at | TIMESTAMPTZ | |

**market_prices** — Cached market prices
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| tenant_id, symbol | UUID, TEXT | UNIQUE(tenant_id, symbol) |
| price | NUMERIC(18,6) | |
| change_percent | NUMERIC(10,4) | |

### Automation Tables

**automation_strategies** — User-created strategies
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| tenant_id, user_id | UUID FK | |
| name, description | TEXT | |
| config | JSONB | Strategy parameters |
| is_active | BOOLEAN | |
| performance | JSONB | |
| total_trades | INTEGER | |
| win_rate | NUMERIC(5,2) | |
| total_pnl | NUMERIC(18,2) | |

**automation_settings** — Per-user automation config
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| tenant_id, user_id | UUID FK | |
| max_concurrent_strategies | INTEGER | Default: 5 |
| max_daily_loss | NUMERIC | Default: 100 |
| default_risk_level | TEXT | Low/Medium/High |
| notifications_enabled | BOOLEAN | |
| auto_stop_on_loss | BOOLEAN | |
| UNIQUE | (user_id) | |

**bots** — Automated trading bots
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| tenant_id, user_id | UUID FK | |
| name | TEXT | |
| status | TEXT | draft/active/paused/stopped/error |
| error_message | TEXT | |
| total_trades | INTEGER | |
| win_rate | NUMERIC(5,2) | |
| metadata | JSONB | |

**bot_sessions** — Bot execution sessions
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| tenant_id, bot_id, user_id | UUID FK | |
| status | TEXT | running/completed/stopped/error |
| started_at, ended_at | TIMESTAMPTZ | |

**algorithmic_strategies** — Algorithmic strategy definitions
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| tenant_id, user_id | UUID FK | |
| name | TEXT | |
| type | TEXT | trend-following/mean-reversion/volatility/momentum/arbitrage/custom |
| status | TEXT | draft/active/paused/archived |
| config | JSONB | |
| profit, trades, win_rate | NUMERIC/INTEGER | |

### Copy Trading Tables

**copy_trading_traders** — Traders available for copying
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| tenant_id | UUID FK | |
| user_id | UUID FK | Nullable |
| name, avatar, bio | TEXT | |
| total_return, monthly_return, win_rate | NUMERIC(5,2) | |
| followers, copiers | INTEGER | |
| style | TEXT | conservative/moderate/aggressive |
| verified | BOOLEAN | |

**copy_trading_copies** — Active copy relationships
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| user_id, tenant_id, trader_id | UUID FK | |
| amount | NUMERIC(18,2) | |
| status | TEXT | active/paused/stopped |
| pnl | NUMERIC(18,2) | |

### Marketplace Tables

**marketplace_strategies** — Strategies for sale
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| tenant_id | UUID FK | |
| seller_id | UUID FK | |
| name, description | TEXT | |
| price | NUMERIC(10,2) | |
| performance | JSONB | |
| reviews_count | INTEGER | |
| rating | NUMERIC(3,2) | |
| category | TEXT | |
| is_approved | BOOLEAN | |

**marketplace_purchases** — Purchase records
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| user_id, tenant_id, strategy_id | UUID FK | |
| price_paid | NUMERIC(10,2) | |

### Education Tables

**courses** — Course catalog
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| tenant_id | UUID FK | |
| title, description | TEXT | |
| instructor_id | UUID FK | |
| category, level | TEXT | beginner/intermediate/advanced |
| price | NUMERIC(10,2) | |
| thumbnail | TEXT | |
| content | JSONB | Course structure |
| is_published | BOOLEAN | |

**course_enrollments** — Enrollment records
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| user_id, tenant_id, course_id | UUID FK | |
| progress | NUMERIC(5,2) | 0-100 |
| completed_lessons | JSONB | Array of lesson IDs |
| completed_at | TIMESTAMPTZ | |

### Gamification Tables

**gamification_challenges** — Challenges
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| tenant_id | UUID FK | |
| title, description | TEXT | |
| type | TEXT | Default: weekly |
| target | INTEGER | |
| xp_reward | INTEGER | |
| start_date, end_date | TIMESTAMPTZ | |
| is_active | BOOLEAN | |

**gamification_achievements** — User achievements
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| user_id, tenant_id | UUID FK | |
| type, title, description | TEXT | |
| icon | TEXT | |
| xp | INTEGER | |
| unlocked_at | TIMESTAMPTZ | |

**challenge_progress** — Per-user challenge progress
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| user_id, tenant_id, challenge_id | UUID FK | |
| current_progress | INTEGER | |
| completed | BOOLEAN | |
| completed_at | TIMESTAMPTZ | |

**leaderboard** — Rankings
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| user_id, tenant_id | UUID FK | |
| xp, level, rank | INTEGER | |
| win_rate | NUMERIC(5,2) | |
| total_trades | INTEGER | |
| period | TEXT | daily/weekly/monthly/all_time |

### Compliance Tables

**kyc_documents** — KYC document uploads
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| user_id, tenant_id | UUID FK | |
| document_type | TEXT | identity/address/income/selfie/passport/drivers_license/utility_bill/bank_statement/tax_document |
| document_name, file_path | TEXT | |
| file_size, mime_type | INTEGER, TEXT | |
| status | TEXT | not_submitted/pending/under_review/verified/rejected/expired |
| rejection_reason | TEXT | |
| submitted_at, reviewed_at | TIMESTAMPTZ | |
| reviewed_by | UUID FK | |
| expires_at | TIMESTAMPTZ | |
| metadata | JSONB | |

**compliance_events** — Audit log
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| user_id, tenant_id | UUID FK | |
| event_type | TEXT | 15 event types |
| description | TEXT | |
| status | TEXT | pending/completed/failed/in_progress |
| metadata | JSONB | |
| ip_address | INET | |
| user_agent | TEXT | |

**compliance_reports** — Generated reports
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| user_id, tenant_id | UUID FK | |
| report_type | TEXT | transaction_report/tax_report/audit_trail/kyc_summary/aml_report/activity_log |
| title, description | TEXT | |
| status | TEXT | processing/ready/failed/expired |
| file_path, file_size | TEXT, INTEGER | |
| generated_at, expires_at | TIMESTAMPTZ | |
| generated_by | UUID FK | |
| period_start, period_end | TIMESTAMPTZ | |
| metadata | JSONB | |

### Support & Communication Tables

**support_tickets** — Support tickets
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| user_id, tenant_id | UUID FK | |
| subject, description | TEXT | |
| status | TEXT | open/in_progress/waiting/resolved/closed |
| priority | TEXT | low/medium/high/urgent |
| category | TEXT | |
| assigned_to | UUID FK | |

**support_messages** — Ticket messages
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| ticket_id, tenant_id, sender_id | UUID FK | |
| message | TEXT | |
| attachments | JSONB | |
| is_internal | BOOLEAN | |

**notifications** — User notifications
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| user_id, tenant_id | UUID FK | |
| type | TEXT | info/success/warning/error/trade/system |
| title, message | TEXT | |
| read | BOOLEAN | |
| action_url | TEXT | |

**ai_conversations** — AI chat history
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| tenant_id, user_id | UUID FK | |
| title | TEXT | |
| messages | JSONB | Array of {role, content} |
| status | TEXT | active/archived |

### Affiliate Tables

**affiliates** — Affiliate accounts
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| user_id, tenant_id | UUID FK | |
| referral_code | TEXT UNIQUE | |
| commission_rate | NUMERIC(5,2) | Default: 10% |
| total_earnings | NUMERIC(18,2) | |
| total_referrals | INTEGER | |
| status | TEXT | active/suspended/inactive |

**referrals** — Referral records
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| affiliate_id, tenant_id, referred_user_id | UUID FK | |
| status | TEXT | pending/active/converted/expired |
| commission_earned | NUMERIC(18,2) | |

### System Tables

**system_alerts** — System alerts
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| tenant_id | UUID FK | |
| severity | TEXT | info/warning/critical |
| title, message | TEXT | |
| source | TEXT | Default: system |
| metadata | JSONB | |
| resolved_at | TIMESTAMPTZ | |

**activity_logs** — General activity log
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| tenant_id | UUID FK | |
| user_id | UUID FK | |
| action | TEXT | |
| entity_type, entity_id | TEXT | |
| metadata | JSONB | |

---

## Deriv WebSocket Integration

### Client Architecture
- Custom WebSocket client in `packages/deriv-api/`
- Connects to `wss://ws.derivws.com/websockets/v3`
- Request/response correlation via `req_id`
- Auto-reconnection with exponential backoff
- Keep-alive ping mechanism
- Subscription management for real-time price updates

### React Hooks

**`useDerivConnection()`** — WebSocket connection lifecycle
- Manages connection state (connecting, connected, disconnected, error)
- Auto-connects when user has a valid token
- Cleanup on unmount

**`useDerivBalance()`** — Account balance polling
- Periodic balance requests via WebSocket
- Returns current balance in user's account currency

**`useDerivContracts()`** — Active contract tracking
- Subscribes to contract updates
- Tracks open positions in real-time

**`useDerivPrices(symbols)`** — Real-time price subscriptions
- Subscribes to tick streams for specified symbols
- Returns current prices with change percentages
- Handles subscription/unsubscription lifecycle

### Token Management
- Tokens stored in `deriv_tokens` table with hash + encrypted versions
- Primary token selection for WebSocket connections
- Token CRUD API endpoints
- Auto-authentication flow on login

---

## Stripe Billing Integration

### Architecture
- Server-side Stripe client via `STRIPE_SECRET_KEY`
- Checkout sessions for new subscriptions
- Customer portal for plan management
- Webhook handler for event processing

### Key Functions
- `createCheckoutSession()` — creates Stripe Checkout with plan metadata
- `createPortalSession()` — creates billing portal for subscription management
- `getSubscriptionStatus()` — retrieves subscription details
- `retrievePaymentIntent()` — gets payment intent details
- `verifyPaymentIntentStatus()` — validates payment completion

### Webhook Events Handled
- `checkout.session.completed` — new subscription activation
- `customer.subscription.updated` — plan changes
- `customer.subscription.deleted` — cancellations
- `invoice.paid` / `invoice.payment_failed` — billing events

### Subscription Plans (default)
| Plan | Price | Features |
|------|-------|----------|
| Free | $0 | Basic trading, limited strategies |
| Starter | $29/mo | Full trading, 5 strategies, copy trading |
| Pro | $99/mo | Everything + AI assistant, advanced analytics |
| Enterprise | $299/mo | Everything + white-label, API access, priority support |

---

## Security Architecture

### Middleware Pipeline (runs on every request)
1. **Auth validation** — check Supabase session, return 401/403 for unauthenticated requests
2. **Rate limiting** — apply per-route rate limits
3. **Security headers** — CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy
4. **Tenant resolution** — extract tenant context from session

### Content Security Policy
```
default-src 'self'
script-src 'self' 'nonce-{nonce}' (prod) or 'unsafe-inline' (dev)
style-src 'self' 'nonce-{nonce}' (prod) or 'unsafe-inline' (dev)
img-src 'self' data: blob: https://*.supabase.co
connect-src 'self' https://*.supabase.co wss://ws.derivws.com
frame-ancestors 'none'
```

### CSRF Protection
- `withCsrf()` HOF on all mutating endpoints
- Token-based validation (not cookie-based)
- Exempt routes: webhooks, auth callbacks

### RLS (Row Level Security)
- Every table has `tenant_id` column with RLS enabled
- Policies use `get_current_tenant_id()` and `is_tenant_admin()` RPCs
- Server client uses JWT for RLS context
- Admin operations use `createAdminClient()` (bypasses RLS)

### Token Encryption
- Deriv tokens encrypted at rest with PGP symmetric encryption
- Hash-based lookup for token matching
- Encryption key stored in app secrets

---

## Rate Limiting

| Limiter | Limit | Scope |
|---------|-------|-------|
| `authLimiter` | 10 req/min | Auth endpoints |
| `tradingLimiter` | 60 req/min | Trade execution |
| `adminLimiter` | 100 req/min | Admin endpoints |
| `defaultLimiter` | 200 req/min | General endpoints |
| `strictLimiter` | 5 req/hour | Sensitive operations |
| `apiKeyLimiter` | 1000 req/hour | API key endpoints |
| `webhookLimiter` | 300 req/min | Webhook endpoints |

Implementation: In-memory store with max 100,000 entries, cleanup every 60 seconds.

---

## Middleware Pipeline

`apps/core/src/middleware.ts` processes every request:

1. Skip for static assets, `_next`, and public routes
2. Validate Supabase session cookie
3. For authenticated users: set auth headers for server components
4. For unauthenticated users on protected routes: return 401 JSON (not redirect for API/RSC)
5. Apply security headers (CSP, X-Frame-Options, etc.)
6. Apply rate limiting
7. Skip auth for RSC internal requests (`_rsc` param)

---

## Shared Packages

### `@deriv-opus/shared-supabase`
- `createBrowserClient()` — client-side Supabase client
- `createServerClient()` — server-side async client (uses Next.js cookies)
- `createAdminClient()` — service role client (bypasses RLS)

### `@deriv-opus/shared-auth`
- `signIn(email, password)` — email/password login
- `signUp(email, password, metadata)` — registration
- `signOut()` — session termination
- `getSession()` — get current session
- `getUser()` — get current user with profile data
- `withAuth()` — server component auth guard
- `withAdmin()` — server component admin guard

### `@deriv-opus/shared-config`
- Navigation config (user + admin nav items)
- Feature flag definitions and helpers
- Tenant configuration
- Stripe client and helpers

### `@deriv-opus/shared-types`
- `AppUser`, `UserRole`, `TenantConfig`, `TenantMembership`
- `NavItem`, `SessionData`
- Generated Supabase database types

### `@deriv-opus/shared-ui`
- `formatCurrency(value, currency)` — currency formatting
- `formatPercent(value, digits)` — percentage formatting

---

## UI Component Library

### shadcn/ui Primitives (47+)
Located in `src/components/ui/`. **Do not modify directly** — extend via composition.

Key primitives: Button, Input, Label, Select, Dialog, Sheet, DropdownMenu, Command, Popover, Calendar, Card, Table, Tabs, Badge, Avatar, Separator, Skeleton, Toast, Form, Switch, Checkbox, RadioGroup, ScrollArea, Tooltip, Chart, Sidebar, Accordion, Alert, AlertDialog, Breadcrumb, Collapsible, HoverCard, Menubar, NavigationMenu, Pagination, Progress, Resizable, Sonner, Toggle, ToggleGroup.

### Layout Components
- `AppSidebar` — collapsible sidebar with nav items, RBAC filtering, tenant switcher
- `Header` — top bar with user menu, notifications, search
- `InfoSidebar` — secondary info panel
- `PageContainer` — consistent page wrapper with title, description, loading, access control

### Form Components (10 wrappers)
Pre-built form fields in `components/forms/`: InputField, SelectField, TextAreaField, DatePickerField, SwitchField, CheckboxField, RadioGroupField, MultiSelectField, PasswordField, FileUploadField.

---

## Theme System

Six built-in themes:
- **claude** — default (purple accent)
- **neobrutalism** — bold borders, high contrast
- **supabase** — green accent
- **vercel** — black/white minimal
- **mono** — monochrome
- **notebook** — warm paper-like

Implementation:
- CSS custom properties via `[data-theme]` attribute
- Custom dark variant: `@custom-variant dark (&:is(.dark *))`
- Tailwind v4 with `@import 'tailwindcss'` syntax
- Theme switching via `AppSidebar` or settings

---

## Feature Flags

11 per-tenant flags controlled via `feature_flags` table:

| Flag | Default | Purpose |
|------|---------|---------|
| TRADING | true | Enable trading features |
| AUTOMATION | true | Enable strategy automation |
| COPY_TRADING | true | Enable copy trading |
| SIGNALS | true | Enable trading signals |
| EDUCATION | true | Enable education/courses |
| MARKETPLACE | true | Enable strategy marketplace |
| GAMIFICATION | true | Enable gamification |
| WALLETS | true | Enable wallet features |
| AI_ASSISTANT | true | Enable AI chatbot |
| AFFILIATE | true | Enable affiliate program |
| ANALYTICS | true | Enable analytics |

---

## Testing Setup

**Stack:** Vitest 4.1 + @testing-library/react 16.3 + @testing-library/jest-dom 6.9 + @faker-js/faker 9.3 + jsdom 29

**Config:** `apps/core/vitest.config.ts` — jsdom env, `@` alias, `@vitejs/plugin-react`, v8 coverage.

**Existing Tests (5 files):**
- `src/lib/security/rate-limit.test.ts` — Rate limiter (3 tests)
- `src/lib/security/csrf.test.ts` — CSRF protection (4 tests)
- `src/lib/env.test.ts` — Environment validation (5 tests)
- `src/lib/utils.test.ts` — Utility functions (15 tests)
- `src/components/ui/chart.test.ts` — Chart sanitize function (8 tests)

**Run:**
```bash
pnpm --filter @deriv-opus/core test
pnpm --filter @deriv-opus/core test:coverage
```

---

## Key Patterns

### API Route Pattern
```typescript
export async function POST(request: NextRequest) {
  return withAuth(async (request, { userId, supabase, role }) => {
    const result = schema.safeParse(await request.json());
    if (!result.success) return createValidationResponse(result.error.flatten().fieldErrors);
    try {
      // Business logic
      return NextResponse.json({ success: true, data });
    } catch (error) {
      logCatchError('Description', error, { route: '/api/path' });
      return createErrorResponse('Internal server error', 500);
    }
  });
}
```

### Page Pattern
```typescript
// Server Component (default)
import { withAuth } from '@deriv-opus/shared-auth';
export default async function Page() {
  const user = await withAuth();
  return <ClientContent userId={user.id} />;
}

// Client Component
'use client';
export function ClientContent({ userId }: { userId: string }) {
  // Hooks, state, effects
}
```

### Database Query Pattern
```typescript
// Always use maybeSingle() for optional results
const { data } = await supabase
  .from('table')
  .select('columns')
  .eq('tenant_id', tenantId)
  .maybeSingle();

// Use .single() only when row must exist
```

### Error Handling Pattern
```typescript
// API routes
catch (error) {
  logCatchError('Description', error, { route: '/api/path' });
  return createErrorResponse('Message', 500);
}

// Validation errors
if (!result.success) {
  return NextResponse.json(
    { error: 'Validation error', details: result.error.flatten().fieldErrors },
    { status: 400 }
  );
}
```