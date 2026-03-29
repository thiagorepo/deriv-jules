# UXA: User Experience Analysis

> **Spec ID:** UXA-001
> **Version:** 1.0.0
> **Status:** DRAFT
> **Last Updated:** 2026-03-28

---

## 1. Overview

This specification analyzes user experience requirements, interaction patterns, and accessibility standards for the Deriv Jules multi-tenant trading platform.

---

## 2. User Personas

### 2.1 End User (Trader)

| Attribute | Description |
|-----------|-------------|
| **Role** | Active trader using Deriv API |
| **Goals** | Execute trades, monitor positions, manage account |
| **Pain Points** | Complex interfaces, slow feedback, unclear trade status |
| **Tech Savviness** | Medium to high |
| **Devices** | Desktop primary, mobile secondary |

### 2.2 Administrator

| Attribute | Description |
|-----------|-------------|
| **Role** | Platform administrator |
| **Goals** | Manage users, products, plans, settings |
| **Pain Points** | Limited visibility, manual processes |
| **Tech Savviness** | Medium |
| **Devices** | Desktop only |

### 2.3 Developer

| Attribute | Description |
|-----------|-------------|
| **Role** | Platform developer/maintainer |
| **Goals** | Onboard new tenants, maintain codebase |
| **Pain Points** | Unclear architecture, poor documentation |
| **Tech Savviness** | High |
| **Devices** | Desktop only |

---

## 3. User Journeys

### 3.1 Authentication Flow

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Landing   │───►│    Login    │───►│  Dashboard  │
│    Page     │    │    Form     │    │    Home     │
└─────────────┘    └─────────────┘    └─────────────┘
                          │
                          ▼
                   ┌─────────────┐
                   │   Register  │
                   │    Form     │
                   └─────────────┘
```

**Requirements:**
- Single-click login via Supabase Auth
- Password reset flow
- Session persistence
- Role-based redirect (user → dashboard, admin → admin panel)

### 3.2 Trading Flow

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Select    │───►│  Configure  │───►│   Confirm   │
│   Market    │    │   Trade     │    │   & Buy     │
└─────────────┘    └─────────────┘    └─────────────┘
                                            │
                                            ▼
                                     ┌─────────────┐
                                     │  Position   │
                                     │  Tracking   │
                                     └─────────────┘
```

**Requirements:**
- Real-time price updates via WebSocket
- Trade configuration validation
- Clear profit/loss indicators
- Position status visibility

### 3.3 Admin Management Flow

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Admin     │───►│   Select    │───►│   CRUD      │
│   Dashboard │    │   Entity    │    │   Actions   │
└─────────────┘    └─────────────┘    └─────────────┘
```

---

## 4. Interaction Patterns

### 4.1 Feedback Mechanisms

| Action | Feedback Type | Timing |
|--------|--------------|--------|
| Button click | Visual + Haptic | Immediate |
| Form submission | Loading state + Toast | < 100ms |
| Trade execution | Real-time status | < 500ms |
| Error | Toast + Inline | Immediate |
| Success | Toast + Animation | 300ms |

### 4.2 Loading States

```typescript
// Skeleton screens for content loading
interface LoadingState {
  type: 'skeleton' | 'spinner' | 'progress';
  message?: string;
  progress?: number;
}

// Skeleton for trade list
const TradeListSkeleton = () => (
  <div className="space-y-4">
    {[1, 2, 3].map((i) => (
      <div key={i} className="animate-pulse flex space-x-4">
        <div className="h-12 w-12 bg-gray-200 rounded" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-200 rounded w-3/4" />
          <div className="h-4 bg-gray-200 rounded w-1/2" />
        </div>
      </div>
    ))}
  </div>
);
```

### 4.3 Error Handling UX

```typescript
// Error boundary fallback
interface ErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

// Inline error messages
interface FieldErrorProps {
  message: string;
  field: string;
}

