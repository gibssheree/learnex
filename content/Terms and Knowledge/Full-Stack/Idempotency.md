---
tags: [term, fullstack, api]
category: API & Networking
---

# Idempotency

**Definition:** A property where making the same request multiple times has the same effect as making it once.

## How It Works
- `GET`, `PUT`, `DELETE`, `HEAD`, and `OPTIONS` are supposed to be idempotent by convention — per [[HTTP Methods]], calling them N times should leave the server in the same state as calling them once
- `POST` usually isn't — calling it twice can create two records, since each call is treated as "create a new thing"
- `PATCH` is a gray area: technically not guaranteed idempotent by spec, and in practice it depends on the operation — `PATCH` that sets `status: "shipped"` is idempotent, but `PATCH` that says `increment quantity by 1` is not, even though both use the same HTTP verb
- Idempotency is about the **end state**, not the response — `DELETE`ing an already-deleted resource can legitimately return `404` the second time while still being idempotent, because the resource is gone either way
- It's a contract about effect, not about performance or caching — an idempotent endpoint can still be slow or expensive to call repeatedly, it just won't corrupt data
- `PUT` is idempotent because it means "set this resource to exactly this representation" — calling it 5 times with the same body leaves the resource in the same state as calling it once, unlike `POST`'s "create a new thing" semantics
- Idempotency doesn't imply the response body is identical byte-for-byte on every call — a `GET` on a resource that changed between two reads is still "idempotent" in the HTTP sense because the `GET` itself didn't cause that change

## Why It Matters
- Critical for retry logic: if a request times out, you don't know whether the server processed it before the connection dropped — idempotency is what makes "just retry" a safe default instead of a data-corruption risk
- Distributed systems assume unreliable networks by default — TCP/HTTP can fail after the server already committed a write, so any client, proxy, or [[Message Queue]] consumer that retries on failure needs idempotency guarantees somewhere in the chain
- Message queues typically offer only "at-least-once" delivery (never "exactly-once" in the strict sense), which pushes the idempotency burden onto the consumer — an idempotent message handler is what actually prevents duplicate processing
- Load balancers and API gateways sometimes retry failed requests automatically on the client's behalf — if the underlying operation isn't idempotent, this "helpful" retry can silently double-execute it
- Mobile clients especially depend on this: a flaky cellular connection means requests fail and get retried constantly, often without explicit user action, so any mutating endpoint reachable from a mobile app needs to tolerate silent duplicate calls
- It's foundational to how [[Load Balancer|load balancers]] and reverse proxies decide whether to automatically retry a failed request against a different backend instance — they generally only do this for methods considered safe or idempotent by convention

## Common Pitfalls
- Assuming a payment or order-creation `POST` is safe to retry — without an idempotency key it can double-charge a customer or create duplicate orders
- Conflating "idempotent" with "safe" — safe methods (`GET`, `HEAD`, `OPTIONS`) have no side effects at all; idempotent methods (`PUT`, `DELETE`) can still modify server state, they just don't modify it *further* on repeat calls
- Implementing idempotency keys but forgetting to scope them (per-user, per-endpoint) — a global key namespace lets one user's key collide with another's
- Storing idempotency results without an expiration, causing unbounded growth in the idempotency-key store, or expiring them too soon so a legitimate slow retry falls outside the window and re-executes
- Not handling concurrent requests with the same idempotency key — if two identical requests race before the first one finishes and writes its result, both can slip through and double-execute
- Assuming `PATCH` is always idempotent just because it's not `POST` — check the actual semantics of the update, not the verb

## Under the Hood
Idempotency keys are the standard mechanism for making inherently non-idempotent operations (like `POST`) safely retryable:
1. Client generates a unique key (typically a UUID v4) **once**, before the first attempt
2. Client sends it on every attempt/retry of that same logical operation, usually as a header: `Idempotency-Key: 7c3f...`
3. Server checks a fast lookup store (Redis, or a dedicated DB table) for that key
4. If the key is new: server acquires a lock on it, processes the request, stores the response (status code + body) keyed by that ID with a TTL, then releases the lock
5. If the key already exists and processing is complete: server returns the **stored response** immediately without re-executing the operation
6. If the key exists but is still mid-processing (a concurrent duplicate arrived while the first request is still running): server either blocks briefly or returns a `409 Conflict`/`425 Too Early` rather than letting both through

