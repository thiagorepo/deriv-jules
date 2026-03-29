# RIL: API Routes Interface Layer

> **Spec ID:** RIL-001
> **Version:** 1.0.0
> **Status:** DRAFT
> **Last Updated:** 2026-03-28

---

## 1. Overview

This specification defines all API routes for the Deriv Jules platform, including request/response formats, authentication, and error handling.

---

## 2. API Architecture

### 2.1 Route Organization

```
app/api/
├── auth/
│   ├── callback/route.ts    # OAuth callback handler
│   ├── logout/route.ts      # Logout endpoint
│   └── session/route.ts     # Session info
├── users/
│   ├── route.ts             # User CRUD
│   └── [id]/route.ts        # Single user operations
├── trades/
│   ├── route.ts             # Trade history
│   └── [id]/route.ts        # Single trade
├── positions/
│   ├── route.ts             # Open positions
│   └── sell/route.ts        # Sell position
├── admin/
│   ├── users/route.ts       # Admin user management
│   ├── products/route.ts    # Product management
│   └── plans/route.ts       # Plan management
└── health/
    └── route.ts             # Health check
```

### 2.2 Response Format

```typescript
// Success response
interface ApiResponse<T> {
  success: true;
  data: T;
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
  };
}

// Error response
interface ErrorResponse {
  success: false;
  error: string;
  code?: string;
  details?: Record<string, unknown>;
}

// Combined type
type ApiResponse<T> = SuccessResponse<T> | ErrorResponse;
```

---

## 3. Authentication Routes

### 3.1 GET /api/auth/session

Get current session information.

```typescript
// Request
GET /api/auth/session

// Response (200)
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "role": "user",
      "profile": {
        "full_name": "John Doe",
        "avatar_url": "https://..."
      }
    }
  }
}

// Response (401 - Not authenticated)
{
  "success": false,
  "error": "Not authenticated"
}
```

### 3.2 POST /api/auth/callback

OAuth callback handler.

```typescript
// Request
POST /api/auth/callback
Content-Type: application/json

{
  "code": "oauth-code",
  "state": "state-string"
}

// Response (302 - Redirect)
Redirects to dashboard or return URL
```

### 3.3 POST /api/auth/logout

Logout user and clear session.

```typescript
// Request
POST /api/auth/logout

// Response (200)
{
  "success": true,
  "data": {
    "message": "Logged out successfully"
  }
}
```

---

## 4. User Routes

### 4.1 GET /api/users

Get current user profile.

```typescript
// Request
GET /api/users

// Response (200)
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "full_name": "John Doe",
    "avatar_url": "https://...",
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

### 4.2 PATCH /api/users

Update current user profile.

```typescript
// Request
PATCH /api/users
Content-Type: application/json

{
  "full_name": "John Smith",
  "avatar_url": "https://..."
}

// Response (200)
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "full_name": "John Smith",
    "avatar_url": "https://...",
    "updated_at": "2024-01-15T00:00:00Z"
  }
}

// Response (400 - Validation error)
{
  "success": false,
  "error": "Validation failed",
  "details": {
    "full_name": "Name must be at least 2 characters"
  }
}
```

---

## 5. Trading Routes

### 5.1 GET /api/trades

Get trade history.

```typescript
// Request
GET /api/trades?symbol=EURUSD&status=closed&page=1&limit=20

// Query Parameters
interface TradeQuery {
  symbol?: string;       // Filter by symbol
  status?: 'open' | 'closed' | 'all';
  type?: ContractType;   // Filter by contract type
  fromDate?: string;     // ISO date string
  toDate?: string;       // ISO date string
  page?: number;         // Default: 1
  limit?: number;        // Default: 20, Max: 100
}

// Response (200)
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "symbol": "EURUSD",
      "type": "CALL",
      "stake": 100,
      "payout": 180,
      "profit": 80,
      "status": "won",
      "opened_at": "2024-01-01T10:00:00Z",
      "closed_at": "2024-01-01T10:05:00Z"
    }
  ],
  "meta": {
    "total": 150,
    "page": 1,
    "limit": 20
  }
}
```

### 5.2 GET /api/trades/[id]

Get single trade details.

```typescript
// Request
GET /api/trades/uuid

