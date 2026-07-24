/**
 * Simple in-memory rate limiter for Next.js Server Actions.
 * Limits submissions per IP address to prevent spam and brute-force.
 *
 * For production at scale, replace with Redis (e.g. Upstash).
 */

type RateLimitEntry = { count: number; resetAt: number };

const store = new Map<string, RateLimitEntry>();

/**
 * @param key      - Unique identifier (e.g. IP address)
 * @param limit    - Max allowed requests
 * @param windowMs - Time window in milliseconds
 * @returns { success: boolean } - false when rate limit exceeded
 */
export function rateLimit(
  key: string,
  limit: number = 5,
  windowMs: number = 60_000
): { success: boolean } {
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return { success: true };
  }

  if (entry.count >= limit) {
    return { success: false };
  }

  entry.count++;
  return { success: true };
}
