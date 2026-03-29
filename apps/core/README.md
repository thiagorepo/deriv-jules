# @deriv-opus/core

The main DerivOpus Next.js 16 application with App Router, implementing multi-tenant algorithmic trading platform features.

## Directory Structure

```
src/
├── app/                          # Next.js App Router pages & API routes
│   ├── (app)/                   # Authenticated app routes
│   ├── auth/                    # Authentication pages
│   ├── api/                     # API endpoints
│   └── layout.tsx               # Root layout
├── components/
│   ├── ui/                      # shadcn/ui primitives (47+ components)
│   ├── layout/                  # Layout components (Sidebar, Header, etc)
│   ├── forms/                   # Form field components
│   └── features/                # Domain-specific feature components
├── hooks/                        # Custom React hooks (16 total)
├── lib/
│   ├── security/                # Auth, CSRF, rate limiting, headers
│   ├── validation/              # Zod schemas (22 files)
│   ├── utils.ts                 # Utility functions (cn, formatters)
│   ├── env.ts                   # Environment variable validation
│   ├── error-logger.ts          # Error logging utilities
│   ├── error-response.ts        # API response helpers
│   ├── api-client.ts            # Typed API client utilities
│   ├── metrics.ts               # Metrics recording
│   └── logger.ts                # Environment-aware logging
└── types/                        # TypeScript type definitions
```

## Development

```bash
# Install dependencies (run from root)
pnpm install

# Development server
pnpm nx dev core

# Build for production
pnpm nx build core

# Run tests
pnpm nx test core

# Run tests with coverage
pnpm nx test:coverage core

# Type check
pnpm nx typecheck core

# Lint
pnpm nx lint core
```

## Tech Stack

- **Next.js 16** with App Router
- **React 19** with strict TypeScript
- **Tailwind CSS v4** with custom themes
- **shadcn/ui** (47+ Radix UI primitives)
- **Supabase** (PostgreSQL, Auth, Realtime)
- **Stripe** (Payments & Subscriptions)
- **Deriv WebSocket API** (Real-time trading data)
- **Zod** (Schema validation)
- **react-hook-form** (Form state management)
- **Vitest** (Unit testing)

## Environment Variables

See `.env.example` in root. Core variables:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `DERIV_APP_ID` (default: 1089)
- `NEXT_PUBLIC_WS_URL` (default: wss://ws.derivws.com/websockets/v3)

## Key Features (Implemented Per Spec)

- **Multi-tenant architecture** with tenant switching
- **Role-based access control** (user, admin, super_admin)
- **Algorithmic trading** with strategy management
- **Real-time data** via Deriv WebSocket
- **Trading signals** and copy trading
- **Subscription billing** via Stripe
- **AI assistant** chatbot
- **Analytics dashboard** with charts
- **Mobile responsive** design

## Architecture Patterns

### API Routes

```typescript
export async function POST(request: NextRequest) {
  return withAuth(async (request, { userId, supabase, role }) => {
    // Handler implementation
  });
}
```

### Server Components

```typescript
import { withAuth } from '@org/shared-auth';

export default async function Page() {
  const { userId } = await withAuth();
  // Component implementation
}
```

### Client Components

```typescript
'use client';
import { useAuth } from '@org/shared-auth';

export default function Component() {
  const { user } = useAuth();
  // Component implementation
}
```

## Testing

Tests use Vitest with @testing-library/react:

```bash
# Run all tests
pnpm nx test core

# Watch mode
pnpm nx test core -- --watch

# Coverage report
pnpm nx test:coverage core
```

Test files: `src/**/*.test.ts{x}` or `src/**/*.spec.ts{x}`

## Security

- JWT session validation via middleware
- CSRF protection on mutating endpoints
- Row-Level Security (RLS) on all database tables
- Rate limiting per endpoint
- Content Security Policy headers
- Secure HTTP-only cookies for auth tokens

## Deployment

### Vercel

```bash
# Production build
pnpm nx build core

# Deployment automatically triggers on push to main
```

### Railway / Self-hosted

```bash
pnpm nx build core
pnpm nx start core
```

## Related Packages

- `@org/shared-config` — Navigation, feature flags, configuration
- `@org/shared-auth` — Authentication helpers and guards
- `@org/supabase` — Supabase client factories
- `@org/ui` — Shared formatting utilities
- `@org/deriv-api` — Deriv WebSocket client
- `@org/core-routes` — Route definitions

## Specifications

Full specification: `/docs/specifications.md`

## Contributing

See `CONTRIBUTING.md` in root.

## License

MIT
