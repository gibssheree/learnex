---
tags: [term, fullstack, performance]
category: Database & Data
---

# Caching

**Definition:** Storing a copy of expensive-to-compute or frequently-requested data somewhere faster to access, so you don't redo the work every time.

## How It Works
- Layers exist at many levels: browser cache, CDN, in-memory store (Redis), database query cache
- A cache sits between the consumer and the source of truth; on a request, it's checked first, a "hit" returns the stored value immediately, a "miss" falls through to the real, slower source, and (usually) stores the result for next time
- Every cache needs an eviction policy for when it fills up, common strategies include LRU (Least Recently Used), LFU (Least Frequently Used), and simple TTL (time-to-live) expiration
- Caches trade staleness for speed, the fundamental question in every caching design is "how wrong can this data be, and for how long, before it matters"
- A cache can live at any layer of the stack simultaneously, a single request might pass through a browser cache, then a CDN edge cache, then an application-level in-memory cache, then a database query cache, before finally hitting disk

## Why It Matters
- One of the most effective ways to make an app feel fast and reduce database load
- Often the single highest-leverage performance optimization available, cheaper and faster to implement than rewriting slow queries or scaling hardware
- Reduces cost directly: fewer database reads, fewer expensive API calls to third parties, fewer compute cycles spent recomputing the same result
- Improves resilience under load, a cache absorbs traffic spikes that would otherwise hit (and potentially take down) the underlying data source
- Often the difference between a feature being technically feasible or not, some expensive computations (large aggregations, ML inference) are only practical to serve at scale because the result is cached rather than recomputed per request

## Common Pitfalls
- Cache invalidation: serving stale data after the underlying data changes is a famously hard problem, one of the two famously hard problems in computer science, alongside naming things and off-by-one errors
- Cache stampede (a.k.a. thundering herd): a popular cache entry expires, and hundreds of concurrent requests all miss simultaneously and hammer the origin at once to recompute it, sometimes taking the origin down
- Caching at the wrong granularity, caching an entire page when only one small widget on it changes frequently, forcing unnecessary full-page invalidation
- Unbounded cache growth with no eviction policy, eventually exhausting memory (an in-memory cache with no `maxmemory` policy in Redis will happily grow until the process is OOM-killed)
- Caching error responses or empty results without a shorter TTL, a transient failure gets "cached" and served to every user until it expires
- Forgetting that a cache is now a piece of distributed state you have to keep consistent, code that reads from the cache but writes only to the database (or vice versa) silently drifts out of sync
- Using the cache as the system of record by accident, if the cache is ever flushed (a Redis restart, an eviction storm) and there's no way to reconstruct that data from a real source of truth, it was never actually a cache
- Ignoring negative caching entirely, not caching "this record doesn't exist" responses means a request hammering a nonexistent ID hits the database on every single call with no relief

## Caching Strategies

**Cache-aside (lazy loading)**: the application checks the cache first; on a miss, it reads from the database, then writes the result into the cache for next time. Most common pattern, simple to reason about, but the first request after any expiration always pays the full latency cost, and a bug in application code can leave the cache and database inconsistent.

**Read-through**: similar to cache-aside, but the cache itself (not the application) is responsible for loading from the source on a miss, application code always just talks to the cache. Cleaner abstraction, but requires a cache provider that supports it natively.

**Write-through**: writes go to the cache and the underlying store synchronously, together, as part of the same operation. Keeps the cache always consistent with the source of truth, at the cost of extra write latency on every write.

**Write-behind (write-back)**: writes go to the cache immediately and are flushed to the underlying store asynchronously in the background. Fast writes, but risks data loss if the cache crashes before the flush completes, and adds real complexity.

**Write-around**: writes go directly to the database, bypassing the cache entirely, the cache only gets populated on a subsequent read (cache-aside style). Good for data that's written often but read rarely, avoids polluting the cache with values that may never be read again.

## Comparison Table