// Response (200)
{
  "success": true,
  "data": {
    "id": "uuid",
    "symbol": "EURUSD",
    "type": "CALL",
    "stake": 100,
    "payout": 180,
    "profit": 80,
    "status": "won",
    "opened_at": "2024-01-01T10:00:00Z",
    "closed_at": "2024-01-01T10:05:00Z",
    "deriv_contract_id": "123456"
  }
}

// Response (404)
{
  "success": false,
  "error": "Trade not found"
}
```

### 5.3 GET /api/positions

Get open positions.

```typescript
// Request
GET /api/positions

// Response (200)
{
  "success": true,
  "data": [
    {
      "contract_id": "123456",
      "symbol": "EURUSD",
      "type": "CALL",
      "buy_price": 100,
      "current_price": 150,
      "profit": 50,
      "status": "open",
      "opened_at": "2024-01-01T10:00:00Z"
    }
  ]
}
```

### 5.4 POST /api/positions/sell

Sell an open position.

```typescript
// Request
POST /api/positions/sell
Content-Type: application/json

{
  "contract_id": "123456",
  "price": 150
}

// Response (200)
{
  "success": true,
  "data": {
    "contract_id": "123456",
    "sell_price": 150,
    "profit": 50,
    "sold_at": "2024-01-01T10:05:00Z"
  }
}

// Response (400)
{
  "success": false,
  "error": "Position already closed"
}
```

---

## 6. Admin Routes

### 6.1 GET /api/admin/users

List all users (admin only).

```typescript
// Request
GET /api/admin/users?search=john&status=active&page=1&limit=20

// Query Parameters
interface AdminUserQuery {
  search?: string;
  status?: 'active' | 'suspended' | 'pending';
  role?: 'admin' | 'user';
  page?: number;
  limit?: number;
}

// Response (200)
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "email": "user@example.com",
      "full_name": "John Doe",
      "role": "user",
      "status": "active",
      "created_at": "2024-01-01T00:00:00Z"
    }
  ],
  "meta": {
    "total": 500,
    "page": 1,
    "limit": 20
  }
}

// Response (403 - Forbidden)
{
  "success": false,
  "error": "Admin access required"
}
```

### 6.2 PATCH /api/admin/users/[id]

Update user (admin only).

```typescript
// Request
PATCH /api/admin/users/uuid
Content-Type: application/json

{
  "status": "suspended",
  "role": "user"
}

// Response (200)
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "role": "user",
    "status": "suspended",
    "updated_at": "2024-01-15T00:00:00Z"
  }
}
```

### 6.3 GET /api/admin/products

List all products.

```typescript
// Request
GET /api/admin/products

// Response (200)
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "EUR/USD",
      "symbol": "EURUSD",
      "category": "forex",
      "status": "active",
      "description": "Euro vs US Dollar"
    }
  ]
}
```

### 6.4 POST /api/admin/products

Create product.

```typescript
// Request
POST /api/admin/products
Content-Type: application/json

{
  "name": "EUR/USD",
  "symbol": "EURUSD",
  "category": "forex",
  "description": "Euro vs US Dollar"
}

// Response (201)
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "EUR/USD",
    "symbol": "EURUSD",
    "category": "forex",
    "status": "active",
    "description": "Euro vs US Dollar"
  }
}
```

### 6.5 PATCH /api/admin/products/[id]

Update product.

```typescript
// Request
PATCH /api/admin/products/uuid
Content-Type: application/json

{
  "status": "inactive"
}

// Response (200)
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "EUR/USD",
    "symbol": "EURUSD",
    "status": "inactive"
  }
}
```

### 6.6 GET /api/admin/plans

List all plans.

```typescript
// Request
GET /api/admin/plans

// Response (200)
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Basic",
      "price": 29.99,
      "currency": "USD",
      "billing_period": "monthly",
      "features": ["Up to 100 trades/day", "Basic analytics"],
      "status": "active",
      "max_trades": 100,
      "max_positions": 5
    }
  ]
}
```

### 6.7 POST /api/admin/plans

Create plan.

```typescript
// Request
POST /api/admin/plans
Content-Type: application/json

{
  "name": "Pro",
  "price": 99.99,
  "currency": "USD",
  "billing_period": "monthly",
  "features": ["Unlimited trades", "Advanced analytics", "Priority support"],
  "max_trades": null,
  "max_positions": 50
}

// Response (201)
{
  "success": true,
  "data": { /* created plan */ }
}
```

### 6.8 PATCH /api/admin/plans/[id]

Update plan.

```typescript
// Request
PATCH /api/admin/plans/uuid
Content-Type: application/json

