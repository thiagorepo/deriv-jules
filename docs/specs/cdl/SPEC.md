# CDL: Component Definitions Layer

> **Spec ID:** CDL-001
> **Version:** 1.0.0
> **Status:** DRAFT
> **Last Updated:** 2026-03-28

---

## 1. Overview

This specification defines all UI components for the Deriv Jules platform, including props interfaces, variants, and composition patterns.

---

## 2. Base UI Components

### 2.1 Button

```typescript
// libs/shared/ui/src/ui/button.tsx
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
}

// Variants
const buttonVariants = {
  primary: 'bg-primary text-white hover:bg-primary/90',
  secondary: 'bg-secondary text-white hover:bg-secondary/90',
  outline: 'border border-primary text-primary hover:bg-primary/10',
  ghost: 'text-primary hover:bg-primary/10',
  destructive: 'bg-red-500 text-white hover:bg-red-600',
};

// Sizes
const buttonSizes = {
  sm: 'h-8 px-3 text-sm',
  md: 'h-10 px-4 text-base',
  lg: 'h-12 px-6 text-lg',
};
```

### 2.2 Input

```typescript
// libs/shared/ui/src/ui/input.tsx
interface InputProps {
  label?: string;
  error?: string;
  hint?: string;
  type?: 'text' | 'email' | 'password' | 'number' | 'tel';
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
  required?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

// States
const inputStates = {
  default: 'border-gray-300 focus:border-primary',
  error: 'border-red-500 focus:border-red-500',
  disabled: 'bg-gray-100 cursor-not-allowed',
};
```

### 2.3 Select

```typescript
// libs/shared/ui/src/ui/select.tsx
interface SelectProps<T> {
  label?: string;
  error?: string;
  options: Array<{ value: T; label: string }>;
  value?: T;
  onChange?: (value: T) => void;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
}
```

### 2.4 Card

```typescript
// libs/shared/ui/src/ui/card.tsx
interface CardProps {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  variant?: 'default' | 'outlined' | 'elevated';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

// Variants
const cardVariants = {
  default: 'bg-white shadow-sm',
  outlined: 'bg-white border border-gray-200',
  elevated: 'bg-white shadow-lg',
};
```

### 2.5 Table

```typescript
// libs/shared/ui/src/ui/table.tsx
interface ColumnDef<T> {
  id: string;
  header: string;
  accessor: keyof T | ((row: T) => React.ReactNode);
  sortable?: boolean;
  width?: string;
}

interface TableProps<T> {
  columns: ColumnDef<T>[];
  data: T[];
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
    onPageChange: (page: number) => void;
  };
  loading?: boolean;
  emptyMessage?: string;
  onRowClick?: (row: T) => void;
}
```

### 2.6 Dialog/Modal

```typescript
// libs/shared/ui/src/ui/dialog.tsx
interface DialogProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  closeOnOverlayClick?: boolean;
}

// Usage
<Dialog open={isOpen} onClose={handleClose} title="Confirm Action">
  <p>Are you sure you want to proceed?</p>
  <DialogFooter>
    <Button variant="ghost" onClick={handleClose}>Cancel</Button>
    <Button onClick={handleConfirm}>Confirm</Button>
  </DialogFooter>
</Dialog>
```

### 2.7 Toast

```typescript
// libs/shared/ui/src/ui/toast.tsx
interface ToastProps {
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  description?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

// Toast Provider
interface ToastProviderProps {
  children: React.ReactNode;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  maxToasts?: number;
}
```

---

## 3. Auth Components

### 3.1 LoginForm

```typescript
// libs/shared/ui/src/auth-forms/login-form.tsx
interface LoginFormProps {
  onSuccess?: (user: AuthUser) => void;
  onError?: (error: Error) => void;
  redirectUrl?: string;
  showRegisterLink?: boolean;
  showForgotPassword?: boolean;
}

// Form Fields
interface LoginFormData {
  email: string;
  password: string;
  rememberMe?: boolean;
}

// Component Structure
const LoginForm = ({ onSuccess, onError }: LoginFormProps) => {
  // Form state
  // Validation with loginSchema
  // Submit handler
  // Error display
  // Links to register/forgot password
};
```

### 3.2 RegisterForm

```typescript
// libs/shared/ui/src/auth-forms/register-form.tsx
interface RegisterFormProps {
  onSuccess?: (user: AuthUser) => void;
  onError?: (error: Error) => void;
  showLoginLink?: boolean;
}

// Form Fields
interface RegisterFormData {
  email: string;
  password: string;
  confirmPassword: string;
  fullName: string;
  acceptTerms: boolean;
}
```

### 3.3 PasswordResetForm

```typescript
// libs/shared/ui/src/auth-forms/password-reset-form.tsx
interface PasswordResetFormProps {
  mode: 'request' | 'reset';
  token?: string; // For reset mode
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}
```

---

## 4. Dashboard Components

### 4.1 StatsCard

