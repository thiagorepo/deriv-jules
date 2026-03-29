# PRD: Deriv Jules Multi-Tenant Trading Platform

> **Spec ID:** PRD-001
> **Version:** 1.0.0
> **Status:** DRAFT
> **Last Updated:** 2026-03-28

---

## 1. Executive Summary

Deriv Jules is a multi-tenant trading platform built on NX monorepo architecture, designed to serve multiple brands/tenants from a single codebase. The platform integrates with the Deriv WebSocket API for trading operations and uses Supabase for authentication, data storage, and real-time features.

### Key Differentiators
- **80/20 Architecture:** 80% shared code, 20% tenant-specific customization
- **Multi-Tenant Theming:** Dynamic CSS variables for brand customization
- **Real-Time Trading:** WebSocket integration with Deriv API
- **Role-Based Access:** Admin and user roles with RLS enforcement

---

## 2. Problem Statement

### Current State
- Multiple trading platforms require similar functionality
- Code duplication across projects increases maintenance burden
- Brand customization requires extensive forking
- No unified authentication or data layer

### Proposed Solution
A single multi-tenant codebase with:
- Shared core trading functionality
- Tenant-specific configuration and theming
- Centralized authentication and authorization
- Unified data access patterns

---

## 3. Product Goals

### Primary Goals
1. **Reduce Development Time** - New tenants deploy in hours, not weeks
2. **Maintain Code Quality** - Single codebase = consistent quality
3. **Enable Brand Customization** - Dynamic theming without code changes
4. **Ensure Security** - RLS and RBAC at database level

### Success Metrics
| Metric | Target | Measurement |
|--------|--------|-------------|
| Tenant Onboarding | < 4 hours | Time from config to deployment |
| Code Reuse | > 80% | Shared vs tenant-specific code ratio |
| Build Time | < 5 minutes | Full monorepo build |
| Test Coverage | > 80% | Unit + integration tests |
| E2E Reliability | 100% | Critical user flows |

---

## 4. User Personas

### 4.1 End User (Trader)
- **Role:** Individual trading account holder
- **Goals:** View markets, place trades, manage portfolio
- **Pain Points:** Complex interfaces, slow loading, unclear data
- **Flows:** Login → Dashboard → Trade → History

### 4.2 Administrator
- **Role:** Platform operator/manager
- **Goals:** Manage users, configure products, view analytics
- **Pain Points:** Limited visibility, manual processes
- **Flows:** Login → Admin Dashboard → Users/Products/Plans → Reports

### 4.3 Developer
- **Role:** Internal development team
- **Goals:** Add features, fix bugs, deploy updates
- **Pain Points:** Understanding multi-tenant architecture
- **Flows:** Code → Test → Build → Deploy

---

## 5. Functional Requirements

### 5.1 Authentication & Authorization

#### FR-AUTH-001: User Registration
- **As a** new user
- **I want to** create an account
- **So that** I can access the platform

**Acceptance Criteria:**
- Email/password registration
- Email verification required
- Default role: `user`
- Profile auto-created via trigger

#### FR-AUTH-002: User Login
- **As a** registered user
- **I want to** log in
- **So that** I can access my account

**Acceptance Criteria:**
- Email/password authentication
- Supabase Auth integration
- Session persistence
- Redirect to dashboard on success

#### FR-AUTH-003: Role-Based Access
- **As an** admin
- **I want to** access admin-only pages
- **So that** I can manage the platform

**Acceptance Criteria:**
- `app_role` enum: `admin`, `user`
- Database-level RLS enforcement
- Middleware route protection
- UI element visibility based on role

### 5.2 User Dashboard

#### FR-DASH-001: Dashboard Overview
- **As a** user
- **I want to** see my account summary
- **So that** I understand my current state

**Acceptance Criteria:**
- Account balance display
- Recent trades list
- Active positions summary
- Quick action buttons

#### FR-DASH-002: Market View
- **As a** user
- **I want to** see available markets
- **So that** I can choose what to trade

**Acceptance Criteria:**
- Market categories
- Real-time price updates
- Market status (open/closed)
- Search/filter functionality

### 5.3 Trading Operations

#### FR-TRADE-001: Place Trade
- **As a** user
- **I want to** open a trade position
- **So that** I can profit from market movements

**Acceptance Criteria:**
- Market selection
- Stake amount input
- Contract type selection
- Real-time P&L preview
- Confirmation dialog

#### FR-TRADE-002: View Positions
- **As a** user
- **I want to** see my open positions
- **So that** I can track my trades

**Acceptance Criteria:**
- List of open positions
- Real-time P&L updates
- Position details expansion
- Close position action