| Strategy | Read Path | Write Path | Consistency | Best For |
|---|---|---|---|---|
| Cache-aside | App checks cache, falls back to DB | App writes to DB, invalidates/updates cache | Eventually consistent | General purpose, most common default |
| Write-through | Reads always hit cache | Write to cache and DB together | Strongly consistent | Data where staleness is unacceptable |
| Write-behind | Reads always hit cache | Write to cache, async flush to DB | Eventually consistent, write-loss risk | High write throughput, tolerant of some loss |
| Write-around | App checks cache, falls back to DB | Write to DB only | Eventually consistent | Write-heavy, rarely-re-read data |

## Under the Hood: Eviction Policies

When a cache reaches its memory limit, something has to go. The policy chosen materially affects hit rate:

- **LRU (Least Recently Used)**: evicts whatever hasn't been accessed in the longest time. Good general-purpose default, assumes recently accessed data is likely to be accessed again soon (temporal locality)
- **LFU (Least Frequently Used)**: evicts whatever has been accessed the fewest times overall. Better for workloads with a stable "hot set" that shouldn't get evicted just because of a temporary burst of unrelated traffic
- **FIFO**: evicts the oldest inserted entry regardless of access pattern, simple but usually suboptimal for real access patterns
- **TTL-based expiration**: entries expire after a fixed time regardless of access, orthogonal to (and often combined with) the above, bounds staleness even if memory pressure never forces an eviction

Redis, for example, supports `noeviction`, `allkeys-lru`, `volatile-lru`, `allkeys-lfu`, and several other policies configurable via `maxmemory-policy`, letting you choose the tradeoff explicitly rather than accepting a one-size-fits-all default.
The `volatile-*` variants only evict keys that have an explicit TTL set, keys without one are treated as permanent and left alone even under memory pressure, useful for protecting critical cached data from opportunistic eviction.

## Code Example

```js
// Cache-aside pattern with Redis
async function getProduct(id) {
  const cacheKey = `product:${id}`;
  const cached = await redis.get(cacheKey);
  if (cached) return JSON.parse(cached);

  const product = await db.query('SELECT * FROM products WHERE id = $1', [id]);
  await redis.set(cacheKey, JSON.stringify(product), 'EX', 60); // 60s TTL
  return product;
}

// Invalidate explicitly on write, don't wait for TTL expiration
async function updateProduct(id, data) {
  await db.query('UPDATE products SET ... WHERE id = $1', [id]);
  await redis.del(`product:${id}`); // next read repopulates with fresh data
}
```

```js
// Mitigating cache stampede with a short random jitter on TTL
const jitter = Math.floor(Math.random() * 10); // 0-9 extra seconds
await redis.set(cacheKey, value, 'EX', 60 + jitter);
// Staggers expiration across many keys set around the same time,
// preventing them from all expiring in the same instant
```

## Cache Invalidation Approaches

- **TTL expiration**: simplest, set a time limit and let it expire naturally. No explicit invalidation logic needed, but data can be stale for up to the full TTL window
- **Explicit invalidation on write**: the application deletes or updates the relevant cache key(s) whenever the underlying data changes. More precise, but requires tracking every code path that mutates data, easy to miss one
- **Event-driven invalidation**: a message queue or database change stream (e.g., Postgres logical replication, a [[Message Queue]] consumer) triggers cache invalidation automatically whenever the source data changes, decoupling the writer from needing to know about the cache at all
- **Versioned/keyed cache busting**: instead of invalidating, change the cache key itself (`product:42:v3`) whenever the underlying data changes, old entries simply age out via TTL or eviction without ever being read again

## Real-World Example
An e-commerce homepage renders a "trending products" widget computed from the last 24 hours of order data, a query that scans millions of rows and takes 800ms. Computed fresh on every page load, this alone would cap the site's homepage throughput far below what the rest of the page could otherwise handle. Instead, a background job recomputes the trending list every 5 minutes and stores the result in Redis; the homepage handler just does a sub-millisecond `GET` against that cached list. The tradeoff, explicitly accepted, is that "trending" can be up to 5 minutes out of date, which is completely fine for this use case but would be unacceptable for, say, a live stock ticker.

