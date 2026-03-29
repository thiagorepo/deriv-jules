# DBL: Data Layer Specification

> **Spec ID:** DBL-001
> **Version:** 1.0.0
> **Status:** DRAFT
> **Last Updated:** 2026-03-28

---

## 1. Overview

The data layer consists of two primary data sources:
1. **Supabase** - PostgreSQL database for application data
2. **Deriv API** - WebSocket API for trading operations

### Data Flow Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                       APPLICATION                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────┐        ┌─────────────────┐            │
│  │   Supabase      │        │   Deriv API     │            │
│  │   Client        │        │   Client        │            │
│  │   (@org/supabase)│        │   (@org/deriv-api)│          │
│  └────────┬────────┘        └────────┬────────┘            │
│           │                          │                      │
└───────────┼──────────────────────────┼──────────────────────┘
            │                          │
            ▼                          ▼
    ┌───────────────┐          ┌───────────────┐
    │  PostgreSQL   │          │  Deriv WS v3  │
    │  (Supabase)   │          │  wss://ws...  │
    └───────────────┘          └───────────────┘
```

---

## 2. Supabase Data Layer

### 2.1 Connection Management

```typescript
// libs/shared/supabase/src/lib/client.ts
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Browser client singleton
let browserClient: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient {
  if (!browserClient) {
    browserClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }
  return browserClient;
}

// Server client (for SSR/API routes)
export function getServerClient(): SupabaseClient {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}
```

### 2.2 Database Schema

#### Existing Tables

```sql
-- User roles (RBAC)
CREATE TABLE user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id)
);

-- User profiles
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  tenant_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id)
);

-- Role enum
CREATE TYPE app_role AS ENUM ('admin', 'user');
```

#### Aspirational Tables (from docs/specifications.md)

| Table | Purpose | Priority |
|-------|---------|----------|
| `trading_accounts` | User trading accounts | High |
| `trades` | Trade history | High |
| `positions` | Open positions | High |
| `markets` | Available markets | High |
| `products` | Trading products | Medium |
| `plans` | Subscription plans | Medium |
| `subscriptions` | User subscriptions | Medium |
| `transactions` | Financial transactions | Medium |
| `signals` | Trading signals | Low |
| `copy_trades` | Copy trading config | Low |

### 2.3 Repository Pattern

```typescript
// libs/shared/supabase/src/lib/repositories/base.ts
export interface Repository<T> {
  findAll(filters?: Record<string, any>): Promise<T[]>;
  findById(id: string): Promise<T | null>;
  create(data: Partial<T>): Promise<T>;
  update(id: string, data: Partial<T>): Promise<T>;
  delete(id: string): Promise<void>;
}

// libs/shared/supabase/src/lib/repositories/profiles.ts
export class ProfilesRepository implements Repository<Profile> {
  constructor(private client: SupabaseClient) {}

  async findById(userId: string): Promise<Profile | null> {
    const { data, error } = await this.client
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) throw error;
    return data;
  }

  async create(data: Partial<Profile>): Promise<Profile> {
    const { data: profile, error } = await this.client
      .from('profiles')
      .insert(data)
      .select()
      .single();

    if (error) throw error;
    return profile;
  }

  // ... other methods
}
```

### 2.4 RLS Policies

```sql
-- Profiles: Users can only see their own profile
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- Admin: Full access via is_admin() function
CREATE POLICY "Admins have full access"
  ON profiles FOR ALL
  USING (is_admin());
```

### 2.5 Real-time Subscriptions

```typescript
// libs/shared/supabase/src/lib/realtime.ts
export function subscribeToTable<T>(
  table: string,
  callback: (payload: T) => void
) {
  const client = getSupabaseClient();

  return client
    .channel(`public:${table}`)
    .on('postgres_changes', { event: '*', schema: 'public', table }, callback)
    .subscribe();
}

// Usage
const subscription = subscribeToTable<Trade>('trades', (payload) => {
  if (payload.eventType === 'INSERT') {
    // Handle new trade
  }
});

// Cleanup
subscription.unsubscribe();
```

---

## 3. Deriv API Data Layer

### 3.1 WebSocket Client

```typescript
// libs/shared/deriv-api/src/lib/deriv-api.ts
export interface DerivConfig {
  appId: string;
  endpoint?: string;
  language?: string;
}

export interface DerivResponse {
  msg_type: string;
  [key: string]: any;
}

