const WINDOWS = new Map<string, { count: number; reset: number }>();

export interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

export function checkRateLimit(
  ip: string,
  limit: number,
  windowMs = 60 * 60 * 1000
): RateLimitResult {
  const now = Date.now();
  const key = `${ip}:${limit}`;
  const entry = WINDOWS.get(key);

  if (!entry || now > entry.reset) {
    const reset = now + windowMs;
    WINDOWS.set(key, { count: 1, reset });
    return { allowed: true, limit, remaining: limit - 1, reset };
  }

  if (entry.count >= limit) {
    return { allowed: false, limit, remaining: 0, reset: entry.reset };
  }

  entry.count++;
  return {
    allowed: true,
    limit,
    remaining: limit - entry.count,
    reset: entry.reset,
  };
}

export function rateLimitHeaders(rl: RateLimitResult): Record<string, string> {
  return {
    "X-RateLimit-Limit": String(rl.limit),
    "X-RateLimit-Remaining": String(rl.remaining),
    "X-RateLimit-Reset": String(Math.ceil(rl.reset / 1000)),
  };
}