## Best Practices
- Set a TTL on everything, even data you don't expect to change, an unbounded cache entry that never expires is a landmine if the invalidation path ever has a bug
- Add jitter to TTLs for high-traffic keys to avoid synchronized mass expiration (cache stampede)
- Use a "cache miss lock" or request coalescing (only one request recomputes a value on miss, others wait for it) for very hot, expensive-to-compute keys
- Cache at the right layer, don't cache database rows in application memory if a CDN could cache the whole rendered response instead, prefer caching as close to the consumer as correctness allows
- Monitor hit ratio as a first-class metric, a caching layer with a 20% hit rate is barely paying for its own complexity
- Never cache without a plan for invalidation, decide upfront whether a given piece of data can tolerate TTL-based staleness or needs explicit invalidation
- Cache negative results (not-found, empty lists) too, with a shorter TTL than positive results, to protect the origin from repeated lookups for data that doesn't exist
- Treat the cache as disposable: your system should keep working, just slower, if the entire cache is flushed, never let it become the only copy of data that matters

## Related Terms
- [[CDN]]
- [[Database Indexing]]
- [[Message Queue]]
- [[Load Balancer]]
- [[Idempotency]]
- [[Connection Pooling]]
- [[N+1 Query Problem]]

## Example
Caching a product page's data in Redis for 60 seconds instead of hitting the database on every visitor. During a flash sale, the product page might get 10,000 requests in that 60-second window; with caching, only the first request (or one per cache-warming background job) actually queries the database, the other 9,999 are served from memory in under a millisecond, keeping the database's load flat regardless of traffic spikes.

## FAQ

**What's the difference between caching and memoization?**
Memoization is caching applied specifically to pure function calls, same input always yields the same cached output, typically scoped to a single process's memory and the lifetime of that process. Caching is the broader concept and often spans processes, machines, and persists across restarts (Redis, a CDN).

**Why not just cache everything forever?**
Because data changes, and a cache with no expiration or invalidation strategy eventually serves data that's simply wrong, a price that hasn't updated, a permission that was since revoked. The "how stale can this be" question has to be answered per piece of data; some things (a user's display name) tolerate staleness fine, others (an account balance) don't.

**Is a CDN a type of cache?**
Yes, specifically an HTTP response cache distributed geographically. It follows the same fundamental rules, TTLs via `Cache-Control` headers, invalidation via purge APIs, but operates at the HTTP layer rather than the application or database layer. See [[CDN]] for the deep dive.

**How do you cache data that's different per user?**
Either don't, if it's cheap enough to compute per-request, or include the user (or a relevant dimension like their permissions/locale) as part of the cache key, so `product:42:user:99` and `product:42:user:100` are stored as distinct entries rather than one user's cached view leaking into another's.

**What's the difference between an in-memory cache and a distributed cache?**
An in-memory cache (a plain object, an LRU map) lives inside a single application process, fast (no network hop) but not shared across multiple server instances, and lost entirely on restart. A distributed cache (Redis, Memcached) runs as a separate service that every application instance talks to over the network, slightly slower per-access but consistent across your whole fleet and survives individual application restarts.

**Why does my cache have a low hit ratio even though I cache aggressively?**
Common causes: cache keys are too specific (including something like a timestamp or request ID that makes every entry unique), TTLs are too short relative to how often the same data is actually requested, or the working set genuinely doesn't fit in the cache's memory limit and useful entries are getting evicted before they're reused. Measuring hit ratio per cache key pattern, not just in aggregate, usually reveals which of these is the culprit.

## Two Hard Problems

Phil Karlton's famous quip, "there are only two hard things in computer science: cache invalidation and naming things," holds up because caching adds a second, implicit source of truth to your system. The moment you introduce a cache, your application has two copies of the data (the original and the cached one) that can disagree, and every code path that changes the original now has to remember to reconcile the cached copy too. This is why teams that add caching under deadline pressure, "just stick a cache in front of it", often regret it later: the caching layer itself is simple, but the discipline of keeping it correctly invalidated across every future feature and code change is the actual long-term cost.