{
  "status": "inactive"
}

// Response (200)
{
  "success": true,
  "data": { /* updated plan */ }
}
```

---

## 7. Health Check

### 7.1 GET /api/health

System health check.

```typescript
// Request
GET /api/health

// Response (200)
{
  "success": true,
  "data": {
    "status": "healthy",
    "version": "1.0.0",
    "timestamp": "2024-01-01T00:00:00Z",
    "checks": {
      "database": "ok",
      "deriv_api": "ok"
    }
  }
}

// Response (503 - Unhealthy)
{
  "success": false,
  "data": {
    "status": "unhealthy",
    "checks": {
      "database": "ok",
      "deriv_api": "error"
    }
  }
}
```

---

## 8. Error Handling

### 8.1 Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `VALIDATION_ERROR` | 400 | Invalid request data |
| `UNAUTHORIZED` | 401 | Not authenticated |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `CONFLICT` | 409 | Resource conflict |
| `RATE_LIMIT` | 429 | Too many requests |
| `INTERNAL_ERROR` | 500 | Server error |
| `SERVICE_UNAVAILABLE` | 503 | External service down |

### 8.2 Error Response Format

```typescript
// Validation error
{
  "success": false,
  "error": "Validation failed",
  "code": "VALIDATION_ERROR",
  "details": {
    "email": "Invalid email format",
    "password": "Password must be at least 8 characters"
  }
}

// Generic error
{
  "success": false,
  "error": "An unexpected error occurred",
  "code": "INTERNAL_ERROR"
}
```

### 8.3 Route Handler Error Handling

```typescript
// app/api/users/route.ts
import { NextResponse } from 'next/server';
import { validateBody } from '@org/schemas';
import { profileUpdateSchema } from '@org/schemas';

export async function PATCH(request: NextRequest) {
  try {
    const body = await validateBody(profileUpdateSchema)(request);

    if (body instanceof NextResponse) {
      return body; // Return validation error
    }

    const user = await getUser(request);
    const updated = await updateProfile(user.id, body);

    return NextResponse.json({ success: true, data: updated });

  } catch (error) {
    if (error instanceof DatabaseError) {
      return NextResponse.json(
        { success: false, error: 'Database error', code: 'INTERNAL_ERROR' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
```

---

## 9. Authentication Middleware

### 9.1 Auth Guard

```typescript
// libs/shared/api/src/lib/auth-guard.ts
export async function withAuth(
  request: NextRequest,
  handler: (user: AuthUser) => Promise<NextResponse>
): Promise<NextResponse> {
  const user = await getCurrentUser(request);

  if (!user) {
    return NextResponse.json(
      { success: false, error: 'Not authenticated', code: 'UNAUTHORIZED' },
      { status: 401 }
    );
  }

  return handler(user);
}

// Usage
export async function GET(request: NextRequest) {
  return withAuth(request, async (user) => {
    const profile = await getProfile(user.id);
    return NextResponse.json({ success: true, data: profile });
  });
}
```

### 9.2 Admin Guard

```typescript
// libs/shared/api/src/lib/admin-guard.ts
export async function withAdmin(
  request: NextRequest,
  handler: (user: AuthUser) => Promise<NextResponse>
): Promise<NextResponse> {
  return withAuth(request, async (user) => {
    if (user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Admin access required', code: 'FORBIDDEN' },
        { status: 403 }
      );
    }

    return handler(user);
  });
}

// Usage
export async function GET(request: NextRequest) {
  return withAdmin(request, async (user) => {
    const users = await getAllUsers();
    return NextResponse.json({ success: true, data: users });
  });
}
```

---

## 10. Rate Limiting

### 10.1 Rate Limit Configuration

```typescript
// Rate limits by endpoint
const rateLimits = {
  '/api/trades': { requests: 100, window: 60000 }, // 100 req/min
  '/api/positions/sell': { requests: 30, window: 60000 }, // 30 req/min
  '/api/admin/*': { requests: 200, window: 60000 }, // 200 req/min
  'default': { requests: 300, window: 60000 }, // 300 req/min
};
```

### 10.2 Rate Limit Response

```typescript
// Response (429)
{
  "success": false,
  "error": "Too many requests",
  "code": "RATE_LIMIT",
  "details": {
    "retry_after": 30
  }
}
```

---

*End of API Routes Interface Layer Specification*
