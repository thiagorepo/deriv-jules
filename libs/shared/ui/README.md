# @org/ui

The central repository for reusable Next.js components tailored for the multi-tenant trading platform. Built alongside Tailwind CSS v4.

## Overview

All UI components use Tailwind CSS utility classes referencing CSS custom properties from `@org/theme`. This means components automatically adapt to the active tenant's branding without conditional styling logic.

## Component Reference

### Primitives

#### `Button`

```tsx
import { Button } from '@org/ui';

<Button variant="primary" onClick={handleClick}>Trade Now</Button>
<Button variant="secondary" disabled={loading}>Cancel</Button>
```

Props: `variant` (`'primary' | 'secondary'`), all standard `button` HTML attributes. Minimum height 44px for touch targets.

#### `Card`

```tsx
import { Card } from '@org/ui';

<Card className="p-6">Content here</Card>
```

Props: `className`, all standard `div` HTML attributes.

#### `Header`

```tsx
import { Header } from '@org/ui';

<Header title="Trading Platform" />
```

Displays the tenant name from `useTheme()` if `title` is not provided.

### Layout

#### `DashboardLayout`

Full-page layout with a collapsible sidebar for admin/user dashboards.

```tsx
import { DashboardLayout } from '@org/ui';

<DashboardLayout userRole="admin" featureFlags={flags}>
  <MyPageContent />
</DashboardLayout>
```

Props:
- `userRole: UserRole` — determines which navigation links are shown
- `featureFlags?: Record<string, boolean>` — hides nav items for disabled features
- `children: ReactNode`

#### `Sidebar`

Navigation sidebar with role-based link filtering and mobile overlay.

```tsx
import { Sidebar } from '@org/ui';

<Sidebar
  userRole="user"
  isOpen={isOpen}
  setIsOpen={setIsOpen}
  featureFlags={flags}
/>
```

### Auth Forms

#### `LoginForm`

```tsx
import { LoginForm } from '@org/ui';

<LoginForm
  onSubmit={({ email, password }) => handleLogin(email, password)}
  loading={isLoading}
  error={errorMessage}
/>
```

#### `RegisterForm`

```tsx
import { RegisterForm } from '@org/ui';

<RegisterForm
  onSubmit={({ name, email, password }) => handleRegister(...)}
  loading={isLoading}
  error={errorMessage}
/>
```

### Dashboards

| Component        | Description                               |
|------------------|-------------------------------------------|
| `AdminDashboard` | Admin overview with stats and activity log|
| `UserDashboard`  | User trading overview with positions table|
| `AdminUsers`     | User management table with search         |
| `AdminProducts`  | Product management table                  |
| `AdminPlans`     | Subscription plan cards                   |
| `AdminSettings`  | Tenant branding and integration form      |
| `UserMarketplace`| Product cards with purchase flow          |
| `UserPlans`      | Subscription plan selection               |
| `UserPurchases`  | Order history table                       |

### Icons

SVG icon components compatible with Tailwind sizing utilities:

```tsx
import { MenuIcon, XMarkIcon } from '@org/ui';

<MenuIcon className="w-6 h-6" />
<XMarkIcon className="w-5 h-5 text-muted-foreground" />
```

## Dependencies

- `@org/theme` — `ThemeProvider`, `useTheme`
- `@org/shared-types` — `AppUser`, `UserRole`
- React 19
- Tailwind CSS v4
