# Confirmed Assumptions Analysis

> **Project:** Deriv Jules NX Monorepo
> **Phase:** 0E - Pre-Spec Validation
> **Date:** 2026-03-28

---

## 1. Architecture Assumptions

| Assumption | Status | Evidence | Gap |
|------------|--------|----------|-----|
| NX monorepo structure | ✅ CONFIRMED | `nx.json`, `workspace.json` patterns | None |
| 5 tenant applications | ✅ CONFIRMED | `apps/tenant-app*` directories | None |
| 7 shared libraries | ✅ CONFIRMED | `libs/shared/*` directories | None |
| 80/20 code split | ✅ CONFIRMED | Shared libs provide core functionality | None |
| Next.js 16 App Router | ✅ CONFIRMED | `app/` directories in tenant apps | None |
| React 19 | ✅ CONFIRMED | `package.json` deps | None |
| Tailwind v4 | ✅ CONFIRMED | `tailwind.config.mjs`, CSS vars | None |
| Server Components | ✅ CONFIRMED | `.tsx` files without 'use client' | None |

---

## 2. Database Assumptions

| Assumption | Status | Evidence | Gap |
|------------|--------|----------|-----|
| Supabase as backend | 🔶 PARTIAL | Migration files exist | Client not wired |
| PostgreSQL database | ✅ CONFIRMED | Migration SQL syntax | None |
| RLS policies | ✅ CONFIRMED | `00001_create_rbac_schema.sql` | None |
| 42 tables (from spec) | ❌ NOT FOUND | Only 8 tables in migrations | 34 tables aspirational |
| Real data connections | ❌ MISSING | No Supabase client usage | Full gap |

### Database Reality Check

**Existing Tables (8):**
- `app_role` (enum)
- `user_roles`
- `profiles`
- Plus 5 implied by spec but not in migration

**Aspirational Tables (42):**
- `docs/specifications.md` defines full schema
- Not implemented in migrations

---

## 3. Authentication Assumptions

| Assumption | Status | Evidence | Gap |
|------------|--------|----------|-----|
| Supabase Auth | 🔶 PARTIAL | `@org/shared-auth` exists | Not implemented |
| Mock auth | ✅ CONFIRMED | No real auth flow | Needs replacement |
| RBAC roles | ✅ CONFIRMED | `app_role` enum (admin, user) | None |
| Protected routes | 🔶 PARTIAL | Middleware exists | Not enforcing auth |

---

## 4. API Integration Assumptions

| Assumption | Status | Evidence | Gap |
|------------|--------|----------|-----|
| Deriv WebSocket API | 🔶 PARTIAL | `@org/deriv-api` client exists | Not integrated |
| Singleton pattern | ✅ CONFIRMED | `DerivAPI.getInstance()` | None |
| Auto-reconnection | ✅ CONFIRMED | Client code has reconnect logic | None |
| Real API calls | ❌ MISSING | Client not used in pages | Full gap |

---

## 5. UI Component Assumptions

| Assumption | Status | Evidence | Gap |
|------------|--------|----------|-----|
| Shared UI library | ✅ CONFIRMED | `@org/ui` exports | None |
| shadcn-style components | ✅ CONFIRMED | Component patterns | None |
| Multi-tenant theming | ✅ CONFIRMED | CSS variables, `@org/theme` | None |
| Icon library | ✅ CONFIRMED | `@org/ui/icons` | None |
| Form components | ✅ CONFIRMED | `auth-forms/` directory | None |
| Dashboard layouts | ✅ CONFIRMED | `dashboards/`, `dashboard-layout/` | None |

---

## 6. Routing Assumptions

| Assumption | Status | Evidence | Gap |
|------------|--------|----------|-----|
| Central routing | ✅ CONFIRMED | `@org/core-routes` | None |
| Tenant middleware | ✅ CONFIRMED | `middleware.js` in apps | None |
| Admin routes | ✅ CONFIRMED | `AdminPage`, `AdminUsersPage`, etc. | None |
| User routes | ✅ CONFIRMED | `UserPage`, `UserPlansPage`, etc. | None |
| Dynamic routes | 🔶 PARTIAL | Structure exists | May need expansion |

---

## 7. State Management Assumptions

| Assumption | Status | Evidence | Gap |
|------------|--------|----------|-----|
| Global state | ❌ MISSING | No Zustand/Redux/etc. | Full gap |
| Server state | ❌ MISSING | No React Query/SWR | Full gap |
| Form state | 🔶 PARTIAL | Form components exist | May need react-hook-form |
| URL state | 🔶 PARTIAL | Next.js provides | None |

---

## 8. Testing Assumptions

| Assumption | Status | Evidence | Gap |
|------------|--------|----------|-----|
| E2E framework | ✅ CONFIRMED | Playwright configured | None |
| E2E tests | ❌ MISSING | `e2e/` directory empty | Full gap |
| Unit tests | ❌ MISSING | Jest configured, no tests | Full gap |
| Integration tests | ❌ MISSING | Not configured | Full gap |
| Component tests | ❌ MISSING | Not configured | Full gap |

---

## 9. Error Handling Assumptions

| Assumption | Status | Evidence | Gap |
|------------|--------|----------|-----|
| Error boundaries | ❌ MISSING | Not found | Full gap |
| API error handling | ❌ MISSING | Deriv client has try/catch | Not propagated |
| Form validation | 🔶 PARTIAL | Zod suggested in docs | Not implemented |
| User error messages | ❌ MISSING | No toast/notification system | Full gap |

---

## 10. Performance Assumptions

| Assumption | Status | Evidence | Gap |
|------------|--------|----------|-----|
| Code splitting | ✅ CONFIRMED | Next.js default | None |
| Image optimization | ✅ CONFIRMED | Next.js Image | None |
| Font optimization | ✅ CONFIRMED | next/font | None |
| Bundle analysis | ❌ MISSING | Not configured | Nice to have |

---

## Gap Summary

### Critical Gaps (Must Address)
1. **Real Authentication** - Replace mock with Supabase Auth
2. **Database Connections** - Wire Supabase client
3. **Deriv API Integration** - Connect WebSocket client
4. **State Management** - Add global/server state
5. **Testing** - Implement test suite

### Medium Gaps (Should Address)
6. **Error Boundaries** - Add React error boundaries
7. **Form Validation** - Implement Zod schemas
8. **API Routes** - Build Next.js API routes
9. **Notification System** - Add toast components

### Low Gaps (Nice to Have)
10. **Performance Monitoring** - Add analytics
11. **Bundle Analysis** - Configure analyzer
12. **Documentation** - Expand inline docs

---

## Spec Generation Strategy

Based on gap analysis, spec generation should:

1. **Preserve Existing** - Document current architecture accurately
2. **Fill Critical Gaps** - Define patterns for missing pieces
3. **Align Aspirations** - Bridge `docs/specifications.md` to reality
4. **Enable Migration** - Provide clear transition paths

### Priority Layers
- **High:** PRD, ARC, DBL, SIL, VRL (critical for implementation)
- **Medium:** UXA, UXL, CDL, STM, RIL (enhances UX/devex)
- **Lower:** OPS, EL (operational concerns)

---

*End of Confirmed Assumptions Analysis*