// Toast notifications
interface ToastProps {
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
}
```

---

## 5. Accessibility Standards

### 5.1 WCAG 2.1 AA Compliance

| Criterion | Implementation |
|-----------|---------------|
| **Color Contrast** | 4.5:1 for normal text, 3:1 for large text |
| **Focus Indicators** | Visible focus rings on all interactive elements |
| **Keyboard Navigation** | Full keyboard accessibility |
| **Screen Reader** | ARIA labels, live regions |
| **Text Scaling** | Support up to 200% zoom |

### 5.2 Keyboard Navigation

```typescript
// Keyboard shortcuts
const shortcuts = {
  'Mod+K': 'Open command palette',
  'Mod+/': 'Open help',
  'Escape': 'Close modal/dropdown',
  'Tab': 'Next focusable element',
  'Shift+Tab': 'Previous focusable element',
  'Enter': 'Activate button/link',
  'Space': 'Toggle checkbox/button',
};

// Focus trap for modals
const FocusTrap = ({ children }) => {
  // Implementation traps focus within modal
};
```

### 5.3 ARIA Implementation

```tsx
// Button with loading state
<button
  aria-busy={loading}
  aria-disabled={disabled || loading}
  aria-label={ariaLabel}
>
  {loading ? <Spinner aria-hidden="true" /> : children}
</button>

// Live region for announcements
<div role="status" aria-live="polite" className="sr-only">
  {announcement}
</div>

// Table with proper structure
<table role="grid" aria-label="Trade history">
  <thead>
    <tr>
      <th scope="col">Symbol</th>
      <th scope="col">Type</th>
      <th scope="col">Status</th>
    </tr>
  </thead>
  <tbody>
    {trades.map((trade) => (
      <tr key={trade.id}>
        <td>{trade.symbol}</td>
        <td>{trade.type}</td>
        <td>{trade.status}</td>
      </tr>
    ))}
  </tbody>
</table>
```

---

## 6. Responsive Design

### 6.1 Breakpoints

| Breakpoint | Width | Target |
|------------|-------|--------|
| `sm` | 640px | Mobile landscape |
| `md` | 768px | Tablet portrait |
| `lg` | 1024px | Tablet landscape |
| `xl` | 1280px | Desktop |
| `2xl` | 1536px | Large desktop |

### 6.2 Layout Patterns

```css
/* Responsive sidebar */
.sidebar {
  @apply fixed inset-y-0 left-0 w-64 transform -translate-x-full
         transition-transform duration-300 lg:translate-x-0 lg:static;
}

.sidebar.open {
  @apply translate-x-0;
}

/* Responsive grid */
.dashboard-grid {
  @apply grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4;
}

/* Mobile-first component */
.trade-card {
  @apply p-4 rounded-lg shadow-sm
         sm:p-6 sm:rounded-xl
         lg:p-8;
}
```

---

## 7. Visual Hierarchy

### 7.1 Typography Scale

| Level | Size | Weight | Use Case |
|-------|------|--------|----------|
| H1 | 2.25rem | 700 | Page titles |
| H2 | 1.875rem | 600 | Section headers |
| H3 | 1.5rem | 600 | Subsection headers |
| H4 | 1.25rem | 500 | Card titles |
| Body | 1rem | 400 | Body text |
| Small | 0.875rem | 400 | Captions, labels |

### 7.2 Spacing Scale

| Token | Value | Use Case |
|-------|-------|----------|
| `space-1` | 0.25rem | Tight spacing |
| `space-2` | 0.5rem | Default small |
| `space-4` | 1rem | Default medium |
| `space-6` | 1.5rem | Default large |
| `space-8` | 2rem | Section spacing |

### 7.3 Color Semantics

| Color | Semantic Meaning | Use Case |
|-------|-----------------|----------|
| Blue | Primary action | Buttons, links |
| Green | Success/Profit | Positive trades, confirmations |
| Red | Error/Loss | Failed trades, errors |
| Yellow | Warning | Caution states |
| Gray | Neutral | Secondary elements |

---

## 8. Micro-interactions

### 8.1 Animation Guidelines

```typescript
// Transition durations
const transitions = {
  fast: '150ms',
  normal: '300ms',
  slow: '500ms',
};

