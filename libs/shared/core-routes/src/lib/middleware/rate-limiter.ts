interface RateLimitInfo {
  count: number;
  lastReset: number;
}

const rateLimits = new Map<string, RateLimitInfo>();

export function _getRateLimits() {
    return rateLimits;
}

export function rateLimiter(
  ip: string,
  limit: number = 100, // requests per window
  windowMs: number = 60000 // 1 minute window
): boolean {
  const now = Date.now();
  const info = rateLimits.get(ip) || { count: 0, lastReset: now };

  if (now - info.lastReset > windowMs) {
    info.count = 1;
    info.lastReset = now;
  } else {
    info.count += 1;
  }

  rateLimits.set(ip, info);

  return info.count <= limit;
}

export const authLimiter = (ip: string) => rateLimiter(ip, 5, 60000); // 5 per minute
export const tradingLimiter = (ip: string) => rateLimiter(ip, 20, 60000); // 20 per minute
export const defaultLimiter = (ip: string) => rateLimiter(ip, 100, 60000); // 100 per minute
