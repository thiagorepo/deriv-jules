# EL: Error & Logging Specification

> **Spec ID:** EL-001
> **Version:** 1.0.0
> **Status:** DRAFT
> **Last Updated:** 2026-03-28

---

## 1. Overview

This specification defines error handling, logging, and monitoring standards for the Deriv Jules platform.

---

## 2. Error Types

### 2.1 Error Hierarchy

```typescript
// libs/shared/errors/src/index.ts

// Base error class
export class AppError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode: number = 500,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'AppError';
  }
}

// Domain-specific errors
export class AuthError extends AppError {
  constructor(code: string, message: string, details?: Record<string, unknown>) {
    super(code, message, 401, details);
    this.name = 'AuthError';
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: Record<string, unknown>) {
    super('VALIDATION_ERROR', message, 400, details);
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super('NOT_FOUND', `${resource} not found`, 404);
    this.name = 'NotFoundError';
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = 'Access denied') {
    super('FORBIDDEN', message, 403);
    this.name = 'ForbiddenError';
  }
}

export class DatabaseError extends AppError {
  constructor(message: string, cause?: Error) {
    super('DATABASE_ERROR', message, 500, { cause: cause?.message });
    this.name = 'DatabaseError';
  }
}

export class DerivAPIError extends AppError {
  constructor(code: string, message: string, details?: Record<string, unknown>) {
    super(code, message, 500, details);
    this.name = 'DerivAPIError';
  }
}

export class RateLimitError extends AppError {
  constructor(retryAfter: number) {
    super('RATE_LIMIT', 'Too many requests', 429, { retry_after: retryAfter });
    this.name = 'RateLimitError';
  }
}
```

### 2.2 Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `VALIDATION_ERROR` | 400 | Invalid input data |
| `UNAUTHORIZED` | 401 | Not authenticated |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `CONFLICT` | 409 | Resource conflict |
| `RATE_LIMIT` | 429 | Too many requests |
| `DATABASE_ERROR` | 500 | Database operation failed |
| `DERIV_ERROR` | 500 | Deriv API error |
| `INTERNAL_ERROR` | 500 | Unexpected server error |
| `SERVICE_UNAVAILABLE` | 503 | External service unavailable |

---

## 3. Error Handling Patterns

### 3.1 API Route Error Handling

```typescript
// libs/shared/api/src/lib/error-handler.ts
import { NextResponse } from 'next/server';
import { AppError, ValidationError, DatabaseError } from '@org/errors';

export function handleApiError(error: unknown): NextResponse {
  // Log error
  logger.error('API Error', { error });

  // Handle known errors
  if (error instanceof AppError) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        code: error.code,
        details: error.details,
      },
      { status: error.statusCode }
    );
  }

  // Handle Zod validation errors
  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        success: false,
        error: 'Validation failed',
        code: 'VALIDATION_ERROR',
        details: formatZodErrors(error),
      },
      { status: 400 }
    );
  }

  // Handle unknown errors
  return NextResponse.json(
    {
      success: false,
      error: 'An unexpected error occurred',
      code: 'INTERNAL_ERROR',
    },
    { status: 500 }
  );
}

// Usage in route handler
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = await createTrade(body);
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    return handleApiError(error);
  }
}
```

### 3.2 Client-Side Error Handling

```typescript
// libs/shared/api/src/lib/fetcher.ts
export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export async function apiFetch<T>(
  url: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new ApiError(
      response.status,
      data.code || 'UNKNOWN_ERROR',
      data.error || 'An error occurred',
      data.details
    );
  }

  return data.data;
}

// Usage with error handling
async function handleSubmit() {
  try {
    const result = await apiFetch('/api/trades', {
      method: 'POST',
      body: JSON.stringify(tradeData),
    });
    toast.success('Trade executed');
  } catch (error) {
    if (error instanceof ApiError) {
      if (error.code === 'VALIDATION_ERROR') {
        // Show validation errors in form
        setFormErrors(error.details);
      } else {
        toast.error(error.message);
      }
    } else {
      toast.error('An unexpected error occurred');
    }
  }
}
```

### 3.3 React Error Boundary

```typescript
// libs/shared/ui/src/error-boundary.tsx
interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ReactNode },
  ErrorBoundaryState
> {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    logger.error('React Error Boundary', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
    });
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <ErrorFallback
          error={this.state.error!}
          resetErrorBoundary={() => this.setState({ hasError: false, error: null })}
        />
      );
    }

    return this.props.children;
  }
}

// Error fallback component
function ErrorFallback({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
      <h2 className="text-2xl font-bold mb-4">Something went wrong</h2>
      <p className="text-gray-600 mb-6">{error.message}</p>
      <Button onClick={resetErrorBoundary}>Try again</Button>
    </div>
  );
}
```

---

## 4. Logging System

