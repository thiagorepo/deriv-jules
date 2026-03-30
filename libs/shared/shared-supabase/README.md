# @org/shared-supabase

Typed Supabase client factories using real `@supabase/supabase-js` for the Deriv Jules platform.

## Relationship to @org/supabase

This library (`@org/shared-supabase`) and `@org/supabase` serve complementary roles:

| Library              | Purpose                                      | Client type        |
|----------------------|----------------------------------------------|--------------------|
| `@org/supabase`      | SSR-integrated mock/dev client               | Next.js cookie-aware|
| `@org/shared-supabase`| Typed real Supabase clients for production  | `@supabase/supabase-js`|

**Consolidation plan:** Future work will merge both libraries into a single `@org/supabase` package that exports all three client types (`createBrowserClient`, `createServerClient`, `createAdminClient`) with full type safety from `@org/shared-types`. `@org/shared-supabase` will be deprecated once this migration is complete.

## API

### `createBrowserClient()`

Creates a typed Supabase browser client using the anon key. For use in Client Components.

```ts
import { createBrowserClient } from '@org/shared-supabase';

const supabase = createBrowserClient();
const { data } = await supabase.from('tenants').select('*');
```

### `createServerClient()`

Creates a server-side Supabase client. For use in Server Components and Route Handlers.

```ts
import { createServerClient } from '@org/shared-supabase';

const supabase = createServerClient();
const { data: { user } } = await supabase.auth.getUser();
```

### `createAdminClient()`

Creates a Supabase client with service role key for administrative operations. **Server-side only.**

```ts
import { createAdminClient } from '@org/shared-supabase';

// Only use in trusted server-side contexts
const supabase = createAdminClient();
await supabase.from('users').delete().eq('id', userId);
```

## Environment Variables

| Variable                          | Client  | Description                    |
|-----------------------------------|---------|--------------------------------|
| `NEXT_PUBLIC_SUPABASE_URL`        | Browser | Supabase project URL           |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY`   | Browser | Public anon key                |
| `SUPABASE_URL`                    | Server/Admin | Supabase project URL      |
| `SUPABASE_SERVICE_ROLE_KEY`       | Admin   | Service role key (never expose to browser) |

## Security

- `createAdminClient` uses the service role key which bypasses Row Level Security (RLS). Use only in trusted server environments.
- Never use `SUPABASE_SERVICE_ROLE_KEY` in client-side code or expose it via `NEXT_PUBLIC_*` variables.
