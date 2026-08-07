---
tags: [term, fullstack, security, api]
category: DevOps & Delivery
---

# Rate Limiting

**Definition:** Restricting how many requests a client can make to your API in a given time window.

## How It Works
- Track requests per user, IP, or API key — the choice of key materially changes what the limit actually protects against
- Once they exceed the limit, reject further requests, usually with a `429 Too Many Requests` status
- A counter (or more sophisticated structure) tracks request count against a key — commonly stored in Redis for shared state across multiple app servers
- Responses typically include headers telling the client where they stand: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`, and often a `Retry-After` header on the 429 itself
- Limits can apply at multiple layers simultaneously: per-IP at the [[Reverse Proxy]]/CDN edge, per-API-key at the gateway, per-endpoint inside the app (a search endpoint might allow fewer requests/sec than a health check)
- Some systems distinguish "soft" limits (log and warn) from "hard" limits (reject), giving operators visibility before enforcement kicks in

## Why It Matters
- Protects your backend and database from abuse, bugs like infinite retry loops, and brute-force attacks
- Keeps one noisy tenant from starving others in a multi-tenant system (noisy neighbor problem)
- Controls infrastructure cost directly — every unthrottled request is compute, database load, and (for third-party API calls) sometimes literal dollars
- Buys time to detect and block malicious traffic before it takes down the service, functioning as a first line of defense alongside a WAF
- Turns unbounded scaling risk into a predictable, capacity-planned system — you can provision for "max N req/sec" instead of "whatever traffic shows up"
- Doubles as a monetization lever for API businesses — tiered plans (free/pro/enterprise) are frequently differentiated primarily by rate limit, not by feature set

## Algorithms
Different algorithms trade off burst tolerance, memory, and accuracy differently — picking the right one matters more than most people assume.

- **Fixed Window** — count requests in a fixed time bucket (e.g. per-minute), reset the counter at the boundary. Simple, cheap, but allows a burst of 2x the limit right at the window edge (e.g. 100 requests at 0:59 and another 100 at 1:00)
- **Sliding Window Log** — store a timestamp per request, count how many fall within the trailing window. Accurate, but memory grows with request volume
- **Sliding Window Counter** — approximates the sliding log by weighting the previous and current fixed windows proportionally to elapsed time. Good accuracy/memory tradeoff, what most production rate limiters actually use
- **Token Bucket** — a bucket holds tokens, refilled at a fixed rate; each request consumes one token; requests are rejected when the bucket is empty. Naturally allows bursts up to the bucket size while enforcing a long-run average rate — this is what AWS, Stripe, and most cloud API gateways use
- **Leaky Bucket** — requests queue into a bucket that drains (processes) at a constant rate; excess requests overflow and get dropped. Smooths bursts into a constant output rate, common in network traffic shaping

## Comparison of Algorithms

| Algorithm | Allows bursts | Memory cost | Accuracy | Common use |
|---|---|---|---|---|
| Fixed Window | Yes (at boundary) | Low | Low | Simple internal limits |
| Sliding Log | No | High | Perfect | Low-volume, high-precision needs |
| Sliding Window Counter | Slight | Medium | High | Most production APIs |
| Token Bucket | Yes (bounded) | Low | High | Cloud API gateways (AWS, Stripe) |
| Leaky Bucket | No (smooths) | Low | High | Network/traffic shaping |

## Common Pitfalls
- Rate limiting by IP alone, which breaks down for users behind shared corporate NATs or unfairly blocks legitimate bursts of traffic
- Storing counters in local process memory in a horizontally scaled app — each instance enforces its own limit, so the real effective limit is `limit × number of instances`
- Not distinguishing between limit types — a login endpoint needs aggressive limits (brute-force protection) while a read-only GET can tolerate much higher throughput
- Returning a bare `429` with no `Retry-After` header, leaving well-behaved clients to guess when to retry
- Applying the same limit to authenticated and anonymous traffic, when anonymous/unauthenticated requests are usually the higher-risk category
- Forgetting rate limiting resets can be gamed — a fixed-window reset at midnight UTC is a known, exploitable timing edge for attackers
- Rate limiting so aggressively that legitimate retry-with-backoff clients (which is the *correct* client behavior) still get permanently blocked

## Under the Hood: Distributed Rate Limiting
In a single-server app, an in-memory counter works. Once you scale horizontally, the counter has to live somewhere shared:
- **Redis with `INCR` + `EXPIRE`** is the standard building block — atomic increment, TTL-based window reset, sub-millisecond latency
- Race conditions matter at scale: two requests hitting `INCR` simultaneously must still produce a correct count, which is why Redis's atomicity (single-threaded command execution) is relied on rather than a naive read-then-write
- At very high scale (API gateways processing millions of req/sec), even a Redis round-trip per request is too slow — some systems use approximate, locally-cached limits that sync periodically, trading strict accuracy for latency
- Edge/CDN-level rate limiting (Cloudflare, AWS WAF) blocks abusive traffic before it ever reaches your origin servers, which is cheaper and faster than app-level limiting alone

## Where to Enforce It
- **CDN/edge** — blunt, IP-based, catches volumetric abuse and basic bots before they cost you anything
- **[[Reverse Proxy]] / API gateway** (Nginx, Kong, AWS API Gateway) — per-API-key or per-route limits, centralized so individual services don't each reimplement it
- **Application layer** — fine-grained, business-aware limits (e.g. "free tier: 100 requests/day", "premium: 10,000/day") that need account/plan context the edge doesn't have

Most production systems layer all three: coarse IP limits at the edge, API-key limits at the gateway, and plan-based quotas in the app.

## Code Example
Token bucket rate limiting with Redis (conceptual, Node/Express):

```js
async function rateLimit(req, res, next) {
  const key = `ratelimit:${req.user.apiKey}`;
  const limit = 100;       // requests
  const windowSec = 60;    // per minute

  const count = await redis.incr(key);
  if (count === 1) await redis.expire(key, windowSec);

  res.set('X-RateLimit-Limit', limit);
  res.set('X-RateLimit-Remaining', Math.max(0, limit - count));

  if (count > limit) {
    const ttl = await redis.ttl(key);
    res.set('Retry-After', ttl);
    return res.status(429).json({ error: 'rate_limit_exceeded' });
  }
  next();
}
```

## Best Practices
- Key limits by API key or user ID when possible, fall back to IP only for unauthenticated traffic
- Always return `Retry-After` and `X-RateLimit-*` headers so well-behaved clients can self-throttle
- Set different limits per endpoint based on cost and risk — auth endpoints stricter than read-only GETs
- Use token bucket or sliding window counter over naive fixed window for production traffic
- Layer limiting at the edge and the app — don't rely on a single enforcement point
- Log and alert on sustained 429 rates — it's a signal either of abuse or of a limit set too low for legitimate usage

## Related Terms
- [[HTTP Status Codes]] — the `429` response code this whole mechanism revolves around
- [[CORS (Cross-Origin Resource Sharing)]] — a separate but often co-located concern at the API gateway layer
- [[Reverse Proxy]] — the typical enforcement point for coarse, per-IP limits
- [[Load Balancer]] — distributes traffic across instances; rate limiting caps it per client
- [[Caching]] — a well-cached read path reduces how often the rate limiter even needs to engage

## Real-World Example
Stripe's API enforces both a general rate limit (~100 req/sec in live mode) and stricter limits on specific expensive endpoints. Every response carries `Stripe-Should-Retry`, and their client libraries implement automatic exponential backoff when they see a 429 — so most integrators never even notice the limiter unless they're doing something unusual like a bulk backfill, at which point Stripe's docs explicitly recommend batching and spacing out requests rather than firing them all concurrently.

## FAQ
**What's the difference between rate limiting and throttling?**
Often used interchangeably, but "throttling" sometimes implies slowing requests down (queuing, delaying) rather than outright rejecting them once a limit is hit — rate limiting more commonly means hard rejection via `429`.

**Should rate limit headers be visible to unauthenticated users?**
Yes generally — it's not sensitive information and helps well-behaved clients (including your own frontend) back off gracefully instead of hammering a failing endpoint.

**How do I rate limit GraphQL, where every request hits one endpoint?**
Can't rely on route-based limits — instead compute query cost (based on field count/depth/complexity) and rate-limit on cumulative cost per window, not raw request count.

## Rate Limiting vs Related Concepts

| | Rate Limiting | [[Load Balancer|Load Balancing]] | Circuit Breaker |
|---|---|---|---|
| Goal | Cap request volume per client | Distribute load across servers | Stop calling a failing dependency |
| Trigger | Client exceeds a quota | Every request | Downstream error rate/latency spikes |
| Response | `429`, reject or queue | Routes to a healthy instance | Fail fast without calling downstream |
| Scope | Per-client | Whole fleet | Per-dependency |

These are complementary, not competing — a resilient system typically has all three: limits on inbound traffic, balancing across its own instances, and breakers around the services it calls.

## Best Practices (continued)
- Communicate limits in API documentation up front — surprising developers with undocumented limits burns trust and generates support tickets
- Offer a grace mechanism (burst allowance or short-lived overage) rather than a hard cliff, since real traffic is bursty by nature
- Provide a way for legitimate high-volume users to request a higher limit rather than forcing them to work around it with multiple API keys
- Separate limits for read vs write operations — reads are typically cheaper and can tolerate a higher ceiling

## Common Interview Questions
- "How would you rate limit an API with millions of requests per second?" — expect a discussion of token bucket, edge enforcement, and why per-request synchronous Redis calls don't scale, pointing toward local approximation with periodic sync
- "What happens under a fixed window algorithm at the window boundary?" — the classic 2x burst problem; a good answer explains why sliding window counter or token bucket is often preferred in production
- "How do you rate limit a GraphQL API?" — query cost analysis instead of per-request counting, since a single query can be arbitrarily expensive
- "Where would you enforce rate limiting in a system with a CDN, API gateway, and app servers?" — layered: coarse limits at the edge, key-based limits at the gateway, plan-based quotas in the app

## History
- Rate limiting concepts originate in network traffic shaping (leaky bucket algorithm, described in ATM network standards in the 1990s) long before it was applied to web APIs
- Early web APIs (2000s) rarely enforced limits explicitly; abuse was handled reactively by blocking IPs after the fact
- As public APIs (Twitter, Flickr, later Stripe/GitHub) became business-critical infrastructure in the 2010s, proactive, documented rate limits with response headers became standard practice rather than an afterthought
- Modern API gateways (Kong, AWS API Gateway, Cloudflare) now ship rate limiting as a built-in, configurable feature rather than something every team hand-rolls

## Example
Twitter's API returning `429` if you call it too many times within a 15-minute window. GitHub's REST API returns `X-RateLimit-Remaining` on every response so well-written clients can throttle themselves proactively instead of waiting to get rejected.
