# STM: State Management Specification

> **Spec ID:** STM-001
> **Version:** 1.0.0
> **Status:** DRAFT
> **Last Updated:** 2026-03-28

---

## 1. Overview

This specification defines state management patterns for the Deriv Jules platform, including client state (Zustand), server state (React Query), and real-time state management.

---

## 2. State Architecture

### 2.1 State Categories

```
┌─────────────────────────────────────────────────────────────────┐
│                     STATE ARCHITECTURE                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────┐   ┌─────────────────┐   ┌──────────────┐ │
│  │  Server State   │   │  Client State   │   │ Session State│ │
│  │  (React Query)  │   │   (Zustand)     │   │  (Cookies)   │ │
│  └─────────────────┘   └─────────────────┘   └──────────────┘ │
│         │                      │                     │         │
│         │                      │                     │         │
│         ▼                      ▼                     ▼         │
│  ┌─────────────────┐   ┌─────────────────┐   ┌──────────────┐ │
│  │ - Users         │   │ - UI preferences│   │ - Auth token │ │
│  │ - Trades        │   │ - Sidebar state │   │ - Theme      │ │
│  │ - Positions     │   │ - Modals        │   │ - Locale     │ │
│  │ - Products      │   │ - Notifications │   │              │ │
│  │ - Plans         │   │ - Trade form    │   │              │ │
│  └─────────────────┘   └─────────────────┘   └──────────────┘ │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 2.2 Tool Selection

| State Type | Tool | Use Case |
|------------|------|----------|
| Server State | React Query | API data, caching, synchronization |
| Client State | Zustand | UI state, form state, preferences |
| Session State | Cookies | Auth tokens, persistent preferences |
| Real-time State | DerivAPI + Zustand | WebSocket data, live updates |

---

## 3. Server State (React Query)

### 3.1 Query Client Configuration

```typescript
// libs/shared/queries/src/lib/query-client.ts
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30 * 1000, // 30 seconds
      gcTime: 5 * 60 * 1000, // 5 minutes
      retry: 3,
      retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 30000),
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 1,
    },
  },
});
```

### 3.2 Query Hooks

#### User Queries

```typescript
// libs/shared/queries/src/lib/use-user.ts
export function useProfile(userId?: string) {
  return useQuery({
    queryKey: ['profile', userId],
    queryFn: () => profilesRepo.findById(userId!),
    enabled: !!userId,
    staleTime: 60 * 1000, // 1 minute
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ProfileUpdate) => profilesRepo.update(data),
    onSuccess: (data) => {
      queryClient.setQueryData(['profile', data.user_id], data);
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
}
```

#### Trading Queries

```typescript
// libs/shared/queries/src/lib/use-trades.ts
export function useTrades(filters?: TradeFilter) {
  return useQuery({
    queryKey: ['trades', filters],
    queryFn: () => tradesApi.getTrades(filters),
    staleTime: 30 * 1000, // 30 seconds
  });
}

export function usePositions(status?: 'open' | 'closed') {
  return useQuery({
    queryKey: ['positions', status],
    queryFn: () => tradesApi.getPositions(status),
    staleTime: 10 * 1000, // 10 seconds (more frequent for open positions)
    refetchInterval: status === 'open' ? 5000 : false, // Poll for open positions
  });
}
```

#### Admin Queries

```typescript
// libs/shared/queries/src/lib/use-admin.ts
export function useUsers(params: UserQueryParams) {
  return useQuery({
    queryKey: ['admin', 'users', params],
    queryFn: () => adminApi.getUsers(params),
  });
}

export function useProducts() {
  return useQuery({
    queryKey: ['admin', 'products'],
    queryFn: () => adminApi.getProducts(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function usePlans() {
  return useQuery({
    queryKey: ['admin', 'plans'],
    queryFn: () => adminApi.getPlans(),
    staleTime: 5 * 60 * 1000,
  });
}
```

### 3.3 Mutation Hooks

```typescript
// libs/shared/queries/src/lib/use-trade-mutations.ts
export function useBuyContract() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: BuyContractParams) => derivApi.buyContract(params),
    onMutate: async (params) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: ['positions'] });
      const previousPositions = queryClient.getQueryData(['positions', 'open']);

      queryClient.setQueryData(['positions', 'open'], (old) => [
        ...old,
        { id: 'temp', ...params, status: 'pending' }
      ]);

      return { previousPositions };
    },
    onError: (err, params, context) => {
      // Rollback on error
      queryClient.setQueryData(['positions', 'open'], context.previousPositions);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['positions'] });
      queryClient.invalidateQueries({ queryKey: ['balance'] });
    },
  });
}

