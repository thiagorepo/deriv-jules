# SIL: Service Interface Layer

> **Spec ID:** SIL-001
> **Version:** 1.0.0
> **Status:** DRAFT
> **Last Updated:** 2026-03-28

---

## 1. Overview

The Service Interface Layer defines contracts for all shared library services, enabling loose coupling and testability.

### Library Structure

```
libs/shared/
├── core-routes/     # Routing services
├── ui/              # UI component services
├── theme/           # Theme services
├── deriv-api/       # Deriv API services
├── supabase/        # Database services
├── shared-auth/     # Authentication services
└── shared-config/   # Configuration services
```

---

## 2. Core Routes Service

### 2.1 Module Interface

```typescript
// libs/shared/core-routes/src/index.ts
export interface RouteConfig {
  path: string;
  component: React.ComponentType;
  middleware?: MiddlewareFunction[];
  meta?: RouteMeta;
}

export interface RouteMeta {
  requiresAuth?: boolean;
  requiredRole?: AppRole;
  title?: string;
  description?: string;
}

export type MiddlewareFunction = (
  request: NextRequest
) => Promise<NextResponse | undefined>;

// Exports
export { UserPage, UserPlansPage, UserPurchasesPage, UserMarketplacePage } from './lib/user';
export { AdminPage, AdminUsersPage, AdminProductsPage, AdminPlansPage, AdminSettingsPage } from './lib/admin';
export { LoginPage } from './lib/login';
export { tenantMiddleware, authMiddleware, roleMiddleware } from './lib/middleware';
export { getRouteConfig, getRoutesByRole } from './lib/routes';
```

### 2.2 Middleware Interface

```typescript
// libs/shared/core-routes/src/lib/middleware.ts
export interface MiddlewareContext {
  request: NextRequest;
  user?: AuthUser;
  tenant?: TenantConfig;
}

export function tenantMiddleware(request: NextRequest): Promise<NextResponse>;
export function authMiddleware(request: NextRequest): Promise<NextResponse>;
export function roleMiddleware(roles: AppRole[]): MiddlewareFunction;
```

---

## 3. UI Component Services

### 3.1 Module Interface

```typescript
// libs/shared/ui/src/index.ts

// Base components
export * from './ui/button';
export * from './ui/input';
export * from './ui/card';
export * from './ui/dialog';
export * from './ui/dropdown';
export * from './ui/table';
export * from './ui/form';
export * from './ui/toast';

// Auth components
export * from './auth-forms/login-form';
export * from './auth-forms/register-form';

// Dashboard components
export * from './dashboards/stats-card';
export * from './dashboards/chart-widget';

// Layout components
export * from './sidebar/sidebar';
export * from './sidebar/sidebar-item';
export * from './dashboard-layout/dashboard-layout';

// Icons
export * from './icons';

// Admin components
export * from './admin-users';
export * from './admin-products';
export * from './admin-plans';

// User components
export * from './user-trades';
export * from './user-positions';
export * from './user-marketplace';
```

### 3.2 Component Props Interfaces

```typescript
// Base button
export interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
}

// Form input
export interface InputProps {
  label?: string;
  error?: string;
  type?: 'text' | 'email' | 'password' | 'number';
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
}

// Card
export interface CardProps {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

// Stats card
export interface StatsCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon?: React.ReactNode;
}

// Table
export interface TableProps<T> {
  columns: ColumnDef<T>[];
  data: T[];
  pagination?: PaginationConfig;
  onRowClick?: (row: T) => void;
}

// Login form
export interface LoginFormProps {
  onSuccess?: (user: AuthUser) => void;
  onError?: (error: Error) => void;
}
```

---

## 4. Theme Service

### 4.1 Module Interface

```typescript
// libs/shared/theme/src/index.ts
export interface ThemeConfig {
  colors: ColorConfig;
  typography: TypographyConfig;
  spacing: SpacingConfig;
}

export interface ColorConfig {
  primary: string;
  secondary: string;
  accent: string;
  success: string;
  warning: string;
  error: string;
  background: string;
  surface: string;
  text: string;
}

export interface TenantTheme {
  tenantId: string;
  overrides: Partial<ThemeConfig>;
}

export function applyTenantTheme(theme: TenantTheme): void;
export function getThemeValue(key: string): string;
export function getTenantTheme(tenantId: string): TenantTheme;
```

### 4.2 CSS Variable Interface

