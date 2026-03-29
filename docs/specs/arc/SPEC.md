# ARC: Architecture Specification

> **Spec ID:** ARC-001
> **Version:** 1.0.0
> **Status:** DRAFT
> **Last Updated:** 2026-03-28

---

## 1. Architecture Overview

### 1.1 High-Level Pattern

```
┌─────────────────────────────────────────────────────────────┐
│                    NX MONOREPO                              │
├─────────────────────────────────────────────────────────────┤
│  APPS (20%)                    LIBS/SHARED (80%)            │
│  ┌─────────────────┐          ┌─────────────────────┐      │
│  │ tenant-app      │──┐       │ core-routes         │      │
│  │ tenant-app-1    │  │       │ ui                  │      │
│  │ tenant-app-2    │  ├──►    │ theme               │      │
│  │ tenant-app-3    │  │       │ deriv-api           │      │
│  │ tenant-app-4    │──┘       │ supabase            │      │
│  └─────────────────┘          │ shared-auth         │      │
│                               │ shared-config       │      │
│                               └─────────────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

### 1.2 Core Principles

1. **80/20 Rule** - 80% shared code, 20% tenant-specific
2. **Single Source of Truth** - Shared libraries own domain logic
3. **Tenant Isolation** - Apps consume libs, never modify
4. **Convention over Configuration** - Nx generators enforce patterns
5. **Type Safety** - TypeScript strict mode throughout

---

## 2. Project Structure

### 2.1 Directory Layout

```
deriv-jules/
├── apps/                          # Tenant Applications
│   ├── tenant-app/                # Primary tenant (reference)
│   │   ├── app/                   # Next.js App Router
│   │   │   ├── (auth)/           # Auth group routes
│   │   │   ├── (dashboard)/      # Protected routes
│   │   │   ├── admin/            # Admin routes
│   │   │   ├── api/              # API routes
│   │   │   ├── layout.tsx        # Root layout
│   │   │   └── page.tsx          # Home page
│   │   ├── middleware.js         # Tenant middleware
│   │   ├── next.config.mjs       # Next.js config
│   │   └── package.json          # App dependencies
│   ├── tenant-app-1/              # Tenant variant 1
│   ├── tenant-app-2/              # Tenant variant 2
│   ├── tenant-app-3/              # Tenant variant 3
│   └── tenant-app-4/              # Tenant variant 4
│
├── libs/shared/                   # Shared Libraries
│   ├── core-routes/               # Routing & Pages
│   │   └── src/
│   │       ├── lib/
│   │       │   ├── user.tsx       # User pages
│   │       │   ├── admin.tsx      # Admin pages
│   │       │   └── login.tsx      # Auth pages
│   │       └── index.ts           # Public exports
│   │
│   ├── ui/                        # UI Components
│   │   └── src/
│   │       ├── ui/                # Base components
│   │       ├── auth-forms/        # Auth components
│   │       ├── dashboards/        # Dashboard components
│   │       ├── icons/             # Icon components
│   │       ├── sidebar/           # Navigation
│   │       ├── dashboard-layout/  # Layout wrapper
│   │       ├── admin-*/           # Admin components
│   │       ├── user-*/            # User components
│   │       └── index.ts           # Public exports
│   │
│   ├── theme/                     # Theming System
│   │   └── src/
│   │       └── styles/            # CSS variables
│   │
│   ├── deriv-api/                 # Deriv API Client
│   │   └── src/
│   │       └── lib/
│   │           └── deriv-api.ts   # WebSocket manager
│   │
│   ├── supabase/                  # Supabase Client
│   │   └── src/
│   │       └── lib/
│   │           └── supabase.ts    # DB client
│   │
│   ├── shared-auth/               # Authentication
│   │   └── src/
│   │       └── lib/
│   │           └── auth.ts        # Auth utilities
│   │
│   └── shared-config/             # Configuration
│       └── src/
│           └── lib/
│               └── config.ts      # App config
│
├── e2e/                           # E2E Tests
│   └── src/                       # Playwright tests
│
├── supabase/                      # Database
│   ├── migrations/                # SQL migrations
│   └── config.toml                # Supabase config
│
├── docs/                          # Documentation
│   ├── specs/                     # Specification suite
│   ├── specifications.md          # Legacy spec
│   └── project-documentation.md   # Architecture docs
│
├── nx.json                        # Nx configuration
├── package.json                   # Root package
├── tsconfig.base.json             # TypeScript config
└── workspace.json                 # Nx workspace
```

### 2.2 Module Boundaries

```typescript
// nx.json - Enforcement Rules
{
  "targetDefaults": {
    "build": {
      "dependsOn": ["^build"]
    }
  },
  "namedInputs": {
    "default": ["{projectRoot}/**/*"]
  }
}
```

**Dependency Rules:**
- Apps can depend on any lib
- Libs can depend on other libs (same level)
- Libs CANNOT depend on apps
- Circular dependencies forbidden

---

## 3. Framework Stack

### 3.1 Core Technologies

| Layer | Technology | Version | Purpose |
|-------|------------|---------|---------|
| Monorepo | Nx | 22.5.4 | Build system |
| Framework | Next.js | 16.1.6 | App framework |
| Runtime | React | 19.2.4 | UI library |
| Language | TypeScript | 5.9.2 | Type safety |
| Styling | Tailwind CSS | 4.2.1 | CSS framework |
| Database | Supabase | - | PostgreSQL |
| Auth | Supabase Auth | - | Authentication |
| API | Deriv WebSocket | v3 | Trading API |

### 3.2 Build Tools

| Tool | Version | Purpose |
|------|---------|---------|
| SWC | 1.15.8 | Compilation |
| Jest | 30.0.2 | Unit tests |
| Playwright | 1.58.2 | E2E tests |
| ESLint | 9.8.0 | Linting |
| Prettier | 3.6.2 | Formatting |
| Husky | 9.1.7 | Git hooks |

---

## 4. Routing Architecture

### 4.1 Route Organization

```typescript
// libs/shared/core-routes/src/index.ts
export { UserPage } from './lib/user';
export { AdminPage } from './lib/admin';
export { LoginPage } from './lib/login';
export { AdminUsersPage } from './lib/admin-users';
export { AdminProductsPage } from './lib/admin-products';
export { AdminPlansPage } from './lib/admin-plans';
export { AdminSettingsPage } from './lib/admin-settings';
export { UserPlansPage } from './lib/user-plans';
export { UserPurchasesPage } from './lib/user-purchases';
export { UserMarketplacePage } from './lib/user-marketplace';
```

### 4.2 Route Groups

| Group | Path | Purpose | Auth |
|-------|------|---------|------|
| Public | `/` | Landing | None |
| Auth | `/(auth)` | Login, Register | None |
| User | `/(dashboard)` | User features | Required |
| Admin | `/admin/*` | Admin features | Admin role |
| API | `/api/*` | Backend routes | Varies |

### 4.3 Middleware Pattern

```typescript
// apps/tenant-app/middleware.js
import { tenantMiddleware } from '@org/core-routes';

export function middleware(request) {
  return tenantMiddleware(request);
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)'
  ]
};
```

---

## 5. Component Architecture

### 5.1 Component Categories

```
@org/ui/
├── ui/                    # Primitive components
│   ├── button.tsx
│   ├── input.tsx
│   ├── card.tsx
│   └── ...
│
├── auth-forms/            # Authentication
│   ├── login-form.tsx
│   └── register-form.tsx
│
├── dashboards/            # Dashboard widgets
│   ├── stats-card.tsx
│   └── chart-widget.tsx
│
├── sidebar/               # Navigation
│   ├── sidebar.tsx
│   └── sidebar-item.tsx
│
├── dashboard-layout/      # Layout wrapper
│   └── dashboard-layout.tsx
│
├── admin-*/               # Admin components
│   ├── admin-user-list.tsx
│   └── admin-product-form.tsx
│
└── user-*/                # User components
    ├── user-trade-form.tsx
    └── user-position-list.tsx