### 4.1 Logger Interface

```typescript
// libs/shared/logger/src/lib/logger.ts
interface LogContext {
  service?: string;
  userId?: string;
  tenantId?: string;
  requestId?: string;
  [key: string]: unknown;
}

interface LogEntry {
  timestamp: string;
  level: 'debug' | 'info' | 'warn' | 'error';
  message: string;
  context: LogContext;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
}

class Logger {
  private context: LogContext = {};

  setContext(context: Partial<LogContext>) {
    this.context = { ...this.context, ...context };
  }

  debug(message: string, context?: LogContext) {
    this.log('debug', message, context);
  }

  info(message: string, context?: LogContext) {
    this.log('info', message, context);
  }

  warn(message: string, context?: LogContext) {
    this.log('warn', message, context);
  }

  error(message: string, context?: LogContext) {
    this.log('error', message, context);
  }

  private log(level: LogEntry['level'], message: string, context?: LogContext) {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context: { ...this.context, ...context },
    };

    // In development, log to console
    if (process.env.NODE_ENV === 'development') {
      console.log(JSON.stringify(entry, null, 2));
    } else {
      console.log(JSON.stringify(entry));
    }
  }
}

export const logger = new Logger();
```

### 4.2 Request Logging Middleware

```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { logger } from '@org/logger';

export function middleware(request: NextRequest) {
  const requestId = crypto.randomUUID();
  const startTime = Date.now();

  // Set request context
  logger.setContext({
    requestId,
    method: request.method,
    path: request.nextUrl.pathname,
  });

  // Log request
  logger.info('Request started');

  // Continue to handler
  const response = NextResponse.next();

  // Add request ID header
  response.headers.set('X-Request-Id', requestId);

  // Log response
  const duration = Date.now() - startTime;
  logger.info('Request completed', {
    statusCode: response.status,
    duration,
  });

  return response;
}
```

### 4.3 Structured Logging Examples

```typescript
// Authentication event
logger.info('User logged in', {
  service: 'auth',
  userId: user.id,
  email: user.email,
  loginMethod: 'password',
});

// Trade execution
logger.info('Trade executed', {
  service: 'trading',
  userId: user.id,
  contractId: contract.contract_id,
  symbol: params.symbol,
  type: params.type,
  stake: params.stake,
});

// Error with context
logger.error('Trade execution failed', {
  service: 'trading',
  userId: user.id,
  symbol: params.symbol,
  error: {
    name: error.name,
    message: error.message,
    stack: error.stack,
  },
});

// Database operation
logger.info('Database query', {
  service: 'database',
  operation: 'SELECT',
  table: 'trades',
  duration: queryDuration,
  rowCount: results.length,
});

// WebSocket event
logger.info('WebSocket message received', {
  service: 'deriv-api',
  msgType: data.msg_type,
  symbol: data.tick?.symbol,
});
```

---

## 5. Error Monitoring

### 5.1 Sentry Integration (Optional)

```typescript
// libs/shared/monitoring/src/lib/sentry.ts
import * as Sentry from '@sentry/nextjs';

export function initSentry() {
  if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
    Sentry.init({
      dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
      environment: process.env.NODE_ENV,
      tracesSampleRate: 0.1,
      replaysSessionSampleRate: 0.1,
      replaysOnErrorSampleRate: 1.0,
    });
  }
}

// Capture error with context
export function captureError(error: Error, context?: Record<string, unknown>) {
  Sentry.captureException(error, {
    extra: context,
  });
}

// Add user context
export function setUserContext(user: { id: string; email: string; role: string }) {
  Sentry.setUser(user);
}

// Clear user context on logout
export function clearUserContext() {
  Sentry.setUser(null);
}
```

### 5.2 Performance Monitoring

```typescript
// libs/shared/monitoring/src/lib/performance.ts
interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
  tags?: Record<string, string>;
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];

  track(name: string, value: number, tags?: Record<string, string>) {
    this.metrics.push({
      name,
      value,
      timestamp: Date.now(),
      tags,
    });

    // Log significant metrics
    if (value > this.getThreshold(name)) {
      logger.warn('Performance threshold exceeded', {
        metric: name,
        value,
        threshold: this.getThreshold(name),
        tags,
      });
    }
  }

  private getThreshold(name: string): number {
    const thresholds: Record<string, number> = {
      'api_response_time': 1000, // 1 second
      'db_query_time': 100, // 100ms
      'ws_latency': 200, // 200ms
      'page_load_time': 3000, // 3 seconds
    };
    return thresholds[name] || Infinity;
  }
}

export const performanceMonitor = new PerformanceMonitor();

// Track API response time
export function trackApiResponse(name: string, duration: number) {
  performanceMonitor.track('api_response_time', duration, { endpoint: name });
}

// Track database query
export function trackDbQuery(query: string, duration: number) {
  performanceMonitor.track('db_query_time', duration, { query });
}
```

