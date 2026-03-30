# @org/shared-auth

Authentication guards and helpers for the Deriv Jules multi-tenant platform. Provides composable Higher-Order Components (HOCs) that wrap React Server Components to enforce authentication and role-based access control.

## Guards

All guards are async server component wrappers that run on the server before the page renders, redirecting unauthenticated or unauthorised users.

### `withAuth(Component, redirectTo?)`

Requires the user to be authenticated. Redirects to `/login` (or `redirectTo`) if no valid session exists.

```tsx
import { withAuth } from '@org/shared-auth';

async function ProfilePage({ user }: { user: AppUser }) {
  return <div>Welcome {user.email}</div>;
}

export const ProfilePageProtected = withAuth(ProfilePage);
```

### `withAdmin(Component, redirectTo?)`

Requires `user.app_metadata.role === 'admin'`. Non-admin users are redirected to `/`.

```tsx
import { withAdmin } from '@org/shared-auth';

export const AdminDashboard = withAdmin(BaseAdminPage);
```

### `withRole(roles, Component)`

Restricts access to users with one of the specified `UserRole` values.

```tsx
import { withRole } from '@org/shared-auth';

export const TenantAdminPage = withRole(['tenant_admin', 'admin'], BasePage);
```

### `withTenant(Component, redirectTo?)`

Verifies that the authenticated user belongs to the current tenant (via the `tenant_memberships` table in Supabase). Requires `NEXT_PUBLIC_TENANT_ID` to be set.

```tsx
import { withTenant } from '@org/shared-auth';

export const TenantUserPage = withTenant(withAuth(BasePage));
```

## Auth Helpers

Client-side authentication utilities that delegate to the Supabase browser client.

```ts
import { signIn, signUp, signOut } from '@org/shared-auth';

// Password sign-in
await signIn('user@example.com', 'password');

// OAuth sign-in
await signIn('user@example.com', undefined, 'google');

// Sign up
await signUp('user@example.com', 'password');

// Sign out
await signOut();
```

## Types

Guards inject a typed `user: AppUser` prop from `@org/shared-types`.

## Dependencies

- `@org/supabase` — server and browser Supabase clients
- `@org/shared-types` — `AppUser`, `UserRole`
- `next/navigation` — `redirect`
- `next/headers` — `cookies`
