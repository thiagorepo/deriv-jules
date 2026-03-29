# UI Agent Handoff Document

> **Project:** Deriv Jules NX Monorepo
> **Generated:** 2026-03-28
> **Gate:** 7 → 12 (SPECS → UI)

---

## Overview

This document provides UI implementation agents with everything needed to build the user interface for the Deriv Jules platform. All specifications have been validated and are ready for implementation.

---

## Quick Start

### 1. Read These Specs First

| Priority | Spec | File | Purpose |
|----------|------|------|---------|
| 🔴 HIGH | UXL | `docs/specs/uxl/SPEC.md` | User flows with ASCII diagrams |
| 🔴 HIGH | CDL | `docs/specs/cdl/SPEC.md` | Component definitions & interfaces |
| 🔴 HIGH | STM | `docs/specs/stm/SPEC.md` | State management (Zustand + React Query) |
| 🟡 MEDIUM | VRL | `docs/specs/vrl/SPEC.md` | Form validation schemas |
| 🟡 MEDIUM | EL | `docs/specs/el/SPEC.md` | Error handling patterns |

### 2. Key Directories

```
apps/tenant-app/
├── src/
│   ├── app/           # Next.js App Router pages
│   ├── features/      # Feature-based components
│   ├── components/    # Shared components
│   └── hooks/         # Custom hooks

libs/shared/
├── ui/                # @org/ui - Component library
├── theme/             # @org/theme - Tailwind theming
└── core-routes/       # @org/core-routes - Route exports
```

### 3. Technology Stack

| Layer | Technology | Notes |
|-------|------------|-------|
| Framework | Next.js 16.1.6 | App Router |
| UI Library | React 19.2.4 | |
| Styling | Tailwind CSS 4.2.1 | CSS variables for theming |
| Components | @org/ui | shadcn-style custom library |
| State | Zustand + React Query | See STM-001 |
| Forms | React Hook Form + Zod | See VRL-001 |
| TypeScript | 5.9.2 | Strict mode enabled |

---

## Component Architecture

### Base Components (CDL-001)

Located in `@org/ui`:

```typescript
// Core primitives
- Button (variant, size, loading states)
- Input (validation, icons, masks)
- Select (async, multi, searchable)
- Card (header, content, footer)
- Table (sort, filter, paginate)
- Dialog (modal, drawer)
- Toast (success, error, warning)

// Trading-specific
- TradeForm
- PriceChart
- PositionCard
- PositionList
- MarketSelector

// Admin-specific
- AdminUserList
- AdminProductList
- AdminPlanList
```

### Component Interfaces

All TypeScript interfaces are defined in `docs/specs/cdl/SPEC.md`. Key examples:

```typescript
// From CDL-001
interface TradeFormProps {
  symbol: string;
  onSubmit: (data: TradeFormData) => void;
  isLoading?: boolean;
}

interface PositionCardProps {
  position: Position;
  onSell?: (id: string) => void;
  showActions?: boolean;
}
```

---

## State Management

### React Query (Server State)

```typescript
// From STM-001
// Query keys factory
export const queryKeys = {
  profile: (userId: string) => ['profile', userId],
  trades: (filters?: TradeFilter) => ['trades', filters],
  positions: (status?: 'open' | 'closed') => ['positions', status],
  balance: () => ['balance'],
};

// Usage
const { data: trades } = useQuery({
  queryKey: queryKeys.trades({ status: 'closed' }),
  queryFn: () => tradesApi.getTrades({ status: 'closed' }),
});
```

### Zustand (Client State)

```typescript
// From STM-001
// Auth store
const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }),
      logout: () => set({ user: null }),
    }),
    { name: 'auth-storage' }
  )
);

// Trading store
const useTradingStore = create<TradingState>((set) => ({
  selectedSymbol: null,
  stake: 10,
  setSelectedSymbol: (symbol) => set({ selectedSymbol: symbol }),
  setStake: (stake) => set({ stake }),
}));
```

---

## User Flows

### Authentication Flows (UXL-001)

#### UF-AUTH-001: Login Flow
```
[Landing Page]
      │
      ▼
[Login Form] ──────┐
      │             │
      ▼             ▼
[Validate]    [Error State]
      │             │
      ▼             ▼
[Dashboard]   [Register Link]
```

#### UF-AUTH-002: Registration Flow
```
[Register Link]
      │
      ▼
[Registration Form]
      │
      ▼
[Password Validation]
      │
      ▼
[Email Confirmation]
```

### Trading Flows (UXL-001)

