import { featureFlags, isFeatureEnabled } from './feature-flags';
import { mainNavigation, userNavigation } from './navigation';
import { defaultTenantConfig, getTenantConfig } from './tenant-config';

describe('featureFlags', () => {
  it('returns false for all flags when env vars are unset', () => {
    // env vars not set in test environment — all should be false
    expect(featureFlags.enableAdvancedTrading).toBe(false);
    expect(featureFlags.enableCrypto).toBe(false);
    expect(featureFlags.enableDerivatives).toBe(false);
    expect(featureFlags.enableUserManagement).toBe(false);
    expect(featureFlags.enableTenantManagement).toBe(false);
    expect(featureFlags.enableBetaUI).toBe(false);
    expect(featureFlags.enableDarkMode).toBe(false);
  });

  it('isFeatureEnabled returns boolean for known keys', () => {
    expect(typeof isFeatureEnabled('enableCrypto')).toBe('boolean');
    expect(typeof isFeatureEnabled('enableDarkMode')).toBe('boolean');
  });

  it('isFeatureEnabled reflects the featureFlags value', () => {
    expect(isFeatureEnabled('enableAdvancedTrading')).toBe(
      featureFlags.enableAdvancedTrading,
    );
  });
});

describe('mainNavigation', () => {
  it('contains expected top-level nav items', () => {
    const ids = mainNavigation.map((item) => item.id);
    expect(ids).toContain('dashboard');
    expect(ids).toContain('trading');
    expect(ids).toContain('admin');
  });

  it('admin nav item is restricted to admin roles', () => {
    const admin = mainNavigation.find((item) => item.id === 'admin');
    expect(admin?.roles).not.toContain('user');
    expect(admin?.roles).toContain('admin');
    expect(admin?.roles).toContain('tenant_admin');
  });

  it('admin nav item has children', () => {
    const admin = mainNavigation.find((item) => item.id === 'admin');
    expect(admin?.children?.length).toBeGreaterThan(0);
  });

  it('all nav items have required fields', () => {
    for (const item of mainNavigation) {
      expect(item.id).toBeTruthy();
      expect(item.label).toBeTruthy();
      expect(item.href).toBeTruthy();
    }
  });
});

describe('userNavigation', () => {
  it('contains profile and settings items', () => {
    const ids = userNavigation.map((item) => item.id);
    expect(ids).toContain('profile');
    expect(ids).toContain('settings');
  });

  it('all items are accessible to standard user role', () => {
    for (const item of userNavigation) {
      expect(item.roles).toContain('user');
    }
  });
});

describe('defaultTenantConfig', () => {
  it('has required fields', () => {
    expect(defaultTenantConfig.id).toBeTruthy();
    expect(defaultTenantConfig.name).toBeTruthy();
    expect(defaultTenantConfig.slug).toBeTruthy();
  });

  it('has branding configuration', () => {
    expect(defaultTenantConfig.branding.primaryColor).toBeTruthy();
    expect(defaultTenantConfig.branding.logo).toBeTruthy();
  });

  it('has feature flags', () => {
    expect(typeof defaultTenantConfig.features.trading).toBe('boolean');
    expect(typeof defaultTenantConfig.features.crypto).toBe('boolean');
  });

  it('has limits defined', () => {
    expect(defaultTenantConfig.limits.maxUsers).toBeGreaterThan(0);
    expect(defaultTenantConfig.limits.maxTradesPerDay).toBeGreaterThan(0);
  });
});

describe('getTenantConfig', () => {
  it('returns a tenant config object', () => {
    const config = getTenantConfig('some-tenant');
    expect(config).toBeDefined();
    expect(config.id).toBeTruthy();
  });

  it('returns the same default config for any tenantId', () => {
    const config1 = getTenantConfig('tenant-a');
    const config2 = getTenantConfig('tenant-b');
    expect(config1).toEqual(config2);
  });
});