```typescript
// libs/shared/theme/src/lib/css-vars.ts
export type CSSVariable =
  | '--color-primary'
  | '--color-secondary'
  | '--color-accent'
  | '--color-success'
  | '--color-warning'
  | '--color-error'
  | '--color-background'
  | '--color-surface'
  | '--color-text';

export function setCSSVariable(name: CSSVariable, value: string): void;
export function getCSSVariable(name: CSSVariable): string;
```

---

## 5. Deriv API Service

### 5.1 Module Interface

```typescript
// libs/shared/deriv-api/src/index.ts
export { DerivAPI } from './lib/deriv-api';
export type {
  DerivConfig,
  DerivResponse,
  DerivError
} from './lib/types';

// Operations
export { authorize } from './lib/operations/auth';
export { getActiveSymbols, subscribeTicks } from './lib/operations/market';
export { buyContract, sellContract } from './lib/operations/trading';
export { getPortfolio, subscribeProfit } from './lib/operations/portfolio';
export { getBalance, subscribeBalance } from './lib/operations/account';

// Types
export type { Tick, Contract, Portfolio, Balance } from './lib/types';
```

### 5.2 Type Definitions

```typescript
// libs/shared/deriv-api/src/lib/types.ts
export interface DerivConfig {
  appId: string;
  endpoint?: string;
  language?: string;
}

export interface DerivResponse {
  msg_type: string;
  req_id?: number;
  error?: DerivError;
  [key: string]: any;
}

export interface DerivError {
  code: string;
  message: string;
  details?: any;
}

export interface Tick {
  symbol: string;
  quote: number;
  bid: number;
  ask: number;
  epoch: number;
}

export interface Contract {
  contract_id: string;
  symbol: string;
  contract_type: string;
  buy_price: number;
  payout: number;
  profit: number;
  status: 'open' | 'sold' | 'expired' | 'won' | 'lost';
  date_start: number;
  date_expiry?: number;
}

export interface Portfolio {
  contracts: Contract[];
}

export interface Balance {
  currency: string;
  balance: number;
}
```

### 5.3 Operation Interfaces

```typescript
// libs/shared/deriv-api/src/lib/operations/auth.ts
export interface AuthorizeParams {
  apiToken: string;
}

export interface AuthorizeResponse {
  authorize: {
    account_list: Account[];
    balance: number;
    currency: string;
    email: string;
    fullname: string;
  };
}

export function authorize(params: AuthorizeParams): Promise<AuthorizeResponse>;

// libs/shared/deriv-api/src/lib/operations/trading.ts
export interface BuyContractParams {
  symbol: string;
  type: 'CALL' | 'PUT' | 'DIGITDIFF' | 'DIGITMATCH' | ...;
  stake: number;
  duration: number;
  durationUnit: 's' | 'm' | 'h' | 'd';
}

export interface BuyContractResponse {
  buy: {
    contract_id: string;
    price: number;
    payout: number;
  };
}

export function buyContract(params: BuyContractParams): Promise<BuyContractResponse>;
```

---

## 6. Supabase Service

### 6.1 Module Interface

```typescript
// libs/shared/supabase/src/index.ts
export { getSupabaseClient, getServerClient } from './lib/client';
export { ProfilesRepository } from './lib/repositories/profiles';
export { UserRolesRepository } from './lib/repositories/user-roles';
export type { Profile, UserRole } from './lib/types';

// Hooks
export { useProfile, useUpdateProfile } from './lib/hooks/profiles';
export { useUserRole, useIsAdmin } from './lib/hooks/roles';

// Realtime
export { subscribeToTable, subscribeToUserTable } from './lib/realtime';
```

### 6.2 Repository Interfaces

```typescript
// libs/shared/supabase/src/lib/types.ts
export interface Profile {
  id: string;
  user_id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  tenant_id?: string;
  created_at: string;
  updated_at: string;
}

export interface UserRole {
  id: string;
  user_id: string;
  role: AppRole;
  created_at: string;
}

export type AppRole = 'admin' | 'user';

// libs/shared/supabase/src/lib/repositories/base.ts
export interface Repository<T> {
  findAll(filters?: Record<string, any>): Promise<T[]>;
  findById(id: string): Promise<T | null>;
  create(data: Partial<T>): Promise<T>;
  update(id: string, data: Partial<T>): Promise<T>;
  delete(id: string): Promise<void>;
}

// libs/shared/supabase/src/lib/repositories/profiles.ts
export interface ProfilesRepository extends Repository<Profile> {
  findByUserId(userId: string): Promise<Profile | null>;
  findByEmail(email: string): Promise<Profile | null>;
  updateAvatar(userId: string, avatarUrl: string): Promise<Profile>;
}
```