```typescript
// libs/shared/ui/src/dashboards/stats-card.tsx
interface StatsCardProps {
  title: string;
  value: string | number;
  change?: number; // Percentage change
  changeLabel?: string; // e.g., "vs last week"
  icon?: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  loading?: boolean;
}

// Example
<StatsCard
  title="Total Profit"
  value="$12,345.67"
  change={12.5}
  changeLabel="vs last month"
  icon={<DollarIcon />}
  trend="up"
/>
```

### 4.2 ChartWidget

```typescript
// libs/shared/ui/src/dashboards/chart-widget.tsx
interface ChartWidgetProps {
  title: string;
  type: 'line' | 'bar' | 'pie' | 'area';
  data: ChartData[];
  height?: number;
  loading?: boolean;
  options?: ChartOptions;
}

interface ChartData {
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string;
  }>;
}
```

### 4.3 ActivityFeed

```typescript
// libs/shared/ui/src/dashboards/activity-feed.tsx
interface ActivityFeedProps {
  activities: Activity[];
  loading?: boolean;
  maxItems?: number;
}

interface Activity {
  id: string;
  type: 'trade' | 'deposit' | 'withdrawal' | 'login';
  description: string;
  timestamp: string;
  amount?: number;
  status?: 'success' | 'pending' | 'failed';
}
```

---

## 5. Layout Components

### 5.1 Sidebar

```typescript
// libs/shared/ui/src/sidebar/sidebar.tsx
interface SidebarProps {
  items: SidebarItem[];
  collapsed?: boolean;
  onToggle?: () => void;
  logo?: React.ReactNode;
  footer?: React.ReactNode;
}

interface SidebarItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  href?: string;
  onClick?: () => void;
  badge?: string | number;
  children?: SidebarItem[];
  isActive?: boolean;
  requiredRole?: AppRole;
}

// Example
<Sidebar
  items={[
    { id: 'dashboard', label: 'Dashboard', icon: <HomeIcon />, href: '/' },
    { id: 'trading', label: 'Trading', icon: <TradeIcon />, href: '/trading' },
    { id: 'admin', label: 'Admin', icon: <AdminIcon />, href: '/admin', requiredRole: 'admin' },
  ]}
/>
```

### 5.2 SidebarItem

```typescript
// libs/shared/ui/src/sidebar/sidebar-item.tsx
interface SidebarItemProps {
  item: SidebarItem;
  collapsed?: boolean;
  active?: boolean;
  onClick?: () => void;
}
```

### 5.3 DashboardLayout

```typescript
// libs/shared/ui/src/dashboard-layout/dashboard-layout.tsx
interface DashboardLayoutProps {
  children: React.ReactNode;
  sidebar?: React.ReactNode;
  header?: React.ReactNode;
  footer?: React.ReactNode;
}

// Structure
const DashboardLayout = ({ children, sidebar }: DashboardLayoutProps) => (
  <div className="flex h-screen">
    {sidebar}
    <main className="flex-1 overflow-auto">
      {children}
    </main>
  </div>
);
```

---

## 6. Trading Components

### 6.1 TradeForm

```typescript
// libs/shared/ui/src/trading/trade-form.tsx
interface TradeFormProps {
  symbol: string;
  onSubmit: (params: TradeParams) => Promise<void>;
  balance?: number;
  loading?: boolean;
}

interface TradeParams {
  symbol: string;
  type: ContractType;
  stake: number;
  duration: number;
  durationUnit: DurationUnit;
}

type ContractType = 'CALL' | 'PUT' | 'DIGITDIFF' | 'DIGITMATCH' | ...;
type DurationUnit = 's' | 'm' | 'h' | 'd';
```

### 6.2 PriceChart

```typescript
// libs/shared/ui/src/trading/price-chart.tsx
interface PriceChartProps {
  symbol: string;
  ticks: Tick[];
  height?: number;
  showControls?: boolean;
}

interface Tick {
  epoch: number;
  quote: number;
  bid: number;
  ask: number;
}
```

### 6.3 PositionCard

```typescript
// libs/shared/ui/src/trading/position-card.tsx
interface PositionCardProps {
  position: Position;
  onSell?: (position: Position) => void;
  showActions?: boolean;
}

interface Position {
  contract_id: string;
  symbol: string;
  contract_type: string;
  buy_price: number;
  current_price?: number;
  profit: number;
  status: 'open' | 'closed';
  opened_at: string;
}
```

### 6.4 PositionList

```typescript
// libs/shared/ui/src/trading/position-list.tsx
interface PositionListProps {
  positions: Position[];
  loading?: boolean;
  onSell?: (position: Position) => void;
  filter?: 'open' | 'closed' | 'all';
}
```

---

## 7. Admin Components

### 7.1 AdminUserList

```typescript
// libs/shared/ui/src/admin-users/admin-user-list.tsx
interface AdminUserListProps {
  users: User[];
  loading?: boolean;
  onEdit?: (user: User) => void;
  onSuspend?: (userId: string) => void;
  pagination?: PaginationConfig;
}

interface User {
  id: string;
  email: string;
  full_name?: string;
  role: AppRole;
  status: 'active' | 'suspended' | 'pending';
  created_at: string;
}
```

### 7.2 AdminProductList