---

## 6. Alerting

### 6.1 Alert Conditions

| Condition | Severity | Notification |
|-----------|----------|--------------|
| Error rate > 5% | Critical | Immediate |
| Response time p95 > 2s | Warning | Within 5 min |
| WebSocket disconnects > 5/min | Warning | Within 5 min |
| Database errors > 10/min | Critical | Immediate |
| Failed trades > 5/min | Critical | Immediate |

### 6.2 Alert Integration

```typescript
// libs/shared/alerting/src/lib/alerts.ts
interface Alert {
  severity: 'warning' | 'critical';
  title: string;
  message: string;
  timestamp: string;
  context?: Record<string, unknown>;
}

class Alerter {
  async send(alert: Alert) {
    // Log alert
    logger.warn('Alert triggered', {
      alert: alert.title,
      severity: alert.severity,
      ...alert.context,
    });

    // Send to external services (Slack, PagerDuty, etc.)
    if (process.env.ALERT_WEBHOOK_URL) {
      await fetch(process.env.ALERT_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(alert),
      });
    }
  }
}

export const alerter = new Alerter();

// Usage
if (errorRate > 0.05) {
  await alerter.send({
    severity: 'critical',
    title: 'High error rate detected',
    message: `Error rate is ${(errorRate * 100).toFixed(1)}%`,
    timestamp: new Date().toISOString(),
    context: { errorRate, window: '5m' },
  });
}
```

---

## 7. Error Recovery

### 7.1 Automatic Retry

```typescript
// libs/shared/utils/src/lib/retry.ts
interface RetryOptions {
  maxAttempts: number;
  delay: number;
  backoff?: 'exponential' | 'linear' | 'none';
  onRetry?: (attempt: number, error: Error) => void;
}

export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions
): Promise<T> {
  let lastError: Error;

  for (let attempt = 1; attempt <= options.maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      if (attempt < options.maxAttempts) {
        const delay = options.backoff === 'exponential'
          ? options.delay * Math.pow(2, attempt - 1)
          : options.backoff === 'linear'
            ? options.delay * attempt
            : options.delay;

        logger.warn('Retry attempt', {
          attempt,
          maxAttempts: options.maxAttempts,
          delay,
          error: lastError.message,
        });

        options.onRetry?.(attempt, lastError);
        await sleep(delay);
      }
    }
  }

  throw lastError!;
}

// Usage
const result = await withRetry(
  () => derivApi.buyContract(params),
  {
    maxAttempts: 3,
    delay: 1000,
    backoff: 'exponential',
    onRetry: (attempt, error) => {
      logger.warn('Trade retry', { attempt, error: error.message });
    },
  }
);
```

### 7.2 Circuit Breaker

```typescript
// libs/shared/utils/src/lib/circuit-breaker.ts
type CircuitState = 'closed' | 'open' | 'half-open';

class CircuitBreaker {
  private state: CircuitState = 'closed';
  private failures = 0;
  private lastFailureTime = 0;

  constructor(
    private threshold: number = 5,
    private timeout: number = 60000 // 1 minute
  ) {}

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === 'open') {
      if (Date.now() - this.lastFailureTime > this.timeout) {
        this.state = 'half-open';
      } else {
        throw new Error('Circuit breaker is open');
      }
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess() {
    this.failures = 0;
    this.state = 'closed';
  }

  private onFailure() {
    this.failures++;
    this.lastFailureTime = Date.now();

    if (this.failures >= this.threshold) {
      this.state = 'open';
      logger.warn('Circuit breaker opened', {
        failures: this.failures,
        threshold: this.threshold,
      });
    }
  }
}

// Usage for external API calls
const derivCircuitBreaker = new CircuitBreaker(5, 60000);

async function callDerivAPI<T>(fn: () => Promise<T>): Promise<T> {
  return derivCircuitBreaker.execute(fn);
}
```

---

## 8. Logging Levels

### 8.1 When to Use Each Level

| Level | Use Case |
|-------|----------|
| `debug` | Detailed debugging information |
| `info` | Normal operations, user actions |
| `warn` | Unexpected but handled situations |
| `error` | Errors requiring attention |

### 8.2 Examples by Level

```typescript
// Debug - Detailed troubleshooting
logger.debug('Cache lookup', { key, found: !!result });

// Info - Normal operations
logger.info('User profile updated', { userId, fields: Object.keys(changes) });

// Warn - Unexpected but handled
logger.warn('Rate limit approaching', { userId, requests: count, limit: 100 });

// Error - Requires attention
logger.error('Payment processing failed', {
  userId,
  amount,
  error: error.message,
  stack: error.stack,
});
```

---

*End of Error & Logging Specification*
