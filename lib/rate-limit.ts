/**
 * Minimal in-memory rate limiter (fixed window, per key).
 *
 * Good for local development and a single long-running server.
 * On serverless hosts (e.g. Vercel) each instance has its own memory, so
 * limits are only approximate there. Use a shared store such as Upstash
 * Redis (@upstash/ratelimit) for strict limits in production.
 */

interface Entry {
  count: number;
  resetAt: number;
}

const store = new Map<string, Entry>();

export function rateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now();

  // Drop expired entries so the map can't grow forever.
  if (store.size > 1000) {
    for (const [storedKey, entry] of store) {
      if (entry.resetAt <= now) store.delete(storedKey);
    }
  }

  const entry = store.get(key);

  if (!entry || entry.resetAt <= now) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, remaining: limit - 1, retryAfterSeconds: 0 };
  }

  if (entry.count >= limit) {
    return {
      ok: false,
      remaining: 0,
      retryAfterSeconds: Math.ceil((entry.resetAt - now) / 1000),
    };
  }

  entry.count += 1;

  return {
    ok: true,
    remaining: limit - entry.count,
    retryAfterSeconds: 0,
  };
}