#### UF-TRADE-001: Market Selection
```
[Dashboard]
      │
      ▼
[Markets List] ← [Category Tabs]
      │
      ▼
[Filter/Search]
      │
      ▼
[Select Market]
```

#### UF-TRADE-002: Trade Execution
```
[Market Selected]
      │
      ▼
[Configure Trade]
      │
      ▼
[Preview Summary]
      │
      ▼
[Confirm Dialog]
      │
      ▼
[Execute Trade]
      │
      ▼
[Position Created]
```

---

## Form Validation

### Zod Schemas (VRL-001)

```typescript
// Login schema
const loginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

// Trade schema
const tradeSchema = z.object({
  symbol: z.string().min(1, 'Symbol required'),
  contract_type: z.enum(['CALL', 'PUT']),
  stake: z.number().min(1).max(10000),
  duration: z.number().min(1),
  duration_unit: z.enum(['s', 'm', 'h', 'd']),
});
```

### React Hook Form Integration

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

const form = useForm<LoginFormData>({
  resolver: zodResolver(loginSchema),
  defaultValues: { email: '', password: '' },
});
```

---

## Error Handling

### Error Boundary (EL-001)

```typescript
<ErrorBoundary fallback={<ErrorFallback />}>
  <TradingView />
</ErrorBoundary>
```

### Toast Notifications

```typescript
import { useUIStore } from '@org/stores';

const { addToast } = useUIStore();

// Success
addToast({ type: 'success', title: 'Trade executed' });

// Error
addToast({ type: 'error', title: 'Trade failed', description: error.message });
```

---

## Tasks Reference

UI-related tasks from `docs/tasks/task-index.json`:

| Task ID | Title | Priority | Flow Ref |
|---------|-------|----------|----------|
| TASK-TRADE-002 | Market Selection | HIGH | UF-TRADE-001 |
| TASK-TRADE-003 | Trade Execution | HIGH | UF-TRADE-002 |
| TASK-TRADE-004 | Position Management | HIGH | UF-TRADE-003 |
| TASK-TRADE-005 | Trade History | MEDIUM | UF-TRADE-004 |
| TASK-ADMIN-001 | User Management | MEDIUM | UF-ADMIN-001 |
| TASK-ADMIN-002 | Product Management | MEDIUM | UF-ADMIN-002 |
| TASK-ADMIN-003 | Plan Management | MEDIUM | UF-ADMIN-003 |

---

## Theming

### Tailwind v4 CSS Variables

```css
/* From @org/theme */
:root {
  --color-primary: oklch(0.6 0.2 250);
  --color-secondary: oklch(0.7 0.15 180);
  --color-background: oklch(0.98 0 0);
  --color-foreground: oklch(0.2 0 0);
}

[data-theme="dark"] {
  --color-background: oklch(0.15 0 0);
  --color-foreground: oklch(0.95 0 0);
}
```

### Multi-Tenant Support

Each tenant app can override theme variables in their own CSS.

---

## API Routes (RIL-001)

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/auth/session` | GET | Get current session |
| `/api/auth/logout` | POST | Logout user |
| `/api/users` | GET/PATCH | User profile |
| `/api/trades` | GET | Trade history |
| `/api/positions` | GET | Open positions |
| `/api/positions/sell` | POST | Sell position |
| `/api/admin/users` | GET | Admin user list |
| `/api/admin/products` | GET/POST | Product management |
| `/api/admin/plans` | GET/POST | Plan management |

---

## Do's and Don'ts

### ✅ Do

- Use components from `@org/ui` - don't rebuild primitives
- Follow flow diagrams in UXL-001 exactly
- Use Zustand for client state, React Query for server state
- Validate all forms with Zod schemas from VRL-001
- Handle errors with patterns from EL-001
- Reference spec IDs in commit messages

### ❌ Don't

- Create new base components without checking CDL-001
- Skip form validation
- Ignore loading and error states
- Hardcode colors - use CSS variables
- Mutate state directly - use store actions
- Skip accessibility (WCAG AAA target)

---

## Checklist Before PR

- [ ] All flows from UXL-001 implemented
- [ ] Components match CDL-001 interfaces
- [ ] State management follows STM-001
- [ ] Forms validated with VRL-001 schemas
- [ ] Error handling per EL-001
- [ ] No hardcoded values
- [ ] Accessibility tested
- [ ] Mobile responsive

---

## Questions?

Refer to the source specs in `docs/specs/`:
- `uxl/SPEC.md` - Flows
- `cdl/SPEC.md` - Components
- `stm/SPEC.md` - State
- `vrl/SPEC.md` - Validation
- `el/SPEC.md` - Errors

---

*End of UI Agent Handoff Document*
