/**
 * Error logging utility
 */
import { createErrorResponse, type ErrorResponse } from './error-response';

interface LogContext {
  requestId?: string;
  userId?: string;
  action?: string;
  severity?: 'info' | 'warning' | 'error' | 'critical';
  [key: string]: unknown;
}

interface LogErrorOptions {
  error: unknown;
  context?: LogContext;
  captureStackTrace?: boolean;
}

/**
 * Log an error to the console (development)
 * In production, this would send to a logging service like LogRocket, Sentry, etc.
 */
export function logError(options: LogErrorOptions): void {
  const { error, context = {}, captureStackTrace = true } = options;

  const logEntry = {
    timestamp: new Date().toISOString(),
    type: 'error',
    ...context,
    error: {
      name: error instanceof Error ? error.name : 'UnknownError',
      message: error instanceof Error ? error.message : String(error),
      ...(captureStackTrace &&
        error instanceof Error && {
          stack: error.stack,
        }),
    },
  };

  // Log to console with appropriate severity
  const severity = context.severity || 'error';
  const logMethod =
    severity === 'info' ? 'info' : severity === 'warning' ? 'warn' : 'error';

  console[logMethod]('Error:', JSON.stringify(logEntry, null, 2));
}

/**
 * Log an error with an error response
 */
export function logErrorResponse(
  errorResponse: ErrorResponse,
  context?: LogContext,
): void {
  const logEntry = {
    timestamp: new Date().toISOString(),
    type: 'error-response',
    ...context,
    error: errorResponse.error,
    meta: errorResponse.meta,
  };

  console.error('Error Response:', JSON.stringify(logEntry, null, 2));
}

/**
 * Log a warning
 */
export function logWarning(message: string, context?: LogContext): void {
  const logEntry = {
    timestamp: new Date().toISOString(),
    type: 'warning',
    message,
    ...context,
  };

  console.warn('Warning:', JSON.stringify(logEntry, null, 2));
}

/**
 * Log an info message
 */
export function logInfo(message: string, context?: LogContext): void {
  const logEntry = {
    timestamp: new Date().toISOString(),
    type: 'info',
    message,
    ...context,
  };

  console.log('Info:', JSON.stringify(logEntry, null, 2));
}

/**
 * Handle and log an error with context
 */
export function handleAndLogError(
  error: unknown,
  context?: LogContext,
): ErrorResponse {
  const errorResponse = createErrorResponse(
    error instanceof Error ? error.message : 'An unexpected error occurred',
    'INTERNAL_ERROR',
    error instanceof Error ? error.stack : undefined,
    context?.requestId,
  );

  logError({ error, context, captureStackTrace: true });
  logErrorResponse(errorResponse, context);

  return errorResponse;
}

/**
 * Create and log a validation error
 */
export function logValidationError(
  errors: Record<string, string[]>,
  context?: LogContext,
): ErrorResponse {
  const errorResponse = createErrorResponse(
    'Validation failed',
    'VALIDATION_ERROR',
    { errors },
    context?.requestId,
  );

  logError({
    error: new Error('Validation failed'),
    context,
    captureStackTrace: false,
  });
  logErrorResponse(errorResponse, context);

  return errorResponse;
}

/**
 * Log database query performance
 */
export function logQueryPerformance(
  durationMs: number,
  query: string,
  context?: LogContext,
): void {
  const logEntry = {
    timestamp: new Date().toISOString(),
    type: 'query-performance',
    duration: `${durationMs}ms`,
    query: query.length > 100 ? query.substring(0, 100) + '...' : query,
    ...context,
  };

  const severity = durationMs > 1000 ? 'warning' : 'info';
  console[severity]('Query:', JSON.stringify(logEntry, null, 2));
}

/**
 * Log API request performance
 */
export function logApiPerformance(
  durationMs: number,
  method: string,
  path: string,
  context?: LogContext,
): void {
  const logEntry = {
    timestamp: new Date().toISOString(),
    type: 'api-performance',
    method,
    path,
    duration: `${durationMs}ms`,
    ...context,
  };

  const severity = durationMs > 2000 ? 'warning' : 'info';
  console[severity]('API:', JSON.stringify(logEntry, null, 2));
}

/**
 * Set up error tracking with error boundaries
 */
export function setupErrorTracking(): void {
  // This would integrate with external services like Sentry
  // Example: Sentry.init({ dsn: process.env.SENTRY_DSN });

  // Log unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    logError({
      error: event.reason,
      context: { type: 'unhandled-rejection' },
      captureStackTrace: false,
    });

    // Don't prevent default to allow error tracking to work
  });

  // Log uncaught exceptions
  window.addEventListener('error', (event) => {
    logError({
      error: event.error || new Error(event.message),
      context: { type: 'uncaught-exception' },
      captureStackTrace: true,
    });
  });
}

/**
 * Create a structured log entry
 */
export function createLogEntry(
  type: string,
  message: string,
  context?: LogContext,
): Record<string, unknown> {
  return {
    timestamp: new Date().toISOString(),
    type,
    message,
    ...context,
  };
}
