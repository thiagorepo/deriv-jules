/**
 * Tenant-specific configuration
 */

import type { TenantConfig } from '@org/shared-types';

export const defaultTenantConfig: TenantConfig = {
  id: 'default',
  name: 'Default Tenant',
  slug: 'default',
  branding: {
    logo: '/logos/default.png',
    favicon: '/favicons/default.png',
    primaryColor: '#0066cc',
    secondaryColor: '#00cc66',
  },
  features: {
    trading: true,
    crypto: false,
    derivatives: false,
    advancedAnalytics: false,
  },
  limits: {
    maxUsers: 100,
    maxTradesPerDay: 1000,
    maxAccountBalance: 1000000,
  },
};

export function getTenantConfig(tenantId: string): TenantConfig {
  // Would fetch from database in production
  return defaultTenantConfig;
}