```typescript
// libs/shared/ui/src/admin-products/admin-product-list.tsx
interface AdminProductListProps {
  products: Product[];
  loading?: boolean;
  onEdit?: (product: Product) => void;
  onToggleStatus?: (productId: string, status: 'active' | 'inactive') => void;
}

interface Product {
  id: string;
  name: string;
  symbol: string;
  category: ProductCategory;
  status: 'active' | 'inactive';
  description?: string;
}
```

### 7.3 AdminPlanList

```typescript
// libs/shared/ui/src/admin-plans/admin-plan-list.tsx
interface AdminPlanListProps {
  plans: Plan[];
  loading?: boolean;
  onEdit?: (plan: Plan) => void;
  onToggleStatus?: (planId: string, status: PlanStatus) => void;
}

interface Plan {
  id: string;
  name: string;
  price: number;
  currency: string;
  billingPeriod: 'monthly' | 'yearly';
  features: string[];
  status: 'active' | 'inactive' | 'deprecated';
  maxTrades?: number;
  maxPositions?: number;
}
```

---

## 8. User Components

### 8.1 UserTradeList

```typescript
// libs/shared/ui/src/user-trades/user-trade-list.tsx
interface UserTradeListProps {
  trades: Trade[];
  loading?: boolean;
  pagination?: PaginationConfig;
  filter?: TradeFilter;
}

interface Trade {
  id: string;
  symbol: string;
  type: string;
  stake: number;
  payout?: number;
  profit?: number;
  status: 'open' | 'won' | 'lost' | 'sold';
  opened_at: string;
  closed_at?: string;
}
```

### 8.2 UserPositionList

```typescript
// libs/shared/ui/src/user-positions/user-position-list.tsx
interface UserPositionListProps {
  positions: Position[];
  loading?: boolean;
  onSell?: (contractId: string) => void;
  realtime?: boolean; // Enable real-time updates
}
```

### 8.3 UserMarketplace

```typescript
// libs/shared/ui/src/user-marketplace/user-marketplace.tsx
interface UserMarketplaceProps {
  plans: Plan[];
  currentPlan?: Plan;
  onPurchase?: (planId: string) => void;
  loading?: boolean;
}
```

---

## 9. Feedback Components

### 9.1 EmptyState

```typescript
// libs/shared/ui/src/feedback/empty-state.tsx
interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

// Example
<EmptyState
  icon={<TradeIcon />}
  title="No trades yet"
  description="Your trade history will appear here once you start trading"
  action={{ label: 'Start Trading', onClick: () => navigate('/trade') }}
/>
```

### 9.2 LoadingState

```typescript
// libs/shared/ui/src/feedback/loading-state.tsx
interface LoadingStateProps {
  type?: 'spinner' | 'skeleton' | 'dots';
  message?: string;
  fullScreen?: boolean;
}
```

### 9.3 ErrorState

```typescript
// libs/shared/ui/src/feedback/error-state.tsx
interface ErrorStateProps {
  title?: string;
  message: string;
  retry?: {
    label?: string;
    onClick: () => void;
  };
}
```

---

## 10. Utility Components

### 10.1 Badge

```typescript
// libs/shared/ui/src/ui/badge.tsx
interface BadgeProps {
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}
```

### 10.2 Avatar

```typescript
// libs/shared/ui/src/ui/avatar.tsx
interface AvatarProps {
  src?: string;
  alt?: string;
  fallback?: string; // Initials or name
  size?: 'sm' | 'md' | 'lg' | 'xl';
}
```

### 10.3 Skeleton

```typescript
// libs/shared/ui/src/ui/skeleton.tsx
interface SkeletonProps {
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
  animation?: 'pulse' | 'wave' | 'none';
}
```

---

## 11. Component Composition

### 11.1 Page Shell Pattern

```tsx
// Common page structure
<DashboardLayout>
  <PageHeader title="Trading" subtitle="Execute and manage trades" />
  <PageContent>
    <StatsGrid>
      <StatsCard {...stats1} />
      <StatsCard {...stats2} />
    </StatsGrid>
    <Card>
      <TradeForm symbol="EURUSD" onSubmit={handleTrade} />
    </Card>
    <Card title="Open Positions">
      <PositionList positions={positions} />
    </Card>
  </PageContent>
</DashboardLayout>
```

### 11.2 Form Field Composition

```tsx
// Form field with label, input, and error
<FormField>
  <FormLabel required>Email</FormLabel>
  <Input type="email" {...field} />
  <FormError>{errors.email?.message}</FormError>
</FormField>
```

---

## 12. Accessibility Requirements

All components MUST:
- Have proper ARIA attributes
- Support keyboard navigation
- Have visible focus indicators
- Support screen readers
- Have sufficient color contrast (4.5:1)

```tsx
// Example: Accessible Button
<button
  aria-busy={loading}
  aria-disabled={disabled}
  aria-label={ariaLabel}
  role="button"
  tabIndex={disabled ? -1 : 0}
>
  {loading ? <Spinner aria-hidden="true" /> : children}
</button>
```

---

*End of Component Definitions Layer Specification*
