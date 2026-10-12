// Fixed-window, in-memory rate limiter. Good enough for a single Node
// process; behind several instances each one keeps its own count.

const buckets = new Map();

export const clientIp = (request) =>
  request.headers.get('x-forwarded-for')?.split(',')[0].trim() || request.headers.get('x-real-ip') || 'unknown';

/** Returns true when the caller is over `limit` hits per `windowMs`. */
export function isRateLimited(key, { limit = 5, windowMs = 10 * 60 * 1000 } = {}) {
  const now = Date.now();
  const entry = buckets.get(key);
  if (!entry || now > entry.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    if (buckets.size > 5000) {
      for (const [k, v] of buckets) if (now > v.resetAt) buckets.delete(k);
    }
    return false;
  }
  entry.count += 1;
  return entry.count > limit;
}

/** Forget a key's hits, e.g. after a successful sign-in. */
export function clearRateLimit(key) {
  buckets.delete(key);
}
