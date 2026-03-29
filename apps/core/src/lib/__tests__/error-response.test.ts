/**
 * Error Response Utilities - Unit Tests
 */
import {
  createErrorResponse,
  badRequestResponse,
  unauthorizedResponse,
  notFoundResponse,
  internalErrorResponse,
} from '../error-response';

describe('createErrorResponse', () => {
  it('should create an error response with required fields', () => {
    const error = createErrorResponse('Test error', 'TEST_ERROR');
    expect(error).toHaveProperty('success', false);
    expect(error).toHaveProperty('error');
    expect(error).toHaveProperty('meta');
    expect(error.error).toHaveProperty('code', 'TEST_ERROR');
    expect(error.error).toHaveProperty('message', 'Test error');
    expect(error.meta).toHaveProperty('timestamp');
  });

  it('should include details if provided', () => {
    const error = createErrorResponse('Test error', 'TEST_ERROR', {
      userId: '123',
    });
    expect(error.error.details).toEqual({ userId: '123' });
  });

  it('should include stack in development mode', () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';

    const error = createErrorResponse('Test error', 'TEST_ERROR');
    expect(error.error.stack).toBeDefined();

    process.env.NODE_ENV = originalEnv;
  });

  it('should NOT include stack in production mode', () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';

    const error = createErrorResponse('Test error', 'TEST_ERROR');
    expect(error.error.stack).toBeUndefined();

    process.env.NODE_ENV = originalEnv;
  });

  it('should include requestId if provided', () => {
    const error = createErrorResponse(
      'Test error',
      'TEST_ERROR',
      undefined,
      'req-123',
    );
    expect(error.meta.requestId).toBe('req-123');
  });
});

describe('badRequestResponse', () => {
  it('should create a bad request error', () => {
    const error = badRequestResponse('Invalid input');
    expect(error.error.code).toBe('BAD_REQUEST');
    expect(error.error.message).toBe('Invalid input');
    expect(error.meta.timestamp).toBeDefined();
  });
});

describe('unauthorizedResponse', () => {
  it('should create an unauthorized error', () => {
    const error = unauthorizedResponse();
    expect(error.error.code).toBe('UNAUTHORIZED');
    expect(error.error.message).toBe('Unauthorized');
  });

  it('should accept custom message', () => {
    const error = unauthorizedResponse('Custom message');
    expect(error.error.message).toBe('Custom message');
  });
});

describe('notFoundResponse', () => {
  it('should create a not found error', () => {
    const error = notFoundResponse('Resource not found');
    expect(error.error.code).toBe('NOT_FOUND');
    expect(error.error.message).toBe('Resource not found');
  });
});

describe('internalErrorResponse', () => {
  it('should create an internal server error', () => {
    const error = internalErrorResponse('Internal error');
    expect(error.error.code).toBe('INTERNAL_ERROR');
    expect(error.error.message).toBe('Internal error');
  });
});
