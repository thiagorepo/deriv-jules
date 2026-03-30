# @org/supabase

Supabase client factory functions for use across Server Components, Server Actions, and Client Components in the Deriv Jules platform.

## Overview

This package provides two factory functions — one for server-side rendering contexts and one for client-side (browser) contexts — following the official `@supabase/ssr` integration pattern for Next.js App Router.

## Functions

### `createServerClient(url, key, cookieStore)`

Creates a Supabase client for use in **Server Components**, **Server Actions**, and **Route Handlers** where `next/headers` cookies are available.

```ts
import { createServerClient } from '@org/supabase';
import { cookies } from 'next/headers';

// In a server component or server action:
const cookieStore = cookies();
const supabase = createServerClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  cookieStore
);

const { data: { user } } = await supabase.auth.getUser();
```

### `createBrowserClient(url, key)`

Creates a Supabase client for use in **Client Components** (`'use client'`). The session is persisted in `localStorage` by the Supabase JS SDK.

```ts
import { createBrowserClient } from '@org/supabase';

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Sign in
const { error } = await supabase.auth.signInWithPassword({ email, password });

// OAuth
await supabase.auth.signInWithOAuth({ provider: 'google' });
```

## Environment Variables

| Variable                          | Description                        |
|-----------------------------------|------------------------------------|
| `NEXT_PUBLIC_SUPABASE_URL`        | Your Supabase project URL          |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY`   | The public anon key (never use the service role key client-side) |

## Security Notes

- Always use the **anon key** for client-side access — never expose the service role key to the browser.
- The `createServerClient` function should be the only place service-level operations are performed.
- Row-Level Security (RLS) policies in Supabase enforce access control at the database level.

## Relationship to @org/shared-supabase

`@org/supabase` provides the browser and server clients used throughout `@org/shared-auth` and `@org/core-routes`. `@org/shared-supabase` is a separate factory with similar intent — future consolidation should pick one and deprecate the other.
