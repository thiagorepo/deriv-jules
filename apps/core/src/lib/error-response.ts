/**
 * Standardized error response structure
 */
export interface ErrorResponse {
  success: boolean;
  error: {
    code: string;
    message: string;
    details?: unknown;
    stack?: string;
  };
  meta?: {
    timestamp: string;
    requestId?: string;
  };
}

/**
 * Create a standardized error response
 */
export function createErrorResponse(
  message: string,
  code = 'INTERNAL_ERROR',
  details?: unknown,
  requestId?: string,
): ErrorResponse {
  return {
    success: false,
    error: {
      code,
      message,
      details,
      ...(process.env.NODE_ENV === 'development' && {
        stack: new Error().stack,
      }),
    },
    meta: {
      timestamp: new Date().toISOString(),
      requestId,
    },
  };
}

/**
 * Create a 400 Bad Request response
 */
export function badRequestResponse(
  message: string,
  details?: unknown,
  requestId?: string,
): ErrorResponse {
  return createErrorResponse(message, 'BAD_REQUEST', details, requestId);
}

/**
 * Create a 401 Unauthorized response
 */
export function unauthorizedResponse(
  message = 'Unauthorized',
  requestId?: string,
): ErrorResponse {
  return createErrorResponse(message, 'UNAUTHORIZED', undefined, requestId);
}

/**
 * Create a 403 Forbidden response
 */
export function forbiddenResponse(
  message = 'Forbidden',
  requestId?: string,
): ErrorResponse {
  return createErrorResponse(message, 'FORBIDDEN', undefined, requestId);
}

/**
 * Create a 404 Not Found response
 */
export function notFoundResponse(
  resource: string,
  id?: string,
  requestId?: string,
): ErrorResponse {
  const message = id
    ? `${resource} with id ${id} not found`
    : `${resource} not found`;
  return createErrorResponse(message, 'NOT_FOUND', undefined, requestId);
}

/**
 * Create a 409 Conflict response
 */
export function conflictResponse(
  message: string,
  details?: unknown,
  requestId?: string,
): ErrorResponse {
  return createErrorResponse(message, 'CONFLICT', details, requestId);
}

/**
 * Create a 422 Validation Error response
 */
export function validationErrorResponse(
  errors: Record<string, string[]>,
  requestId?: string,
): ErrorResponse {
  return createErrorResponse(
    'Validation failed',
    'VALIDATION_ERROR',
    { errors },
    requestId,
  );
}

/**
 * Create a 429 Rate Limit response
 */
export function rateLimitResponse(
  retryAfter?: number,
  requestId?: string,
): ErrorResponse {
  return createErrorResponse(
    'Too many requests',
    'RATE_LIMIT_EXCEEDED',
    retryAfter ? { retryAfter } : undefined,
    requestId,
  );
}

/**
 * Create a 500 Internal Server Error response
 */
export function internalErrorResponse(
  message = 'Internal server error',
  details?: unknown,
  requestId?: string,
): ErrorResponse {
  return createErrorResponse(message, 'INTERNAL_ERROR', details, requestId);
}

/**
 * Create a 503 Service Unavailable response
 */
export function unavailableResponse(
  message = 'Service temporarily unavailable',
  requestId?: string,
): ErrorResponse {
  return createErrorResponse(
    message,
    'SERVICE_UNAVAILABLE',
    undefined,
    requestId,
  );
}