// Easing functions
const easing = {
  default: 'cubic-bezier(0.4, 0, 0.2, 1)',
  in: 'cubic-bezier(0.4, 0, 1, 1)',
  out: 'cubic-bezier(0, 0, 0.2, 1)',
  bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
};

// Hover effects
const buttonHover = {
  scale: 1.02,
  shadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
  transition: 'all 150ms ease-out',
};
```

### 8.2 Feedback Animations

```tsx
// Success animation
const SuccessCheckmark = () => (
  <svg className="animate-success" viewBox="0 0 24 24">
    <path className="stroke-green-500" d="M5 13l4 4L19 7" />
  </svg>
);

// Trade execution pulse
const TradePulse = () => (
  <div className="animate-pulse-ring">
    {/* Pulse ring animation on trade execution */}
  </div>
);
```

---

## 9. Form UX Patterns

### 9.1 Validation Feedback

```tsx
// Real-time validation
interface FieldValidation {
  isValid: boolean;
  message?: string;
  show: boolean; // Only show after blur or submit
}

// Password strength indicator
const PasswordStrength = ({ password }: { password: string }) => {
  const strength = calculateStrength(password);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4].map((level) => (
        <div
          key={level}
          className={cn(
            'h-1 flex-1 rounded',
            strength >= level ? 'bg-green-500' : 'bg-gray-200'
          )}
        />
      ))}
    </div>
  );
};
```

### 9.2 Input Patterns

```tsx
// Auto-formatting
const CurrencyInput = ({ value, onChange }) => {
  // Auto-format to 2 decimal places
  // Show currency symbol
  // Validate min/max
};

// Search with debounce
const SearchInput = ({ onSearch }) => {
  const debouncedSearch = useDebounce(onSearch, 300);
  // Show loading state while searching
  // Highlight matching text in results
};
```

---

## 10. Toast & Notification System

### 10.1 Toast Types

```typescript
interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  description?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

// Usage
toast.success('Trade executed', {
  description: 'Your CALL contract has been purchased',
  action: { label: 'View', onClick: () => navigate('/positions') }
});

toast.error('Connection lost', {
  description: 'Reconnecting to Deriv API...',
  duration: Infinity // Persistent until resolved
});
```

### 10.2 Position & Stacking

- Position: Top-right corner
- Max visible: 3 toasts
- Stacking: New toasts push old ones down
- Dismiss: Auto-dismiss after duration, manual dismiss on click

---

## 11. Empty States

### 11.1 Patterns

```tsx
// No trades yet
const NoTradesState = () => (
  <EmptyState
    icon={<TradeIcon />}
    title="No trades yet"
    description="Your trade history will appear here"
    action={{ label: 'Start Trading', onClick: () => navigate('/trade') }}
  />
);

// No search results
const NoResultsState = ({ query }: { query: string }) => (
  <EmptyState
    icon={<SearchIcon />}
    title={`No results for "${query}"`}
    description="Try adjusting your search terms"
  />
);
```

---

## 12. Performance UX

### 12.1 Perceived Performance

| Technique | Implementation |
|-----------|---------------|
| **Optimistic UI** | Update UI before API response |
| **Skeleton screens** | Show structure while loading |
| **Progressive loading** | Load critical content first |
| **Prefetching** | Prefetch likely next pages |
| **Debouncing** | Reduce API calls on input |

### 12.2 Optimistic Updates

```typescript
// Trade execution with optimistic update
const executeTrade = async (params: TradeParams) => {
  // 1. Optimistically update UI
  const tempId = `temp-${Date.now()}`;
  addPosition({ id: tempId, ...params, status: 'pending' });

  try {
    // 2. Execute actual trade
    const result = await derivApi.buyContract(params);

    // 3. Update with real data
    updatePosition(tempId, result);
  } catch (error) {
    // 4. Revert on failure
    removePosition(tempId);
    toast.error('Trade failed');
  }
};
```

---

*End of User Experience Analysis Specification*
