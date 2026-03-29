/**
 * Error Logger - Unit Tests
 */
import {
  logError,
  logErrorResponse,
  logWarning,
  logInfo,
  handleAndLogError,
  logValidationError,
  logQueryPerformance,
  logApiPerformance,
} from '../error-logger';

describe('logError', () => {
  beforeEach(() => {
    // Clear console before each test
    jest.spyOn(console, 'error').mockClear();
  });

  it('should log error object', () => {
    const error = new Error('Test error');
    logError({ error });
    expect(console.error).toHaveBeenCalled();
  });

  it('should include timestamp', () => {
    const error = new Error('Test error');
    logError({ error });
    const logArgs = (console.error as jest.Mock).mock.calls[0][0];
    expect(logArgs).toHaveProperty('timestamp');
    expect(new Date(logArgs.timestamp).toISOString()).toBeDefined();
  });

  it('should include error name and message', () => {
    const error = new Error('Test error');
    logError({ error });
    const logArgs = (console.error as jest.Mock).mock.calls[0][0];
    expect(logArgs.error).toHaveProperty('name', 'Error');
    expect(logArgs.error).toHaveProperty('message', 'Test error');
  });

  it('should include stack when captureStackTrace is true', () => {
    const error = new Error('Test error');
    logError({ error, captureStackTrace: true });
    const logArgs = (console.error as jest.Mock).mock.calls[0][0];
    expect(logArgs.error.stack).toBeDefined();
  });

  it('should NOT include stack when captureStackTrace is false', () => {
    const error = new Error('Test error');
    logError({ error, captureStackTrace: false });
    const logArgs = (console.error as jest.Mock).mock.calls[0][0];
    expect(logArgs.error.stack).toBeUndefined();
  });

  it('should include context', () => {
    const error = new Error('Test error');
    logError({ error, context: { userId: '123', action: 'login' } });
    const logArgs = (console.error as jest.Mock).mock.calls[0][0];
    expect(logArgs.userId).toBe('123');
    expect(logArgs.action).toBe('login');
  });

  it('should map info severity to console.log', () => {
    const error = new Error('Test error');
    logError({ error, context: { severity: 'info' } });
    expect(console.log).toHaveBeenCalled();
  });

  it('should map warning severity to console.warn', () => {
    const error = new Error('Test error');
    logError({ error, context: { severity: 'warning' } });
    expect(console.warn).toHaveBeenCalled();
  });

  it('should map error severity to console.error', () => {
    const error = new Error('Test error');
    logError({ error, context: { severity: 'error' } });
    expect(console.error).toHaveBeenCalled();
  });
});

describe('logErrorResponse', () => {
  beforeEach(() => {
    jest.spyOn(console, 'error').mockClear();
  });

  it('should log error response', () => {
    const errorResponse = {
      success: false,
      error: { code: 'TEST_ERROR', message: 'Test error' },
      meta: { timestamp: new Date().toISOString(), requestId: 'req-1' },
    };
    logErrorResponse(errorResponse);
    expect(console.error).toHaveBeenCalled();
  });

  it('should include all error response fields', () => {
    const errorResponse = {
      success: false,
      error: { code: 'TEST_ERROR', message: 'Test error' },
      meta: { timestamp: new Date().toISOString(), requestId: 'req-1' },
    };
    logErrorResponse(errorResponse);
    const logArgs = (console.error as jest.Mock).mock.calls[0][0];
    expect(logArgs.error).toEqual(errorResponse.error);
    expect(logArgs.meta).toEqual(errorResponse.meta);
  });
});

describe('logWarning', () => {
  beforeEach(() => {
    jest.spyOn(console, 'warn').mockClear();
  });

  it('should log warning message', () => {
    logWarning('Test warning');
    expect(console.warn).toHaveBeenCalledWith(
      'Warning:',
      expect.objectContaining({
        message: 'Test warning',
        type: 'warning',
      }),
    );
  });

  it('should include context', () => {
    logWarning('Test warning', { userId: '123' });
    const logArgs = (console.warn as jest.Mock).mock.calls[0][0];
    expect(logArgs.userId).toBe('123');
  });
});