export function useSellContract() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: SellContractParams) => derivApi.sellContract(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['positions'] });
      queryClient.invalidateQueries({ queryKey: ['trades'] });
      queryClient.invalidateQueries({ queryKey: ['balance'] });
    },
  });
}
```

### 3.4 Query Keys Factory

```typescript
// libs/shared/queries/src/lib/keys.ts
export const queryKeys = {
  // User
  profile: (userId: string) => ['profile', userId] as const,
  currentUser: () => ['profile', 'current'] as const,

  // Trading
  trades: (filters?: TradeFilter) => ['trades', filters] as const,
  positions: (status?: 'open' | 'closed') => ['positions', status] as const,
  balance: () => ['balance'] as const,

  // Admin
  adminUsers: (params: UserQueryParams) => ['admin', 'users', params] as const,
  adminProducts: () => ['admin', 'products'] as const,
  adminPlans: () => ['admin', 'plans'] as const,

  // Market Data
  markets: () => ['markets'] as const,
  ticks: (symbol: string) => ['ticks', symbol] as const,
};
```

---

## 4. Client State (Zustand)

### 4.1 Auth Store

```typescript
// libs/shared/stores/src/lib/auth-store.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  user: AuthUser | null;
  loading: boolean;
  error: Error | null;

  // Actions
  setUser: (user: AuthUser | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: Error | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      loading: false,
      error: null,

      setUser: (user) => set({ user, error: null }),
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),
      logout: () => set({ user: null, error: null }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user }),
    }
  )
);
```

### 4.2 UI Store

```typescript
// libs/shared/stores/src/lib/ui-store.ts
interface UIState {
  // Sidebar
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;

  // Modals
  activeModal: string | null;
  modalData: Record<string, unknown>;
  openModal: (id: string, data?: Record<string, unknown>) => void;
  closeModal: () => void;

  // Notifications
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
  clearToasts: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarCollapsed: false,
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),

  activeModal: null,
  modalData: {},
  openModal: (id, data = {}) => set({ activeModal: id, modalData: data }),
  closeModal: () => set({ activeModal: null, modalData: {} }),

  toasts: [],
  addToast: (toast) => set((state) => ({
    toasts: [...state.toasts, { ...toast, id: crypto.randomUUID() }]
  })),
  removeToast: (id) => set((state) => ({
    toasts: state.toasts.filter((t) => t.id !== id)
  })),
  clearToasts: () => set({ toasts: [] }),
}));
```

### 4.3 Trading Store

```typescript
// libs/shared/stores/src/lib/trading-store.ts
interface TradingState {
  // Form state
  selectedSymbol: string | null;
  tradeType: ContractType;
  stake: number;
  duration: number;
  durationUnit: DurationUnit;

  // Form actions
  setSelectedSymbol: (symbol: string) => void;
  setTradeType: (type: ContractType) => void;
  setStake: (stake: number) => void;
  setDuration: (duration: number, unit: DurationUnit) => void;
  resetForm: () => void;

  // Real-time data
  currentPrice: number | null;
  priceHistory: Tick[];
  setCurrentPrice: (price: number) => void;
  addTick: (tick: Tick) => void;
}

const defaultTradeState = {
  selectedSymbol: null,
  tradeType: 'CALL' as ContractType,
  stake: 10,
  duration: 5,
  durationUnit: 'm' as DurationUnit,
  currentPrice: null,
  priceHistory: [],
};

