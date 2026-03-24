# @org/supabase

A wrapper around `@supabase/ssr` to streamline integration with Supabase across both Server and Client Next.js components.

## Utilities

- `createServerClient`: Initialises a Supabase client that securely parses user roles and sessions from HttpOnly cookies in Server Components or Actions.
- `createBrowserClient`: Initialises a client with session credentials read from `localStorage` useful for CSR component testing and initial OAuth.
