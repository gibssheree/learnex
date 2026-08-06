/** Best-effort, in-memory-per-instance rate limiter for the public
 * /api/v1/* endpoints (Phase 5 of LEARNEX_EXPANSION_PLAN.md — the "Living
 * API"). Deliberately NOT a distributed/durable limiter: Vercel serverless
 * functions aren't guaranteed to stay warm or to share state across
 * concurrent instances, so this resets on cold start and isn't coordinated
 * globally. That's an accepted v1 tradeoff — it's free, needs no new infra
 * (KV store, Redis, ...), and still meaningfully throttles a single script
 * hammering one endpoint from one warm instance. Upgrade to a real
 * distributed limiter only if abuse actually becomes a problem. */

const WINDOW_MS = 60_000;
const MAX_REQUESTS_PER_WINDOW = 60;
// Opportunistic cap so a warm instance fielding requests from many distinct
// IPs over a long lifetime doesn't grow this map unbounded.
const SWEEP_THRESHOLD = 5000;

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();

function sweep(now: number) {
  if (buckets.size < SWEEP_THRESHOLD) return;
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
}

export interface RateLimitResult {
  limited: boolean;
  retryAfterSeconds: number;
  remaining: number;
}

export function checkRateLimit(clientAddress: string | undefined): RateLimitResult {
  const key = clientAddress || 'unknown';
  const now = Date.now();
  sweep(now);

  let bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    bucket = { count: 0, resetAt: now + WINDOW_MS };
    buckets.set(key, bucket);
  }

  bucket.count++;
  return {
    limited: bucket.count > MAX_REQUESTS_PER_WINDOW,
    retryAfterSeconds: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)),
    remaining: Math.max(0, MAX_REQUESTS_PER_WINDOW - bucket.count),
  };
}