export const useTradingStore = create<TradingState>((set) => ({
  ...defaultTradeState,

  setSelectedSymbol: (symbol) => set({ selectedSymbol: symbol, priceHistory: [] }),
  setTradeType: (type) => set({ tradeType: type }),
  setStake: (stake) => set({ stake }),
  setDuration: (duration, unit) => set({ duration, durationUnit: unit }),
  resetForm: () => set(defaultTradeState),

  setCurrentPrice: (price) => set({ currentPrice: price }),
  addTick: (tick) => set((state) => ({
    priceHistory: [...state.priceHistory.slice(-99), tick], // Keep last 100
    currentPrice: tick.quote,
  })),
}));
```

### 4.4 Positions Store (Real-time)

```typescript
// libs/shared/stores/src/lib/positions-store.ts
interface PositionsState {
  positions: Position[];

  // Actions
  setPositions: (positions: Position[]) => void;
  addPosition: (position: Position) => void;
  updatePosition: (id: string, data: Partial<Position>) => void;
  removePosition: (id: string) => void;

  // Real-time updates
  subscribeToUpdates: () => () => void;
}

export const usePositionsStore = create<PositionsState>((set, get) => ({
  positions: [],

  setPositions: (positions) => set({ positions }),
  addPosition: (position) => set((state) => ({
    positions: [...state.positions, position]
  })),
  updatePosition: (id, data) => set((state) => ({
    positions: state.positions.map((p) =>
      p.contract_id === id ? { ...p, ...data } : p
    )
  })),
  removePosition: (id) => set((state) => ({
    positions: state.positions.filter((p) => p.contract_id !== id)
  })),

  subscribeToUpdates: () => {
    const api = DerivAPI.getInstance();

    // Subscribe to profit updates
    const unsubscribe = api.subscribe('profit', (data) => {
      const { updatePosition } = get();
      updatePosition(data.contract_id, {
        profit: data.profit,
        current_price: data.current_price,
      });
    });

    return unsubscribe;
  },
}));
```

---

## 5. Real-time State Management

### 5.1 WebSocket Integration

```typescript
// libs/shared/realtime/src/lib/deriv-sync.ts
export class DerivSync {
  private api: DerivAPI;
  private subscriptions: Map<string, () => void> = new Map();

  constructor(api: DerivAPI) {
    this.api = api;
  }

  // Subscribe to ticks
  subscribeToTicks(symbol: string, callback: (tick: Tick) => void) {
    const key = `ticks:${symbol}`;

    if (this.subscriptions.has(key)) {
      return this.subscriptions.get(key)!;
    }

    // Send subscribe request
    this.api.send({ ticks: symbol, subscribe: 1 });

    // Listen for updates
    const unsubscribe = this.api.subscribe('tick', (data) => {
      if (data.tick?.symbol === symbol) {
        callback(data.tick);
      }
    });

    this.subscriptions.set(key, unsubscribe);
    return unsubscribe;
  }

  // Subscribe to balance updates
  subscribeToBalance(callback: (balance: Balance) => void) {
    this.api.send({ balance: 1, subscribe: 1 });

    return this.api.subscribe('balance', (data) => {
      callback(data.balance);
    });
  }

  // Subscribe to portfolio updates
  subscribeToPortfolio(callback: (portfolio: Portfolio) => void) {
    this.api.send({ portfolio: 1, subscribe: 1 });

    return this.api.subscribe('portfolio', (data) => {
      callback(data.portfolio);
    });
  }

  // Cleanup all subscriptions
  unsubscribeAll() {
    this.subscriptions.forEach((unsubscribe) => unsubscribe());
    this.subscriptions.clear();
  }
}
```

### 5.2 React Hook Integration

```typescript
// libs/shared/realtime/src/lib/use-ticks.ts
export function useTicks(symbol: string | null) {
  const [tick, setTick] = useState<Tick | null>(null);
  const [history, setHistory] = useState<Tick[]>([]);

  useEffect(() => {
    if (!symbol) return;

    const sync = new DerivSync(DerivAPI.getInstance());

    const unsubscribe = sync.subscribeToTicks(symbol, (newTick) => {
      setTick(newTick);
      setHistory((prev) => [...prev.slice(-99), newTick]);
    });

    return () => {
      unsubscribe();
    };
  }, [symbol]);

  return { tick, history };
}

