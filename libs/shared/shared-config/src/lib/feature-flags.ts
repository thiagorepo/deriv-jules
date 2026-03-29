/**
 * Feature flags configuration
 */

export const featureFlags = {
  // Trading features
  enableAdvancedTrading:
    process.env.NEXT_PUBLIC_FEATURE_ADVANCED_TRADING === 'true',
  enableCrypto: process.env.NEXT_PUBLIC_FEATURE_CRYPTO === 'true',
  enableDerivatives: process.env.NEXT_PUBLIC_FEATURE_DERIVATIVES === 'true',

  // Admin features
  enableUserManagement:
    process.env.NEXT_PUBLIC_FEATURE_USER_MANAGEMENT === 'true',
  enableTenantManagement:
    process.env.NEXT_PUBLIC_FEATURE_TENANT_MANAGEMENT === 'true',

  // UI features
  enableBetaUI: process.env.NEXT_PUBLIC_FEATURE_BETA_UI === 'true',
  enableDarkMode: process.env.NEXT_PUBLIC_FEATURE_DARK_MODE === 'true',
} as const;

export type FeatureFlags = typeof featureFlags;

export function isFeatureEnabled(feature: keyof FeatureFlags): boolean {
  return featureFlags[feature];
}
