import { withCsrf } from './csrf';

describe('withCsrf', () => {
  let mockHandler: jest.Mock;

  beforeEach(() => {
    mockHandler = jest.fn().mockResolvedValue({ status: 200 } as any);
  });

  const createMockRequest = (method: string, headers: any, cookies: any) => {
    return {
      method,
      headers: {
        get: (key: string) => headers[key] || null,
      },
      cookies: {
        get: (key: string) => (cookies[key] ? { value: cookies[key] } : null),
      },
    } as any;
  };

  it('bypasses CSRF checks for GET requests', async () => {
    const request = createMockRequest('GET', {}, {});
    const wrappedHandler = withCsrf(mockHandler);

    await wrappedHandler(request);
    expect(mockHandler).toHaveBeenCalledWith(request);
  });

  it('rejects POST request with missing CSRF header', async () => {
    const request = createMockRequest('POST', {}, { csrf_token: '123' });
    const wrappedHandler = withCsrf(mockHandler);

    const response = await wrappedHandler(request);

    expect(mockHandler).not.toHaveBeenCalled();
    expect(response.status).toBe(403);
  });

  it('rejects POST request with missing CSRF cookie', async () => {
    const request = createMockRequest('POST', { 'x-csrf-token': '123' }, {});
    const wrappedHandler = withCsrf(mockHandler);

    const response = await wrappedHandler(request);

    expect(mockHandler).not.toHaveBeenCalled();
    expect(response.status).toBe(403);
  });

  it('rejects POST request with mismatched CSRF tokens', async () => {
    const request = createMockRequest('POST', { 'x-csrf-token': '123' }, { csrf_token: '456' });
    const wrappedHandler = withCsrf(mockHandler);

    const response = await wrappedHandler(request);

    expect(mockHandler).not.toHaveBeenCalled();
    expect(response.status).toBe(403);
  });

  it('allows POST request with matching CSRF tokens', async () => {
    const request = createMockRequest('POST', { 'x-csrf-token': '123' }, { csrf_token: '123' });
    const wrappedHandler = withCsrf(mockHandler);

    await wrappedHandler(request);

    expect(mockHandler).toHaveBeenCalledWith(request);
  });
});
