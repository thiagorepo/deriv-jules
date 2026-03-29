# DerivOpus API Routes

## Overview
Complete API route structure for DerivOpus trading platform. All routes follow Next.js App Router conventions with consistent error handling, logging, and type-safe responses.

## File Structure
```
apps/core/src/app/api/
├── utils/
│   ├── response.ts          # Response utilities & types
│   └── logger.ts            # Structured logging
├── trading/
│   ├── execute/route.ts     # POST /api/trading/execute
│   ├── history/route.ts     # GET /api/trading/history
│   └── open/route.ts        # GET /api/trading/open
├── auth/
│   ├── sign-in/route.ts     # POST /api/auth/sign-in
│   ├── sign-up/route.ts     # POST /api/auth/sign-up
│   └── mfa/
│       ├── enroll/route.ts  # POST /api/auth/mfa/enroll
│       └── verify/route.ts  # POST /api/auth/mfa/verify
├── billing/
│   ├── checkout/route.ts    # POST /api/billing/checkout
│   └── subscription/route.ts# GET /api/billing/subscription
└── health/route.ts          # GET /api/health
```

## Routes

### Trading Endpoints

#### POST /api/trading/execute
Execute a new trade.
- **Request**: `{ symbol, amount, direction, orderType, stopLoss?, takeProfit? }`
- **Response**: `{ tradeId, symbol, amount, direction, executionPrice, status, timestamp }`
- **Status Codes**: 201 (success), 400 (validation), 500 (error)

#### GET /api/trading/history?page=1&pageSize=10&symbol=EUR/USD
Fetch trade history with pagination.
- **Query Parameters**: `page`, `pageSize`, `symbol` (optional)
- **Response**: `{ trades: Trade[], total, page, pageSize }`
- **Status Codes**: 200 (success), 400 (invalid params), 500 (error)

#### GET /api/trading/open?symbol=BTC/USD
Get all open trades for the user.
- **Query Parameters**: `symbol` (optional)
- **Response**: `{ trades: OpenTrade[], totalPnl, count }`
- **Status Codes**: 200 (success), 500 (error)

### Auth Endpoints

#### POST /api/auth/sign-in
User login with email/password.
- **Request**: `{ email, password }`
- **Response**: `{ userId, email, sessionToken, mfaRequired }`
- **Status Codes**: 200 (success), 400 (invalid credentials), 500 (error)

#### POST /api/auth/sign-up
User registration.
- **Request**: `{ email, password, firstName, lastName }`
- **Response**: `{ userId, email, sessionToken, requiresVerification }`
- **Status Codes**: 201 (success), 400 (validation), 409 (email exists), 500 (error)

#### POST /api/auth/mfa/enroll
Enroll in MFA (TOTP or SMS).
- **Request**: `{ method: 'TOTP' | 'SMS', phoneNumber? }`
- **Response**: `{ enrollmentId, method, secret?, qrCode?, verificationRequired }`
- **Status Codes**: 201 (success), 400 (invalid), 500 (error)

#### POST /api/auth/mfa/verify
Verify MFA enrollment with OTP code.
- **Request**: `{ enrollmentId, code }`
- **Response**: `{ enrollmentId, verified, backupCodes? }`
- **Status Codes**: 200 (success), 400 (invalid code), 500 (error)

### Billing Endpoints

#### POST /api/billing/checkout
Create a checkout session for plan purchase.
- **Request**: `{ planId, billingCycle: 'MONTHLY' | 'YEARLY', promoCode? }`
- **Response**: `{ sessionId, checkoutUrl, planId, amount, currency, billingCycle }`
- **Status Codes**: 201 (success), 400 (invalid), 500 (error)

#### GET /api/billing/subscription?userId=USER_ID
Get subscription status for a user.
- **Query Parameters**: `userId` (required)
- **Response**: `{ subscription: SubscriptionDetails | null, hasActiveSubscription }`
- **Status Codes**: 200 (success), 400 (missing userId), 500 (error)

### Health Check

#### GET /api/health
Service health status check.
- **Response**: `{ status, timestamp, uptime, services: { api, database, auth }, version }`
- **Status Codes**: 200 (healthy), 503 (degraded)

## Common Patterns

### Response Format
All endpoints return a consistent JSON structure:
```typescript
{
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, any>;
  };
  timestamp: string;
}
```

### Error Handling
```typescript
// Validation error
errorResponse('INVALID_REQUEST', 'Missing field X', 400)

// Authentication error
errorResponse('AUTH_ERROR', 'Invalid credentials', 401)

// Not found
errorResponse('NOT_FOUND', 'Resource not found', 404)

// Server error
errorResponse('INTERNAL_ERROR', 'Server error', 500)
```

### Logging
Each route includes structured logging context:
```typescript
const logger = createLogger({
  endpoint: '/api/trading/execute',
  method: 'POST',
  timestamp: new Date().toISOString(),
});

logger.info('Trade executed', { tradeId, symbol });
logger.error('Trade failed', error, { details });
```

## TODO: Future Implementation

1. **Database Integration**
   - Connect to Supabase for persistent storage
   - Implement actual trade execution queries

2. **Authentication**
   - Integrate Supabase Auth
   - Add JWT token validation middleware
   - Implement session management

3. **Deriv API Integration**
   - Connect to Deriv WebSocket API
   - Execute real trades
   - Stream live pricing data

4. **Payment Processing**
   - Integrate Stripe for billing
   - Implement subscription management
   - Process refunds and disputes

5. **Security**
   - Add rate limiting middleware
   - Implement request validation
   - Add security headers
   - CORS configuration

6. **Monitoring**
   - Add APM instrumentation
   - Set up error tracking
   - Implement uptime monitoring
   - Log aggregation

## Testing
Each route should have:
- Unit tests for validation logic
- Integration tests with mocked services
- E2E tests for happy paths

## Security Guards (Future)
Routes should use security middleware from `@org/shared-auth`:
- `withAuth()` - Require authentication
- `withAdmin()` - Require admin role
- `withRole()` - Require specific role
- `withTenant()` - Require tenant context

Example:
```typescript
export const POST = withAuth(executeTradeHandler);
```