```

### 5.2 Component Patterns

```typescript
// Component with props interface
interface UserCardProps {
  user: User;
  onSelect: (id: string) => void;
}

export function UserCard({ user, onSelect }: UserCardProps) {
  return (
    <button onClick={() => onSelect(user.id)}>
      {user.email}
    </button>
  );
}
```

---

## 6. Data Architecture

### 6.1 Database Schema

```sql
-- Core tables (existing)
CREATE TYPE app_role AS ENUM ('admin', 'user');

CREATE TABLE user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  role app_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id)
);

CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id)
);

-- RLS Policies
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Security definer for admin check
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### 6.2 Client Architecture

```typescript
// libs/shared/supabase/src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey);

// Server-side client
export function createServerClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}
```

---

## 7. API Architecture

### 7.1 Deriv WebSocket Client

```typescript
// libs/shared/deriv-api/src/lib/deriv-api.ts
export class DerivAPI {
  private static instance: DerivAPI;
  private ws: WebSocket | null = null;
  private listeners: Map<string, Set<Function>> = new Map();

  static getInstance(): DerivAPI {
    if (!DerivAPI.instance) {
      DerivAPI.instance = new DerivAPI();
    }
    return DerivAPI.instance;
  }

  connect(appId: string, endpoint = 'wss://ws.derivws.com/websockets/v3') {
    this.ws = new WebSocket(`${endpoint}?app_id=${appId}`);
    this.setupListeners();
  }

  private setupListeners() {
    this.ws?.addEventListener('message', (event) => {
      const data = JSON.parse(event.data);
      this.notify(data.msg_type, data);
    });
  }

  subscribe(msgType: string, callback: Function) {
    if (!this.listeners.has(msgType)) {
      this.listeners.set(msgType, new Set());
    }
    this.listeners.get(msgType)!.add(callback);
  }

  private notify(msgType: string, data: any) {
    this.listeners.get(msgType)?.forEach(cb => cb(data));
  }
}
```