export class DerivAPI {
  private static instance: DerivAPI;
  private ws: WebSocket | null = null;
  private requestId = 0;
  private pendingRequests = new Map<number, {
    resolve: Function;
    reject: Function;
  }>();
  private listeners = new Map<string, Set<Function>>();
  private config: DerivConfig | null = null;

  static getInstance(): DerivAPI {
    if (!DerivAPI.instance) {
      DerivAPI.instance = new DerivAPI();
    }
    return DerivAPI.instance;
  }

  connect(appId: string, endpoint = 'wss://ws.derivws.com/websockets/v3') {
    this.config = { appId, endpoint };
    this.ws = new WebSocket(`${endpoint}?app_id=${appId}`);
    this.setupListeners();
  }

  private setupListeners() {
    if (!this.ws) return;

    this.ws.onopen = () => {
      console.log('Deriv API connected');
      this.notify('connect', {});
    };

    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data);

      // Handle request responses
      if (data.req_id && this.pendingRequests.has(data.req_id)) {
        const { resolve } = this.pendingRequests.get(data.req_id)!;
        this.pendingRequests.delete(data.req_id);
        resolve(data);
      }

      // Handle streaming updates
      if (data.msg_type) {
        this.notify(data.msg_type, data);
      }
    };

    this.ws.onclose = () => {
      console.log('Deriv API disconnected');
      this.notify('disconnect', {});
      // Auto-reconnect
      setTimeout(() => {
        if (this.config) {
          this.connect(this.config.appId, this.config.endpoint);
        }
      }, 5000);
    };

    this.ws.onerror = (error) => {
      console.error('Deriv API error:', error);
      this.notify('error', error);
    };
  }

  async send<T>(request: object): Promise<T> {
    return new Promise((resolve, reject) => {
      if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
        reject(new Error('WebSocket not connected'));
        return;
      }

      const reqId = ++this.requestId;
      this.pendingRequests.set(reqId, { resolve, reject });

      this.ws.send(JSON.stringify({ ...request, req_id: reqId }));

      // Timeout after 30s
      setTimeout(() => {
        if (this.pendingRequests.has(reqId)) {
          this.pendingRequests.delete(reqId);
          reject(new Error('Request timeout'));
        }
      }, 30000);
    });
  }

  subscribe(msgType: string, callback: Function): () => void {
    if (!this.listeners.has(msgType)) {
      this.listeners.set(msgType, new Set());
    }
    this.listeners.get(msgType)!.add(callback);

    // Return unsubscribe function
    return () => {
      this.listeners.get(msgType)?.delete(callback);
    };
  }

  private notify(msgType: string, data: any) {
    this.listeners.get(msgType)?.forEach(cb => cb(data));
  }

  disconnect() {
    this.ws?.close();
    this.ws = null;
  }
}
```

### 3.2 API Operations

#### Authorization

```typescript
// Authorize with API token
async function authorize(apiToken: string): Promise<DerivResponse> {
  const api = DerivAPI.getInstance();
  return api.send({
    authorize: apiToken
  });
}
```

#### Market Data

```typescript
// Get active symbols
async function getActiveSymbols(): Promise<DerivResponse> {
  const api = DerivAPI.getInstance();
  return api.send({
    active_symbols: 'brief',
    product_type: 'basic'
  });
}

// Subscribe to ticks
async function subscribeTicks(symbol: string, callback: (tick: Tick) => void) {
  const api = DerivAPI.getInstance();

  // Initial request
  await api.send({
    ticks: symbol,
    subscribe: 1
  });

  // Subscribe to updates
  return api.subscribe('tick', (data) => {
    if (data.tick?.symbol === symbol) {
      callback(data.tick);
    }
  });
}
```

#### Trading

```typescript
// Buy contract
async function buyContract(params: BuyParams): Promise<DerivResponse> {
  const api = DerivAPI.getInstance();
  return api.send({
    buy: 1,
    price: params.stake,
    parameters: {
      amount: params.stake,
      basis: 'stake',
      contract_type: params.type,
      currency: 'USD',
      duration: params.duration,
      duration_unit: params.durationUnit,
      symbol: params.symbol
    }
  });
}

// Sell contract
async function sellContract(contractId: string, price: number): Promise<DerivResponse> {
  const api = DerivAPI.getInstance();
  return api.send({
    sell: contractId,
    price: price
  });
}
```

#### Portfolio

```typescript
// Get open contracts
async function getPortfolio(): Promise<DerivResponse> {
  const api = DerivAPI.getInstance();
  return api.send({
    portfolio: 1
  });
}

