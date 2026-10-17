type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();

/**
 * Fixed-window limiter kept in memory. It is per server instance, so on serverless hosting it slows abuse down
 * but does not guarantee a hard limit. Returns false once `limit` calls have been made inside `windowMs`.
 */
export function allow(key: string, limit: number, windowMs: number, now = Date.now()): boolean {
  if (buckets.size > 5000) for (const [k, b] of buckets) if (b.resetAt <= now) buckets.delete(k);
  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (bucket.count >= limit) return false;
  bucket.count += 1;
  return true;
}

export const resetRateLimits = () => buckets.clear();