// libs/shared/realtime/src/lib/use-balance.ts
export function useBalance() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const sync = new DerivSync(DerivAPI.getInstance());

    const unsubscribe = sync.subscribeToBalance((balance) => {
      queryClient.setQueryData(['balance'], balance);
    });

    return unsubscribe;
  }, [queryClient]);

  return useQuery({ queryKey: ['balance'], enabled: false });
}
```

---

## 6. State Synchronization

### 6.1 Server-Client Sync

```typescript
// Sync positions from Deriv API to local state
export function usePositionSync() {
  const { setPositions, updatePosition } = usePositionsStore();
  const queryClient = useQueryClient();

  useEffect(() => {
    const api = DerivAPI.getInstance();

    // Initial fetch
    api.send({ portfolio: 1 }).then((response) => {
      setPositions(response.portfolio.contracts);
    });

    // Subscribe to updates
    const unsubscribe = api.subscribe('portfolio', (data) => {
      if (data.portfolio?.contracts) {
        setPositions(data.portfolio.contracts);
      }
    });

    return unsubscribe;
  }, [setPositions]);

  // Also sync to React Query cache
  useEffect(() => {
    const unsubscribe = usePositionsStore.subscribe(
      (state) => state.positions,
      (positions) => {
        queryClient.setQueryData(['positions', 'open'],
          positions.filter((p) => p.status === 'open')
        );
        queryClient.setQueryData(['positions', 'closed'],
          positions.filter((p) => p.status !== 'open')
        );
      }
    );

    return unsubscribe;
  }, [queryClient]);
}
```

### 6.2 Offline Handling

```typescript
// libs/shared/stores/src/lib/offline-store.ts
interface OfflineState {
  isOnline: boolean;
  pendingActions: PendingAction[];

  addPendingAction: (action: PendingAction) => void;
  removePendingAction: (id: string) => void;
  flushPendingActions: () => Promise<void>;
}

export const useOfflineStore = create<OfflineState>((set, get) => ({
  isOnline: navigator.onLine,
  pendingActions: [],

  addPendingAction: (action) => set((state) => ({
    pendingActions: [...state.pendingActions, action]
  })),

  removePendingAction: (id) => set((state) => ({
    pendingActions: state.pendingActions.filter((a) => a.id !== id)
  })),

  flushPendingActions: async () => {
    const { pendingActions, removePendingAction } = get();

    for (const action of pendingActions) {
      try {
        await action.execute();
        removePendingAction(action.id);
      } catch (error) {
        console.error('Failed to flush action:', action.id, error);
      }
    }
  },
}));

// Listen for online/offline events
window.addEventListener('online', () => {
  useOfflineStore.setState({ isOnline: true });
  useOfflineStore.getState().flushPendingActions();
});

window.addEventListener('offline', () => {
  useOfflineStore.setState({ isOnline: false });
});
```

---

## 7. Persistence

### 7.1 LocalStorage Persistence

```typescript
// Zustand persist middleware
export const usePreferencesStore = create<PreferencesState>()(
  persist(
    (set) => ({
      theme: 'system',
      sidebarCollapsed: false,
      language: 'en',

      setTheme: (theme) => set({ theme }),
      toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      setLanguage: (language) => set({ language }),
    }),
    {
      name: 'preferences',
      version: 1,
    }
  )
);
```

### 7.2 Session Storage

```typescript
// For temporary session data
export const useSessionStore = create<SessionState>()(
  persist(
    (set) => ({
      returnUrl: null,
      lastVisitedPage: null,

      setReturnUrl: (url) => set({ returnUrl: url }),
      setLastVisitedPage: (page) => set({ lastVisitedPage: page }),
    }),
    {
      name: 'session',
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);
```

---

## 8. DevTools Integration

```typescript
// Enable Redux DevTools for Zustand
import { devtools } from 'zustand/middleware';

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set) => ({
        // ... state and actions
      }),
      { name: 'auth-storage' }
    ),
    { name: 'AuthStore' }
  )
);

// React Query DevTools
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      {/* App content */}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
```

---

*End of State Management Specification*