### 6.3 Hook Interfaces

```typescript
// libs/shared/supabase/src/lib/hooks/profiles.ts
export interface UseProfileOptions {
  userId?: string;
  enabled?: boolean;
}

export interface UseProfileReturn {
  profile: Profile | null;
  loading: boolean;
  error: Error | null;
  refetch: () => void;
}

export function useProfile(options?: UseProfileOptions): UseProfileReturn;

export interface UseUpdateProfileReturn {
  update: (data: Partial<Profile>) => Promise<void>;
  loading: boolean;
  error: Error | null;
}

export function useUpdateProfile(): UseUpdateProfileReturn;
```

---

## 7. Authentication Service

### 7.1 Module Interface

```typescript
// libs/shared/shared-auth/src/index.ts
export { AuthProvider } from './lib/provider';
export { useAuth } from './lib/hooks';
export {
  signUp,
  signIn,
  signOut,
  resetPassword,
  updatePassword
} from './lib/operations';
export type { AuthUser, AuthState, AuthContext } from './lib/types';
```

### 7.2 Type Definitions

```typescript
// libs/shared/shared-auth/src/lib/types.ts
export interface AuthUser {
  id: string;
  email: string;
  role: AppRole;
  profile?: Profile;
}

export interface AuthState {
  user: AuthUser | null;
  loading: boolean;
  error: Error | null;
}

export interface AuthContext extends AuthState {
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (newPassword: string) => Promise<void>;
}
```

### 7.3 Provider Interface

```typescript
// libs/shared/shared-auth/src/lib/provider.tsx
export interface AuthProviderProps {
  children: React.ReactNode;
  onAuthStateChange?: (user: AuthUser | null) => void;
}

export function AuthProvider({ children, onAuthStateChange }: AuthProviderProps): JSX.Element;

// libs/shared/shared-auth/src/lib/hooks.ts
export function useAuth(): AuthContext;
```

---

## 8. Configuration Service

### 8.1 Module Interface

```typescript
// libs/shared/shared-config/src/index.ts
export { getConfig, getTenantConfig } from './lib/config';
export { validateConfig } from './lib/validation';
export type { AppConfig, TenantConfig, FeatureFlags } from './lib/types';
```

### 8.2 Type Definitions

```typescript
// libs/shared/shared-config/src/lib/types.ts
export interface AppConfig {
  appName: string;
  version: string;
  environment: 'development' | 'staging' | 'production';
  features: FeatureFlags;
  supabase: {
    url: string;
    anonKey: string;
  };
  deriv: {
    appId: string;
    endpoint: string;
  };
}

export interface TenantConfig {
  id: string;
  name: string;
  domain: string;
  theme: TenantTheme;
  features: FeatureFlags;
}

export interface FeatureFlags {
  trading: boolean;
  copyTrading: boolean;
  signals: boolean;
  marketplace: boolean;
}

// libs/shared/shared-config/src/lib/config.ts
export function getConfig(): AppConfig;
export function getTenantConfig(tenantId: string): TenantConfig;
export function isFeatureEnabled(feature: keyof FeatureFlags): boolean;
```

---

## 9. Error Handling

### 9.1 Error Types

```typescript
// libs/shared/errors/src/index.ts
export class ServiceError extends Error {
  constructor(
    public service: string,
    public code: string,
    message: string,
    public cause?: Error
  ) {
    super(message);
  }
}

export class AuthError extends ServiceError {
  constructor(code: string, message: string) {
    super('auth', code, message);
  }
}

export class DatabaseError extends ServiceError {
  constructor(code: string, message: string) {
    super('database', code, message);
  }
}

export class APIError extends ServiceError {
  constructor(code: string, message: string) {
    super('api', code, message);
  }
}
```

---

## 10. Dependency Injection

### 10.1 Service Container

```typescript
// libs/shared/di/src/index.ts
export interface ServiceContainer {
  get<T>(token: ServiceToken<T>): T;
  register<T>(token: ServiceToken<T>, factory: () => T): void;
}

export type ServiceToken<T> = string & { __type: T };

// Usage
const AUTH_SERVICE: ServiceToken<AuthService> = 'AuthService' as any;
const DB_SERVICE: ServiceToken<DatabaseService> = 'DatabaseService' as any;

container.register(AUTH_SERVICE, () => new AuthServiceImpl());
const auth = container.get(AUTH_SERVICE);
```

---

*End of Service Interface Layer Specification*
