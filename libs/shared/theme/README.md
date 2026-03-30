# @org/theme

Dynamic theming for the Deriv Jules multi-tenant platform using React Context and CSS custom properties.

## Overview

`@org/theme` provides a `ThemeProvider` that injects per-tenant branding (primary colour, tenant name) into the React component tree via CSS variables. Tailwind CSS v4 classes like `bg-primary` and `text-primary` automatically reflect the tenant's configured colour without any JavaScript overhead at runtime.

## Components

### `ThemeProvider`

Wraps a page or layout to apply dynamic tenant theming.

```tsx
import { ThemeProvider } from '@org/theme';

const tenantTheme = {
  tenantName: 'My Broker',
  colors: {
    primary: '#10b981',
  },
};

export default function Layout({ children }) {
  return (
    <ThemeProvider initialTheme={tenantTheme}>
      {children}
    </ThemeProvider>
  );
}
```

The `ThemeProvider` injects `--primary` as a CSS custom property on a wrapper `div`. All Tailwind utility classes that reference `var(--primary)` then resolve to the tenant's brand colour.

## Hooks

### `useTheme()`

Returns the current `ThemeConfig` from context. Available only in Client Components.

```tsx
'use client';

import { useTheme } from '@org/theme';

export function Header() {
  const { tenantName, colors } = useTheme();
  return <h1>{tenantName}</h1>;
}
```

## ThemeConfig Interface

```ts
interface ThemeConfig {
  tenantName?: string;
  colors?: {
    primary?: string;    // Hex colour string, e.g. '#10b981'
    secondary?: string;
  };
}
```

## How Dynamic Theming Works

1. The `ThemeProvider` converts `colors.primary` to an HSL value and sets `--primary` on the wrapper element.
2. Tailwind CSS v4's `theme()` configuration references `var(--primary)` for all `primary-*` utilities.
3. The CSS cascade means all child components automatically pick up the correct colour without re-renders.

## CSS Variables Applied

| CSS Variable  | Tailwind Utility Classes                   |
|---------------|--------------------------------------------|
| `--primary`   | `bg-primary`, `text-primary`, `border-primary` |

## Dependencies

- React 19 (`createContext`, `useContext`)
- Tailwind CSS v4 (CSS variable integration)
