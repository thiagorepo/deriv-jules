import { logCatchError, createErrorResponse } from './errors';

describe('logCatchError', () => {
  it('logs error to console', () => {
    const spy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => undefined);
    const err = new Error('test error');
    logCatchError(err);
    expect(spy).toHaveBeenCalledWith('[Error]', err, undefined);
    spy.mockRestore();
  });

  it('logs error with context', () => {
    const spy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => undefined);
    const err = new Error('test');
    const ctx = { route: '/api/test' };
    logCatchError(err, ctx);
    expect(spy).toHaveBeenCalledWith('[Error]', err, ctx);
    spy.mockRestore();
  });
});

describe('createErrorResponse', () => {
  it('returns a Response with 500 status by default', async () => {
    const response = createErrorResponse('Something went wrong');
    expect(response.status).toBe(500);
    const body = await response.json();
    expect(body.error).toBe('Something went wrong');
  });

  it('returns a Response with custom status code', async () => {
    const response = createErrorResponse('Not found', 404);
    expect(response.status).toBe(404);
  });

  it('includes details in the response body when provided', async () => {
    const response = createErrorResponse('Invalid input', 400, {
      field: 'email',
    });
    const body = await response.json();
    expect(body.details).toEqual({ field: 'email' });
  });

  it('sets Content-Type to application/json', () => {
    const response = createErrorResponse('error');
    expect(response.headers.get('Content-Type')).toBe('application/json');
  });
});