A subtlety worth internalizing: the idempotency key must be paired with a check that the **request body matches** what was stored under that key. Without this, a client bug that reuses a key across two genuinely different requests would silently return the wrong cached response for the second one — most production implementations hash the request body and compare it against the stored hash before replaying a cached result, returning an error (often `422`) on mismatch instead of a stale response.

## Code Example
```js
// Express.js — idempotency key middleware backed by Redis
async function idempotencyMiddleware(req, res, next) {
  const key = req.header('Idempotency-Key');
  if (!key) return next(); // not all endpoints require one

  const lockKey = `idem:${req.path}:${key}`;
  const cached = await redis.get(lockKey);

  if (cached === 'processing') {
    return res.status(409).json({ error: 'request already in progress' });
  }
  if (cached) {
    const { status, body } = JSON.parse(cached);
    return res.status(status).json(body); // replay stored result, no re-execution
  }

  await redis.set(lockKey, 'processing', 'EX', 60);
  res.locals.idempotencyKey = lockKey;
  next();
}

app.post('/api/payments', idempotencyMiddleware, async (req, res) => {
  const result = await chargeCard(req.body);
  await redis.set(res.locals.idempotencyKey, JSON.stringify({ status: 201, body: result }), 'EX', 86400);
  res.status(201).json(result);
});
```

```sql
-- PostgreSQL — idempotent write at the storage layer via UPSERT
INSERT INTO orders (idempotency_key, user_id, sku, qty, status)
VALUES ('7c3f-uuid', 42, 'abc-123', 1, 'pending')
ON CONFLICT (idempotency_key)
DO UPDATE SET status = orders.status  -- no-op update, just returns the existing row
RETURNING *;
```

```
# Client perspective — same request, retried after a timeout
POST /api/payments
Idempotency-Key: 7c3f6b2a-...

First attempt:  201 Created  { "id": "ch_1", "amount": 2000 }
(network times out before client sees the response)

Retry with same key: 201 Created { "id": "ch_1", "amount": 2000 }  <- same charge, not a new one
```

```js
// Client-side — generate the key once, reuse it across retries
import { v4 as uuidv4 } from 'uuid';

async function chargeWithRetry(payload, maxRetries = 3) {
  const idempotencyKey = uuidv4(); // generated ONCE, outside the retry loop
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Idempotency-Key': idempotencyKey, 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    } catch (err) {
      if (attempt === maxRetries - 1) throw err;
      await sleep(2 ** attempt * 100); // exponential backoff
    }
  }
}
```

## Comparison

| Method | Safe (no side effects) | Idempotent (repeat = same effect) |
|---|---|---|
| `GET` | Yes | Yes |
| `HEAD` | Yes | Yes |
| `OPTIONS` | Yes | Yes |
| `PUT` | No | Yes |
| `DELETE` | No | Yes |
| `PATCH` | No | Depends on the operation |
| `POST` | No | No (unless you add an idempotency key) |

## Real-World Example
- **Stripe** requires an `Idempotency-Key` header on payment-creation requests — retry the same request within 24 hours and Stripe returns the original result instead of charging again
- **AWS** APIs like `RunInstances` (EC2) accept a `ClientToken` parameter for the same reason — a retried "launch instance" call with the same token won't launch a second instance
- **Kafka** consumers implementing "exactly-once" semantics do so by pairing at-least-once delivery with idempotent writes — e.g. an upsert keyed by message offset instead of a blind insert
- **PayPal**, **Square**, and most payment processors converged on the same idempotency-key pattern independently — it's a de facto standard for any API that moves money
- **GitHub's API** documents specific endpoints (like creating a deployment) as safe to retry with the same input, effectively promising idempotent behavior without a dedicated key header — a lighter-weight version of the same guarantee
- **Database migrations** apply the same principle at a different layer: a well-written migration checks `IF NOT EXISTS` before creating a table/column so re-running it (intentionally or by CI re-triggering) doesn't fail or duplicate schema changes — see [[Database Migration]]