describe('logInfo', () => {
  beforeEach(() => {
    jest.spyOn(console, 'log').mockClear();
  });

  it('should log info message', () => {
    logInfo('Test info');
    expect(console.log).toHaveBeenCalledWith(
      'Info:',
      expect.objectContaining({
        message: 'Test info',
        type: 'info',
      }),
    );
  });

  it('should include context', () => {
    logInfo('Test info', { action: 'login' });
    const logArgs = (console.log as jest.Mock).mock.calls[0][0];
    expect(logArgs.action).toBe('login');
  });
});

describe('handleAndLogError', () => {
  beforeEach(() => {
    jest.spyOn(console, 'error').mockClear();
  });

  it('should handle error and return error response', () => {
    const error = new Error('Test error');
    const errorResponse = handleAndLogError(error, { action: 'test' });
    expect(errorResponse).toHaveProperty('success', false);
    expect(errorResponse).toHaveProperty('error');
    expect(errorResponse).toHaveProperty('meta');
  });

  it('should log error with context', () => {
    const error = new Error('Test error');
    handleAndLogError(error, { action: 'test' });
    expect(console.error).toHaveBeenCalled();
  });

  it('should include stack in error response', () => {
    const error = new Error('Test error');
    const errorResponse = handleAndLogError(error);
    expect(errorResponse.error.stack).toBeDefined();
  });

  it('should include requestId in meta', () => {
    const error = new Error('Test error');
    const errorResponse = handleAndLogError(error, { requestId: 'req-123' });
    expect(errorResponse.meta.requestId).toBe('req-123');
  });
});

describe('logValidationError', () => {
  beforeEach(() => {
    jest.spyOn(console, 'error').mockClear();
  });

  it('should log validation errors', () => {
    const errors = {
      email: ['Email is required', 'Invalid email format'],
      password: ['Password is required'],
    };
    const errorResponse = logValidationError(errors);
    expect(errorResponse.error.code).toBe('VALIDATION_ERROR');
    expect(errorResponse.error.details).toEqual(errors);
  });

  it('should include error response in logs', () => {
    const errors = { email: ['Invalid'] };
    logValidationError(errors);
    expect(console.error).toHaveBeenCalled();
  });
});

describe('logQueryPerformance', () => {
  beforeEach(() => {
    jest.spyOn(console, 'warn').mockClear();
  });

  it('should log query performance', () => {
    logQueryPerformance(500, 'SELECT * FROM users');
    expect(console.warn).toHaveBeenCalled();
  });

  it('should truncate long queries', () => {
    const longQuery = 'SELECT * FROM users WHERE ' + 'x'.repeat(1000);
    logQueryPerformance(100, longQuery);
    const logArgs = (console.warn as jest.Mock).mock.calls[0][0];
    expect(logArgs.query.length).toBeLessThanOrEqual(103);
  });

  it('should use warn severity for slow queries', () => {
    logQueryPerformance(2000, 'SELECT * FROM users');
    expect(console.warn).toHaveBeenCalled();
  });

  it('should use info severity for fast queries', () => {
    logQueryPerformance(100, 'SELECT * FROM users');
    expect(console.warn).toHaveBeenCalled();
  });

  it('should include context', () => {
    logQueryPerformance(500, 'SELECT * FROM users', { userId: '123' });
    const logArgs = (console.warn as jest.Mock).mock.calls[0][0];
    expect(logArgs.userId).toBe('123');
  });
});

describe('logApiPerformance', () => {
  beforeEach(() => {
    jest.spyOn(console, 'log').mockClear();
  });

  it('should log API performance', () => {
    logApiPerformance(300, 'GET', '/api/users');
    expect(console.log).toHaveBeenCalled();
  });

  it('should use warn severity for slow APIs', () => {
    logApiPerformance(3000, 'GET', '/api/users');
    expect(console.warn).toHaveBeenCalled();
  });

  it('should use info severity for fast APIs', () => {
    logApiPerformance(500, 'GET', '/api/users');
    expect(console.log).toHaveBeenCalled();
  });

  it('should include all performance details', () => {
    logApiPerformance(1000, 'POST', '/api/users', { userId: '123' });
    const logArgs = (console.warn as jest.Mock).mock.calls[0][0];
    expect(logArgs.method).toBe('POST');
    expect(logArgs.path).toBe('/api/users');
    expect(logArgs.duration).toBe('1000ms');
  });
});
