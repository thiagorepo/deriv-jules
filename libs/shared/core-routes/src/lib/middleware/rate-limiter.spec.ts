import { rateLimiter, _getRateLimits } from './rate-limiter';

describe('rateLimiter', () => {
  const ip1 = '192.168.0.1';
  const ip2 = '10.0.0.1';

  beforeEach(() => {
    jest.useFakeTimers();
    _getRateLimits().clear();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('allows requests within limit', () => {
    expect(rateLimiter(ip1, 2, 1000)).toBe(true); // 1st
    expect(rateLimiter(ip1, 2, 1000)).toBe(true); // 2nd
  });

  it('blocks requests over limit', () => {
    expect(rateLimiter(ip1, 2, 1000)).toBe(true); // 1st
    expect(rateLimiter(ip1, 2, 1000)).toBe(true); // 2nd
    expect(rateLimiter(ip1, 2, 1000)).toBe(false); // 3rd blocked
  });

  it('resets count after window', () => {
    expect(rateLimiter(ip1, 1, 1000)).toBe(true); // 1st
    expect(rateLimiter(ip1, 1, 1000)).toBe(false); // 2nd blocked

    jest.advanceTimersByTime(1001); // Wait for window to expire

    expect(rateLimiter(ip1, 1, 1000)).toBe(true); // 1st allowed again
  });

  it('tracks ips independently', () => {
    expect(rateLimiter(ip1, 1, 1000)).toBe(true);
    expect(rateLimiter(ip1, 1, 1000)).toBe(false); // ip1 blocked

    expect(rateLimiter(ip2, 1, 1000)).toBe(true); // ip2 allowed
  });
});