## History
- The term traces back to mathematics (an idempotent function, applied twice, gives the same result as applied once — e.g. `abs(abs(x)) == abs(x)`) and was adopted into distributed systems and HTTP terminology as APIs matured beyond simple CRUD
- RFC 2616 (HTTP/1.1, 1999) was the first to formally define which HTTP methods "SHOULD" be idempotent, later tightened in RFC 7231 (2014) and RFC 9110 (2022)
- Idempotency keys as an explicit API pattern (rather than relying on the HTTP method alone) became mainstream through Stripe's API design around 2012–2013, which the rest of the payments industry broadly copied

## Best Practices
- Generate the idempotency key client-side, once, before the first network attempt — never generate a new one on each retry, or you defeat the entire mechanism
- Scope keys per endpoint (and often per user/account) so collisions across unrelated operations are impossible
- Set a sensible TTL on stored results — long enough to cover realistic retry windows (hours, not seconds), short enough to bound storage growth
- Return the exact same status code and body on a replayed request that you returned the first time, so clients can't tell the difference between "first call" and "replay"
- Make queue/event consumers idempotent by design (e.g. upsert by a stable ID) rather than relying on the broker to guarantee exactly-once delivery, since most brokers don't
- Hash and store the request body alongside the idempotency key so a key reused with a different payload is rejected instead of silently returning a mismatched cached response
- Design database writes to be idempotent at the storage layer too where possible (`INSERT ... ON CONFLICT DO NOTHING`/`UPSERT` instead of a bare `INSERT`) as defense in depth beneath the API-level idempotency key

## FAQ
**Is idempotent the same as "no side effects"?** No — that's "safe." `DELETE` has a side effect (removing a resource) but is still idempotent because repeating it doesn't change the outcome further.

**Can `POST` ever be idempotent?** Yes, with an explicit idempotency key — the HTTP spec doesn't forbid it, it just doesn't guarantee it by default the way it does for `PUT`.

**If `DELETE` returns `404` on the second call and `204` on the first, is that still idempotent?** Yes — the resource's *end state* (gone) is identical after either call; only the response differs, and idempotency is defined in terms of server state, not response codes.

**Does idempotency prevent all duplicate side effects?** Only for the operation it's applied to — it doesn't help if the non-idempotent side effect happens in an unrelated system (e.g. a webhook fired as a side effect that isn't itself deduplicated). See [[Webhook]].

**Is a `GET` request ever unsafe to retry?** In a well-designed API, no — but poorly designed APIs sometimes put side effects behind `GET` (like a tracking pixel or a link that deletes something), which violates both safety and the spirit of idempotency, and breaks assumptions that browsers, crawlers, and caches all make.

**How does idempotency interact with database transactions?** They solve related but different problems — a transaction ([[ACID Transactions]]) guarantees a single request's operations are atomic, while idempotency guarantees that *repeating* the whole request doesn't compound the effect. You typically need both for a bulletproof payment or order-creation flow.

## Common Interview Questions

| Question | Short answer |
|---|---|
| Is `GET` idempotent? | Yes, and also safe (no side effects at all) |
| Is `POST` idempotent by default? | No — repeated calls typically create duplicate resources unless an idempotency key is used |
| Is `PATCH` idempotent? | Not guaranteed by spec; depends on whether the operation is a "set" (idempotent) or a relative change like "increment" (not idempotent) |
| How would you make a payment endpoint safe to retry? | Require an idempotency key header, store request+response by key with a TTL, replay the stored response on duplicate keys |
| What's the difference between "safe" and "idempotent"? | Safe methods have zero side effects; idempotent methods can have side effects, they just don't compound on repeat |
| Why do message queue consumers need to be idempotent? | Most brokers guarantee at-least-once delivery, not exactly-once, so duplicate message processing is a normal occurrence, not an edge case |
| Where should the idempotency key be generated? | Client-side, once, before the first request attempt — and reused unchanged on every retry |
| What HTTP status should a duplicate idempotency-key request in-flight return? | Typically `409 Conflict` or `425 Too Early`, rather than processing the request a second time |

## Related Terms
- [[HTTP Methods]]
- [[Webhook]]
- [[HTTP Status Codes]]
- [[Message Queue]]
- [[ACID Transactions]]
- [[Database Migration]]

## Example
Stripe requires an "idempotency key" on payment requests so a retried request doesn't charge the customer twice. If your checkout form's network call times out after Stripe already processed the charge, resending the exact same request (with the same key) safely returns the original charge result instead of billing again.