### 7.2 API Routes

```
app/api/
├── auth/
│   ├── callback/route.ts    # OAuth callback
│   └── logout/route.ts      # Logout handler
├── trades/
│   ├── route.ts             # CRUD trades
│   └── [id]/route.ts        # Single trade
└── users/
    └── route.ts             # User management
```

---

## 8. State Management

### 8.1 Recommended Pattern: Zustand

```typescript
// libs/shared/stores/src/lib/trade-store.ts
import { create } from 'zustand';

interface TradeState {
  positions: Position[];
  addPosition: (position: Position) => void;
  removePosition: (id: string) => void;
}

export const useTradeStore = create<TradeState>((set) => ({
  positions: [],
  addPosition: (position) =>
    set((state) => ({
      positions: [...state.positions, position]
    })),
  removePosition: (id) =>
    set((state) => ({
      positions: state.positions.filter(p => p.id !== id)
    }))
}));
```

### 8.2 Server State: React Query

```typescript
// libs/shared/queries/src/lib/use-trades.ts
import { useQuery } from '@tanstack/react-query';

export function useTrades() {
  return useQuery({
    queryKey: ['trades'],
    queryFn: fetchTrades,
    staleTime: 30000
  });
}
```

---

## 9. Theming Architecture

### 9.1 CSS Variables

```css
/* libs/shared/theme/src/styles/variables.css */
:root {
  /* Brand colors */
  --color-primary: theme('colors.blue.600');
  --color-secondary: theme('colors.gray.600');
  --color-accent: theme('colors.blue.500');

  /* Semantic colors */
  --color-success: theme('colors.green.500');
  --color-warning: theme('colors.yellow.500');
  --color-error: theme('colors.red.500');

  /* Surfaces */
  --color-background: theme('colors.white');
  --color-surface: theme('colors.gray.50');
  --color-text: theme('colors.gray.900');

  /* Tenant overrides */
  --tenant-primary: var(--color-primary);
}
```

### 9.2 Tenant Configuration

```typescript
// apps/tenant-app/tailwind.config.ts
export default {
  theme: {
    extend: {
      colors: {
        primary: 'var(--tenant-primary)',
        // Tenant-specific overrides
      }
    }
  }
};
```

---

## 10. Deployment Architecture

### 10.1 Build Pipeline

```yaml
# .github/workflows/deploy.yml
name: Deploy
on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - run: pnpm install
      - run: pnpm nx build tenant-app
      - run: pnpm nx test tenant-app

  deploy:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - run: pnpm nx deploy tenant-app
```

### 10.2 Environment Configuration

| Environment | Tenant | Domain | Database |
|-------------|--------|--------|----------|
| Development | All | localhost | Dev Supabase |
| Staging | tenant-app | staging.example.com | Staging Supabase |
| Production | tenant-app | app.example.com | Prod Supabase |
| Production | tenant-app-1 | app1.example.com | Prod Supabase |

---

## 11. Security Architecture

### 11.1 Authentication Flow

```
┌─────────┐    ┌──────────┐    ┌───────────┐
│  User   │───►│ Supabase │───►│  Database │
│         │    │   Auth   │    │    RLS    │
└─────────┘    └──────────┘    └───────────┘
     │              │                │
     │    JWT Token │                │
     │◄─────────────┘                │
     │                               │
     │         Query with JWT        │
     ├──────────────────────────────►│
     │                               │
     │        RLS-filtered data      │
     │◄──────────────────────────────┤
```

### 11.2 Authorization Layers

1. **Middleware** - Route protection
2. **RLS** - Database-level filtering
3. **RBAC** - Role-based permissions
4. **UI** - Conditional rendering

---

## 12. Monitoring & Observability

### 12.1 Logging

```typescript
// libs/shared/logger/src/lib/logger.ts
export const logger = {
  info: (message: string, context?: object) => {
    console.log(JSON.stringify({ level: 'info', message, context }));
  },
  error: (message: string, error: unknown) => {
    console.error(JSON.stringify({ level: 'error', message, error }));
  }
};
```

### 12.2 Metrics

- Build time per app
- Bundle size per app
- Test coverage per lib
- API response times
- WebSocket latency

---

*End of Architecture Specification*