// Subscribe to profit/loss updates
async function subscribeProfit(callback: (profit: Profit) => void) {
  const api = DerivAPI.getInstance();

  await api.send({
    profit_table: 1,
    subscribe: 1
  });

  return api.subscribe('profit', callback);
}
```

### 3.3 Error Handling

```typescript
// libs/shared/deriv-api/src/lib/errors.ts
export class DerivAPIError extends Error {
  constructor(
    public code: string,
    message: string,
    public details?: any
  ) {
    super(message);
    this.name = 'DerivAPIError';
  }
}

export function handleDerivError(response: DerivResponse): void {
  if (response.error) {
    throw new DerivAPIError(
      response.error.code,
      response.error.message,
      response.error.details
    );
  }
}

// Error codes
export enum DerivErrorCode {
  INVALID_TOKEN = 'InvalidToken',
  MARKET_CLOSED = 'MarketClosed',
  INSUFFICIENT_FUNDS = 'InsufficientFunds',
  CONTRACT_UNAVAILABLE = 'ContractUnavailable',
  RATE_LIMIT = 'RateLimit'
}
```

---

## 4. Data Synchronization

### 4.1 Sync Strategy

```
┌───────────────┐     ┌───────────────┐     ┌───────────────┐
│   Deriv API   │────►│  Sync Layer   │────►│   Supabase    │
│  (Real-time)  │     │  (Transform)  │     │  (Persist)    │
└───────────────┘     └───────────────┘     └───────────────┘
```

### 4.2 Trade Sync

```typescript
// libs/shared/sync/src/lib/trade-sync.ts
export class TradeSyncService {
  constructor(
    private derivApi: DerivAPI,
    private supabase: SupabaseClient
  ) {}

  async syncTrades(userId: string) {
    // Get trades from Deriv
    const { portfolio } = await this.derivApi.send({ portfolio: 1 });

    // Transform and store
    for (const contract of portfolio.contracts) {
      await this.supabase.from('trades').upsert({
        user_id: userId,
        deriv_contract_id: contract.contract_id,
        symbol: contract.symbol,
        type: contract.contract_type,
        stake: contract.buy_price,
        status: contract.status,
        opened_at: contract.date_start,
        // ... other fields
      });
    }
  }
}
```

---

## 5. Caching Strategy

### 5.1 Client-Side Cache

```typescript
// libs/shared/cache/src/lib/cache.ts
export class DataCache {
  private cache = new Map<string, { data: any; expiry: number }>();

  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    if (!item || Date.now() > item.expiry) {
      return null;
    }
    return item.data;
  }

  set<T>(key: string, data: T, ttlMs: number) {
    this.cache.set(key, {
      data,
      expiry: Date.now() + ttlMs
    });
  }

  invalidate(pattern: string) {
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    }
  }
}

// Cache TTLs
export const CACHE_TTL = {
  MARKETS: 5 * 60 * 1000,    // 5 minutes
  PROFILE: 60 * 60 * 1000,   // 1 hour
  TRADES: 30 * 1000,         // 30 seconds
};
```

### 5.2 React Query Integration

```typescript
// libs/shared/queries/src/lib/query-client.ts
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30 * 1000,
      cacheTime: 5 * 60 * 1000,
      retry: 3,
      refetchOnWindowFocus: false
    }
  }
});
```

---

## 6. Migration Strategy

### 6.1 Database Migrations

```sql
-- supabase/migrations/00002_add_trading_tables.sql

-- Trading accounts
CREATE TABLE trading_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  deriv_login_id TEXT,
  balance DECIMAL(15,2) DEFAULT 0,
  currency TEXT DEFAULT 'USD',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Trades
CREATE TABLE trades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  account_id UUID REFERENCES trading_accounts(id),
  deriv_contract_id TEXT UNIQUE,
  symbol TEXT NOT NULL,
  contract_type TEXT NOT NULL,
  stake DECIMAL(15,2) NOT NULL,
  payout DECIMAL(15,2),
  profit DECIMAL(15,2),
  status TEXT DEFAULT 'open',
  opened_at TIMESTAMPTZ,
  closed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE trading_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE trades ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users own trading accounts"
  ON trading_accounts FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Users own trades"
  ON trades FOR ALL
  USING (auth.uid() = user_id);
```

---

## 7. Environment Variables

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx
SUPABASE_SERVICE_ROLE_KEY=eyJxxx

# Deriv API
DERIV_APP_ID=12345
DERIV_ENDPOINT=wss://ws.derivws.com/websockets/v3
```

---

*End of Data Layer Specification*
