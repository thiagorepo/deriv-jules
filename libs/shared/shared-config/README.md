# @org/shared-config

Tenant configuration, feature flags, and navigation definitions for the Deriv Jules platform.

## Overview

`@org/shared-config` is the central source of truth for per-tenant runtime configuration. It reads from environment variables, providing typed access to tenant-specific settings across all shared libraries and apps.

## Tenant Configuration

`getTenantConfig()` returns the current tenant's configuration object based on `NEXT_PUBLIC_*` environment variables:

```ts
import { getTenantConfig } from '@org/shared-config';

const config = getTenantConfig();
// {
//   name: 'Local Broker',
//   primaryColor: '#10b981',
//   theme: 'dark',
//   supabaseUrl: 'https://...',
// }
```

## Feature Flags

Feature flags are driven by environment variables and gate optional platform capabilities.

```ts
import { getFeatureFlags } from '@org/shared-config';

const flags = getFeatureFlags();
// { trading: true, adminPanel: false, crypto: false }
```

| Flag              | Env Variable         | Default | Description                  |
|-------------------|----------------------|---------|------------------------------|
| `trading`         | `FEATURE_TRADING`    | `true`  | Enables trading module       |
| `adminPanel`      | `FEATURE_ADMIN_PANEL`| `false` | Enables admin panel          |
| `crypto`          | `FEATURE_CRYPTO`     | `false` | Enables crypto trading       |

## Navigation

Pre-defined navigation structures for admin and user roles, filtered by feature flags at runtime:

```ts
import { getAdminNav, getUserNav } from '@org/shared-config';

const adminLinks = getAdminNav(); // Full admin sidebar links
const userLinks = getUserNav(featureFlags); // Feature-gated user links
```

## Environment Variables

| Variable                        | Required | Description                    |
|---------------------------------|----------|--------------------------------|
| `NEXT_PUBLIC_TENANT_NAME`       | Yes      | Display name for the tenant    |
| `NEXT_PUBLIC_PRIMARY_COLOR`     | No       | Brand hex color                |
| `NEXT_PUBLIC_THEME`             | No       | `dark` or `light`              |
| `NEXT_PUBLIC_TENANT_ID`         | No       | UUID for tenant isolation      |
| `FEATURE_TRADING`               | No       | Enable trading features        |
| `FEATURE_ADMIN_PANEL`           | No       | Enable admin panel             |
