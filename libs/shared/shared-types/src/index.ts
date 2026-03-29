/**
 * @deriv-opus/shared-types
 * Shared TypeScript type definitions for Deriv Opus
 */

// User and Auth Types
export type UserRole = 'user' | 'admin' | 'tenant_admin' | 'guest';

export interface AppUser {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  role: UserRole;
  tenantId?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface SessionData {
  user: AppUser | null;
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: number;
}

// Navigation Types
export interface NavItem {
  id: string;
  label: string;
  href?: string;
  icon?: string;
  roles?: UserRole[];
  children?: NavItem[];
}

// Tenant Types
export interface TenantBranding {
  logo: string;
  favicon: string;
  primaryColor: string;
  secondaryColor: string;
}

export interface TenantFeatures {
  trading: boolean;
  crypto: boolean;
  derivatives: boolean;
  advancedAnalytics: boolean;
}

export interface TenantLimits {
  maxUsers: number;
  maxTradesPerDay: number;
  maxAccountBalance: number;
}

export interface TenantConfig {
  id: string;
  name: string;
  slug: string;
  branding: TenantBranding;
  features: TenantFeatures;
  limits: TenantLimits;
}

// Database Types
export interface Database {
  public: {
    Tables: {
      users: {
        Row: AppUser;
        Insert: Omit<AppUser, 'id' | 'createdAt' | 'updatedAt'>;
        Update: Partial<Omit<AppUser, 'id' | 'createdAt' | 'updatedAt'>>;
      };
      tenants: {
        Row: TenantConfig;
        Insert: Omit<TenantConfig, 'id'>;
        Update: Partial<Omit<TenantConfig, 'id'>>;
      };
    };
    Views: Record<string, unknown>;
    Functions: Record<string, unknown>;
    Enums: Record<string, unknown>;
  };
}