#### FR-TRADE-003: Trade History
- **As a** user
- **I want to** view my past trades
- **So that** I can analyze my performance

**Acceptance Criteria:**
- Paginated history list
- Filter by date/market/result
- Export functionality
- Summary statistics

### 5.4 Admin Functions

#### FR-ADMIN-001: User Management
- **As an** admin
- **I want to** manage user accounts
- **So that** I can control platform access

**Acceptance Criteria:**
- User list with search
- Role assignment
- Account status toggle
- User detail view

#### FR-ADMIN-002: Product Management
- **As an** admin
- **I want to** configure trading products
- **So that** users can trade them

**Acceptance Criteria:**
- Product CRUD operations
- Product categorization
- Status management (active/inactive)
- Pricing configuration

#### FR-ADMIN-003: Plan Management
- **As an** admin
- **I want to** define subscription plans
- **So that** users can upgrade their access

**Acceptance Criteria:**
- Plan CRUD operations
- Feature mapping per plan
- Pricing tiers
- Plan comparison view

---

## 6. Non-Functional Requirements

### 6.1 Performance

| Requirement | Target | Measurement |
|-------------|--------|-------------|
| Page Load | < 2s | Lighthouse audit |
| Time to Interactive | < 3s | Lighthouse audit |
| API Response | < 200ms | P95 latency |
| WebSocket Latency | < 100ms | Round-trip time |
| Build Time | < 5min | Full monorepo build |

### 6.2 Security

| Requirement | Implementation |
|-------------|----------------|
| Authentication | Supabase Auth with JWT |
| Authorization | RLS + RBAC at database |
| Data Encryption | TLS 1.3 in transit |
| Secret Management | Environment variables |
| Input Validation | Zod schemas |
| SQL Injection | Parameterized queries |

### 6.3 Reliability

| Requirement | Target |
|-------------|--------|
| Uptime | 99.9% |
| Error Rate | < 0.1% |
| Recovery Time | < 5 minutes |
| Data Backup | Daily |

### 6.4 Scalability

| Requirement | Target |
|-------------|--------|
| Concurrent Users | 10,000 |
| Requests/Second | 1,000 |
| Database Connections | 100 per instance |
| WebSocket Connections | 10,000 |

---

## 7. Technical Constraints

### 7.1 Must Use
- NX monorepo (existing)
- Next.js 16 with App Router
- React 19
- Tailwind CSS v4
- Supabase (PostgreSQL + Auth + Realtime)
- Deriv WebSocket API

### 7.2 Must Preserve
- 80/20 shared library architecture
- Multi-tenant middleware pattern
- Existing route exports from `@org/core-routes`
- RBAC schema with `app_role` enum
- Tailwind v4 theming system

### 7.3 Must Add
- Real authentication (replace mock)
- Database connections (wire Supabase client)
- Deriv API integration (connect WebSocket)
- State management (Zustand recommended)
- Testing suite (unit, integration, E2E)

---

## 8. Out of Scope

### Phase 1 (Current)
- Mobile applications
- Native desktop clients
- Payment processing
- Social trading features
- Copy trading
- Signal services

### Future Phases
- Advanced charting
- Algorithmic trading
- Multi-language support
- White-label customization

---

## 9. Dependencies

### External APIs
| API | Purpose | Status |
|-----|---------|--------|
| Deriv WebSocket | Trading operations | Client scaffolded |
| Supabase | Auth + Database | Schema defined |

### Internal Libraries
| Library | Purpose | Status |
|---------|---------|--------|
| @org/core-routes | Routing | ✅ Complete |
| @org/ui | UI components | ✅ Complete |
| @org/theme | Theming | ✅ Complete |
| @org/deriv-api | API client | 🔶 Scaffolded |
| @org/supabase | DB client | 🔶 Scaffolded |
| @org/shared-auth | Auth logic | 🔶 Scaffolded |

---

## 10. Milestones

### M1: Foundation (Current)
- [ ] Real authentication
- [ ] Database connections
- [ ] Basic trading view

### M2: Core Trading
- [ ] Place trades
- [ ] View positions
- [ ] Trade history

### M3: Admin Features
- [ ] User management
- [ ] Product management
- [ ] Plan management

### M4: Polish
- [ ] Error handling
- [ ] Loading states
- [ ] Testing suite

### M5: Production
- [ ] Performance optimization
- [ ] Security audit
- [ ] Documentation

---

## 11. Approval

| Role | Name | Date | Status |
|------|------|------|--------|
| Product Owner | - | - | PENDING |
| Tech Lead | - | - | PENDING |
| Stakeholder | - | - | PENDING |

---

*End of PRD*
